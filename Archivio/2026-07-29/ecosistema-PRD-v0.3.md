# Shaer.it — Product Requirements Document (PRD) · Ecosistema

Versione: 0.3 · Stato: **in riempimento (T-025)** — EE1–EE7, EE10, EE12 con criteri testabili · 2026-07-29
Padre: [MDD](MDD.md) · Tecnica: [SAD](SAD.md) v0.1 (F1) · Dominio: [SHAER_MASTER](../SHAER_MASTER.md)

> **Questo è uno skeleton pre-impostato**, non un PRD completo. Fissa la **struttura**
> e la **roadmap dei requisiti** (fatto/da fare) allineata all'[MDD](MDD.md) §5 e §10 e
> al saldo di `memoria/TODO.md`. Ogni epica va poi **riempita** con requisiti e
> **criteri di accettazione testabili** (regola 5: se è calcolabile, è un test; `[~]`
> solo per il visivo). Legenda: ✅ fatto · ◐ in corso · ▢ da fare.
>
> Priorità **MoSCoW**: `M` must · `S` should · `C` could · `W` won't-now.

---

## Attori (dettaglio in MDD §3)

BUYER (+SHAERER) · SELLER · PRODUCER · TRANSPORTER · ADMIN · *periferici:* FORNITORE,
COMMERCIALISTA, DIPENDENTE. — *Requisiti di registrazione/verifica: da scrivere.*

## Mappa epiche → modulo → blocco → stato

| Epica | Modulo (MDD §5) | Blocco (MDD §10) | Stato |
|-------|------------------|-------------------|-------|
| **EE0** · Verifica via QR | 0 | F0 | ✅ (vedi [modulo-qr/PRD](../modulo-qr/PRD.md)) |
| **EE1** · Identità, Wallet, RBAC admin-first | 1 | B1 | ◐ (requisiti+AC) |
| **EE2** · TXN Engine (stati, unica verità) | 2 | B2 | ◐ (requisiti+AC) |
| **EE3** · Economia crediti (ledger, pool/escrow, 3 classi) | 3 | B3 | ◐ (requisiti+AC) |
| **EE4** · Recensioni & Rank bayesiano | 4 | B4 | ◐ (requisiti+AC) |
| **EE5** · Referral promo (mono-livello, a tempo) | 5 | B5 | ◐ (requisiti+AC) |
| **EE6** · Wishlist/Compleanni/Crowdfunding/Gruppi — *da subito* | 6 | B6 | ◐ (requisiti+AC) |
| **EE7** · Pannello unico + catalogo/trial · Dashboard cliente | — | B7 | ◐ (requisiti+AC) |
| **EE8** · QR operativo + incentivi + escrow | 0→ | B8 | ▢ |
| **EE9** · Moduli operativi (magazzino/riordino/presenze/export) | op. | B9 | ▢ |
| **EE10** · Prenotazioni · Shop · Fidelity universale · CMS | 7-9,12 | B10 | ◐ (fidelity) |
| **EE11** · MLM-as-a-service · Billing SaaS | 10,15 | B11 | ▢ |
| **EE12** · Tracciabilità & Trasporto | 11 | B12 | ◐ (requisiti+AC) |
| **EE13** · Analytics ecosistema · Automazioni | 13,14 | F3 | ▢ |
| **EE14** · API & Enterprise | 16 | F4 | ▢ |

---

## EE1 · Identità, Wallet & RBAC admin-first `B1`

**Obiettivo.** Un'identità unica per persona, estendibile a business, con permessi
assegnati e verificati in modo granulare. È la fondazione: Mod. 2/3/… vi poggiano.

**Requisiti**

- **R-EE1.1** `M` — Un utente ha **un profilo unico** e può assumere **fino a 3 ruoli**
  (BUYER/SELLER/PRODUCER/TRANSPORTER, C35), ciascuno con **wallet separato** (saldo per
  ruolo, derivato dal ledger — EE3). BUYER può attivare la modalità **SHAERER** senza
  nuovo ruolo.
- **R-EE1.2** `M` — I ruoli **SELLER/PRODUCER/TRANSPORTER** richiedono **verifica
  documentale** (P.IVA/documenti) e restano in stato `non-verificato` finché l'ADMIN non
  approva: da non-verificato **nessuna operazione business** è possibile.
- **R-EE1.3** `M` — Ogni tabella nasce con **`owner_id` e RLS owner-scoped** (multi-tenant,
  regola 9); il confine reale è il **DB** (L-001): grant introspezionati, non presunti.
