# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `a4959ec` *(sessione 2026-07-28 partita senza `/apertura`: la prossima la ri-fissa)*

## Dove siamo

Sessione 2026-07-28 **chiusa — pivot d'ecosistema**. Shaer.it non è la QR Platform: è la
**super-piattaforma unica**, il QR è il **Modulo 0**. Fatto (solo documentazione, **nessun
codice di produzione toccato**): **`MD/` ristrutturato** (`ecosistema/` sopra, `modulo-qr/`
per i doc QR spostati con `git mv`, link `../` corretti); **MDD di ecosistema** completo
(`MD/ecosistema/MDD.md` v1.3 — 14 §, 17 moduli, roadmap a blocchi §10, decisioni
**E-D-01…E-D-16**); **PRD di ecosistema** posato come skeleton (`MD/ecosistema/PRD.md` v0.1,
epiche EE1…EE14). Aperti **T-025** (riempi PRD), **T-026** (SAD), **T-027** (promuovi E-D in
DECISIONI.md), **T-028** (analisi + blocchi). Zero task chiusi, zero `[x]`. Piano pronto in
`dossier/T-025-ecosistema-fondazione.md` e nel prompt di TODO.

## Cosa esiste

- **`MD/ecosistema/MDD.md` v1.3**: attori (…+ **TRANSPORTER**, periferici FORNITORE/
  COMMERCIALISTA/DIPENDENTE); rete a **2 livelli** (referral mono-livello + MLM-as-a-service
  parametrico); economia crediti; ecosistema componibile (magazzino/riordino/presenze/export);
  **QR operativo** con **bonus in escrow a circuito chiuso**; pannello unico **RBAC admin-first
  + maker-checker**; wishlist/crowdfunding (da subito); tracciabilità trasporto; compartimentazione.
- **`MD/ecosistema/PRD.md` v0.1**: skeleton EE1…EE14 con stato/blocco.
- **`MD/modulo-qr/`**: i 5 doc QR, invariati salvo link. **Modulo 0 (`apps/qr/`)**: invariato.
- Memoria personale: `shaer-ecosistema-fase-preparazione`, `shaer-riferimenti-esterni`.

## Cosa NON esiste ancora

- **PRD pieno** (T-025) · **SAD** (T-026: ledger partita doppia, TXN, escrow, RBAC, **parametri
  ③ ibrido**) · **E-D promosse** in `DECISIONI.md` (T-027) · **analisi a blocchi** (T-028) · **F1**.
- Nodi aperti (MDD §13): architettura parametri ③, **dashboard cliente**, privacy tracking trasporto.
- **Modulo 0 aperti**: T-016 free/pro · T-017 restyling · T-018 editor · T-020 slug · T-022/D · T-024.

## Note operative

- **Riferimenti** (verificati): `Struttura/Schema/Shaer_it_Simulatore_MVP_v5.html` · `D:\Desktop\Arkés\arkes_dashboard_v3.html`
  · `D:\Desktop\I Damascati\Code\Sito\damascati` (**gemello**, stesso stack Next 16 + Supabase + metodo).
- Dominio economico canonico: `MD/SHAER_MASTER.md`. Il QR resta governato da `MD/modulo-qr/`.
- **Modulo 0 (ancora vero)**: comportamento dietro auth non eyeball-abile da Claude (gate = Nick, finché
  T-024); DDL non applicabile da Claude (migrazioni = `[N]` via SQL editor); DB dev `alrguvxspssjwfmtuhdw`;
  test integrazione `node --test --env-file=.env.local apps/qr/lib/*.test.ts`. `[N]`: N-f (Stripe) · T-008.
- cwd Bash non persiste: **path assoluti**.
