# SHAER.IT — REGOLAMENTO RECENSIONI & BACKLOG OPERATIVO
## Sistema di recensioni, cose da fare/implementare, domande irrisolte, ottimizzazioni
> Versione 1.0 | Giugno 2026 | Uso Interno Riservato
> 📎 Da leggere con: `SHAER_IT_MASTER_REFERENCE_v1_1.md`, `SHAER_IT_REGOLAMENTO_GUIDA_ROADMAP_v1.md`, `SHAER_IT_NOTE_ECONOMIA_CREDITI_v1.md`

---

## PARTE A — SISTEMA DI RECENSIONI

### A.1 Principi
1. **Solo da TXN verificata.** Una recensione esiste solo a fronte di una transazione `completed` (QR verificato). Nessuna recensione "libera".
2. **Niente auto-recensione** (Master §15.5): `author_id ≠ target_id`. Già garantito a livello di transazione (`buyer_id ≠ seller_id`).
3. **Scala a 10 stelle** (non 5), per categoria.
4. **Incentivo in crediti `promo`** (engagement): non prelevabili, spendibili solo su sink interni — quindi pagare le recensioni non apre la "stampa di moneta".
5. **Una recensione per direzione per TXN.** Vincolo di unicità che blocca duplicati e spam.

### A.2 Chi recensisce chi (direzioni)

| Autore | Target | Tipo | Categorie (10★ ciascuna) |
|---|---|---|---|
| **Buyer** | **Prodotto** | `product` | qualità · comfort · aspettative *(+ altre future)* |
| **Buyer** | **Seller** | `user` | cordialità · generoso · professionalità · generale *(+ altre future)* |
| **Seller** | **Buyer** | `user` | cordialità · generoso · professionalità · generale *(+ altre future)* |
| *(futuro/aperto)* | Buyer → **Suggeritore (Shaerer)** | `user` | stesse 4 categorie utente — **vedi D.2** |

Le categorie sono dati di configurazione (tabella `review_categories`), così se ne aggiungono altre senza toccare il codice. Per ora si attivano solo quelle elencate.

### A.3 Incentivo (punti per recensione)
- Ogni recensione **completata** matura un piccolo incentivo in `promo`, coniato da TREASURY entro il budget autorizzato in `SHAER_ADV` (stessa meccanica dei crediti engagement: registrazione, consiglio).
- Default proposto: `review_incentive = 20 cr` per recensione, in `fee_rules`.
- **Tetto:** una sola maturazione per `(txn_id, author_id, target_type)`. Recensire il prodotto **e** il seller dà due incentivi distinti; il seller che recensisce il buyer ne riceve uno.
- L'incentivo è `promo` → spendibile solo su sink interni (decisione Domanda 1) → niente conversione in € → niente farming redditizio.

### A.4 Da recensione a rank (e al moltiplicatore reward)
- Per ogni target si calcola la media delle stelle ricevute → `rating_avg` (1–10).
- Mappatura al `rank` esistente (0–100): `rank = rating_avg × 10`, con **media pesata/bayesiana** per non far oscillare il rank su 1 sola recensione (vedi D.4).
- Il rank alimenta il **moltiplicatore sul reward-vendita** (C21c). Quindi: recensire bene chi consiglia bene → chi ha rank alto guadagna di più → ciclo virtuoso di qualità del passaparola.
- Il `rating_avg` del **prodotto** appare in vetrina; quello di **seller/buyer** sul profilo.

### A.5 Schema dati (proposta per `0002`/successiva)
```sql
CREATE TABLE review_categories (
  id           TEXT PRIMARY KEY,      -- 'cordialita','generoso','professionalita','generale','qualita','comfort','aspettative'
  target_type  TEXT NOT NULL,         -- 'user' | 'product'
  label        TEXT NOT NULL,
  active       BOOLEAN DEFAULT true,
  sort         INT
);

CREATE TABLE reviews (
  id           BIGSERIAL PRIMARY KEY,
  txn_id       TEXT NOT NULL,          -- vincolo: TXN 'completed'
  author_id    TEXT NOT NULL,
  author_role  TEXT NOT NULL,          -- BUYER | SELLER
  target_type  TEXT NOT NULL,          -- 'user' | 'product'
  target_id    TEXT NOT NULL,          -- user_id o product_id
  comment      TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (txn_id, author_id, target_type, target_id)   -- 1 recensione per direzione per TXN
);

CREATE TABLE review_scores (
  review_id    BIGINT REFERENCES reviews(id),
  category_id  TEXT REFERENCES review_categories(id),
  stars        SMALLINT CHECK (stars BETWEEN 1 AND 10),
  PRIMARY KEY (review_id, category_id)
);
-- rating per target = vista/materialized: AVG(stars) su tutte le review_scores ricevute
```

