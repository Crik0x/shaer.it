# SHAER_MASTER.md — FONTE UNICA DI VERITÀ
> Versione canonica 1.0 · Giugno 2026 · Uso interno · Fondatore: Nick (Milano/Roma)
> Questo file **sostituisce e consolida**: Master Reference v1.1, Backlog v1.1, Note Sessione v1, Regolamento Guida/Roadmap v1, Regolamento Recensioni v1, Note Economia Crediti v1.
> Regola: si riparte SEMPRE da qui. Per modificare una decisione bloccata usa la frase: `Approvo: [descrizione]. Aggiorna il decision log da ⏳ a ✅ e chiudi Cx.`
> Convenzioni: documentazione in italiano, **naming DB in inglese**. Unità interna unica: **100 crediti = 1,00 €**.

---

## 1. STATO ATTUALE

### 1.1 Identità & visione
| Campo | Valore |
|---|---|
| Nome / tagline | Shaer.it — "Share. Earn. Win Together." |
| Cos'è | Trasforma il passaparola in sistema economico tracciabile e remunerato |
| Missione | Ridistribuire il valore dei dati (sottratto a Meta/Google) a chi lo genera, senza pubblicità tradizionale |
| Fase | MVP in sviluppo · pilota silenzioso Roma |
| Anti-frode non negoziabile | Crediti e recensioni hanno integrità **solo** da transazioni verificate via QR |

### 1.2 Attori
| Codice | IT / EN | Ruolo |
|---|---|---|
| `BUYER` | Utente / User | Consumatore finale; può adottare la modalità **SHAERER** (suggeritore) |
| `SELLER` | Rivenditore / Seller | Negozio/agenzia/PRO con P.IVA; vende al buyer |
| `PRODUCER` | Produttore / Producer | Brand che crea prodotti con Product ID; opera via Seller (anche servizi/PRO) |
| `ADMIN` | Amministratore / Admin | Team Shaer.it |

**Multi-ruolo (C35, aggiornato):** un utente può avere fino a **3 ruoli** (BUYER/SELLER/PRODUCER), ciascuno con wallet separato. SELLER/PRODUCER richiedono verifica documentale (P.IVA). → *Questo aggiorna il vecchio "dual-mode BUYER/SELLER" e "PRODUCER≠SELLER" del Master originale §2.*

### 1.3 Stack
Next.js 14 PWA · Node/Express (REST) · PostgreSQL via Supabase · Supabase Auth/Storage · Firebase Cloud Messaging · Stripe · Vercel + Railway. No app nativa, no blockchain nell'MVP.

### 1.4 Modello economico — VIGENTE (cuore del sistema)
> Questo modello **sostituisce** il vecchio §6 (tabella reward fissi) e §10 (split 25/75) del Master originale.

**6 conti di sistema:** `SHAER_TREASURY` (zecca/riserva €) · `SHAER_ESCROW` (custodia campagne) · `SHAER_SETTLEMENT` (pagamenti in transito) · `SHAER_REVENUE` (ricavi fee) · `SHAER_ADV` (minipool campagne, hub analytics) · `SHAER_BURN` (sink prelievi).

**3 classi di credito:**
| Classe | Coperto € | Acquisto | Transfer (preserva classe) | Finanzia campagne | Prelievo |
|---|---|---|---|---|---|
| `promo` | no | sì (con fee uso) | sì | no | mai |
| `purchased` | sì | sì | sì | sì | no (voucher) |
| `earned` | sì | sì | sì | sì | sì (verif.+KYC) |

**Principi finanziari non negoziabili:**
- Saldo **derivato** dal ledger, mai memorizzato.
- **Partita doppia**: ogni evento è una distribuzione che somma a zero.
- Solo TREASURY conia; `promo` da budget autorizzato in ADV.
- **Take unico sul margine** (rivendita − B2B), mai sul lordo.
- **Invariante di solvibilità:** riserva € ≥ `purchased` + `earned` circolanti.
- R2 — copertura: il seller riceve `earned` solo se pagato in `purchased`; pagamenti in `promo` arrivano come `promo`.

**Distribuzione del margine (organico, C31):** 25% Shaer · 20% reward suggeritori (coppia vincente) · 1% cashback buyer (`promo`) · 54% seller.
**Sotto campagna:** il margine resta **tutto** al seller; reward (25% del prezzo B2B) e cashback escono dal **minipool** (slider Reach↔Vendita). I **view-credit** (engagement) escono dal Reach a ogni suggerimento, in tempo reale, e **non** sono rimborsati in caso di reso.
**Fee B2B (C37):** solo su vendite B2B (producer→seller/producer), cumulato **annuale**, scaglioni marginali **15% ≤500k€ / 10% 500k–2m€ / 3% >2m€**, override 3–15% via `fee_rules`. La paga il producer.
**Fee uso promo del buyer (C32):** tier 20/15/10 sul margine.

