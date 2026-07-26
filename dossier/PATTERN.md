# Pattern

Ciò che l'`analista` ha distillato dai dossier: attriti che si sono ripetuti,
la loro causa vera, e come sono stati resi impossibili.

**Non si carica all'avvio.** Si consulta nel passo di composizione, quando un task
nuovo tocca aree già viste, e in chiusura.

La regola della seconda occorrenza: una cosa sola non è un pattern. Due sì.

| pattern | occorrenze | causa vera | prevenzione |
|---|---|---|---|
| Con anon key pubblica il confine di sicurezza è il **DB** (RLS/`SECURITY DEFINER`), mai l'app. Un grant dichiarato «solo authenticated» NON è reale finché non è introspezionato: Supabase all'init concede EXECUTE ad `anon` di default, e `revoke … from public` non lo toglie — si revoca da `anon` | T-002, T-003, T-006 | in T-003 anonimizzazione solo lato app; in T-006 `qr_scans_timeline` risultava anon-eseguibile nonostante `revoke from public` (default-privilege Supabase) — entrambi colti *dopo*, non da un controllo | ✅ **IMPLEMENTATO** — `apps/qr/lib/grants.test.ts` (T-007) introspetta `pg_catalog` via RPC `security_anon_surface`: fallisce se una funzione/tabella esce dalla whitelist `{resolve_qr, anonymize_ip}`. Ha già trovato e fatto correggere la violazione di T-006 |
| Seed utente/QR in ambiente vergine bloccato dalla FK su `auth.users` (signup anon non percorribile) | T-002, T-003 | fabbricare l'utente in `auth.users` dentro il seed committa una **password in chiaro** su progetto condiviso (respinto revisore, T-007) | **`supabase/seed.sql`**: l'utente-dev si crea **fuori da git** (dashboard/app, password mai committata); il seed lo **cerca per email** e vi aggancia QR/scansioni (no-op se assente) → T-007/T-009 |
| Frontmatter dei dossier non conforme a `MODELLO.md`: chiave `livello:` invece di `tier:`, e `aree`/`riporti`/`sessioni` assenti | T-011, T-012 | ambiguità fra due file normativi: `lavoro.md` §2-bis parla di «livello» in prosa, `MODELLO.md` fissa la chiave YAML come `tier` — chi scrive segue il nome letto per ultimo. Rompe il grep-by-`aree` su cui si fonda il distillatore | ✅ **IMPLEMENTATO** — `pre-commit §8`: per ogni `dossier/*.md` in staging (esclusi MODELLO/PATTERN) blocca se manca una delle 5 chiavi obbligatorie o se compare `livello:` al posto di `tier:` → L-005 |
| Funzione/trigger nuovo (pura TS o SQL) committato **senza test**: il solo gate che lo ferma è il revisore al 1° giro — un round-trip intero sprecato ogni volta che ricapita | T-011, T-012 | regola 5 (nessuna prova narrativa dove può esserci un test) senza enforcement meccanico *prima* del revisore per il codice nuovo: `pre-commit §9` gira `tsc` (L-004) ma non verifica che ogni funzione/trigger nuovo abbia un test associato | ⏳ **CANDIDATO HOOK** — `pre-commit`: estrarre dai `.ts/.sql` in staging i nomi delle funzioni nuove (`export function …` / `create (or replace)? function …`) e bloccare se il nome non compare in nessun `*.test.ts`. Finché non c'è, la rete resta il revisore |
