# Domande a Nick — file vivo

**Come funziona** (deciso 2026-07-29b): qui vivono **solo le domande aperte del giro corrente**,
esaustive, ognuna con **opzioni + conseguenza** e il mio **consiglio**. Tu rispondi inline sotto
`→ Risposta:`. Quando rispondi, promuovo la **decisione** in `../../memoria/DECISIONI.md` (`E-D-NN`,
il perché) e il task in `TODO.md` la consuma. A task chiuso (`/chiusura`) questo file **si riscrive**
con le domande nuove — lo **storico sta nei commit**, non qui (le Q&A passate non si riarchiviano:
il lavoro costruito + git bastano). `TODO.md` parla in codici e **rimanda qui** (es. `Q-SOLV`).

Non è auto-caricato: costa zero contesto d'avvio. È lo spazio ampio dove ragionare; `TODO` resta sintetico.

---

## Q-SOLV · Modello di solvibilità del ledger — sblocca **T-029 parte 2** (RPC `ledger_post`)

**Contesto (già deciso, non si rimette in discussione):** `MD/SHAER_MASTER.md` §1.4 fissa l'invariante
— *riserva € ≥ `purchased` + `earned` circolanti* — e che **solo TREASURY conia**; `promo` non è coperto.
`1 credito = 0,01 € = 1 centesimo`. **Aperto:** *come* si rappresenta la riserva e *cosa* conta come
circolante. Serve prima di scrivere la RPC, perché decide se la solvibilità è un invariante **strutturale**
(impossibile violarlo) o un **controllo** (verificato a ogni movimento).

### Q-SOLV.1 — Dove vive la «riserva €», e come la si garantisce?

- **a) Nel ledger, verificata a ogni movimento.** Un conto (es. `SHAER_SETTLEMENT`) porta il € reale in
  centesimi, alimentato dai versamenti; la RPC `ledger_post` **rifiuta** ogni movimento che lascerebbe
  riserva < circolante coperto. *Conseguenza:* tutto derivato dal ledger, invariante testabile con una
  query; serve un journal a ogni entrata €.
- **b) Fuori dal ledger.** Il € vive in Stripe/banca; la RPC legge la riserva da un numero esterno.
  *Conseguenza:* più semplice subito, ma l'invariante dipende da un dato **non garantito dal ledger** —
  è più debole, e contraddice «il confine è il DB» (L-001).
- **c) Per costruzione (il più forte).** Coniare `purchased`/`earned` è ammesso **solo** dentro un journal
  che registra **contestualmente** il € in entrata (posting su `SETTLEMENT`). Così *riserva ≥ backed* è
  **automatica**, non un check: non esiste proprio lo stato in cui manca la copertura. *Conseguenza:* un
  po' più rigido al conio (ogni mint porta con sé il suo €), ma l'anti-frode diventa strutturale.

→ **Consiglio:** **c** (solvibilità per costruzione — è la più coerente con «un QR non si rompe mai» /
regola 7 applicata al denaro). Se preferisci poter coniare e riconciliare dopo, allora **a**.
→ **Risposta:** 

### Q-SOLV.2 — Cosa conta come «circolante da coprire»?

- **a) Solo i conti utente** (`purchased`+`earned` in mano agli utenti).
- **b) Utenti + `ESCROW` held** (anche il bonus bloccato ma promesso è una passività reale da coprire).

→ **Consiglio:** **b** — un bonus in escrow è denaro che la piattaforma dovrà onorare; coprirlo da subito
è più prudente e coerente con E-D-16 (circuito chiuso: spendibile solo con € versati).
→ **Risposta:** 

### Q-SOLV.3 — In F1 closed-loop (E-D-23, niente off-ramp) l'invariante è strict da subito?

- **a) Sì, strict subito.** Il ledger nasce già pronto per quando arriverà il prelievo €.
- **b) Rilassato in F1.** Nessun € esce ora, quindi si rimanda la copertura piena.

→ **Consiglio:** **a** — costa quasi nulla tenerlo strict ora, ed è l'invariante che dà valore al ledger;
rilassarlo significherebbe ricostruirlo dopo (e riaprire codice del denaro).
→ **Risposta:** 
