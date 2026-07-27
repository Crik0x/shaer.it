---
task: T-017
tier: M
titolo: Restyling e densità della dashboard
aree: [dashboard, design-system, ux]
stato: aperto
riporti: 0
sessioni: [2026-07-27]
---

# T-017 · Ottimizzare spazi e disposizione della dashboard

Aperto dal feedback di Nick (2026-07-27): "migliorare la dashboard, ottimizzare gli
spazi e la disposizione delle informazioni".

## Stato di partenza
La dashboard oggi è una **colonna verticale** di card `space-y-8`: KPI, timeline,
device/browser, os/lingua, paese/città, heatmap, rami, elenco QR. Con i widget
aggiunti in T-014 è diventata lunga da scorrere. Nessun problema di correttezza —
è densità/gerarchia visiva.

## Direzione (da confermare con Nick prima)
- Griglia a più colonne per i breakdown (device/browser/os/lingua/geo) invece di
  righe piene: riduce lo scroll, raggruppa il "chi/cosa/dove".
- Gerarchia: KPI + timeline + consigli "above the fold"; i breakdown secondari
  sotto, magari in una griglia compatta o tab.
- Vincoli fermi: **solo token** del design system (regola 8), **Server Components**
  di default (regola 9), estetica Stripe/Vercel/Linear (`MD/QR_PLATFORM.md §6`).

## Nota
Prima di toccare, chiedere a Nick il target: una wireframe/riferimento, o mano
libera entro il design system. Task puramente visivo → prova = browser/screenshot,
non test.
