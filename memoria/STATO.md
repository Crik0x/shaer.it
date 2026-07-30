# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `b52bf00` *(sessione 2026-07-30)*

## Dove siamo

Sessione 2026-07-30. **T-029 ledger `[x]`** (DB-test 4/4: 2 exploit + INSERT rifiutati; migrazione applicata).
**T-030 RBAC avviato**: motore puro `packages/core-rbac` 10/10 — resta migrazione + 2 RPC definer + grants.test
(`[N]`). **Intake gestionale** (Modulo 7) → `MD/ecosistema/MODULO-7-GESTIONALE.md`. Deciso **E-D-29** (RBAC 3
piani: admin superuser · sensibili admin-first · operativi al titolare) + **E-D-30** (dati = consenso × abbonamento).
Nuovi: **T-042** (schema G1) + **T-043** (CRUD admin). Prossimo: migrazione T-030 (`dossier/T-030-rbac.md`).

## Cosa esiste

- **Ledger F1**: `packages/core-ledger` 8/8 + migrazione `20260729000001` applicata + `apps/qr/lib/ledger.test.ts` 4/4. Anti-frode provato (E-D-27/28); L-011 convertita a test.
- **RBAC motore puro**: `packages/core-rbac` (`canAssign`/`approverLimit`/`roleConflictOnTxn`) 10/10.
- **Modulo 0 (`apps/qr/`)**: in produzione (QR albero, scan, analytics, auth, profiles); landing simulatore §5.4.
- **Fonti vive**: `SAD.md` + `DECISIONI.md` (E-D-01…30, D-015/016/017) + `MODULO-7-GESTIONALE.md`. `MDD.md` congelato. `DOMANDE-NICK` senza domande aperte.

## Cosa NON esiste ancora

- **T-030 layer DB**: migrazione `user_roles`+`permissions`+`work_*` + RPC `assign_permission`/`approve_pending` + grants.test. Piano pronto → `[N]`. Sblocca T-031/T-042.
- **Gestionale G1**: T-042 (schema money-ready OFF) → T-043 (CRUD). Consumano T-030.
- **Modulo 0 aperti**: T-016/017/018/020/024 · T-037/039/040/041. **CRM/dati** (E-D-30): `consents`+abbonamento = task post-TXN.

## Note operative

- Domini: `MD/SHAER_MASTER.md` · `MD/modulo-qr/` · `MD/ecosistema/MODULO-7-GESTIONALE.md`.
- DDL = `[N]` via SQL editor, DB dev `alrguvxspssjwfmtuhdw`. `[N]` pendenti: service key ledger · T-008.
- Untracked non committati (riferimento, chiedere se versionare): `Struttura/appadmin.html`, `prenotazioni.html`. Booking: prototipo Nick → Sprint 3. Path assoluti (cwd Bash non persiste).
