# TODO

**Saldo: 2 aperti — 2 nuovi, 0 riportati**  ·  6 chiusi (T-001…T-005 il 2026-07-24, T-006 il 2026-07-25)

Stati: `[ ]` da fare · `[~]` scritto ma non provato · `[A]` provato e accettato ·
`[x]` fatto con prova · `[>]` riportato (con `↻` e il suo dossier)

**Questo file non si riscrive mai.** È un saldo, non una fotografia: cresce per
task nuovi, cala solo per task arrivati a destinazione **con prova** — fatto
(→REGISTRO) · archiviato (→DECISIONI, col perché) · riportato (resta, `↻`+1).
Senza destinazione, una riga rientra.
A **`↻3`** ci si ferma e si porta il task a Nick con due o tre vie d'uscita.
Solo la sezione «Per Nick» si sostituisce.

## Ora

- [ ] T-007 **Hardening: grant anon + fixture seed** — (1) test sui grant reali
      (`pg_proc`/`information_schema`) che fallisce se una tabella/funzione diventa
      anon-accessibile fuori da una whitelist (oggi solo `resolve_qr`, `anonymize_ip`)
      — meccanizza L-001; (2) `supabase/seed.sql` versionato con CTE utente-dev + QR
      di prova, così il seed non si ri-deriva. *Nasce dai pattern di `dossier/PATTERN.md`.*
      *Precedente: `dossier/archivio/T-006` (Composizione) — `qr_scans_timeline`
      (migrazione `20260725000001`) è grant SOLO `authenticated`, MAI `anon`: va
      trattata FUORI dalla whitelist anon, non scoperta da zero.*
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

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

1. **T-006 chiuso** ✅ — analytics timeline provata end-to-end. Provala tu: login →
   apri un QR con scansioni → pannello «Scansioni» in fondo, toggle Giorno/Ora.
   QR di prova già popolato (3 scansioni): utente `t006ui.20260725@shaer.it`,
   QR `ukqz91uh`. La migrazione `20260725000001_qr_scans_timeline.sql` è **applicata**.
2. **Decisione dovuta — L-001 a `→ regola` da 3 sessioni** (soglia del cricchetto).
   È vera e importante (confine di sicurezza = DB). Due vie:
   a) *la converto ora io* scrivendo il test grant reali come task a sé — ma è
      esattamente T-007, che duplicheremmo;
   b) *la tengo legata a T-007* (già in coda, target esplicito) e sblocco il
      cricchetto quando T-007 chiude. **Consiglio (b)**: il controllo esiste già
      come task, convertirla ora significherebbe solo anticipare T-007.
3. **Nota deploy** (invariata): in produzione va impostata `NEXT_PUBLIC_SITE_URL`
   (oggi fallback `localhost:3000`), altrimenti i QR codificano l'indirizzo locale.
4. **Debito aperto T-008**: prima del lancio Confirm email torna ON su Supabase.
5. **Prompt prossima sessione** (da dentro `D:\Desktop\Shaer.it`):
   > /apertura. Coda: **T-007** (hardening: test sui grant anon reali che
   > meccanizza L-001 + `supabase/seed.sql` versionato). Chiudi con /chiusura.
