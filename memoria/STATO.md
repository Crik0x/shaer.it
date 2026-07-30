# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `8712516` *(sessione 2026-07-31; il prossimo `/apertura` la aggiorna)*

## Dove siamo

Sessione 2026-07-31. Tre cose: **① rename `apps/qr`→`apps/web`** (commit `5373a7f`) — l'app Next è
*la piattaforma Shaer.it*, il QR è il Modulo 0; tsc + grants 9/9 + `next build` verdi. **② T-024 harness
auth SSR-cookie→route CHIUSO** (`8e2abc0`) — `apps/web/lib/dashboard-auth.test.ts` 1/1: rompe il muro
«auth non testabile» (4ª recidiva) facendo codificare il cookie alla libreria in un jar in memoria.
**③ T-017 restyling dashboard `[~]`** — shell arkes (sidebar 240px + main) coi token del design system +
le sei breakdown in una griglia unica; `next build` verde, il pixel-shot resta al solo occhio di Nick.

**Prossimo:** T-017 chiude col tuo ok visivo (`npm run dev`, `/dashboard`); poi T-016 (piano free/pro +
Stripe — **[N] chiavi tue**) → T-020 (slug, consuma T-016). Sequenza pronta in `RIPRESA.md`.

## Cosa esiste

- **Harness auth (T-024)**: `apps/web/lib/dashboard-auth.test.ts` 1/1 — prova qualunque route protetta
  senza browser reale (cookie SSR via jar-libreria). Riuso pronto per T-016/T-020/T-039.
- **Dashboard restyle (T-017 `[~]`)**: shell sidebar `apps/web/app/dashboard/dashboard-shell.tsx`
  (foglia client) + layout Server Component; `next build` verde, visivo in attesa di Nick.
- **TXN FSM puro (T-031 fetta 1/2)**: `packages/core-ledger/txn.ts`, `txn.test.ts` 11/11.
- **Ledger F1**: `packages/core-ledger/ledger.ts` 8/8 + `apps/web/lib/ledger.test.ts` 4/4 (L-011).
- **RBAC F1**: `packages/core-rbac` 10/10 + `apps/web/lib/grants.test.ts` 9/9 sul DB reale.
- **Modulo 0 (`apps/web/`)**: in produzione (QR albero, scan, analytics, auth, profiles).
- **Fonti vive**: `MAPPA.md` · `SAD.md` · `DECISIONI.md` (…D-017) · `MODULO-7-GESTIONALE.md`.

## Cosa NON esiste ancora

- **TXN DB (T-031 fetta 2/2)**: tabelle `transactions`/`transaction_events` + RPC definer + integration
  test. È DDL → `[N]`. **PRIMA** la decisione FSM adiacenza-stretta vs monotòna-forward → `D-NNN`.
- **Gestionale G1**: T-042 (schema money-ready OFF) → T-043 (CRUD). Consumano T-030.
- **F1 sul tronco TXN**: T-032 wallet, T-033 escrow, T-034 recensioni, T-035 referral — consumano T-031.
- **Modulo 0 aperti**: T-016/018/020 · T-037/039/040/041.

## Note operative

- Domini: `MD/ecosistema/MAPPA.md` · `MD/SHAER_MASTER.md` · `MD/modulo-qr/` · `MODULO-7-GESTIONALE.md`.
- DDL = `[N]` via SQL editor, DB dev `alrguvxspssjwfmtuhdw`. **`[N]` pendenti: T-008 (prod) · Vercel Root
  Directory → `apps/web`** (senza, il prossimo deploy non trova l'app).
- Test puri: `node --test packages/core-ledger/<file>.test.ts`. Test DB/HTTP: `node --test
  --env-file=apps/web/.env.local apps/web/lib/<file>.test.ts` (cwd = `apps/web`; l'harness auth vuole
  anche il dev server acceso su :3000).
- Untracked non committati (chiedere se versionare): `Struttura/appadmin.html`, `prenotazioni.html`.
