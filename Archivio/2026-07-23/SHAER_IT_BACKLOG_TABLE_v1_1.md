# SHAER.IT — BACKLOG & IMPLEMENTATION TABLE
## Tavola di Lavoro Modificabile — Funzionalità, Stato, Regole, Note Aperte
> Versione 1.0 | Maggio 2026
> ✏️ Questo documento SI modifica nel tempo. Aggiungi righe, cambia stati, annota conflitti.
> 📎 Usa sempre insieme a: `SHAER_IT_MASTER_REFERENCE.md`

---

## COME USARE QUESTA TABELLA

- **STATO:** `✅ Definito` | `🔨 In sviluppo` | `⏳ Da definire` | `❌ Escluso MVP` | `🔄 In revisione` | `⚠️ Conflitto`
- **PRIORITÀ:** `P0` = bloccante | `P1` = MVP core | `P2` = MVP nice-to-have | `P3` = Fase 2
- **NOTE APERTE:** domande non ancora risolte — da rispondere prima di sviluppare

---

## MODULO 1 — AUTENTICAZIONE E PROFILI

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 1.1 | Registrazione BUYER (email + password) | ✅ Definito | P0 | Email verification obbligatoria. ID generato: SHR-B-XXXXXX | — |
| 1.2 | Registrazione SELLER (form separato) | ✅ Definito | P1 | P.IVA + legale rappresentante + contratto B2B. Approvazione manuale ADMIN. ID: SHR-S-XXXXXX | Come gestiamo i documenti? Upload Supabase Storage? |
| 1.3 | Registrazione PRODUCER (form separato) | ✅ Definito | P1 | Come SELLER. ID: SHR-P-XXXXXX | — |
| 1.4 | Login BUYER / SELLER / PRODUCER | ✅ Definito | P0 | Supabase Auth. Redirect su dashboard specifica per ruolo | — |
| 1.5 | Switch BUYER ↔ SELLER (dual-mode) | ✅ Definito | P1 | Un tap nell'header. Crediti separati per profilo ma trasferibili | Come appare visivamente il toggle? |
| 1.6 | Verifica numero di telefono | ❌ Escluso MVP | P3 | Fase successiva — OTP SMS | — |
| 1.7 | Verifica identità documento | ❌ Escluso MVP | P3 | Fase successiva | — |
| 1.8 | Reset password | ✅ Definito | P0 | Supabase Auth standard | — |
| 1.9 | ADMIN account (creazione interna) | ✅ Definito | P0 | Non registrabile pubblicamente. Solo da pannello admin | — |
| 1.10 | Profilo utente BUYER (interessi, bio) | ⏳ Da definire | P1 | L'utente inserisce interessi, categorie preferite, eventi personali | Quali campi specifici per gli interessi? |
| 1.11 | Stato iscrizione SELLER (silent launch) | ✅ Definito | P1 | Si registrano ora, pagamento differito al lancio | Come comunichiamo la data di attivazione? |

---

## MODULO 2 — HOMEPAGE PER RUOLO

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 2.1 | Homepage BUYER | ✅ Definito | P0 | Feed: eventi amici (con scadenza 7 giorni), barre completamento wishlist, "To Do" attivi, navigazione bottom | Vedi sketch allegato |
| 2.2 | Homepage SELLER | ✅ Definito | P0 | Dashboard: KPI (revenue, transazioni, clienti attivi), QR scanner, top product, top customer | Vedi sketch dashboard |
| 2.3 | Homepage PRODUCER | ✅ Definito | P0 | GMV totale, analytics geografici, campagne attive, product performance, referral | Vedi immagine dashboard B2B |
| 2.4 | Homepage ADMIN | ⏳ Da definire | P0 | Pending approvals (SELLER/PRODUCER/PRODOTTI), overview piattaforma, analytics globali, config sistema | Da disegnare |
| 2.5 | Bottom navigation (mobile) | ✅ Definito | P0 | Home \| Search \| [S logo centrale] \| Ask Help/New Sell \| Orders/Review | "New Sell" solo se SELLER attivo |
| 2.6 | Header dual-mode toggle | ✅ Definito | P1 | Visibile solo se utente ha entrambi i profili approvati | — |
| 2.7 | Notifiche push in-app | 🔨 In sviluppo | P1 | Firebase Cloud Messaging. Tipi: compleanno amico, contributo ricevuto, consiglio ricevuto, acquisto verificato | — |

---

