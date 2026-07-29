-- Migrazione T-029 (parte 2/2) · ledger core — la fondazione economica dell'ecosistema.
-- Realizza SAD §3.3/§4 e le decisioni E-D-16 (escrow/circuito chiuso), E-D-27 (solvibilità
-- per costruzione) ed E-D-28 (ricarica→spesa→settlement, anti-scoperto). Il motore puro
-- gemello è packages/core-ledger (parte 1, 8/8 verdi): qui l'AUTORITÀ che accetta/rifiuta
-- vive nel DB (L-001).
--
-- Questa è la RISCRITTURA del layer DB dopo il RESPINGIMENTO del revisore (2026-07-29b):
-- la bozza fidava `p_kind` auto-dichiarato come attestazione € e gattava l'anti-conio solo
-- su TREASURY → coniava backed dal nulla. Correzione (T-029a):
--   • `ledger_post` = SOLO trasferimenti di crediti ESISTENTI (transfer-only).
--   • ANTI-SCOPERTO UNIVERSALE: nessun conto — TREASURY inclusa — resta negativo in nessuna
--     classe dopo il journal. Uccide ogni conio dalla RPC.
--   • `kind` degradato a etichetta con CHECK (nessun potere): il conio backed è una RPC
--     separata callable solo da service_role dietro un fatto € verificato (task futuro, E-D-28).
--
-- Principi incisi:
--   • partita doppia: somma dei postings PER CLASSE = 0 per journal (AC-EE3.1)
--   • saldo DERIVATO, mai materializzato (regola 9): nessuna colonna saldo
--   • unico writer: nessun grant DML diretto; scrive solo ledger_post (definer)
--   • L-001: la superficie privata si IMPONE nel DB (revoke da anon), non si dichiara
--
-- Nota sequenza (§4): journal.transaction_id è nullable e SENZA FK — la tabella
-- transactions è T-031, non esiste ancora; la FK si aggiunge additiva lì (stabilisce→consuma).
-- Assume applicazione su schema PULITO (la bozza non è mai stata applicata).

-- ============================================================================
-- accounts — 6 conti di sistema + (in seguito, T-032) conti utente per ruolo
-- ============================================================================
create table if not exists public.accounts (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('system','user')),
  system_code text check (system_code in
    ('SHAER_TREASURY','SHAER_ESCROW','SHAER_SETTLEMENT','SHAER_REVENUE','SHAER_ADV','SHAER_BURN')),
  user_id     uuid references auth.users(id) on delete restrict,
  role        text check (role in ('buyer','seller','producer','transporter')),
  created_at  timestamptz not null default now(),
  -- un conto di sistema è unico per codice; un conto utente è unico per (utente, ruolo)
  constraint accounts_identity unique nulls not distinct (system_code, user_id, role),
  -- coerenza: system ⇒ ha system_code e non user; user ⇒ ha user_id+role e non system_code
  constraint accounts_shape check (
    (kind = 'system' and system_code is not null and user_id is null and role is null) or
    (kind = 'user'   and system_code is null and user_id is not null and role is not null))
);

insert into public.accounts (kind, system_code)
values ('system','SHAER_TREASURY'), ('system','SHAER_ESCROW'), ('system','SHAER_SETTLEMENT'),
       ('system','SHAER_REVENUE'), ('system','SHAER_ADV'), ('system','SHAER_BURN')
on conflict do nothing;

-- ============================================================================
-- ledger_journal — l'intestazione di un movimento atomico
-- `kind` è un'ETICHETTA (nessun potere): il CHECK chiude il text libero, ma la
-- sicurezza NON dipende da esso — dipende dall'anti-scoperto nella RPC.
-- ============================================================================
create table if not exists public.ledger_journal (
  id             uuid primary key default gen_random_uuid(),
  kind           text not null check (kind in
    ('transfer','reward','escrow_hold','escrow_release','fidelity_redeem','purchase','deposit')),
  transaction_id uuid,                 -- il tronco TXN (T-031): nullable, FK aggiunta lì
  created_at     timestamptz not null default now()
);

-- ============================================================================
-- ledger_postings — le righe; append-only; somma PER CLASSE = 0 per journal
-- ============================================================================
create table if not exists public.ledger_postings (
  id             uuid primary key default gen_random_uuid(),
  journal_id     uuid not null references public.ledger_journal(id) on delete restrict,
  account_id     uuid not null references public.accounts(id) on delete restrict,
  class          text not null check (class in ('promo','purchased','earned')),
  amount         bigint not null,      -- con segno; interi (1 credito = 1 centesimo); mai float
  held           boolean not null default false,  -- escrow: escluso dal disponibile finché true
  created_at     timestamptz not null default now()
);

create index if not exists ledger_postings_journal_idx on public.ledger_postings(journal_id);
create index if not exists ledger_postings_account_idx on public.ledger_postings(account_id);

-- ============================================================================
-- RLS — derivazione owner-scoped; nessun writer diretto (scrive solo il definer)
-- ============================================================================
alter table public.accounts        enable row level security;
alter table public.ledger_journal  enable row level security;
alter table public.ledger_postings enable row level security;

-- conti: l'utente vede i propri; i conti di sistema sono leggibili (i 6 pool non sono segreti)
create policy accounts_select_own_or_system on public.accounts
  for select using (kind = 'system' or user_id = auth.uid());

-- postings: l'utente vede solo le righe che toccano un proprio conto
create policy postings_select_own on public.ledger_postings
  for select using (exists (
    select 1 from public.accounts a
    where a.id = ledger_postings.account_id and a.user_id = auth.uid()));

-- journal: visibile se l'utente vede almeno una sua riga in quel journal
create policy journal_select_own on public.ledger_journal
  for select using (exists (
    select 1 from public.ledger_postings p join public.accounts a on a.id = p.account_id
    where p.journal_id = ledger_journal.id and a.user_id = auth.uid()));

