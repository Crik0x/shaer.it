# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `5357868`

## Dove siamo

Il 24/07 (2ª sessione) è entrato **T-004**, chiuso con prova: autenticazione
Supabase (email+password primario + magic link UX) via `@supabase/ssr`, sessione
nei cookie, proxy di refresh/protezione e scheletro dashboard a Server Components
con indicatori owner-scoped. Test `lib/auth.test.ts` **verde 1/1** (signup→sessione,
RLS count=0, login), route provate, revisore approvato. Su Supabase dev: Email
provider ON + Confirm email OFF (debito **T-008**: riattivare Confirm email prima
del lancio). Prossimo: **T-005** (generatore QR).

## Cosa esiste

- **Auth + dashboard (T-004)**: `apps/web/lib/supabase-server.ts` (client
  autenticato owner-scoped) · `supabase-browser.ts` · `proxy.ts` (Next 16: ex
  middleware — refresh sessione + protezione `/dashboard`, esclude `/r/*`) ·
  `app/(auth)/login/{page,login-form}.tsx` · `app/auth/{callback,signout}/route.ts`
  · `app/dashboard/{layout,page}.tsx` · `lib/auth.test.ts` (integrazione, verde
  1/1). Dep nuova: `@supabase/ssr`.
- **Redirect (T-003)**: `app/r/[short_code]/route.ts` · `lib/scan.ts` (+test 6/6)
  · `lib/supabase-public.ts` (client anon). Intatto.
- **Schema (T-002)**: `supabase/migrations/20260724000001_qr_platform_initial.sql`
  — `qr_codes`/`qr_scans` (append-only, owner_id, RLS), trigger immutabilità
  `short_code`, `resolve_qr` + `anonymize_ip` (definer).
- DB Supabase `alrguvxspssjwfmtuhdw` con `seed@shaer.it` e QR `demo123` →
  `https://example.com`.
- `.claude/launch.json` — config dev server per `preview_start`.
- `MD/QR_PLATFORM.md` (prodotto), `MD/SHAER_MASTER.md` (dominio, per dopo),
  `MD/SAAS_BUILD_PLAN_V1.md` (riferimento).

## Cosa NON esiste ancora

- Generatore QR (T-005), analytics UI (T-006), hardening grant/seed (T-007).
  Deploy Vercel, dominio redirect (es. `qr.shaer.it`). Metadata `<title>` ancora
  "Create Next App".

## Note operative

- Aprire la sessione **dentro** `D:\Desktop\Shaer.it`.
- **PRIMA DEL LANCIO**: riattivare Confirm email su Supabase (spento in dev per
  T-004) → è **T-008**, non perderlo.
- Dev server: `preview_start name=web` (usa `launch.json`, porta 3000). Un
  `middleware.ts` non funziona in Next 16 — file `proxy.ts` (hook pre-commit §7
  lo impone). Se cancelli un file sotto cache turbopack: `rm -rf .next/dev` +
  restart.
- Ogni modifica di schema nasce in `supabase/migrations/`, mai solo dal SQL editor.
- Anon key pubblica → il confine è il **DB** (RLS/definer), non l'app (L-001).
- Test auth: usare email con MX reali (`@shaer.it`), non `example.com` (L-002).
- La cwd della tool Bash non persiste: usare path assoluti. Hook via
  `core.hooksPath scripts/git-hooks`.