## MODULO 3 — WISHLIST E CROWDFUNDING REGALI

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 3.1 | Creazione wishlist personale | ✅ Definito | P1 | Buyer inserisce prodotto + seller + motivo evento | — |
| 3.2 | Tipi di evento | ✅ Definito | P1 | Compleanno, matrimonio, nuovo figlio, festa privata, regalo, beneficenza | Lista aperta — aggiungere altri? |
| 3.3 | Scadenza evento | ✅ Definito | P1 | Utente inserisce data. Appare nella homepage amici 7 giorni prima | — |
| 3.4 | Barra completamento crowdfunding | ✅ Definito | P1 | Visuale percentuale raggiunta sul valore totale prodotto | — |
| 3.5 | Contribuzione amici (crowdfunding) | ✅ Definito | P1 | Min: €0,01 (1 punto). Max: €10.000 per transazione. Pagamento via Stripe | — |
| 3.6 | Revoca contribuzione | ✅ Definito | P1 | Possibile solo entro 2 ore dall'invio. Dopo: non revocabile. | Cosa succede ai fondi se la raccolta non si completa? |
| 3.7 | Visibilità evento nella homepage amici | ✅ Definito | P1 | Amici vedono: nome utente, tipo evento, scadenza, prodotto, barra, n. partecipanti | — |
| 3.8 | Dettaglio evento (scheda aperta) | ✅ Definito | P1 | Profilo utente, prodotto completo, lista partecipanti, barra dettagliata | — |
| 3.9 | Copia prodotto in propria wishlist | ✅ Definito | P2 | Genera punti pubblicità al proprietario originale | Quanti punti? → da definire in Modulo 6 |
| 3.10 | Nascondi evento | ✅ Definito | P2 | L'utente può nascondere un evento dal proprio feed. Tracciato da admin | — |
| 3.11 | Metti evento tra i preferiti | ✅ Definito | P2 | Tracciato da admin | — |
| 3.12 | Wishlist condivisa per crowdfunding | ✅ Definito | P1 | Già incluso nella logica eventi. Con seller pre-scelto | — |

---

## MODULO 4 — SISTEMA "ASK HELP" (Richiesta Prodotto/Servizio)

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 4.1 | Pubblicazione richiesta aiuto | ✅ Definito | P1 | Online / Offline. Se offline: luogo, zona, città | — |
| 4.2 | Scadenza richiesta | ✅ Definito | P1 | Entro quando serve l'acquisto | — |
| 4.3 | Dettagli prodotto/servizio | 🔨 In sviluppo | P1 | Categoria, colore, materiale (oggetti), tipo servizio. Lista da completare iterativamente | Quali categorie per MVP minimo? |
| 4.4 | Risposta Shaerer alla richiesta | ✅ Definito | P1 | Suggerisce prodotto + seller. Se porta a vendita: crediti Z | — |
| 4.5 | Tracciamento risposta → acquisto | ✅ Definito | P1 | Analytics: risposta vista, click, acquisto completato | — |
| 4.6 | Moderazione richieste (ADMIN) | ✅ Definito | P2 | Pannello admin: vede tutte le richieste aperte, può intervenire | — |
| 4.7 | Nuove categorie prodotti (ADMIN + PRODUCER) | ⏳ Da definire | P2 | Processo collaborativo admin/producer per aggiungere categorie | Come funziona il processo? |

---

## MODULO 5 — PRODOTTI E PRODUCT ID

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 5.1 | Creazione prodotto da PRODUCER | ✅ Definito | P1 | Product ID formato: PRD-XXXXXX. Prodotto in stato "pending" fino ad approvazione | — |
| 5.2 | Approvazione prodotto da ADMIN | ✅ Definito | P1 | Manuale nell'MVP. Solo dopo approvazione il prodotto è visibile | Notifica al producer su approvazione/rifiuto? |
| 5.3 | Selezione prodotto da SELLER | ✅ Definito | P1 | Seller sceglie quali prodotti approvati vendere | — |
| 5.4 | Selezione prodotto da BUYER | ✅ Definito | P1 | In wishlist o acquisto diretto | — |
| 5.5 | Regole promozione per prodotto | ✅ Definito | P2 | Producer imposta fee per vendita, regole geografiche | — |
| 5.6 | Controllo geografico prodotto | ✅ Definito | P2 | Globale / Nazionale / Regionale / Locale | — |
| 5.7 | Product ID → NFT on-chain | ❌ Escluso MVP | P3 | Fase 2. Tracciamento blockchain completo | — |
| 5.8 | Archiviazione prodotto | ✅ Definito | P2 | Admin può archiviare. Dati storici mantenuti. Tracciato in analytics | — |
| 5.9 | PRODUCER = libero professionista | ✅ Definito | P1 | Avvocati, commercialisti, designer, ecc. Il "prodotto" è il servizio. Funzionamento tipo Fever | Scheda servizio: quali campi diversi da prodotto fisico? |
| 5.10 | Analytics prodotto per PRODUCER | ✅ Definito | P1 | Chi ha acquistato (aggregato), da dove, quale canale, conversion rate, wishlist count | — |

