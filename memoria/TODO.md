# TODO

**Saldo: 1 aperto — T-008 (preesistente)**  ·  9 chiusi (T-001…T-005 il 2026-07-24; T-006, T-007, T-009, T-010 il 2026-07-25)

Stati: `[ ]` da fare · `[~]` scritto ma non provato · `[A]` provato e accettato ·
`[x]` fatto con prova · `[>]` riportato (con `↻` e il suo dossier)

**Questo file non si riscrive mai.** È un saldo, non una fotografia: cresce per
task nuovi, cala solo per task arrivati a destinazione **con prova** — fatto
(→REGISTRO) · archiviato (→DECISIONI, col perché) · riportato (resta, `↻`+1).
Senza destinazione, una riga rientra.
A **`↻3`** ci si ferma e si porta il task a Nick con due o tre vie d'uscita.
Solo la sezione «Per Nick» si sostituisce.

## Ora

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
- [x] T-009 **Fixture dev seed provata** (3 QR + 6 scansioni) · 2026-07-25 · `archivio/T-009-seed-dev-fixture.md`
- [x] T-010 **Deploy produzione** (qr.shaer.it online) · 2026-07-25 · `archivio/T-010-deploy-produzione.md`

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

1. **L'app è ONLINE** ✅ — `https://qr.shaer.it` (login 200, deploy verde). Il 500
   era lo scope `Development` su `NEXT_PUBLIC_SUPABASE_URL` e `_SITE_URL`: corretto
   a Production. Repo `github.com/Crik0x/shaer.it`. T-009 (seed) e T-010 (deploy)
   chiusi con prova.
2. **Scan reale dal telefono** — apri `qr.shaer.it`, accedi, crea/apri un QR e
   scansionalo col telefono: ora deve risolvere davvero (non più localhost). È
   l'ultima prova che manca.
3. **T-008 (pre-lancio)**: su Supabase (progetto `alrguvxspssjwfmtuhdw`) →
   Auth → Confirm email **ON**, e aggiungi `https://qr.shaer.it/auth/callback` ai
   **Redirect URLs** (senza, magic link/callback si rompono in prod).
4. **Decisione ancora dovuta — L-002** («test auth: email MX reali `@shaer.it`»,
   `→ regola` da 3 sessioni). Due vie: a) **→ hook** che blocca `@example.com` nei
   `*.test.ts`; b) **ritiro** (già abitudine). **Consiglio (b)**. Dimmi quale.
5. **Prompt prossima sessione** (da `D:\Desktop\Shaer.it`):
   > /apertura. Coda: provare lo **scan reale dal telefono** su `qr.shaer.it`;
   > **T-008** (Confirm email ON + Redirect URL callback); decidere **L-002**.
   > Chiudi con /chiusura.
