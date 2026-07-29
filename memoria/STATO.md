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
- **Archiviati** (E-D-26): `Archivio/2026-07-29/` = ex `PRD.md` v0.3 + `DOMANDE-NICK.md` (assorbiti/risolti).
- **`MD/modulo-qr/`**: i 5 doc QR invariati. **Modulo 0 (`apps/qr/`)**: invariato, in produzione.
- Memoria personale: `shaer-ecosistema-fase-preparazione`, `shaer-riferimenti-esterni`, `avvisare-prima-di-eseguire`.

## Cosa NON esiste ancora

- **Tutta F1 (codice)**: T-029 ledger → T-030 RBAC → T-031 TXN → T-032 wallet → T-033 escrow →
  T-034 recensioni → T-035 referral. Niente `apps/shaer/` né `packages/` ancora (li stabilisce T-029).
- **Modulo 0 aperti**: T-016 free/pro · T-017 restyling · T-018 editor · T-020 slug · T-022/D · T-024.

## Note operative

- **Riferimenti** (verificati): `Struttura/Schema/Shaer_it_Simulatore_MVP_v5.html` · `D:\Desktop\Arkés\arkes_dashboard_v3.html`
  · `D:\Desktop\I Damascati\Code\Sito\damascati` (**gemello**, stesso stack Next 16 + Supabase + metodo).
- Dominio economico canonico: `MD/SHAER_MASTER.md`. Il QR resta governato da `MD/modulo-qr/`.
- **Modulo 0 (ancora vero)**: dietro auth non eyeball-abile da Claude (gate = Nick, finché T-024);
  DDL = `[N]` via SQL editor; DB dev `alrguvxspssjwfmtuhdw`. `[N]`: N-f (Stripe) · T-008.
- cwd Bash non persiste: **path assoluti**.