### 1.5 Recensioni & rank
- Scala **10 stelle** per categoria. Solo da TXN `completed`. No auto-recensione.
- Categorie (estendibili da admin): **prodotto** = qualità/comfort/aspettative; **persona** = cordialità/generoso/professionalità/generale.
- Direzioni: buyer→prodotto, buyer→seller, **seller→buyer**, **buyer→suggeritore** (attiva in MVP, misura l'accuratezza del consiglio).
- Incentivo: **base** `promo` per ogni recensione + **bonus** mutuo quando buyer↔seller recensiscono entrambi → in quel momento le due recensioni diventano **pubbliche** (double-blind anti-ritorsione). Recensioni prodotto/suggeritore pubbliche subito.
- **Rank bayesiano** (prior 5 voti @ 5,0), provvisorio sotto 3 recensioni; pilota il **moltiplicatore Shaerer** sul reward-vendita (C21c). Stella colorata rosso(0)→arancione(10).

### 1.6 Oggetti di dominio confermati (dal Master originale, tuttora validi)
- **TXN** come unica fonte di verità: stati OPEN → SUGGESTED → IN_PROGRESS → COMPLETED → (EXPIRED/ABANDONED). Tutto (suggerimenti, scelta, vendita, reward, recensioni) appende al TXN.
- **Ranking tripartito** (Buyer/Seller/Shaerer) — ora alimentato dalle recensioni.
- **Push Journey** (sequenze notifiche per Buyer/Seller/Shaerer).
- **Wishlist/Crowdfunding** (revoca contributo entro 2h), **Ask Help**, **Product ID**, **analytics_events** come data layer.

### 1.7 Artefatti esistenti
| File | Ruolo | Stato |
|---|---|---|
| `SHAER_MASTER.md` (questo) | Fonte unica | ✅ canonico |
| `0001_initial_schema.sql` | Schema base 17 moduli | ✅ smoke-tested (ma encode il modello credito **vecchio** → vedi Audit A6) |
| `Shaer_it_Simulatore_MVP_v3a.html` | Simulatore corrente | ✅ in uso · ⚠️ DA CHIARIRE delta vs v3 |
| Doc precedenti (Master v1.1, Backlog v1.1, Note, Regolamenti) | Storico | 🗄️ **da archiviare** (assorbiti qui) |

### 1.8 DA CHIARIRE (non presente/non confermato nei file)
- Importi engagement non confermati esplicitamente da Nick: `review_base=20`, `review_bonus=10`, `viewReward=50` (oggi default di simulatore).
- `Shaer_it_Simulatore_MVP_v3a.html`: modifiche introdotte rispetto alla v3 (non ispezionabili da qui).
- C9 (soglia rank "inaffidabile": 3 TXN aperte?), C10 (max push/giorno), C11 (premio acquisto entro N ore/giorni) — mai chiusi.
- Rank **unico vs per-ruolo** (oggi unico nel simulatore).
- Provider KYC/AML e flusso Stripe per on-ramp/prelievo.
- Validazione legale MiCA/e-money e IVA/fatturazione sul prelievo.

---

## 2. SUPERATO / DA ARCHIVIARE
| Elemento | Dove | Sostituito da |
|---|---|---|
| Reward fissi crediti (+10 reg, +5 consiglio, +10% vendita…) | Master §6 | Modello a 3 classi + take sul margine (§1.4) |
| Split economico 25% view / 75% vendita | Master §10 | Take unico sul margine + minipool campagna |
| "Dual-mode solo BUYER/SELLER" e "PRODUCER≠SELLER" | Master §2 | Multi-ruolo a 3 (C35) |
| Modello reward 2%/+2%/25%/3% del simulatore v1 | Note Sessione v1 | C31 (margine) / reward campagna dal minipool |
| Conflitti C13–C18 (vecchia formulazione split) | Note Sessione v1 | Risolti/superati dal nuovo modello |
| `platform_config` come sede delle percentuali | Master | `fee_rules` + `plans` (config); `platform_config` solo per parametri non-fee |
| C39 "recensione suggeritore non in MVP" | Regolamento Recensioni | **Attivata in MVP** (decisione in sessione) |

---

## 3. AUDIT
Formato: [PROBLEMA] → [PERCHÉ] → [SOLUZIONE] → [PRIORITÀ].

| # | Problema | Perché è un problema | Soluzione concreta | Priorità |
|---|---|---|---|---|
| A1 | Due modelli economici coesistono nei doc (vecchio §6/§10 vs nuovo a margine) | Chi legge i vecchi file implementa la cosa sbagliata; rischio di rifare `credits_ledger` | Dichiarare §6/§10 superati (fatto qui §2); archiviare i vecchi file | **alta** |
| A2 | `0002_value_distributions.sql` non ancora prodotto | Tutto il nuovo modello vive solo in doc+simulatore; il DB non lo regge | Produrre `0002` (6 conti, `value_distributions`+`_lines` somma-zero+UNIQUE, `plans`, `fee_rules`, `agreed_price` versionato, `credits_ledger`→vista) | **alta** |
| A3 | `0001` codifica il modello credito vecchio | Drift fra schema base e modello vigente | In `0002`: trigger no-UPDATE/DELETE su `value_distribution_lines`, `credits_ledger` come vista derivata; deprecare colonne reward fisse | **alta** |
| A4 | Numerazione conflitti ambigua (C13–C18 e C38–C43 usati con significati diversi tra doc) | Confusione su cosa è bloccato | Decision log unico (§6) come unica numerazione valida; i doc storici non fanno fede | **media** |
| A5 | Multi-ruolo (C35) contraddice Master §2 | Regole d'accesso/registrazione incoerenti | Adottare tri-ruolo + verifica documentale per SELLER/PRODUCER (§1.2) | **media** |
| A6 | Clawback reward su reso può portare il suggeritore in saldo negativo | Un suggeritore che ha già speso il reward va sotto zero al reso | **Saldo bloccato (held)** del reward fino a chiusura finestra-reso, poi sbloccato (C43) | **media** |
| A7 | Semplificazioni del simulatore prese per spec | In sim: fee campagna (intake+riserva) riconosciuta tutta all'avvio; pagamento promo semplificato | In `0002` spalmare `payout_pct` sulle uscite reali; modellare il path promo in modo granulare | **media** |
| A8 | Esposizione regolatoria (prelievo→€, token) | MiCA/e-money: il "non siamo responsabili" non basta | MVP **strettamente closed-loop**; prelievo manuale supervisionato; validare con consulente prima di aprire conversione/exchange | **alta** |
| A9 | Recensione incrociata fittizia (multi-ruolo) | A vende a B, B vende ad A, si recensiscono a vicenda → rank gonfiato | Controllo pattern sui cicli sospetti + incentivo in `promo` (non monetizzabile) già mitiga | **media** |
| A10 | Conflitti vecchi C9/C10/C11 mai chiusi | Soglie operative (anti-frode, push) non definite | Decidere valori di default e bloccarli (§6) | **bassa** |

---

## 4. SUGGERIMENTI (alto impatto / basso sforzo)
1. **Held balance sul reward** durante la finestra reso: risolve A6 con poca logica e protegge la cassa.
2. **Incentivo recensione a budget ADV con tetto giornaliero**: spesa engagement sempre provabile e sotto controllo.
3. **Rank visibile solo ≥3 recensioni** (già nel sim): evita scalate ingiuste dei suggerimenti con un solo voto.
4. **Set di categorie recensione per verticale merceologico** (la tabella `review_categories` lo permette già): qualità/comfort/aspettative per scarpe, affidabilità/prestazioni per elettronica.
5. **Reciprocità incentivo** (bonus solo se entrambi recensiscono): già implementato, alza il tasso di recensione.
6. **Dashboard esterne vendibili** costruite sui sotto-conti `adv:CMP-X` già tracciati: ricavo dati senza lavoro extra di strumentazione.

---

## 5. ROADMAP UNICA (ordinata, prioritizzata)
1. **`0002_value_distributions.sql`** — 6 conti, `value_distributions`+`_lines` (somma-zero, UNIQUE idempotenza), `plans`, `fee_rules`, `agreed_price` versionato, `credits_ledger`→vista. Smoke-test PostgreSQL 16. *(A2/A3)*
2. **Tabelle recensioni** — `review_categories`/`reviews`/`review_scores` + `review_reward` in `fee_rules`; seeding categorie attive. *(A1 chiuso a valle)*
3. **Seeding** `plans` + `fee_rules` con i default bloccati (C31/C32/C37) + categorie recensione.
4. **Held balance reward** (finestra reso) e **clawback** coerente. *(A6)*
5. **Fee campagna granulare** (payout spalmato) + path pagamento promo modellato. *(A7)*
6. **Rank engine**: vista rank persona/prodotto (bayesiano) + applicazione moltiplicatore al payout vendita (chiude C21c).
7. **Monitoraggio anti-frode** (viste/alert, incl. cicli recensione) + **gate KYC** al prelievo. *(A9/A8)*
8. **Archiviazione doc storici** e marcatura "superseded" (snellire). *(A1/A4)*
9. **App reale (Next.js)**: slice `feat/value-distribution`, `feat/ask-help`, `feat/reviews` partendo da `0002`.
10. **Strumenti B2B** (Fase B): dashboard offerta lotto + simulatore finanziario producer.
11. **Validazione legale** (MiCA/e-money, IVA su prelievo) — in parallelo, prima di aprire conversione. *(A8)*
12. **Pilota Roma silenzioso** (~1.000 seller pre-registrati, pagamenti differiti).

---

## 6. DECISION LOG (unico valido)
Stato: ✅ bloccato · ⏳ aperto · 🗄️ superato.

| # | Tema | Decisione | Stato |
|---|---|---|---|
| C13–C18 | Vecchio split 2/2/25/3, base %, finanziamento pool, escrow, multi-seller, targeting | Superati dal modello a margine; multi-seller→coppia prodotto+negozio; targeting per regione/città/nazione+liste+rete, 1 suggerimento/Ask | 🗄️/✅ |
| C19 | Risoluzione fee | Precedenza override utente > piano > globale (`fee_rules`) | ✅ |
| C21b | Riserva Reach vs Vendita | % del pool via slider; auto-pausa sotto 1 reward | ✅ |
| C21c | Moltiplicatore rank | Solo reward-vendita; Reach in parti uguali | ✅ |
| C24 | Classi credito | `promo`/`purchased`/`earned` | ✅ |
| C25 | Prelievo | Solo `earned` + ruolo verificato + KYC | ✅ |
| C26 | Fee piano | `intake_pct`+`payout_pct` = take piano | ✅ |
| C28 | Base take | Sul margine, take unico per transazione | ✅ |
| C29 | Cashback | Classe `promo` | ✅ |
| C30 | Floor Shaer | ≥25% del margine (blended) | ✅ |
| C31 | Split organico | 25 Shaer / 20 reward / 1 cashback / 54 seller (del margine) | ✅ |
| C32 | Fee uso promo buyer | Tier 20/15/10 sul margine; proventi al seller come `promo` | ✅ |
| C33 | Settlement B2B | Prepagato + dentro piattaforma; fattura di verifica per contratti esterni | ✅ |
| C34 | Ambito campagna | Geo (regione/città/nazione); producer solo o whitelist seller; buyer riceve bonus del pool da cui acquista | ✅ |
| C35 | Multi-ruolo | 3 wallet; transfer tra propri ruoli verificati 1:1 tracciato; classe preservata | ✅ |
| C36 | Anti-frode multi-ruolo | Nessun blocco sulle transazioni (auto-dealing costa fee); resta vietata l'auto-recensione (§15.5); rischio pool collaborativo mitigato dalla trasparenza | ✅ |
| C37 | Fee B2B | Scaglioni annui 15/10/3 sul valore lotto; override 3–15% | ✅ |
| C38 | Incentivo recensione | Per **ogni** recensione separata (prodotto, seller, suggeritore), base `promo`; storico filtrabile da admin (utente/categoria/stelle/prodotto) | ✅ |
| C39 | Recensione suggeritore | **Attiva in MVP** (a vendita confermata, buyer recensisce prodotto+seller+suggeritori) | ✅ (aggiorna doc) |
| C40 | Reso & recensioni | Reso rimborsa tutto **tranne i view-credit**; vietato il reso se il buyer ha consigliato quel prodotto | ✅ |
| C41 | Rank | Media **bayesiana**, soglia **3** recensioni, categorie a peso uguale | ✅ |
| C42 | Editabilità recensione | Editabile entro 48h (assorbe vecchio C8); finestra recensione post-TXN da confermare (vecchio C12) | ⏳ |
| C43 | Clawback reward su reso | Reward **bloccato** fino a chiusura finestra-reso, poi sbloccato | ⏳ |
| C9 | Soglia rank inaffidabile | 3 TXN aperte? | ⏳ |
| C10 | Max push/giorno | — | ⏳ |
| C11 | Premio acquisto entro N | — | ⏳ |
| — | Incentivi engagement (importi) | `review_base=20`, `review_bonus=10`, `viewReward=50` | ⏳ DA CONFERMARE |

---

## 7. PRINCIPI NON NEGOZIABILI (consolidati)
1. Anti-frode strutturale: QR obbligatorio; rank/recensioni solo da TXN verificate; no auto-recensione.
2. Saldo derivato dal ledger; partita doppia; solo TREASURY conia; invariante di solvibilità.
3. Tutto in crediti internamente; €/$ solo a on/off-ramp.
4. Take unico sul margine; fee decise solo da Shaer.it via `fee_rules`.
5. Un solo motore di ripartizione parametrico; il TXN è l'unica fonte di verità.
6. Zero advertising tradizionale; no MLM (affiliazione mono-livello).
7. MVP closed-loop; conversione/exchange solo Fase 2 con validazione legale (KPMG).
8. I documenti vivi si modificano solo con la frase di blocco; questo file è la fonte unica.

---
*SHAER_MASTER.md · v1.0 canonico · Giugno 2026 · Nick + Claude (Anthropic) · uso interno*
