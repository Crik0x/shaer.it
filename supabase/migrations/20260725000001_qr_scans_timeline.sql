-- T-006 · Analytics — timeline delle scansioni per QR, aggregata lato DB.
-- Le statistiche si DERIVANO da qr_scans (append-only): nessun contatore memorizzato.
--
-- Principi incisi qui dentro:
--   • regola d'oro 9 / L-001 — il confine è il DB: l'aggregazione owner-scoped vive
--     in una funzione SECURITY DEFINER, non nell'app. Grant solo ad `authenticated`,
--     MAI ad `anon` (la timeline non è pubblica; la whitelist anon di T-007 resta
--     limitata a resolve_qr + anonymize_ip).
--   • append-only — si legge, non si scrive: la funzione è read-only.
--
-- Timezone: bucket in UTC (date_trunc su timestamptz opera in UTC di default con
-- TimeZone='UTC'). Il fuso locale dell'utente si affina dopo (nota T-006).

-- ============================================================================
-- qr_scans_timeline — conteggi per bucket temporale di un singolo QR dell'utente
-- ============================================================================
-- SECURITY DEFINER: gira come owner della funzione e bypassa la RLS, quindi il
-- filtro owner lo impone la funzione stessa — `owner_id = auth.uid()`. Un QR non
-- proprio produce zero righe (non rivela né esistenza né conteggi altrui).
-- p_bucket ∈ {'day','hour'}: il toggle di granularità è un solo parametro, non
-- una seconda funzione.
create or replace function public.qr_scans_timeline(
  p_short_code text,
  p_bucket     text default 'day'
)
returns table (bucket timestamptz, hits bigint)
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  if p_bucket not in ('day', 'hour') then
    raise exception 'p_bucket ammette solo ''day'' o ''hour'', ricevuto %', p_bucket;
  end if;

  return query
  select date_trunc(p_bucket, s.created_at) as bucket,
         count(*)                            as hits
  from public.qr_scans s
  join public.qr_codes q on q.id = s.qr_id
  where q.short_code = p_short_code
    and q.owner_id   = auth.uid()      -- l'utente vede solo i propri QR
  group by 1
  order by 1;
end;
$$;

-- La timeline è privata: solo l'utente autenticato, mai anon.
revoke all     on function public.qr_scans_timeline(text, text) from public;
grant  execute on function public.qr_scans_timeline(text, text) to authenticated;
