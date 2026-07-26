# TODO

**Saldo: 2 aperti — T-008 (`↻2`, bloccato su config Supabase di Nick), T-012 (nuovo, analisi pronta + refocus fatto)**  ·  10 chiusi (T-001…T-005 il 2026-07-24; T-006, T-007, T-009, T-010 il 2026-07-25; T-011 il 2026-07-26)

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

- [~] T-012 **Analizzatore campagne + dashboard analisi pubblicitaria** `slice 1 fatto` —
      l'albero landing rifocalizzato da rete-referral a **gerarchia di campagne**
      (Progetto → A/B/C/D → sotto-campagne), demo simulata, provato in locale (11/11)
      ma non ancora in prod. Il **reale** (schema `campaigns`+`campaign_id`,
      arricchimento scan geo/os/lang/hash, RPC aggregazione, dashboard KPI/heatmap/
      geo/export/consigli) è **bloccato sulle decisioni D-A/B/C di Nick**. Analisi
      completa, sequenza e **precedenti** (T-002/003/006/007) in
      **`dossier/T-012-campaign-analytics.md`**.

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

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

1. **Scan reale ✅ fatto** (verificato da te: l'apertura si registra) e **landing
   luxury live e verde** su `qr.shaer.it`. T-011 chiuso.
2. **Le 3 decisioni di T-012** — servono **prima** di costruire la dashboard reale
   (dettaglio in `dossier/T-012-campaign-analytics.md`):
   - **D-A · Profondità dati**: solo aggregati geo/os/lingua · **+** hash unici ·
     **+** conversione con pixel (ROI vero ma tocca il sito dell'esercente).
   - **D-B · Primo bersaglio**: demo simulata (fatta) → poi **dashboard reale
     autenticata** su dati veri (serve schema + RPC).
   - **D-C · Gerarchia**: `campaign_id` sul QR + `parent_id` sulle campagne
     (semplice, raccomandato) vs molti-a-molti.
3. **T-008 (`↻2`, tua azione)** — Supabase `alrguvxspssjwfmtuhdw` → Auth: Confirm
   email **ON** + `https://qr.shaer.it/auth/callback` nei **Redirect URLs**. Codice
   già pronto. A `↻3` lo escalo.
4. **Prompt prossima sessione** (da `D:\Desktop\Shaer.it`):
   > /apertura. Coda: decidere **D-A/B/C** di T-012, poi schema `campaigns` +
   > refocus reale della dashboard. Chiudere **T-008** se hai fatto la config
   > Supabase. Chiudi con /chiusura.
