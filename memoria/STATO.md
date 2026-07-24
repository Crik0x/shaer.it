# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `5357868`

## Dove siamo

Il 24/07 (2ª sessione) sono entrati **T-004** (auth) e **T-005** (generatore QR),
entrambi chiusi con prova. L'app ora fa il giro completo: registrazione →
dashboard → crea QR dinamico → personalizza (colori/logo) e scarica PNG/SVG → il
QR risolve pubblicamente via `/r/{short_code}` e la scansione si conta in
dashboard. Prossimo: **T-006** (analytics: timeline scansioni per QR, Recharts in
dynamic import), poi T-007 (hardening) e T-008 (Confirm email ON pre-lancio).

## Cosa esiste

- **Generatore QR (T-005)**: `lib/short-code.ts` (base62 rejection-sampling, +test
  5/5) · `lib/qr.ts` (`redirectUrl` da `NEXT_PUBLIC_SITE_URL`) · `lib/qr-create.test.ts`
  (RLS 1/1) · `app/dashboard/qr/actions.ts` (Server Action `createQr`: getUser +
  owner_id + retry 23505) · `qr/new/{page,create-form}.tsx` · `qr/[short_code]/`
  {`page` dettaglio owner-scoped, `qr-panel` dynamic import, `qr-canvas` designer
  colori/logo + download} · `dashboard/page.tsx` (lista QR). Dep: `qrcode`.
- **Auth + dashboard (T-004)**: `lib/supabase-server.ts` (client owner-scoped) ·
  `supabase-browser.ts` · `proxy.ts` (Next 16, protegge `/dashboard`, esclude
  `/r/*`) · `app/(auth)/login/*` · `app/auth/{callback,signout}/route.ts` ·
  `lib/auth.test.ts` (verde 1/1). Dep: `@supabase/ssr`.
- **Redirect (T-003)**: `app/r/[short_code]/route.ts` · `lib/scan.ts` (+test 6/6)
  · `lib/supabase-public.ts` (anon). **Schema (T-002)**: migrazione
  `qr_codes`/`qr_scans` (owner_id, RLS, trigger immutabilità, `resolve_qr`+`anonymize_ip`).
- DB Supabase `alrguvxspssjwfmtuhdw`. Dev: Email provider ON + Confirm email OFF.
- `.claude/launch.json` — dev server via `preview_start name=web` (porta 3000).

## Cosa NON esiste ancora

- Analytics UI (T-006), hardening grant/seed (T-007), riattivare Confirm email
  pre-lancio (T-008). Deploy Vercel, dominio redirect (es. `qr.shaer.it`) e
  `NEXT_PUBLIC_SITE_URL` in prod. Metadata `<title>` ancora "Create Next App".

## Note operative

- Aprire la sessione **dentro** `D:\Desktop\Shaer.it`.
- **Button shadcn** = `@base-ui`: usa il prop **`render={<Link/>}`**, non `asChild`.
- Server Action: auth **dentro** l'azione (`getUser`), owner_id dalla sessione.
- Test che toccano Supabase: email con **MX reali** (`@shaer.it`), non `example.com`
  (L-002). Anon key pubblica → confine = **DB** (RLS/definer), non l'app (L-001).
- Next 16: file `proxy.ts`, non `middleware.ts` (hook pre-commit §7 lo impone).
  File cancellato sotto cache turbopack → `rm -rf .next/dev` + restart.
- Ogni modifica di schema nasce in `supabase/migrations/`, mai solo dal SQL editor.
- La cwd della tool Bash non persiste: path assoluti. Hook via `core.hooksPath`.
