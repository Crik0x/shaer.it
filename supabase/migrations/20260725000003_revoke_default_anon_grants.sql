-- T-007 · Rimedio al buco che grants.test.ts ha scoperto sul DB reale.
--
-- Supabase, all'inizializzazione del progetto, imposta:
--   alter default privileges in schema public
--     grant execute on functions to postgres, anon, authenticated, service_role;
-- Perciò OGNI funzione creata in `public` nasce con EXECUTE concesso ad `anon`
-- in modo ESPLICITO. Il `revoke all on function ... from public` usato in T-006
-- (qr_scans_timeline) e in T-007/0002 (security_anon_surface) NON rimuove quel
-- grant esplicito — tocca solo il pseudo-ruolo PUBLIC. Risultato: `anon` restava
-- EXECUTE-abile su entrambe, contro l'intento dichiarato («solo authenticated»).
-- È esattamente L-001: con l'anon key pubblica l'intento va IMPOSTO nel DB, non
-- solo dichiarato in un commento.
--
-- Rimedio: revocare EXECUTE ad `anon` sulle funzioni non pubbliche. resolve_qr e
-- anonymize_ip restano intenzionalmente anon (sono il redirect pubblico).
-- D'ora in poi la regola è: per rendere privata una funzione si revoca da
-- `anon` (ed eventualmente `authenticated`), non da `public`.



