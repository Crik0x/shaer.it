# Registro

Libro mastro append-only. Gli id `T-NNN` sono immutabili. **Non si carica
all'avvio**: si apre solo per audit o per ritrovare una prova.

Invariante verificata dall'hook pre-commit: **ogni `T-NNN` senza esito deve
comparire in `TODO.md`**. Un task non può sparire da entrambi.

| id | data | task | esito | prova |
|---|---|---|---|---|
| T-001 | 2026-07-23 | Scaffold app Next.js 16 + Tailwind + shadcn in apps/web | fatto 2026-07-24 | `GET :3000/`→200 `<title>Create Next App</title>` · `archivio/T-001` |
| T-002 | 2026-07-23 | Progetto Supabase dedicato + migrazione qr_codes/qr_scans con RLS | fatto 2026-07-24 | migrazione live · anon `[]`/`resolve_qr('nope')=null`/insert scans 42501 · `archivio/T-002` |
| T-003 | 2026-07-23 | Redirect dinamico /r/[short_code] con log scansione append-only | fatto 2026-07-24 | `/r/demo123`→302, `/r/x`→404, scans count 3, IP anon lato DB, 6/6 test, revisore ok · `archivio/T-003` |
| T-004 | 2026-07-23 | Auth magic link + scheletro dashboard | fatto 2026-07-24 | test `lib/auth.test.ts` verde 1/1 (signup→sessione, RLS count=0, login ok) · login 200/dashboard 307→login/`/r` 302 · revisore ok · `archivio/T-004` |
| T-005 | 2026-07-23 | Generatore QR con download PNG/SVG | | |
| T-006 | 2026-07-23 | Analytics: timeline scansioni derivata, grafico Recharts | | |
| T-007 | 2026-07-24 | Hardening: test grant anon + fixture supabase/seed.sql | | |
| T-008 | 2026-07-24 | Riattivare Confirm email su Supabase prima del lancio (debito di T-004) | | |
