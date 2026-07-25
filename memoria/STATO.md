# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `bfcfbe3`

## Dove siamo

Il 25/07 (4ª sessione) è entrato **T-007** (hardening grant anon), chiuso con
prova: un test verde vincola la superficie anon a `{resolve_qr, anonymize_ip}` e
**ha trovato una violazione vera** — `qr_scans_timeline` era anon-eseguibile
nonostante T-006 la dicesse «solo authenticated» (default-grant Supabase;
corretto con migr. 0003). L'app fa il giro completo (registrazione → QR →
redirect `/r/{short_code}` → timeline). Prossimo: **T-009** (provare `seed.sql`,
scritto+approvato non girato), **T-008** (Confirm email ON pre-lancio).

## Cosa esiste

- **Hardening grant anon (T-007)**: migr. `…02` (RPC `security_anon_surface`
  introspette `pg_catalog`: funzioni anon-EXECUTE non-trigger + tabelle senza RLS;
  grant solo `authenticated`) + `…03` (revoke anon da `qr_scans_timeline` +
  `security_anon_surface`) · `lib/grants.test.ts` **1/1 verde**, whitelist anon
  `{resolve_qr, anonymize_ip}`. Meccanizza L-001.
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
- `.claude/launch.json` — dev via `preview_start name=qr` (:3000). App in `apps/qr/`.

## Cosa NON esiste ancora

- Fixture dev provata (T-009: `seed.sql` scritto+approvato, non ancora eseguito —
  crea utente-dev fuori da git, aggancia QR/scansioni per email), riattivare
  Confirm email pre-lancio (T-008). Gap-filling bucket vuoti timeline e timezone
  locale (oggi UTC) rimandati. Deploy Vercel, dominio redirect (es. `qr.shaer.it`)
  e `NEXT_PUBLIC_SITE_URL` in prod. Metadata `<title>` ancora "Create Next App".

## Note operative

- **Button shadcn** = `@base-ui`: prop **`render={<Link/>}`**, non `asChild`.
- Test su Supabase: email con **MX reali** (`@shaer.it`), non `example.com` (L-002).
  Anon key pubblica → confine = **DB** (RLS/definer), non l'app (L-001, ora
  testata da `grants.test.ts`).
- **Supabase default-privilege**: ogni funzione in `public` nasce con EXECUTE ad
  `anon`; `revoke … from public` NON lo toglie. Per renderla privata si revoca da
  `anon`. `grants.test.ts` lo intercetta.
- Next 16: `proxy.ts`, non `middleware.ts` (hook §7). Cache turbopack sporca →
  `rm -rf .next/dev` + restart. `dynamic(ssr:false)` solo in Client Component.
- Schema: nasce in `supabase/migrations/`, applicato da Nick nel SQL editor.
- La cwd della tool Bash non persiste: path assoluti.
