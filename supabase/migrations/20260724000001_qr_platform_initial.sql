-- Migrazione iniziale QR Platform — schema di T-002, versionato in T-003.
-- Fonte: MD/QR_PLATFORM.md §18. DB vergine: si crea da zero.
-- NON confondere con Struttura/Schema/0001_initial_schema.sql (dominio Shaer,
-- modello crediti vecchio — vietato per la QR Platform, vedi memoria/STATO.md).
--
-- Principi incisi qui dentro:
--   • regola d'oro 7  — short_code immutabile (trigger), redirect sempre risolvibile
--   • regola d'oro 9  — ogni tabella con owner_id + RLS: multi-tenant da subito
--   • append-only     — qr_scans non si aggiorna né si cancella; le stat si derivano

-- ============================================================================
-- qr_codes
-- ============================================================================
create table if not exists public.qr_codes (
  id          uuid        primary key default gen_random_uuid(),
  owner_id    uuid        not null references auth.users (id) on delete cascade,
  name        text        not null default '',
  target_url  text        not null,
  short_code  text        not null unique,
  created_at  timestamptz not null default now()
);

create index if not exists qr_codes_owner_id_idx on public.qr_codes (owner_id);

-- short_code immutabile: una volta stampato su carta non si può ristampare.
-- Si cambia la destinazione (target_url), mai l'indirizzo (short_code).
create or replace function public.qr_codes_lock_short_code()
returns trigger
language plpgsql
as $$
begin
  if new.short_code is distinct from old.short_code then
    raise exception 'short_code è immutabile (regola d''oro 7): tentato % -> %',
      old.short_code, new.short_code;
  end if;
  return new;
end;
$$;

create trigger qr_codes_lock_short_code
  before update on public.qr_codes
  for each row execute function public.qr_codes_lock_short_code();

-- ============================================================================
-- qr_scans  (append-only)
-- ============================================================================
create table if not exists public.qr_scans (
  id          uuid        primary key default gen_random_uuid(),
  qr_id       uuid        not null references public.qr_codes (id) on delete cascade,
  owner_id    uuid        not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  device      text,
  browser     text,
  country     text,
  city        text,
  ip          text        -- IP anonimizzato (ultimo ottetto azzerato), mai l'IP pieno
);

create index if not exists qr_scans_qr_id_idx   on public.qr_scans (qr_id);
create index if not exists qr_scans_owner_idx    on public.qr_scans (owner_id);
create index if not exists qr_scans_created_idx  on public.qr_scans (created_at);

-- ============================================================================
-- RLS — multi-tenant
-- ============================================================================
alter table public.qr_codes enable row level security;
alter table public.qr_scans enable row level security;

-- qr_codes: il proprietario gestisce solo i propri QR.
create policy qr_codes_select_own on public.qr_codes
  for select using (auth.uid() = owner_id);
create policy qr_codes_insert_own on public.qr_codes
  for insert with check (auth.uid() = owner_id);
create policy qr_codes_update_own on public.qr_codes
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy qr_codes_delete_own on public.qr_codes
  for delete using (auth.uid() = owner_id);

-- qr_scans: il proprietario legge le proprie scansioni. Nessuna policy di
-- insert/update/delete: append-only, e l'unico a scrivere è resolve_qr (definer).
create policy qr_scans_select_own on public.qr_scans
  for select using (auth.uid() = owner_id);

-- ============================================================================
-- anonymize_ip — la garanzia di privacy vive nel DB, non nell'app
-- ============================================================================
-- L'anon key è pubblica: chiunque può chiamare resolve_qr via PostgREST con un
-- IP pieno, scavalcando l'anonimizzazione di lib/scan.ts. Il confine reale è
-- qui. IPv4 → /24 (ultimo ottetto azzerato), IPv6 → /48 (primi 3 gruppi).
-- Idempotente su un IP già anonimizzato; input non-IP → null (mai spazzatura).
create or replace function public.anonymize_ip(p_ip text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v inet;
begin
  if p_ip is null or btrim(p_ip) = '' then
    return null;
  end if;
  begin
    v := btrim(p_ip)::inet;
  exception when others then
    return null;
  end;
  return host(network(set_masklen(v, case when family(v) = 4 then 24 else 48 end)));
end;
$$;

-- ============================================================================
-- resolve_qr — il cuore del redirect pubblico (anonimo)
-- ============================================================================
-- SECURITY DEFINER: gira come owner della funzione, bypassa la RLS. Così anon
-- risolve e logga SENZA accesso diretto alle tabelle (niente leak di owner_id
-- né dei target_url altrui). Il log è best-effort: se fallisce, si risolve
-- comunque (regola d'oro 7 — un QR pubblicato non si rompe mai).
create or replace function public.resolve_qr(
  p_short_code text,
  p_device     text default null,
  p_browser    text default null,
  p_country    text default null,
  p_city       text default null,
  p_ip         text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_qr public.qr_codes%rowtype;
begin
  select * into v_qr
  from public.qr_codes
  where short_code = p_short_code;

  if not found then
    return null;                 -- short_code inesistente: il chiamante fa 404
  end if;

  begin
    insert into public.qr_scans (qr_id, owner_id, device, browser, country, city, ip)
    values (v_qr.id, v_qr.owner_id, p_device, p_browser, p_country, p_city,
            public.anonymize_ip(p_ip));  -- garanzia lato DB, non lato chiamante
  exception when others then
    null;                        -- loggare non deve mai battere il risolvere
  end;

  return v_qr.target_url;
end;
$$;

-- Il redirect è anonimo: solo EXECUTE, nessun accesso alle tabelle.
revoke all    on function public.resolve_qr(text, text, text, text, text, text) from public;
grant  execute on function public.resolve_qr(text, text, text, text, text, text) to anon, authenticated;

-- anonymize_ip è pura (nessun accesso ai dati): esporla è innocuo e la rende
-- verificabile via RPC.
revoke all    on function public.anonymize_ip(text) from public;
grant  execute on function public.anonymize_ip(text) to anon, authenticated;
