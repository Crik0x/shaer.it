-- Migrazione T-030 · RBAC — identità, ruoli, permessi admin-first, verify-gate, maker-checker multisig.
-- Realizza SAD §3.1/§4/§6 e le decisioni E-D-13/21/24 (admin-first, approvatore mai owner/admin,
-- conflitto di ruolo per-TXN), E-D-29 (ADMIN superuser · sensibili admin-first), E-D-32 (UTENTE base
-- · BUSINESS come attivazione) ed **E-D-33** (ADMIN elevabile dal DB · multi-ADMIN con ruoli/poteri
-- preimpostati · maker-checker a SOGLIA propagabile al business).
-- Il motore puro gemello è packages/core-rbac (10/10 verdi): qui l'AUTORITÀ vive nel DB (L-001).
--
-- Ambito di QUESTA migrazione = piano 2 (platform admin-first + verify-gate) + la macchina maker-checker
-- multisig. I permessi OPERATIVI del gestionale (E-D-29 punto 3) sono T-042; i dati cliente
-- (consenso × abbonamento, E-D-30) sono la fase CRM.
--
-- Principi incisi (come ledger 20260729000001 e profiles 20260727000001):
--   • owner_id/user_id + RLS ovunque: multi-tenant da subito (regola 9)
--   • unico-writer: le tabelle di controllo si scrivono SOLO via RPC definer, mai DML diretto
--   • L-001: la superficie privata si IMPONE nel DB (revoke da anon); whitelist anon invariata
--     {resolve_qr, anonymize_ip} — grants.test.ts deve restare verde
--   • saldo/wallet DERIVATO: nessuna colonna saldo (è vista sul ledger, §3.3)
-- Additiva: nessuna tabella preesistente distrutta (aggiunge solo policy a profiles).

-- ============================================================================
-- admins — allowlist ADMIN (E-D-32/33). L'utente si registra normalmente, poi viene ELEVATO
-- ad ADMIN inserendo una riga qui: si fa da service_role (SQL editor / backend fidato), mai
-- da authenticated. Più ADMIN possibili, con ruoli/poteri DIFFERENZIATI: `role`+`powers` sono
-- preimpostati ora, la loro semantica fine si decide dopo (E-D-33). Oggi is_admin() è un gate
-- booleano (qualsiasi riga = ADMIN). La 2FA è al livello auth (Supabase MFA), fuori da questo SQL.
-- ============================================================================
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'superadmin',  -- ruolo ADMIN differenziato (semantica: E-D-33, dopo)
  powers     text[] not null default '{}',         -- '{}' = pieni (superadmin); sottoinsiemi definiti dopo
  created_at timestamptz not null default now()
);

-- ============================================================================
-- user_roles — fino a 3 ruoli per utente (C35). Tetto ≤3 (AC-EE1.1) imposto dal definer
-- assign_role, NON dallo unique. verified_at NULL = verify-gate: nessuna op business (SAD §3.1).
-- ============================================================================
create table if not exists public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('buyer','seller','producer','transporter')),
  verified_at timestamptz null,
  verified_by uuid null references auth.users(id),
  created_at  timestamptz not null default now(),
  unique (user_id, role)
);
create index if not exists user_roles_user_idx on public.user_roles(user_id);

