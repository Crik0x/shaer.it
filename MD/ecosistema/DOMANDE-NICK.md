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
→ **Risposta:** C. da considerare che anche Shaer.it può distribuire e creare SHAER,

### Q-SOLV.2 — Cosa conta come «circolante da coprire»?

- **a) Solo i conti utente** (`purchased`+`earned` in mano agli utenti).
- **b) Utenti + `ESCROW` held** (anche il bonus bloccato ma promesso è una passività reale da coprire).

→ **Consiglio:** **b** — un bonus in escrow è denaro che la piattaforma dovrà onorare; coprirlo da subito
è più prudente e coerente con E-D-16 (circuito chiuso: spendibile solo con € versati).
→ **Risposta:** B

### Q-SOLV.3 — In F1 closed-loop (E-D-23, niente off-ramp) l'invariante è strict da subito?

- **a) Sì, strict subito.** Il ledger nasce già pronto per quando arriverà il prelievo €.
- **b) Rilassato in F1.** Nessun € esce ora, quindi si rimanda la copertura piena.

→ **Consiglio:** **a** — costa quasi nulla tenerlo strict ora, ed è l'invariante che dà valore al ledger;
rilassarlo significherebbe ricostruirlo dopo (e riaprire codice del denaro).
→ **Risposta:** A

---

## Q-MINT · Chi può coniare crediti, e quando — sblocca la correzione di **T-029** (dopo i 2 bug del revisore)

**Contesto:** il revisore ha colto che *coniare* (far nascere crediti, un conto che va negativo) è diverso
dal *trasferire* crediti esistenti. In F1 **non c'è ancora un layer pagamenti** (Stripe/N-f non configurato):
quindi non esiste una fonte € reale che attesti un conio backed. Fidare su un `kind` auto-dichiarato dal
client = coniare dal nulla (il bug). Dettaglio in `../../dossier/T-029-ledger-core.md`.

### Q-MINT.1 — In F1, `ledger_post` (l'utente loggato) cosa può fare?

- **a) Solo trasferire crediti esistenti** (transfer, spesa, escrow hold/release), con invariante
  **anti-scoperto** (nessun conto va sotto zero, TREASURY inclusa). Il **conio** (backed da TREASURY contro €;
  promo da ADV) vive in **RPC separate privilegiate** (`service_role`), costruite col layer pagamenti /
  budget campagna — **dopo**. *Conseguenza:* la fondazione del ledger è **sicura e testabile subito**; il
  denaro «entra» solo quando c'è Stripe a coprirlo. T-030/031 (che muovono crediti, non coniano) non sono bloccati.
- **b) Costruire subito anche il conio**, con una tabella `payments` stub che simula l'attestazione €.
  *Conseguenza:* si tocca il layer pagamenti ora, fuori sequenza, con uno stub da rifare quando arriva Stripe.

→ **Consiglio:** **a** — separa conio da trasferimento, chiude gli exploit, e non anticipa il layer
pagamenti prima del suo momento (N-f è pre-lancio). Il conio diventa un task suo quando configuri Stripe.
→ **Risposta:** Ho inserito le chiavi di stripe su vercel. Un conto non può andare in negativo, non ora, per ora un utente ricarica il proprio conto inviando i soldi veri a Shaer.it, si registrano e si rilascia il collaterale di SHAER. Questi SHAER sono usati all'interno della piattaforma per comprare prodotti e servizi di SHAER. Se un utente ha inviato 100€ a Shaer.it ha ricevuto 10.000 SHAER, senza considerare eventuali bonus che potranno esserci tipo se ricarichi 200€ oggi ricevi +10% in SHAER = 22000. QUando un utente compra un prodotto, può spendere anche il 100% del valore in SHAER, oppure 20% SHAER e 80% € (in contanti) dipende da come il commerciante imposta la vendita. In ogni caso, il commerciante dovrà dare sempre la percentuale a Shaer.it anche se la transazione è avvenuta in contanti. E il 100% è coperto da € reali perché l'utente ha versato. A questo punto Shaer.it registra che devono uscire € reali ed essere inviati al commerciante ricevendo dal commercianti SHAER. Il commerciante potrà chiedere di essere pagato manualmente, ogni giorno, ogni settimana, ogni mese (simile stripe). 

