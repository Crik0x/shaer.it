---
task: T-011
tier: C
titolo: Landing + dashboard-simulatore — reskin estetica luxury Arkés
aree: [landing, design-system, albero-rete, recharts, deploy]
stato: chiuso
riporti: 0
sessioni: [2026-07-25, 2026-07-26]
---

# T-011 · Landing + dashboard-simulatore

> **Chiuso 2026-07-26.** Landing luxury (font Cormorant+Jost, palette crema/oro/
> rosa) + albero rete interattivo con linea tracciata, live e verde su
> `qr.shaer.it`. Prova: commit `0781ed7`, deploy Vercel verde, `lib/rete.test.ts`
> 11/11. L'evoluzione della landing verso l'**analisi campagne / dashboard reale**
> prosegue in **[[T-012-campaign-analytics]]** (l'albero è stato rifocalizzato da
> rete-referral a gerarchia di campagne nella stessa sessione). Il profilo/@handle
> resta come lavoro futuro non ancora aperto.

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

## Stato esecuzione — 2026-07-26 (slice 2)
Direzione confermata da Nick: albero rete **opzione A** = visivo + interazioni con
**metriche QR** (scansioni/rete/profondità), **niente motore MLM** (payout/ritenuta/
livelli/bonus/matrix restano dominio Arkés, esclusi di proposito).

**Fatto e provato:**
- **Build sbloccato** `[x]` — il deploy Vercel era rosso per type-error
  `simulator-chart.tsx:39`: annotazione `(v:number)` in conflitto con `ValueType`
  di Recharts. Corretto (`formatter={(value) => [value as number, "Totale"]}`).
  Prova: `npx tsc --noEmit` exit 0.
- **Estetica luxury** `[~]` (visivo, lo prova Nick) — `layout.tsx`: Cormorant+Jost
  via `next/font/google` (0 dep nuove). `globals.css`: palette crema/oro/rosa +
  `--flow:#e8821e`, via i token pastello (grep `brand-(blue|orange)` vuoto).
  Restyle: header (Link+ink/oro), hero (serif+corsivo oro), simulatore (oro/rosa),
  chart (oro), popover (vetro+rimbalzo).
- **Albero rete** `[x]` logica / `[~]` visivo — motore puro
  `lib/rete.ts` (children, subtreeScans rollup, subtreeSize, maxDepth, inFocus,
  litEdges spina dorsale, layout DFS, nodeRadius/Color, nodeStats) portato fedele
  da arkes `rt*`. Test `lib/rete.test.ts` **8/8 verde**. Componente
  `network-tree.tsx` (client, SVG JSX, linea tracciata `flow`, pulse, focus,
  hover-popover, zoom+pan pointer, aggiungi-nodo) + `network-tree.module.css`
  (stile `rt-*` con token globali, animazioni dietro `prefers-reduced-motion`).
  Entra in `page.tsx` via `network-tree-panel.tsx` (`dynamic ssr:false`, regola 9).
  Seed rete dimostrativa 11 nodi.
- Lint pulito (0), tsc 0.

**NON verificato (onestà §6):** il rendering visivo e le animazioni. Il server
dev dell'altra chat tiene il lock `next dev` sulla stessa cartella (PID 41576):
non ho potuto aprire un mio preview. HMR di quel server ha comunque già i file →
`localhost:3000` mostra il nuovo look. Prova visiva = Nick (browser o deploy).

**Resta (slice 3+):** verifica visiva di Nick; poi dashboard aggregata reale,
profilo/@handle, campagne (serve decisione schema). Eventuale: pannello analisi
laterale del nodo selezionato (oggi solo hover-popover), gap-filling.

## Attriti
`attrito → causa vera → come risolto → prevenibile?`
- **Deploy Vercel rosso** → type-error Recharts: `formatter={(v:number)=>…}` annotava
  il parametro col tipo stretto, in conflitto con `Formatter<ValueType>` che infera
  `ValueType`; residuo del primo build mai type-checkato in locale → tolta
  l'annotazione (`(value) => [value as number, …]`), `tsc --noEmit` 0 → **sì, hook**:
  nessun controllo locale girava `tsc` prima del commit, solo la build remota lo
  scopriva. Convertito in `pre-commit §9` (vedi LEZIONI L-004).
- **Revisore respinto al primo giro** → 3 funzioni pure nuove (`nodeRadius`,
  `nodeColor`, `initials`) senza test (regola 5); il gate ha retto → aggiunti i test
  (8/8→11/11) e ri-approvato → **no meccanizzabile**: è il revisore stesso il
  controllo; la lezione è invocarlo *prima* di dichiarare pronto, non dopo.
- **Commit concorrente** → due sessioni Claude sulla **stessa working tree**:
  l'altra ha committato `da54567 "QRcode"` (il primo build col type-error dentro)
  mentre questa lavorava, muovendo HEAD sotto l'ancora `fb0ae6e` → il mio lavoro era
  un delta pulito e disgiunto, committato sopra senza conflitto → **prevenibile solo
  organizzativamente** (una working tree, una sessione che scrive git per volta).
- **Verifica visiva impossibile headless** → il Browser pane non compositava (rAF
  fermo) **e** Next 16 rifiuta un secondo `next dev` nella stessa cartella (lock,
  PID dell'altra sessione) → prova visiva delegata a Nick su `qr.shaer.it` → **no**,
  limite d'ambiente, non un bug.
- `next/font` con Cormorant/Jost: nessuna dep npm nuova (asset self-hosted) — non un
  attrito, una conferma utile alla prossima volta.
