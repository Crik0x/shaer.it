# TODO

**Saldo: 2 aperti — T-008 (`↻2`, bloccato su config Supabase di Nick), T-012 (`↻1`, migrazione albero scritta [~], da applicare)**  ·  11 chiusi (T-001…T-005 il 2026-07-24; T-006, T-007, T-009, T-010 il 2026-07-25; T-011 e T-013 il 2026-07-26)

Stati: `[ ]` da fare · `[~]` scritto ma non provato · `[A]` provato e accettato ·
`[x]` fatto con prova · `[>]` riportato (con `↻` e il suo dossier)

**Questo file non si riscrive mai.** È un saldo, non una fotografia: cresce per
task nuovi, cala solo per task arrivati a destinazione **con prova** — fatto
(→REGISTRO) · archiviato (→DECISIONI, col perché) · riportato (resta, `↻`+1).
Senza destinazione, una riga rientra.
A **`↻3`** ci si ferma e si porta il task a Nick con due o tre vie d'uscita.
Solo la sezione «Per Nick» si sostituisce.

## Ora

- [>] T-008 **Riattivare Confirm email prima del lancio** `↻2` — debito di T-004:
      in dev è OFF su Supabase (Auth → Providers → Email, `alrguvxspssjwfmtuhdw`).
      **Codice pronto** (`auth/callback/route.ts`): manca solo la config dashboard,
      **azione di Nick** — riportato di nuovo perché Nick non l'ha ancora fatta, non
      per re-analisi. A `↻3` va escalato. *Contesto: `dossier/T-004-auth-dashboard.md`.*

- [~] T-012 **Analizzatore albero di QR + dashboard analisi** `↻1` — decisioni
      **SBLOCCATE** (D-006/007/008). Reframe D-008: non `campaigns` separata ma
      **albero di QR** (`qr_codes.parent_id`+owner per-nodo+purpose). Scritti e `[~]`
      (non applicati su DB): migrazione `20260726000001` (albero+trigger anti-ciclo+
      arricchimento scan+RPC `qr_tree_rollup`) e `apps/qr/lib/tree.test.ts`. Revisore
      **approvato**. **Prossimo** (piano a freddo nel dossier): Nick applica la
      migrazione + lancia `tree.test.ts` → poi redirect enrichment → RPC breakdown/geo/
      uniques → dashboard reale. Analisi, piano e **precedenti** (T-002/003/**006**
      RPC definer/**007** whitelist anon) in **`dossier/T-012-campaign-analytics.md`**.

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

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

1. **5 documenti fondativi ✅** in `MD/` (MDD, PRD, SAD, Design System, Roadmap) +
   3 decisioni locked (D-006/007/008). T-013 chiuso. Leggili: sono la spina dorsale.
2. **APPLICA la migrazione albero** (sblocca la dashboard reale) — Supabase
   `alrguvxspssjwfmtuhdw` → SQL editor: incolla ed esegui
   `supabase/migrations/20260726000001_qr_tree_and_scan_enrichment.sql`. Poi da
   `D:\Desktop\Shaer.it\apps\qr`:
   ```
   node --test --env-file=.env.local lib/tree.test.ts
   ```
   Deve diventare **verde** (ora salta per env mancante). Migrazione già **approvata
   dal revisore**; quando è applicata+verde, T-012 passa da `[~]` a `[x]` su questo slice.
3. **T-008 (`↻2`, tua azione, invariata)** — Supabase → Auth: Confirm email **ON** +
   `https://qr.shaer.it/auth/callback` nei **Redirect URLs**. Codice pronto. A `↻3` lo escalo.
4. **Prompt prossima sessione** (da `D:\Desktop\Shaer.it`):
   > /apertura. Se hai applicato la migrazione albero, chiudi lo slice T-012 (verifica
   > `tree.test.ts` verde) e prosegui: arricchimento redirect (geo/os/lang/hash) → RPC
   > breakdown/geo/uniques → **dashboard reale** (PRD E6). Chiudi **T-008** se hai fatto
   > la config Supabase. Chiudi con /chiusura.
