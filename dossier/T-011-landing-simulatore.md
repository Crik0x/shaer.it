---
task: T-011
titolo: Landing + dashboard-simulatore — reskin estetica luxury Arkés
livello: C
stato: aperto
aperto: 2026-07-25
---

# T-011 · Landing + dashboard-simulatore

## Decisione di direzione (2026-07-26)
Il primo build (shadcn neutro + pastello arancio/blu) è stato **respinto da Nick**:
«poco professionale, freddo». Nuova direzione: adottare **solo l'estetica** dei
mockup Arkés (il **brand resta shaer.it**, nessun rebrand — Arkés è brand separato).

Fonti (fuori repo, sul Desktop di Nick):
- `D:\Desktop\Arkés\arkes_dashboard_v3.html` — **struttura** dashboard salone+rete
  (KPI barrina oro, pannelli, tree SVG statico, area-chart). Blueprint layout.
- `D:\Desktop\Arkés\MLM\arkes.html` — **«Simulatore Strategico»**: palette,
  animazioni, popover, e **l'albero rete interattivo con la linea tracciata**.
  → **è da qui che si importa** (indicazione esplicita di Nick).
- `D:\Desktop\Prophet\index (1).html` — lusso editoriale (Fraunces/Instrument
  Serif). Solo come riferimento di raffinatezza tipografica.

## Design system nuovo (ri-tema, non butta shadcn — regola 8)
Sostituire i valori dei token in `apps/qr/app/globals.css`, tenere il meccanismo.
**Palette da `arkes.html`:**
- `--gold:#C9A87C` `--gold-light:#F5ECD8` `--gold-dark:#8a6a3a`
- `--black:#1C1410` `--cream:#FAF7F4` `--warm:#F5EDE8` `--rose:#C4687A`
- accento **linea produttiva `#E8821E`** (arancio caldo, per la traced line)
- `--text:#2a2218` `--text-muted:#7a6a5a` · `--radius:14px`
- shadow `0 2px 16px rgba(28,20,16,.07)`
**Font:** display serif **Cormorant Garamond**, sans **Jost** (via `next/font`).
Rimuovere i token pastello `--brand-blue/--brand-orange` che avevo aggiunto.

## Pezzi da PORTARE da arkes.html (mappa righe → React)
- **Albero rete interattivo (`rt-*`)** — il cuore di ciò che Nick vuole:
  - nodi `.rt-node-circle` (l.444) transizione spring `cubic-bezier(.34,1.56,.64,1)`
  - **linea tracciata**: `.rt-edge`/`.rt-edge-lit` (l.458-463) — `stroke-dasharray:7 7`
    + `@keyframes rtflow{stroke-dashoffset:-28}` = flusso animato lungo il ramo,
    glow arancio `#E8821E`. **Questa è «la linea che traccia le persone sotto».**
  - pulse nodo `.rt-node.rt-pulse` + `@keyframes rtpulse` (l.464-465, glow)
  - slot bloccati `.rt-locked` dashed (l.451) · zoom `.rt-zoom` (l.433)
  - motore dati `RT` (l.1580+): `rtAdd/rtChildren/rtSubVol/rtMaxActiveDepth/
    rtInFocus/rtLegPayout` — modello matrix con rollup volume, profondità, payout
    per gamba. Da riscrivere come funzioni pure TS (logica di dominio, §5).
- **Popover** (l.504-523, JS 1748-1930): hover-popover statistiche + popover
  profilo, spring + backdrop, click-fuori-chiude. Il mio `components/ui/popover.tsx`
  (base-ui) resta ma va **ri-stilato** a questo look.
- **Animazioni**: `fadeIn` (l.695), `number-anim` (l.698), modale spring
  `cubic-bezier(.22,1,.36,1)` (l.563), segment toggle.
- **Sfondo canvas**: radial-gradient oro+rosa (l.437) per il pannello rete.

## Cosa si riusa del primo build (non buttato)
- Struttura `page.tsx` + `_components/` (header, hero, simulatore): **restyling**,
  non riscrittura.
- `components/ui/popover.tsx` (base-ui): resta, ri-stilato.
- Logica count-up (`useCountUp`) e stato simulatore: riusabili.
- **Superato**: token pastello arancio/blu; il simulatore KPI+area-chart va
  evoluto/affiancato dall'**albero rete** (il vero «wow» richiesto).

## Sequenza di esecuzione (prossimo build)
1. Font (`next/font`: Cormorant + Jost) + token crema/oro/rosa in `globals.css`
   (togliere pastello). **Irreversibile-ish**: tutto il resto ci si appoggia → prima.
2. Restyle header + hero + popover al nuovo look.
3. **Albero rete React** (`network-tree.tsx`): SVG nodi+edge, traced line `rtflow`,
   pulse, hover-popover. Logica in funzione pura `lib/rete-*.ts` + test.
4. Restyle/estendi simulatore KPI e area-chart alla palette.
Verifica: build pulita + browser (visivo, serve pane composito — L: rAF fermo se
il pane non è a schermo, provato in questa sessione).

## Attrito noto
- Verifica visiva: il Browser pane non compositava → rAF fermo → animazioni non
  osservabili headless. La prova visiva la dà Nick su `localhost:3000` o il deploy.
- `next/font` con Cormorant/Jost: confermato nessuna dep npm nuova (asset font).