---

## MODULO 6 — SISTEMA CREDITI E GAMIFICATION

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 6.1 | Credits ledger (log immutabile) | ✅ Definito | P0 | Ogni movimento credito è un record immutabile. Nessuna modifica, solo append | — |
| 6.2 | Assegnazione crediti su eventi | ✅ Definito | P1 | Vedi tabella in Master Reference §6 | — |
| 6.3 | Scaglioni punti pubblicità | ⏳ Da definire | P1 | X punti (basso): prodotto visto in wishlist altrui. Y punti (medio): scheda aperta da suggerimento. Z punti (alto): acquisto completato da suggerimento | Definire valori esatti X, Y, Z |
| 6.4 | Crediti copia-wishlist | ⏳ Da definire | P2 | Chi copia un prodotto in wishlist genera punti al proprietario originale | Quanti punti? |
| 6.5 | Sistema missioni BUYER | ✅ Definito | P1 | 5 missioni, progressive. Vedi Progetto v1.3 §7 | — |
| 6.6 | Sistema missioni SELLER | ✅ Definito | P1 | 5 missioni, progressive. Vedi Progetto v1.3 §7 | — |
| 6.7 | Badge e livelli | ✅ Definito | P2 | Esploratore, Connettore, Ambassador, Primo Sigillo, ecc. | — |
| 6.8 | Crediti non scadono mai | ✅ Definito | P0 | Regola non negoziabile | — |
| 6.9 | Conversione crediti in € (DEX) | ❌ Escluso MVP | P3 | Fase 2 con KPMG | — |

---

## MODULO 7 — SISTEMA REFERRAL

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 7.1 | ID Universale + referral link | ✅ Definito | P0 | Ogni utente ha un link tracciabile. Generato al signup | — |
| 7.2 | Buyer invita Buyer | ✅ Definito | P1 | +25€ in crediti quando nuovo Buyer supera €150 acquisti verificati | — |
| 7.3 | Seller invita Seller | ✅ Definito | P1 | Fee % su abbonamenti e/o transato del Seller invitato | — |
| 7.4 | Shaerer porta rete | ✅ Definito | P1 | Crediti + fee sul transato generato dalla rete invitata | — |
| 7.5 | Affiliazione a un solo livello | ✅ Definito | P0 | NO catene multi-livello. Non MLM. | — |
| 7.6 | Distribuzione fee automatica | ✅ Definito | P1 | Stripe gestisce la distribuzione automatica | — |

---

## MODULO 8 — ANALYTICS E DATA LAYER

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 8.1 | Tracciamento ogni interazione utente | ✅ Definito | P0 | Tabella analytics_events. Vedi schema §5 Master Reference | — |
| 8.2 | Analytics geografici PRODUCER | ✅ Definito | P1 | Globale / Nazionale / Regionale / Locale. Aggregati, non dati personali raw | — |
| 8.3 | Abitudini acquisto per zona | ✅ Definito | P1 | Ora, giorno, frequenza, categoria prodotto, canale acquisizione | — |
| 8.4 | Analytics SELLER (dashboard) | ✅ Definito | P1 | Revenue, transazioni, top product, top customer, referral ricevuti | — |
| 8.5 | Analytics prodotto (vita completa) | ✅ Definito | P1 | Anche se prodotto archiviato: tutti i dati storici mantenuti | — |
| 8.6 | GDPR compliance | ✅ Definito | P0 | Dati aggregati/anonimizzati per analytics B2B. Consenso esplicito al signup | Schema consensi da definire |
| 8.7 | Dashboard analytics ADMIN | ⏳ Da definire | P1 | Vista globale: GMV, utenti attivi, prodotti, campagne, crediti circolanti | — |
| 8.8 | Export dati per PRODUCER | ⏳ Da definire | P2 | CSV/Excel dei propri dati aggregati | — |

