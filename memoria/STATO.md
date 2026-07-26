# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `0781ed7`

## Dove siamo

Il 26/07 chiuso **T-011**: la landing è **luxury e live su `qr.shaer.it`** (verde),
font Cormorant+Jost, palette crema/oro/rosa, **albero interattivo con linea
tracciata**. Scan reale verificato da Nick (l'apertura si registra). L'albero è
stato **rifocalizzato** da rete-referral a **gerarchia di campagne** (Progetto →
campagne → sotto-campagne): è il primo slice del nuovo **T-012** (analizzatore
ramificato + dashboard di analisi pubblicitaria). Aperti: **T-008** (`↻2`, bloccato
su config Supabase di Nick) e **T-012** (analisi pronta, reale in attesa di
decisioni). Prossimo: le decisioni D-A/B/C di T-012, poi lo schema `campaigns`.

## Cosa esiste

- **Landing luxury (T-011)** `qr.shaer.it`: `layout.tsx` font Cormorant+Jost
  (`next/font`, 0 dep), `globals.css` palette crema/oro/rosa + `--flow`/`--gold-soft`/
  `--rose-soft`/`--border-strong` (color-mix sui token). Restyle header/hero/
  simulatore/chart/popover. **Albero**: `lib/rete.ts` motore puro (rollup,
  litEdges spina dorsale, layout DFS, raggio/colore) + `rete.test.ts` **11/11**;
  `network-tree.tsx` (client, SVG, linea `flow`, pulse, focus, hover-popover,
  zoom/pan, aggiungi-nodo) via `network-tree-panel.tsx` (`dynamic ssr:false`).
  Commit `0781ed7`. Fix build: type-error Recharts `formatter` (annotazione
  `(v:number)` vs `ValueType`) → risolto.
- **T-012 (analisi)**: `dossier/T-012-campaign-analytics.md` — piano completo
  (dati per scansione, dimensioni marketing, funzionalità dashboard, schema reale
  `campaigns`+`campaign_id`, decisioni D-A/B/C). Slice fatto: refocus albero →
  campagne (demo simulata, `[~]` da committare in questa chiusura).
- **Scansione (T-002/003)**: `qr_scans` append-only cattura **created_at, device,
  browser, ip anonimizzato**; `country`/`city` esistono ma il redirect li passa
  **null** (nessun geo). RPC `resolve_qr` (definer) + `anonymize_ip` (`/24`-`/48`).
- **Analytics (T-006)**: RPC `qr_scans_timeline` (day/hour, owner-scoped definer).
- DB Supabase `alrguvxspssjwfmtuhdw`. Dev: Email ON + Confirm email OFF.
- `.claude/launch.json` — dev via `preview_start name=qr` (:3000, autoPort no).

## Cosa NON esiste ancora

- **T-012 reale**: schema `campaigns` (owner_id, parent_id, RLS) + `qr_codes.
  campaign_id`; arricchimento scan (geo via header Vercel, os, lang, visitor_hash);
  RPC di aggregazione owner-scoped; dashboard reale (KPI, heatmap, geo, tabella,
  export, consigli). **Bloccato sulle decisioni D-A/B/C di Nick** (profondità dati/
  privacy, demo-vs-reale, forma gerarchia).
- **T-008**: Confirm email ON + `qr.shaer.it/auth/callback` nei Redirect URLs
  Supabase (azione di Nick). Profilo/@handle: futuro non aperto.

## Note operative

- **Recharts**: non annotare i parametri dei callback (`formatter`, `labelFormatter`)
  col tipo stretto — lascia inferire `ValueType`, o `next build` fallisce il type-check.
- **Due sessioni Claude sulla stessa cartella**: Next 16 rifiuta un secondo
  `next dev` (lock), e un commit dell'altra può muovere HEAD sotto di te (è
  successo: `da54567`). Verifica visiva delegata a Nick quando il preview è occupato.
- **Colori**: solo token in `globals.css` (regola 8). Nei CSS module usa
  `var(--token)`/`color-mix`, mai hex di brand duplicati (il revisore li respinge).
- **Button shadcn** = `@base-ui`: prop `render={<Link/>}`, non `asChild`.
- Anon key pubblica → confine = **DB** (RLS/definer), testato da `grants.test.ts` (L-001).
- Next 16: `proxy.ts`, non `middleware.ts` (hook §7). `dynamic(ssr:false)` solo in Client.
- Schema: nasce in `supabase/migrations/`, applicato da Nick nel SQL editor.
- La cwd della tool Bash non persiste: path assoluti. Test: `node --test lib/*.test.ts` (node 24 strippa TS).
