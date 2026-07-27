# Registro

Libro mastro append-only. Gli id `T-NNN` sono immutabili. **Non si carica
all'avvio**: si apre solo per audit o per ritrovare una prova.

Invariante verificata dall'hook pre-commit: **ogni `T-NNN` senza esito deve
comparire in `TODO.md`**. Un task non può sparire da entrambi.

| id | data | task | esito | prova |
|---|---|---|---|---|
| T-001 | 2026-07-23 | Scaffold app Next.js 16 + Tailwind + shadcn in apps/web | fatto 2026-07-24 | `GET :3000/`→200 `<title>Create Next App</title>` · `archivio/T-001` |
| T-002 | 2026-07-23 | Progetto Supabase dedicato + migrazione qr_codes/qr_scans con RLS | fatto 2026-07-24 | migrazione live · anon `[]`/`resolve_qr('nope')=null`/insert scans 42501 · `archivio/T-002` |
| T-003 | 2026-07-23 | Redirect dinamico /r/[short_code] con log scansione append-only | fatto 2026-07-24 | `/r/demo123`→302, `/r/x`→404, scans count 3, IP anon lato DB, 6/6 test, revisore ok · `archivio/T-003` |
| T-004 | 2026-07-23 | Auth magic link + scheletro dashboard | fatto 2026-07-24 | test `lib/auth.test.ts` verde 1/1 (signup→sessione, RLS count=0, login ok) · login 200/dashboard 307→login/`/r` 302 · revisore ok · `archivio/T-004` |
| T-005 | 2026-07-23 | Generatore QR con download PNG/SVG | fatto 2026-07-24 | short-code 5/5 · qr-create RLS 1/1 · flusso UI end-to-end (canvas reso, `/r/vleDKAWd`→302, scan contata) · revisore ok · `archivio/T-005` |
| T-006 | 2026-07-25 | Analytics: timeline scansioni derivata (RPC owner-scoped), grafico Recharts | chiuso | integ 1/1 + puro 2/2 + tsc + visiva DOM (QR ukqz91uh, 3 scan, toggle) + revisore ok |
| T-007 | 2026-07-24 | Hardening: test grant anon (meccanizza L-001) | fatto 2026-07-25 | `grants.test.ts` integ **1/1 verde sul DB reale** (migr. 0002+0003 applicate) · superficie anon = `{resolve_qr, anonymize_ip}` · ha scoperto e corretto `qr_scans_timeline` anon-eseguibile (default-grant Supabase) · revisore approvato (respinto→ok dopo tolta password da seed) · `archivio/T-007` |
| T-008 | 2026-07-24 | Riattivare Confirm email su Supabase prima del lancio (debito di T-004) | | |
| T-009 | 2026-07-25 | Eseguire e provare la fixture dev supabase/seed.sql (scorporo T-007) | fatto 2026-07-25 | Nick ha eseguito il seed → **3 QR + 6 scansioni** confermati; idempotente, utente-dev fuori da git · `archivio/T-009` |
| T-010 | 2026-07-25 | Deploy in produzione su Vercel (qr.shaer.it) | fatto 2026-07-25 | `qr.shaer.it` serve login 200, `/env-check` confermò le 3 env in build (poi rimossa); fix L-003 (client browser negli handler); causa 500 = scope Development su URL/SITE_URL, corretto a Production · revisore saltato (hotfix, prova = app viva) · `archivio/T-010` |
| T-011 | 2026-07-25 | Landing luxury Arkés (Cormorant+Jost, palette crema/oro/rosa) + albero interattivo con linea tracciata | fatto 2026-07-26 | commit `0781ed7` · `qr.shaer.it` live e **verde** (contenuto identificativo «Le tue campagne», rollup Tu 592 = 40+255+274+23) · `lib/rete.test.ts` 11/11 · fix build type-error Recharts `formatter` · revisore approvato (respinto→ok dopo test su nodeRadius/nodeColor/initials + token) · `archivio/T-011` |
| T-013 | 2026-07-26 | Corpus documentale fondativo (MDD, PRD, SAD, Design System, Roadmap) | fatto 2026-07-26 | 5 doc in `MD/` ancorati alla realtà (schema `20260724000001`, token `globals.css`); 3 decisioni locked D-006/007/008 in `DECISIONI.md`; documentazione, no revisore · `archivio/T-013` |
| T-012 | 2026-07-26 | Analizzatore albero di QR + dashboard reale scan-side | fatto 2026-07-26 | migrazione albero (0001) applicata da Nick; `tree.test.ts` **4/4 sul DB reale** (anti-ciclo seq+concorrente, rollup, isolamento owner); dashboard verificato **end-to-end** (creato QR + 7 scansioni → timeline/breakdown device+browser/rami dal rollup popolati); suite **41/41**; revisore approvato (respinto→ok: RPC 0003 inerte rimossa, salt→null) · `archivio/T-012` |

- T-014 · 2026-07-27 · Dashboard arricchita (geo/os/lingua/unici/heatmap/CSV/consigli) · fatto · suite 52/52 verde, revisore approvato (review/2026-07-27.json), CSV-injection risolta con test; RPC in-JS non costruita (scelta di scala)
- T-015 · 2026-07-27 · Selettore periodo analitiche (7/30/60/120/360g + orario 7g, query param) · fatto · `hourlyBuckets` testata, 52/52 verde, tsc pulito; rendering [~] confermato da Nick loggato (screenshot)
- T-019 · 2026-07-27 · Analisi singolo QR (pagina `dashboard/qr/[short_code]` ricomposta in derivazione-in-JS scoped a `qr_id`, riuso di `lib/dashboard.ts` + rollup own/sottoalbero) · fatto · `dashboard.test` 16/16 + tsc pulito + route 307→/login; revisore approvato (`review/2026-07-27b.json`); **eyeball di Nick** conferma rendering e navigazione (2026-07-27b); rimossi analytics-panel/analytics-chart · `archivio/T-019`

T-022/A · 2026-07-27 · Fondazione profiles (blocco A di T-022) · fatto+provato · migrazione 20260727000001 applicata al DB dev; `profiles.test.ts` + `grants.test.ts` verdi (signup→profilo UTC, RLS isola, superficie anon intatta); revisore approvato → D-014
T-021 · 2026-07-27 · Nav landing consapevole del login · [~] scritto non provato · codice completo (site-header async, getUser→Dashboard+logout), tsc+revisore ok, logged-out eyeballed; ramo loggato in attesa eyeball di Nick
T-023 · 2026-07-27 · Selettore periodo senza scroll-to-top · [~] scritto non provato · scroll={false} sui Link periodo (2 pagine), prova documentale (Next link.md §scroll)+tsc+revisore; comportamento dietro auth in attesa eyeball di Nick
