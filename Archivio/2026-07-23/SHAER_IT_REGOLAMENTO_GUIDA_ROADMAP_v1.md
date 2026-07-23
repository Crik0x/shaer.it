# SHAER.IT — REGOLAMENTO GENERALE, GUIDA E ROADMAP
## Documento di sintesi del layer economico: decisioni bloccate, regole non negoziabili, piano di lavoro
> Versione 1.0 | Giugno 2026 | Uso Interno Riservato
> 📎 Da leggere con: `SHAER_IT_MASTER_REFERENCE_v1_1.md`, `SHAER_IT_BACKLOG_TABLE_v1_1.md`, `SHAER_IT_NOTE_ECONOMIA_CREDITI_v1.md`
> Questo documento **registra** ciò che è stato deciso. È la fonte da cui si scrivono `0002` e l'aggiornamento del simulatore.

---

## 1. PRINCIPI NON NEGOZIABILI DEL LAYER ECONOMICO

1. **Il saldo non si memorizza: si deriva dal ledger.** Ogni wallet/conto = somma delle righe di `value_distribution_lines`. Mai un campo `credits` mutabile.
2. **Partita doppia sempre.** Ogni evento economico è una distribuzione le cui righe sommano a **zero**. Nessun credito nasce o sparisce senza contropartita.
3. **Solo TREASURY conia.** I crediti coperti nascono contro € realmente versati; i crediti `promo` nascono da TREASURY entro il budget autorizzato in `SHAER_ADV`.
4. **Tutto in crediti.** Unità interna unica: `100 crediti = 1,00 €`. €/$ solo all'on-ramp (versamento) e off-ramp (prelievo).
5. **Take unico sul margine.** Un solo prelievo piattaforma per transazione, calcolato sul **margine** (rivendita − B2B), mai sul lordo.
6. **Invariante di solvibilità.** In ogni istante: riserva € in TREASURY ≥ crediti `purchased` + `earned` circolanti. I `promo` non sono coperti e non sono prelevabili.
7. **Anti-frode strutturale (Master §2/§15.5).** QR obbligatorio; rank/recensioni solo da TXN verificate; **nessuna auto-recensione** (buyer_id ≠ seller_id ai fini di rank/recensione).
8. **Fee decise solo da Shaer.it** e configurabili via `fee_rules`, mai hard-coded.

---

## 2. CONTI DI SISTEMA (6)

| Conto | Funzione |
|---|---|
| `SHAER_TREASURY` | Zecca/riserva: conia crediti contro € versati e contro budget promo |
| `SHAER_ESCROW` | Custodia budget campagne (sub-libro `escrow:campaign:CMP-X`) |
| `SHAER_SETTLEMENT` | Custodia pagamento buyer in transito (sub-libro `settlement:txn:TXN-Y`) |
| `SHAER_REVENUE` | Tutti i ricavi fee (intake campagna, take sul margine, fee uso promo, fee B2B) |
| `SHAER_ADV` | Minipool campagne (`adv:CMP-X`), hub analitico delle dashboard |
| `SHAER_BURN` | Sink di distruzione crediti `earned` in fase di prelievo (€ off-ledger) |

---

## 3. CLASSI DI CREDITO (3)

| Classe | Coperto € | Acquisto prodotti | Transfer tra propri ruoli | Finanzia campagne | Prelievo (burn) |
|---|---|---|---|---|---|
| `promo` | ❌ | ✅ con fee d'uso (C32) | ✅ resta `promo` | ❌ | ❌ mai |
| `purchased` | ✅ | ✅ | ✅ resta `purchased` | ✅ | ❌ (voucher closed-loop) |
| `earned` | ✅ | ✅ | ✅ resta `earned` | ✅ | ✅ (SELLER/PRODUCER verif. + KYC) |

**R1 — Il transfer preserva la classe.** **R2 — Copertura:** il seller riceve `earned` solo se pagato in `purchased`; pagamenti in `promo` arrivano al seller come `promo`. **Ordine di spesa:** `promo` → `purchased` → `earned`.

---

## 4. REGISTRO DECISIONI (C13–C37)

