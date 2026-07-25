---
task: T-007
tier: C
titolo: Hardening — test sui grant anon reali (meccanizza L-001)
aree: [sicurezza, grant, rls, supabase, anon, definer]
stato: chiuso
riporti: 0
sessioni: [2026-07-25]
---

# T-007 · Hardening: superficie anon del DB

## Obiettivo
Un test verde che fallisce nel momento in cui una funzione invocabile diventa
EXECUTE-abile da `anon`, o una tabella di `public` perde la RLS, fuori dalla
whitelist `{resolve_qr, anonymize_ip}`. Meccanizza L-001 (con anon key pubblica
il confine è il DB, non l'app). La fixture dev versionata è stata scorporata in
**T-009** (vedi sotto).

## Accertato (prove)
- `apps/web/lib/grants.test.ts` **verde sul DB reale**: `1 pass` dopo aver
  applicato le migrazioni 0002 e 0003 (output re-run confermato da Nick).
- La superficie anon reale del progetto `alrguvxspssjwfmtuhdw`, misurata dalla
  RPC `security_anon_surface`, è ora esattamente `{resolve_qr, anonymize_ip}`.
- `migrations/20260725000002_security_anon_surface.sql`: funzione SQL `stable`,
  `security invoker`, `search_path=''`, introspette `pg_catalog` (funzioni
  `prokind in ('f','p')` non-trigger con EXECUTE ad anon + tabelle
  `relkind in ('r','p')` senza RLS). Grant solo `authenticated`.
- `migrations/20260725000003_revoke_default_anon_grants.sql`: `revoke execute …
  from anon` su `qr_scans_timeline` e `security_anon_surface`.

## Domande e risposte
- **Come legge il test la realtà dei grant?** (opzioni A comportamentale / B
  service_role / C RPC definer). Nick ha delegato la scelta tecnica. →
  Conseguenza: scelta **C** (vedi Decisioni), perché A e B non reggono.

## Decisioni
- **Introspezione via RPC (C), non service_role (B) né comportamentale (A).**
  Scartate: **A** — anon via PostgREST vede solo `public`, non `pg_catalog`, e
  comportamentalmente non distingue «RLS blocca» da «tabella vuota»; **B** — la
  service_role key passa comunque da PostgREST (solo `public`), quindi servirebbe
  una connessione Postgres diretta = driver `pg` nuovo (regola 10) + password DB
  (secondo segreto). **C** raggiunge il catalog con la sola anon key + login,
  zero dipendenze e zero segreti nuovi; costo permanente = una funzione read-only
  granted solo ad `authenticated` (fuori dalla superficie anon che misura).

## Attriti
- `pg_get_function_identity_arguments` **include i nomi** degli argomenti in
  questa versione (`anonymize_ip(p_ip text)`), non i soli tipi → la whitelist per
  firma non combaciava. Risolto: match per **nome funzione** (`sig.split("(")[0]`),
  robusto alla versione di Postgres. → prevenibile: no (è il test stesso).
- **Ritrovamento (L-001 in carne e ossa):** `qr_scans_timeline` e
  `security_anon_surface` risultavano EXECUTE-abili da `anon` nonostante
  `revoke all … from public` + `grant … to authenticated`. Causa vera: Supabase
  all'init imposta `alter default privileges in schema public grant execute on
  functions to anon, authenticated, …` → ogni funzione nasce con un grant
  **esplicito** ad `anon`, che `revoke … from public` NON tocca. Risolto: 0003
  revoca esplicitamente da `anon`. → prevenibile: **`→ test`** (questo stesso
  `grants.test.ts`), lezione registrata.
- **Respinto del revisore (g5):** la prima `seed.sql` committava una password
  reale (`dev-Password-123`) per un login sul progetto Supabase **condiviso**.
  Causa vera: fixture concepita come «CTE utente-dev» (PATTERN riga 14) senza
  distinguere istanza locale effimera da progetto cloud condiviso. Risolto:
  utente-dev creato **fuori da git** (dashboard/app), seed che aggancia i dati
  per email. → prevenibile: **regola/hook** (nessun `crypt(`/password letterale
  in file versionati) — proposta al distillatore.

## Vicoli ciechi
- **B (service_role via supabase-js)**: inutile per introspettare il catalog —
  PostgREST espone solo `public` a prescindere dalla key. Non ritentare senza una
  connessione Postgres diretta.
- **`revoke … from public`** per rendere privata una funzione in Supabase: NON
  basta, il grant esplicito ad `anon` resta. Si revoca da `anon`.

## Composizione (cosa STABILISCE)
- La **whitelist anon** `{resolve_qr, anonymize_ip}` diventa un invariante
  meccanizzato: ogni task futuro che aggiunge una funzione `public` esposta ad
  anon fuori da questa lista fa fallire `grants.test.ts`. Chi introduce un nuovo
  endpoint pubblico deve aggiornare consapevolmente la whitelist.
- La regola operativa **«per rendere privata una funzione si revoca da `anon`,
  non da `public`»** vincola tutte le migrazioni future con funzioni non pubbliche.