-- Nessuna policy insert/update/delete: le tabelle non si scrivono direttamente.
-- Append-only e unico-writer sono imposti dall'assenza di grant DML (sotto) + dal definer.

-- ============================================================================
-- ledger_post — UNICO writer del ledger. TRANSFER-ONLY: muove crediti esistenti.
-- Accetta o rifiuta; impone somma-zero-per-classe e ANTI-SCOPERTO universale.
-- p_postings: jsonb array di {account_id uuid, class text, amount int, held bool?}
-- ============================================================================
create or replace function public.ledger_post(
  p_kind           text,
  p_transaction_id uuid,
  p_postings       jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_journal_id uuid;
begin
  -- 0 · forma del payload
  if p_postings is null or jsonb_typeof(p_postings) <> 'array'
     or jsonb_array_length(p_postings) = 0 then
    raise exception 'ledger_post: postings vuoti o non-array';
  end if;

  -- 1 · interi puri: il cast a bigint troncherebbe una parte frazionaria in silenzio.
  --     Rifiuta se un amount è NULL o non è un intero (mai float sul denaro).
  if exists (
    select 1 from jsonb_array_elements(p_postings) e
    where coalesce(e->>'amount', '') !~ '^-?[0-9]+$'
  ) then
    raise exception 'ledger_post: amount mancante o non intero (mai float sul denaro)';
  end if;

  -- 2 · classe presente e valida (NULL not in (...) darebbe NULL, non TRUE → guardia esplicita)
  if exists (
    select 1 from jsonb_array_elements(p_postings) e
    where coalesce(e->>'class', '') not in ('promo','purchased','earned')
  ) then
    raise exception 'ledger_post: classe mancante o non valida';
  end if;

  -- 3 · account_id presente
  if exists (
    select 1 from jsonb_array_elements(p_postings) e
    where (e->>'account_id') is null
  ) then
    raise exception 'ledger_post: account_id mancante';
  end if;

  -- INVARIANTE 1 · somma zero PER CLASSE (partita doppia, AC-EE3.1)
  if exists (
    select 1 from jsonb_to_recordset(p_postings) as x(class text, amount bigint)
    group by x.class having sum(x.amount) <> 0
  ) then
    raise exception 'ledger_post: journal sbilanciato (somma per classe ≠ 0)';
  end if;

  -- scrittura atomica: journal + postings (la funzione è una transazione)
  insert into public.ledger_journal (kind, transaction_id)
  values (p_kind, p_transaction_id)
  returning id into v_journal_id;

  insert into public.ledger_postings (journal_id, account_id, class, amount, held)
  select v_journal_id, x.account_id, x.class, x.amount, coalesce(x.held, false)
  from jsonb_to_recordset(p_postings)
       as x(account_id uuid, class text, amount bigint, held boolean);

  -- INVARIANTE 2 · ANTI-SCOPERTO UNIVERSALE (il cuore del fix — E-D-27/28).
  -- ledger_post muove SOLO crediti esistenti: nessun conto — TREASURY inclusa — può
  -- restare negativo in nessuna classe. Questo uccide ogni conio dalla RPC (mint backed =
  -- RPC service_role separata dietro € verificato; mint promo = budget ADV, T-035).
  -- Basta i conti TOCCATI da questo journal: gli altri erano già ≥ 0 prima.
  if exists (
    select 1 from public.ledger_postings p
    where p.account_id in (
      select y.account_id from jsonb_to_recordset(p_postings) as y(account_id uuid)
    )
    group by p.account_id, p.class
    having sum(p.amount) < 0
  ) then
    raise exception 'ledger_post: scoperto — un conto andrebbe negativo (transfer-only: niente conio)';
  end if;

  return v_journal_id;
end;
$$;

-- ⚠️ CONFINE DI FIDUCIA (scope T-029a). `ledger_post` impone gli invarianti CONTABILI
-- (bilancio, anti-scoperto → niente conio), NON l'AUTORIZZAZIONE: chi-può-muovere-quale-conto
-- (es. impedire ESCROW→sé, o il conto di un altro utente) è RBAC = T-030/T-031, che devono
-- atterrare PRIMA che esistano saldi/conti utente reali (T-032). Finché il ledger è vuoto
-- (solo i 6 pool a zero) il vettore di furto non è vivo: ogni movimento da zero va in scoperto
-- ed è rifiutato. Alternativa considerata: non concedere ad authenticated e rendere ledger_post
-- un primitivo interno chiamato solo da RPC definer di T-031 — la lascio al giudizio del revisore.
--
-- L-001: la funzione nasce con EXECUTE ad anon (default Supabase, vedi 0003). Il ledger è
-- privato: si revoca da tutti, si concede solo ad authenticated. NON anon: la whitelist anon
-- resta {resolve_qr, anonymize_ip} — grants.test.ts deve restare verde.
revoke all     on function public.ledger_post(text, uuid, jsonb) from public, anon;
grant  execute on function public.ledger_post(text, uuid, jsonb) to authenticated;

-- Unico-writer: nessun grant DML diretto sulle tabelle (solo il definer scrive). Revoca
-- esplicita da anon (L-001) e da authenticated (che legge solo via RLS). service_role
-- conserva il DML di default: sarà il writer del conio backed (RPC futura, E-D-28) e serve
-- ai test per seminare i saldi.
revoke all on table public.accounts        from anon;
revoke all on table public.ledger_journal  from anon;
revoke all on table public.ledger_postings from anon;
revoke insert, update, delete on table public.accounts        from authenticated;
revoke insert, update, delete on table public.ledger_journal  from authenticated;
revoke insert, update, delete on table public.ledger_postings from authenticated;