| # | Tema | Decisione bloccata |
|---|---|---|
| C13 | Premio partecipazione: tutti o solo scelto | **Superato dal nuovo modello**: engagement (Reach) ai suggeritori del prodotto; reward-vendita solo alla coppia vincente |
| C14 | % su pool o budget | **Superato**: reward = % del margine (organico) o dal minipool (campagna); base reward campagna = prezzo B2B |
| C15 | Finanziamento pool per richiesta | Campagna = minipool prepagato; organico = dal margine alla vendita |
| C16 | Approvazione/escrow campagne collaborative | Ogni co-creatore versa la sua quota in ESCROW; campagna attiva solo a quote tutte versate |
| C17 | Quale seller con multi-seller | **Coppia prodotto+negozio**; reward alla coppia vincente; base = B2B di quel negozio (snapshot) |
| C18 | Targeting pubblico / anti-spam | Targeting per regione/città/nazione + liste + rete; **1 suggerimento per Ask** |
| C19 | Risoluzione fee | Precedenza: **override utente > piano > globale** (`fee_rules`) |
| C21b | Riserva Reach vs Vendita | % del pool via **slider** in fase campagna; auto-pausa sotto 1 reward |
| C21c | Ambito moltiplicatore rank | **Solo reward-vendita**; Reach in parti uguali |
| C24 | Classi credito | `promo` / `purchased` / `earned` (vedi §3) |
| C25 | Eleggibilità prelievo | Solo `earned` + SELLER/PRODUCER verificato + KYC |
| C26 | Schedule fee piano | `intake_pct` + `payout_pct`, somma = take del piano |
| C28 | Base del take | **Sul margine, take unico per transazione** |
| C29 | Classe del cashback | `promo` |
| C30 | Floor Shaer | **≥ 25% del margine**, blended sulla transazione chiusa |
| C31 | Split organico (% del margine) | **25 Shaer / 20 reward / 1 cashback / 54 seller** |
| C32 | Fee uso promo del buyer | Tier **20/15/10** sul margine; proventi al seller come `promo` |
| C33 | Settlement B2B | **(a) Prepagato + dentro piattaforma**; per contratti chiusi fuori, **fattura di verifica manuale** |
| C34 | Ambito campagna | Geo-targeting regione/città/nazione; producer in solo o con **whitelist** di seller; il producer vede chi lancia campagne sul suo prodotto; il buyer riceve il bonus del pool da cui acquista |
| C35 | Wallet multi-ruolo | **3 wallet** (BUYER/SELLER/PRODUCER); transfer tra propri ruoli **verificati**, 1:1, **tracciato con motivazione**; classe preservata |
| C36 | Anti-frode multi-ruolo | **Nessun blocco sulle transazioni** (l'auto-dealing costa fee al dealer). Residui documentati: (1) auto-recensione vietata per §15.5; (2) estrazione dal pool collaborativo = rischio verso il co-finanziatore, mitigato dalla trasparenza delle dashboard |
| C37 | Fee B2B | Solo su B2B (producer→producer/seller, no buyer). **Cumulato annuale**. Scaglioni marginali sul valore del lotto (trasporto escluso): **15% ≤500k, 10% 500k–2m, 3% >2m**; aliquote override-abili 3–15% via `fee_rules` |

**Decisioni architetturali aggiuntive:** 6 conti di sistema; saldo derivato; `value_distributions` bilanciato/idempotente/append-only; `credits_ledger` → vista derivata; `agreed_price` versionato su `contracts` con snapshot in distribuzione; multi-ruolo a 3 con documenti per SELLER/PRODUCER; **sotto campagna il margine non si tocca e il seller lo tiene tutto** (reward+cashback dal minipool).

---

## 5. COSA NON SI FA PIÙ (anti-pattern)

- ❌ Memorizzare un saldo (`u.credits`): sempre derivato dal ledger.
- ❌ Movimenti di credito sbilanciati: ogni distribuzione somma a zero.
- ❌ Coniare crediti fuori da TREASURY o senza autorizzazione ADV.
- ❌ Calcolare fee sul lordo: sempre sul margine.
- ❌ Due take nella stessa transazione.
- ❌ Pagare reward a suggeritori fuori dalla coppia vincente dal pool vendita.
- ❌ Convertire `promo` in `earned`.
- ❌ Importi interni in €/$: sempre crediti.
- ❌ Auto-recensione / gonfiare rank.
- ❌ Modificare i documenti vivi senza la frase di blocco.

---

## 6. FILE DA PRODURRE E WORKSTREAM SEPARATI

| # | Workstream | File / Output | Dipende da | Stato |
|---|---|---|---|---|
| WS1 | Migrazione layer valore | `0002_value_distributions.sql` (6 conti, `value_distributions`+`_lines`, `plans`, `fee_rules`, `agreed_price`, `credits_ledger` come vista) | §2–§4 di questo doc | ⏳ prossimo |
| WS2 | Simulatore aggiornato | `Shaer_it_Simulatore_MVP_v2.html` (ledger doppia entrata, take margine, classi credito, 3 ruoli/3 wallet, B2B + fee scaglioni, mini-sim campagna, grafici) | §2–§4 | 🔨 in consegna |
| WS3 | Aggiornamento documenti vivi | Master §2 (multi-ruolo), §6 (conti/classi/invariante), §10 (sostituito da take-margine); Backlog Mod. 6 e 12 + nuovo modulo B2B/Fee | richiede frase di blocco | ⏳ |
| WS4 | Dashboard offerta B2B (producer) | spec + frontend slice | WS1 | ⏳ Fase B |
| WS5 | Simulatore finanziario producer | calcolatore BOM/COGS/REV/GP/NP/EBITDA/BEP/ROI/CashFlow/CAC | indipendente | ⏳ Fase B |
| WS6 | Seeding piani + fee_rules | dati `plans`/`fee_rules` con default | WS1 | ⏳ |
| WS7 | Monitoraggio anti-frode | viste/alert dashboard (no blocchi) | WS1 | ⏳ Fase C |

---

## 7. DASHBOARD CREAZIONE OFFERTA B2B (spec WS4)

**Scheda prodotto (una volta):** nome, categoria, Product ID, descrizione, scadenza/durata, provenienza, stabilimento di produzione, ingredienti/materiali, certificazioni (upload), EAN/barcode, dati di etichetta di legge.

**Offerta/lotto (a ogni vendita B2B):** lotto ID, quantità disponibile, prezzo unitario B2B (crediti), MOQ, quantità massima per ordine, costo trasporto (unità o ordine, per zona), prezzi a scaglioni per volume, validità offerta, disponibilità geografica, termini consegna/pagamento, IVA + fattura, tracciabilità lotto.

## 8. SIMULATORE FINANZIARIO PRODUCER (spec WS5)

Slider (unità, prezzo, budget campagna) + ricalcolo live, confronto con/senza campagna: **BOM**, **COGS**, **REV**, **GP** (+%), fee piattaforma (`b2b_fee_pct` + spesa campagna), **NP**, **EBITDA**, **BEP**, **ROI**, **Cash Flow**, **CAC**. Costi esterni (BOM/COGS) in €; flussi di piattaforma in crediti **e** €. Estensione futura: B2B producer→producer (per ora solo input del calcolatore).

---

## 9. ROADMAP

**Fase A — Layer valore (ora):** WS1 (`0002`) + WS2 (simulatore v2) + WS6 (seeding). Smoke-test PostgreSQL 16. Poi WS3 (aggiornamento documenti vivi con frase di blocco).

**Fase B — Strumenti B2B (dopo schema stabile):** WS4 (offerta B2B) + WS5 (simulatore finanziario producer).

**Fase C — Operatività & fiducia:** WS7 (monitoraggio anti-frode), pilota Roma silenzioso (~1.000 seller pre-registrati, pagamenti differiti).

**Da validare con consulente (non MVP):** prelievo = reddito reale → IVA/fatturazione; token su exchange/DEX = Fase 2 con KPMG; MVP **strettamente closed-loop**.

---

## 10. COME BLOCCARE / MODIFICARE

Frase di blocco:
> `Approvo: [descrizione]. Aggiorna il backlog da ⏳ a ✅ e chiudi il conflitto Cx.`

---

*Shaer.it — Regolamento, Guida e Roadmap v1.0 — Giugno 2026*
*Fondatore: Nick | Assistito da Claude (Anthropic) | ⚠️ Uso esclusivo interno*
