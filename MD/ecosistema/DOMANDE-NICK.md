# Domande per Nick — nodi da sciogliere per costruire F1

Versione: 1 · 2026-07-29 · Padre: [MDD](MDD.md) §13 · [PRD](PRD.md)

> **✅ RISOLTO (2026-07-29).** Tutte le 8 domande risposte da Nick. Scioglimenti promossi in
> [DECISIONI](../../memoria/DECISIONI.md) come **E-D-17…E-D-25** e riversati nel [PRD](PRD.md)
> (EE1–EE7, EE10, EE12) e nell'[MDD](MDD.md) §13. File tenuto come traccia del ragionamento.

> **Come funziona questo file.** Ogni domanda ha una **proposta di default**: se non
> rispondi, io procedo con quella e te lo segnalo. Tu la **confermi** (scrivi «ok N»)
> o la **correggi** (scrivi la tua nella riga `Risposta:`). Se una domanda non è chiara,
> scrivi «non chiara N» e la riscrivo con più contesto. Non sei obbligato a rispondere
> tutto in una volta: le domande sono ordinate per **quanto mi bloccano**.

---

## Parte A — I 3 nodi aperti dell'MDD §13 (bloccano il SAD e F1)

### A1 · Architettura dei parametri — come si compartimenta concretamente

**Contesto.** Tutta la piattaforma è governata da *parametri* (split reward, %
commissioni, durate referral, soglie bonus, ecc.). La decisione **E-D-09**
(compartimentazione) dice *che* i parametri e i segreti stanno in compartimenti separati,
least-privilege — ma non *come*. Tre modi:
- ① **config-as-data compartimentata** — ogni parametro è un dato in tabella, letto da chi
  ne ha diritto. Flessibile, ma la logica si sparpaglia.
- ② **motore centralizzato** — un solo servizio calcola tutto. Semplice da ragionare, ma
  è il "punto unico che sa tutto" che E-D-09 vuole evitare.
- ③ **ibrido** — motore di calcolo unico, ma i **dati** dei parametri restano
  compartimentati per ruolo/tenant. *(consigliata nell'MDD)*

**La mia proposta (default): ③ ibrido.** Un motore puro e testabile calcola, i valori dei
parametri vivono in compartimenti con RLS. Concilia E-D-09 con la testabilità (regola 5).

**Cosa mi serve da te.** Basta «ok A1» per confermare ③. È una scelta tecnica: se non hai
preferenze, conferma e procedo.
**Risposta:** ③ ibrido

---

### A2 · Dashboard cliente — cosa vede il BUYER

**Contesto.** **E-D-08** fissa **due dashboard**: quella *business* somiglia ad
`arkes_dashboard_v3.html` (già chiara), quella *cliente* è "da definire bene". Il BUYER non
gestisce un'azienda: usa la rete, guadagna cashback, fa wishlist/regali, suggerisce come
SHAERER. Devo sapere **quali sezioni** compongono il suo menu.

**La mia proposta (default) — 6 voci:**
1. **Wallet** — saldo crediti (3 classi), storico movimenti, cashback maturato.
2. **I miei acquisti / TXN** — transazioni verificate via QR, stato, recensione.
3. **Wishlist & Regali** — liste desideri, compleanni amici con 2 prodotti di ciò che desiderano e lo stato di completamento con pulsante regala che permette di partecipare al regalo, raccolte crowdfunding (EE6, priorità).
4. **Suggerimenti (SHAERER)** — cosa ho consigliato, reward maturati/bloccati.
5. **Rete & Referral** — inviti, cashback da rete, programmi attivi.
6. **Profilo** — dati, ruoli attivi (diventa business), preferenze (es. fuso, T-022).

**Cosa mi serve da te.** Confermi le 6 voci? Ne togli/aggiungi? C'è qualcosa che il cliente
**deve** vedere in home appena entra: A. quanto ho guadagnato questo mese. B. Richieste seggerimenti degli amici/liste/gruppi/pubblico. C. lista compleanni prossimi del mese corrente degli amici.
**Risposta:** Confermo e aggiungo: 7. pulsante per diventare/switchare a business. 

---

### A3 · Trasporto — privacy del tracking dei dipendenti (Modulo 11)

**Contesto.** **E-D-06**: il TRANSPORTER traccia il lotto lungo la catena; i suoi dipendenti
alimentano la posizione **real-time da dispositivo**. Qui si tocca dato personale del
lavoratore (GDPR): serve una **base giuridica** e un limite a *cosa* si condivide.

**La mia proposta (default):**
- Si traccia il **lotto/hand-off** (scansione QR = evento verificato), **non** la persona in
  continuo. La posizione GPS si registra **solo al momento della scansione**, non come
  scia continua.
- Il dato personale del dipendente resta **compartimentato** (E-D-09): al consumatore
  finale arriva **distanza/costo trasporto**, mai l'identità o la posizione del lavoratore.
- Consenso esplicito del dipendente all'attivazione del ruolo operativo.

**Cosa mi serve da te.** Confermi «GPS solo alla scansione, mai scia continua»? Oppure il
business deve poter vedere la posizione live dei mezzi (es. flotta)? Cambia molto sul piano
legale — se serve il live, lo isoliamo come modulo a consenso rafforzato.
**Risposta:** Per ora, solo il calcolo approssimativo della distanza partenza/arrivo. Scansione ricevuto/consegnato. Con analisi di tempo trascorso, distanza, costi trasporto. Poi, se serve aggiungiamo altro.

---

### A4 · Referral — versionare i parametri senza rompere gli accordi maturati

**Contesto.** Un programma referral ha durata, %, base di calcolo. Se il commerciante li
**cambia**, chi ha già maturato reward col vecchio accordo non deve perderli. Dipende da A1.

**La mia proposta (default):** i parametri di un programma sono **immutabili una volta
pubblicato** (come lo `short_code` di un QR, regola 7); un cambio **crea una nuova versione**
del programma, e ogni reward è legato alla versione sotto cui è maturato. Gli accordi vecchi
restano risolvibili per sempre.

**Cosa mi serve da te.** «ok A4» conferma. È lo stesso principio del QR immutabile applicato
ai parametri: coerente con la regola 7.
**Risposta:** Confermo, si può aggiungere una possibilità di scadenza (ore, giorni, mesi, mai)

---

## Parte B — Domande emerse riempiendo EE1 (identità) ed EE3 (economia)

### B1 · Multi-ruolo — quali combinazioni sono lecite

**Contesto.** Un utente può avere fino a **3 ruoli** (C35). Ma alcune combinazioni possono
creare conflitti d'interesse (es. lo stesso soggetto SELLER *e* TRANSPORTER dello stesso
lotto = auto-verifica della catena).

