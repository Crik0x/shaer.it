# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `3ba6fb6` *(sessione 2026-07-29b)*

## Dove siamo

Sessione 2026-07-29b **— SAD scritto + struttura snellita, si passa al codice**. Fatto: **SAD F1**
(`MD/ecosistema/SAD.md` v0.1) = contratto costruibile (schema, RPC, motore puro, AC→test); **T-028**
ha decomposto F1 in **T-029…T-035**. **Lezione + E-D-26**: la cascata MDD→PRD→SAD ripeteva gli stessi
fatti → **PRD archiviato**, **MDD congelato**; **2 fonti vive**: DECISIONI (perché) + SAD (come). Stop
alla prosa in anticipo (requisiti futuri = JIT come test). **Prossimo: costruire T-029 (ledger), test-first.**

## Cosa esiste

- **Fonti vive ecosistema (2)**: `MD/ecosistema/SAD.md` v0.1 (contratto F1) + `memoria/DECISIONI.md`
  (**E-D-01…E-D-26**). `MD/ecosistema/MDD.md` v1.5 = **congelato** (mappa 17 moduli §5 + roadmap §10).
- **`MD/ecosistema/DOMANDE-NICK.md`**: file vivo delle domande aperte (riscritto a ogni giro, git=storico);
  ora porta `Q-SOLV` (solvibilità, sblocca T-029 p.2). PRD v0.3 archiviato in `Archivio/2026-07-29/` (E-D-26).
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
