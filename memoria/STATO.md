# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `b52bf00` *(sessione 2026-07-30)*

## Dove siamo

Sessione 2026-07-30. **T-029 ledger `[x]`** e **T-030 RBAC `[x]`** chiusi con prova. T-030: migrazione
`20260730000001_rbac.sql` applicata (Nick) + **DB-test 7/7 sul DB reale** (admin-first, verify-gate,
maker-checker **multisig**). Decise **E-D-31/32/33** (pannello routa per ruolo · profili ADMIN/UTENTE/
BUSINESS+sotto-tipi · ADMIN elevabile+multi-admin+multisig). Nuovi file: **`MAPPA.md`** (atlante trasversale)
+ **`futuro/`** (parcheggio meta). **Prossimo bivio** (entrambi consumano T-030): **T-031** (TXN engine, tronco F1)
o **T-042** (schema gestionale G1). Prompt pronto in `TODO.md`.

## Cosa esiste

- **Ledger F1**: `packages/core-ledger` 8/8 + migrazione `20260729000001` applicata + `apps/qr/lib/ledger.test.ts` 4/4. Anti-frode provato (E-D-27/28); L-011 → test.
- **RBAC F1**: `packages/core-rbac` 10/10 + migrazione `20260730000001` applicata + `apps/qr/lib/grants.test.ts` 7/7 sul DB reale. admins elevabile/multi-admin, user_roles ≤3, permissions, maker-checker multisig, RLS finestra ADMIN, 5 definer.
- **Modulo 0 (`apps/qr/`)**: in produzione (QR albero, scan, analytics, auth, profiles); landing simulatore §5.4.
- **Fonti vive**: `MAPPA.md` (atlante) · `SAD.md` · `DECISIONI.md` (E-D-01…33, D-015/016/017) · `MODULO-7-GESTIONALE.md`. `MDD.md` congelato. `DOMANDE-NICK` senza domande aperte.

## Cosa NON esiste ancora

- **TXN engine (T-031)**: FSM + tabella `transactions` + FK su `ledger_journal.transaction_id` (nullable, predisposta). Tronco a cui appendono wallet/escrow/recensioni/referral.
- **Gestionale G1**: T-042 (schema money-ready OFF) → T-043 (CRUD). Consumano T-030 (verify-gate).
- **Modulo 0 aperti**: T-016/017/018/020/024 · T-037/039/040/041. **CRM/dati** (E-D-30): `consents`+abbonamento = task post-TXN.
- **Agente architetto/PM**: spec pronta in `futuro/agente-architetto-pm.md` (da costruire quando serve).

## Note operative

- Domini: `MD/ecosistema/MAPPA.md` (atlante) · `MD/SHAER_MASTER.md` · `MD/modulo-qr/` · `MODULO-7-GESTIONALE.md`.
- DDL = `[N]` via SQL editor, DB dev `alrguvxspssjwfmtuhdw`. `[N]` pendenti: service key ledger · T-008.
- Test DB reali: `node --test --env-file=apps/qr/.env.local apps/qr/lib/<file>.test.ts` (`--env-file` relativo al cwd).
- Untracked non committati (chiedere se versionare): `Struttura/appadmin.html`, `prenotazioni.html`. Booking → Sprint 3. Path assoluti (cwd Bash non persiste).
