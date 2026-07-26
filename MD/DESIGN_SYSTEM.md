# Shaer.it — UI/UX Design System

Versione: 1.0 · Stato: In vigore · 2026-07-26
Padre: [MDD](MDD.md) · Requisiti: [PRD](PRD.md)

Fonte di verità dei token: `apps/qr/app/globals.css` (`:root` + `@theme inline`).
**Regola 8:** i colori vivono nei CSS variables e nella config Tailwind — **mai**
hex di brand inline nelle pagine. Nei CSS module si usa `var(--token)` /
`color-mix`, mai un hex duplicato (il revisore lo respinge).

---

## 1 · Personalità

Estetica **luxury editoriale** su base Stripe/Vercel/Linear: pulizia e densità
informativa dei SaaS moderni, calore e materia del lusso. Crema e oro, non bianco
freddo. La **linea `flow`** arancio è l'unico accento "vivo": segna il percorso
produttivo (il ramo che converte, il flusso di valore).

## 2 · Colore (token reali)

### Brand
| Token | Valore | Uso |
|-------|--------|-----|
| `--gold` | `#c9a87c` | accento primario, bordi vivi, linee albero |
| `--gold-light` | `#f5ecd8` | superfici accento, badge |
| `--gold-dark` | `#8a6a3a` | testo su accento, hover |
| `--gold-soft` | `color-mix(gold 28%)` | glow, riempimenti tenui |
| `--rose` | `#c4687a` | secondario caldo, evidenze |
| `--rose-soft` | `color-mix(rose 18%)` | sfondi tenui |
| `--cream` | `#faf7f4` | background pagina |
| `--warm` | `#f5ede8` | superfici muted |
| `--ink` | `#1c1410` | testo forte / primary |
| `--flow` | `#e8821e` | **linea produttiva tracciata** (accento unico) |
| `--border-strong` | `color-mix(gold 40%)` | bordi enfatizzati |

### Semantici (shadcn)
`--background #faf7f4` · `--foreground #2a2218` · `--card #ffffff` ·
`--primary #1c1410` / `--primary-foreground #faf7f4` · `--secondary/--muted #f5ede8`
· `--muted-foreground #7a6a5a` · `--accent #f5ecd8` / `--accent-foreground #8a6a3a`
· `--destructive #b03030` · `--border rgba(201,168,124,.22)` · `--input …,.4`.

### Chart
`--chart-1…5` mappati in `@theme`; per le dataviz seguire la skill **dataviz**
(palette categoriale accessibile, coerente light/dark). L'oro e il rose sono i
primi due accenti; il `flow` è riservato al ramo/serie "che converte".

## 3 · Tipografia

| Ruolo | Font | Token |
|-------|------|-------|
| Display / heading | **Cormorant** (serif) | `--font-display` = `--font-heading` |
| Testo / UI | **Jost** (sans) | `--font-sans` |
| Mono / codici | Geist Mono | `--font-mono` |

Caricate via `next/font` in `layout.tsx` (**0 dipendenze**, no CDN). Gli
`short_code` e i dati tecnici in mono. Titoli in Cormorant per il tono editoriale;
tabelle e KPI in Jost per leggibilità.

## 4 · Forma & spazio

- **Raggi**: scala su `--radius` (`sm .6× → 4xl 2.6×`). Card e pannelli morbidi.
- **Bordi**: sottili, oro tenue (`--border`); `--border-strong` per enfasi.
- **Superfici**: card bianche su crema; ombre leggere, mai dure. Densità alta ma
  arieggiata (spaziatura generosa fra sezioni, compatta dentro le tabelle).

## 5 · Componenti

### Esistenti (riusare, non re-inventare)
- **Button** (`components/ui/button.tsx`) = `@base-ui`: comporre link con
  `render={<Link/>}`, **non** `asChild`.
- **Popover** (`components/ui/popover.tsx`).
- **Albero rete** (`app/_components/network-tree.tsx` + panel): SVG, linea `flow`,
  pulse, focus, hover-popover, zoom/pan, aggiungi-nodo. Motore puro `lib/rete.ts`
  (rollup, litEdges, layout DFS) — **generico su albero pesato `{id,parentId,scans}`**:
  regge l'albero di QR reale senza modifiche.
- **Simulatore + chart** landing (`simulator*.tsx`).

### Da costruire (dashboard, PRD E6) — pattern
- **KPI tile**: valore grande (Cormorant), label muted (Jost), delta con freccia
  colore semantico; il tile "top ramo/crescita" usa `flow`. Seguire skill dataviz
  per meter/sparkline.
- **Grafici** (Recharts, `dynamic`): timeline (area), breakdown (donut/bar),
  heatmap giorno×ora, geo (bar→mappa). Colori dai token `--chart-*`.
- **Tabella rami**: ordinabile, quota % come barra inline, ultima scansione.
- **Export**: bottone report CSV/PDF.

## 6 · Layout & navigazione

- **Landing** (`/`): hero editoriale + simulatore + albero + CTA. Live su `qr.shaer.it`.
- **Dashboard** (`/dashboard`): sidebar (QR, Analytics, Scanner, Impostazioni —
  cfr QR_PLATFORM §5) + area contenuto a griglia di widget. Server Components +
  Suspense per widget lenti.
- **Dettaglio QR** (`/dashboard/qr/[short_code]`): canvas QR, pannello analytics,
  editor destinazione, albero del sottoramo.

## 7 · Interazione & UX

- **Mobile-first**: i QR si scansionano da telefono; le landing ospitate sono
  primariamente mobile. Griglie responsive, target touch ≥44px.
- **Feedback immediato**: azioni ottimistiche dove sicuro; stati di caricamento
  con skeleton, non spinner nudi.
- **La linea `flow`** guida l'occhio: nel-l'albero e nei grafici indica sempre
  "dove sta il valore" (ramo/serie che converte).
- **Accessibilità**: contrasto AA sui token (verificare crema/oro sul testo),
  focus visibile (`--ring`), dark mode via `prefers-color-scheme` + `[data-theme]`.

## 8 · Regole d'oro del visivo

1. Mai colore/font inline: solo token (regola 8). CSS module → `var()`/`color-mix`.
2. `flow` è l'accento del valore: non usarlo come colore decorativo generico.
3. Cormorant per l'editoriale, Jost per i dati: non invertirli.
4. Componenti pesanti in `dynamic`; foglie interattive `'use client'` (regola 9).
5. Per ogni grafico: prima la skill **dataviz**, poi il codice.
