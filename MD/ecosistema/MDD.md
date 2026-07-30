# Shaer.it — Master Design Document (MDD) · Ecosistema

Versione: 1.5 · Stato: **CONGELATO — mappa/visione di riferimento** (E-D-26, 2026-07-29b). Non si espande.
Decisioni in [DECISIONI](../../memoria/DECISIONI.md) (E-D-01…E-D-26); contratto tecnico F1 in [SAD](SAD.md).
Il **PRD separato è stato archiviato** (era la stessa cosa a un'altra quota): `Archivio/2026-07-29/`.
Questo file resta per la **mappa dei 17 moduli** (§5) e la **roadmap a blocchi** (§10); il resto è narrativa.
Autore: Nicolaj D'Ortona · Assistente: Claude (Anthropic)
Fonti-seme: [SHAER_MASTER](../SHAER_MASTER.md) (dominio economico) ·
[SAAS_BUILD_PLAN_V1](../SAAS_BUILD_PLAN_V1.md) (ampiezza moduli, tecnica) ·
[modulo-qr/MDD](../modulo-qr/MDD.md) (il Modulo 0, già costruito).
**Riferimenti funzionali/visivi (verificati, fuori dal doc):** simulatore
[MVP v5](../../Struttura/Schema/Shaer_it_Simulatore_MVP_v5.html) (meccanica economica) ·
`D:\Desktop\Arkés\arkes_dashboard_v3.html` (estetica dashboard business, fuori repo) ·
`D:\Desktop\I Damascati\Code\Sito\damascati` (**dashboard & funzionamento** di
riferimento — progetto gemello, stesso stack Next 16 + Supabase, stesso metodo).

> **Documento-radice dell'ecosistema.** Sopra tutti gli altri. Sotto di lui, in
> ordine di verità: PRD di ecosistema (cosa) → SAD di ecosistema (come tecnico) →
> i documenti di **modulo** (`modulo-qr/`, e i moduli futuri). In caso di conflitto
> sul dominio economico vince [SHAER_MASTER](../SHAER_MASTER.md) e le sue decisioni
> `✅ [LOCKED]`; sul prodotto QR già in produzione vince `modulo-qr/`.
>
> *PRD e SAD di ecosistema sono la prossima sessione: questo file è la radice che li
> genera.*

---

## 1 · Visione

Shaer.it **non** è un generatore di QR, e non è un SaaS di prenotazioni. È una
**super-piattaforma unica** in cui commercianti, imprenditori, produttori e
trasportatori sono interconnessi tra loro **e** con i clienti — anche di attività
diverse. Oggi ogni strumento del commercio vive in un **silo** che non parla con
gli altri: prenotazioni da una parte, shop dall'altra, fidelity di un negozio
inutilizzabile nel negozio accanto, logistica opaca, recensioni frammentate su
piattaforme che non si conoscono.

> **Missione:** unificare l'intera esperienza commerciale sotto **un solo cliente,
> un solo wallet, un solo linguaggio di fiducia** — dove il valore prodotto dai dati
> e dal passaparola torna a chi lo genera, non alle piattaforme pubblicitarie.

Il **cliente è il centro di gravità**: usa sempre la stessa struttura ovunque, e
ogni acquisto gli restituisce **cashback (crediti) spendibili presso qualsiasi
altro commerciante della rete**, in tutto il mondo. È ciò che lo tiene dentro: più
usa Shaer.it, più la rete lo premia. Lato business, i **servizi si attivano a
pagamento**, ognuno per chi davvero lo vuole — nessuno paga per moduli che non usa.

Il valore competitivo non è nessun singolo modulo: è l'**interoperabilità** che
nessun concorrente ha, resa fidata da un **layer di verifica anti-frode** (il QR) e
tenuta insieme da un'**economia a crediti** condivisa.

## 2 · Il principio unificante

Un solo meccanismo spiega perché la piattaforma è una e non tante:

- **Un'identità cliente sola**, valida presso ogni commerciante della rete.
- **Un wallet solo** (per ruolo — vedi §3): il cashback guadagnato da un negozio si
  spende da un altro. Il credito è la valuta interna universale — **`100 crediti =
  1,00 €`** (SHAER_MASTER §0).
- **Una fiducia sola**: recensioni e rank che valgono su tutta la rete, perché
  ancorati a **transazioni verificate** — non a opinioni non verificabili.
- **Un catalogo di servizi** che il business compone a piacere (prenotazioni, shop,
  fidelity, MLM personalizzato, tracciabilità del trasporto, analytics…), pagando
  solo ciò che attiva.

Il cliente non "usa dieci app": vive **una** esperienza, e la rete lo remunera per
la fedeltà alla rete stessa.

## 3 · Gli attori

Dal dominio Shaer (SHAER_MASTER §1.2), riconciliati coi ruoli del Modulo QR e
**esteso** con la figura del trasportatore.

| Attore | Ruolo | Wallet | Nel Modulo QR (oggi) |
|--------|-------|--------|----------------------|
| **BUYER** (Cliente) | consumatore finale; può attivare la modalità **SHAERER** (suggeritore) | `earned`/`purchased`/`promo` | il **visitatore** che scansiona |
| **SELLER** (Rivenditore) | negozio/PRO con P.IVA; vende al buyer | separato, verificato | l'**owner** di un QR |
| **PRODUCER** (Produttore) | brand con Product ID; emette lotti; opera via seller | separato, verificato | owner di nodi radice / delega (`granted_by`) |
| **TRANSPORTER** (Trasportatore / Vettore) | **cura il trasporto** del lotto lungo la catena internazionale; **distinto dal rivenditore**; i suoi dipendenti alimentano la tracciabilità in tempo reale | separato, verificato | scansiona il QR del **lotto** ai passaggi di consegna |
| **ADMIN** | team Shaer.it; supporto, audit, config | — | — |

**Multi-ruolo (C35):** un utente può avere fino a **3 ruoli**, ciascuno con wallet
separato; SELLER/PRODUCER/TRANSPORTER richiedono **verifica documentale** (P.IVA,
documenti). Un utente normale (Marco) diventa business attivando e verificando il
profilo. Il ponte col Modulo QR è diretto: l'**albero di QR** con `owner_id`
per-nodo e `granted_by` **è già** la struttura produttore→seller→cliente e i
**passaggi di consegna** del lotto sono scansioni di QR.

**Ruoli periferici (non tenant a pieno titolo):**
- **FORNITORE** — è un SELLER/PRODUCER visto **in B2B** (rifornisce un altro
  business); non un attore nuovo, un ruolo relazionale nell'albero.
- **COMMERCIALISTA** — **destinatario di dati** in sola lettura/export (presenze,
  fatturato di un business che glielo concede); non opera sulla piattaforma, riceve.
  Accesso puntuale e revocabile (vale la compartimentazione, §11).
- **DIPENDENTE** — un utente (di norma BUYER) **assegnato** da un business a una
  **posizione di lavoro**; ha **permessi a scheda** nel pannello unico (§8.1) e le sue
  **vendite/performance** sono attribuite via **QR operativo** (§5.4). Non è un tenant:
  è una **relazione** utente↔business, con abilitazioni granulari e revocabili.

## 4 · Come si compongono le fonti (e la "rete" chiarita)

Le due fonti che sembravano rivali sono **due metà dello stesso prodotto**:

| Fonte | Cosa fornisce | Ruolo nell'ecosistema |
|-------|---------------|-----------------------|
| [SAAS_BUILD_PLAN_V1](../SAAS_BUILD_PLAN_V1.md) | ampiezza dei **moduli business** (prenotazioni, shop, fidelity, CMS, **motore MLM**, billing SaaS, multi-tenant) e le scelte tecniche | il **catalogo dei servizi attivabili** lato business |
| [SHAER_MASTER](../SHAER_MASTER.md) | il **motore economico** che li unifica: crediti, TXN verificate, recensioni, anti-frode, distribuzione del margine | il **collante** che fa comunicare i silos |
| [modulo-qr/](../modulo-qr/MDD.md) | il **layer di verifica** già costruito e provato | il **Modulo 0**: rende reale ogni transazione e ogni passaggio |

### 4.1 · La "rete" è a due livelli — entrambi validi

Il malinteso era trattare l'MLM come una cosa sola. In Shaer.it convivono **due
meccanismi distinti**, che non si contraddicono:

**A · L'economia referral propria di Shaer — sempre mono-livello (solo diretto).**
Shaer premia chi porta utenti/commercianti tramite **programmi promozionali
parametrici e a tempo**, che cambiano quando serve o al lancio di una campagna
specifica. La ricompensa è **solo sul diretto** e la durata è quella del programma
(per sempre → per sempre; 6 mesi → scade dopo 6 mesi). *Esempi:* nel programma di
lancio (1 anno) Maria registra Elisa e prende **0,03%** su ogni cashback che Elisa
riceve; registra 2 commercianti e prende **0,1%** sul fatturato che i commercianti
riconoscono a Shaer. Se un utente registrato diventa business, il referrer prende
il vantaggio **solo sul diretto**, secondo il programma vigente al momento della
registrazione. — *Coerente con SHAER_MASTER principio n°6: Shaer stessa non è una
piramide.*

**B · L'MLM come servizio (modulo business, pay-per-activation).**
Un business verificato può **attivare a pagamento** un **motore MLM parametrico** e
costruire una **propria rete interna** per una campagna/prodotto, con **profondità e
larghezza configurabili**. *Esempi:* Marco (business) per il Prodotto A imposta max
**2 livelli** sotto, **larghezza infinita**; Luigi (produttore) imposta fino a **8
livelli** sotto con **larghezza max 8**. È uno **strumento venduto al business**,
non l'economia core di Shaer — quindi **non** rende Shaer una piramide e **non**
viola il principio n°6.

> **Decisione fondativa E-D-01 (revisione — da promuovere in `DECISIONI.md`):** la
> rete di Shaer.it è a **due livelli**: (A) economia referral **propria** = sempre
> **mono-livello**, via programmi promozionali parametrici e a tempo; (B) **MLM-as-a-
> service** = modulo business parametrico (profondità + larghezza configurabili per
> campagna/prodotto). Il modulo NETWORK del build plan **si recupera** come (B), non
> si scarta. Il principio n°6 resta intatto: vieta la piramide *di Shaer*, non lo
> strumento *venduto ai business*.

### 4.2 · Come si finanzia una campagna (la meccanica, dal simulatore v5)

La funzionalità è **personalizzata** e la sua verità funzionale vive nel simulatore
[MVP v5](../../Struttura/Schema/Shaer_it_Simulatore_MVP_v5.html) — da leggere quando
si costruirà il modulo. La meccanica confermata:

- **Chi crea la campagna dedica un budget.** Su quel budget **il creatore stesso
  decide le percentuali** di distribuzione: quanto al **passaparola (MLM/referral)**,
  quanto di **cashback a chi compra**, e altre variabili (esistenti e future).
- **Indipendentemente** dalle scelte del creatore, **Shaer.it applica la propria
  commissione**: le percentuali di commissione vivono nel **pannello amministrativo**
  e si applicano **a tutti o a singoli** in modo specifico.
- Àncora al dominio: è il **minipool campagna** di SHAER_MASTER (§1.4, slider
  Reach↔Vendita) governato da `fee_rules`/`plans`. **I reward della rete MLM sono
  crediti Shaer** presi dal budget dedicato — questo scioglie il nodo "crediti vs
  valore del business" (§13).

## 5 · I moduli dell'ecosistema

`Stato` è verificato sulla realtà (regola 1): solo il Modulo 0 esiste come codice;
il resto è visione. `Fase`: F1 economia · F2 servizi business · F3 rete&intelligenza
· F4 scala. `Att.` = attivabile a pagamento lato business.

| # | Modulo | Cosa dà | Fase | Att. | Stato |
|---|--------|---------|------|:---:|-------|
| **0** | **QR / Verifica** | QR dinamici, albero `parent_id`+`owner_id`+`granted_by`, scan append-only, analytics, auth+RLS multi-tenant | F0 | — | **✅ costruito e provato** |
| 1 | **Identità & Wallet** | un cliente, wallet per-ruolo, saldo **derivato** dal ledger | F1 | — | ▢ |
| 2 | **TXN Engine** | la transazione come **unica verità**, stati `OPEN→SUGGESTED→IN_PROGRESS→COMPLETED→(EXPIRED/ABANDONED)` | F1 | — | ▢ |
| 3 | **Economia a crediti** | ledger a **partita doppia**, 6 conti, 3 classi `promo/purchased/earned`, margine, **cashback cross-merchant** | F1 | — | ▢ |
| 4 | **Recensioni & Rank** | 10 stelle/categoria, solo da TXN `completed`, **rank bayesiano**, moltiplicatore Shaerer | F1 | — | ▢ |
| 5 | **Referral (promo Shaer)** | programmi promozionali **mono-livello**, parametrici e a tempo (§4.1-A) | F1–F3 | — | ▢ |
| 6 | **Wishlist · Compleanni · Crowdfunding · Gruppi** | lista desideri, regali collettivi, obiettivi di raccolta personali/comunitari; segnale d'interesse (§5.1) | **F1–F2 · da subito** | parz. | ▢ |
| 7 | **Gestionale attività** (assorbe Prenotazioni) | pannello business: staff, catalogo servizi+prodotti, pacchetti, presenze, abilitazioni; **prenotazioni** come sotto-parte (sedi/staff/widget). Dettaglio → `MODULO-7-GESTIONALE.md` | F2 | ✓ | ▢ |
| 8 | **Shop** | catalogo, ordini, checkout via **PSP terzo** | F2 | ✓ | ▢ |
| 9 | **Fidelity → universale** | punti/livelli **non** per-negozio ma sul wallet unico di rete (è la §2) | F2–F3 | ✓ | ▢ |
| 10 | **MLM-as-a-service** | motore MLM **parametrico** (profondità/larghezza) per reti interne business (§4.1-B) | F2–F3 | ✓ | ▢ |
| 11 | **Tracciabilità & Trasporto** | hand-off del lotto via scansione QR, dati real-time operatore+dispositivo, tracciabilità verificata condivisibile in modo chirurgico (§5.2) | F2–F3 | ✓ | ▢ |
| 12 | **CMS** | pagine/articoli del business | F2 | ✓ | ▢ |
| 13 | **Analytics ecosistema** | KPI, funnel, geo, heatmap **derivati** su dati veri di rete | F3 | ✓ | ▢ (esteso dal Mod. 0) |
| 14 | **Automazioni & Marketing** | webhook, pixel (con consenso), reminder, consigli azionabili | F3 | ✓ | ▢ |
| 15 | **Billing SaaS** | subscription + % transato; **attivazione a pagamento per-modulo** | F2 | — | ▢ |
| 16 | **API & Enterprise** | API per-owner, white-label, ruoli, marketplace plugin | F4 | ✓ | ▢ |

### 5.1 · Wishlist, compleanni e crowdfunding — *da sviluppare sin da subito*

Modulo con **priorità alta** (richiesta esplicita di Nick): non è un vezzo social, è
un **motore di segnale d'interesse** più preciso dei cookie.

- Vedere i **compleanni** degli amici — registrati o no — e **contribuire alla
  raccolta fondi** per il regalo che hanno messo in **lista dei desideri**.
- **Gruppi & obiettivi**: chiunque può creare obiettivi di raccolta non solo per il
  proprio compleanno ma per **scopi comunitari e personali**.
- **Il segnale che i cookie non sanno dare:** la wishlist dice a Shaer se un prodotto
  interessa **davvero** una persona, se vale la pena promuoverglielo, se poi **l'ha
  comprato** e **quanto tempo fa** — così la piattaforma sa se lo **possiede già** ed
  evita di ri-suggerirlo prima del tempo (ri-propone dopo 6 mesi / 1 anno).
- Àncora al dominio: SHAER_MASTER §1.6 (Wishlist/Crowdfunding, **revoca contributo
  entro 2h**). Dipende da Identità&Wallet (Mod. 1) per i contributi in crediti.

### 5.2 · Tracciabilità & Trasporto — la catena internazionale verificata

Il **trasportatore** (§3) garantisce e **certifica** il flusso della merce. Su di lui
si possono impostare **regole**; i suoi **dipendenti** alimentano i dati dal proprio
dispositivo.

- *Flusso tipo:* un **produttore** emette un lotto dalla fabbrica (es. Cina),
  stipula un contratto con una fabbrica in Italia e un **contratto di trasporto** col
  trasportatore. Alla ricezione della merce, il trasportatore **scansiona il QR** del
  lotto → Shaer registra la **presa in carico** e la **modalità** (nave / terra /
  aereo o combinazione).
- Parte **tracking + analisi**: popup periodici sul telefono del/i dipendente/i
  assegnato/i che **rispondono** a Shaer; in parallelo Shaer raccoglie **dal
  dispositivo stesso** posizione e stato condivisi. Tutto confluisce nel sistema.
- Produce **tracciabilità verificata** per produttori, rivenditori, altre fabbriche
  e **clienti finali**. Ogni informazione è **condivisibile o meno, attivabile e
  disattivabile in modo chirurgico**.
- **Tutela del consumatore:** scansionando il prodotto, il cliente vede
  **automaticamente** la **distanza percorsa** fino a lui e i **soldi spesi per il
  trasporto** — così capisce quanto il trasporto **influenza il prezzo di mercato**
  del suo acquisto.
- Poggia sul Modulo 0: il passaggio di consegna **è** una scansione di QR verificata.

### 5.3 · Il commerciante compone il suo ecosistema (verticali operativi)

Il principio: **ogni business attiva solo i servizi che gli servono** e con essi
costruisce un **ecosistema personale** che **coopera** con quello di altri (fornitori,
commercialista, altri commercianti). Stessa piattaforma, un solo login.

*Gli stessi servizi, bisogni diversi:*
- **Avvocato / libero professionista** — attiva solo **QR** (bigliettino da visita
  digitale) + **dashboard analitica**. Nient'altro.
- **Rivenditore (scarpe)** — QR + analytics, come sopra, più shop/fidelity a piacere.
- **Ristorante** — QR + analytics **e** un **ecosistema interno**: **magazzino**
  (prodotti rimasti, **scadenze**), **riordino automatico al fornitore**.
- **Fornitore** — QR-prodotto + analisi magazzino **e** gestione dei **dipendenti**
  (presenze, assenze, **check-in** al lavoro) **e** l'**export al commercialista**.

Da qui i **moduli operativi** (verticali), tutti F2, pay-per-activation, che si
aggiungono alla mappa §5:

| Modulo | Cosa dà | Coopera con |
|--------|---------|-------------|
| **Magazzino / Inventario** | stock rimanente, **scadenze**, soglie | Riordino, Shop |
| **Riordino automatico** | ordine al fornitore alla soglia; il fornitore lo riceve nel proprio pannello | Fornitore (B2B), Magazzino |
| **Gestione dipendenti & Presenze** | presenze/assenze, **check-in** al lavoro | Export commercialista |
| **Export commercialista** | pacchetto dati (presenze, fatturato) al commercialista | ruolo COMMERCIALISTA (§3) |

La **cooperazione tra ecosistemi** è ciò che rende Shaer.it una piattaforma unica e
non tante: il riordino del ristorante **è** un ordine nel pannello del fornitore; le
presenze del fornitore **sono** l'export del suo commercialista — senza uscire da
Shaer.it, e ogni flusso è verificato dal Modulo 0.

### 5.4 · QR intelligente / operativo: postazioni, dipendenti, bonus con escrow

Nella sezione QR il commerciante non genera un singolo codice: **genera e controlla
un ecosistema**. Il QR diventa **operativo** — legato a postazioni, tavoli, dipendenti.

- *Centro estetico (5 operatrici):* un QR **per operatrice/postazione**. Il cliente
  alla **postazione 3** scansiona, si registra, compra manicure+massaggio+pacchetto →
  la vendita è **attribuita** a quella postazione/operatrice. **Dopo** aver generato
  il QR, il commerciante può: **rinominare** dipendente/tavolo, **assegnare un bonus**
  (es. se vende un pacchetto), **gestire le vendite** di quel QR — vedendo quanto ha
  lavorato l'operatrice, i servizi aggiuntivi venduti e il **bonus € generato** a fine
  giornata/settimana.
- *Ristorante:* un QR **per tavolo**. Il dipendente usa Shaer.it dal **proprio
  telefono**, è **assegnato** a quel ristorante e sceglie la **posizione di lavoro**;
  scansionando da quella posizione il **counter** conta per quell'attività → il
  commerciante vede ordini presi, **recensioni positive** per ordine, capacità di
  vendita e raggiungimento degli **obiettivi bonus**.

**Motore incentivi (due modi):**
- **Team** — se il team raggiunge un **fatturato** entro fine mese, distribuisce una
  **% del fatturato** solo sui **servizi/pacchetti scelti** da incentivare.
- **Singolo** — se un dipendente raggiunge un fatturato entro settimana/mese: **bonus
  prestabilito** o **% sul fatturato** con **minimo e massimo** preimpostati.

**Anti-frode: escrow + approvazione + arbitrato (il cuore di fiducia).**
Shaer.it **controlla e verifica** le condizioni e **blocca (held) l'importo promesso**
al dipendente — tutela la promessa **e** il commerciante. Il bonus si **rilascia solo
dopo approvazione e in assenza di contestazioni**: il **commerciante verifica e
approva**; **Shaer.it verifica e arbitra** eventuali contenziosi
dipendente↔commerciante. Nessuno può frodare. È lo stesso schema di SHAER_MASTER
(**held balance** C43, TXN come unica verità): il bonus è un **evento appeso al TXN**,
non un saldo, verificato dal Modulo 0.

**Il circuito chiuso dei crediti (risposta di Nick).** L'escrow è in **crediti
Shaer**, ma un credito bonus è **spendibile solo se il commerciante versa soldi veri a
Shaer.it**; finché non lo fa resta un **punto contabile** — memoria del lavoro svolto
tra commerciante e dipendente, non valore spendibile. Il circuito si **chiude**:
`utente pagante → QR → commerciante → crediti trattenuti nel pool → distribuiti
automaticamente al dipendente` a transazione avvenuta.

*Esempio (ristorante).* 10 tavoli → **10 QR tavolo**; 5 camerieri → **5 QR personale**,
ognuno **abbinato al profilo** dell'utente registrato su Shaer.it (nomi di QR e
personale **modificabili**). Il commerciante lancia una **campagna interna**
01.01.2027 → 01.02.2027 sul **prodotto #x35 (pesce)**, acquistato dal produttore e
**tracciato** (Mod. 11) — così **anche il produttore sa** che è partita una campagna su
quel prodotto. **Soglia:** vendere quel prodotto (20€ al pubblico) **≥1000 volte**
*oppure* **fatturato ≥19.000€** su di esso (se lo sconto supera il 10%, servono più
pezzi). **Premio:** al raggiungimento, **30% del fatturato di quel solo prodotto**
distribuito al personale **in proporzione alle vendite di ciascuno**. Fino
all'approvazione, il 30% è **bloccato nel pool**.