---

## MODULO 9 — QR CODE E TRANSAZIONI

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 9.1 | QR code univoco per SELLER | ✅ Definito | P0 | Generato all'onboarding. Identifica il seller per ogni transazione | — |
| 9.2 | Scansione QR per verifica acquisto | ✅ Definito | P0 | Seller scansiona QR buyer → transazione verificata → crediti distribuiti | — |
| 9.3 | Kit fisico all'iscrizione SELLER | ✅ Definito | P1 | Sticker vetrina + brochure per acquisizione buyer offline | Come gestiamo la spedizione fisica? |
| 9.4 | Transazione verificata → attiva crediti | ✅ Definito | P0 | Solo transazioni verificate via QR generano crediti e abilitano recensioni | — |
| 9.5 | Log transazioni immutabile | ✅ Definito | P0 | Ogni transazione è un record permanente | — |

---

## MODULO 10 — RECENSIONI

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 10.1 | Recensione solo da acquisto verificato | ✅ Definito | P0 | Impossibile recensire senza QR confermato | — |
| 10.2 | Doppia recensione bidirezionale | ✅ Definito | P1 | Buyer recensisce Seller + Seller recensisce Buyer | — |
| 10.3 | Scala 10 stelle su 5 dimensioni | ✅ Definito | P1 | Seller valuta Buyer: cortesia, puntualità, comunicazione, rispetto, mancia. Buyer valuta Seller: qualità, servizio, corrispondenza consiglio, rapporto qualità/prezzo, esperienza | — |
| 10.4 | Recensioni visibili nel profilo | ✅ Definito | P2 | Media + numero recensioni pubbliche nel profilo | — |

---

## MODULO 11 — PANNELLO ADMIN

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 11.1 | Approvazione SELLER (documenti) | ✅ Definito | P0 | Vista documenti caricati, approvazione/rifiuto con note | — |
| 11.2 | Approvazione PRODUCER (documenti) | ✅ Definito | P0 | Come SELLER | — |
| 11.3 | Approvazione PRODOTTI | ✅ Definito | P0 | Review prodotto creato da Producer → pubblica o rifiuta | — |
| 11.4 | Gestione nuove categorie prodotti | ✅ Definito | P2 | Collaborazione admin/producer per categorie nuove | — |
| 11.5 | Overview piattaforma (KPI globali) | ⏳ Da definire | P1 | Utenti attivi, GMV, prodotti pubblicati, crediti circolanti, pending approvals | — |
| 11.6 | Configurazione parametri sistema | ✅ Definito | P1 | Tabella `platform_config`: fee, tassi crediti, parametri scaglioni | — |
| 11.7 | Analytics completo (tutti gli attori) | ✅ Definito | P1 | Vista aggregata su tutti i dati della piattaforma | — |
| 11.8 | Gestione campagne pubblicitarie | ⏳ Da definire | P2 | Vista campagne attive, budget consumato, performance | — |

---

## MODULO 12 — CAMPAGNE PUBBLICITARIE SELLER

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 12.1 | Attivazione campagna con budget | ✅ Definito | P1 | 10€ pre-autorizzati. Ricarica automatica a soglia | — |
| 12.2 | 25% budget per view/click | ✅ Definito | P1 | Componente visibilità minima | — |
| 12.3 | 75% budget solo su vendita verificata | ✅ Definito | P0 | Non negoziabile. Cuore del modello | — |
| 12.4 | Fee piattaforma su transato | ✅ Definito | P0 | Decisa solo da Shaer.it. Non modificabile | — |
| 12.5 | Statistiche campagna SELLER | ✅ Definito | P2 | ROI tracciato al singolo acquisto | — |

---

## MODULO 13 — INTEGRAZIONI E INFRASTRUTTURA

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 13.1 | Stripe abbonamenti SELLER | ✅ Definito | P0 | €100/mese. Webhook per aggiornare stato abbonamento | — |
| 13.2 | Stripe pagamenti commissioni | ✅ Definito | P1 | Gestione distribuzione fee automatica | — |
| 13.3 | Firebase Cloud Messaging | ✅ Definito | P1 | Notifiche push PWA | — |
| 13.4 | Supabase Storage (documenti) | ✅ Definito | P1 | Upload P.IVA, contratti per onboarding SELLER/PRODUCER | — |
| 13.5 | Email transazionali | ⏳ Da definire | P1 | Provider da scegliere: Brevo / Postmark. Tipo: verifica email, approvazione, notifiche | — |

