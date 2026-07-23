# SHAER.IT — NOTE DI SESSIONE & DECISIONI DA BLOCCARE
## Audit regole · Punti di inserimento · Nuovi conflitti · Guida al Simulatore
> Versione 1.0 | Giugno 2026 | Uso interno
> 📎 Da usare insieme a: `SHAER_IT_MASTER_REFERENCE_v1_1.md` + `SHAER_IT_BACKLOG_TABLE_v1_1.md`
> 🎯 Obiettivo di questo file: dirti **esattamente dove** aggiungere le regole mancanti e **cosa decidere** prima di scrivere codice, così non si lavora due volte.

---

## 1. AUDIT DELLE 5 REGOLE RICHIESTE

| # | Regola richiesta | Presente nei doc? | Dove / cosa manca |
|---|---|---|---|
| A | Chi contribuisce a suggerire riceve la ricompensa **in ugual proporzione** | 🟡 **Parziale** | La struttura dati c'è (`txn_suggestions` con `chosen`, `credits_earned`), ma **manca la regola di ripartizione** e le percentuali (2% / +2% / 25% / 3%). Da formalizzare. |
| B | Compleanni dei contatti in home page | ✅ **Presente** | Master §4.1, Backlog 2.1 e 2.7, tabella `events`. Coperta. |
| C | Vedere status/wishlist del profilo e partecipare alla raccolta fondi | ✅ **Presente** | Tutto il Modulo 3 (Backlog) + Master §7. Coperta. |
| D | Ci si segue tramite **rubrica** o aggiungendo dalla **lista amici** | ❌ **Mancante** | Non esiste un grafo sociale: i doc citano "amici" ma non definiscono **come** nasce la relazione (import rubrica / follow). Da aggiungere. |
| E | **Liste mirate** con filtri (familiari, acquirenti frequenti, interessi) | ❌ **Mancante** | Nessun concetto di liste segmentate né di targeting dell'Ask. Da aggiungere (collegato ai punti 13–14 della tua richiesta). |

**In sintesi:** B e C sono ok. A è da completare con le percentuali. D ed E sono nuove e vanno aggiunte come modulo "Grafo Sociale & Targeting".

---

## 2. DOVE AGGIUNGERE LE REGOLE MANCANTI (punti di inserimento precisi)

### Regola A — Ripartizione ricompensa in ugual proporzione
**Master Reference → Sezione 10 (Flusso Economico)**, sotto "Distribuzione del 75%", aggiungi:

```
### Ripartizione tra Shaerer (regola di splitting)
Quando più Shaerer suggeriscono in una richiesta, il pool ricompensa della
campagna collegata al prodotto scelto si ripartisce IN UGUAL MISURA:
- 2%  PARTECIPAZIONE  → split tra i partecipanti (vedi C13: tutti o solo gli scelti)
- +2% SUGGERIMENTO SCELTO → split tra chi ha suggerito il prodotto scelto dal buyer
- 25% ACQUISTO VERIFICATO → split tra chi ha suggerito il prodotto scelto, alla vendita QR
- 3%  CASHBACK → al buyer che ha acquistato
Le percentuali sono parametri in platform_config (modificabili solo da Shaer.it).
```

**Backlog → Modulo 6 (Crediti)**, aggiungi righe 6.10–6.13 (una per ciascuna voce) e collega al conflitto **C13**. Aggiorna anche 6.3 (scaglioni X/Y/Z) puntando a queste percentuali.

### Regola D + E — Grafo sociale e liste mirate
Sono due funzionalità nuove: conviene un **Modulo 18 nel Backlog** + una **Sezione 18 nel Master**.