## 6 · L'economia che unifica (sintesi — dettaglio in SHAER_MASTER)

A livello MDD bastano gli invarianti; la profondità (fee, tier, minipool campagne)
vive in [SHAER_MASTER](../SHAER_MASTER.md) §1.4–1.5 e nel decision log `✅`.

- **Crediti = valuta interna universale**, `100 crediti = 1,00 €`. 3 classi:
  `promo` (non coperto, non prelevabile), `purchased` (coperto €), `earned`
  (coperto, prelevabile con verifica+KYC).
- **Cashback cross-merchant**: il reward guadagnato con un seller si spende con
  qualsiasi altro — è il meccanismo di ritenzione della §2.
- **Saldo derivato dal ledger, mai memorizzato**; **partita doppia**; solo
  `TREASURY` conia; **invariante di solvibilità** (riserva € ≥ `purchased`+`earned`).
- **Take unico sul margine**. Split organico (C31): 25% Shaer · 20% reward
  suggeritori · 1% cashback buyer · 54% seller.
- **Anti-frode strutturale (principio n°1):** crediti e recensioni hanno integrità
  **solo** da transazioni verificate via **QR** — ragione d'essere del Modulo 0.
- **MVP closed-loop:** €↔crediti solo a on/off-ramp; conversione/exchange e prelievo
  solo con **validazione legale** (MiCA/e-money) — mai in autonomia.

