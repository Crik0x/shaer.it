# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `3b781cf`

## Dove siamo

Il 25/07 sono entrati **T-007** (hardening grant anon), **T-009** (seed provato) e
**T-010** (deploy). **L'app è ONLINE su `https://qr.shaer.it`**: giro completo
registrazione → QR → redirect → timeline. Poi **L-002 ritirata** (email vere nei
test = abitudine). Prossimo: **T-008** (`↻1`, azione dashboard di Nick — codice
pronto) e lo **scan reale dal telefono**.

## Cosa esiste

- **Produzione (T-010)**: `apps/qr` online → `https://qr.shaer.it` (Vercel, repo
  `github.com/Crik0x/shaer.it`, Root Dir `apps/qr`, 3 env `NEXT_PUBLIC_*` su
  Production). Fix build L-003 (client browser negli handler).
- **Fixture dev (T-009)**: `supabase/seed.sql` provato (3 QR + 6 scansioni),
  utente-dev fuori da git, idempotente.
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
- **Generatore QR (T-005)**: `lib/short-code.ts` (base62, 5/5) · `lib/qr.ts` ·
  `qr/actions.ts` (`createQr`: owner_id+retry 23505) · `qr/new`, `qr/[short_code]`
  (designer/download) · `dashboard` (lista). Dep: `qrcode`. RLS test 1/1.
- **Auth + dashboard (T-004)**: `supabase-server.ts`/`-browser.ts` · `proxy.ts`
  (protegge `/dashboard`, esclude `/r/*`) · `login`, `auth/{callback,signout}` ·
  `auth.test.ts` 1/1. Dep: `@supabase/ssr`.
- **Redirect (T-003)**: `app/r/[short_code]/route.ts` · `lib/scan.ts` (test 6/6) ·
  `lib/supabase-public.ts` (anon). **Schema (T-002)**: migr. `qr_codes`/`qr_scans`
  (owner_id, RLS, trigger immut., `resolve_qr`+`anonymize_ip`).
- DB Supabase `alrguvxspssjwfmtuhdw`. Dev: Email provider ON + Confirm email OFF.
- `.claude/launch.json` — dev via `preview_start name=qr` (:3000). App in `apps/qr/`.

## Cosa NON esiste ancora

- Confirm email ON pre-lancio + `qr.shaer.it/auth/callback` nei Redirect URLs
  Supabase (T-008). Scan reale end-to-end dal telefono su `qr.shaer.it` (atteso
  ok, non ancora provato). Gap-filling bucket vuoti timeline e timezone locale
  (oggi UTC) rimandati. Shaer MVP (`apps/shaer`) e `packages/` condivisi: futuri
  (D-005). Preview deploy: le env sono anche su Preview, ok.

## Note operative

- **Button shadcn** = `@base-ui`: prop **`render={<Link/>}`**, non `asChild`.
- Test su Supabase: email con **MX reali** (`@shaer.it`), non `example.com`
  (abitudine — era L-002, ritirata il 25/07).
  Anon key pubblica → confine = **DB** (RLS/definer), non l'app (L-001, ora
  testata da `grants.test.ts`).
- **Supabase default-privilege**: funzione `public` nasce EXECUTE ad `anon`; per
  renderla privata si revoca da `anon`, non da `public` (L-001, `grants.test.ts`).
- Next 16: `proxy.ts`, non `middleware.ts` (hook §7). Cache turbopack sporca →
  `rm -rf .next/dev` + restart. `dynamic(ssr:false)` solo in Client Component.
- Schema: nasce in `supabase/migrations/`, applicato da Nick nel SQL editor.
- La cwd della tool Bash non persiste: path assoluti.
