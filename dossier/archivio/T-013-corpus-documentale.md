---
task: T-013
tier: C
titolo: Corpus documentale fondativo (MDD, PRD, SAD, Design System, Roadmap)
aree: [documentazione, visione, architettura, design-system, roadmap, dati-personali, compliance]
stato: chiuso
riporti: 0
sessioni: [2026-07-26]
---

# T-013 · I 5 documenti fondativi

## Cosa e perché
Nick ha prodotto `memoria/MDD.md` (visione strategica, 16 moduli + backlog) e ha
chiesto di trasformarla in un percorso di realizzazione con 5 documenti canonici:
MDD, PRD, SAD, UI/UX Design System, Development Roadmap. Obiettivo: dare al progetto
una spina dorsale documentale coerente prima di espandere il codice.

## Decisioni raccolte all'apertura (governano tutto il corpus)
Chieste come opzioni-con-conseguenza prima di scrivere (regola: si chiede prima di
costruire). Le 3 risposte di Nick, ora `[LOCKED]` in MDD §2:
- **D-1 Architettura → Ibrido**: redirect di default (regola 7) + landing ospitate
  opzionali col beacon. Session/Event/CRM raggiungibili solo sulle landing nostre.
- **D-2 Dati → PII completo + CRM**, ma **vincolato**: PII solo con base GDPR piena
  (consenso, DPA, oblio). Default degradato ad aggregati pseudonimi finché il
  cancello non è passato. È un traguardo con cancello legale, non l'impostazione base.
- **D-3 Gerarchia → Albero di QR** (non tabella `campaigns`): ogni nodo È un QR.
  parent_id self-ref + owner_id per-nodo (delega intermediario) + purpose. È il ponte
  verso SHAER_MASTER (referral/anti-frode/crediti).

## Cosa è entrato (prova: i file esistono, ancorati alla realtà — regola 1)
- `MD/MDD.md` — visione, i motori, le 3 decisioni locked, mappa moduli→fase.
- `MD/PRD.md` — 9 epiche (E1–E9), requisiti MoSCoW, criteri di accettazione testabili.
- `MD/SAD.md` — schema reale + estensione albero (DDL), RPC, sicurezza/GDPR, rendering.
- `MD/DESIGN_SYSTEM.md` — token luxury reali da globals.css (gold/rose/cream/ink/flow),
  Cormorant+Jost, componenti esistenti e da costruire.
- `MD/ROADMAP.md` — M0–M5, sequenza stabilisce→consuma, backlog per fase.

Ancoraggio verificato: schema da `20260724000001_qr_platform_initial.sql`, token da
`apps/qr/app/globals.css`, dossier T-012 per l'analisi dashboard. Nessuna invenzione.

## Precedenti riusati
- `MD/QR_PLATFORM.md` (product definition Fase 1) e `memoria/MDD.md` (visione) come semi.
- `dossier/T-012-campaign-analytics.md` — l'analisi dashboard confluita in PRD E6 / SAD.
- `MD/SHAER_MASTER.md` — dominio referral/crediti, agganciato ma differito.

## Attriti
`attrito → causa → risolto → prevenibile?`
- **MDD contraddiceva la produzione in 2 punti** (tracking full vs redirect esterno;
  PII vs privacy-first shipping) → visione ambiziosa scritta senza guardare il codice
  vivo → fermato al gate incongruenza, esposte le 3 scelte con conseguenza, decise da
  Nick prima di scrivere → **sì, prevenuto**: il gate ha evitato un SAD da riscrivere.
- **"Gerarchia" era sotto-specificata** (campagne vs rete referral) → il seme parlava
  di campagne, T-011 aveva costruito una rete referral → chiesto, Nick ha chiarito
  l'albero-di-QR con delega intermediari → **sì**: chiarito prima del DDL.

## Stato e prova
Chiuso. Prova = i 5 file in `MD/`, coerenti fra loro e con lo schema reale. Nessun
codice di produzione (documentazione): non passa dal revisore. Archiviare.