## 7 · Il modello di business

- **Lato business — pay-per-activation:** ogni modulo (prenotazioni, shop, fidelity,
  MLM personalizzato, tracciabilità trasporto, analytics, API…) si attiva a pagamento,
  per chi lo desidera. Ricavo = **subscription** per-modulo + **% sul transato** +
  **take sul margine** + **fee B2B** (scaglioni 15/10/3, C37).
- **Lato cliente — gratuito e premiante:** struttura identica ovunque, **guadagna
  cashback** e commissioni referral usando la rete. Il cliente non è il prodotto
  (niente advertising tradizionale): è il beneficiario.

## 8 · Le superfici — un pannello solo, accessi granulari

Il modello è il **pannello unico di damascati** e la **sidebar a categorie di Arkés**:
**un solo pannello** da cui ADMIN e utenti abilitati **gestiscono, verificano,
impostano** — con accessi diversi per ruolo. Non tanti pannelli: uno, filtrato.

### 8.1 · Pannello unico + permessi granulari (RBAC) + maker-checker

- **Un solo pannello:** chi entra vede **solo le schede e i dati** che il suo ruolo
  consente. *Esempi (Nick):* un dipendente addetto **solo alle analisi** vede solo
  quelle schede e solo certe informazioni; un dipendente addetto a **finanza e
  distribuzione** di €/$/crediti ha abilitazioni **solo per alcune operazioni** e per
  la **verifica** di altre.