---

## ⚠️ CONFLITTI E DECISIONI APERTE

| # | Conflitto / Domanda | Modulo | Stato | Decisione |
|---|---|---|---|---|
| C1 | Cosa succede ai fondi crowdfunding se la raccolta non si completa entro la scadenza? Vengono rimborsati automaticamente o restano sospesi? | 3 | ⏳ Aperto | — |
| C2 | Il PRODUCER libero professionista (avvocato, designer, ecc.) ha una scheda prodotto diversa da un prodotto fisico? Quali campi specifici? | 5 | ⏳ Aperto | — |
| C3 | I valori esatti degli scaglioni crediti pubblicità (X, Y, Z) devono essere definiti prima dello sviluppo | 6 | ⏳ Aperto | — |
| C4 | Come comunichiamo ai SELLER la data di attivazione del pagamento (silent launch)? Email automatica? Data fissa nel contratto? | 1 | ⏳ Aperto | — |
| C5 | Gestione spedizione kit fisico (sticker + brochure) ai SELLER: processo interno o esterno? | 9 | ⏳ Aperto | — |
| C6 | GDPR: schema completo dei consensi da raccogliere al signup per i diversi ruoli | 8 | ⏳ Aperto | — |
| C7 | Quanti punti genera la copia di un prodotto da wishlist altrui alla propria? | 3/6 | ⏳ Aperto | — |

---

## 📋 NOTE DI IMPLEMENTAZIONE — SESSIONI DI LAVORO

> Aggiungi qui le decisioni prese durante le sessioni di lavoro con data.

| Data | Modulo | Decisione / Aggiornamento | Autore |
|---|---|---|---|
| Maggio 2026 | Tutti | Documento creato da zero basandosi su v1.3 del progetto e sketch allegati | Nick + Claude |
| — | — | — | — |

---

## 🌿 RAMI DI SVILUPPO SUGGERITI

Per lavorare in modo ordinato, il progetto si divide in questi rami (branch nel repository):

| Ramo | Contenuto | Stato |
|---|---|---|
| `main` | Codice stabile in produzione | — |
| `dev` | Integrazione funzionalità completate | — |
| `feat/auth` | Autenticazione e profili (Modulo 1) | — |
| `feat/homepage` | Le 4 homepage per ruolo (Modulo 2) | — |
| `feat/wishlist` | Wishlist e crowdfunding (Modulo 3) | — |
| `feat/ask-help` | Sistema richiesta aiuto (Modulo 4) | — |
| `feat/products` | Prodotti e Product ID (Modulo 5) | — |
| `feat/credits` | Crediti e missioni (Modulo 6) | — |
| `feat/analytics` | Data layer e analytics (Modulo 8) | — |
| `feat/admin` | Pannello amministratore (Modulo 11) | — |

---

*Shaer.it Backlog Table v1.0 — Maggio 2026*
*⚠️ Documento vivo — aggiorna costantemente*

---

---

## MODULO 14 — TRANSACTION ID SYSTEM (QR + CICLO COMPLETO)
> 📅 Aggiunto: Maggio 2026 | Sessione: Architettura QR e ranking utenti

### Concetto Chiave
Ogni richiesta "Ask Help" genera un **Transaction ID (TXN-XXXXXX)** univoco che accompagna l'intera vita dell'interazione — dalla richiesta all'acquisto. Il QR code è la rappresentazione fisica di questo ID. La transazione rimane "aperta" finché non viene completato l'acquisto fisico verificato.

