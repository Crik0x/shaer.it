---
task: T-025
tier: C
titolo: Fondazione documentale d'ecosistema (MDD + PRD skeleton, restructure MD/)
aree: [documentazione, ecosistema, dominio, decisioni, roadmap, crediti, mlm, trasporto]
stato: chiuso
riporti: 0
sessioni: [2026-07-28, 2026-07-29, 2026-07-29b]
---

## Obiettivo
Portare i documenti di Shaer.it dall'altezza **QR** all'altezza **ecosistema**: il QR
è il Modulo 0, non il prodotto. Posare l'MDD-radice e lo skeleton del PRD, fissare le
decisioni fondative, aprire i task di seguito. Fatto quando MDD+PRD esistono, coerenti,
e il TODO porta i blocchi da fare.

## Accertato (prove)
- **Restructure `MD/`**: `git mv` dei 5 doc QR in `MD/modulo-qr/` (MDD/PRD/SAD/ROADMAP/
  DESIGN_SYSTEM); link `../` corretti nei tre che citavano SHAER_MASTER/SAAS_BUILD_PLAN.
  Fonti di dominio (`SHAER_MASTER.md`, `SAAS_BUILD_PLAN_V1.md`, `QR_PLATFORM.md`,
  `DEPLOY.md`) **lasciate** in `MD/` — referenziate da migrazioni applicate + `revisore`.
- **`MD/ecosistema/MDD.md` v1.3**: 14 sezioni, mappa 17 moduli (solo Modulo 0 ✅),
  roadmap a blocchi §10 (F0…F4, B-D1…B12), decisioni **E-D-01…E-D-16** §12.
- **`MD/ecosistema/PRD.md` v0.1**: skeleton, epiche EE1…EE14 con stato e blocco.
- **Riferimenti verificati esistenti**: `Struttura/Schema/Shaer_it_Simulatore_MVP_v5.html`
  (repo, meccanica economica) · `D:\Desktop\Arkés\arkes_dashboard_v3.html` (fuori repo) ·
  `D:\Desktop\I Damascati\Code\Sito\damascati` (fuori repo, **stesso stack** Next 16 +
  React 19 + Supabase `apps/public`, **stesso metodo**).
- **Nessun codice di produzione toccato** (`apps/qr/` intatto). Zero task chiusi.

## Domande e risposte (a Nick, con conseguenza)
1. **Stella polare?** → Super-piattaforma unica (build plan = moduli + SHAER_MASTER =
   economia + QR = verifica). *Conseguenza:* E-D-02.
2. **MLM vs mono-livello?** → **Due livelli**: (A) referral proprio mono-livello a tempo;
   (B) MLM-as-a-service parametrico venduto al business. *Conseguenza:* E-D-01; il NETWORK
   del build plan si recupera come Mod. 10, non si scarta.
3. **Finanziamento campagne / reward MLM in che valuta?** → budget del creatore, split
   deciso da lui, commissione Shaer dal pannello admin; reward = **crediti Shaer** dal
   budget. *Conseguenza:* E-D-11; verità funzionale nel simulatore v5.
4. **Valuta bonus dipendenti?** → **crediti Shaer a circuito chiuso**: spendibili solo se
   il commerciante versa € veri, altrimenti punto contabile; held nel pool → distribuiti a
   TXN avvenuta. *Conseguenza:* E-D-16 (esempio ristorante, prodotto #x35, soglie 1000pz o
   19.000€, 30% proporzionale).
5. **Profondità permessi?** → **admin-first** (l'admin Shaer assegna permessi scelti uno a
   uno; commerciante in seguito). *Conseguenza:* E-D-13.

## Decisioni
**E-D-01…E-D-16** (MDD §12). Strutturali → **da promuovere in `memoria/DECISIONI.md`**
come `E-D-NNN` col perché (L-008) = **T-027**, alla conferma della visione da parte di Nick.
Scartato: (a) "solo mono-livello, no MLM" (mia E-D-01 v1, errata — corretta con Nick);
(b) spostare `QR_PLATFORM.md`/migrazioni (avrebbe rotto puntatori vivi).