- **Maker-checker — verifica prima del permanente:** per i dipendenti il sistema
  **esige sempre una verifica/approvazione** prima di intervenire in modo completo e
  **modificare qualcosa in modo permanente**. Nessuna azione irreversibile in solitaria.
- Poggia su identità+ruoli (Mod. 1) e sulla **compartimentazione** (§11): i permessi
  sono un compartimento — nessun dipendente "sa e tocca tutto".
- **Ambito attuale — admin-first (Nick):** per ora la profondità dei permessi si
  implementa/collauda **solo lato amministratore Shaer.it**: l'admin assegna a un
  utente registrato **permessi speciali scelti uno a uno**. **In seguito** la stessa
  capacità passa al **commerciante** (nominare un profilo per sola contabilità /
  analisi / altro, con selezione puntuale di cosa può **vedere e fare**).

### 8.2 · Il catalogo resta visibile (modello damascati `PRESTO`) + trial

- Le funzioni **non attive** si **mostrano comunque** (come i badge `PRESTO` di
  damascati), per **incuriosire** il commerciante e spingerlo al **pacchetto FULL**.
- Dal pannello **ADMIN** si **attiva un periodo di prova** di una funzionalità: **a
  tutti**, a **una sola categoria** di commercianti, o a **uno specifico**.
