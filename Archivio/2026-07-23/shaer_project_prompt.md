# SHAER.IT — Project Context for Claude

> Questo documento è il contesto permanente del progetto Shaer.it.
> Leggilo integralmente prima di rispondere a qualsiasi richiesta.
> Non chiedere informazioni già presenti qui. Usa sempre questo contesto come base.

---

## 1. IDENTITÀ DEL PROGETTO

**Nome:** Shaer.it
**Tagline:** *"Share. Earn. Win Together."*
**Categoria:** Marketplace + AdTech + Economia dei Dati
**Fase attuale:** MVP in sviluppo — pilota silenzioso a Roma (~1.000 seller pre-registrati)
**Fondatore:** Nicolaj D'Ortona - Mykola Stetsiuk (Roma, Italy)

**Visione:**
Shaer.it trasforma il passaparola in un sistema economico strutturato, tracciabile e remunerato. È un'infrastruttura scalabile che permette a community, club, aziende ed ecosistemi di crescere attraverso relazioni incentivate e misurabili.

**Missione:**
Ridistribuire il valore generato dai dati degli utenti, sottraendolo al monopolio di Meta e Google, e restituendolo direttamente alle persone che lo generano.

---

## 2. IL PROBLEMA

- La pubblicità tradizionale è costosa, poco misurabile e pagata a click/view senza garanzia di risultato.
- Il passaparola reale è il canale di vendita più efficace al mondo, ma non viene remunerato.
- Meta e Google raccolgono dati degli utenti gratuitamente e li rivendono alle stesse aziende che li hanno generati.
- Le PMI non hanno strumenti per fare pubblicità efficace con ROI verificabile.

---

## 3. LA SOLUZIONE — FLUSSO CIRCOLARE

```
BUYER chiede consiglio
      ↓
SHAERER risponde e consiglia un SELLER
      ↓
BUYER acquista (verificato via QR code)
      ↓
SELLER/PRODUCER paga la piattaforma (budget marketing)
      ↓
CREDITI distribuiti a: Shaerer + Buyer + Piattaforma
      ↓
Crediti spendibili internamente o convertibili in €
```

**Cosa cambia rispetto alla pubblicità classica:**

| Pubblicità tradizionale | Modello Shaer.it |
|---|---|
| Budget → Ads impersonali | Budget → Persone reali |
| Target stimato | Raccomandazioni verificate |
| ROI difficile da misurare | ROI tracciabile al singolo acquisto |
| Utenti non guadagnano | Utenti ricompensati |
| Pagamento per view/click | 75% del budget pagato SOLO sulla vendita |

---

## 4. I 4 ATTORI

### 🏭 PRODUCER
Chi crea un prodotto o servizio originale (es. Coca-Cola, uno studio legale, un brand).
- Non vende direttamente ai Buyer
- Stringe accordi commerciali con i Seller
- Genera un ID prodotto/servizio e imposta le regole di promozione (globali, nazionali, regionali)
- Controlla tutti gli stati del prodotto in ogni mercato dal pannello centrale
- Può personalizzare: dinamiche di vendita, promozioni, budget marketing per livello geografico

### 🏪 SELLER
Chi rivende prodotti o servizi (negozio fisico, agenzia, broker, libero professionista).
- Punto di contatto diretto con il Buyer
- Abbonamento: **€100/mese** (include 100 crediti mensili per promuoversi)
- Paga commissioni solo su vendite verificate tramite QR
- Può impostare politiche interne: sponsorizzazioni, sconti, fidelity
- Riceve sticker per vetrina + brochure fisiche all'iscrizione

