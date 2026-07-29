-- ⛔⛔⛔ NON APPLICARE — BOZZA RESPINTA DAL REVISORE (2026-07-29b) ⛔⛔⛔
-- Due bug critici (gravità 5, ledger falsificabile — coniare dal nulla):
--   1. `p_kind` auto-dichiarato dal chiamante: nessun CHECK, nessuna attestazione € reale →
--      un authenticated conia backed da TREASURY con kind='purchase' inventato.
--   2. Il gate anti-conio guarda solo TREASURY: ogni ALTRO conto può andare negativo nei
--      backed (manca l'anti-scoperto) → conio da SETTLEMENT/conto utente. L'assert di
--      solvibilità è una tautologia (somma-zero globale ⇒ reserve==backed sempre) e non lo vede.
-- Piano di correzione in `dossier/T-029-ledger-core.md`. Tabelle OK, il trust model della RPC va rifatto.
-- ══════════════════════════════════════════════════════════════════════════════
--
-- Migrazione T-029 (parte 2/2) · ledger core — la fondazione economica dell'ecosistema.
-- Realizza SAD §3.3/§4 e le decisioni E-D-16 (escrow/circuito chiuso) ed E-D-27
-- (solvibilità PER COSTRUZIONE). Il motore puro gemello è packages/core-ledger (parte 1,
-- 8/8 verdi): qui l'AUTORITÀ che accetta/rifiuta vive nel DB (L-001).
--
-- Principi incisi:
--   • partita doppia: ogni journal ha postings la cui somma PER CLASSE è zero (AC-EE3.1)
--   • saldo DERIVATO, mai materializzato (regola 9): nessuna colonna saldo
--   • unico writer: le tabelle non concedono INSERT diretto; scrive solo ledger_post definer
--   • solvibilità strutturale (E-D-27): TREASURY conia backed SOLO contro € attestati, e la
--     somma-zero rende riserva = backed per costruzione; ESCROW held rientra da sé
--   • L-001: la superficie anon si IMPONE nel DB (revoke), non si dichiara
--
-- Nota sequenza (§4): journal.transaction_id è nullable e SENZA FK — la tabella
-- transactions è T-031, non esiste ancora; la FK si aggiunge additiva lì (stabilisce→consuma).

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
-- ============================================================================
create table if not exists public.ledger_journal (
  id             uuid primary key default gen_random_uuid(),
  kind           text not null,        -- purchase | deposit | reward | escrow_hold | escrow_release | transfer | fidelity_redeem
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
  amount_credits bigint not null,      -- con segno; interi (1 credito = 1 centesimo); mai float
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
-- ledger_post — UNICO writer del ledger. Accetta o rifiuta; impone gli invarianti.
-- p_postings: jsonb array di {account_id uuid, class text, amount bigint, held bool?}
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
  v_treasury   uuid;
  v_bad_class  record;
  v_reserve    bigint;   -- riserva € = −(saldo backed di TREASURY)
  v_backed     bigint;   -- backed circolante = SUM backed su tutti i conti ≠ TREASURY (utenti + ESCROW)
begin
  if p_postings is null or jsonb_typeof(p_postings) <> 'array'
     or jsonb_array_length(p_postings) = 0 then
    raise exception 'ledger_post: postings vuoti o non-array';
  end if;

  select id into v_treasury from public.accounts where system_code = 'SHAER_TREASURY';

  -- righe normalizzate in una tabella temporanea di lavoro
  create temporary table _post on commit drop as
  select (e->>'account_id')::uuid as account_id,
         (e->>'class')      as class,
         (e->>'amount')::bigint as amount,
         coalesce((e->>'held')::boolean, false) as held
  from jsonb_array_elements(p_postings) e;

  -- interi obbligatori: se un amount aveva parte frazionaria, il cast a bigint l'avrebbe
  -- troncata silenziosamente → rifiuta se il testo non è un intero puro
  if exists (select 1 from jsonb_array_elements(p_postings) e
             where (e->>'amount') !~ '^-?[0-9]+$') then
    raise exception 'ledger_post: amount non intero (mai float sul denaro)';
  end if;

  -- classe valida
  if exists (select 1 from _post where class not in ('promo','purchased','earned')) then
    raise exception 'ledger_post: classe non valida';
  end if;

  -- INVARIANTE 1 — somma zero PER CLASSE (AC-EE3.1)
  select class into v_bad_class
  from _post group by class having sum(amount) <> 0 limit 1;
  if found then
    raise exception 'ledger_post: journal sbilanciato nella classe %', v_bad_class.class;
  end if;

  -- INVARIANTE 2 — conio (E-D-27 / AC-EE3.2). TREASURY può andare negativo nei backed
  -- SOLO contro € attestati (kind purchase/deposit). TREASURY non conia mai promo (lo fa ADV).
  if exists (select 1 from _post
             where account_id = v_treasury and class = 'promo' and amount < 0) then
    raise exception 'ledger_post: TREASURY non conia promo (esce da ADV)';
  end if;
  if exists (select 1 from _post
             where account_id = v_treasury and class in ('purchased','earned') and amount < 0)
     and p_kind not in ('purchase','deposit') then
    raise exception 'ledger_post: conio backed senza attestazione € reale (E-D-27)';
  end if;

  -- scrive: journal + postings (atomico — la funzione è una transazione)
  insert into public.ledger_journal (kind, transaction_id)
  values (p_kind, p_transaction_id) returning id into v_journal_id;

  insert into public.ledger_postings (journal_id, account_id, class, amount, held)
  select v_journal_id, account_id, class, amount, held from _post;

  -- INVARIANTE 3 — solvibilità (E-D-27 / AC-EE3.3), asserzione difensiva post-scrittura.
  -- Per costruzione dovrebbe essere UGUAGLIANZA; se non lo è, c'è un bug di modello: si rompe.
  -- backed circolante = backed su tutti i conti tranne TREASURY (include utenti + ESCROW held, Q-SOLV.2=b)
  select coalesce(sum(amount), 0) into v_backed
  from public.ledger_postings
  where class in ('purchased','earned') and account_id <> v_treasury;
  select coalesce(-sum(amount), 0) into v_reserve
  from public.ledger_postings
  where class in ('purchased','earned') and account_id = v_treasury;
  if v_reserve < v_backed then
    raise exception 'ledger_post: insolvenza (riserva % < backed %) — invariante E-D-27', v_reserve, v_backed;
  end if;

  return v_journal_id;
end;
$$;

-- L-001: la funzione nasce con EXECUTE ad anon (default Supabase, vedi 0003). Il ledger è
-- privato: si revoca da tutti, si concede solo ad authenticated (l'utente loggato). NON anon:
-- la whitelist anon resta {resolve_qr, anonymize_ip} — grants.test.ts deve restare verde.
revoke all     on function public.ledger_post(text, uuid, jsonb) from public, anon;
grant  execute on function public.ledger_post(text, uuid, jsonb) to authenticated;

-- Unico-writer: nessun grant DML diretto sulle tabelle (solo il definer scrive). Revoca
-- esplicita da anon per coerenza con L-001; SELECT passa dalla RLS per authenticated.
revoke all on table public.accounts        from anon;
revoke all on table public.ledger_journal  from anon;
revoke all on table public.ledger_postings from anon;
revoke insert, update, delete on table public.accounts        from authenticated;
revoke insert, update, delete on table public.ledger_journal  from authenticated;
revoke insert, update, delete on table public.ledger_postings from authenticated;
