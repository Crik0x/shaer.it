-- T-007 · Hardening — la superficie anon del DB, esposta per essere TESTATA.
-- Meccanizza L-001: con l'anon key pubblica il confine di sicurezza è il DB,
-- non l'app. Un test verde su questa funzione fallisce nel momento in cui una
-- funzione INVOCABILE diventa EXECUTE-abile da `anon`, o una tabella di `public`
-- perde la RLS, fuori dalla whitelist prevista {resolve_qr, anonymize_ip}.
--
-- Perché una funzione e non una query diretta dai test: l'anon (o service) key
-- passa da PostgREST, che espone solo lo schema `public` — mai pg_catalog né
-- information_schema, con QUALSIASI key. Questa funzione read-only porta il
-- catalog dentro `public`, dove il test la può chiamare via .rpc() con la sola
-- anon key. È granted SOLO ad `authenticated`: così non allarga la superficie
-- anon che essa stessa misura.
--
-- Le trigger function sono escluse di proposito: PostgREST non le espone come
-- RPC (ritornano `trigger`), quindi un eventuale EXECUTE ad anon su di esse è
-- inerte e non è superficie d'attacco.

create or replace function public.security_anon_surface()
returns table (kind text, obj text)
language sql
stable
security invoker
set search_path = ''
as $$
  -- Funzioni di `public` invocabili via PostgREST con EXECUTE concesso ad `anon`.
  select 'function_anon_execute'::text,
         p.proname || '(' || pg_catalog.pg_get_function_identity_arguments(p.oid) || ')'
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prokind in ('f', 'p')   -- funzioni ordinarie e procedure (entrambe RPC)
    and p.prorettype <> 'pg_catalog.trigger'::pg_catalog.regtype
    and pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
  union all
  -- Tabelle di `public` senza row-level security attiva (ordinarie e
  -- partizionate: entrambe RLS-capaci).
  select 'table_without_rls'::text, c.relname
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
    and not c.relrowsecurity;
$$;

-- Introspettiva ma innocua (nessun dato applicativo): la chiama solo il test,
-- da autenticato. Fuori dalla superficie anon che misura.
revoke all     on function public.security_anon_surface() from public;
grant  execute on function public.security_anon_surface() to authenticated;
