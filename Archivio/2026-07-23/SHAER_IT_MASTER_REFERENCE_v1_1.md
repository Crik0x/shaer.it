# SHAER.IT — MASTER REFERENCE DOCUMENT
## Documento di Orientamento Architetturale Permanente
> Versione 1.0 | Maggio 2026 | Uso Interno Riservato
> ⚠️ Questo documento è la fonte di verità del progetto. Ogni decisione tecnica e di prodotto si confronta con questo file.

---

## 0. COME USARE QUESTO DOCUMENTO

Questo file è il **punto di riferimento fisso** del progetto Shaer.it. Non va riscritto — va aggiornato con versioning. Prima di qualsiasi sessione di lavoro con Claude o con un developer:

1. Allega sempre questo file alla conversazione
2. Indica la sezione che stai modificando
3. Ogni modifica importante genera una nuova versione del documento (v1.0 → v1.1)

**Documento separato e complementare:** `SHAER_IT_BACKLOG_TABLE.md` — contiene tutte le funzionalità, il loro stato, le priorità e le note aperte. Questo file qui descrive l'architettura stabile. Il backlog descrive cosa cambia.

---

## 1. IDENTITÀ DEL PROGETTO

| Campo | Valore |
|---|---|
| Nome | Shaer.it |
| Tagline | Share. Earn. Win Together. |
| Fondatore | Nick (Milano/Roma, Italy) |
| Fase attuale | MVP in sviluppo — Pilota silenzioso Roma |
| Versione documento | 1.0 — Maggio 2026 |
| Documento di progetto | Shaer_it_v1.3 (fonte originale) |

**Visione:** Shaer.it trasforma il passaparola in un sistema economico strutturato, tracciabile e remunerato. Infrastruttura scalabile per community, club, aziende ed ecosistemi che crescono tramite relazioni incentivate e misurabili.

**Missione:** Ridistribuire il valore generato dai dati degli utenti — sottraendolo al monopolio di Meta e Google — restituendolo alle persone che lo generano, senza mai fare pubblicità tradizionale.

**Principio anti-frode non negoziabile:** Recensioni e crediti hanno integrità SOLO se le transazioni sono verificate via QR. Nessuna eccezione.

---

## 2. I 4 ATTORI DEL SISTEMA — NOMENCLATURA UFFICIALE

> ⚠️ Questi nomi sono fissi in tutto il codebase, database, UI e documentazione. Non usare sinonimi.

| Codice Ruolo | Nome Display IT | Nome Display EN | Descrizione |
|---|---|---|---|
| `BUYER` | Utente | User | Consumatore finale. Acquista, condivide, riceve regali. |
| `SELLER` | Rivenditore | Seller | Negozio fisico, agenzia, libero professionista con P.IVA. |
| `PRODUCER` | Produttore | Producer | Brand/azienda che crea prodotti originali con Product ID. |
| `ADMIN` | Amministratore | Admin | Team Shaer.it. Controllo totale della piattaforma. |

**Regola dual-mode:** Un utente può avere sia profilo BUYER che SELLER contemporaneamente. Switch immediato dall'header dell'app. I crediti sono separati per profilo ma trasferibili.

**PRODUCER ≠ SELLER:** Il Producer non vende direttamente al Buyer. Crea il prodotto, lo registra sulla piattaforma con ID univoco, e opera attraverso i Seller.

**PRODUCER include liberi professionisti:** Avvocati, commercialisti, designer, programmatori. Il loro "prodotto" è il servizio. Funzionamento simile a Fever per i servizi.

---

## 3. ARCHITETTURA TECNICA — STACK UFFICIALE MVP

| Layer | Tecnologia | Note |
|---|---|---|
| Frontend | Next.js 14 (PWA) | No app nativa nell'MVP |
| Backend | Node.js + Express | API REST |
| Database | PostgreSQL via Supabase | Schema definito in Sezione 5 |
| Auth | Supabase Auth | Email verification obbligatoria |
| Storage | Supabase Storage | Foto prodotti, documenti onboarding |
| Notifiche | Firebase Cloud Messaging | Push notifications |
| Pagamenti | Stripe | Abbonamenti €100/mese + commissioni |
| Deploy | Vercel (frontend) + Railway (backend) | — |