**Master Reference → nuova Sezione 18 "GRAFO SOCIALE & TARGETING"** (dopo §17):
```
- Follow: l'utente segue un contatto via import rubrica (numero in agenda) o
  aggiunta manuale dalla lista amici. Relazione direzionale (follower → followee).
- Liste mirate: l'utente crea liste di contatti filtrate per criterio
  (familiari / acquirenti frequenti / interesse:<categoria>).
- Targeting Ask Help: ogni richiesta può essere inviata a → pubblico /
  propria rete / lista specifica. (collega §8 Ask Help)
```
**Tabelle DB da aggiungere** (in §5): `social_follows (follower_id, followee_id)`,
`contact_lists (id, owner_id, name, filter)`, `contact_list_members (list_id, user_id)`.

**Backlog → nuovo Modulo 18 "GRAFO SOCIALE & TARGETING"**, righe 18.1–18.5:
import rubrica, follow/unfollow, creazione liste con filtro, gestione membri, targeting dell'Ask.

**Backlog → Modulo 4 (Ask Help)**: aggiorna 4.1 aggiungendo il campo *targeting* (pubblico / rete / lista) — oggi manca.

---

## 3. NUOVI CONFLITTI DA RISOLVERE (continuano la serie C8–C12)

Il simulatore ha fatto emergere decisioni che vanno **bloccate prima di scrivere codice di produzione**, altrimenti si rifà il lavoro.

