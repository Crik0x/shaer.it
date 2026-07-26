# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `287b1cd`

## Dove siamo

3ª sessione del 26/07: **T-012 chiuso** col nucleo provato. Nick ha **applicato la
migrazione albero (0001)**; `tree.test.ts` **4/4 verde sul DB reale** (anti-ciclo
seq+concorrente, rollup, isolamento owner). Costruito e **verificato end-to-end** il
**dashboard reale** (`app/dashboard/page.tsx`, Server Component, RLS + RPC
`qr_tree_rollup`): KPI, timeline 30g, breakdown device/browser, tabella rami dal
rollup — provato creando un QR e 7 scansioni (dashboard popolato). Suite **41/41
verde**. Piantato il **groundwork arricchimento** (route +geo/os/lang/hash con
fallback regola 7, `lib/scan.ts` +funzioni pure testate, migrazione **0002 `[~]`**
non applicata). Revisore respinto (RPC inerte senza test → 3ª occorrenza trappola;
salt pubblico) → 0003 rimossa e rimandata a **T-014**, salt→null → **approvato**.
Aperti: **T-014** (resto dashboard) e **T-008** (`↻3`, deciso: progetto prod separato).

## Cosa esiste

- **Albero di QR (T-012, applicato+provato)**: `qr_codes` +parent_id/purpose/granted_by,
  trigger anti-ciclo (advisory lock), RPC `qr_tree_rollup` (definer authenticated,
  CTE con guardia CYCLE). `qr_scans` +os/lang/referer/visitor_hash (colonne pronte).
- **Dashboard reale (T-012)**: KPI, timeline, breakdown device/browser, rami (rollup).
  `lib/dashboard.ts` (groupCount/topBranch/dailyBuckets/pct, 5/5). Server-only, token.
- **Enrichment plumbing (T-012→T-014, `[~]`)**: `route.ts` popola geo(header Vercel)/
  os/lang/referer/visitor_hash con **fallback** ai 6 arg se 0002 non applicata (redirect
  mai rotto). `lib/scan.ts`: parseUserAgent(+os), primaryLang, visitorHash, dayStampUtc
  (10/10). Migrazione `20260726000002_resolve_qr_enrichment` scritta, **non applicata**.
- **Landing luxury (T-011)** `qr.shaer.it` + albero interattivo (`lib/rete.ts` 11/11).
- **Corpus `MD/` (T-013)**: MDD, PRD, SAD, Design System, Roadmap. Decisioni D-006/007/008.
- DB Supabase `alrguvxspssjwfmtuhdw`. Dev: Email ON + Confirm email OFF (i test lo esigono).
- `.claude/launch.json` — dev via `preview_start name=qr` (:3000). Pre-commit ha §10 (avviso funzione-senza-test).

## Cosa NON esiste ancora

- **T-014**: applicare 0002 + `VISITOR_SALT` su Vercel; RPC `qr_breakdown`/`qr_uniques`
  (definer authenticated, **con** test — rimosse in T-012 perché inerti); widget geo/os/
  lang/unici; heatmap; export CSV/PDF; consigli. Funnel = Fase 2 (landing ospitate).
- **T-008 (`↻3`, deciso)**: progetto Supabase **prod separato** con Confirm email ON
  (questo resta dev). Confirm email ON qui romperebbe i test (sessione immediata).
- Generatore multi-tipo/branding, marketing pixel, API, enterprise (Roadmap M2–M5).

## Note operative

- **Migrazioni**: applicate da Nick nel SQL editor. 0001 applicata; **0002 da applicare**.
- **Regola 7 in pratica**: consumare una funzione DB non ancora applicata → fallback alla
  vecchia firma nel route (il redirect non si rompe mai). Vedi `route.ts` blocco resolve_qr.
- **visitor_hash**: salt SOLO da `process.env.VISITOR_SALT`; senza env → null (mai salt pubblico).
- **RPC definer**: `set search_path=''`, tabelle `public.`-qualificate, filtro `auth.uid()` esplicito.
- **Recharts**: dashboard è server-only (niente Recharts qui) per evitare L-004; grafici futuri `dynamic`.
- **Colori**: solo token; classi arbitrarie `bg-[var(--flow)]`/`var(--gold)`, mai hex brand (regola 8).
- Anon key pubblica → confine = **DB**; whitelist anon `{resolve_qr, anonymize_ip}` testata (L-001).
- La cwd della tool Bash non persiste: path assoluti. Test: `node --test [--env-file=.env.local] lib/*.test.ts`.
