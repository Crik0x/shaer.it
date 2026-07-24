# Pattern

Ciò che l'`analista` ha distillato dai dossier: attriti che si sono ripetuti,
la loro causa vera, e come sono stati resi impossibili.

**Non si carica all'avvio.** Si consulta nel passo di composizione, quando un task
nuovo tocca aree già viste, e in chiusura.

La regola della seconda occorrenza: una cosa sola non è un pattern. Due sì.

| pattern | occorrenze | causa vera | prevenzione |
|---|---|---|---|
| Con anon key pubblica il confine di sicurezza è il **DB** (RLS/`SECURITY DEFINER`), mai l'app | T-002, T-003 | in T-002 scelto giusto (definer vs policy anon), in T-003 violato per disattenzione (anonimizzazione solo lato app) — colto dal revisore, non da un controllo | **test** sui grant reali (`pg_proc`/`information_schema`): fallisce se una tabella/funzione diventa anon-accessibile fuori da una whitelist → **T-007** |
| Seed utente/QR in ambiente vergine bloccato dalla FK su `auth.users` (signup anon non percorribile) | T-002, T-003 | nessuna fixture di dev riusabile: ogni sessione ri-deriva la CTE su `auth.users` | **`supabase/seed.sql`** versionato con la CTE utente-dev + QR di prova → **T-007** |
