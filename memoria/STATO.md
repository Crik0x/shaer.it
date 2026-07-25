# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `9f819c4`

## Dove siamo

Il 25/07 (3ª sessione) è entrato **T-006** (analytics timeline), chiuso con prova.
L'app fa il giro completo: registrazione → dashboard → crea QR dinamico →
personalizza (colori/logo) e scarica PNG/SVG → il QR risolve pubblicamente via
`/r/{short_code}`, la scansione si conta e nel dettaglio QR una **timeline
Recharts** mostra le scansioni per giorno/ora (derivata dal DB). Prossimo:
**T-007** (hardening: test grant anon che meccanizza L-001 + `seed.sql`), poi
T-008 (Confirm email ON pre-lancio).

## Cosa esiste

- **Analytics timeline (T-006)**: migr. `20260725000001` (RPC `qr_scans_timeline`
  SECURITY DEFINER owner-scoped via `auth.uid()`, grant **solo `authenticated`**,
  `date_trunc` day/hour su `created_at`) · `lib/qr-timeline.ts` (pure, UTC) +
  `.pure.test.ts` 2/2 + `.test.ts` integ 1/1 · `qr/[short_code]/{analytics-panel`
  toggle Giorno/Ora`, analytics-chart` Recharts dynamic import`}`. Dep: `recharts`.
  Fetch server 2 granularità, toggle client.
- **Generatore QR (T-005)**: `lib/short-code.ts` (base62, test 5/5) · `lib/qr.ts`
  (`redirectUrl`) · `lib/qr-create.test.ts` (RLS 1/1) · `qr/actions.ts` (Server
  Action `createQr`: getUser+owner_id+retry 23505) · `qr/new/*` · `qr/[short_code]/`
  {`page` owner-scoped, `qr-panel`+`qr-canvas` designer/download} ·
  `dashboard/page.tsx` (lista). Dep: `qrcode`.
- **Auth + dashboard (T-004)**: `lib/supabase-server.ts` (owner-scoped) ·
  `supabase-browser.ts` · `proxy.ts` (protegge `/dashboard`, esclude `/r/*`) ·
  `app/(auth)/login/*` · `app/auth/{callback,signout}/route.ts` · `lib/auth.test.ts`
  1/1. Dep: `@supabase/ssr`.
- **Redirect (T-003)**: `app/r/[short_code]/route.ts` · `lib/scan.ts` (test 6/6) ·
  `lib/supabase-public.ts` (anon). **Schema (T-002)**: migr. `qr_codes`/`qr_scans`
  (owner_id, RLS, trigger immut., `resolve_qr`+`anonymize_ip`).
- DB Supabase `alrguvxspssjwfmtuhdw`. Dev: Email provider ON + Confirm email OFF.
- `.claude/launch.json` — dev via `preview_start name=web` (:3000).

## Cosa NON esiste ancora

- Hardening grant/seed (T-007), riattivare Confirm email pre-lancio (T-008).
  Gap-filling dei bucket vuoti nella timeline (mostra solo bucket con dati) e
  timezone locale (oggi UTC) rimandati. Deploy Vercel, dominio redirect (es.
  `qr.shaer.it`) e `NEXT_PUBLIC_SITE_URL` in prod. Metadata `<title>` ancora
  "Create Next App".

## Note operative

- **Button shadcn** = `@base-ui`: prop **`render={<Link/>}`**, non `asChild`.
- Test su Supabase: email con **MX reali** (`@shaer.it`), non `example.com` (L-002).
  Anon key pubblica → confine = **DB** (RLS/definer), non l'app (L-001).
- Next 16: `proxy.ts`, non `middleware.ts` (hook §7). Cache turbopack sporca →
  `rm -rf .next/dev` + restart. `dynamic(ssr:false)` solo in Client Component.
- Schema: nasce in `supabase/migrations/`, applicato da Nick nel SQL editor.
- La cwd della tool Bash non persiste: path assoluti.
