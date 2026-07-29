---
task: T-029
tier: C
titolo: Ledger core — motore puro + layer DB (partita doppia, solvibilità)
aree: [ledger, denaro, partita-doppia, solvibilità, escrow, rls, definer, sicurezza]
stato: aperto
riporti: 0
sessioni: [2026-07-29b]
---

## Obiettivo
La fondazione economica dell'ecosistema: partita doppia, 6 conti, saldo derivato, unico writer
definer, solvibilità. È irreversibile → prima di tutto (§4). Fatto quando i due layer (puro + DB)
sono verdi con test, incluso il rifiuto degli exploit.

## Accertato (prove)
- **Parte 1/2 — motore puro FATTA** (commit `e91b64e`, **8/8 verdi** incl. 2 fuzz da 2000 iter.):
  `packages/core-ledger/ledger.ts` = `isBalanced` (somma-zero **per classe**, interi, vuoto rifiutato →
  AC-EE3.1) + `checkSolvency` (AC-EE3.3). Revisore: approvato. AC-EE3.2 correttamente **non** nel puro
  (esige il tipo di conto → vive nel DB).
- **Decisione E-D-27** (solvibilità per costruzione, escrow incluso, strict) promossa in `DECISIONI.md`
  dalle risposte a `Q-SOLV`.

## Parte 2/2 — layer DB: BOZZA RESPINTA (non applicata)
Bozza in **`dossier/T-029-ledger-core.draft.sql`** (spostata **fuori** da `supabase/migrations/` così
non si applica per sbaglio). Tabelle `accounts`/`ledger_journal`/`ledger_postings` + RLS + revoke: **OK**.
La RPC `ledger_post` ha un **trust model sbagliato** — 2 bug critici (revisore 2026-07-29b, gravità 5):

1. **`p_kind` auto-dichiarato** (riga ~46/154). Nessun `CHECK`, nessuna attestazione € reale dietro
   `kind in ('purchase','deposit')`. Exploit: un `authenticated` legge l'id di TREASURY (RLS lo espone) e
   chiama `ledger_post('purchase', null, [{TREASURY, purchased, -N},{me, purchased, +N}])` → conia N crediti
   backed **dal nulla**. Il layer pagamenti (Stripe/N-f) **non esiste** ancora: l'attestazione non ha una fonte.
2. **Gate solo su TREASURY** (riga ~148). Manca l'**anti-scoperto**: qualsiasi conto ≠ TREASURY (system o
   utente) può andare negativo nei backed purché la somma-zero chiuda → conio da SETTLEMENT/conto utente.
   L'assert di solvibilità (riga ~167) è una **tautologia**: con somma-zero globale `reserve==backed` sempre,
   quindi non scopre mai lo sbilancio da conto non-TREASURY.
3. (gravità 4) **Nessun test copre l'autorità DB**: il puro è testato, la RPC no. SAD §4/§8 lo esige
   (regola 5, L-007). Manca l'estensione di `grants.test.ts` ai grant DML delle nuove tabelle (L-001).
4. (minori) temp table `_post on commit drop` rompe a 2ª chiamata nella stessa txn; guard NULL su
   amount/class valutano NULL non TRUE (salvati a valle dal NOT NULL). Dettaglio nel JSON del revisore.

## Il modello corretto (piano pronto)
La radice: **coniare ≠ trasferire**, e in F1 il conio backed **non ha una fonte € fidata** (Stripe non c'è).
Quindi il trust boundary va spezzato:

- **`ledger_post` (grant `authenticated`) = SOLO movimenti di crediti ESISTENTI.** Invariante nuovo e
  centrale: **anti-scoperto** — dopo il journal, il saldo backed di **ogni** conto (TREASURY incluso) resta
  **≥ 0**. Questo uccide entrambi gli exploit: nessun conto conia (nessuno va negativo), inclusa TREASURY.
  Copre transfer utente→utente, spese, escrow hold/release di crediti già esistenti.
- **Conio backed** (TREASURY negativo) = **RPC separata callable solo da `service_role`**, dietro un fatto
  DB verificato (riga `payments` con stato confermato dal webhook Stripe). → **Q-MINT risposto (E-D-28)**:
  modello ricarica→spesa→settlement, anti-scoperto confermato; **chiavi Stripe già su Vercel** (conio non più
  lontano). Resta un **task nuovo** (RPC ricarica dietro webhook), fuori da T-029a. Payout € al commerciante
  = off-ramp business, modellato JIT col settlement (E-D-28, nota aperta).
- **Conio promo** (ADV negativo) = stessa logica: privilegiato, dietro budget campagna autorizzato (T-035).
- `ledger_journal.kind` → aggiungere `CHECK` sull'enum (chiudere il text libero).
- **Prova** (regola 5, prima di far applicare a Nick): test d'integrazione SQL su DB reale che *tenta gli
  exploit* e li vede **rifiutati** (conio da TREASURY via authenticated → negato; overdraft da SETTLEMENT →
  negato; INSERT diretto → negato) + estensione `grants.test.ts` ai grant DML. Il test è la lezione (→ test).

## Sequenza rivista
T-029 resta **prima di tutto**, ma si sdoppia: **T-029a** = `ledger_post` transfer-only + anti-scoperto +
test DB reale (fattibile ora, chiude la fondazione sicura). **Conio backed** = task nuovo legato al layer
pagamenti (dopo N-f), **non** blocca T-030/031 (che muovono crediti esistenti / non coniano).

## Attriti
- **RPC che fida un parametro auto-dichiarato come attestazione.** `ledger_post` accettava `p_kind`
  ('purchase'/'deposit') dal chiamante come prova di un incasso € reale → **causa**: nessuna fonte di
  verità DB dietro il kind (Stripe non integrato) → **risolto**: split conio/trasferimento, conio dietro
  RPC `service_role` + fatto verificato (E-D-28) → **prevenibile?** sì: test d'integrazione che *tenta*
  l'exploit e lo vede rifiutato (T-029a, da scrivere).
- **Gate d'invariante scoped a un conto esemplare invece che universale.** L'anti-conio guardava solo
  TREASURY → ogni altro conto poteva andare negativo (conio) → **risolto in piano**: anti-scoperto su
  **ogni** conto → **prevenibile?** sì, stesso test d'exploit. Colto dal revisore prima del commit.

## Composizione
**Stabilisce**: gli invarianti del denaro (somma-zero, anti-scoperto), il pattern definer-unico-writer,
`packages/core-ledger`, lo split conio/trasferimento. **Consuma**: nulla (fondazione). La lezione dei 2 bug
→ `LEZIONI.md` quando il test d'integrazione che li blocca sarà verde (conversione `→ test`).
