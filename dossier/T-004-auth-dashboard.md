---
task: T-004
tier: C
titolo: Auth Supabase (email+password + magic link) e scheletro dashboard
aree: [auth, sessione, rls, dashboard, multi-tenant, next16]
stato: aperto        # aperto | chiuso
riporti: 1           # ↻1: codice completo, test auth live bloccato da config Supabase
sessioni: [2026-07-24]
---

## Obiettivo

Un utente si registra/accede, la sessione vive nei cookie, e vede una dashboard
con indicatori owner-scoped (QR creati, scansioni). `/dashboard` è protetta;
`/r/*` resta pubblico e intatto.

## Accertato

- Schema RLS reale (`supabase/migrations/20260724000001_qr_platform_initial.sql:70-82`):
  `qr_codes` CRUD own + `qr_scans` select own, tutte via `auth.uid() = owner_id`.
  Le letture della dashboard sono quindi già isolate per proprietario.
- Alias `@/*` → `./*` (`apps/web/tsconfig.json:22-23`).
- Next 16 rinomina **Middleware → Proxy**: file `proxy.ts` a root, export `proxy`
  (`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`).
- Supabase valida l'email con **MX reali**: `example.com`/`test.shaer.it` → 400
  `email_address_invalid`; `shaer.it` (MX reali) passa. Misurato coi run di
  `apps/web/lib/auth.test.ts` (l'email del test usa `@shaer.it`).
- Confirm email è **ON** nel progetto dev: al signup Supabase invia la mail di
  conferma → `over_email_send_rate_limit` (429). Quindi signup non dà sessione.
- Route provate a caldo: `GET /login` → 200 (form + magic link, via get_page_text),
  `GET /dashboard` non autenticato → 307 → `/login`, `GET /r/demo123` → 302
  `example.com` (redirect pubblico intatto). Typecheck `tsc --noEmit` → 0.
- Revisore: `esito=approvato`, 0 rilievi (`memoria/review/2026-07-24.json`).

## Domande e risposte

- Meccanismo auth? → **email+password primario + magic link UX**. Conseguenza:
  la prova forte è un test verde end-to-end via API, non un click nell'email.
- Nuova lib `@supabase/ssr`? → **sì** (pacchetto ufficiale cookie-based per App
  Router). Conseguenza: client server/browser e proxy puliti.
- Utente subito loggabile in dev? → **disattivare Confirm email**, con debito:
  **riattivarlo prima del lancio** (→ T-008). Conseguenza: il test diventa verde
  solo dopo il toggle su Supabase.

## Decisioni

- Protezione a due livelli: check ottimistico nel `proxy.ts` + protezione forte
  (`getUser`, non `getSession`) nel `dashboard/layout.tsx`. Scartato il solo
  proxy: la doc Next 16 avverte che il proxy non è una soluzione di autorizzazione.
- `getUser()` ovunque per le decisioni di auth: valida col server Supabase, non si
  fida del cookie. Scartato `getSession()` (fidarsi del cookie lato server).
- Indicatori dashboard **contati** da `qr_codes`/`qr_scans` a ogni richiesta
  (`count: exact, head: true`), mai un saldo memorizzato (regola d'oro 9).

## Attriti

- `middleware.ts` non registrato → causa: Next 16 lo chiama `proxy.ts` → rinominato
  file e funzione → prevenibile? **lezione** (AGENTS.md avvisa in generale; qui
  l'istanza concreta è costata un 500 «Could not parse module middleware.ts»).
- 500 persistente dopo il rename → causa: il dev server avviato prima aveva in
  cache il riferimento a `middleware.ts` cancellato → risolto con stop del
  processo + `rm -rf .next/dev` + restart via `launch.json` → prevenibile? **no**
  (è il caso legittimo in cui il server va riavviato: file cancellato sotto cache).
- Test `email_address_invalid` con `example.com` → causa: Supabase valida MX reali
  → usato `shaer.it` → prevenibile? **lezione** (dominio con MX nei test auth).

## Stato e piano

**Dove ci si è fermati:** codice completo e typecheck pulito; route non-auth
provate; il test `apps/web/lib/auth.test.ts` è scritto e corretto ma **rosso** per
Confirm email ON (429). T-004 resta `[~]`.

**Piano pronto (sessione a freddo, ~10 min):**
1. Nick (o via Supabase dashboard → Auth → Providers → Email) mette **Confirm
   email OFF** nel progetto `alrguvxspssjwfmtuhdw`.
2. Rilancia il test:
   `cd apps/web && node --test --env-file=.env.local lib/auth.test.ts`
   Verde atteso: signup dà sessione, utente nuovo vede `count=0` su qr_codes/qr_scans
   (RLS), login email+password dà sessione.
3. Con confirm OFF, prova anche il giro visivo: signup dal form → redirect a
   `/dashboard`, header con email, «Esci» (POST `/auth/signout`) → torna a `/login`.
4. A verde: T-004 → `[x]` (→REGISTRO), sposta questo dossier in `dossier/archivio/`.
5. Il magic link resta `[~]` visivo finché non lo si prova aprendo una mail reale.

## Vicoli ciechi

- Signup con `example.com`/`test.shaer.it`: rifiutato (no MX). Non ritentare con
  domini senza MX nei test auth.

## Composizione

**Stabilisce** per i task che seguono: (a) `serverSupabase()` in
`lib/supabase-server.ts` è IL client autenticato owner-scoped — T-005 (insert
`qr_codes` con `owner_id` lato server) e T-006 (lettura `qr_scans` owner-scoped)
lo consumano, mai il client anon; (b) `browserSupabase()` per le foglie client;
(c) il pattern dashboard (Server Component + conteggi derivati) che T-006 estende.
T-008 (riattivare Confirm email) **dipende** da questo task (nasce dal suo debito).
