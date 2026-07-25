# Pattern

Ciò che l'`analista` ha distillato dai dossier: attriti che si sono ripetuti,
la loro causa vera, e come sono stati resi impossibili.

**Non si carica all'avvio.** Si consulta nel passo di composizione, quando un task
nuovo tocca aree già viste, e in chiusura.

La regola della seconda occorrenza: una cosa sola non è un pattern. Due sì.

| pattern | occorrenze | causa vera | prevenzione |
|---|---|---|---|
| Con anon key pubblica il confine di sicurezza è il **DB** (RLS/`SECURITY DEFINER`), mai l'app. Un grant dichiarato «solo authenticated» NON è reale finché non è introspezionato: Supabase all'init concede EXECUTE ad `anon` di default, e `revoke … from public` non lo toglie — si revoca da `anon` | T-002, T-003, T-006 | in T-003 anonimizzazione solo lato app; in T-006 `qr_scans_timeline` risultava anon-eseguibile nonostante `revoke from public` (default-privilege Supabase) — entrambi colti *dopo*, non da un controllo | ✅ **IMPLEMENTATO** — `apps/web/lib/grants.test.ts` (T-007) introspetta `pg_catalog` via RPC `security_anon_surface`: fallisce se una funzione/tabella esce dalla whitelist `{resolve_qr, anonymize_ip}`. Ha già trovato e fatto correggere la violazione di T-006 |
| Seed utente/QR in ambiente vergine bloccato dalla FK su `auth.users` (signup anon non percorribile) | T-002, T-003 | fabbricare l'utente in `auth.users` dentro il seed committa una **password in chiaro** su progetto condiviso (respinto revisore, T-007) | **`supabase/seed.sql`**: l'utente-dev si crea **fuori da git** (dashboard/app, password mai committata); il seed lo **cerca per email** e vi aggancia QR/scansioni (no-op se assente) → T-007/T-009 |
