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

## Fatto (2026-07-31) — `[~]` visivo in attesa dell'occhio di Nick

Decisione di Nick all'apertura: **sidebar piena (arkes)**, non densifica in-place; prova
**build + suo occhio** (non login usa-e-getta). Struttura da `D:\Desktop\Arkés\
arkes_dashboard_v3.html` (D-012), **token del progetto** (regola 8), niente palette.

- **`app/dashboard/dashboard-shell.tsx`** (nuovo, foglia `'use client'` — regola 9): shell
  arkes = **sidebar 240px + main**. Brand «Shaer.it · QR», nav a gruppi, footer utente
  (email + Esci), topbar con breadcrumb e **hamburger + drawer mobile** (l'unica
  interattività). Token sidebar dedicati del design system (`bg-sidebar`,
  `sidebar-accent`, `sidebar-border`). Nav **solo verso route esistenti** (`/dashboard`,
  `/dashboard/qr/new`); i moduli roadmap (Prenotazioni/Prodotti/Fidelity/Rete = T-039/040/
  041/042/043) come **«presto» disabilitati** — niente link morti (regola 7).
- **`app/dashboard/layout.tsx`**: la data-fetch owner-scoped resta nel Server Component,
  passa `email` + `children` alla shell. Rimosso il vecchio header a barra.
- **`app/dashboard/page.tsx`**: le **sei breakdown** (device/browser/os/lingua/paese/città)
  da tre righe a due colonne → **un'unica griglia `xl:grid-cols-3`** (taglia lo scroll,
  raggruppa chi/cosa/dove). Ritmo verticale `space-y-8`→`space-y-6`.

**Prova**: `next build` **verde** (TypeScript ok, `/dashboard` generata) + albero a11y sul
dev server (utente effimero via signup, dati vuoti) conferma la struttura renderizzata:
sidebar con Panoramica/Crea QR + «presto», topbar hamburger+breadcrumb, sei breakdown nella
griglia unica. Lo **screenshot pixel non è stato possibile** (pannello Browser non
visualizzato lato Nick) → resta il suo occhio: `npm run dev` in `apps/web`, `/dashboard`.

## Attriti

- **Prova pixel bloccata dall'ambiente** → il pannello Browser non è visualizzato, lo
  screenshot va in timeout. *Causa*: limite del tool, non del codice. *Risoluzione*:
  fallback build verde + albero a11y su valori identificativi. *Prevenibile?* No — è
  d'ambiente, ora è il gradino ufficiale (PATTERN «prova pixel bloccata», L-017).
- **Fuori scope colto**: warning Base UI su `<Button render={<Link>}>` («Crea QR»,
  `page.tsx:169`, `nativeButton`) — **preesistente**, non introdotto qui, da sistemare a parte.

## Stato e piano

`[~]` — il codice è scritto e build-verificato, manca la sola conferma visiva.
Residuo per `[x]`: (1) ok visivo di Nick (`npm run dev` in `apps/web`, `/dashboard`);
(2) drawer mobile provato a mano su viewport piccola. Nessuna analisi da ri-derivare.
