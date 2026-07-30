# TODO

**Saldo: 19 aperti — 17 nuovi (T-016, T-017, T-018, T-020, T-024, T-031…T-037, T-039…T-043), 2 riportati (T-022 `↻1`, T-008 `↻3`)**  ·  24 chiusi → `memoria/REGISTRO.md`

Stati: `[ ]` da fare · `[~]` scritto non provato · `[A]` accettato · `[x]` fatto con prova · `[>]` riportato (`↻`) · `[N]` azione di Nick (si rimuove a conferma). **Non si riscrive mai** (`lavoro.md §8-bis/ter`); `↻3`→stop. «Per Nick» e il prompt di ripresa vivono in `memoria/RIPRESA.md` (caricato da `/apertura`).

## Da te — azioni `[N]` (col come-fare, si rimuovono a conferma)

- [N] **T-008 · Supabase prod separato (Confirm email ON)** `↻3` — NON accendere Confirm su `alrguvxspssjwfmtuhdw` (romperebbe i test). New project «shaer-qr-prod» → Auth Confirm ON → URL+anon+service key nei secret Vercel (Production) → migrazioni nel SQL editor. Come-fare completo: `dossier/archivio/T-004-auth-dashboard.md`. → «T-008 fatto».
- [N] **Vercel Root Directory → `apps/web`** (rename apps/qr→apps/web, sessione 2026-07-31) — Vercel › Project shaer.it › Settings › Build & Deployment › **Root Directory**: da `apps/qr` a `apps/web`. Senza, il prossimo deploy non trova l'app. → «root dir aggiornata».

## Ora

- [ ] T-016 **Piano free/pro + metering** `C` 💰 — Stripe (D-011), quota ≤100 scan/mese, mai il redirect (D-009), export PDF pro. Precede T-020. → `dossier/T-016-piano-free-pro.md`.
- [ ] T-017 **Restyling densità dashboard** `M` — token (regola 8), Server Components; struttura (non palette) da `arkes_dashboard_v3.html` (D-012). → `dossier/T-017-restyling-dashboard.md`.
- [ ] T-018 **Editor QR avanzato** `M` — più tipi/opzioni + branding + `purpose`/`parent_id`; aggancio slug T-020. → `dossier/T-018-editor-qr-avanzato.md`.
- [ ] T-020 **Slug custom + @tag** `C` ⚠️ — pro 2€/mese, immutabile/riassegnabile (D-010). **Consuma T-016**. → `dossier/T-020-slug-custom-tag.md`.
- [x] T-024 **Harness verifica auth (SSR cookie→route)** `M` — **fatto+provato** (2026-07-31): `apps/web/lib/dashboard-auth.test.ts` 1/1 sul dev server (cookie SSR via jar-libreria → `fetch /dashboard` vede email di sessione + «Esci»; senza cookie → `/login`). Rompe il muro 4ª recidiva (PATTERN r.18 → ✅). Dossier `T-024`. → Chiusi in `/chiusura`.

## Modulo 0 — QR operativo §5.4 (D-015/016/017)

*Feature denaro bloccate dal ledger F1; le senza-soldi no.*

- [~] T-036 **Signup robusto a Confirm-email** `M` — fatto (`login-form.tsx`, tsc verde); ramo ON provabile solo dopo T-008. → `dossier/T-036-signup-confirm-email.md`.
- [ ] T-037 **Landing: pivot copy operativo §5.4** `M` — hero «analytics» → operativo (simulatore già operativo). Voce di brand = Nick.
- [ ] T-039 **Mappa postazioni spostabili** `C` — D-017: demo drag no-lib in landing + editor reale in dashboard, persiste solo per utente **verificato** (gate T-030). Sostituisce `NetworkTreePanel`.
- [ ] T-040 **Connessione tra account (scan-to-connect)** `C` — A scansiona il QR di B → arco. Grafo puro, no denaro. Serve `connections` + RLS + flusso scan.
- [ ] T-041 **Fidelity card** `C` 💰 **[BLOCCATO su F1]** — punti = crediti (D-016); non lavorabile finché T-031/032 non danno crediti reali. Segnaposto.

## Ecosistema — F1 costruzione (sequenza stabilisce→consuma)

*SAD §3–8 (E-D-26), test-first (regola 5), codice in `apps/web`/`packages` (D-015).*

- [ ] T-031 **TXN engine** `C` — SAD §3.2/4. Stabilisce il tronco TXN. Consuma T-029 + T-030. **Fetta 1/2 `[x]`**: motore puro FSM `packages/core-ledger/txn.ts` 11/11 + revisore approvato (commit 266fffa). Resta **fetta 2/2** (migrazione+RPC definer+integration test) — **prima confermare con Nick la FSM adiacenza-stretta vs monotòna-forward → D-NNN**. → `dossier/T-031-txn-engine.md`. Prec: `archivio/T-029` (schema exploit-rifiutato), `T-030` (maker-checker, L-013), `T-007` (grants.test).
- [ ] T-032 **Wallet derivato + conti utente** `M` — SAD §3.1/3.3. Consuma T-029 + T-030. **Sbloccato** da T-030.
- [ ] T-033 **Escrow + circuito chiuso** `C` 💰 — SAD §3.3. Consuma T-029 (held) + T-031. Prec: `archivio/T-038`.
- [ ] T-034 **Recensioni & Rank bayesiano** `M` — SAD §3.5. Consuma T-031.
- [ ] T-035 **Referral versionato + `param_sets`** `M` — SAD §3.4/3.5. Stabilisce `param_sets`. Consuma T-029 + T-031.

## Modulo 7 — Gestionale attività (G1) — nuovo scope (E-D-29/30)

*Prima fetta = admin single-activity, schema money-ready ma pagamento OFF. Modello: `MD/ecosistema/MODULO-7-GESTIONALE.md`.*

- [ ] T-042 **Schema gestionale G1** `C` — `businesses`/`offerings`(service|product)/`bundles`/`staff`/`role_templates`+`staff_roles`, tutte `owner_id`+RLS, prezzo_shaer **inerte**. **Consuma T-030**. Modello §4.
- [ ] T-043 **CRUD admin G1** `M` — dashboard servizi/prodotti/pacchetti/staff/ruoli, Server Components (regola 9), estetica Stripe/Vercel (regola 8). **Consuma T-042** + struttura `arkes_admin_panel_v14.html`.

## Riportati

- [>] T-022 **Fuso orario cliente + granularità Giorno/Ora** `↻1` `C` — A+B+C provati (23/23 + `next build` + revisore). Resta **D** (toggle Giorno/Ora) + rendering fuso locale `[~]` (dietro auth → T-024). → `dossier/T-022-fuso-cliente.md`. Fondazione condivisa con T-016.

## Fatto

*(Prova in `memoria/REGISTRO.md` + `dossier/archivio/`. Qui non si ripete — potato 2026-07-27.)*

**Chiusi (24):** T-001…T-007, T-009…T-015, T-019, T-021, T-023, T-025, T-026, T-027, T-028, T-038, T-029, T-030 → `memoria/REGISTRO.md`