-- ============================================================================
-- permissions — RBAC admin-first (E-D-13/24): delega assegnata UNO A UNO da un ADMIN.
-- capability ∈ {read,verify} soltanto: MAI 'own'/'admin' (limite dell'approvatore).
-- ============================================================================
create table if not exists public.permissions (
  id          uuid primary key default gen_random_uuid(),
  grantee_id  uuid not null references auth.users(id) on delete cascade,  -- il delegato (approvatore)
  scope       text not null,                                               -- compartimento (E-D-09)
  capability  text not null check (capability in ('read','verify')),       -- MAI 'own'/'admin' (E-D-24)
  granted_by  uuid not null references auth.users(id),                      -- ADMIN (imposto dal definer)
  business_id uuid null references auth.users(id),                          -- il business su cui vale
  created_at  timestamptz not null default now()
);
create index if not exists permissions_grantee_idx on public.permissions(grantee_id);
create index if not exists permissions_business_idx on public.permissions(business_id);

-- ============================================================================
-- pending_actions — maker-checker MULTISIG (R-EE1.5, AC-EE1.6, E-D-33). Un'azione permanente
-- da delegato/ADMIN nasce 'pending' e non ha effetto finché non raccoglie `required_approvals`
-- firme distinte (≠ maker). required_approvals=1 = un solo verificatore conferma; =2 = doppia firma.
-- L'EFFETTO concreto lo applica la feature consumante (T-031+): qui vive solo il GATE di stato.
-- ============================================================================
create table if not exists public.pending_actions (
  id                 uuid primary key default gen_random_uuid(),
  actor_id           uuid not null references auth.users(id),   -- il maker (chi propone)
  business_id        uuid null references auth.users(id),        -- NULL = azione interna ADMIN (multisig platform)
  scope              text not null,
  action_type        text not null,
  payload            jsonb not null default '{}'::jsonb,
  required_approvals int  not null default 1 check (required_approvals >= 1),  -- soglia multisig (E-D-33)
  status             text not null default 'pending' check (status in ('pending','approved','rejected')),
  approved_by        uuid null references auth.users(id),        -- l'ultima firma che ha chiuso la soglia
  applied_at         timestamptz null,
  created_at         timestamptz not null default now()
);
create index if not exists pending_actions_business_idx on public.pending_actions(business_id);

-- pending_approvals — le firme raccolte (append-only, una per approvatore). Il cuore del multisig:
-- conta le firme DISTINTE, così una doppia firma dello stesso verificatore non chiude la soglia.
create table if not exists public.pending_approvals (
  id          uuid primary key default gen_random_uuid(),
  action_id   uuid not null references public.pending_actions(id) on delete cascade,
  approver_id uuid not null references auth.users(id),
  created_at  timestamptz not null default now(),
  unique (action_id, approver_id)
);
create index if not exists pending_approvals_action_idx on public.pending_approvals(action_id);

-- ============================================================================
-- work_relationships / work_sessions — relazione utente↔business (E-D-21). Qui la STRUTTURA
-- + RLS owner-scoped; il write-flow (proposta/accordo, timbratura) è OPERATIVO → T-042.
-- ============================================================================
create table if not exists public.work_relationships (
  id          uuid primary key default gen_random_uuid(),
  employee_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references auth.users(id) on delete cascade,
  agreed_at   timestamptz null,                          -- NULL = proposta; valorizzato = confermata
  created_at  timestamptz not null default now()
);
create index if not exists work_rel_employee_idx on public.work_relationships(employee_id);
create index if not exists work_rel_business_idx on public.work_relationships(business_id);

create table if not exists public.work_sessions (       -- append-only: timbra inizio/fine
  id              uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.work_relationships(id) on delete cascade,
  started_at      timestamptz not null,
  ended_at        timestamptz null,
  special_roles   text[] not null default '{}'
);
create index if not exists work_sessions_rel_idx on public.work_sessions(relationship_id);

-- ============================================================================
-- is_admin() — gate booleano sul CHIAMANTE (auth.uid()). SECURITY DEFINER: bypassa la RLS di
-- `admins` per poterla interrogare. Rivela SOLO lo stato del chiamante (nessun probe su altri):
-- per questo è no-arg. Usata sia nelle RLS (visibilità ADMIN) sia nei definer (gate admin-first).
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;
revoke all     on function public.is_admin() from public, anon;
grant  execute on function public.is_admin() to authenticated;

-- ============================================================================
-- RLS — owner-scoped + finestra ADMIN. L'ADMIN (E-D-33: «gestire tutti i profili iscritti»)
-- vede tutte le righe di controllo e la lista degli altri ADMIN. is_admin() è no-arg → un
-- non-ADMIN non può sondare lo stato altrui.
-- ============================================================================
alter table public.admins             enable row level security;
alter table public.user_roles         enable row level security;
alter table public.permissions        enable row level security;
alter table public.pending_actions    enable row level security;
alter table public.pending_approvals  enable row level security;
alter table public.work_relationships enable row level security;
alter table public.work_sessions      enable row level security;

-- admins: un ADMIN vede la lista ADMIN (monitorare chi è ADMIN); un utente normale no.
create policy admins_select_admin on public.admins
  for select using (public.is_admin());

create policy user_roles_select on public.user_roles
  for select using (user_id = auth.uid() or public.is_admin());

create policy permissions_select on public.permissions
  for select using (grantee_id = auth.uid() or business_id = auth.uid() or public.is_admin());

create policy pending_actions_select on public.pending_actions
  for select using (actor_id = auth.uid() or business_id = auth.uid() or public.is_admin());

create policy pending_approvals_select on public.pending_approvals
  for select using (approver_id = auth.uid() or public.is_admin() or exists (
    select 1 from public.pending_actions pa
    where pa.id = pending_approvals.action_id
      and (pa.actor_id = auth.uid() or pa.business_id = auth.uid())));

create policy work_rel_select on public.work_relationships
  for select using (employee_id = auth.uid() or business_id = auth.uid() or public.is_admin());

create policy work_sessions_select on public.work_sessions
  for select using (public.is_admin() or exists (
    select 1 from public.work_relationships r
    where r.id = work_sessions.relationship_id
      and (r.employee_id = auth.uid() or r.business_id = auth.uid())));

-- profiles (tabella di 20260727000001): policy ADDITIVA per la finestra ADMIN. Le SELECT policy
-- si combinano in OR → l'utente continua a vedere il proprio, l'ADMIN vede tutti (search del pannello).
create policy profiles_select_admin on public.profiles
  for select using (public.is_admin());

-- Nessuna policy insert/update/delete: si scrive SOLO via i definer sotto (unico-writer).

-- ============================================================================
-- grant_default_role — al signup l'utente riceve il ruolo 'buyer' (già verificato: nessun
-- documento). I ruoli business si aggiungono con assign_role. Non concede alcun potere ADMIN.
-- ============================================================================
create or replace function public.grant_default_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role, verified_at)
  values (new.id, 'buyer', now())
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;
revoke all on function public.grant_default_role() from public, anon, authenticated;

