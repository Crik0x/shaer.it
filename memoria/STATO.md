# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `e384b63`

## Dove siamo

Sessione 2026-07-27: **T-014 e T-015 chiusi**, entrambi provati. La dashboard
analitica è **completa lato aggregato**: geo (paese/città), OS, lingua, **unici
stimati**, **heatmap** giorno×ora, **export CSV** owner-scoped, **consigli
automatici** deterministici, e un **selettore periodo** (7/30/60/120/360g + orario
7g) che governa tutti i widget. Tutte le aggregazioni sono **funzioni pure** in
`lib/dashboard.ts`, suite **52/52 verde**, tsc pulito. Revisore **approvato**;
rilievo CSV/formula-injection **risolto** in chiusura (apostrofo guida in `csvField`
+ test). Nick ha applicato la migrazione **0002** e impostato **VISITOR_SALT** su
Vercel. Il feedback di Nick ha aperto **cinque task nuovi** (T-016…T-020).

## Cosa esiste

- **Dashboard arricchita (T-014)**: widget geo/os/lingua/unici/heatmap/consigli +
  export CSV. Motore puro in `lib/dashboard.ts` (`uniqueCount`, `hourDayMatrix`,
  `toCsv` anti-injection, `insights` con soglie `INSIGHT`), test in `dashboard.test.ts`.
  Route export `app/dashboard/export.csv/route.ts` (owner-scoped RLS + `auth.getUser`,
  `visitor_hash` escluso). **RPC `qr_breakdown`/`qr_uniques` NON costruita**: derivazione
  in-JS come per device/browser (owner-scoped da RLS), RPC rimandata a scala.
- **Selettore periodo (T-015)**: `PERIODS` + query param `?d=`, Server Component, zero
  JS. `hourlyBuckets` (168 barre) per la vista oraria. Trend 7g disaccoppiato con 2 count query.
- **Albero di QR + rollup (T-012)**, **landing luxury (T-011)**, **corpus MD/ (T-013)**.
- DB Supabase `alrguvxspssjwfmtuhdw` (dev). 0001 **e 0002** applicate. VISITOR_SALT su Vercel.
- Pre-commit: §7–§11 (nuovo **§11**: avviso decisione [LOCKED] senza D-NNN in DECISIONI).

## Cosa NON esiste ancora

- **Verifica unici in produzione** `[~]`: in locale `visitor_hash` è sempre null (nessun
  IP reale) — provare su `qr.shaer.it` dopo il redeploy scansionando un QR.
- **T-016** piano free/pro (≤100 scans/mese; blocca analisi/export/nuovi QR, mai il redirect
  — D-009). Include **export PDF** (feature pro). Provider pagamento/metering da decidere.
- **T-017** restyling densità dashboard · **T-018** editor QR avanzato · **T-019** analisi
  singolo QR (riusa `lib/dashboard.ts`) · **T-020** slug custom + @tag (D-010; consuma T-016).
- **T-008 (`↻3`, deciso)**: progetto Supabase prod separato con Confirm email ON (azione Nick).

## Note operative

- **Migrazioni**: applicate da Nick nel SQL editor. 0001+0002 applicate.
- **visitor_hash**: salt SOLO da `process.env.VISITOR_SALT`; senza → null. In locale null (no IP).
- **Dashboard = derivazione in-JS** da una query owner-scoped (RLS): breakdown/geo/unici NON
  via RPC. L'RPC è l'ottimizzazione a scala, da fare quando il fetch-all pesa (vedi T-014 chiuso).
- **Export CSV**: `csvField` neutralizza `=+-@` (anti formula-injection); `visitor_hash` mai esportato.
- **Colori**: solo token (`bg-[var(--flow)]`/`var(--gold)`), mai hex brand (regola 8).
- **Recharts**: dashboard server-only (niente Recharts qui, L-004); grafici futuri `dynamic`.
- Anon key pubblica → confine = **DB**; whitelist anon `{resolve_qr, anonymize_ip}` testata (L-001).
- La cwd della tool Bash non persiste: path assoluti. Test: `node --test [--env-file=.env.local] lib/*.test.ts`.
- Decisioni nuove: **D-009** (soglia piano), **D-010** (slug/regola-7) in `DECISIONI.md`.