### Stati del Transaction ID
```
OPEN       → richiesta pubblicata, suggerimenti in raccolta
SUGGESTED  → almeno 1 suggerimento ricevuto, utente in valutazione
IN_PROGRESS → utente si è mosso verso il seller (geolocalizzazione o conferma)
COMPLETED  → acquisto confermato (qualsiasi metodo di pagamento)
EXPIRED    → scadenza raggiunta senza acquisto
ABANDONED  → utente ha esplicitamente chiuso senza acquistare
```

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 14.1 | Generazione Transaction ID al momento della richiesta | ✅ Definito | P0 | Formato: `TXN-XXXXXX`. Generato automaticamente. Contiene: buyer_id, timestamp, categoria, zona, scadenza | — |
| 14.2 | QR code fisico legato al Transaction ID | ✅ Definito | P0 | Il QR è la rappresentazione del TXN-ID. Il Seller scansiona e vede tutto ciò che serve per completare la vendita | — |
| 14.3 | Payload del QR (cosa vede il Seller) | ✅ Definito | P0 | Nome buyer (o anonimo), prodotto richiesto, budget indicato, valore suggerito dagli Shaerer, metodo pagamento preferito, crediti disponibili del buyer | — |
| 14.4 | Metodi di pagamento accettati dal Seller | ✅ Definito | P0 | Contanti / Carta / Punti Shaer Credits / Misto. Il Seller seleziona quale metodo è stato usato. Il sistema registra senza processare (no payment gateway obbligatorio per pagamenti fisici) | — |
| 14.5 | Chiusura transazione da parte del Seller | ✅ Definito | P0 | Seller scansiona QR → vede dettagli → conferma "Vendita completata" + metodo pagamento → TXN passa a COMPLETED → crediti distribuiti automaticamente | — |
| 14.6 | Transazioni aperte multiple (limite) | ✅ Definito | P1 | Oltre 3 TXN in stato OPEN/SUGGESTED per lo stesso buyer → rank "inaffidabile" attivato → gli Shaerer NON guadagnano punti su nuovi suggerimenti per quel buyer finché non chiude almeno 1 | Soglia 3 modificabile da admin via platform_config |
| 14.7 | TXN non completato → lista "Da completare" | ✅ Definito | P1 | Nella homepage buyer compare sezione "Richieste aperte" con le TXN non ancora chiuse. L'algoritmo monitora. | — |
| 14.8 | Premio acquisto entro tempo X | ✅ Definito | P2 | Se buyer completa la transazione entro N ore/giorni dalla richiesta → bonus crediti. Parametro N configurabile da admin. | Definire valore N default |
| 14.9 | Penalizzazione buyer con rank inaffidabile | ✅ Definito | P1 | >3 TXN aperte: badge "rank inaffidabile" visibile agli Shaerer. Shaerer non guadagna punti su risposte a buyer inaffidabile. | — |
| 14.10 | Storico TXN immutabile (anche post-chiusura) | ✅ Definito | P0 | Ogni TXN completato o scaduto rimane in DB con tutti i dati. Mai cancellato. Base per analytics futuro. | — |
| 14.11 | TXN leggibile dall'algoritmo di ranking | ✅ Definito | P1 | L'algoritmo usa i TXN per calcolare: conversion rate buyer, affidabilità buyer, qualità suggerimenti Shaerer, performance seller | — |

---

## MODULO 15 — SISTEMA DI RANKING TRIPARTITO
> 📅 Aggiunto: Maggio 2026 | Sessione: Architettura QR e ranking utenti
> Ogni attore ha un rank pubblico basato su comportamenti verificati. Non opinioni — dati.

### I 3 Rank del Sistema

**BUYER RANK** — misura affidabilità come acquirente
**SHAERER RANK** — misura qualità dei suggerimenti
**SELLER RANK** — misura qualità del servizio

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 15.1 | Buyer Rank — calcolo | ✅ Definito | P1 | Fattori: % TXN completate / TXN totali, velocità di chiusura, n. TXN aperte simultanee, qualità recensioni ricevute da Seller, puntualità (se ha confermato appuntamento) | — |
| 15.2 | Shaerer Rank — calcolo | ✅ Definito | P1 | Fattori: % suggerimenti che portano a TXN COMPLETED, velocità risposta, qualità percepita dal buyer (rating post-acquisto), n. suggerimenti totali verificati | — |
| 15.3 | Seller Rank — calcolo | ✅ Definito | P1 | Fattori: % TXN accettate e chiuse, puntualità appuntamenti, recensioni buyer post-acquisto, n. rifiuti di pagamento registrati, media stelle su 5 dimensioni | — |
| 15.4 | Rank pubblico visibile nel profilo | ✅ Definito | P2 | Ogni utente vede il rank degli altri prima di interagire (es. Shaerer vede rank buyer prima di rispondere) | — |
| 15.5 | Rank non falsificabile | ✅ Definito | P0 | Il rank si calcola SOLO su eventi verificati (TXN con QR confermato). Zero possibilità di auto-recensirsi o gonfiare il rank. | — |
| 15.6 | Soglie rank visibili | ⏳ Da definire | P2 | Es: Nuovo / Affidabile / Verificato / Top / Elite. Parametri da definire. | Definire soglie numeriche per ogni livello |
| 15.7 | Impatto rank sui crediti | ✅ Definito | P1 | Shaerer con rank alto → moltiplicatore sui crediti guadagnati. Buyer con rank basso → Shaerer non guadagna punti sui suoi suggerimenti. | — |