### A.6 Anti-abuso
- Solo su TXN `completed`; `author_id ≠ target_id`; 1 recensione per direzione (UNIQUE).
- Incentivo in `promo` non prelevabile (niente farming redditizio).
- **TXN restituito** (reso): la recensione è bloccata/invalidata → **D.3**.
- Possibile gate di qualità (minimo categorie compilate, anti-bot) — ottimizzazione O.5.

---

## PARTE B — COSE DA FARE / DA IMPLEMENTARE (backlog)

| # | Item | Dove | Priorità | Stato |
|---|---|---|---|---|
| T1 | `0002_value_distributions.sql` (6 conti, `value_distributions`+`_lines`, `plans`, `fee_rules`, `agreed_price`, `credits_ledger` come vista) | DB | 🔴 alta | ⏳ |
| T2 | Tabelle recensioni (`review_categories`, `reviews`, `review_scores`) + seeding categorie attive | DB | 🔴 alta | ⏳ |
| T3 | Incentivo recensione (mint `promo` da TREASURY/ADV, tetto 1 per direzione/TXN) | DB+app | 🟠 media | ⏳ |
| T4 | Derivazione `rating_avg` → `rank` (media bayesiana) e moltiplicatore reward | DB+app | 🟠 media | ⏳ |
| T5 | UI recensioni nel simulatore: form 10★ per categoria su "I miei ordini" (buyer→prodotto, buyer→seller) e "ordini" lato seller (seller→buyer) | Simulatore | 🟠 media | ⏳ |
| T6 | Visualizzazione rating in vetrina (prodotto) e su profilo (seller/buyer) | Simulatore | 🟡 bassa | ⏳ |
| T7 | Aggiornamento documenti vivi (Master §15 con scala 10★, categorie, incentivo; Backlog Modulo recensioni) — richiede frase di blocco | Docs | 🟠 media | ⏳ |
| T8 | Politica clawback su reso (reward già distribuito; incentivo recensione) | DB+app | 🟠 media | ⏳ (vedi D.3) |
| T9 | Dashboard offerta B2B (WS4) e simulatore finanziario producer (WS5) | Frontend | 🟡 bassa | ⏳ Fase B |

---

## PARTE C — DOMANDE IRRISOLTE (da bloccare)

| # | Domanda | Default proposto |
|---|---|---|
| **C38** | Incentivo recensione: **per ogni recensione** (prodotto e seller separati) o **per coppia completata** (prodotto+seller insieme)? E importo? | Per recensione, **20 cr** ciascuna (`promo`) |
| **C39** | Il **buyer può recensire il suggeritore** (Shaerer)? Stesse 4 categorie utente? | Sì in roadmap, **non nell'MVP** (prima buyer↔seller↔prodotto) |
| **C40** | Su **TXN restituito**: la recensione resta, si invalida o si blocca? L'incentivo già maturato si storna? | Recensione **bloccata** se reso prima della recensione; se già fatta, **resta** ma flag "ordine reso"; incentivo **non** stornato |
| **C41** | Mappatura **10★ → rank**: media semplice o **bayesiana**? Soglia minima recensioni prima di mostrare il rank? Pesi tra categorie? | Bayesiana con prior; **min 3 recensioni** per mostrare il rank; categorie a peso uguale |
| **C42** | **Editabilità** e **finestra** della recensione (collega vecchi C8/C12) | Editabile entro **48h**, poi bloccata |
| **C43** | "**generale**" è una categoria a sé o il voto complessivo? | Categoria a sé (come da tua indicazione), il complessivo è la media |

> Conflitti credito/economia già bloccati nelle sessioni precedenti: C19, C21b, C21c, C24–C37 (vedi `REGOLAMENTO_GUIDA_ROADMAP`). C13–C18 superati/risolti dal nuovo modello.

---

## PARTE D — NOTE DI DESIGN SU PUNTI APERTI

