# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `95aa0f8`

## Dove siamo

Sessione 2026-07-27c **chiusa**. **T-021** (nav landing auth-aware) e **T-023** (selettore periodo
senza scroll-to-top) **chiusi `[A]`**: eyeball di Nick conferma (Dashboard+Esci da loggato; Periodo
senza salto) → REGISTRO, dossier archiviati. **T-022 blocchi A+B fatti e provati**: **A** tabella
`profiles` (migrazione `20260727000001` applicata al DB dev, `profiles.test`+`grants.test` verdi) →
**D-014**; **B** funzioni pure TZ-aware in `lib/dashboard.ts` (`timeZone` default UTC, `safeTimeZone`
fallback, `dashboard.test` **21/21**, revisore ok). Restano **C** (wiring + preferenza dal browser,
chiude il debito `updated_at`) e **D** (toggle Giorno/Ora) — piano pronto nel dossier. Nato **T-024**
(harness SSR-cookie → route Next, 4ª recidiva del muro auth non testabile in-browser).

## Cosa esiste

- **Nav landing auth-aware (T-021, `[A]`)**: `app/_components/site-header.tsx` async, `getUser()` →
  Dashboard + form logout `/auth/signout` da loggato, Accedi/Registrati da anonimo.
- **Selettore periodo senza salto (T-023, `[A]`)**: `scroll={false}` sui Link del periodo in
  `dashboard/page.tsx` e `dashboard/qr/[short_code]/page.tsx` (doc Next `link.md §scroll`).
- **Fondazione profiles (T-022/A, provata)**: `public.profiles` (1:1 auth.users, PK owner_id,
  `timezone` default 'UTC', country, city) + RLS owner-scoped + trigger `on_auth_user_created`
  (`handle_new_user` definer, revoca L-001) + backfill. Test `profiles.test.ts`.
- **Funzioni analitiche TZ-aware (T-022/B, provate)**: `dailyBuckets/hourlyBuckets/hourDayMatrix`
  in `lib/dashboard.ts` con `timeZone` (default UTC) via `Intl`; `safeTimeZone` fallback. 21/21.
- **Dashboard aggregata + singolo QR** (T-014/T-015/T-019), **albero+rollup** (T-012), **landing** (T-011).
- Pre-commit §7–§11 attivo.

## Cosa NON esiste ancora

- **T-022 C/D**: wiring (le pagine leggono `profiles.timezone` e lo passano; foglia client che salva il
  fuso del browser + chiude il debito `updated_at`), toggle Giorno/Ora. Piano in `dossier/T-022-fuso-cliente.md`.
- **T-024** harness verifica auth · **T-016** piano free/pro (Stripe D-011, estende `profiles`) ·
  **T-017** restyling (Arkés D-012) · **T-018** editor QR · **T-020** slug+@tag (consuma T-016).
- **Azioni di Nick `[N]`**: **N-f** chiavi Stripe in Vercel · **T-008** Supabase prod (`↻3`).

## Note operative

- **Comportamento dietro auth non eyeball-abile da Claude** (non crea account / non digita password):
  gate finale = eyeball di Nick, finché T-024 non costruisce l'harness SSR-cookie → route Next.
- **DDL non applicabile da Claude**: `.env.local` ha solo anon key + URL → migrazioni = azione `[N]`
  (SQL editor). Test d'integrazione: `node --test --env-file=.env.local apps/qr/lib/*.test.ts`.
- **profiles.timezone** = IANA (es. 'Europe/Rome'); il dato resta UTC, il display converte (D-013/D-014).
- DB dev `alrguvxspssjwfmtuhdw`, migrazioni 0001…profiles applicate. cwd Bash non persiste: **path assoluti**.