---

## MODULO 16 — PUSH JOURNEY (Sequenza Notifiche per Transazione)
> 📅 Aggiunto: Maggio 2026 | Sessione: Architettura QR e ranking utenti
> Ogni TXN aperta attiva una sequenza automatica di push/domande. Ogni risposta = dati + punti per chi risponde.

### Sequenza Push per il BUYER (dalla richiesta all'acquisto)

| Step | Trigger | Messaggio / Domanda | Punti risposta | Dato raccolto |
|---|---|---|---|---|
| B1 | Subito dopo pubblicazione richiesta | "La tua richiesta è attiva! Riceverai suggerimenti a breve." | — | — |
| B2 | Primo suggerimento ricevuto | "Hai ricevuto un consiglio da [Shaerer]! Ti è utile?" → Sì/No/Parzialmente | +1 credito | qualità_suggerimento_percepita |
| B3 | 2+ suggerimenti ricevuti | "Hai già N consigli. Quale ti convince di più?" → scelta | +2 crediti | suggerimento_preferito_id |
| B4 | Buyer si muove verso il seller (o X ore dopo scelta) | "Stai andando da [Seller]? Stai incontrando traffico?" → Sì/No | +1 credito | mobilità_buyer, traffico_zona |
| B5 | Arrivo stimato / X minuti dopo B4 | "Com'è la vetrina del negozio? Primo impatto?" → ⭐⭐⭐⭐⭐ | +2 crediti | rating_vetrina_seller |
| B6 | Post-acquisto (TXN = COMPLETED) | "Hai acquistato! Com'è il prodotto rispetto alla descrizione?" → ⭐⭐⭐⭐⭐ | +3 crediti | rating_prodotto |
| B7 | Post-acquisto +1h | "Com'è stato il venditore?" → ⭐⭐⭐⭐⭐ + testo opzionale | +3 crediti | rating_seller_post_acquisto |
| B8 | Post-acquisto (messaggio finale) | "Grazie! I tuoi crediti sono stati accreditati. [Shaerer] ti ringrazia per aver completato l'acquisto." | — | — |

### Sequenza Push per il SELLER (quando una TXN è diretta a lui)

| Step | Trigger | Messaggio / Domanda | Punti risposta | Dato raccolto |
|---|---|---|---|---|
| S1 | TXN indirizzata al suo negozio | "Un cliente sta arrivando per [prodotto]. Preparati!" | — | — |
| S2 | Appuntamento confermato | "Il cliente è in orario?" → Sì / In ritardo / Non si è presentato | +2 crediti | puntualità_buyer |
| S3 | Post-interazione (30 min dopo S2) | "Com'è andato il cliente? Era cordiale?" → ⭐⭐⭐⭐⭐ | +2 crediti | cortesia_buyer |
| S4 | TXN COMPLETED | "Ha pagato? Come?" → Contanti / Carta / Crediti / Ha rifiutato | +3 crediti | metodo_pagamento, comportamento_pagamento |
| S5 | Se "Ha rifiutato" in S4 | "Vuoi segnalare il comportamento?" → Sì/No + note opzionali | — | segnalazione_buyer |

### Sequenza Push per lo SHAERER (chi ha suggerito)

| Step | Trigger | Messaggio / Domanda | Punti risposta | Dato raccolto |
|---|---|---|---|---|
| SH1 | Buyer sceglie il suo suggerimento | "Il tuo consiglio è stato scelto! Il buyer si sta dirigendo da [Seller]." | +5 crediti | conversione_suggerimento |
| SH2 | TXN COMPLETED | "Acquisto completato grazie al tuo consiglio! Ecco i tuoi crediti: [Z punti]" | crediti Z | conferma_conversione |
| SH3 | TXN EXPIRED/ABANDONED | "La richiesta è scaduta senza acquisto. Il tuo suggerimento rimane nel tuo storico." | — | qualità_storica_suggerimento |

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 16.1 | Engine sequenza push per TXN | ✅ Definito | P1 | Ogni TXN attiva una sequenza di push automatici. Ogni step ha trigger, messaggio, crediti e campo dato da raccogliere. | — |
| 16.2 | Risposta alle push = punti | ✅ Definito | P1 | Ogni risposta a una domanda push genera crediti all'utente che risponde. Incentivo alla raccolta dati. | — |
| 16.3 | Dati push → analytics | ✅ Definito | P1 | Ogni risposta viene salvata in analytics_events con TXN_id, step, risposta, timestamp | — |
| 16.4 | Push non invasive (limite giornaliero) | ⏳ Da definire | P1 | Max N push al giorno per utente. Parametro configurabile da admin. | Definire N default |
| 16.5 | Messaggio ringraziamento finale a tutti | ✅ Definito | P1 | A TXN COMPLETED: push a Buyer + Shaerer + Seller con riassunto crediti accreditati e ringraziamento | — |
| 16.6 | Segnalazione comportamento da Seller | ✅ Definito | P2 | Se buyer non si presenta o rifiuta pagamento → Seller può segnalare → impatta rank buyer | — |

