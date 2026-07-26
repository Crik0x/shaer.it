# Shaer.it — Software Architecture Document (SAD)

Versione: 1.0 · Stato: In vigore · 2026-07-26
Padre: [MDD](MDD.md) · Cosa: [PRD](PRD.md) · Quando: [ROADMAP](ROADMAP.md)

Riferimento tecnico di dettaglio: [SAAS_BUILD_PLAN_V1](SAAS_BUILD_PLAN_V1.md).
Questo documento fissa **schema, RPC, sicurezza, infra** allineati alla realtà
verificata (regola 1), non alle intenzioni.

---

## 1 · Stack (non cambiare senza chiedere — CLAUDE.md)

- **Next.js 16 App Router** (TypeScript) in `apps/qr/`, deploy **Vercel**.
  Server Components di default; `proxy.ts` (non `middleware.ts`, Next 16).
- **Supabase** `alrguvxspssjwfmtuhdw`: PostgreSQL + Auth + Storage + RLS.
- **Tailwind + shadcn/ui** (Button = `@base-ui`, `render={<Link/>}`), token in
  `globals.css` + `@theme` (Design System).
- Generazione `qrcode` · scanner **ZXing** · grafici **Recharts** (⚠ non annotare
  i callback col tipo stretto — L-004) · mappe MapLibre/Leaflet (Fase 3).
- Test: `node --test lib/*.test.ts` (node 24 strippa TS). Nessuna libreria nuova
  senza conferma (regola 10).

## 2 · Struttura del codice (reale, `apps/qr/`)

```
app/
  (auth)/login/           login-form (client) + page (server)
  auth/callback|signout/  route handlers OAuth
  dashboard/              layout + page; qr/new, qr/[short_code]/…
  r/[short_code]/route.ts redirect pubblico → resolve_qr
  _components/            landing: site-header, simulator, network-tree(+panel)
  page.tsx  layout.tsx  globals.css
components/ui/            button, popover (shadcn)
lib/                      qr, scan, short-code, rete, qr-timeline, supabase-* , *.test.ts
supabase/migrations/      DDL versionato, applicato da Nick nel SQL editor
```

Regole di posizionamento: `'use client'` solo sulle foglie interattive;
`dynamic(ssr:false)` **solo** dentro Client Components; logica di dominio pura in
`lib/` con test affiancato.

## 3 · Modello dati

### 3.0 · Realtà oggi (verificata su `20260724000001_qr_platform_initial.sql`)
- `qr_codes(id, owner_id, name, target_url, short_code UNIQUE, created_at)` +
  trigger **short_code immutabile** (regola 7) + RLS own + index owner.
- `qr_scans(id, qr_id, owner_id, created_at, device, browser, country, city, ip)`
  **append-only**, RLS select-own, nessuna policy insert (scrive solo `resolve_qr`).
- Funzioni: `anonymize_ip` (pura), `resolve_qr` (definer), `qr_scans_timeline`
  (definer owner-scoped). Superficie anon whitelisted: `{resolve_qr, anonymize_ip}`
  (test `grants.test.ts`, L-001).

### 3.1 · Estensione albero di QR (D-3) — migrazione additiva
Ogni nodo È un QR. Non una tabella `campaigns` separata.

```sql
alter table public.qr_codes
  add column parent_id uuid null references public.qr_codes(id) on delete set null,
  add column purpose   text not null default 'root'
    check (purpose in ('root','campaign','referral','promo')),
  add column granted_by uuid null references auth.users(id); -- delega intermediario

create index qr_codes_parent_idx on public.qr_codes(parent_id);

-- anti-ciclo: un nodo non può essere antenato di sé stesso (trigger ricorsivo)
-- rollup e "monitora il sottoalbero" via CTE ricorsiva in RPC definer (§4.2)
```

*Delega (E3.4):* quando l'owner A delega un sottoalbero all'intermediario B, i
nodi figli hanno `owner_id = B` e `granted_by = A`. La **visibilità dell'antenato**
(A monitora il ramo di B) è servita da una **RPC definer** che risale la catena
`parent_id` partendo dai nodi di A — non da un allargamento della RLS (che
resterebbe strettamente own). *v1:* monitoraggio del **proprio** sottoalbero
diretto; cross-owner + crediti = fase Shaer (SHAER_MASTER, differita).

### 3.2 · Arricchimento scan (additivo, non rompe i QR vivi)
```sql
alter table public.qr_scans
  add column os           text,
  add column lang         text,
  add column referer      text,
  add column visitor_hash text;   -- pseudonimo salato (IP anon + UA + salt/giorno)
```
`country`/`city` già esistono: oggi il redirect li passa `null`; si popolano dagli
header Vercel (`x-vercel-ip-country|-city|-country-region`). `os`/`lang` dal
user-agent già parsato (`lib/scan.ts`) e da `accept-language`.