- È il lato UX del **pay-per-activation** (§7): catalogo sempre visibile, uso sbloccato
  a pagamento o in trial.

### 8.3 · Le due esperienze

- **Business** — ricca, **IA a categorie** come la sidebar Arkés (Panoramica ·
  Studio/Prenotazioni · Shop/Magazzino · Network/Commissioni · Fidelizzazione …), con
  contatori/badge; estetica `D:\Desktop\Arkés\arkes_dashboard_v3.html` (D-012).
- **Cliente** — **menu molto ridotto**: propri suggerimenti, guadagni, rete iscritta,
  commissioni, gruppi/obiettivi. *Struttura ancora da definire bene.*
- **Base funzionale comune** = simulatore
  [MVP v5](../../Struttura/Schema/Shaer_it_Simulatore_MVP_v5.html); **modello di
  pannello & funzionamento** = progetto gemello **damascati**
  (`D:\Desktop\I Damascati\Code\Sito\damascati`, stesso stack Next 16 + Supabase,
  stesso metodo) — da lì struttura, pattern di componenti e organizzazione.

## 9 · Dove si posiziona il QR di oggi

Il codice in `apps/web/` **è già** il "motore di transazioni verificate via QR" che
l'ecosistema richiede — il **Modulo 0**, l'unico costruito e provato:

