---
task: T-019
tier: M
titolo: Pagina analisi del singolo QR
aree: [analytics, dashboard, qr-detail, ux]
stato: aperto
riporti: 0
sessioni: [2026-07-27]
---

# T-019 · Migliorare l'analisi del singolo QR code

Aperto dal feedback di Nick (2026-07-27): "stessa cosa per l'analisi del singolo QR".

## Stato di partenza
Esiste `app/dashboard/qr/[short_code]` (dettaglio QR, dalla lista "I tuoi QR").
Va portato allo stesso livello della dashboard aggregata dopo T-014.

## Direzione
Riusare **le stesse funzioni pure** di `lib/dashboard.ts` (groupCount, dailyBuckets,
hourlyBuckets, hourDayMatrix, uniqueCount, insights) filtrando le scansioni sul
singolo `qr_id` invece che su tutto l'owner. Il grosso del motore è già scritto e
testato in T-014: qui è **composizione**, non logica nuova.
- Aggiungere: timeline + selettore periodo (T-015) per-QR, breakdown, geo, heatmap,
  unici, consigli — tutto scoping al singolo QR.
- Coordinare col **rollup** (T-012): il dettaglio di un ramo può mostrare anche il
  sottoalbero (own vs subtree).

## Composizione
- **Consuma**: `lib/dashboard.ts` (T-014), `qr_tree_rollup` (T-012), il selettore
  periodo (T-015). Nessuno di questi va ridefinito.
- Se dopo T-017 la dashboard aggregata cambia layout, allineare il dettaglio.

## Nota
Prova: le funzioni pure sono già testate; la pagina è composizione → browser per il
visivo. Niente RPC nuova salvo necessità di scala (coerente con T-014).
