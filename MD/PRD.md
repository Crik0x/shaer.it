# Shaer.it — Product Requirements Document (PRD)

Versione: 1.0 · Stato: In vigore · 2026-07-26
Padre: [MDD](MDD.md) · Tecnica: [SAD](SAD.md) · Visivo: [Design System](DESIGN_SYSTEM.md)

Priorità **MoSCoW**: `M` must · `S` should · `C` could · `W` won't-now.
Ogni requisito ha un **criterio di accettazione** verificabile (regola 5: se è
calcolabile, è un test; `[~]` solo per il genuinamente visivo).

---

## Attori

- **Proprietario** (owner) — crea QR, possiede un sottoalbero, vede i propri dati.
- **Intermediario** (reseller) — riceve in delega un sottoalbero, lo distribuisce/
  rivende, monitora solo il proprio ramo. È un owner con un `parent` di un altro owner.
- **Visitatore** (scanner) — anonimo per default; pseudonimo (hash); nominale solo
  con consenso (D-2).
- **Admin di piattaforma** — supporto, non accede ai dati dei tenant salvo audit.

---

## E1 · Autenticazione & tenant `Fase 1`

| id | pri | requisito | accettazione |
|----|-----|-----------|--------------|
| E1.1 | M | Registrazione email/password con **Confirm email ON** in prod | `auth/callback` scambia il code; utente non confermato non entra (test T-004) |
| E1.2 | M | Login/logout, sessione server (cookie httpOnly via Supabase SSR) | `auth.test.ts` verde |
| E1.3 | M | Ogni riga dati è **owner-scoped** con RLS | `grants.test.ts`: anon non legge tabelle |
| E1.4 | S | Profilo owner (@handle, nome pubblico, avatar) | riga in `profiles`, RLS own |

> Debito aperto **T-008** (`↻2`): E1.1 richiede la config dashboard Supabase (azione di Nick).

## E2 · QR Generator `Fase 1`