- L'**albero di QR** (`parent_id` + `owner_id` + `granted_by`) è **già** la struttura
  produttore→seller→cliente (Mod. 10) e il ponte anti-frode del principio n°1; i
  **passaggi di consegna** del trasporto (Mod. 11) sono scansioni sullo stesso albero.
- Ogni **scansione** è la prova verificabile su cui poggeranno TXN (Mod. 2) e
  recensioni (Mod. 4).
- **Auth + RLS multi-tenant + `profiles`** sono le fondamenta dell'identità (Mod. 1).

**Cosa manca:** il ledger a partita doppia (Mod. 3), la macchina a stati TXN (Mod. 2),
recensioni+rank (Mod. 4) — la Fase 1. **Il Modulo 0 non si riprogetta: gli altri si
innestano su di esso.**

## 10 · La roadmap a blocchi (done → to-do)

La **mappa** delle fasi e dei blocchi. Il **saldo** operativo giorno-per-giorno vive
in `memoria/TODO.md` (legge di conservazione); in conflitto sul *fatto*, vince il TODO.
Il dettaglio **stabilisce → consuma** di ogni blocco è compito dell'**analisi
completa** (task T-028) e del SAD di ecosistema. Legenda: ✅ fatto · ◐ in corso · ▢ da fare.

**F0 · Verifica** — ✅ **fatto** (Modulo 0 / QR: 17 task chiusi, `apps/web/`).

**FD · Documentazione d'ecosistema** — ◐ *in corso (questa fase)*
- ◐ **B-D1** MDD di ecosistema (questo file) — bozza completa, da confermare.
- ▢ **B-D2** PRD di ecosistema (`ecosistema/PRD.md`, skeleton posato → T-025).
- ▢ **B-D3** SAD di ecosistema (confini: ledger, TXN, pool/escrow, RBAC, parametri ③ → T-026).
- ▢ **B-D4** Promozione **E-D-01…E-D-16** in `DECISIONI.md` (L-008 → T-027).
- ▢ **B-D5** Analisi completa + scomposizione in blocchi eseguibili (→ T-028).