**Nomenclatura database:** Tutto in **inglese**. Nessuna eccezione. Nessun campo misto.

---

## 4. I 4 PROFILI — ACCESSO E REGISTRAZIONE

### 4.1 BUYER (Utente)
- Registrazione: email + password → verifica email obbligatoria
- Nessun documento richiesto
- ID formato: `SHR-B-XXXXXX`
- Homepage: feed amici, eventi/compleanni, wishlist, "To Do"
- Può richiedere upgrade a SELLER (processo separato)

### 4.2 SELLER (Rivenditore)
- Registrazione separata da BUYER (form distinto)
- Documenti richiesti: P.IVA, legale rappresentante, contratto B2B firmato
- Approvazione: **manuale da ADMIN nell'MVP**, automatica in fase successiva
- ID formato: `SHR-S-XXXXXX`
- Abbonamento: €100/mese (include 100 crediti mensili)
- Homepage: dashboard operativa, QR scanner, transazioni, statistiche
- Silent launch: si iscrivono ora, pagamento attivato al lancio ufficiale

### 4.3 PRODUCER (Produttore)
- Accesso completamente separato da BUYER/SELLER
- Documenti richiesti: P.IVA, legale rappresentante, contratto B2B firmato
- Approvazione: **manuale da ADMIN nell'MVP**
- ID formato: `SHR-P-XXXXXX`
- Crea prodotti con Product ID univoco → approvazione ADMIN prima della pubblicazione
- Dashboard: GMV, analytics geografici, referral, campagne, token flow
- Visibilità dati: globale / nazionale / regionale / locale

### 4.4 ADMIN (Amministratore)
- Accesso separato, non registrabile pubblicamente
- Creazione account solo da pannello admin esistente
- Poteri: approvazione SELLER e PRODUCER, gestione prodotti, tutte le analytics, configurazione sistema

---

## 5. SCHEMA DATABASE — TABELLE PRINCIPALI

> Nomenclatura: tutto inglese. Foreign keys esplicite. Ogni tabella ha `created_at` e `updated_at`.

### Tabelle Core

```
users                    — tutti gli utenti (auth layer)
user_profiles            — dati estesi buyer
seller_profiles          — dati rivenditori (P.IVA, documenti, status approvazione)
producer_profiles        — dati produttori (P.IVA, documenti, status approvazione)
products                 — prodotti con product_id univoco
product_approvals        — log approvazioni prodotti da admin
transactions             — ogni transazione verificata via QR
qr_codes                 — QR univoci per ogni seller
credits_ledger           — log immutabile di tutti i movimenti crediti
referrals                — tracking referral link
missions                 — definizione missioni (buyer e seller)
mission_progress         — avanzamento missioni per utente
wishlists                — wishlist utente con seller prescelto
wishlist_items           — singoli prodotti in wishlist
wishlist_contributions   — contributi crowdfunding (con revoca entro 2h)
events                   — compleanni, matrimoni, eventi personali utente
event_visibility         — chi può vedere un evento (amici, pubblico)
reviews                  — recensioni (solo da transazione verificata)
help_requests            — richieste "Ask Help" (dove comprare un prodotto)
help_responses           — risposte degli Shaerer alle richieste
notifications            — log notifiche push
analytics_events         — ogni evento tracciato (view, click, hide, copy, share)
platform_config          — configurazione parametri sistema
```

### Tabella `analytics_events` — Cuore del Data Layer

