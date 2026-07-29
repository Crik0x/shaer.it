# TODO

**Saldo: 19 aperti — 17 nuovi (T-016, T-017, T-018, T-020, T-024, T-029…T-041), 2 riportati (T-022 `↻1`, T-008 `↻3`)**  ·  22 chiusi (…T-023 il 2026-07-27; T-027 il 2026-07-28; T-025, T-026, T-028 il 2026-07-29b; **T-038 il 2026-07-29c**)

Stati: `[ ]` da fare · `[~]` scritto non provato · `[A]` provato/accettato · `[x]` fatto con prova ·
`[>]` riportato (`↻`+dossier) · `[N]` azione di Nick (col come-fare; si rimuove a conferma).
**Non si riscrive mai** (saldo, non fotografia): regole in `lavoro.md` §8-bis/ter. `↻3`→ci si ferma.
Solo «Per Nick» si sostituisce.

## Da te — azioni `[N]` (col come-fare, si rimuovono a conferma)

- [N] **T-008 · Progetto Supabase prod separato (Confirm email ON)** `↻3` — deciso (2026-07-26c):
      **non** accendere Confirm email su `alrguvxspssjwfmtuhdw` (romperebbe i test d'integrazione).
      Passi: **Dashboard Supabase › New project** («shaer-qr-prod», stessa region) → **Authentication
      › Providers › Email**: *Confirm email* **ON** → copia URL + anon key + service key nei secret
      Vercel (ambiente Production) → applica le migrazioni `0001`+`0002` nel SQL editor del nuovo
      progetto. Dettaglio in `dossier/archivio/T-004-auth-dashboard.md`. → poi scrivi «T-008 fatto».

- [N] **Applica la migrazione ledger** `20260729000001_ledger_core.sql` (T-029a) — SQL editor DB dev,
      incolla+run. Poi da `apps/qr`: `node --test --env-file=.env.local lib/ledger.test.ts` → dev'essere
      verde. → scrivi «ledger applicato» (T-029 `[~]`→`[x]`).

## Ora

- [ ] T-016 **Piano free/pro + metering** `C` 💰 — ≤100 scan/mese gratis, oltre blocca analisi+export+nuovi QR,
      mai il redirect (D-009). Export PDF pro. Stripe (D-011). Nodi (metering derivato/mese/quota) + piano in `dossier/T-016-piano-free-pro.md`. Precede T-020.
- [ ] T-017 **Restyling densità dashboard** `M` — token (regola 8), Server Components; struttura (non palette) da `arkes_dashboard_v3.html` (D-012). `dossier/T-017-restyling-dashboard.md`.
- [ ] T-018 **Editor QR avanzato** `M` — più tipi/opzioni + branding + `purpose`/`parent_id` (assorbe enum station/employee). Aggancio slug T-020. `dossier/T-018-editor-qr-avanzato.md`.
- [ ] T-020 **Slug custom + @tag** `C` ⚠️ — pro, 2€/mese, immutabile/riassegnabile (D-010). **Consuma T-016**. Nodi @tag+orfani in `dossier/T-020-slug-custom-tag.md`.
- [ ] T-024 **Harness verifica auth (SSR cookie→route)** `M` — 4ª recidiva muro auth-non-testabile. Test: cookie Supabase-SSR in `fetch` verso route → asserisce stringhe chiave. Prec: `auth.test.ts`, `PATTERN.md`.

## Modulo 0 — QR operativo §5.4 (2026-07-29c, D-015/016/017)

*Pivot sul QR operativo (postazioni/dipendenti/bonus/escrow, MDD §5.4). Le feature sul **denaro**
sono bloccate dal ledger F1 (D-016): prima T-029a. Le senza-soldi cedono priorità, non sono bloccate.*

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

*T-018 assorbe l'estensione enum `purpose`→`station`/`employee` (`[N]` DDL). T-016+T-017 = dashboard
Shaer.it per attivare il SaaS (D-015: dentro apps/qr).*

## Ecosistema — F1 costruzione (da T-028, sequenza stabilisce→consuma) 

*Dettaglio in `MD/ecosistema/SAD.md` §3–8 (E-D-26). Test-first (regola 5). Codice **dentro `apps/qr`**
(D-015: non `apps/shaer`). Precedenti (distillatore): T-030→`archivio/T-007` (introspezione grant reale) +
`T-004`; T-031→`archivio/T-003` (definer unico-writer, log non bloccante); T-033→`archivio/T-038` (modello
bonus/escrow già validato, riusare non ri-derivare); T-032→`archivio/T-002`.*

- [~] T-029 **Ledger core** `C` 💰 — p.1 motore puro (`e91b64e`, 8/8) + **T-029a scritto** (migrazione
      `20260729000001_ledger_core.sql` transfer-only + anti-scoperto universale + test anti-exploit,
      revisore approvato). `[~]` finché Nick non applica (`[N]`) e il test gira verde. Dettaglio + rischio
      aperto (autorizzazione=T-030) in `dossier/T-029-ledger-core.md`. Conio backed = task nuovo (post-webhook Stripe).
- [ ] T-030 **Identità, ruoli, RBAC** `C` — SAD §3.1/4/6. Stabilisce `user_id`+`role`, gate verifica, limiti approvatore. Consuma RLS/definer di T-029.
- [ ] T-031 **TXN engine** `C` — SAD §3.2/4. Stabilisce il tronco TXN. Consuma T-029 + T-030.
- [ ] T-032 **Wallet derivato + conti utente** `M` — SAD §3.1/3.3. Consuma T-029 + T-030.
      ⚠️ **NON aprire finché T-030 (RBAC) non è chiuso** (revisore 2026-07-29c g2: senza RBAC, saldi utente = furto possibile).
- [ ] T-033 **Escrow + circuito chiuso** `C` 💰 — SAD §3.3. Consuma T-029 (held) + T-031. Prec: `archivio/T-038` (modello bonus).
- [ ] T-034 **Recensioni & Rank bayesiano** `M` — SAD §3.5. Consuma T-031.
- [ ] T-035 **Referral versionato + `param_sets`** `M` — SAD §3.4/3.5. Stabilisce `param_sets`. Consuma T-029 + T-031.

## Riportati

- [>] T-022 **Fuso orario del cliente + granularità Giorno/Ora** `↻1` `C` — blocchi A+B+C fatti e provati
      (23/23 + `next build` + revisore). Resta solo **D** (toggle Giorno/Ora) + rendering fuso locale `[~]`
      (dietro auth → T-024). Dettaglio in `dossier/T-022-fuso-cliente.md`. Condivide la fondazione con T-016.

## Fatto

*(Prova completa in `memoria/REGISTRO.md` + `dossier/archivio/`. Qui non si ripete — potato 2026-07-27.)*

**Chiusi (22):** T-001…T-007, T-009…T-015, T-019, T-021, T-023, T-025, T-026, T-027, T-028, **T-038** → `memoria/REGISTRO.md`

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

**Sessione 2026-07-29c — pivot Modulo 0 su §5.4 + ledger T-029a.** Fatto e provato: **T-038** (simulatore
operativo + `lib/bonus.ts` 4/4). Scritto `[~]`: **T-036** (signup) + **T-029a** (migrazione ledger + test
anti-exploit). Deciso: **D-015/016/017**. Scope aperto: T-037/039/040/041.

**Tocca a te — le `[N]` (come-fare in testa «Da te»):** ① applicare la **migrazione ledger** + far girare
`lib/ledger.test.ts` (chiude T-029a) · ② **T-008** (Supabase prod Confirm ON → chiude il bug utenti finti +
T-036) · ③ purgare gli utenti finti dev · ④ confermare *quali* chiavi Stripe e *su quale* progetto.

## Prossima sessione — prompt da lanciare

*(standing: dopo ogni `/chiusura` questa sezione porta il prompt pronto — `lavoro.md` §8-quater)*

```
/apertura. Shaer.it = super-piattaforma, QR = Modulo 0. Fonti vive: SAD (MD/ecosistema/SAD.md v0.1) +
DECISIONI (E-D-01…28, D-015/016/017). Dominio: MD/SHAER_MASTER.md; §5.4 = QR operativo.

Priorità (D-016): il ledger F1 prima delle feature economiche. T-029a è SCRITTO (migrazione
supabase/migrations/20260729000001_ledger_core.sql + test apps/qr/lib/ledger.test.ts), resta `[~]`:
se Nick ha applicato la migrazione ([N]), esegui `node --test --env-file=.env.local lib/ledger.test.ts`
da apps/qr → dev'essere verde (rifiuta i 2 exploit + INSERT diretto); se verde, T-029→[x] in REGISTRO +
converti L-011 (→test). Poi valuta il rischio aperto n°1 (autorizzazione: chi muove quale conto = T-030).
Dettaglio in dossier/T-029-ledger-core.md.

Dopo il ledger, Modulo 0 §5.4 (senza-soldi): T-018 (editor + enum purpose station/employee), T-039 (mappa
postazioni: demo landing no-lib + editor reale gated verificato, D-017), T-040 (connessione scan-to-connect),
T-037 (copy landing). T-041 fidelity = BLOCCATO su F1. Dashboard Shaer.it dentro apps/qr (D-015). /chiusura.
```