| # | Conflitto / Domanda | Modulo | Perché è importante |
|---|---|---|---|
| **C13** | Il **2% di partecipazione** va a *tutti* i partecipanti o *solo* a chi ha suggerito il prodotto scelto? (la regola e l'esempio del documento divergono) | 6/10 | Cambia chi guadagna e l'incentivo a suggerire "a caso". Nel simulatore è un toggle: testalo. |
| **C14** | Le percentuali (2/2/25/3) sono **del pool campagna** o **del budget indicato dal buyer**? Definire la base di calcolo | 10 | È la base economica di tutto il modello. |
| **C15** | Come si finanzia il **pool ricompensa per richiesta**? Quota fissa della campagna, oppure % del budget per ogni Ask servito? | 10/12 | Determina quante richieste può "pagare" una campagna prima di esaurirsi. |
| **C16** | Campagne **collaborative**: l'approvazione richiede il versamento immediato della quota in escrow? Cosa succede se un co-creatore non approva entro X? | 12 | Definisce la meccanica di garanzia (punto 11–12). |
| **C17** | Quale **seller** viene associato al TXN quando più seller vendono lo stesso prodotto? (scelta del buyer? prossimità? prezzo?) | 14 | Oggi il sim prende il primo: serve una regola vera. |
| **C18** | **Targeting Ask**: il "pubblico" raggiunge tutti i buyer o solo entro una zona/categoria? Limiti anti-spam? | 4/18 | Evita che le richieste pubbliche diventino spam di rete. |

> Quando decidi, usa la tua frase di blocco:
> *"Approvo: [descrizione]. Aggiorna il backlog da ⏳ a ✅ e chiudi il conflitto Cx."*

---

## 4. IL SIMULATORE — COSA FA E COME USARLO

File: **`Shaer_it_Simulatore_MVP.html`** — è autonomo, offline. Aprilo con doppio clic nel browser. I dati si salvano da soli nel browser (localStorage); con **Esporta/Importa** li salvi/carichi come file `.json` (il "file specifico" che volevi).

### Cosa copre (rispetto ai tuoi punti 1–17)
- **4 pannelli + switch** (barra in alto: scegli identità + ruolo BUYER/SELLER/PRODUCER/ADMIN). ✅ (1–2)
- **Prodotto creato solo dal Producer** → approvazione ADMIN. ✅ (3)
- **Seller**: dashboard, **acquisti B2B** (contratti), **vetrina** con prezzo e bonus marketing. ✅ (4–5)
- **Campagne** Producer/Seller con **geo (città/nazione), pubblico, budget, cap giornaliero, partenza/scadenza, pausa/riattiva, ricarica**. ✅ (5–9)
- **Campagne collaborative** con budget comune + doppia approvazione → **escrow Shaer.it** come garanzia. ✅ (10–12)
- **Ask Help** con flag e **targeting** (pubblico / rete / lista) → notifiche. ✅ (13–14)
- **Suggerimenti** multipli + **motore di ripartizione** 2% / +2% / 25% / 3% in ugual misura. ✅ (15–16)
- **Verifica acquisto (QR simulato)** dal Seller → distribuzione del 25% + cashback. ✅
- **ADMIN**: approvazioni, **configurazione percentuali** (per testare ipotesi diverse), tutti i dati, analytics, **autorizzazione condivisione dati**. ✅ (17)
- **Rubrica/Follow + Liste mirate** (regole D ed E). ✅

### Flusso demo consigliato (1 ciclo completo in 2 minuti)
1. Identità **Luca (Buyer)** → *Ask Help* → categoria `sport`, target "La mia rete" → Pubblica.
2. Passa a **Sara** e poi a **Anna** → *Richieste rete* → suggerisci `Sneaker Aura` (PRD-DEMOA1).
3. Torna a **Luca** → *Ask Help* → apri il TXN → **Scegli** Sneaker Aura (parte il 2%+2%).
4. Passa ad **Anna (ruolo SELLER)** → *Conferma vendita (QR)* → conferma (parte il 25% + 3% cashback).
5. Vai in **ADMIN → Analytics / Tutti i dati** per vedere ledger, escrow e GMV muoversi.
6. In **ADMIN → Configurazione %** cambia il toggle del 2% (C13) e rifai il ciclo: vedi la differenza.

> Nota: il simulatore è uno **strumento di ragionamento**, non codice di produzione. Serve a *bloccare le regole* (C13–C18) osservando i numeri, prima di toccare Next.js/Supabase.

---

## 5. METODO PER NON SPERPERARE RISORSE

Poche regole che valgono più di mille righe di codice rifatte:

1. **Prima si bloccano i numeri, poi si scrive codice.** Le percentuali e le 6 decisioni C13–C18 sono "cemento": cambiarle dopo significa rifare il `credits_ledger`, le campagne e gli analytics. Usa il simulatore per chiuderle *oggi*.
2. **Un solo motore di ricompensa, parametrico.** Nel simulatore la ripartizione vive in 3 funzioni che leggono `config`. In produzione fai lo stesso: tutte le percentuali in `platform_config`, mai numeri "hard-coded" sparsi. Così cambi modello senza toccare il codice.
3. **Il TXN è l'unico oggetto di verità.** Tutto (suggerimenti, scelta, vendita, ricompense, recensioni) appende dati al TXN. Non creare flussi paralleli: un solo ciclo di vita, già definito (OPEN→…→COMPLETED).
4. **Escrow = una sola fonte di pagamento.** Le ricompense escono solo dall'escrow Shaer.it. Nessun altro percorso di denaro. Questo semplifica la compliance (KPMG) e l'audit.
5. **Protocollo documenti, ogni sessione.** Apri allegando i 2 file vivi, dichiara l'obiettivo, chiudi scaricando i file aggiornati. Niente decisioni "a voce" che poi spariscono.
6. **MVP onesto.** Targeting pubblico, anti-spam, campagne collaborative complesse: definiscile nel doc ma valuta di rimandarle a dopo il pilota Roma. Per il pilota basta: Producer→Seller→Ask→suggerimenti→QR→ricompensa. Tutto il resto è "P2".
7. **Anti-frode prima di scalare.** La regola "rank inaffidabile" e il gate "recensione solo da TXN COMPLETED" vanno nel codice dal giorno 1, non aggiunti dopo: riscriverli a posteriori è costoso.

---

## 6. PROSSIMI PASSI SUGGERITI
1. Girare il flusso demo nel simulatore e **bloccare C13 e C14** (le due più strutturali).
2. Aggiornare Master §10 + §18 e Backlog Moduli 6, 4, e nuovo 18 con i testi della Sezione 2 qui sopra.
3. Chiudere C15–C18 nella prossima sessione.
4. Solo allora: wireframe delle 4 home + struttura tabelle definitiva → primo codice `feat/credits` e `feat/ask-help`.

*Fine documento — Note di Sessione v1.0, Giugno 2026.*