```sql
CREATE TABLE analytics_events (
  id              BIGSERIAL PRIMARY KEY,
  event_type      TEXT NOT NULL,
  -- event_type values:
  -- 'product_view', 'product_click', 'product_hide', 'product_favorite',
  -- 'product_copy_to_wishlist', 'wishlist_view', 'wishlist_contribute',
  -- 'wishlist_revoke', 'help_request_view', 'help_response_click',
  -- 'transaction_qr_scan', 'referral_click', 'referral_convert',
  -- 'review_left', 'mission_completed', 'profile_view'
  actor_user_id   UUID REFERENCES auth.users(id),
  target_user_id  UUID,           -- utente "osservato" se applicabile
  product_id      TEXT,           -- product_id se applicabile
  seller_id       TEXT,           -- seller se applicabile
  producer_id     TEXT,           -- producer se applicabile
  metadata        JSONB,          -- dati extra flessibili
  location_region TEXT,           -- es. "Lazio"
  location_city   TEXT,           -- es. "Roma"
  location_zone   TEXT,           -- es. "Prati"
  session_id      TEXT,
  platform        TEXT,           -- 'web', 'pwa'
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. SISTEMA CREDITI (SHAER CREDITS)

| Evento | Reward | Attore |
|---|---|---|
| Registrazione | +10 crediti | Buyer / Shaerer |
| Domanda pubblicata | +1 credito | Buyer |
| Consiglio pubblicato | +5 crediti | Shaerer |
| Vendita verificata QR | +10% dell'importo | Shaerer che ha consigliato |
| Recensione lasciata | +2 crediti | Buyer + Seller |
| Referral nuovo utente | +20 crediti | Shaerer |
| Piano mensile Seller | +100 crediti/mese | Seller (inclusi) |
| Referral acquisto €150 | +25€ in crediti | Chi ha invitato |
| Prodotto visto nella propria wishlist (x visualizzazioni) | punti X (scaglione basso) | Buyer/Shaerer |
| Utente ha aperto la scheda prodotto da suggerimento | punti Y (scaglione medio) | Shaerer |
| Acquisto completato da suggerimento | punti Z (scaglione massimo) | Shaerer |

**Parametri fissi MVP:**
- 100 crediti = €1,00
- I crediti non scadono mai
- MVP: crediti spendibili solo internamente (punti, non valuta)
- Fase 2: conversione in € tramite DEX (post-MVP, strutturazione con KPMG)

**Fee piattaforma:** Decisa esclusivamente da Shaer.it. Non negoziabile. Non modificabile da Seller o Producer.

---

## 7. SISTEMA WISHLIST E CROWDFUNDING

### Logica Core
- Ogni BUYER crea una wishlist con prodotti desiderati
- Per ogni prodotto: seleziona il SELLER dove vuole essere acquistato
- Indica il motivo (evento: compleanno, matrimonio, nuovo figlio, beneficenza, regalo, festa privata, ecc.)
- Gli amici vedono l'evento sulla propria homepage con:
  - Nome dell'utente
  - Scadenza (visibile 1 settimana prima)
  - Prodotto desiderato
  - Barra di completamento crowdfunding
  - Numero partecipanti

### Regole Contribuzioni
- Minimo: €0,01 (1 punto)
- Massimo per transazione: €10.000
- Revoca possibile solo entro 2 ore dall'invio
- Dopo 2 ore: non revocabile

### Dati Tracciati per Ogni Item Wishlist
- Tempo in wishlist
- Punti ricevuti totali
- Tempo per completare la raccolta
- Numero persone che hanno contribuito
- Numero visualizzazioni
- Chi ha nascosto l'evento (e quando)
- Chi ha messo tra i preferiti
- Chi ha copiato il prodotto nella propria wishlist (genera punti pubblicità al proprietario originale)

---

## 8. SISTEMA "ASK HELP" (Richiesta Aiuto)

Un utente può in qualsiasi momento pubblicare una richiesta di acquisto:

**Parametri richiesta (MVP base):**
- Dove vuole acquistare: online / offline
- Se offline: dati del luogo (nome, indirizzo, zona, città)
- Scadenza: entro quando serve l'acquisto
- Tipo di prodotto (categoria)
- Dettagli prodotto: colore, materiale (per oggetti), tipo servizio

**Flusso risposta:**
- Gli Shaerer vedono le richieste attive nel proprio feed
- Rispondono consigliando prodotto + seller
- Se il buyer acquista tramite il consiglio → crediti Z allo Shaerer

**Pannello Admin:** Controllo e moderazione delle richieste aperte. Collaborazione con Producer per nuove categorie di prodotti.

---

## 9. SISTEMA PRODOTTI E PRODUCT ID

### Ciclo di Vita Prodotto

```
Producer crea prodotto
        ↓
