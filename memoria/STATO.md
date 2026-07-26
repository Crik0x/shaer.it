# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `915d1c1`

## Dove siamo

Il 26/07 (2ª sessione) chiuso **T-013**: i **5 documenti fondativi** in `MD/`
(MDD, PRD, SAD, Design System, Roadmap), ancorati alla realtà e alle **3 decisioni
locked** di Nick — **D-006** post-scan ibrido (redirect default + landing ospitate),
**D-007** PII+CRM col cancello GDPR, **D-008** gerarchia = **albero di QR** (non
`campaigns`). Le decisioni **sbloccano T-012**: scritti (non applicati, `[~]`) la
migrazione albero `20260726000001` (parent_id+purpose+granted_by, trigger anti-ciclo
con advisory lock, RPC `qr_tree_rollup` con guardia CYCLE) e il test `tree.test.ts`.
Revisore: respinto → 3 fix → **approvato**. Aperti: **T-008** (`↻2`, config Supabase
di Nick) e **T-012** (`↻1`, migrazione pronta da applicare). Prossimo: Nick applica
la migrazione + lancia `tree.test.ts`, poi arricchimento redirect → RPC → dashboard reale.

## Cosa esiste

- **Corpus `MD/` (T-013)**: `MDD.md` (visione+motori+3 decisioni), `PRD.md` (9 epiche
  MoSCoW, criteri testabili), `SAD.md` (schema reale+estensione albero, RPC, GDPR),
  `DESIGN_SYSTEM.md` (token luxury reali), `ROADMAP.md` (M0–M5). Decisioni in
  `DECISIONI.md` D-006/007/008.
- **Migrazione albero (T-012, `[~]`)**: `supabase/migrations/20260726000001_qr_tree_and_scan_enrichment.sql`
  — `qr_codes` +parent_id/+purpose(check)/+granted_by, trigger anti-ciclo
  (`pg_advisory_xact_lock`), `qr_scans` +os/lang/referer/visitor_hash, RPC
  `qr_tree_rollup` (definer authenticated, CTE ricorsiva + `cycle … set is_cycle`).
  **Non applicata su DB.** Test `apps/qr/lib/tree.test.ts` (`[~]`, 4 casi, saltano
  puliti senza env). Review in `memoria/review/2026-07-26.json` (approvato).
- **Landing luxury (T-011)** `qr.shaer.it`: font Cormorant+Jost, palette crema/oro/
  rosa/`flow`, albero interattivo (`lib/rete.ts` motore puro 11/11 + `network-tree.tsx`).
- **Scansione (T-002/003)**: `qr_scans` append-only (created_at, device, browser, ip
  anon); `country`/`city` esistono ma il redirect li passa **null**. RPC `resolve_qr`
  (definer) + `anonymize_ip`. Analytics: `qr_scans_timeline` (T-006).
- DB Supabase `alrguvxspssjwfmtuhdw`. Dev: Email ON + Confirm email OFF.
- `.claude/launch.json` — dev via `preview_start name=qr` (:3000).

## Cosa NON esiste ancora

- **T-012 reale (dopo l'apply)**: update redirect per popolare geo (header Vercel)/os/
  lang/visitor_hash; RPC `qr_breakdown`/`qr_geo`/`qr_uniques` (definer authenticated,
  whitelist anon INVARIATA — L-001); dashboard reale (KPI, albero reale, serie,
  heatmap, geo, tabella rami, export). Session/Event/CRM = Fase 2+ (landing ospitate).
- **T-008**: Confirm email ON + `qr.shaer.it/auth/callback` nei Redirect URLs (azione Nick).
- Generatore multi-tipo/branding, funnel, marketing pixel, API, enterprise (Roadmap M2–M5).

## Note operative

- **Recharts**: non annotare i callback col tipo stretto (`ValueType`) o `next build` fallisce (L-004).
- **Migrazioni**: nascono in `supabase/migrations/`, applicate da Nick nel SQL editor. Non le applico io.
- **Nuova funzione/trigger senza test** = 2ª occorrenza (T-011/012) → `PATTERN.md` candidato hook.
- **RPC definer**: `set search_path=''`, tabelle `public.`-qualificate, filtro esplicito `auth.uid()` (bypassa RLS).
- **Colori**: solo token in `globals.css` (regola 8); nei CSS module `var(--token)`/`color-mix`, mai hex brand.
- **Button shadcn** = `@base-ui`: `render={<Link/>}`, non `asChild`. Next 16: `proxy.ts`, non `middleware.ts`.
- Anon key pubblica → confine = **DB** (RLS/definer), testato da `grants.test.ts` (L-001).
- La cwd della tool Bash non persiste: path assoluti. Test: `node --test lib/*.test.ts`.
