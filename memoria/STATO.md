# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `3ba6fb6` *(sessione 2026-07-29b)*

## Dove siamo

Sessione 2026-07-29b. Fatto: **SAD F1** (contratto costruibile); **T-028** → F1 in **T-029…T-035**;
**E-D-26** (doc snelliti: PRD archiviato, MDD congelato, 2 fonti vive = DECISIONI+SAD); **E-D-27**
(solvibilità); **motore puro ledger verde** (`e91b64e`, 8/8). La **migrazione DB = RESPINTA dal revisore**
(2 bug: conio dal nulla) → bozza fuori da `migrations/`, piano in `dossier/T-029-ledger-core.md`.
**Prossimo: `Q-MINT`**, poi `ledger_post` transfer-only + anti-scoperto + test DB reale.

## Cosa esiste

- **Fonti vive ecosistema (2)**: `MD/ecosistema/SAD.md` v0.1 (contratto F1) + `memoria/DECISIONI.md`
  (**E-D-01…E-D-27**). `MD/ecosistema/MDD.md` v1.5 = **congelato** (mappa 17 moduli §5 + roadmap §10).
- **`MD/ecosistema/DOMANDE-NICK.md`**: file vivo delle domande aperte (riscritto a ogni giro, git=storico);
  `Q-SOLV` risposto (→E-D-27), ora aperta **`Q-MINT`**. PRD v0.3 archiviato in `Archivio/2026-07-29/` (E-D-26).
- **`MD/modulo-qr/`**: i 5 doc QR invariati. **Modulo 0 (`apps/qr/`)**: invariato, in produzione.
- Memoria personale: `shaer-ecosistema-fase-preparazione`, `shaer-riferimenti-esterni`, `avvisare-prima-di-eseguire`.

## Cosa NON esiste ancora

- **F1 codice**: fatto il motore puro ledger (T-029 p.1/2, 8/8, `e91b64e`). Manca il layer DB (p.2/2:
  migrazione + RPC `ledger_post`, `[N]`). Poi T-030 → T-031 → T-032 → T-033 → T-034/035.
- **Modulo 0 aperti**: T-016 free/pro · T-017 restyling · T-018 editor · T-020 slug · T-022/D · T-024.

## Note operative

- **Riferimenti** (verificati) in memoria `shaer-riferimenti-esterni`. Dominio canonico: `MD/SHAER_MASTER.md`; QR: `MD/modulo-qr/`.
- **Modulo 0 (ancora vero)**: dietro auth non eyeball-abile da Claude (gate = Nick, finché T-024);
  DDL = `[N]` via SQL editor; DB dev `alrguvxspssjwfmtuhdw`. `[N]`: N-f (Stripe) · T-008.
- cwd Bash non persiste: **path assoluti**.