- **R-EE1.4** `M` — **RBAC admin-first** (E-D-13): solo un **ADMIN** assegna permessi
  speciali **scelti uno a uno** a un utente registrato. La delega al commerciante è `W`
  (fuori v1).
- **R-EE1.5** `M` — **Maker-checker**: ogni azione che modifica in modo **permanente**
  eseguita da un profilo a permessi delegati entra in stato `pending` e **non produce
  effetti** finché un approvatore abilitato non la conferma. Nessuna azione irreversibile
  in solitaria.
- **R-EE1.6** `S` — I permessi sono un **compartimento** (E-D-09): nessun profilo delegato
  "vede e tocca tutto"; la superficie visibile è filtrata per ruolo (pannello unico, §8.1).
- **R-EE1.7** `M` — **Limite dell'approvatore** (E-D-24): un profilo a permessi delegati può
  **solo verificare/leggere** i dati assegnati; **non diventa mai** proprietario né admin
  totale. Il **cambio completo di amministratore** richiede un **intervento manuale Shaer**
  (nessuna escalation di privilegio via UI).
- **R-EE1.8** `M` — **Vincolo ruoli per-transazione** (E-D-21): i 3 ruoli sono combinabili a
  livello di account, ma **sulla stessa TXN/lotto** un soggetto non può ricoprire due ruoli
  che si verificano a vicenda (un SELLER non fa da TRANSPORTER verificante del proprio lotto).
- **R-EE1.9** `M` — **Relazione di lavoro** (E-D-21): nasce da un **accordo** utente↔business.
  A conferma, il business amministra personale, assegna compiti/premi e vede le statistiche
  del lavoro assegnato; il **personale** timbra **inizio/fine** sessione e i ruoli speciali.

**Criteri di accettazione** *(calcolabile ⇒ test; `[~]` solo visivo)*

- **AC-EE1.1** — un 4° ruolo attivo sullo stesso utente è **rifiutato** dal vincolo. `→ test`
- **AC-EE1.2** — un'operazione business da ruolo `non-verificato` è **negata** (gate verifica). `→ test`
- **AC-EE1.3** — il saldo di un wallet **= somma delle righe ledger** per `(owner, ruolo, classe)`;
  **nessuna colonna saldo** materializzata (assenza a schema). `→ test` (derivazione + schema)
- **AC-EE1.4** — utente A **non legge** righe di B (RLS owner-scoped, come `grants.test`). `→ test`
- **AC-EE1.5** — un permesso speciale assegnato da un **non-ADMIN** è **rifiutato** dalla policy. `→ test`
- **AC-EE1.6** — un'azione permanente da profilo delegato resta `pending` e **senza effetto**
  finché non approvata; approvata, si applica una sola volta (idempotenza). `→ test` (macchina stati)
- **AC-EE1.7** — un tentativo di trasferire proprietà/admin a un profilo delegato è **rifiutato**
  (E-D-24). `→ test`
- **AC-EE1.8** — assegnare allo stesso soggetto due ruoli auto-verificanti **sulla stessa TXN** è
  **rifiutato** (E-D-21). `→ test`
- **AC-EE1.9** `[~]` — la scheda di pannello mostra **solo** le voci consentite dal ruolo (visivo →
  eyeball di Nick o harness T-024).

## EE2 · TXN Engine `B2`

**Obiettivo.** La transazione è l'**unica fonte di verità** di ogni interazione economica.
Reward, recensioni e movimenti di ledger (EE3) non esistono staccati: **si appendono** a una
TXN, e solo una TXN **verificata via QR** (Modulo 0) dà loro integrità (principio n°1).

**Requisiti**

- **R-EE2.1** `M` — Ogni interazione economica è una **TXN** con stato in
  `{OPEN, SUGGESTED, IN_PROGRESS, COMPLETED, EXPIRED, ABANDONED}`. Le transizioni sono
  **solo in avanti**; `COMPLETED/EXPIRED/ABANDONED` sono **terminali immutabili**.
- **R-EE2.2** `M` — Gli eventi (suggerimento SHAERER, vendita, reward, recensione) si
  **appendono** alla TXN (**append-only**): non si sovrascrivono né si cancellano.
- **R-EE2.3** `M` — **Reward e recensioni** derivano **solo** da TXN `COMPLETED` verificata
  via QR. Nessun valore economico nasce fuori da una TXN completata.
- **R-EE2.4** `M` — Timeout: una TXN in stato non terminale oltre la sua finestra diventa
  `EXPIRED`; se esplicitamente lasciata, `ABANDONED`.
- **R-EE2.5** `S` — Ogni TXN è **owner-scoped** (RLS) e legata al **QR/lotto** che la
  verifica: l'albero di QR (`owner_id`/`granted_by`) è già la struttura
  produttore→seller→buyer e i passaggi di consegna del lotto (MDD §3).

