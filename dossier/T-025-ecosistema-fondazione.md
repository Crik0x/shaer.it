---
task: T-025
tier: C
titolo: Fondazione documentale d'ecosistema (MDD + PRD skeleton, restructure MD/)
aree: [documentazione, ecosistema, dominio, decisioni, roadmap, crediti, mlm, trasporto]
stato: aperto
riporti: 0
sessioni: [2026-07-28]
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
   il commerciante versa/riceve € veri, altrimenti punto contabile; held nel pool → distribuiti a
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

## Stato e piano (task NON chiuso — piano pronto)
Il **piano eseguibile** è il blocco-prompt in `memoria/TODO.md` (§Prossima sessione) +
la roadmap a blocchi MDD §10. Sequenza: **T-027** (promuovi decisioni, alla conferma) →
**T-028** (analisi completa: per ogni B1…B12 dichiara stabilisce/consuma, ordina F1) →
**T-025** (riempi PRD da EE1 Identità/RBAC ed EE3 Ledger/escrow) → **T-026** (SAD:
ledger partita doppia, TXN, RBAC admin-first, **architettura parametri ③ ibrido**).
Nodi da chiudere prima di costruire F1: architettura parametri ③ (E-D-09), dashboard
cliente (da definire), privacy tracking trasporto (E-D-06).

## Composizione
**Stabilisce** per tutti i task futuri: la struttura documentale (`ecosistema/` sopra,
`modulo-qr/` sotto), la mappa moduli, le 16 decisioni, la roadmap a blocchi. T-025/026/027/
028 **consumano** questo. Non tocca `apps/qr/` (Modulo 0, in produzione).