**F1 · Economia (il cuore)** — ▢ *sblocca l'interoperabilità*
- ▢ **B1** Identità & Wallet + **RBAC admin-first** + maker-checker (Mod. 1, E-D-13).
- ▢ **B2** **TXN Engine** — macchina a stati, unica verità (Mod. 2).
- ▢ **B3** **Ledger crediti** — 6 conti, partita doppia, **pool/escrow**, 3 classi (Mod. 3).
- ▢ **B4** Recensioni & Rank bayesiano (Mod. 4).
- ▢ **B5** Referral promo mono-livello, parametrico a tempo (Mod. 5).
- ▢ **B6** **Wishlist / Compleanni / Crowdfunding** — *priorità da subito* (Mod. 6).

**F2 · Servizi business (pay-per-activation)** — ▢
- ▢ **B7** Pannello unico + catalogo visibile (`PRESTO`) + trial (§8, E-D-14).
- ▢ **B8** **QR operativo** — postazioni/tavoli/dipendenti + motore incentivi + escrow (§5.4).
- ▢ **B9** Moduli operativi: Magazzino, Riordino, Presenze/Check-in, Export commercialista (§5.3).
- ▢ **B10** Prenotazioni · Shop · Fidelity universale · CMS.
- ▢ **B11** **MLM-as-a-service** parametrico (Mod. 10) · **Billing SaaS** (Mod. 15).
- ▢ **B12** **Tracciabilità & Trasporto** (Mod. 11, attore TRANSPORTER).

**F3 · Rete & intelligenza** — ▢ cashback cross-merchant a regime, Analytics d'ecosistema, Automazioni.

**F4 · Scala** — ▢ API pubblica, Enterprise/white-label, marketplace plugin, AI su dati veri.

## 11 · Confini e non-obiettivi

- **La piramide la vieta a sé stessa, non ai clienti:** l'economia **propria** di
  Shaer è mono-livello (E-D-01/A); l'MLM multi-livello esiste **solo** come strumento
  parametrico venduto al business (E-D-01/B).
- **Compartimentazione (decentralizzazione controllata):** nessun singolo punto —
  file, tabella, servizio o persona — conosce o espone l'**intera** logica/config di
  Shaer.it. Parametri e segreti vivono in **compartimenti separati** con
  least-privilege; il controllo master resta al fondatore. Obiettivo: **sicurezza
  interna** e protezione del know-how (nessuno può "sapere tutto e rubare tutto").
  Vincola dove vivono i parametri di referral/MLM/prodotti (§13, E-D-09).
- **Nessun pagamento eseguito in autonomia:** checkout/prelievo via **PSP terzo**,
  dove è il cliente a confermare. L'assistente non esegue trade/transfer.
- **Nessuna PII/dato sensibile senza consenso:** la tracciabilità e la condivisione
  dati sono **attivabili/disattivabili in modo chirurgico**; IP mai pieno.