**La mia proposta (default):** i 3 ruoli sono liberamente combinabili a livello di account,
ma **sullo stesso lotto/TXN** un soggetto non può ricoprire due ruoli che si verificano a
vicenda (un SELLER non fa da TRANSPORTER verificante del proprio lotto). Vincolo a livello di
transazione, non di account.

**Cosa mi serve da te.** Va bene il vincolo "per-transazione, non per-account"? O vuoi
escludere del tutto certe coppie di ruoli sullo stesso account?
**Risposta:** Va bene il vincolo "per-transazione, non per-account". Utente può stipulare una sorta di accordo, dopo accordo confermato business può amministrare personale, assegnare compiti, premi, vedere statistiche riguarlo al lavoro assegnato. Personale ha l'abilitazione a verificare orario inizio/fine sessione lavorativa assegnata, ruoli speciali assegnati.

---

### B2 · Escrow bonus — chi arbitra e in quanto tempo

**Contesto.** **E-D-16**: il bonus dipendente è bloccato nel pool e rilasciato dopo
*approvazione commerciante + assenza contestazioni + arbitrato Shaer*. Per costruirlo mi
servono i **tempi**: quanto dura la finestra di contestazione? Chi è l'"arbitro Shaer"?

**La mia proposta (default):**
- Finestra di contestazione: **14 giorni** dall'approvazione del commerciante.
- Senza contestazioni entro la finestra → rilascio automatico.
- Con contestazione → passa a un ADMIN (ruolo "arbitro") che decide; sua la parola finale.

**Cosa mi serve da te.** Confermi i **14 giorni**? L'arbitro è un ADMIN Shaer generico o una
figura dedicata? (per ora, admin-first, propongo ADMIN generico).
**Risposta:** L'arbitro è il custumer care di Shaer.it, la finestra di contestazione si può aprire solo se il commerciante non approva una sua promessa fatta in anticipo, contestata dal lavoratore entro 5 giorni. Se entrambi confermano la finestra di contestazione si annulla subito.

---

### B3 · Prelievo `earned` — che livello di KYC

**Contesto.** I crediti `earned` sono prelevabili in € **solo con KYC** (verifica identità).
È un requisito legale (antiriciclaggio). Il *livello* di KYC cambia il fornitore e i costi.

**La mia proposta (default):** KYC **base** (documento + selfie via provider terzo, es. Stripe
Identity/Sumsub) per prelievi sotto una soglia; KYC rafforzato oltre. Le soglie le fissiamo
col commercialista/legale, non ora. In F1 costruisco solo il **gate** ("earned non esce senza
`kyc_verified = true`"), il provider si innesta dopo.

**Cosa mi serve da te.** Ti basta che in F1 io metta il **gate** e rimandi il provider KYC a
quando avrai deciso il partner? O hai già in mente un provider?
**Risposta:** Per ora non è prioritario, rimandare quando serve, per ora si trasferiscono solo SHAER all'interno della piattaforma.

---

### B4 · Maker-checker — chi approva in v1 (admin-first)

**Contesto.** **E-D-13** admin-first: in v1 i permessi li assegna l'ADMIN Shaer. Il
maker-checker (R-EE1.5) dice che un'azione permanente da profilo delegato resta `pending`
finché un approvatore non conferma. Chi è l'approvatore in v1?

**La mia proposta (default):** in v1 (admin-first) l'unico approvatore è un **ADMIN Shaer**.
Quando la delega passerà al commerciante (fuori v1), l'approvatore diventerà anche il titolare
del business. Costruisco il meccanismo generico ("approvatore = chi ha il permesso `approve`")
così non va riscritto dopo.

**Cosa mi serve da te.** «ok B4» conferma. Meccanismo generico, in v1 popolato solo da ADMIN.
**Risposta:** Approvatore ha solo la possibilità di verificare, leggere alcuni dati assegnati, non diventa mai proprietario o admin totale. Serve intervento manuale di Shaer.it per cambiare amministratore completamente.

---

## Riepilogo — cosa procede da solo e cosa aspetta te

- **Se non rispondi**, procedo con i **default** qui sopra e te lo segnalo a ogni passo.
- Le risposte che cambiano di più il costruito: **A2** (dashboard cliente) e **A3** (privacy
  trasporto). Sulle altre i default sono a basso rischio.
- Quando hai risposto (anche solo «ok tutto»), promuovo gli scioglimenti in `DECISIONI.md`
  e sblocco il SAD (T-026) e la decomposizione di F1 (T-028).
