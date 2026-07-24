# TODO

**Saldo: 4 aperti — 4 nuovi, 0 riportati**  ·  4 chiusi il 2026-07-24 (T-001, T-002, T-003, T-004)

Stati: `[ ]` da fare · `[~]` scritto ma non provato · `[A]` provato e accettato ·
`[x]` fatto con prova · `[>]` riportato (con `↻` e il suo dossier)

**Questo file non si riscrive mai.** È un saldo, non una fotografia: cresce per
task nuovi, cala solo per task arrivati a destinazione **con prova** — fatto
(→REGISTRO) · archiviato (→DECISIONI, col perché) · riportato (resta, `↻`+1).
Senza destinazione, una riga rientra.
A **`↻3`** ci si ferma e si porta il task a Nick con due o tre vie d'uscita.
Solo la sezione «Per Nick» si sostituisce.

## Ora

- [ ] T-005 **Generatore QR** — creazione QR con URL target, salvataggio,
      download PNG/SVG; il canvas di personalizzazione entra con `dynamic import`.
      *Precedente: `dossier/archivio/T-002` — l'insert di `qr_codes` passa da client
      autenticato (owner_id lato server), mai anon; `short_code` immutabile via trigger.*
- [ ] T-006 **Analytics prima lettura** — timeline scansioni per QR (derivata da
      `qr_scans`, mai contatori memorizzati), grafico Recharts in `dynamic import`.
      *Precedente: `dossier/archivio/T-003` — l'anon non legge `qr_scans` (RLS): leggere
      con client autenticato owner-scoped; l'IP è già anonimizzato a livello DB.*
- [ ] T-007 **Hardening: grant anon + fixture seed** — (1) test sui grant reali
      (`pg_proc`/`information_schema`) che fallisce se una tabella/funzione diventa
      anon-accessibile fuori da una whitelist (oggi solo `resolve_qr`, `anonymize_ip`)
      — meccanizza L-001; (2) `supabase/seed.sql` versionato con CTE utente-dev + QR
      di prova, così il seed non si ri-deriva. *Nasce dai pattern di `dossier/PATTERN.md`.*
- [ ] T-008 **Riattivare Confirm email prima del lancio** — debito di T-004: in dev
      è OFF su Supabase (Auth → Providers → Email, progetto `alrguvxspssjwfmtuhdw`)
      per far girare il test signup. Prima del lancio va ON, e il flusso va
      riprovato con conferma via email reale. *Contesto: `dossier/T-004-auth-dashboard.md`.*

## Riportati

## Fatto

- [x] T-001 **Scaffold dell'app** · 2026-07-24 · Next 16.2.11 + Tailwind v4 +
      shadcn in `apps/web/`. Prova: `GET :3000/` → 200 `<title>Create Next App</title>`.
      Dossier: `dossier/archivio/T-001-scaffold-app.md`.
- [x] T-002 **Schema Supabase + RLS** · 2026-07-24 · `qr_codes`/`qr_scans` +
      owner_id + RLS + `resolve_qr`, versionato in `supabase/migrations/`. Prova:
      anon `[]`/`resolve_qr('nope')=null`/insert scans `42501`. Dossier: `archivio/T-002`.
- [x] T-003 **Redirect dinamico** · 2026-07-24 · `/r/[short_code]` → 302/404,
      scansione loggata (count 3), IP anonimizzato lato DB (`anonymize_ip`), 6/6 test,
      revisore approvato. Dossier: `archivio/T-003-redirect-dinamico.md`.
- [x] T-004 **Auth + dashboard scheletro** · 2026-07-24 · email+password + magic
      link via `@supabase/ssr`, proxy di protezione, dashboard Server Components
      owner-scoped. Prova: test `lib/auth.test.ts` verde 1/1 (signup dà sessione,
      utente nuovo vede count=0 su qr_codes/qr_scans → RLS, login ok); route login
      200 / dashboard 307→login / `/r` 302; revisore approvato. Dossier:
      `archivio/T-004-auth-dashboard.md`.

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

1. **T-004 chiuso** ✅ — test auth `lib/auth.test.ts` verde. Su Supabase ora Email
   provider ON + Confirm email OFF (per dev). **Debito aperto T-008**: prima del
   lancio Confirm email torna ON.
2. **Prova visiva facoltativa**: `http://localhost:3000/login` → registrati →
   vieni rediretto in `/dashboard` → «Esci» torna al login.
3. **Prompt prossima sessione** (da dentro `D:\Desktop\Shaer.it`):
   > /apertura. Coda: **T-005** (generatore QR: URL target, salvataggio, download
   > PNG/SVG; canvas in dynamic import). Chiudi con /chiusura.