### 3.3 · Session / Event / Consenso (Fase 2, solo landing ospitate)
```sql
create table public.sessions (
  id uuid pk, qr_id uuid→qr_codes, owner_id uuid, visitor_hash text,
  started_at timestamptz, device text, os text, browser text, lang text,
  country text, city text);            -- RLS select-own

create table public.events (            -- append-only
  id uuid pk, session_id uuid→sessions, owner_id uuid,
  type text, meta jsonb, created_at timestamptz);  -- RLS select-own

create table public.consents (          -- D-2: base giuridica PII
  id uuid pk, visitor_hash text, owner_id uuid,
  scope text, granted_at timestamptz, revoked_at timestamptz null);
```

### 3.4 · CRM (Fase 4 — cancello D-2)
`contacts(owner_id, visitor_hash, email?, name?, first_seen, last_seen, value_cents)`
derivato da sessioni/eventi/ordini; PII **solo** con `consents` valido; erase =
cancella PII, conserva aggregati anonimi.

### 3.5 · Invarianti trasversali
- Ogni tabella: `owner_id` + RLS. Statistiche **derivate**, mai saldi (regola 9).
- `short_code` immutabile (trigger). Append-only su scans/events (no update/delete).
- IP mai pieno: `anonymize_ip` è il confine, nel DB (L-001).

## 4 · API interna (RPC) e route

### 4.1 · Route pubblica
`GET /r/[short_code]` → chiama `resolve_qr(short_code, device, browser, country,
city, ip, os?, lang?, referer?)`; 302 su `target_url`, 404 se null. Log best-effort.

### 4.2 · RPC (tutte `security definer`, `set search_path=''`, owner-scoped)
| RPC | scopo | pattern-precedente |
|-----|-------|--------------------|
| `resolve_qr` | risolve+logga (anon) | esiste |
| `anonymize_ip` | confine privacy (pura) | esiste |
| `qr_scans_timeline` | serie day/hour | esiste |
| `qr_tree_rollup(root)` | somma scan per ramo via **CTE ricorsiva** | nuovo (T-002/006) |
| `qr_breakdown(dim, from, to)` | conteggi per device/os/browser/lang | nuovo |
| `qr_geo(from, to)` | conteggi paese/città | nuovo |
| `qr_uniques(from, to)` | `count(distinct visitor_hash)` | nuovo |

Ogni nuova RPC **si aggiunge alla whitelist** `grants.test.ts` **solo se** anon
deve chiamarla; le RPC di dashboard sono `authenticated`-only (l'owner loggato).

### 4.3 · API pubblica REST (Fase 4)
`/api/v1/*` con chiave per-owner, rate-limit, gli stessi confini RLS/definer.

## 5 · Rendering & performance
- Server Components di default; dati letti server-side con `supabase-server`.
- Foglie interattive `'use client'`: editor QR, scanner, mappe, grafici → `dynamic`.
- Streaming con Suspense dove il dato è lento (dashboard multi-widget).
- Landing ospitate: HTML statico + beacon leggero; nessun blocco render sul tracking.

## 6 · Ambienti & infra
- **Dev**: `preview_start name=qr` (:3000). Supabase: Email ON, Confirm email OFF.
- **Prod**: Vercel `qr.shaer.it`; Supabase Confirm email **ON** + Redirect URL
  `https://qr.shaer.it/auth/callback` (**T-008**, azione di Nick).
- Migrazioni: nascono in `supabase/migrations/`, applicate da Nick nel SQL editor.
- Segreti in env Vercel/Supabase, **mai** in codice che raggiunge il browser
  (client Supabase creato negli handler/effetti — L-003, non nel corpo del module).

## 7 · Sicurezza & Privacy (vincolo D-2)

| Livello | Misura |
|---------|--------|
| Confine dati | anon key pubblica ⇒ il confine è il **DB**: RLS + definer, testato (L-001) |
| Tenant | `owner_id` + RLS su ogni tabella; RPC owner-scoped |
| PII (D-2) | consenso registrato **prima** della raccolta; DPA Vercel+Supabase; retention configurabile; **diritto all'oblio** (erase PII, conserva aggregati) |
| IP | mai pieno; `/24`-`/48` nel DB |
| Segreti | mai lato client; `.env*` mai letti/stampati (regola 6) |
| Rate/abuso | rate-limit su route pubblica e API; log best-effort non blocca il redirect |
| Audit | append-only su scans/events; azioni owner tracciabili |

**Degradazione sicura:** senza consenso valido, il sistema opera in modalità
**aggregati pseudonimi** (paese, OS, lingua, `visitor_hash`), che non è PII e non
richiede consenso extra — è il default finché il cancello D-2 non è passato.

## 8 · Test come prova (regola 5)
Gerarchia: test verde > valore misurato > browser. Coperti oggi: `scan`, `grants`,
`rete` (11/11), `qr-timeline`, `auth`, `short-code`, `qr-create`. Da coprire con lo
schema albero: `qr_tree_rollup` (rollup ricorsivo = somma sottoalbero), anti-ciclo
`parent_id`, whitelist anon invariata dopo le nuove RPC.