### 🛒 BUYER
L'utente finale che acquista.
- Guadagna crediti per: domande, interazioni, acquisti verificati, recensioni
- I crediti sono spendibili per acquisti sulla piattaforma
- In futuro: convertibili in € tramite DEX (non nell'MVP)

### 📣 SHAERER
Il motore del sistema. Può coincidere con Producer, Seller o Buyer.
- Consiglia, risponde a domande, partecipa a sondaggi, promuove, referral
- Guadagna crediti per ogni contributo che porta a una vendita verificata
- È il pubblicista decentralizzato della piattaforma

---

## 5. MODELLO ECONOMICO

### Revenue Streams
1. **Abbonamenti Seller:** €100/mese per seller
2. **Commissioni su transazioni:** % sul GMV generato tramite la piattaforma
3. **Crediti pubblicitari:** Seller e Producer acquistano visibilità extra con crediti

### Struttura commissione pubblicitaria
```
Budget marketing aziendale
├── 25% → pagato per view/click (componente minima)
└── 75% → pagato SOLO sulla vendita verificata
           ├── % alla piattaforma
           └── % distribuita agli Shaerer contributori
```

### Crediti Interni (SHAER Credits)
| Evento | Chi guadagna | Importo |
|---|---|---|
| Registrazione | Buyer/Shaerer | +10 crediti |
| Domanda pubblicata | Buyer | +1 credito |
| Consiglio pubblicato | Shaerer | +5 crediti |
| Vendita verificata | Shaerer (che ha consigliato) | +10% dell'importo |
| Recensione lasciata | Buyer + Seller | +2 crediti |
| Referral nuovo utente | Shaerer | +20 crediti |
| Piano mensile Seller | Seller | +100 crediti/mese inclusi |

**Tasso di cambio indicativo:** 100 crediti = €1,00
**MVP:** crediti spendibili solo internamente. DEX e conversione in € = Fase 2.

---

## 6. STRATEGIA DI DISTRIBUZIONE (GO-TO-MARKET)

### Modello distributori
- Nick si rivolge a **distributori** che hanno già un portafoglio di negozi clienti
- Incentivo distributore:
  - **75% dell'abbonamento annuale** per ogni seller registrato (€75/seller/mese)
  - **2% sul fatturato generato** da quel seller per i **prossimi 5 anni**
- Risultato: i distributori diventano forza vendita motivata senza costi fissi

### Lancio silenzioso (Silent Launch)
- Pre-registrazione seller senza pagamento attivo
- Il primo pagamento scatta solo al **lancio ufficiale nazionale**
- Obiettivo pre-lancio: coprire l'Italia intera con seller pre-registrati
- Fase pilota Roma: ~1.000 seller dalla rete esistente di Nick
- Materiali fisici all'iscrizione: **sticker per vetrina + brochure** per acquisire Buyer offline

### Timeline
```
Mese 1–3:   Sviluppo MVP
Mese 3–6:   Pilota silenzioso Roma (1.000 seller, pagamenti differiti)
Mese 6–9:   Espansione silenziosa nazionale via distributori
Mese 9–12:  Lancio pubblico nazionale con PR
Anno 2:     5+ città italiane attive
Anno 3:     Espansione europea
```

---

## 7. ARCHITETTURA TECNICA MVP

### Stack
| Layer | Tecnologia |
|---|---|
| Frontend | Next.js 14 (PWA — no app nativa nell'MVP) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Notifiche | Firebase Cloud Messaging |
| Pagamenti | Stripe (abbonamenti €100/mese) |
| QR Code | Generazione e verifica interna custom |
| Hosting | Vercel (frontend) + Railway (backend) |

### Tabelle principali del DB
- `users` — tutti gli utenti, multi-ruolo, saldo crediti
- `sellers` — profilo negozio, QR token, subscription status
- `questions` — richieste dei Buyer
- `recommendations` — consigli degli Shaerer
- `transactions` — vendite verificate via QR
- `credit_ledger` — log immutabile di tutti i movimenti crediti
- `reviews` — doppia recensione (Buyer↔Seller), solo da transazione verificata
- `distributors` — rete distributori, commissioni, revenue share

### Funzionalità MVP (Must Have)
1. Registrazione multi-ruolo (email/telefono + OTP)
2. Profilo Seller con QR code univoco generato automaticamente
3. Sistema domande/consigli con notifiche push
4. Verifica acquisto via QR + conferma bilaterale
5. Ledger crediti in tempo reale
6. Dashboard Seller (domande, consigli, transazioni, crediti)
7. Abbonamento Stripe attivato al lancio
8. Sistema recensioni doppio (Buyer↔Seller), 5 categorie × 10 stelle, solo da acquisto verificato

### Funzionalità NON nell'MVP
- ❌ Blockchain / smart contract / DEX
- ❌ App nativa iOS/Android
- ❌ MLM multi-livello
- ❌ AI recommendation engine
- ❌ Producer marketplace

---

## 8. SISTEMA RECENSIONI

- **Doppia recensione:** sia il Buyer recensisce il Seller, sia il Seller recensisce il Buyer
- **Solo da acquisto verificato:** impossibile recensire senza QR confermato — anti-frode strutturale
- **Scala 10 stelle** (non 5) su 5 dimensioni di valutazione
- Il Seller valuta il Buyer su: cortesia, puntualità, comunicazione, rispetto, mancia
- Il Buyer valuta il Seller su: qualità, servizio, corrispondenza al consiglio, rapporto qualità/prezzo, esperienza

---

## 9. PRODUCT ID SYSTEM — VISIONE SCALABILE

Ogni prodotto o servizio generato da un Producer riceve un **ID univoco** (es. `ID-001`, `ID-S001`).

Con questo ID:
- Il Producer imposta le **regole di promozione** personalizzabili per livello geografico (globale / nazionale / regionale / locale)
- Il Producer controlla in **real-time** tutti gli stati del prodotto (inventario, vendite, raccomandazioni, recensioni) in ogni mercato
- Il Seller che rivende il prodotto può impostare **politiche locali** (sconti, fidelity, sponsorizzazioni) nei limiti definiti dal Producer
- Gli Shaerer possono promuovere il prodotto e ricevere crediti secondo le regole dell'ID
- **Esempio pratico:** Coca-Cola genera `ID-001`. Imposta una campagna nazionale con budget X. Ogni negozio che vende Coca-Cola e ogni Shaerer che consiglia Coca-Cola guadagna crediti secondo le regole di quell'ID. Coca-Cola vede tutto in tempo reale dal suo pannello centrale.

---

## 10. PROIEZIONI ECONOMICHE

### Roma — Anno 1 (scenario medio)
```
1.000 seller × €100/mese = €100.000/mese ricavi abbonamenti
  → €75.000 ai distributori
  → €25.000 netti alla piattaforma

GMV stimato: €1.500.000/mese
Commissione piattaforma (es. 15%): €225.000/mese
  → 75% agli Shaerer: €168.750 (redistribuito)
  → 25% piattaforma: €56.250 netti

TOTALE NETTO PIATTAFORMA (Roma): ~€81.250/mese → ~€975.000/anno
```

### Scala nazionale (Anno 2–3)
```
Anno 2 — 5 città: ~€5M ricavi
Anno 3 — Italia + 2 paesi EU: ~€15M ricavi
Valuation stimata (multiplo 8x): €120M+
```

---

## 11. PRINCIPI GUIDA PER CLAUDE

Quando lavori su questo progetto, tieni sempre presente:

1. **Semplicità prima di tutto:** ogni funzionalità deve essere la più semplice possibile per l'utente finale. La complessità tecnica è nascosta.
2. **Anti-frode è fondamentale:** il sistema di recensioni e crediti ha integrità solo se le transazioni sono verificate. Non proporre mai soluzioni che aggirino questa logica.
3. **Mobile-first:** la maggior parte degli utenti userà l'app da mobile. Ogni UI deve essere progettata prima per mobile.
4. **Niente blockchain nell'MVP:** i crediti sono punti interni. Il DEX arriva dopo. Non complicare l'MVP.
5. **Il distributore è un asset strategico:** qualsiasi funzionalità che tocca i Seller deve considerare anche l'esperienza e gli incentivi del distributore.
6. **Il Product ID System è la visione a lungo termine:** le decisioni architetturali dell'MVP devono essere compatibili con questa scalabilità futura.
7. **Pagamenti differiti al lancio:** i Seller si iscrivono ora, pagano al lancio ufficiale. Questa meccanica è deliberata e non va cambiata.

---

## 12. GLOSSARIO

| Termine | Definizione |
|---|---|
| **Shaerer** | Utente che consiglia, promuove, referral — il motore della piattaforma |
| **Buyer** | Utente finale che acquista |
| **Seller** | Rivenditore abbonato €100/mese |
| **Producer** | Chi crea il prodotto/servizio originale |
| **Distributore** | Agente che onboarda i Seller, guadagna 75% abbonamento + 2% fatturato 5 anni |
| **SHAER Credits** | Crediti interni della piattaforma |
| **QR Verify** | Sistema di verifica acquisto offline via QR code univoco del Seller |
| **Product ID** | Identificatore univoco di prodotto/servizio, con regole di promozione associate |
| **Silent Launch** | Fase pre-lancio: seller registrati ma pagamenti non ancora attivi |
| **Credit Ledger** | Log immutabile di tutti i movimenti di crediti — cuore finanziario del sistema |
| **GMV** | Gross Merchandise Value — valore totale delle transazioni sulla piattaforma |

---

*Documento aggiornato: 2025 — Versione 1.0*
*Uso esclusivo interno — non distribuire*