- **MVP strettamente closed-loop:** conversione/exchange solo dopo validazione legale.
- **Un QR pubblicato non si rompe mai:** `short_code` immutabile (regola d'oro 7).
- **Non si costruisce tutto insieme:** una fase additiva e **provata** prima della
  successiva (regola 5: test prima della carta).

## 12 · Decisioni fondative (promosse in `DECISIONI.md`)

**Approvate da Nick il 2026-07-28** e formalizzate come `E-D-01…E-D-16` in
[`memoria/DECISIONI.md`](../../memoria/DECISIONI.md) (L-008). Qui il riassunto; là la sentenza col perché.

- **E-D-01** — Rete a **due livelli**: (A) economia referral propria = mono-livello,
  programmi parametrici a tempo; (B) **MLM-as-a-service** = modulo business parametrico
  (profondità+larghezza configurabili). Il principio n°6 vieta la piramide *di Shaer*,
  non lo strumento *venduto* (§4.1).
- **E-D-02** — L'ecosistema è una **super-piattaforma unica**: build plan (moduli) +
  SHAER_MASTER (economia) + QR (verifica) = **un solo prodotto** (§4). Le `✅ [LOCKED]`
  di SHAER_MASTER restano la fonte del dominio economico.
- **E-D-03** — La **fidelity è universale** (wallet unico di rete), cashback
  cross-merchant (§2, Mod. 9).
- **E-D-04** — Lato business **pay-per-activation per-modulo**; lato cliente gratuito
  e premiante (§7).
- **E-D-05** — Il **Modulo 0 (QR) è la fondazione anti-frode**: non si riprogetta, gli
  altri si innestano (§9).
- **E-D-06** — Nuovo attore **TRANSPORTER** + modulo **Tracciabilità & Trasporto**:
  hand-off via scansione QR, dati real-time operatore+dispositivo, tracciabilità
  verificata **condivisibile chirurgicamente**, esposizione al consumatore di
  distanza/costo trasporto (§3, §5.2).
- **E-D-07** — Modulo **Wishlist/Compleanni/Crowdfunding & Gruppi** con **priorità da
  subito**: alimenta il segnale d'interesse (meglio dei cookie) e la ri-suggestione
  temporizzata (§5.1).
- **E-D-08** — **Due dashboard** distinte: business ≈ `arkes_dashboard_v3.html`,
  cliente ridotta (da definire); **base funzionale comune** = simulatore MVP v5;
  **modello dashboard & funzionamento** = progetto gemello **damascati** (§8).
- **E-D-09** — **Compartimentazione (decentralizzazione controllata)**: config e
  segreti in compartimenti separati, least-privilege, master al fondatore; nessun
  punto unico espone tutto (§11). Vincola l'architettura dei parametri (SAD).
- **E-D-10** — **Ecosistema componibile del commerciante**: ogni business attiva
  solo i servizi che gli servono e ne compone un ecosistema personale che **coopera**
  con gli altri; nascono i **moduli operativi** magazzino/riordino/presenze/export
  commercialista (§5.3).
- **E-D-11** — **Finanziamento campagne**: il creatore dedica un **budget** e ne
  decide lo **split** (passaparola/MLM, cashback, altro); Shaer applica la **propria
  commissione** dal pannello admin, a tutti o a singoli; i reward MLM sono **crediti
  Shaer** dal budget (§4.2). Verità funzionale nel simulatore v5.
- **E-D-12** — **damascati** è il progetto gemello di riferimento (stesso stack,
  stesso metodo) da cui attingere per admin dashboard e funzionamento (§8).
- **E-D-13** — **Pannello unico + RBAC granulare + maker-checker**: un solo pannello
  filtrato per ruolo; i dipendenti richiedono **verifica/approvazione** prima di ogni
  modifica **permanente** (§8.1). **Ambito v1: admin-first** (permessi assegnati
  dall'admin Shaer, scelti uno a uno); estensione al commerciante in seguito.
- **E-D-14** — **Catalogo sempre visibile + trial**: le voci inattive si mostrano
  (stile `PRESTO`) per incentivare il FULL; l'ADMIN attiva prove a tutti/categoria/
  singolo (§8.2).
- **E-D-15** — **QR intelligente/operativo**: QR per postazione/tavolo/dipendente con
  attribuzione vendite, performance e **motore incentivi** team/singolo (§5.4).
- **E-D-16** — **Bonus dipendenti in escrow con arbitrato + circuito chiuso**: importo
  **bloccato nel pool**, rilasciato **solo** dopo approvazione del commerciante +
  assenza di contestazioni + verifica/arbitrato Shaer. L'escrow è in **crediti Shaer**,
  **spendibili solo se il commerciante versa soldi veri** (altrimenti punto contabile).
  Circuito: utente→QR→commerciante→pool→dipendente (§5.4; held balance C43).

## 13 · Nodi ancora aperti (da definire con Nick)

*Sciolti (round 1, 2026-07-28):* finanziamento campagne/MLM (E-D-11, §4.2); compartimentazione
(E-D-09, §11); **valuta bonus** → crediti Shaer a circuito chiuso (E-D-16, §5.4); **permessi** →
admin-first (E-D-13, §8.1).

*Sciolti (round 2, 2026-07-29 — via `ecosistema/DOMANDE-NICK.md`):*
- **Architettura dei parametri** → **③ ibrido** (motore unico + dati compartimentati con RLS): **E-D-17**. Entra nel SAD.
- **Dashboard cliente** → 7 voci + home a 3 segnali (guadagno mese, richieste amici, compleanni): **E-D-18**.
- **Tracking trasporto** → 2 scansioni (ricevuto/consegnato) + distanza approssimata, niente GPS continuo: **E-D-19**.
- **Programmi referral** → immutabili una volta pubblicati + scadenza configurabile (ore/giorni/mesi/mai): **E-D-20**.
- **Relazione di lavoro** → accordo utente↔business; vincolo ruoli per-transazione: **E-D-21**.
- **Escrow — tempi/arbitro** → customer care, finestra 5gg solo su promessa non onorata, doppia conferma = rilascio subito: **E-D-22**.
- **Off-ramp/KYC** → F1 closed-loop, solo trasferimenti SHAER interni; prelievo € rimandato: **E-D-23**.
- **Limiti approvatore** → solo verifica/lettura, mai proprietà; cambio admin manuale: **E-D-24**.

Nessun nodo impl aperto resta per F1. Il prossimo livello di dettaglio è il **SAD** (T-026).

## 14 · Relazione coi documenti sotto

- **Profondità economica** → [SHAER_MASTER](../SHAER_MASTER.md) (fonte unica del
  dominio; decisioni `C-NNN`).
- **Profondità tecnica dei moduli business** → [SAAS_BUILD_PLAN_V1](../SAAS_BUILD_PLAN_V1.md)
  (riferimento; il suo NETWORK/MLM va letto come Mod. 10, E-D-01/B).
- **Riferimento funzionale** → [Simulatore MVP v5](../../Struttura/Schema/Shaer_it_Simulatore_MVP_v5.html);
  **riferimento dashboard business** → `arkes_dashboard_v3.html` (fuori repo);
  **modello dashboard & funzionamento** → progetto gemello `damascati` (fuori repo).
- **Il Modulo 0 (QR)** → [modulo-qr/](../modulo-qr/MDD.md): MDD, PRD, SAD, Roadmap,
  Design System.
- **Prossimi** → `ecosistema/PRD.md` (famiglie di requisiti per modulo) e
  `ecosistema/SAD.md` (architettura dei confini: ledger, TXN, tracciabilità, RLS
  multi-modulo).
