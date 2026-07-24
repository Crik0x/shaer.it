---
task: T-002
tier: C
titolo: Schema Supabase QR Platform (qr_codes, qr_scans) + RLS
aree: [database, rls, multi-tenant, dati-personali, migrazioni, supabase]
stato: chiuso
riporti: 0
sessioni: [2026-07-24]
---

### Obiettivo
Progetto Supabase dedicato + tabelle `qr_codes`/`qr_scans` con `owner_id` e RLS,
schema da `MD/QR_PLATFORM.md §18` (NON da `0001_initial_schema.sql`). Raggiunto e
**versionato** nel repo (era un buco: T-002 non aveva lasciato migrazioni).

### Accertato (prove)
- Progetto: `alrguvxspssjwfmtuhdw.supabase.co` (URL+anon key in `apps/web/.env.local`,
  gitignored — `git check-ignore` OK).
- Migrazione: `supabase/migrations/20260724000001_qr_platform_initial.sql`, applicata
  live da Nick (SQL editor).
- Verifiche anon via REST:
  - `resolve_qr('nope')` → `null` / 200 (tabelle+funzione esistono)
  - `SELECT qr_codes` anon → `[]` / 200 (RLS nasconde le righe, **niente leak owner_id**)
  - `INSERT qr_scans` anon → `42501 RLS violation` (append-only: solo il definer scrive)

### Domande e risposte
- «T-002 è fatto?» → Nick: sì. Ma la **realtà** diceva no: `qr_codes`/`qr_scans` non
  esistevano in `public` (`PGRST205`). Conseguenza: incongruenza carta↔realtà, mi sono
  fermato (regola d'oro 1/2) e ho scritto io la migrazione. DB era **vergine**.

### Decisioni
- **Resolver `SECURITY DEFINER` invece di policy anon sulle tabelle**: una policy
  `anon SELECT` su `qr_codes` esporrebbe `owner_id` e i `target_url` altrui via API.
  Scelto: nessun accesso diretto anon, solo `EXECUTE` su `resolve_qr` (definer, bypassa
  RLS internamente). Scartato: RLS aperta all'anon.
- **`owner_id` denormalizzato anche su `qr_scans`**: RLS owner-scoped semplice e veloce,
  senza join. Lo setta il definer dal QR, l'anon non può forgiarlo.
- **`short_code` immutabile via trigger** (non solo convenzione): regola d'oro 7 resa
  meccanica.
- **`gen_random_uuid()`** built-in (PG13+), niente pgcrypto per gli id.

### Attriti
- T-002 non aveva lasciato migrazioni nel repo → schema non versionato → risolto
  scrivendolo in `supabase/migrations/` → prevenibile? sì, **regola**: ogni modifica di
  schema nasce come file di migrazione versionato, mai solo nel dashboard.
- Seed di un QR bloccato: `owner_id` FK → `auth.users`, DB vergine senza utenti; signup
  anon rifiutato (`example.com` invalido + conferma email attiva → nessun token).
  Risolto: Nick crea utente (dashboard/SQL) + seed via CTE `with new_user as (insert
  into auth.users ...) insert into qr_codes ...`.

### Vicoli ciechi
- **Seed del QR di prova via signup anon**: `POST /auth/v1/signup` con anon key →
  `example.com` rifiutato come email invalida, e conferma email attiva → nessun
  `access_token`. Con la sola anon key non si crea l'utente che `owner_id` (FK →
  `auth.users`) richiede. Percorribile solo: utente via dashboard, o `insert into
  auth.users` in SQL editor (CTE che poi inserisce il QR). Vale anche per T-003.

### Composizione
Stabilisce lo **schema e il contratto `resolve_qr`** che T-003 consuma e che T-005
(generatore) e T-006 (analytics) consumeranno. `short_code` immutabile è vincolo per
tutti. Vedi anche T-003 per l'estensione `anonymize_ip`.
