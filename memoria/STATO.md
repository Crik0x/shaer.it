# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `73930cf` *(sessione 2026-07-29c)*

## Dove siamo

Sessione 2026-07-29c. **Pivot Modulo 0 sul QR operativo §5.4**. Provato: **T-038** (simulatore + `lib/bonus.ts`
4/4). Scritto `[~]`: **T-036** (signup Confirm-safe, dip. T-008) + **T-029a** (migrazione ledger transfer-only
+ anti-scoperto universale + test anti-exploit — `[~]` finché Nick non applica). Deciso: **D-015** (dashboard
Shaer.it dentro `apps/qr`) · **D-016** (prima il ledger F1) · **D-017** (mappa = demo + editor gated verificato).
Scope aperto: T-037/039/040/041. Prossimo: applicare la migrazione ([N]) → test verde → T-029 `[x]`.

## Cosa esiste

- **Fonti vive ecosistema (2)**: `MD/ecosistema/SAD.md` v0.1 + `DECISIONI.md` (**E-D-01…28, D-015/016/017**).
  `MD/ecosistema/MDD.md` v1.5 = **congelato**. `DOMANDE-NICK.md`: `Q-SOLV`+`Q-MINT` risposti (E-D-27/28).
- **Modulo 0 (`apps/qr/`)**: in produzione; landing ora col simulatore operativo §5.4 (T-038). `MD/modulo-qr/` invariati.
- Memoria personale: `shaer-ecosistema-fase-preparazione`, `shaer-riferimenti-esterni`, `avvisare-prima-di-eseguire`.

## Cosa NON esiste ancora

- **F1 codice**: motore puro (`e91b64e`, 8/8) + **T-029a scritto** (migrazione+test, revisore ok) — manca l'**apply `[N]`**.
  Poi T-030→T-031→(guardia)→T-032→T-033→T-034/035.
- **Modulo 0 aperti**: T-016 free/pro · T-017 restyling · T-018 editor · T-020 slug · T-022/D · T-024 · T-037/039/040/041 (§5.4).

## Note operative

- Dominio: `MD/SHAER_MASTER.md`; QR: `MD/modulo-qr/`; riferimenti esterni in memoria omonima.
- Modulo 0 dietro auth non eyeball-abile (gate=Nick fino a T-024). DDL=`[N]` via SQL editor, DB dev `alrguvxspssjwfmtuhdw`.
  **`[N]` pendenti**: applicare migrazione ledger (chiude T-029a) · T-008. Stripe `pk`+`sk` su qr (N-f fatto). Path assoluti (cwd Bash non persiste).