- **D.2 (Recensione del suggeritore).** Le 4 categorie utente valgono anche per lo Shaerer. Tenerlo fuori dall'MVP semplifica, ma è il pezzo che misura la **qualità del passaparola** — il vero asset verso MIMIT/Confindustria. Consigliato in Fase 2.
- **D.3 (Reso e recensioni).** Coerenza con la regola già implementata "non si rende ciò che si è consigliato": se il buyer ha vissuto il prodotto abbastanza da recensirlo, il reso ha senso solo entro finestra. Proposta: niente recensione su ordine reso; reward e cashback già stornati dal reso (già implementato), incentivo recensione mai maturato se non c'è recensione.
- **D.4 (Rank bayesiano).** `rank = (C·m + Σstars) / (C + n)` dove `m` è la media globale e `C` un peso (es. 5 voti virtuali). Evita che 1 recensione a 10★ porti il rank al massimo. Necessario perché il rank pilota soldi (moltiplicatore reward).

---

## PARTE E — OTTIMIZZAZIONI DA FARE

- **O.1 — Saldo derivato anche a DB.** Nel simulatore il saldo è già derivato dal ledger; in `0002` rendere `credits_ledger` una **vista** e proteggere `value_distribution_lines` con trigger (no UPDATE/DELETE) + check `SUM=0` per distribuzione.
- **O.2 — Idempotenza recensioni e payout.** UNIQUE su `(txn_id, author_id, target_type)` per le recensioni; UNIQUE `(event_type, txn_id, phase)` per le distribuzioni (già previsto).
- **O.3 — Reach/payout fee spalmati.** Nel simulatore intake+riserva campagna sono riconosciuti tutti all'avvio; in produzione spalmare la `payout_pct` sulle uscite reali del minipool per una contabilità più fedele.
- **O.4 — Clawback reward su reso.** Oggi il reso può portare un suggeritore a saldo negativo. Politica proposta: **reward bloccato** (held) fino a chiusura finestra-reso, sbloccato dopo; in alternativa clawback dilazionato.
- **O.5 — Qualità recensioni.** Gate minimo (categorie compilate, lunghezza commento, anti-bot), peso per anzianità/volume, decadimento temporale del rank.
- **O.6 — Normalizzazione unità.** Tutto in crediti internamente (già fatto nel simulatore); verificare che nessun importo resti in €/$ nello schema.
- **O.7 — Ring-fencing escrow per campagna.** Sub-libri `escrow:campaign:CMP-X` e `settlement:txn:TXN-Y` separati (già impostato), con alert anzianità sui pagamenti in transito.

---

## PARTE F — SUGGERIMENTI E MIGLIORIE

1. **Reciprocità dell'incentivo.** Pagare l'incentivo pieno solo se **entrambe** le parti recensiscono (buyer↔seller): aumenta il tasso di recensione e riduce le recensioni "unilaterali" punitive.
2. **Recensione del suggeritore = motore di fiducia.** È ciò che distingue Shaer.it dal volantino: misurare quanto un consiglio è stato utile (anche con un solo tasto "consiglio utile/non utile" oltre alle 10★).
3. **Rank visibile solo sopra soglia** (min 3 recensioni) con etichetta "rank provvisorio" sotto soglia: evita che un nuovo seller con 1 recensione a 10★ scali ingiustamente i suggerimenti.
4. **Categorie per verticale.** Le categorie prodotto (qualità/comfort/aspettative) hanno senso per le calzature; prevedere set di categorie **per categoria merceologica** (es. per "Elettronica": affidabilità/prestazioni/aspettative). La tabella `review_categories` lo consente già.
5. **Incentivo decrescente / a budget.** Far attingere l'incentivo recensione dal budget `SHAER_ADV` con un tetto giornaliero, così la spesa engagement è sempre sotto controllo e provabile.
6. **Anti-recensione-incrociata fittizia.** Bloccare cicli sospetti (A vende a B, B vende ad A, si recensiscono a vicenda) con un controllo sui pattern, dato che ora gli account possono essere multi-ruolo.

---

## PARTE G — PROSSIMI PASSI CONSIGLIATI

1. Bloccare **C38–C43** (almeno C38 e C41, gli unici che cambiano lo schema).
2. Produrre **T1 (`0002`)** e, subito dopo, **T2/T3/T4** (recensioni + incentivo + rank).
3. Cablare le recensioni nel simulatore (**T5/T6**) per testare end-to-end incentivo e rank.
4. Aggiornare i documenti vivi (**T7**) con la frase di blocco.

---

*Shaer.it — Regolamento Recensioni & Backlog v1.0 — Giugno 2026*
*Fondatore: Nick | Assistito da Claude (Anthropic) | ⚠️ Uso esclusivo interno*