| id | pri | requisito | accettazione |
|----|-----|-----------|--------------|
| E2.1 | M | Crea QR **dinamico**: `short_code` immutabile → `target_url` modificabile | trigger DB rifiuta update di short_code (test) |
| E2.2 | M | Tipi: **URL** (c'è), poi testo, email, tel, SMS, WhatsApp, WiFi, vCard, geo, evento | encoder puro per tipo, testato per stringa generata |
| E2.3 | S | Personalizzazione: colori, gradiente, logo centrale, cornice, livello errore L/M/Q/H | render deterministico; snapshot visivo `[~]` |
| E2.4 | S | Export PNG, SVG, PDF | file scaricato non vuoto, dimensioni attese |
| E2.5 | C | Crypto (BTC/ETH/SOL/TON) come **stringa QR** (nessuna transazione eseguita) | stringa URI conforme allo standard |

## E3 · Albero di QR (il cuore — D-3) `Fase 1`

| id | pri | requisito | accettazione |
|----|-----|-----------|--------------|
| E3.1 | M | Un QR può avere un **genitore** (`parent_id`); la radice ha parent null | inserimento figlio valido; ciclo rifiutato |
| E3.2 | M | **Rollup**: le scansioni di un ramo risalgono agli antenati | RPC ricorsiva = somma sottoalbero (test su albero pesato, cfr `rete.test.ts` 11/11) |
| E3.3 | M | `purpose` per nodo: `root\|campaign\|referral\|promo` | enum vincolato a schema |
| E3.4 | S | **Delega a intermediario**: un sottoalbero può avere `owner_id` diverso | figlio con owner B sotto owner A; A monitora, B gestisce |
| E3.5 | S | Visualizzazione albero interattiva (esiste su landing: `network-tree.tsx`) | linea `flow` sul ramo più pesato; zoom/pan |
| E3.6 | W | Molti-a-molti (un QR in più rami) | — evoluzione post-v1 |

## E4 · Redirect & Session `Fase 1→2`

| id | pri | requisito | accettazione |
|----|-----|-----------|--------------|
| E4.1 | M | Redirect risolve sempre, log best-effort (regola 7) | `resolve_qr` definer: log fallito ⇒ redirect comunque (esiste) |
| E4.2 | M | Cattura scan-side: timestamp, device, browser, **IP anonimizzato** `/24`-`/48` | `anonymize_ip` testata; `scan.test.ts` IPv6 |
| E4.3 | S | Arricchimento additivo: **geo** (header Vercel), **OS**, **lingua**, `visitor_hash` salato | colonne popolate ≠ null in prod; hash stabile intra-giorno |
| E4.4 | S | **Landing ospitata** opzionale (D-1 ibrido): apre pagina nostra + beacon | flag su QR; beacon apre una `session` |
| E4.5 | C | Session Engine: `sessions` + timeline su landing ospitata | 1 scan-open ⇒ 1 sessione con device profile |

## E5 · Event Tracking `Fase 2` (solo landing ospitate)

| id | pri | requisito | accettazione |
|----|-----|-----------|--------------|
| E5.1 | S | Log append-only eventi standard (PAGE_OPEN, SCROLL_25/50/75/100, CLICK, …) | evento inserito con session_id, tipo, ts |
| E5.2 | C | Journey ricostruito dagli eventi | sequenza ordinata per sessione |
| E5.3 | C | Consenso registrato **prima** di eventi con PII | nessun evento PII senza riga consenso (D-2) |

## E6 · Analytics & Dashboard `Fase 1→3`

| id | pri | requisito | accettazione |
|----|-----|-----------|--------------|
| E6.1 | M | **KPI tiles**: scansioni totali, QR attivi, top ramo, crescita %, unici stimati | numeri = query owner-scoped su dati reali |
| E6.2 | M | **Serie storica** giorno/ora (esiste: `qr_scans_timeline`) + confronto periodo | RPC definer owner-scoped; test pure |
| E6.3 | S | **Albero reale** con rollup (E3.2) al posto della demo simulata | nodi = QR reali dell'owner |
| E6.4 | S | **Breakdown** device/OS/browser/lingua (donut/bar) | somma quote = 100% |
| E6.5 | S | **Geo**: barre paese/città → mappa | conteggi = raggruppamento reale |
| E6.6 | S | **Heatmap** giorno×ora | cella = conteggio scan nell'intervallo |
| E6.7 | S | **Tabella rami** ordinabile: scan, quota %, crescita, ultima scansione | ordinamento e quote corrette |
| E6.8 | C | **Funnel** scan→apertura→interazione→conversione | serve Event Tracking (Fase 2) |
| E6.9 | S | **Export report** CSV/PDF (il deliverable "oro" per agenzie) | file con i KPI + tabelle del periodo |
| E6.10 | C | **Consigli automatici** ("il 68% scansiona 18–21 → pubblica la sera") | regola deterministica su soglie, testata |

## E7 · Automazioni & Marketing `Fase 3`

| id | pri | requisito | accettazione |
|----|-----|-----------|--------------|
| E7.1 | C | Webhook per scansione/evento → n8n/Make/Zapier/custom | POST firmato, payload atteso |
| E7.2 | C | Pixel marketing (GA4, Meta, TikTok, Clarity, PostHog) sulle landing ospitate | tag caricato solo con consenso |
| E7.3 | C | Reminder abbandono (evento→azione) | regola testata, invio delegato a canale esterno |

## E8 · CRM `Fase 4` (cancello D-2 · PII)

| id | pri | requisito | accettazione |
|----|-----|-----------|--------------|
| E8.1 | C | Profilo cliente per owner: cronologia, valore, visite, preferiti | aggregato derivato, mai saldo |
| E8.2 | C | Consenso, retention configurabile, **diritto all'oblio** | erase cancella PII, conserva aggregati anonimi |

## E9 · API & Enterprise `Fase 4→5`

| id | pri | requisito | accettazione |
|----|-----|-----------|--------------|
| E9.1 | C | API REST: createQR, updateQR, deleteQR, analytics, events, webhooks | chiave per-owner, rate-limit |
| E9.2 | W | White-label, workspace, ruoli (Admin/Editor/Viewer/Cliente), marketplace plugin | — Fase 5 |

---

## Requisiti non-funzionali

- **Sicurezza**: RLS su ogni tabella; segreti mai lato client; confine = DB (L-001).
- **Privacy**: minimizzazione di default; PII solo con consenso (D-2); IP mai pieno.
- **Performance**: Server Components di default; grafici/editor/mappe in `dynamic`;
  streaming con Suspense dove il dato è lento (regola 9).
- **Affidabilità**: un QR pubblicato non si rompe mai (regola 7); log best-effort.
- **Testabilità**: logica di dominio in funzioni pure, testabili senza I/O né UI.