Admin approva (MVP: manuale)
        ↓
Prodotto pubblicato con Product ID univoco
        ↓
Seller seleziona prodotto per venderlo
        ↓
Buyer seleziona prodotto in wishlist o acquisto diretto
        ↓
Acquisto verificato via QR → tracciamento completo
```

### Product ID
- Formato: `PRD-XXXXXX` (es. `PRD-A3K9M1`)
- Ogni prodotto ha regole di promozione personalizzabili dal Producer
- Controllo geografico: globale / nazionale / regionale / locale
- In futuro (Fase 2): Product ID legato a NFT per tracciamento blockchain

### Dati Tracciati per Ogni Prodotto
- Chi ha acquistato (anonimizzato per privacy, aggregato per Producer)
- Da quale zona geografica
- Abitudini di acquisto (ora, giorno, frequenza)
- Da quale canale è arrivato il cliente (referral, wishlist, help request, diretto)
- Quante volte è stato messo in wishlist
- Quante volte è stato condiviso
- Conversion rate (visto → acquistato)

---

## 10. FLUSSO ECONOMICO — COMMISSIONI

### Struttura Commissione su Vendita Verificata
- 25% del budget campagna: pagato per view/click (visibilità minima)
- 75% del budget campagna: pagato SOLO sulla vendita verificata via QR

### Distribuzione del 75%
- % alla piattaforma (fee non negoziabile)
- % agli Shaerer contributori alla vendita

### Anticipo Campagne
- 10€ pre-autorizzati per ogni campagna
- Ricarica automatica a ogni soglia
- Shaer.it non ha mai esposizione finanziaria verso i Seller

### Abbonamento Seller
- €100/mese fisso
- Include 100 crediti mensili per promozione interna
- Silent launch: iscrizione ora, primo pagamento al lancio ufficiale

---

## 11. GO-TO-MARKET — FASI

| Fase | Periodo | Target | Note |
|---|---|---|---|
| Pilota Roma | Mesi 1–5 | 100 → 1.000 negozi, 500 → 10.000 utenti | Silent launch, pagamenti differiti |
| Espansione Nazionale | Mesi 6–9 | Italia tramite rete distributori | Silent, no PR |
| Lancio Pubblico | Mesi 9–12 | Italia | PR amplifica realtà già esistente |

### Modello Distributori
- Agenti con portafoglio Seller pre-esistente
- Opzione A (Annuale): 65% abbonamenti anno 1
- Opzione B (Triennale): 85% anno 1, 35% anni 2–3 (preferred)
- Esempio 100 Seller: Anno 1 = €102.000 | Totale 3 anni = €186.000

---

## 12. SICUREZZA E AUTENTICAZIONE

### MVP (fase attuale)
- Email + password
- Verifica email obbligatoria al signup
- Sessioni gestite da Supabase Auth

### Fase Successiva (post-MVP)
- Verifica numero di telefono (OTP SMS)
- Verifica identità (documento)
- 2FA per SELLER e PRODUCER

### Approvazioni Documentali
- SELLER: P.IVA + rappresentante legale + contratto B2B → verifica manuale ADMIN
- PRODUCER: P.IVA + rappresentante legale + contratto B2B → verifica manuale ADMIN
- Fase 2: sistema automatizzato di verifica documenti

---

## 13. FUNZIONALITÀ NON NELL'MVP (RINVIATE)

| Funzionalità | Fase |
|---|---|
| Blockchain / smart contract / DEX | Fase 2 |
| App nativa iOS/Android | Fase 2 |
| NFT Product ID on-chain | Fase 2 |
| Conversione crediti in € | Fase 2 (con KPMG) |
| AI recommendation engine | Fase 2 |
| Verifica identità automatica | Fase 2 |
| Multi-livello affiliazione | MAI (non MLM) |

---

## 14. PRINCIPI GUIDA — NON NEGOZIABILI

1. **Semplicità prima di tutto** — complessità tecnica nascosta all'utente
2. **Anti-frode strutturale** — QR obbligatorio per ogni transazione verificata
3. **Mobile-first** — ogni UI progettata prima per mobile
4. **Zero advertising tradizionale** — crescita solo tramite network effect e referral
5. **Fee non negoziabili** — decise solo da Shaer.it, mai modificabili dagli attori
6. **Il distributore è asset strategico** — ogni feature che tocca i Seller considera gli incentivi del distributore
7. **Product ID System è visione a lungo termine** — decisioni MVP compatibili con scalabilità futura
8. **Pagamenti differiti al lancio** — meccanica deliberata e non modificabile
9. **Shaer.it tutela tutti** — narrativa pubblica sempre orientata alla protezione di ogni attore
10. **Data è il prodotto** — ogni interazione sulla piattaforma è un dato prezioso da tracciare e proteggere nel rispetto GDPR

---

## 15. PALETTE E DESIGN SYSTEM

| Contesto | Palette | Uso |
|---|---|---|
| B2B (Seller, Producer) | Orange + Navy | Dashboard operativa, analytics |
| Consumer (Buyer, Shaerer) | Orange + Cream/White | App consumer, feed, wishlist |
| Admin | Dark Navy + Orange accents | Pannello controllo |
| Logo | Orange gradient (#FF8C00 → #FF4500) | Brand identity |

**Note sketch (da disegni allegati):**
- Colori sfondo: BLU (chiari/scuri blu)
- Grafici: arancio, bianco, azzurro, rosso, verde
- Bottom navigation: Home | Search | [S centrale] | Ask Help / New Sell | Orders/Review

---

*Shaer.it Master Reference v1.0 — Maggio 2026*
*Fondatore: Nick | Assistito da Claude (Anthropic)*
*⚠️ Uso esclusivo interno — non distribuire*

---

## 16. TRANSACTION ID SYSTEM — ARCHITETTURA COMPLETA
> Aggiunto: Maggio 2026

### Principio Fondamentale
Ogni richiesta "Ask Help" genera un **Transaction ID (TXN-XXXXXX)** univoco. Questo ID è il filo che collega tutta la vita dell'interazione: dalla richiesta → suggerimenti → spostamento → acquisto → recensione. Il QR code è la rappresentazione fisica di questo ID che il Seller scansiona.

### Ciclo di Vita di un TXN

```
BUYER pubblica richiesta
        ↓
