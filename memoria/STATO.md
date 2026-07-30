# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `b52bf00` *(sessione 2026-07-30)*

## Dove siamo

Sessione 2026-07-30. **T-029 ledger `[x]`**. **T-030 RBAC `[~]`**: motore 10/10 + migrazione
`20260730000001_rbac.sql` **scritta+revisore-approvata** (admins elevabile/multi-admin, user_roles ≤3, permissions,
maker-checker **multisig**, RLS finestra ADMIN, 5 definer) + grants.test +6. **Resta `[N]` apply**. Decise
**E-D-31/32/33** (pannello routa per ruolo · profili ADMIN/UTENTE/BUSINESS+sotto-tipi · ADMIN elevabile+multi-admin+
maker-checker a soglia). Nuovi: `MAPPA.md` + `futuro/`. Dopo l'apply: T-031 o T-042.

## Cosa esiste

- **Ledger F1**: `packages/core-ledger` 8/8 + migrazione `20260729000001` applicata + `apps/qr/lib/ledger.test.ts` 4/4. Anti-frode provato (E-D-27/28); L-011 convertita a test.
- **RBAC motore puro**: `packages/core-rbac` (`canAssign`/`approverLimit`/`roleConflictOnTxn`) 10/10.
- **Modulo 0 (`apps/qr/`)**: in produzione (QR albero, scan, analytics, auth, profiles); landing simulatore §5.4.
- **Fonti vive**: `SAD.md` + `DECISIONI.md` (E-D-01…30, D-015/016/017) + `MODULO-7-GESTIONALE.md`. `MDD.md` congelato. `DOMANDE-NICK` senza domande aperte.

## Cosa NON esiste ancora

- **T-030 layer DB — scritto+approvato, non applicato**: migrazione + grants.test pronti; `[N]` apply → DB-test verdi. Sblocca T-031/T-042/T-043.
- **Gestionale G1**: T-042 (schema money-ready OFF) → T-043 (CRUD). Consumano T-030.
- **Modulo 0 aperti**: T-016/017/018/020/024 · T-037/039/040/041. **CRM/dati** (E-D-30): `consents`+abbonamento = task post-TXN.

## Note operative

- Domini: `MD/SHAER_MASTER.md` · `MD/modulo-qr/` · `MD/ecosistema/MODULO-7-GESTIONALE.md`.
- DDL = `[N]` via SQL editor, DB dev `alrguvxspssjwfmtuhdw`. `[N]` pendenti: service key ledger · T-008.
- Untracked non committati (riferimento, chiedere se versionare): `Struttura/appadmin.html`, `prenotazioni.html`. Booking: prototipo Nick → Sprint 3. Path assoluti (cwd Bash non persiste).
