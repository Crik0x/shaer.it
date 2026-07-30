# TODO

**Saldo: 20 aperti — 18 nuovi (T-016, T-017, T-018, T-020, T-024, T-030…T-037, T-039…T-043), 2 riportati (T-022 `↻1`, T-008 `↻3`)**  ·  23 chiusi (…T-027 il 2026-07-28; T-025, T-026, T-028 il 2026-07-29b; T-038 il 2026-07-29c; **T-029 il 2026-07-30**)

Stati: `[ ]` da fare · `[~]` scritto non provato · `[A]` accettato · `[x]` fatto con prova · `[>]` riportato (`↻`) · `[N]` azione di Nick (si rimuove a conferma). **Non si riscrive mai** (`lavoro.md §8-bis/ter`); `↻3`→stop; solo «Per Nick» si sostituisce.

## Da te — azioni `[N]` (col come-fare, si rimuovono a conferma)

- [N] **T-008 · Supabase prod separato (Confirm email ON)** `↻3` — NON accendere Confirm su
      `alrguvxspssjwfmtuhdw` (romperebbe i test). Passi: New project «shaer-qr-prod» → Auth›Email Confirm ON
      → URL+anon+service key nei secret Vercel (Production) → applica migrazioni nel SQL editor. Come-fare
      completo in `dossier/archivio/T-004-auth-dashboard.md`. → poi «T-008 fatto».

- [N] **(minore) Service key per il ramo positivo del ledger** — aggiungi `SUPABASE_SERVICE_ROLE_KEY` a
      `apps/qr/.env.local` (Dashboard Supabase › Settings › API › service_role). Poi `node --test
      --env-file=.env.local lib/ledger.test.ts` proverà anche «un transfer lecito è accettato» (ora `skipped`).
      Non tocca l'anti-frode (già provato). → scrivi «service key messa».

## Ora

- [ ] T-016 **Piano free/pro + metering** `C` 💰 — ≤100 scan/mese gratis, oltre blocca analisi+export+nuovi QR,
      mai il redirect (D-009). Export PDF pro. Stripe (D-011). Nodi (metering derivato/mese/quota) + piano in `dossier/T-016-piano-free-pro.md`. Precede T-020.
- [ ] T-017 **Restyling densità dashboard** `M` — token (regola 8), Server Components; struttura (non palette) da `arkes_dashboard_v3.html` (D-012). `dossier/T-017-restyling-dashboard.md`.
- [ ] T-018 **Editor QR avanzato** `M` — più tipi/opzioni + branding + `purpose`/`parent_id` (assorbe enum station/employee). Aggancio slug T-020. `dossier/T-018-editor-qr-avanzato.md`.
- [ ] T-020 **Slug custom + @tag** `C` ⚠️ — pro, 2€/mese, immutabile/riassegnabile (D-010). **Consuma T-016**. Nodi @tag+orfani in `dossier/T-020-slug-custom-tag.md`.
- [ ] T-024 **Harness verifica auth (SSR cookie→route)** `M` — 4ª recidiva muro auth-non-testabile. Test: cookie Supabase-SSR in `fetch` verso route → asserisce stringhe chiave. Prec: `auth.test.ts`, `PATTERN.md`.

## Modulo 0 — QR operativo §5.4 (D-015/016/017)

*QR operativo (postazioni/dipendenti/bonus/escrow, MDD §5.4). Feature denaro bloccate dal ledger F1; le senza-soldi no.*