## Attriti
- Numerazione §6.1/6.2 fusa dentro §5 → rinumerata a 5.1/5.2 e rimandi corretti → no test (doc).
- Link relativi dopo `git mv` → corretti a `../` solo dove puntavano fuori cartella → no.
- Ancora `Apertura: 95aa0f8` in STATO **stantia** (commit successivi non aggiornati) →
  ricalcolata a mano dallo `git status`/working-tree → prevenibile? sì, `/apertura` deve
  fissare l'ancora; qui la sessione è partita senza `/apertura`.
- **(sessione 2, 2026-07-29)** Riga di stato `MDD.md:3` rimasta a `E-D-24` dopo aver aggiunto
  E-D-25 (fidelity) in un secondo momento → colta dal distillatore, corretta a `E-D-25`.
  Stessa famiglia di L-008 (decisione non propagata all'intestazione). **Prevenibile?** sì:
  candidato hook se ricorre — grep dell'ultimo `E-D-NNN` di `DECISIONI.md` vs riga di stato del
  documento madre. Prima occorrenza: si annota, non si meccanizza ancora.

## Avanzamento 2026-07-29 (sessione 2)
- **8 nodi §13 sciolti** con Nick via `MD/ecosistema/DOMANDE-NICK.md` → promossi
  **E-D-17…E-D-25** in `DECISIONI.md` (col perché e l'alternativa scartata). MDD §13 non ha
  più nodi impl aperti per F1; MDD a **v1.5**.
- **PRD riempito** (v0.3) con requisiti + **criteri di accettazione testabili** su:
  **EE1** (identità/RBAC, +E-D-21/24), **EE2** (TXN engine), **EE3** (ledger/escrow, +E-D-23
  closed-loop), **EE4** (recensioni/rank), **EE5** (referral, E-D-20), **EE6** (wishlist/
  compleanni, priorità), **EE7** (pannello + **dashboard cliente 7 voci**, E-D-18), **EE10**
  (fidelity split 30/30/40, E-D-25), **EE12** (trasporto 2-scansioni, E-D-19).
- **Restano da riempire nel PRD**: EE8 (QR operativo+escrow), EE9 (moduli operativi), EE11
  (MLM/billing), EE13/EE14, e i requisiti non-funzionali. Non bloccano: sono deeper, non fondativi.

## Stato e piano (task NON chiuso — piano pronto)
La fondazione economica (EE1/EE2/EE3) e le epiche cliente sono specificate e testabili; i nodi
sono decisi. **Prossimo passo netto: T-026 (SAD)** — ora sbloccato: parametri **③ ibrido**
(E-D-17), ledger partita doppia + escrow (E-D-16/22), RBAC admin-first + limiti approvatore
(E-D-13/24). Poi **T-028** (decomporre F1 in task) consumando PRD+SAD. Coda PRD (EE8/9/11/NFR)
si può chiudere in parallelo o dentro il SAD.

**Precedenti da leggere prima (dal distillatore, 2026-07-29):**
- **T-026 (SAD)** → `archivio/T-013-corpus-documentale.md` (stesso percorso MDD→PRD→SAD già fatto
  a livello QR: come il gate-incongruenza fermò il SAD davanti a contraddizioni MDD/produzione —
  stesso rischio ora fra MDD/PRD ecosistema e Modulo 0 in produzione) · `archivio/T-007-hardening-grant-anon.md`
  + `PATTERN.md` riga "confine=DB" (le nuove tabelle ledger/wallet/TXN: un grant "solo authenticated"
  non è reale finché non introspezionato → estendere `grants.test.ts` alla whitelist ledger) ·
  `archivio/T-002-supabase-schema.md` (pattern `owner_id`+RLS multi-tenant già rodato: riusarlo, non riprogettarlo).
- **T-028** → questo dossier §Composizione + `MDD §10` (sequenza stabilisce→consuma B1…B12 e ordine
  T-025/026/028 già dichiarati: non ridiscutere l'incastro in apertura).

## Composizione
**Stabilisce** per tutti i task futuri: la struttura documentale (`ecosistema/` sopra,
`modulo-qr/` sotto), la mappa moduli, le 16 decisioni, la roadmap a blocchi. T-025/026/027/
028 **consumano** questo. Non tocca `apps/qr/` (Modulo 0, in produzione).
