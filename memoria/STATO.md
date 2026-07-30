# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `266fffa` *(sessione 2026-07-30 parte 3)*

## Dove siamo

Sessione 2026-07-30 (parte 3). Due cose: **① metodo ottimizzato** (commit `0289e20`) — costo fisso
**7969→7113 token (−11%)**: A1 dedup CLAUDE↔lavoro, A2 sezioni d'avvio in `RIPRESA.md` (non auto-caricato),
A3 TODO a riga secca, B2 chiusura leggera se il diff non tocca produzione e nessun dossier è C, C testimone
25%→30%. **② T-031 TXN engine — fetta 1/2 `[x]`** (commit `266fffa`): motore puro FSM `packages/core-ledger/
txn.ts`, **11/11 test** (36 coppie esaustive) + `tsc` pulito + **revisore approvato**.

**Prossimo:** T-031 fetta 2/2 (migrazione `transactions`/`transaction_events` + RPC definer + integration
test). **PRIMA serve una decisione di Nick**: la FSM è adiacenza-stretta vs monotòna-forward → `D-NNN`
(dossier T-031, riquadro). Piano pronto in `dossier/T-031-txn-engine.md`.

## Cosa esiste

- **TXN FSM puro (T-031 fetta 1/2)**: `packages/core-ledger/txn.ts` — `canTransition`/`nextStates`/
  `isTerminal`/`canAppendEvent`. `txn.test.ts` 11/11. Confine puro/DB onesto (append-only = policy DB, L-011).
- **Ledger F1**: `packages/core-ledger/ledger.ts` 8/8 + migrazione `20260729000001` applicata + `apps/qr/lib/ledger.test.ts` 4/4. Anti-frode provato (E-D-27/28); L-011 → test.
- **RBAC F1**: `packages/core-rbac` 10/10 + migrazione `20260730000001` applicata + `apps/qr/lib/grants.test.ts` **9/9** sul DB reale. admins elevabile/multi-admin, user_roles ≤3, permissions, maker-checker multisig, RLS finestra ADMIN, 5 definer.
- **Modulo 0 (`apps/qr/`)**: in produzione (QR albero, scan, analytics, auth, profiles); landing simulatore §5.4.
- **Fonti vive**: `MAPPA.md` (atlante) · `SAD.md` · `DECISIONI.md` (E-D-01…33, D-015/016/017) · `MODULO-7-GESTIONALE.md`. `MDD.md` congelato.

## Cosa NON esiste ancora

- **TXN DB (T-031 fetta 2/2)**: tabelle `transactions`/`transaction_events` + FK su `ledger_journal.transaction_id` (nullable, predisposta) + RPC definer `txn_transition`/`txn_append_event` + integration test + estensione `grants.test`. È DDL → `[N]` per l'applicazione.
- **Gestionale G1**: T-042 (schema money-ready OFF) → T-043 (CRUD). Consumano T-030 (verify-gate).
- **F1 sul tronco TXN**: T-032 wallet, T-033 escrow, T-034 recensioni, T-035 referral — tutti consumano T-031.
- **Modulo 0 aperti**: T-016/017/018/020/024 · T-037/039/040/041.

## Note operative

- Domini: `MD/ecosistema/MAPPA.md` (atlante) · `MD/SHAER_MASTER.md` · `MD/modulo-qr/` · `MODULO-7-GESTIONALE.md`.
- DDL = `[N]` via SQL editor, DB dev `alrguvxspssjwfmtuhdw`. `[N]` pendenti: service key ledger · T-008.
- Test puri: `node --test packages/core-ledger/<file>.test.ts`. Test DB reali: `node --test --env-file=apps/qr/.env.local apps/qr/lib/<file>.test.ts` (`--env-file` relativo al cwd).
- Untracked non committati (chiedere se versionare): `Struttura/appadmin.html`, `prenotazioni.html`. Booking → Sprint 3.