**Criteri di accettazione**

- **AC-EE2.1** — una transizione illegale (es. `COMPLETED→IN_PROGRESS`) è **rifiutata**. `→ test` (macchina stati)
- **AC-EE2.2** — appendere un evento **non modifica** gli eventi precedenti (append-only). `→ test`
- **AC-EE2.3** — un reward/recensione su TXN **non-`COMPLETED`** è **rifiutato**. `→ test`
- **AC-EE2.4** — una TXN non terminale oltre il timeout risulta **`EXPIRED`**. `→ test`
- **AC-EE2.5** — uno stato **terminale** non accetta ulteriori transizioni né eventi. `→ test`

## EE3 · Economia crediti `B3`

**Obiettivo.** Il ledger a **partita doppia** è l'unica verità dei valori. Ogni saldo si
**deriva**, mai si memorizza. È la fondazione economica: TXN, reward, escrow vi appendono.

**Requisiti**

- **R-EE3.1** `M` — **6 conti di sistema** (SHAER_MASTER §1.4): `TREASURY` (zecca/riserva €),
  `ESCROW` (custodia campagne/bonus), `SETTLEMENT` (pagamenti in transito), `REVENUE`
  (ricavi fee), `ADV` (minipool campagne), `BURN` (sink prelievi). `1 credito = 0,01 €`.
- **R-EE3.2** `M` — **3 classi** di credito: `promo` (non coperto, **non prelevabile**),
  `purchased` (coperto €), `earned` (coperto, **prelevabile con KYC**).
- **R-EE3.3** `M` — **Partita doppia**: ogni movimento è ≥2 righe la cui **somma è zero**.
  Solo `TREASURY` **conia**; `promo` esce da **budget autorizzato in ADV**.
- **R-EE3.4** `M` — **Saldo derivato**, mai materializzato (regola 9). Vale per utenti e
  per i 6 conti.
- **R-EE3.5** `M` — **Invariante di solvibilità**: dopo ogni movimento, **riserva € ≥
  `purchased` + `earned` circolanti**.
- **R-EE3.6** `M` — **Pool/escrow** (E-D-16, held balance C43): un importo bloccato **non
  entra nel disponibile** finché non è rilasciato. Percorso onesto = approvazione commerciante
  + doppia conferma → **rilascio immediato**; la **finestra di contestazione (5 gg)** si apre
  **solo** se il commerciante non onora una promessa, e l'arbitro è il **customer care** (E-D-22).
- **R-EE3.7** `M` — **Circuito chiuso** (E-D-16): i crediti in escrow sono spendibili **solo
  se** il commerciante ha versato **€ veri**; altrimenti restano **punto contabile**.
- **R-EE3.8** `M` — **F1 closed-loop** (E-D-23): in F1 i crediti si **trasferiscono solo dentro
  la piattaforma**. L'**off-ramp** € (prelievo) e il **KYC** relativo sono **rimandati** (`W` per
  ora): il gate `earned` resta specificato (R-EE3.2), non si costruisce. Nessuna conversione/
  prelievo in autonomia (MiCA/e-money) quando arriverà.

**Criteri di accettazione**

- **AC-EE3.1** — ogni transazione ledger **somma a 0**; un movimento sbilanciato è **rifiutato**. `→ test` (invariante)
- **AC-EE3.2** — un movimento che **crea** crediti senza contropartita `TREASURY` è **rifiutato**. `→ test`
- **AC-EE3.3** — dopo ogni movimento **`riserva € ≥ purchased+earned`** (property-based). `→ test`
- **AC-EE3.4** — saldo `(owner|conto, classe)` **= somma righe**; nessuna colonna saldo. `→ test` (derivazione + schema)
- **AC-EE3.5** — un off-ramp di crediti `promo` è **negato**. `→ test`
- **AC-EE3.6** — un prelievo di `earned` senza **KYC verificato** è **negato**. `→ test` (gate)
- **AC-EE3.7** — un importo `held` in escrow è **escluso dal disponibile**; il rilascio senza
  le 3 condizioni (approvazione+no contestazioni+arbitrato) è **negato**. `→ test` (macchina stati escrow)
- **AC-EE3.8** — crediti escrow **senza** versamento € del commerciante restano **non spendibili**
  (punto contabile). `→ test` (condizione E-D-16)
- **AC-EE3.9** — un trasferimento SHAER **interno** tra due utenti muove il ledger a somma zero e
  **non tocca** la riserva €; un **off-ramp** è **negato** in F1 (E-D-23). `→ test`