- [~] T-036 **Signup robusto a Confirm-email** `M` — fatto (`login-form.tsx`: no sessione → «controlla
      l'email»; tsc verde). Ramo ON provabile solo dopo T-008 → `[~]`. `dossier/T-036-signup-confirm-email.md`.
- [ ] T-037 **Landing: pivot copy operativo §5.4** `M` — hero ancora «analytics», simulatore già operativo:
      riscrivere hero + messaggi. Voce di brand = Nick.
- [ ] T-039 **Mappa postazioni spostabili** `C` — D-017: demo finta in landing (drag no-lib, collasso `-`)
      + editor reale in dashboard, persiste solo per utente **verificato** (gate T-030). Sostituisce `NetworkTreePanel`.
- [ ] T-040 **Connessione tra account (scan-to-connect)** `C` — A scansiona il QR di B → arco (utile admin
      damascati→cliente). Grafo puro, no denaro. Serve `connections` + RLS + flusso scan.
- [ ] T-041 **Fidelity card** `C` 💰 **[BLOCCATO su F1]** — punti = crediti (D-016): non lavorabile finché
      T-029a…T-032 non danno crediti reali. Segnaposto.

## Ecosistema — F1 costruzione (sequenza stabilisce→consuma)

*SAD §3–8 (E-D-26), test-first (regola 5), codice in `apps/qr`/`packages` (D-015). Precedenti nei singoli task. **T-029** (ledger core) chiuso `[x]` → sezione «Fatto»; conio backed = task nuovo (post-webhook Stripe).*

- [ ] T-030 **Identità, ruoli, RBAC** `C` — SAD §3.1/4/6 + **E-D-29** (3 piani). **Motore puro fatto+verde 10/10**
      (`packages/core-rbac`, AC-EE1.5/1.7/1.8). Resta: migrazione (`user_roles`+`permissions`+`work_*`) + 2 RPC
      definer + grants.test → `[N]` apply. Piano pronto in `dossier/T-030-rbac.md`. Prec: `archivio/T-007` (grant anon), `T-004` (client SSR).
- [ ] T-031 **TXN engine** `C` — SAD §3.2/4. Stabilisce il tronco TXN. Consuma T-029 + T-030.
- [ ] T-032 **Wallet derivato + conti utente** `M` — SAD §3.1/3.3. Consuma T-029 + T-030.
      ⚠️ **NON aprire finché T-030 (RBAC) non è chiuso** (revisore 2026-07-29c g2: senza RBAC, saldi utente = furto possibile).
- [ ] T-033 **Escrow + circuito chiuso** `C` 💰 — SAD §3.3. Consuma T-029 (held) + T-031. Prec: `archivio/T-038` (modello bonus).
- [ ] T-034 **Recensioni & Rank bayesiano** `M` — SAD §3.5. Consuma T-031.
- [ ] T-035 **Referral versionato + `param_sets`** `M` — SAD §3.4/3.5. Stabilisce `param_sets`. Consuma T-029 + T-031.

## Modulo 7 — Gestionale attività (G1) — nuovo scope (E-D-29/30)

*Prima fetta = admin single-activity, schema money-ready ma **pagamento OFF**, generico multi-verticale. Visione+taglio+modello in `MD/ecosistema/MODULO-7-GESTIONALE.md`. Booking cliente + CRM = fuori (Sprint 3 / post-TXN).*

- [ ] T-042 **Schema gestionale G1** `C` — tabelle `businesses`, `offerings`(service|product), `bundles`,
      `staff`(ref QR opzionale), `role_templates`+`staff_roles`(scadenza), tutte `owner_id`+RLS, prezzo_shaer
      **inerte**. **Consuma T-030** (RBAC/verify-gate). Modello in `MODULO-7-GESTIONALE.md §4`.
- [ ] T-043 **CRUD admin G1** `M` — dashboard servizi/prodotti/pacchetti/staff/ruoli, Server Components
      (regola 9), estetica Stripe/Vercel (regola 8). **Consuma T-042** + struttura di `arkes_admin_panel_v14.html`
      (tab Servizi&Badge/Operatrici&Servizi/Catalogo/Prodotti/Pacchetti — struttura, non palette).

## Riportati

- [>] T-022 **Fuso orario del cliente + granularità Giorno/Ora** `↻1` `C` — blocchi A+B+C fatti e provati
      (23/23 + `next build` + revisore). Resta solo **D** (toggle Giorno/Ora) + rendering fuso locale `[~]`
      (dietro auth → T-024). Dettaglio in `dossier/T-022-fuso-cliente.md`. Condivide la fondazione con T-016.

## Fatto

*(Prova completa in `memoria/REGISTRO.md` + `dossier/archivio/`. Qui non si ripete — potato 2026-07-27.)*

**Chiusi (23):** T-001…T-007, T-009…T-015, T-019, T-021, T-023, T-025, T-026, T-027, T-028, T-038, **T-029** → `memoria/REGISTRO.md`

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

**Sessione 2026-07-30.** Provato: **T-029** ledger `[x]` (DB-test 4/4) · **T-030** motore puro RBAC 10/10.
Intake gestionale → `MODULO-7-GESTIONALE.md`. Deciso **E-D-29/30**. Nuovi: **T-042/T-043**.

**Le tue `[N]`:** ① (minore) `SUPABASE_SERVICE_ROLE_KEY` in `apps/qr/.env.local` (ramo positivo ledger) · ② **T-008**.
**Segnalo:** `Struttura/appadmin.html` (2389 righe) + `prenotazioni.html` untracked, **non committati** (riferimento, non miei) — dimmi se versionarli. Il **prototipo booking** che hai: dammelo allo Sprint 3.

## Prossima sessione — prompt da lanciare

*(standing: dopo ogni `/chiusura` questa sezione porta il prompt pronto — `lavoro.md` §8-quater)*

*(Sessione mirata: puoi saltare `/apertura`. Basta l'àncora — dammi il task e la fisso io con un `git rev-parse`.)*

```
Lavoriamo su T-030 (RBAC): scrivi la migrazione. Il motore puro è già fatto e verde 10/10
(packages/core-rbac). Piano pronto in dossier/T-030-rbac.md, decisione locked E-D-29 (3 piani).

Scrivi supabase/migrations/2026073000000X_rbac.sql (SAD §3.1): user_roles (tetto ≤3 via definer,
non unique), permissions admin-first (capability {read,verify}, granted_by=ADMIN), work_relationships
+ work_sessions; RLS owner-scoped; 2 RPC definer assign_permission + approve_pending (pending_actions,
maker-checker idempotente); estendi apps/qr/lib/grants.test.ts (nessun INSERT diretto a authenticated,
whitelist anon invariata). Precedenti da leggere PRIMA (non ri-derivare): archivio/T-007 (grant anon:
revoke from public NON toglie l'EXECUTE di default, si revoca da anon), T-004 (client SSR getUser).
Poi revisore → migrazione [~] finché Nick applica ([N]). Dopo T-030: T-031 (TXN) o T-042 (schema
gestionale G1, MODULO-7-GESTIONALE.md §4). /chiusura.
```
