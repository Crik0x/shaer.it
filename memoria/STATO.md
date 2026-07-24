# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `e04fdb0`

## Dove siamo

Esiste la prima riga di codice applicativo. Il 24/07 sono entrati **T-001, T-002,
T-003**: app Next.js 16 scaffoldata in `apps/web/`, progetto Supabase reale con
schema QR Platform (RLS multi-tenant, `SECURITY DEFINER`), e il **cuore** —
redirect dinamico `/r/[short_code]` che risolve dal DB, logga la scansione (IP
anonimizzato **lato DB**) e fa 302. Provato end-to-end. Prossimo: **T-004** (Auth
+ scheletro dashboard).

## Cosa esiste

- `apps/web/` — Next 16.2.11, TS, Tailwind v4, App Router, shadcn/ui. `.env.local`
  con URL + anon key Supabase (gitignored). Test via `node --test` (zero runner).
- `apps/web/app/r/[short_code]/route.ts` — il redirect · `apps/web/lib/scan.ts`
  (+ `scan.test.ts`, 6/6) · `apps/web/lib/supabase-public.ts` (client anon server).
- `supabase/migrations/20260724000001_qr_platform_initial.sql` — schema live:
  `qr_codes`, `qr_scans` (append-only, owner_id, RLS), trigger immutabilità
  `short_code`, `resolve_qr` + `anonymize_ip` (definer).
- DB Supabase `alrguvxspssjwfmtuhdw` con utente di test `seed@shaer.it` e QR
  `demo123` → `https://example.com`.
- `MD/QR_PLATFORM.md` (prodotto), `MD/SHAER_MASTER.md` (dominio Shaer, per dopo),
  `MD/SAAS_BUILD_PLAN_V1.md` (riferimento tecnico).
- `Struttura/Schema/0001_initial_schema.sql` — vecchio dominio Shaer, **non** per
  la QR Platform.

## Cosa NON esiste ancora

- Auth utente + dashboard (T-004), generatore QR (T-005), analytics UI (T-006),
  hardening grant/seed (T-007). Deploy Vercel, dominio redirect (es. `qr.shaer.it`).

## Note operative

- Aprire la sessione **dentro** `D:\Desktop\Shaer.it`.
- Ogni modifica di schema nasce come file in `supabase/migrations/`, **mai** solo
  dal SQL editor (T-002 era «fatto» ma lo schema non esisteva: buco carta↔realtà).
- Con anon key pubblica il confine di sicurezza è il **DB** (RLS/definer), non
  l'app — vedi `LEZIONI.md` L-001.
- Server dev da riusare, mai due `next dev`. La cwd della tool Bash non persiste:
  usare path assoluti. Hook attivo via `core.hooksPath scripts/git-hooks`.
