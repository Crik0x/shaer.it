# TODO

**Saldo: 6 aperti — 5 nuovi (T-016…T-020), 1 riportato (T-008 `↻3`)**  ·  14 chiusi (T-001…T-005 il 2026-07-24; T-006, T-007, T-009, T-010 il 2026-07-25; T-011, T-013, T-012 il 2026-07-26; T-014, T-015 il 2026-07-27)

Stati: `[ ]` da fare · `[~]` scritto ma non provato · `[A]` provato e accettato ·
`[x]` fatto con prova · `[>]` riportato (con `↻` e il suo dossier)

**Questo file non si riscrive mai.** È un saldo, non una fotografia: cresce per
task nuovi, cala solo per task arrivati a destinazione **con prova** — fatto
(→REGISTRO) · archiviato (→DECISIONI, col perché) · riportato (resta, `↻`+1).
Senza destinazione, una riga rientra.
A **`↻3`** ci si ferma e si porta il task a Nick con due o tre vie d'uscita.
Solo la sezione «Per Nick» si sostituisce.

## Ora

- [>] T-008 **Progetto Supabase prod separato (Confirm email ON)** `↻3` — ESCALATO e
      **deciso** (2026-07-26c): non si accende Confirm email su `alrguvxspssjwfmtuhdw`
      (romperebbe i test d'integrazione che esigono la sessione immediata). Si crea un
      **progetto prod dedicato** con Confirm email ON, lasciando questo come dev.
      **Azione di Nick**. Origine del debito e passi dashboard in `dossier/archivio/T-004-auth-dashboard.md`.

- [ ] T-016 **Piano free/pro + metering** (nuovo) `C` 💰 — ≤100 scansioni/mese gratis, oltre
      si bloccano **analisi+export+nuovi QR**, **mai il redirect** (D-009, regola 7). Include
      export **PDF** (feature pro). **Prima di costruire**: provider pagamento (Stripe?),
      metering derivato vs materializzato, fuso del mese, comportamento a quota. Piano e nodi
      in **`dossier/T-016-piano-free-pro.md`**. Precede T-020. Precedente: **T-007** (whitelist anon).

- [ ] T-017 **Restyling densità dashboard** (nuovo) `M` — spazi/gerarchia/griglia dei widget,
      solo token (regola 8), Server Components. Chiedere a Nick wireframe o mano libera **prima**
      (precedente: **T-011** respinto per estetica). Piano in **`dossier/T-017-restyling-dashboard.md`**.

- [ ] T-018 **Editor QR avanzato** (nuovo) `M` — più tipi/opzioni + branding + `purpose`/`parent_id`;
      punto d'aggancio dello slug (T-020). Verificare Roadmap M2–M5 prima. Precedente: **T-005**.
      Piano in **`dossier/T-018-editor-qr-avanzato.md`**.

- [ ] T-019 **Analisi singolo QR** (nuovo) `M` — riusa `lib/dashboard.ts` (T-014) + rollup (T-012)
      + selettore (T-015) filtrando su `qr_id`: è **composizione**, non logica nuova. Piano in
      **`dossier/T-019-analisi-singolo-qr.md`**.

- [ ] T-020 **Slug custom + @tag utente** (nuovo) `C` ⚠️ — pro, 2€/mese/link, immutabile in vita,
      riassegnabile se cancellato (D-010, eccezione regola 7). **Consuma T-016** (va dopo). Routing
      @tag e delete/scansioni orfane = nodi aperti. Piano in **`dossier/T-020-slug-custom-tag.md`**.

## Riportati

## Fatto

*(voci arrivate a destinazione: prova completa in `memoria/REGISTRO.md` e nel
dossier archiviato — qui solo il saldo. Condensate in chiusura T-006 per il
budget contesto §10.)*

- [x] T-001 **Scaffold dell'app** · 2026-07-24 · `archivio/T-001-scaffold-app.md`
- [x] T-002 **Schema Supabase + RLS** · 2026-07-24 · `archivio/T-002-supabase-schema.md`
- [x] T-003 **Redirect dinamico** · 2026-07-24 · `archivio/T-003-redirect-dinamico.md`
- [x] T-004 **Auth + dashboard scheletro** · 2026-07-24 · `archivio/T-004-auth-dashboard.md`
- [x] T-005 **Generatore QR** · 2026-07-24 · `archivio/T-005-generatore-qr.md`
- [x] T-006 **Analytics timeline** · 2026-07-25 · `archivio/T-006-analytics-timeline.md`
- [x] T-007 **Hardening: test grant anon** · 2026-07-25 · `archivio/T-007-hardening-grant-anon.md`
- [x] T-009 **Fixture dev seed provata** (3 QR + 6 scansioni) · 2026-07-25 · `archivio/T-009-seed-dev-fixture.md`
- [x] T-010 **Deploy produzione** (qr.shaer.it online) · 2026-07-25 · `archivio/T-010-deploy-produzione.md`
- [x] T-011 **Landing luxury + albero rete** (qr.shaer.it verde, commit `0781ed7`) · 2026-07-26 · `archivio/T-011-landing-simulatore.md`
- [x] T-013 **Corpus documentale fondativo** (5 doc in `MD/`: MDD, PRD, SAD, Design System, Roadmap) · 2026-07-26 · `archivio/T-013-corpus-documentale.md`
- [x] T-012 **Analizzatore albero di QR + dashboard reale** (rollup applicato+provato 4/4, dashboard scan-side verificato end-to-end) · 2026-07-26 · `archivio/T-012-campaign-analytics.md`
- [x] T-014 **Dashboard arricchita** (geo/os/lingua/unici/heatmap/export CSV/consigli, funzioni pure 52/52, revisore approvato, CSV-injection risolta; RPC in-JS non costruita) · 2026-07-27 · `archivio/T-014-dashboard-arricchimento.md`
- [x] T-015 **Selettore periodo analitiche** (7/30/60/120/360g + orario 7g, query param, `hourlyBuckets` testata) · 2026-07-27 · `archivio/T-015-selettore-periodo.md`

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

1. **T-014 + T-015 chiusi ✅**: dashboard arricchita completa (geo/os/lingua/unici/heatmap/
   CSV/consigli) + selettore periodo. 52/52 verde, revisore approvato. Ricarica la dashboard
   loggato e prova il selettore **Periodo** e la vista **Orario 7g**.
2. **Verifica gli unici in produzione** — in locale il `visitor_hash` è **sempre null** (nessun
   IP reale): non si può provare qui. Su `qr.shaer.it`, dopo il redeploy, **scansiona un QR** e
   guarda il KPI "Visitatori unici" salire + il consiglio VISITOR_SALT sparire. È l'ultimo `[~]`.
3. **Config auth Supabase** (ancora da fare, come discusso): Redirect URL `https://qr.shaer.it/**`
   (non `*shaer.it`, matcha domini-sosia); Site URL `https://qr.shaer.it`.
4. **T-008 (`↻3`, deciso)** — progetto Supabase prod separato con Confirm email ON (azione tua).
5. **Cinque task nuovi aperti** dal tuo feedback: T-016 (piano free/pro, tocca soldi → decisioni
   provider/metering prima), T-017 (restyling), T-018 (editor QR), T-019 (analisi singolo QR),
   T-020 (slug+@tag). Decisioni incise in **D-009/D-010** (`DECISIONI.md`). **T-016 va prima di T-020.**
6. **Prompt prossima sessione** (da `D:\Desktop\Shaer.it`):
   > /apertura. Il candidato più economico è **T-019** (analisi singolo QR): è pura composizione
   > di `lib/dashboard.ts`+rollup+selettore, zero logica nuova. In alternativa **T-017** (restyling,
   > ma chiedimi prima un riferimento) o **T-016** (soldi: prima le decisioni provider/metering).
   > Chiudi con /chiusura.