*Fonte:* SHAER_MASTER §1.4–1.5 + `Struttura/Schema/Shaer_it_Simulatore_MVP_v5.html`.

## EE4 · Recensioni & Rank `B4`

**Requisiti** *(fonte: SHAER_MASTER §1.5, C40–C42)*

- **R-EE4.1** `M` — Una recensione nasce **solo da una TXN `COMPLETED`** (integrità
  anti-frode). 10 stelle per categoria, **categorie a peso uguale**.
- **R-EE4.2** `M` — Rank = **media bayesiana** con **soglia 3** recensioni (C41): sotto
  soglia pesa il prior, non la media grezza.
- **R-EE4.3** `M` — Recensione **editabile entro 48h** (C42); **reso vietato** se il buyer ha
  **consigliato** quel prodotto (C40).
- **R-EE4.4** `S` — **Moltiplicatore Shaerer**: la recensione di un suggeritore pesa di più
  (parametro compartimentato E-D-17).

**Criteri di accettazione**

- **AC-EE4.1** — recensione su TXN **non-`COMPLETED`** è **rifiutata**. `→ test`
- **AC-EE4.2** — con <3 recensioni il rank usa il **prior bayesiano**, non la media grezza. `→ test`
- **AC-EE4.3** — modifica oltre **48h** **rifiutata**; reso di un prodotto consigliato dal buyer **negato**. `→ test`

## EE5 · Referral promo `B5`

**Requisiti** *(E-D-01/A, E-D-11, E-D-20)*

- **R-EE5.1** `M` — Programmi **mono-livello**: reward **solo sul diretto**, mai su livelli
  successivi (la piramide *di Shaer* è vietata, principio n°6; l'MLM parametrico è EE11).
- **R-EE5.2** `M` — **Parametri immutabili** una volta pubblicato; un cambio crea una **nuova
  versione** e ogni reward resta legato alla **versione** sotto cui è maturato (E-D-20, regola 7).
- **R-EE5.3** `M` — **Scadenza configurabile**: ore / giorni / mesi / **mai** (E-D-20).
- **R-EE5.4** `M` — Reward = **crediti Shaer** attinti dal **budget** del creatore (E-D-11);
  Shaer applica la sua commissione dal pannello admin.

**Criteri di accettazione**

- **AC-EE5.1** — un reward a un referrer di **2° livello** è **rifiutato** (mono-livello). `→ test`
- **AC-EE5.2** — modificare i parametri di un programma pubblicato **crea una nuova versione**;
  i reward già maturati **restano legati** alla vecchia. `→ test`
- **AC-EE5.3** — un programma **oltre la scadenza** **non matura** nuovi reward. `→ test`

## EE6 · Wishlist / Compleanni / Crowdfunding / Gruppi `B6` — *priorità da subito*

**Requisiti** *(E-D-07 priorità, E-D-18, SHAER_MASTER §1.6)*

- **R-EE6.1** `M` — **Wishlist** per utente; **compleanni** degli amici (registrati o no).
- **R-EE6.2** `M` — **Contributo a raccolta** per il regalo in wishlist, con **revoca entro 2h**
  (C SHAER §1.6): entro 2h rimborso pieno, oltre no.
- **R-EE6.3** `M` — **Home cliente** (E-D-18): compleanni del **mese corrente** con **2 prodotti
  desiderati** + stato di completamento + pulsante **"regala"** che fa partecipare alla raccolta.
- **R-EE6.4** `S` — **Gruppi/obiettivi** personali e comunitari; **segnale d'interesse**
  (acquistato sì/no, quanto) → **ri-suggestione** temporizzata (6m/1a). Sostituisce i cookie.

**Criteri di accettazione**

- **AC-EE6.1** — contributo revocato **entro 2h** rimborsa pieno; **oltre 2h** la revoca è **negata**. `→ test`
- **AC-EE6.2** — a raccolta **completata** il regalo si sblocca; un contributo che **supera** il
  target è gestito (rifiutato o troncato al residuo). `→ test`
- **AC-EE6.3** `[~]` — la home mostra i compleanni del mese coi 2 prodotti e il pulsante "regala" (visivo).

## EE7 · Pannello unico + catalogo/trial · Dashboard cliente `B7`

**Requisiti — superficie business** *(E-D-13, E-D-14)*

- **R-EE7.1** `M` — **Un solo pannello** filtrato per ruolo (§8.1); chi entra vede solo le
  schede e i dati che il suo ruolo consente.
- **R-EE7.2** `S` — Voci inattive **visibili** (stile `PRESTO`); l'ADMIN attiva **trial** a
  tutti/categoria/singolo (E-D-14).

**Requisiti — dashboard cliente (BUYER)** *(E-D-08, E-D-18)*

- **R-EE7.3** `M` — Menu a **7 voci**: 1) Wallet · 2) I miei acquisti/TXN · 3) Wishlist &
  Regali · 4) Suggerimenti (SHAERER) · 5) Rete & Referral · 6) Profilo · 7) **Diventa/switcha
  a business**.
