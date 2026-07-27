# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `d09a46c`

## Dove siamo

Sessione 2026-07-27b (autonoma): implementato **T-019** (analisi singolo QR) come
**pura composizione** del motore di T-014 — `app/dashboard/qr/[short_code]/page.tsx`
riscritta in derivazione-in-JS con KPI, consigli, selettore periodo, timeline,
breakdown device/browser/OS/lingua, geo, heatmap e **rollup own/sottoalbero**,
filtrando le scansioni su `qr_id`. Prova: `dashboard.test` 16/16, tsc pulito, route
`307→/login` (compila sotto Next); rimossi i 2 componenti superati
(`analytics-panel`/`analytics-chart`). **T-019 resta `[~]`**: manca il solo eyeball
loggato (magic-link non automatizzabile). Metodo: potato l'indice «Fatto» in TODO
(opzione A, −1446 byte); nuova regola **§8-ter** = stato `[N]` per le azioni di Nick
(col come-fare, si rimuovono a conferma), con la sezione «Da te» in `TODO.md`.

## Cosa esiste

- **Dashboard aggregata (T-014/T-015)**: motore puro in `lib/dashboard.ts` (`groupCount`,
  `uniqueCount`, `hourDayMatrix`, `toCsv` anti-injection, `insights`), test `dashboard.test.ts`
  16/16. Widget geo/os/lingua/unici/heatmap/consigli + **export CSV** owner-scoped
  (`app/dashboard/export.csv/route.ts`, `visitor_hash` escluso) + **selettore periodo** `?d=`
  (7/30/60/120/360g + orario 7g a 168 barre), Server Component zero-JS.
- **Analisi singolo QR (T-019, `[~]`)**: `app/dashboard/qr/[short_code]/page.tsx` ricomposta
  come l'aggregata ma scoped a `qr_id` (riuso di `lib/dashboard.ts`, zero logica nuova). Manca
  solo l'eyeball loggato → `dossier/T-019-analisi-singolo-qr.md` ha il come-chiudere.
- **Albero di QR + rollup (T-012)**, **landing luxury (T-011)**, **corpus MD/ (T-013)**.
- DB Supabase `alrguvxspssjwfmtuhdw` (dev). 0001 **e 0002** applicate. VISITOR_SALT su Vercel.
- Pre-commit §7–§11 attivo (§11: avviso [LOCKED] senza D-NNN).

## Cosa NON esiste ancora

- **T-016** piano free/pro (≤100 scans/mese; blocca analisi/export/nuovi QR, mai il redirect —
  D-009; export PDF pro). Provider/metering = decisione Nick (N-c).
- **T-017** restyling densità dashboard · **T-018** editor QR avanzato · **T-020** slug custom
  + @tag (D-010; consuma T-016).
- **Azioni di Nick `[N]`** in `TODO.md` § «Da te»: **N-a** config auth Supabase · **N-b** verifica
  unici in prod · **N-c** provider T-016 · **N-d** riferimento estetico T-017 · **T-008** Supabase
  prod separato (Confirm email ON).

## Note operative

- **Dashboard = derivazione in-JS** da query owner-scoped (RLS): breakdown/geo/unici NON via RPC;
  l'RPC è l'ottimizzazione a scala (T-014). La pagina singolo-QR (T-019) segue lo stesso schema.
- **visitor_hash**: salt SOLO da `process.env.VISITOR_SALT`; senza → null (in locale sempre null, no IP).
- DB dev `alrguvxspssjwfmtuhdw`, 0001+0002 applicate. Decisioni nuove **D-009/D-010** in `DECISIONI.md`.
- cwd della tool Bash non persiste: **path assoluti**. Test: `node --test [--env-file=.env.local] lib/*.test.ts`.
