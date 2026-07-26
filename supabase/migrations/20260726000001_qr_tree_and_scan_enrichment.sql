-- Migrazione M1 §1-2 (Roadmap) — Albero di QR + arricchimento scan.
-- Fonte: MD/SAD.md §3.1-§3.2, decisione D-3 (albero di QR, non tabella campaigns).
-- ADDITIVA: non tocca i QR pubblicati (regola d'oro 7). short_code resta immutabile.
--
-- Principi incisi qui dentro:
--   • D-3            — ogni nodo È un QR: la gerarchia vive su qr_codes.parent_id
--   • regola d'oro 9 — owner_id + RLS già presenti; le stat si derivano, mai saldi
--   • append-only    — qr_scans si arricchisce di colonne, mai si aggiorna/cancella

-- ============================================================================
-- 1 · Albero di QR — parent_id self-referenziale + semantica del nodo
-- ============================================================================
alter table public.qr_codes
  add column if not exists parent_id  uuid null
    references public.qr_codes (id) on delete set null,
  add column if not exists purpose    text not null default 'root'
    check (purpose in ('root','campaign','referral','promo')),
  add column if not exists granted_by uuid null
    references auth.users (id);   -- delega a intermediario: figlio con owner ≠ antenato

create index if not exists qr_codes_parent_idx on public.qr_codes (parent_id);

-- Anti-ciclo: un nodo non può diventare antenato di sé stesso.
-- Un albero di QR con un ciclo romperebbe il rollup ricorsivo (CTE) all'infinito.
create or replace function public.qr_codes_reject_cycle()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_ancestor uuid;
begin
  if new.parent_id is null then
    return new;
  end if;
  -- Serializza le mutazioni di parent_id: rende ATOMICO il controllo anti-ciclo
  -- contro UPDATE concorrenti. Senza, due update che si scambiano il genitore
  -- (A.parent=B ‖ B.parent=A, plausibile con la delega multi-owner) potrebbero
  -- superare entrambi il check e creare un ciclo a 2 nodi. L'op è rara: costo nullo.
  perform pg_advisory_xact_lock(hashtext('public.qr_codes.parent_id'));
  if new.parent_id = new.id then
    raise exception 'ciclo: un QR non può essere genitore di sé stesso (%)', new.id;
  end if;
  -- risali la catena dei genitori: se incontro new.id, sto chiudendo un ciclo
  v_ancestor := new.parent_id;
  while v_ancestor is not null loop
    if v_ancestor = new.id then
      raise exception 'ciclo nell''albero di QR: % è già un discendente di %',
        new.parent_id, new.id;
    end if;
    select parent_id into v_ancestor from public.qr_codes where id = v_ancestor;
  end loop;
  return new;
end;
$$;

drop trigger if exists qr_codes_reject_cycle on public.qr_codes;
create trigger qr_codes_reject_cycle
  before insert or update of parent_id on public.qr_codes
  for each row execute function public.qr_codes_reject_cycle();

-- ============================================================================
-- 2 · Arricchimento scan — additivo (SAD §3.2). Popolato dal redirect (M1 §3).
-- ============================================================================
-- country/city esistono già (oggi passati null): si popoleranno dagli header
-- Vercel. Qui si aggiunge il resto. visitor_hash = pseudonimo salato (IP anon +
-- UA + salt/giorno): stima gli unici SENZA fingerprint invasivo né PII (D-2).
alter table public.qr_scans
  add column if not exists os           text,
  add column if not exists lang         text,
  add column if not exists referer      text,
  add column if not exists visitor_hash text;

create index if not exists qr_scans_visitor_idx on public.qr_scans (visitor_hash);

-- ============================================================================
-- 3 · Rollup dell'albero — somma scansioni per sottoalbero (owner-scoped)
-- ============================================================================
-- SECURITY DEFINER + owner-scoped come qr_scans_timeline (T-006, L-001). Bypassa
-- la RLS, quindi filtra ESPLICITAMENTE per auth.uid() sia sui nodi sia sulle scan.
-- SCOPE v1 (SAD §3.1): il rollup somma le scansioni dei soli nodi POSSEDUTI
-- dall'owner. Un sottoalbero DELEGATO a un altro owner (granted_by) NON entra nel
-- conteggio: il monitoraggio cross-owner è differito alla fase Shaer (crediti/
-- referral). Derivato dall'append-only, mai un saldo memorizzato.
create or replace function public.qr_tree_rollup(p_root uuid default null)
returns table (
  id           uuid,
  parent_id    uuid,
  name         text,
  purpose      text,
  own_scans    bigint,
  subtree_scans bigint
)
language sql
security definer
set search_path = ''
as $$
  with recursive
  -- i nodi dell'owner loggato, opzionalmente ristretti al sottoalbero di p_root
  mine as (
    select q.id, q.parent_id, q.name, q.purpose
    from public.qr_codes q
    where q.owner_id = auth.uid()
  ),
  -- scansioni proprie per nodo (owner-scoped dalla RLS implicita del definer? no:
  -- il definer bypassa RLS, quindi si filtra esplicitamente per owner)
  own as (
    select s.qr_id, count(*)::bigint as n
    from public.qr_scans s
    where s.owner_id = auth.uid()
    group by s.qr_id
  ),
  -- discendenza: per ogni nodo, tutti i suoi discendenti (incluso sé).
  -- Guardia CYCLE (difesa in profondità): anche se il trigger anti-ciclo fallisse,
  -- la ricorsione TERMINA invece di appendere la dashboard. La coppia
  -- (root_id, node_id) individua il ripetersi di un nodo nella stessa risalita.
  descendants as (
    select m.id as root_id, m.id as node_id from mine m
    union all
    select d.root_id, c.id
    from descendants d
    join mine c on c.parent_id = d.node_id
  ) cycle root_id, node_id set is_cycle using path
  select
    m.id, m.parent_id, m.name, m.purpose,
    coalesce(o.n, 0) as own_scans,
    (select coalesce(sum(coalesce(o2.n,0)),0)
       from descendants dd
       left join own o2 on o2.qr_id = dd.node_id
      where dd.root_id = m.id and not dd.is_cycle) as subtree_scans
  from mine m
  left join own o on o.qr_id = m.id
  where p_root is null or m.id = p_root
     or m.id in (select node_id from descendants where root_id = p_root and not is_cycle);
$$;

-- Solo l'owner loggato: la dashboard è autenticata. Anon NON la chiama
-- (whitelist anon invariata: {resolve_qr, anonymize_ip} — grants.test.ts, L-001).
revoke all     on function public.qr_tree_rollup(uuid) from public;
revoke all     on function public.qr_tree_rollup(uuid) from anon;
grant  execute on function public.qr_tree_rollup(uuid) to authenticated;
