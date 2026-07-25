# TODO

**Saldo: 2 aperti — 1 nuovo (T-009), 1 preesistente (T-008)**  ·  7 chiusi (T-001…T-005 il 2026-07-24, T-006 e T-007 il 2026-07-25)

Stati: `[ ]` da fare · `[~]` scritto ma non provato · `[A]` provato e accettato ·
`[x]` fatto con prova · `[>]` riportato (con `↻` e il suo dossier)

**Questo file non si riscrive mai.** È un saldo, non una fotografia: cresce per
task nuovi, cala solo per task arrivati a destinazione **con prova** — fatto
(→REGISTRO) · archiviato (→DECISIONI, col perché) · riportato (resta, `↻`+1).
Senza destinazione, una riga rientra.
A **`↻3`** ci si ferma e si porta il task a Nick con due o tre vie d'uscita.
Solo la sezione «Per Nick» si sostituisce.

## Ora

- [~] T-009 **Eseguire e provare la fixture dev (`supabase/seed.sql`)** — scorporo
      di T-007: il seed è scritto e **approvato dal revisore** (nota g1: manca solo
      la prova d'esecuzione), non ancora girato. Piano pronto in
      `dossier/T-009-seed-dev-fixture.md`: creare l'utente-dev `dev@shaer.it` fuori
      da git (dashboard/app), eseguire il seed, verificare 3 QR + 6 scansioni e la
      ri-esecuzione idempotente. *Precedenti (dal distillatore): `archivio/T-002`
      (CTE auth.users, superata), `archivio/T-004` (email MX reali + Confirm OFF).*
- [ ] T-008 **Riattivare Confirm email prima del lancio** — debito di T-004: in dev
      è OFF su Supabase (Auth → Providers → Email, progetto `alrguvxspssjwfmtuhdw`)
      per far girare il test signup. Prima del lancio va ON, e il flusso va
      riprovato con conferma via email reale. *Contesto: `dossier/T-004-auth-dashboard.md`.*

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

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

1. **T-007 chiuso** ✅ con prova reale — `grants.test.ts` verde. Le tre migrazioni
   `20260725000002` e `…03` sono **applicate** da te. Il test ha trovato un buco
   vero: `qr_scans_timeline` era anon-eseguibile (default-grant Supabase), ora
   revocato. **L-001 convertita `→ test`**: il cricchetto è sbloccato.
2. **Decisione dovuta — L-002 a `→ regola` da 3 sessioni** («test auth: email con
   MX reali `@shaer.it`»). Due vie: a) **→ hook** che blocca `@example.com` nei
   `*.test.ts` con `signUp`; b) **ritiro** (è già abitudine, nessun test la viola).
   **Consiglio (b)**: convenzione di una riga già rispettata, l'hook è più peso
   che valore. Dimmi quale.
3. **T-009 pronto** — provare il seed: crea `dev@shaer.it` (dashboard Auth → Add
   user, o signup), esegui `supabase/seed.sql`, verifica. Piano in `dossier/T-009`.
4. **Nota deploy**: in prod impostare `NEXT_PUBLIC_SITE_URL`. **T-008**: Confirm
   email ON su Supabase prima del lancio.
5. **Prompt prossima sessione** (da `D:\Desktop\Shaer.it`):
   > /apertura. Coda: **T-009** (provare `supabase/seed.sql`) + decidere L-002.
   > Chiudi con /chiusura.
