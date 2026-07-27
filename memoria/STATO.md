# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `d09a46c`

## Dove siamo

Sessione 2026-07-27b (autonoma) **chiusa**: implementato e **chiuso T-019** (analisi
singolo QR, `dashboard/qr/[short_code]` in derivazione-in-JS scoped a `qr_id`, riuso
di `lib/dashboard.ts` + rollup own/sottoalbero) — `dashboard.test` 16/16, tsc, revisore
approvato, **eyeball di Nick** conferma rendering+navigazione. Nick ha confermato N-a/N-b
e dato le decisioni: **D-011** Stripe (T-016), **D-012** riferimento estetico Arkés (T-017),
**D-013** fuso del cliente in display + granularità Giorno/Ora (T-006). I suoi problemi
sono diventati **T-021** (nav landing login/logout), **T-022** (fuso cliente), **T-023**
(selettore senza reload). Metodo nuovo: **§8-ter** (stato `[N]`), **§8-quater** (prompt da
lanciare sempre in TODO dopo la chiusura), hook §8 valida il dominio di `stato` (L-009).

## Cosa esiste

- **Dashboard aggregata (T-014/T-015)**: motore puro in `lib/dashboard.ts` (`groupCount`,
  `uniqueCount`, `hourDayMatrix`, `toCsv` anti-injection, `insights`), test `dashboard.test.ts`
  16/16. Widget geo/os/lingua/unici/heatmap/consigli + **export CSV** owner-scoped
  (`app/dashboard/export.csv/route.ts`, `visitor_hash` escluso) + **selettore periodo** `?d=`
  (7/30/60/120/360g + orario 7g a 168 barre), Server Component zero-JS.
- **Analisi singolo QR (T-019, chiuso)**: `app/dashboard/qr/[short_code]/page.tsx` scoped a
  `qr_id`, stessi widget dell'aggregata (dossier in `dossier/archivio/`).
- **Albero di QR + rollup (T-012)**, **landing luxury (T-011)**, **corpus MD/ (T-013)**.
- Pre-commit §7–§11 attivo (§8 valida il dominio di `stato`; §11 avvisa [LOCKED] senza D-NNN).

## Cosa NON esiste ancora

- **Bug dal feedback (M)**: **T-021** nav landing consapevole del login (Dashboard+logout quando
  loggato) · **T-023** selettore periodo senza full-reload/scroll-jump · **T-022** fuso del cliente
  in display (dato resta UTC) + timeline Giorno/Ora (D-013). Sequenza consigliata: vedi prompt in TODO.
- **T-016** piano free/pro (D-009; Stripe D-011, chiavi via N-f) · **T-017** restyling (ref Arkés
  D-012) · **T-018** editor QR · **T-020** slug+@tag (D-010; consuma T-016).
- **Azioni di Nick `[N]`** in `TODO.md` § «Da te»: **N-f** chiavi Stripe in Vercel · **T-008**
  Supabase prod separato (Confirm email ON).

## Note operative

- **Dashboard = derivazione in-JS** da query owner-scoped (RLS): breakdown/geo/unici NON via RPC;
  l'RPC è l'ottimizzazione a scala (T-014). La pagina singolo-QR (T-019) segue lo stesso schema.
- **visitor_hash**: salt SOLO da `process.env.VISITOR_SALT`; senza → null (in locale sempre null, no IP).
- DB dev `alrguvxspssjwfmtuhdw`, 0001+0002 applicate. Decisioni **D-009…D-013** in `DECISIONI.md`.
- **Stripe**: publishable key → env `NEXT_PUBLIC_…`; secret key mai in repo/chat, solo Vercel.
- cwd della tool Bash non persiste: **path assoluti**. Test: `node --test [--env-file=.env.local] lib/*.test.ts`.
