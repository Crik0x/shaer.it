---
task: T-015
tier: M
titolo: Selettore periodo delle analitiche
aree: [analytics, dashboard, server-components]
stato: chiuso
riporti: 0
sessioni: [2026-07-27]
---

# T-015 · Selettore periodo (7/30/60/120/360g + orario 7g)

Scorporo da T-014, richiesto da Nick: "Ritmo settimanale personalizzabile".

## Cosa è entrato
Barra periodo sopra la timeline (`app/dashboard/page.tsx`), config `PERIODS`
(7/30/60/120/360 giorni + **orario-7g** a 168 barre). Il periodo vive nel query
param `?d=` → **Server Component**, cambiare periodo è una navigazione, **zero JS**
(regola 9). Governa timeline, breakdown, geo, heatmap, unici (tutti derivati sulla
finestra scelta). Funzione pura nuova `hourlyBuckets` (+test).

## Scelta di struttura
- **Query param, non client state.** La dashboard è già `force-dynamic` e
  Server-only: un `?d=` re-renderizza server-side col nuovo `since`. Niente
  `'use client'`, niente idratazione. Il selettore sono `<Link>`, active-state
  derivato da `period.key`.
- **Trend 7g disaccoppiato dalla finestra.** I consigli confrontano ultimi 7g coi
  7 precedenti: con periodo=7g la finestra non conterrebbe i 7 giorni prima →
  **due count query dedicate** (`since7`, `since14..since7`), indipendenti dal
  periodo. Costo: 2 head-count, trascurabile.

## Prova
`hourlyBuckets` testata (zeri riempiti, ordine, label oraria, fuso UTC). Suite
52/52 verde, tsc pulito, pagina compila. Rendering del selettore a video: **[~]**
confine visivo — confermato da Nick loggato (screenshot dashboard popolata).

## Attriti
Uno: `await searchParams` messo dentro la callback di `.find` → parse error
"await isn't allowed in non-async function" (colto da tsc e dai log runtime).
Estratto in `const { d } = await searchParams` prima del `.find`. Lezione minore,
non ricorrente: non serve conversione.