create trigger on_auth_user_created_role
  after insert on auth.users
  for each row execute function public.grant_default_role();

-- Backfill: gli utenti già esistenti non sono passati dal trigger.
insert into public.user_roles (user_id, role, verified_at)
select id, 'buyer', now() from auth.users
on conflict (user_id, role) do nothing;

-- ============================================================================
-- assign_role — l'utente attiva un proprio ruolo (E-D-32: BUSINESS = attivazione sul profilo).
-- Business roles nascono NON verificati (verify-gate). Tetto ≤3 (AC-EE1.1) via conteggio.
-- ============================================================================
create or replace function public.assign_role(p_role text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user  uuid := auth.uid();
  v_count int;
  v_id    uuid;
begin
  if v_user is null then
    raise exception 'assign_role: nessuna sessione';
  end if;
  if p_role not in ('buyer','seller','producer','transporter') then
    raise exception 'assign_role: ruolo non valido';
  end if;
  -- Serializza le assegnazioni concorrenti dello STESSO utente: senza lock, due chiamate
  -- potrebbero leggere lo stesso conteggio e superare il tetto ≤3 (rilievo revisore). Advisory
  -- xact lock per-utente (si rilascia a fine transazione) — l'unico da `assign_role`.
  perform pg_advisory_xact_lock(hashtext('assign_role:' || v_user::text));
  select count(*) into v_count from public.user_roles where user_id = v_user;
  if v_count >= 3 and not exists (
       select 1 from public.user_roles where user_id = v_user and role = p_role) then
    raise exception 'assign_role: massimo 3 ruoli per utente (AC-EE1.1)';
  end if;
  insert into public.user_roles (user_id, role, verified_at)
  values (v_user, p_role, case when p_role = 'buyer' then now() else null end)
  on conflict (user_id, role) do nothing
  returning id into v_id;
  return v_id;  -- NULL se il ruolo era già presente
end;
$$;
revoke all     on function public.assign_role(text) from public, anon;
grant  execute on function public.assign_role(text) to authenticated;

-- ============================================================================
-- verify_role — sblocca il verify-gate di un ruolo business. ADMIN-first (E-D-24/29): solo un
-- ADMIN verifica. STUB del gate KYC (E-D-23): la colonna esiste, l'upload documenti è fase dopo.
-- ============================================================================
create or replace function public.verify_role(p_user uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'verify_role: solo ADMIN (verify-gate admin-first, E-D-24/29)';
  end if;
  update public.user_roles
     set verified_at = now(), verified_by = auth.uid()
   where user_id = p_user and role = p_role;
  if not found then
    raise exception 'verify_role: ruolo inesistente';
  end if;
end;
$$;
revoke all     on function public.verify_role(uuid, text) from public, anon;
grant  execute on function public.verify_role(uuid, text) to authenticated;

-- ============================================================================
-- assign_permission — rispecchia core-rbac canAssign = isAdmin && approverLimit(cap).
-- Solo ADMIN assegna (E-D-13); capability ∈ {read,verify} soltanto (E-D-24, mai own/admin).
-- ============================================================================
create or replace function public.assign_permission(
  p_grantee     uuid,
  p_scope       text,
  p_capability  text,
  p_business_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'assign_permission: solo ADMIN (RBAC admin-first, E-D-13/24)';
  end if;
  if p_capability not in ('read','verify') then
    raise exception 'assign_permission: capability fuori limite (mai own/admin, E-D-24)';
  end if;
  insert into public.permissions (grantee_id, scope, capability, granted_by, business_id)
  values (p_grantee, p_scope, p_capability, auth.uid(), p_business_id)
  returning id into v_id;
  return v_id;
end;
$$;
revoke all     on function public.assign_permission(uuid, text, text, uuid) from public, anon;
grant  execute on function public.assign_permission(uuid, text, text, uuid) to authenticated;

-- ============================================================================
-- approve_pending — maker-checker MULTISIG (AC-EE1.6, E-D-33). Registra la firma del chiamante
-- e chiude quando le firme distinte raggiungono required_approvals. Invarianti:
--   • idempotente: già 'approved' → no-op; stessa firma due volte → non conta due volte
--   • maker ≠ checker (E-D-21): il proponente non firma la propria azione
--   • firmatario abilitato: ADMIN (superuser E-D-29, anche per il multisig ADMIN interno) OPPURE
--     delega 'verify' sullo scope/business (propagazione al pannello business, E-D-33)
-- Applica SOLO lo stato; l'effetto concreto è della feature consumante.
-- ============================================================================
create or replace function public.approve_pending(p_action_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_approver uuid := auth.uid();
  v_row      public.pending_actions;
  v_signs    int;
begin
  if v_approver is null then
    raise exception 'approve_pending: nessuna sessione';
  end if;
  select * into v_row from public.pending_actions where id = p_action_id for update;
  if not found then
    raise exception 'approve_pending: azione inesistente';
  end if;
  if v_row.status = 'approved' then
    return 'approved';                      -- idempotenza: seconda chiamata = no-op di successo
  end if;
  if v_row.status <> 'pending' then
    raise exception 'approve_pending: azione in stato % non approvabile', v_row.status;
  end if;
  if v_row.actor_id = v_approver then
    raise exception 'approve_pending: il maker non può approvare la propria azione (E-D-21)';
  end if;
  if not (public.is_admin() or exists (
        select 1 from public.permissions p
        where p.grantee_id = v_approver
          and p.capability = 'verify'
          and p.scope = v_row.scope
          and (p.business_id is not distinct from v_row.business_id))) then
    raise exception 'approve_pending: approvatore non abilitato (serve capability verify sullo scope)';
  end if;
  -- registra la firma (idempotente per-approvatore): una doppia firma non conta due volte
  insert into public.pending_approvals (action_id, approver_id)
  values (p_action_id, v_approver)
  on conflict (action_id, approver_id) do nothing;
  -- soglia raggiunta? (multisig — E-D-33)
  select count(*) into v_signs from public.pending_approvals where action_id = p_action_id;
  if v_signs >= v_row.required_approvals then
    update public.pending_actions
       set status = 'approved', approved_by = v_approver, applied_at = now()
     where id = p_action_id;
    return 'approved';
  end if;
  return 'pending';                          -- firma registrata, ma servono altre firme
end;
$$;
revoke all     on function public.approve_pending(uuid) from public, anon;
grant  execute on function public.approve_pending(uuid) to authenticated;

-- ============================================================================
-- Grants DML: unico-writer. Nessuna scrittura diretta; revoca esplicita da anon (L-001) e da
-- authenticated (che legge solo via RLS). service_role conserva il DML: semina gli admins e i test.
-- La whitelist anon resta {resolve_qr, anonymize_ip}.
-- ============================================================================
-- admins: SELECT resta governata dalla policy admins_select_admin (solo ADMIN la legge). Il grant
-- è valutato PRIMA della RLS: revocare la SELECT ad authenticated ucciderebbe quella policy (E-D-33
-- punto 3: l'ADMIN deve vedere la lista admins). Quindi ad authenticated si toglie solo il DML.
revoke all                     on table public.admins from anon;
revoke insert, update, delete  on table public.admins from authenticated;
revoke all on table public.user_roles         from anon;
revoke all on table public.permissions        from anon;
revoke all on table public.pending_actions    from anon;
revoke all on table public.pending_approvals  from anon;
revoke all on table public.work_relationships from anon;
revoke all on table public.work_sessions      from anon;
revoke insert, update, delete on table public.user_roles         from authenticated;
revoke insert, update, delete on table public.permissions        from authenticated;
revoke insert, update, delete on table public.pending_actions    from authenticated;
revoke insert, update, delete on table public.pending_approvals  from authenticated;
revoke insert, update, delete on table public.work_relationships from authenticated;
revoke insert, update, delete on table public.work_sessions      from authenticated;
