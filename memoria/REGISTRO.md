# Registro

Libro mastro append-only. Gli id `T-NNN` sono immutabili. **Non si carica
all'avvio**: si apre solo per audit o per ritrovare una prova.

Invariante verificata dall'hook pre-commit: **ogni `T-NNN` senza esito deve
comparire in `TODO.md`**. Un task non può sparire da entrambi.

| id | data | task | esito | prova |
|---|---|---|---|---|
| T-001 | 2026-07-23 | Scaffold app Next.js 16 + Tailwind + shadcn in apps/web | | |
| T-002 | 2026-07-23 | Progetto Supabase dedicato + migrazione qr_codes/qr_scans con RLS | | |
| T-003 | 2026-07-23 | Redirect dinamico /r/[short_code] con log scansione append-only | | |
| T-004 | 2026-07-23 | Auth magic link + scheletro dashboard | | |
| T-005 | 2026-07-23 | Generatore QR con download PNG/SVG | | |
| T-006 | 2026-07-23 | Analytics: timeline scansioni derivata, grafico Recharts | | |
