-- Migrazione T-022 · profiles — fondazione per-utente.
-- Nasce per il fuso del cliente (D-013: il dato resta UTC, il display converte),
-- ma è la casa per-utente che anche T-016 (piano free/pro + metering) consumerà.
--
-- Principi incisi qui dentro:
--   • regola d'oro 9 — owner_id + RLS: multi-tenant da subito
--   • L-001         — la superficie anon si IMPONE nel DB, non si dichiara: una
--                     funzione nuova nasce con EXECUTE ad anon (vedi 0003), va revocata

-- ============================================================================
-- profiles  (1:1 con auth.users)
-- ============================================================================
create table if not exists public.profiles (
  owner_id   uuid        primary key references auth.users (id) on delete cascade,
  timezone   text        not null default 'UTC',  -- IANA (es. 'Europe/Rome'); solo presentazione (D-013)
  country    text,
  city       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- RLS — ogni utente vede e scrive solo il proprio profilo
-- ============================================================================
alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select using (auth.uid() = owner_id);
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = owner_id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
-- Niente policy di delete: il profilo muore in cascata con l'utente.

-- ============================================================================
-- Creazione automatica del profilo al signup
-- ============================================================================
-- SECURITY DEFINER: al momento del trigger il nuovo utente non ha ancora una
-- sessione, quindi la RLS di sessione bloccherebbe l'insert. Il definer scrive
-- come owner della funzione. Idempotente: on conflict do nothing.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (owner_id)
  values (new.id)
  on conflict (owner_id) do nothing;
  return new;
end;
$$;

-- L-001: la funzione nasce con EXECUTE concesso ad anon per default (vedi la
-- migrazione 0003). handle_new_user è interna al trigger, non si chiama via RPC:
-- si revoca da tutti. Il trigger la esegue comunque come owner della tabella.
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Backfill — gli utenti già esistenti non sono passati dal trigger
-- ============================================================================
insert into public.profiles (owner_id)
select id from auth.users
on conflict (owner_id) do nothing;
