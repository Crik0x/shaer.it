# Shaer.it — Master Design Document (MDD)

Versione: 1.0 · Stato: **Visione approvata** · 2026-07-26
Autore: Nicolaj D'Ortona · Fonte-seme: `memoria/MDD.md`

> Questo è il documento-radice. Sotto di lui: [PRD](PRD.md) (cosa),
> [SAD](SAD.md) (come tecnico), [Design System](DESIGN_SYSTEM.md) (come visivo),
> [Roadmap](ROADMAP.md) (quando). In caso di conflitto, la catena di verità è
> MDD → PRD → SAD. Le decisioni `[LOCKED]` di [SHAER_MASTER](../SHAER_MASTER.md) restano tali.

---

## 1 · Visione

QR Platform non è un generatore di QR Code. È il **motore di interazione con il
cliente** dell'ecosistema Shaer.it: ogni QR è l'**apertura di una sessione**, non
un semplice link. Da quella sessione nasce una relazione monitorabile fra **chi
scansiona** e **chi ha generato** il QR (il proprietario) — e, quando c'è, l'
**intermediario** che l'ha distribuito.

> **Missione:** trasformare ogni QR Code in un assistente commerciale intelligente
> e in un nodo di una rete di relazioni verificabili.

Il valore competitivo non è il QR: è la capacità di **capire il comportamento**,
**ottimizzare la conversione** e **dare strumenti decisionali** agli imprenditori,
il tutto dentro una **rete ad albero** in cui ogni livello monitora il proprio.

## 2 · Le tre decisioni fondative (2026-07-26)

Prese da Nick all'apertura di questa sessione. Governano PRD, SAD e Roadmap.

### D-1 · Architettura del post-scan → **Ibrido** `[LOCKED]`
Il QR resta un **redirect** per default (regola d'oro 7: un QR pubblicato non si
rompe mai). In aggiunta, un QR può aprire una **landing ospitata da noi** con un
beacon di tracking. Solo sulle landing ospitate sono raggiungibili Session Engine,
Event Tracking, Journey, CRM, e-commerce. Sul redirect esterno vediamo solo lo
**scan-side** (device, geo, orario, ramo). *Conseguenza:* MDD si costruisce **per
gradi**, senza rompere il modello redirect esistente.

### D-2 · Profondità dati → **PII completo + CRM** `[LOCKED, vincolato]`
Massimo valore analitico: città, profili nominali, cronologia. **Vincolo non
negoziabile** (SAD §7): richiede **base giuridica GDPR piena** — consenso esplicito
prima di raccogliere PII, DPA con Vercel/Supabase, diritto all'oblio, minimizzazione
per default. Finché il consenso non c'è, si degrada ad **aggregati pseudonimi**
(paese, OS, lingua, `visitor_hash` salato). *La PII è un traguardo con cancello
legale, non l'impostazione di partenza.*

### D-3 · Gerarchia → **Albero di QR** (non "campagne") `[LOCKED]`
Non tabella `campaigns` separata: **ogni nodo dell'albero È un QR/link**. Un
profilo ha un **QR radice**; genera **QR-figli** come rami (campagne, interessi,
promo, **referral**). Ogni scansione apre un **portale** che connette
scanner ↔ proprietario. Un sottoalbero può essere **delegato a un intermediario**
(negoziante) che lo rivende: il figlio ha un `owner_id` diverso dall'antenato, e
**ogni livello monitora il proprio sottoalbero**. È il ponte diretto verso
[SHAER_MASTER](../SHAER_MASTER.md) (referral, anti-frode, crediti).

*Modello dati (SAD §3):* `qr_codes.parent_id` self-referenziale + `owner_id`
per-nodo + `purpose`. Single-parent in v1; molti-a-molti come evoluzione.

## 3 · Architettura concettuale — i motori

Ordinati per dipendenza: ognuno consuma l'output del precedente.

```
QR / Node Engine   →  l'albero di QR, short_code immutabile, redirect|landing
Session Engine     →  ogni scan = una sessione (id, visitor, timeline, device)
Visitor Engine     →  identità pseudonima (hash) → PII con consenso
Interaction Engine →  eventi append-only sulle landing ospitate (scroll, click, …)
Analytics Engine   →  aggregati derivati (mai saldi): KPI, funnel, heatmap, geo
Automation Engine  →  regole evento→azione (reminder, coupon, webhook)
CRM Engine         →  profilo cliente per owner: cronologia, valore, fedeltà
AI Recommendation  →  interpretazione: "il 42% abbandona dopo il 2° prodotto"
```

Principio trasversale (regola d'oro 9): **le statistiche si derivano** dalle
tabelle append-only, **mai si memorizzano come saldo**. Ogni tabella nasce con
`owner_id` + RLS: multi-tenant da subito.

## 4 · Mappa dei moduli → fase

Dal seme `memoria/MDD.md`, ricollocati sulla realtà (regola 1) e sul cancello D-2.

| # | Modulo | Motore | Fase | Note di realtà |
|---|--------|--------|------|----------------|
| 1 | QR Generator (multi-tipo, branding) | Node | **1** | oggi solo URL; estendere |
| — | **Albero di QR** (parent_id, resell) | Node | **1** | il cuore di D-3 |
| 2 | Session Engine | Session | 2 | solo su landing ospitate |
| 3 | Event Tracking (35 eventi) | Interaction | 2 | solo su landing ospitate |
| 4 | Customer Journey | Session | 2 | derivato dagli eventi |
| 5 | Analytics + Dashboard | Analytics | **1→3** | scan-side ora, eventi poi |
| 6 | Funnel | Analytics | 3 | serve Event Tracking |
| 7 | Heatmap | Interaction | 3 | serve landing ospitate |
| 8 | CRM | CRM | 4 | **cancello D-2** (PII) |
| 9 | E-commerce | — | 4+ | **no esecuzione pagamenti** |
| 10 | Ristorante (verticale) | tutti | 4+ | plugin |
| 11 | Reminder | Automation | 3 | evento→azione |
| 12 | Marketing (pixel, webhook) | Analytics | 3 | integrazioni |
| 13 | AI | AI | 5 | sopra dati veri |
| 14 | KPI | Analytics | **1→3** | |
| 15 | API pubblica | tutti | 4 | |
| 16 | Enterprise (white-label, ruoli) | tutti | 5 | |

> **Denaro (Moduli 9–11):** progettabili come documento, **mai eseguiti in
> autonomia**. Nessun trade/transfer/checkout eseguito dall'assistente
> (vincolo di sicurezza). Il checkout si integra con un PSP terzo (Stripe) dove
> è il cliente a confermare.

## 5 · Confini e non-obiettivi

- **Non** si rompe un QR pubblicato: `short_code` immutabile (trigger DB).
- **Non** si raccoglie PII senza consenso registrato (D-2 vincolo).
- **Non** si compete "a generatore": il generatore è la porta, non il prodotto.
- **Non** si costruisce tutto insieme: si segue la Roadmap per fasi, ogni fase
  additiva e provata prima della successiva.

## 6 · Relazione con Shaer.it (il dopo)

L'albero di QR con `owner_id` per-nodo e la connessione verificata scanner↔owner
**sono già** le fondamenta anti-frode di Shaer: la rete di referral/rivendita, l'
economia dei crediti e le TXN verificate ([SHAER_MASTER](../SHAER_MASTER.md)) si
innestano sull'albero senza riprogettarlo. Questa piattaforma QR è il **primo
slice** di quella visione, non un prodotto separato.