---

## MODULO 17 — RECENSIONI VERIFICATE (LOGICA COMPLETA)
> 📅 Aggiunto: Maggio 2026 | Sessione: Architettura QR e ranking utenti
> Recensire è possibile SOLO se TXN = COMPLETED con QR confermato. Zero eccezioni.

| # | Funzionalità | Stato | Priorità | Regole / Dettagli | Note Aperte |
|---|---|---|---|---|---|
| 17.1 | Gate recensione = TXN COMPLETED | ✅ Definito | P0 | Il form recensione è fisicamente inaccessibile se non esiste un TXN COMPLETED collegato. Lato backend: check obbligatorio. | — |
| 17.2 | Recensione Buyer → Seller | ✅ Definito | P0 | 5 dimensioni × 10 stelle: qualità prodotto, servizio, corrispondenza al consiglio, rapporto qualità/prezzo, esperienza complessiva | — |
| 17.3 | Recensione Seller → Buyer | ✅ Definito | P0 | 5 dimensioni × 10 stelle: cortesia, puntualità, comunicazione, rispetto, comportamento pagamento | — |
| 17.4 | Recensione Buyer → Shaerer | ✅ Definito | P1 | Post-acquisto: il buyer valuta la qualità del suggerimento ricevuto. 3 dimensioni: pertinenza, precisione, utilità | — |
| 17.5 | Finestra temporale per recensire | ⏳ Da definire | P1 | Entro quanti giorni dal TXN COMPLETED si può ancora lasciare recensione? | Proposta: 30 giorni. Confermare. |
| 17.6 | Recensione modificabile? | ⏳ Da definire | P1 | Una volta inviata, la recensione è modificabile entro X ore? O è definitiva? | Decisione da prendere (C8) |
| 17.7 | Visibilità pubblica recensioni | ✅ Definito | P2 | Media + numero nel profilo pubblico. Dettaglio visibile solo agli utenti registrati | — |
| 17.8 | Risposta del recensito | ⏳ Da definire | P2 | Il Seller/Buyer può rispondere pubblicamente a una recensione ricevuta? | — |

---

## AGGIORNAMENTO CONFLITTI APERTI

| # | Conflitto / Domanda | Modulo | Stato | Decisione |
|---|---|---|---|---|
| C8 | Le recensioni sono modificabili dopo l'invio? Entro quanto tempo? | 17 | ⏳ Aperto | — |
| C9 | Soglia rank "inaffidabile": 3 TXN aperte è il valore giusto? Troppo restrittivo per utenti nuovi? | 14 | ⏳ Aperto | — |
| C10 | Max push giornalieri per utente: qual è il numero che non risulta invasivo ma mantiene l'engagement? | 16 | ⏳ Aperto | — |
| C11 | Premio acquisto entro tempo X (Mod 14.8): qual è il valore di N (ore/giorni)? | 14 | ⏳ Aperto | — |
| C12 | Finestra recensione post-TXN: 30 giorni è corretto o troppo lungo/corto? | 17 | ⏳ Aperto | — |

---

## LOG AGGIORNAMENTI

| Data | Modulo | Decisione / Aggiornamento | Autore |
|---|---|---|---|
| Maggio 2026 | 14, 15, 16, 17 | Aggiunti 4 nuovi moduli: Transaction ID System, Ranking Tripartito, Push Journey, Recensioni Verificate. Risolve architettura QR completa. | Nick + Claude |
| Maggio 2026 | Tutti | Documento creato da zero basandosi su v1.3 del progetto e sketch allegati | Nick + Claude |

