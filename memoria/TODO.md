# TODO

**Saldo: 2 aperti — T-014 (nuovo, resto dashboard), T-008 (`↻3` → deciso: progetto prod separato)**  ·  12 chiusi (T-001…T-005 il 2026-07-24; T-006, T-007, T-009, T-010 il 2026-07-25; T-011, T-013, T-012 il 2026-07-26)

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

- [ ] T-014 **Dashboard: arricchimento applicato, geo/uniques, report** (nuovo, scorporo
      di T-012) — groundwork già in casa (migrazione `0002` `[~]`, route arricchita con
      fallback regola 7, funzioni pure testate). **Prossimo**: Nick applica `0002` +
      `VISITOR_SALT` su Vercel → RPC `qr_breakdown`/`qr_uniques` **con test** (rimosse in
      T-012 perché inerti) → widget geo/os/lang/unici, heatmap, export CSV/PDF, consigli.
      Piano completo, precedenti (**T-006** RPC definer, **T-007** whitelist anon,
      **T-003** fallback redirect) e Composizione in **`dossier/T-014-dashboard-arricchimento.md`**.

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

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

1. **T-012 chiuso ✅**: dashboard reale (albero+rollup+KPI+timeline+breakdown) provato
   end-to-end. La migrazione albero (0001) l'hai già applicata. Il redirect **non si
   rompe** anche senza le migrazioni nuove (fallback regola 7).
2. **Per T-014, applica la migrazione arricchimento** — Supabase `alrguvxspssjwfmtuhdw`
   → SQL editor: esegui `supabase/migrations/20260726000002_resolve_qr_enrichment.sql`.
   Da lì il redirect scrive os/lang/geo (in prod, dagli header Vercel).
3. **Imposta `VISITOR_SALT`** (una stringa segreta lunga) nelle env di **Vercel** →
   abilita la stima degli unici. Senza, il visitor_hash resta null (mai un salt pubblico).
4. **Sistema la config auth** (come discusso): Redirect URL da `https://*shaer.it/*` a
   **`https://qr.shaer.it/**`** (il `*shaer.it` matcha domini-sosia); Site URL da
   `.../auth/callback` a **`https://qr.shaer.it`**.
5. **T-008 (`↻3`, deciso)** — crea un **progetto Supabase prod separato** con Confirm
   email **ON** (questo resta dev; accenderlo qui romperebbe i test).
6. **Decisione L-003** (cricchetto a 3 sessioni): la ritiro (0 ricorrenze da T-010,
   il build fallisce già rumorosamente) o la converto in hook? Proposta: **ritiro**.
7. **Prompt prossima sessione** (da `D:\Desktop\Shaer.it`):
   > /apertura. Prosegui **T-014**: se hai applicato la 0002, scrivi `qr_breakdown`/
   > `qr_uniques` **col test**, poi i widget geo/os/lang/unici + heatmap + export sul
   > dashboard (PRD E6). Chiudi con /chiusura.
