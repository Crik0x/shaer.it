---
task: T-014
tier: C
titolo: Dashboard analisi — arricchimento applicato, geo/uniques, report
aree: [analytics, dashboard, dati-personali, geo, marketing, schema-supabase]
stato: aperto
riporti: 0
sessioni: [2026-07-26c]
---

# T-014 · Il resto della dashboard analitica

Scorporato da **T-012** (chiuso col nucleo: albero rollup + dashboard scan-side).
Qui il valore che dipende dall'**arricchimento** (geo/os/lang/hash) e dai report.

## Groundwork già in casa (fatto in T-012, 2026-07-26c) — riferimenti puntuali
- **Migrazione `supabase/migrations/20260726000002_resolve_qr_enrichment.sql` `[~]`**
  — NON applicata. `drop function ... resolve_qr(text×6)` poi `create ... resolve_qr`
  a 10 arg (aggiunge `p_os/p_lang/p_referer/p_visitor_hash`, insert nelle nuove
  colonne). Grant anon+authenticated sulla nuova firma; whitelist per NOME invariata.
- **Route** `apps/qr/app/r/[short_code]/route.ts`: legge `x-vercel-ip-country`/`-city`
  (decode), `accept-language`→`primaryLang`, `referer`; `os` da `parseUserAgent`;
  `visitor` da `visitorHash(ip, ua, dayStampUtc(), VISITOR_SALT)`. **Fallback regola 7**
  nel blocco `sb.rpc("resolve_qr", …)`: se `error` matcha `/find the function|does not
  exist|schema cache/` ripiega a `sb.rpc("resolve_qr", base)` (6 arg) → redirect mai rotto.
- **Funzioni pure testate** `apps/qr/lib/scan.ts` (`lib/scan.test.ts` 10/10):
  `parseUserAgent` (+campo `os`), `primaryLang`, `visitorHash`, `dayStampUtc`.
- **visitor_hash sicuro** (`route.ts`): `const VISITOR_SALT = process.env.VISITOR_SALT
  ?? null` e `visitor = VISITOR_SALT ? visitorHash(...) : null`. Senza env → null (mai
  salt pubblico). **Serve impostare `VISITOR_SALT` su Vercel** per abilitare gli unici.

## Composizione
- **Stabilisce**: il contratto RPC `qr_breakdown(dim, from, to)` e `qr_uniques(from, to)`
  (definer authenticated owner-scoped) che i widget geo/os/lang/unici consumeranno.
- **Consuma**: le colonne arricchite di `qr_scans` (da 0001, applicata) popolate dalla
  route + 0002 (da applicare). Il motore `lib/dashboard.ts` e `lib/rete.ts` (già in casa).
- **Conflitti**: nessuno con T-008 (auth/config, ortogonale). Additivo su `dashboard/
  page.tsx` (T-012) — nessuna riscrittura, solo nuove sezioni.

## Piano (chi stabilisce prima di chi consuma)
1. **Nick applica `20260726000002`** nel SQL editor. Da lì il redirect scrive geo/os/
   lang/visitor_hash (in prod: gli header Vercel sono reali; in locale restano null).
2. **Impostare `VISITOR_SALT`** su Vercel (env di produzione) → abilita gli unici.
3. **Migrazione `qr_breakdown` + `qr_uniques`** (RPC definer authenticated, owner-
   scoped) — rimossa in T-012 perché inerte: si scrive ORA, **insieme** al widget che
   la consuma e a `apps/qr/lib/analytics-rpc.test.ts` (pattern `tree.test.ts`, skip
   graceful se la funzione non c'è). Whitelist anon INVARIATA (L-001, `grants.test.ts`).
   `qr_breakdown(dim, from, to)` copre device/browser/os/lang/country/city; SQL
   dinamico con `format %I` + whitelist dimensioni (no injection).
4. **Widget dashboard** (additivi su `app/dashboard/page.tsx`, Server Components):
   - **Geo**: barre paese/città (poi mappa MapLibre, `dynamic`).
   - **OS / lingua**: breakdown (come device/browser, ma dalle colonne arricchite).
   - **Unici stimati**: KPI da `qr_uniques`.
   - **Heatmap** giorno×ora (E6.6) — da `qr_scans` owner-scoped.
   - **Export report** CSV/PDF (E6.9) — il deliverable «oro» per le agenzie.
   - **Consigli automatici** (E6.10) — regola deterministica su soglie, testata pura.
5. **Funnel** (E6.8) — richiede Event Tracking (Fase 2, landing ospitate): NON qui.

## Decisioni già prese (non riaprire)
D-006 ibrido, D-007 PII+CRM col cancello GDPR, D-008 albero di QR (`DECISIONI.md`).
Il default resta **aggregati pseudonimi**; la PII nominale è Fase 4 (cancello consenso).

## Precedenti da riusare (40 righe, non una sessione)
- `dossier/archivio/T-012-campaign-analytics.md` — analisi completa, dimensioni di
  marketing, forma della dashboard, e il groundwork sopra.
- `archivio/T-006-analytics-timeline.md` — pattern RPC definer owner-scoped.
- `archivio/T-007-hardening-grant-anon.md` — introspezione whitelist anon, no segreti nel seed.

## Attriti
Nessuno ancora: task appena aperto (scorporo pulito da T-012).