- **R-EE7.4** `M` — **Home** all'ingresso mostra 3 segnali: A) **guadagno del mese** · B)
  **richieste/suggerimenti** di amici/liste/gruppi/pubblico · C) **compleanni** degli amici
  del mese corrente (E-D-18).

**Criteri di accettazione**

- **AC-EE7.1** — un ruolo senza permesso su una scheda **non la vede** nel pannello (RBAC). `→ test` (policy) + `[~]` visivo
- **AC-EE7.2** `[~]` — la home cliente mostra i 3 segnali A/B/C e il menu a 7 voci (visivo → eyeball/T-024).

## EE8 · QR operativo + incentivi + escrow `B8`
*Da scrivere.* QR per postazione/tavolo/dipendente (QR personale abbinato al profilo
utente, nomi modificabili); attribuzione vendite; **motore incentivi** team/singolo
(soglie fatturato, %, min/max); **escrow con arbitrato** e circuito chiuso (E-D-15/16,
esempio ristorante MDD §5.4).

## EE9 · Moduli operativi `B9`
*Da scrivere.* Magazzino (stock, scadenze), Riordino automatico al fornitore,
Presenze/Check-in dipendenti, Export commercialista (MDD §5.3).

## EE10 · Prenotazioni · Shop · Fidelity universale · CMS `B10`

**Requisiti — Fidelity universale** *(E-D-03, E-D-25)*

- **R-EE10.1** `M` — I **punti** sono legati al **wallet dell'utente** e spendibili presso
  **tutti** gli esercenti aderenti (non per-tenant).
- **R-EE10.2** `M` — **Riscatto presso l'emittente** → valore **100%**. **Riscatto presso un
  esercente diverso** → valore **ripartito** secondo percentuali **configurabili dal pannello
  Admin** (default: **30%** emittente · **30%** Shaer · **40%** esercente del riscatto) — E-D-25.

**Criteri di accettazione**

- **AC-EE10.1** — riscatto presso l'emittente riconosce il **100%**. `→ test`
- **AC-EE10.2** — riscatto cross-merchant ripartisce secondo lo split configurato; i tre addendi
  **sommano a 1** e i movimenti di ledger **sommano a zero** (E-D-25). `→ test`

*Resto (Prenotazioni, Shop, CMS): build plan Sprint 2-6 riletto per Shaer — da scrivere.*

## EE11 · MLM-as-a-service · Billing SaaS `B11`
*Da scrivere.* Motore MLM parametrico (profondità/larghezza, E-D-01/B); finanziamento
campagne (budget+split+commissione admin, E-D-11); billing per-modulo (pay-per-activation).

## EE12 · Tracciabilità & Trasporto `B12`

**Requisiti** *(E-D-06, E-D-19)*

- **R-EE12.1** `M` — Hand-off via **scansione QR**: si registrano **2 eventi** — **ricevuto** e
  **consegnato** — come scansioni verificate del lotto.
- **R-EE12.2** `M` — Si calcola la **distanza approssimata** partenza/arrivo e si **derivano**
  tempo trascorso, distanza e **costo trasporto**. **Niente scia GPS continua**, niente
  posizione live della flotta (E-D-19).
- **R-EE12.3** `M` — Al **consumatore** arriva **distanza/costo trasporto**, **mai** l'identità
  o la posizione del lavoratore (compartimentazione E-D-09).

**Criteri di accettazione**

- **AC-EE12.1** — una TXN di trasporto con solo "ricevuto" (senza "consegnato") è **incompleta**;
  a doppia scansione i derivati (tempo/distanza/costo) sono calcolati. `→ test`
- **AC-EE12.2** — l'output esposto al consumatore **non contiene** PII del lavoratore. `→ test`

## EE13 · Analytics ecosistema · Automazioni `F3` · EE14 · API & Enterprise `F4`
*Da scrivere più avanti.*

---

## Requisiti non-funzionali (eredità dal Modulo 0, estesi)

Sicurezza (RLS + confine DB, L-001) · **compartimentazione** (E-D-09) · privacy/consenso
(PII e tracking) · performance (Server Components, `dynamic`, streaming) · affidabilità
(un QR pubblicato non si rompe mai, regola 7) · testabilità (dominio in funzioni pure).