TXN-XXXXXX generato (stato: OPEN)
        ↓
Shaerer risponde con suggerimento
        ↓
TXN → stato: SUGGESTED
        ↓
Buyer sceglie suggerimento, si muove verso Seller
        ↓
TXN → stato: IN_PROGRESS
        ↓
Seller scansiona QR → vede payload completo
        ↓
Seller conferma vendita + metodo pagamento
        ↓
TXN → stato: COMPLETED
        ↓
Crediti distribuiti automaticamente a tutti gli attori
        ↓
Sblocco recensioni per tutti
```

### Payload QR (cosa vede il Seller quando scansiona)
- Nome buyer (o anonimo se impostato)
- Prodotto richiesto + descrizione
- Budget indicato dal buyer
- Valore suggerito dagli Shaerer
- Crediti disponibili del buyer (se vuole pagare con punti)
- Metodo pagamento preferito dal buyer
- Rank del buyer (affidabilità)

### Metodi di Pagamento Accettati (registrazione, non processing)
- Contanti
- Carta di credito/debito (POS fisico del seller, non nostro)
- Shaer Credits (scalati direttamente dal ledger)
- Misto (es. parte crediti + parte contanti)

Il sistema **registra** il metodo usato senza processare i pagamenti fisici. Solo i pagamenti in Shaer Credits sono processati direttamente dalla piattaforma.

### Schema Database — Nuove Tabelle

```sql
-- TRANSACTION ID
CREATE TABLE transactions (
  id              BIGSERIAL PRIMARY KEY,
  txn_id          TEXT UNIQUE NOT NULL,     -- TXN-XXXXXX
  buyer_id        UUID NOT NULL,
  seller_id       UUID,                      -- popolato quando buyer sceglie
  product_id      TEXT,
  status          TEXT DEFAULT 'OPEN',
  -- OPEN / SUGGESTED / IN_PROGRESS / COMPLETED / EXPIRED / ABANDONED
  budget_buyer    NUMERIC(10,2),
  value_suggested NUMERIC(10,2),
  value_final     NUMERIC(10,2),
  payment_method  TEXT,
  -- cash / card / credits / mixed
  credits_used    INT DEFAULT 0,
  zone            TEXT,
  city            TEXT,
  region          TEXT,
  expires_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- SUGGERIMENTI LEGATI A UN TXN
CREATE TABLE txn_suggestions (
  id              BIGSERIAL PRIMARY KEY,
  txn_id          TEXT REFERENCES transactions(txn_id),
  shaerer_id      UUID NOT NULL,
  seller_suggested UUID,
  product_suggested TEXT,
  value_proposed  NUMERIC(10,2),
  chosen          BOOLEAN DEFAULT false,    -- il buyer ha scelto questo?
  credits_earned  INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- PUSH JOURNEY LOG
CREATE TABLE push_journey_log (
  id              BIGSERIAL PRIMARY KEY,
  txn_id          TEXT REFERENCES transactions(txn_id),
  actor_id        UUID NOT NULL,
  actor_role      TEXT NOT NULL,            -- buyer / seller / shaerer
  step            TEXT NOT NULL,            -- B1, B2, S1, SH1, ecc.
  pushed_at       TIMESTAMPTZ DEFAULT now(),
  answered_at     TIMESTAMPTZ,
  answer          JSONB,                    -- risposta libera in JSON
  credits_awarded INT DEFAULT 0
);

-- RANK UTENTI
CREATE TABLE user_ranks (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID UNIQUE NOT NULL,
  buyer_score     NUMERIC(5,2) DEFAULT 0,
  shaerer_score   NUMERIC(5,2) DEFAULT 0,
  seller_score    NUMERIC(5,2) DEFAULT 0,
  buyer_level     TEXT DEFAULT 'new',
  shaerer_level   TEXT DEFAULT 'new',
  seller_level    TEXT DEFAULT 'new',
  -- new / trusted / verified / top / elite
  txn_completed   INT DEFAULT 0,
  txn_total       INT DEFAULT 0,
  txn_open        INT DEFAULT 0,           -- TXN correntemente aperte
  is_unreliable   BOOLEAN DEFAULT false,   -- >3 TXN aperte
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### Regola Rank Inaffidabile
- Buyer con **più di 3 TXN in stato OPEN/SUGGESTED** → `is_unreliable = true`
- Effetto: gli Shaerer NON guadagnano crediti sui suggerimenti inviati a buyer inaffidabili
- Il badge "inaffidabile" è visibile agli Shaerer prima di rispondere
- La soglia (3) è configurabile in `platform_config`

---

## 17. SISTEMA PUSH JOURNEY — PRINCIPIO ARCHITETTURALE

La sequenza di push non è casuale — è un **data collection engine** mascherato da experience. Ogni domanda raccoglie un dato specifico e ricompensa chi risponde con crediti.

**Regola di design:** ogni push deve:
1. Essere utile per l'utente (non solo per noi)
2. Raccogliere esattamente 1 dato chiaro
3. Richiedere max 2 secondi di risposta (tap su opzione)
4. Generare crediti come ricompensa

**Stack tecnico:** Firebase Cloud Messaging per il delivery. Il trigger engine gira su Node.js con job schedulati (cron su Railway). Ogni TXN che cambia stato attiva il job corrispondente.

*Master Reference v1.1 — aggiornato Maggio 2026*
