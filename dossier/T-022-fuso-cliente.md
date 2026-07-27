---
task: T-022
tier: C
titolo: Fuso orario del cliente + granularità Giorno/Ora (fondazione profiles)
aree: [analytics, dashboard, fuso, profiles, schema-supabase, rls, dati-personali]
stato: aperto
riporti: 1
sessioni: [2026-07-27b, 2026-07-27c]
---

## Obiettivo
Il cliente vede le analitiche nel **suo fuso**, non in UTC (timeline giornaliera,
heatmap, timeline oraria). Il dato resta UTC (D-013). Granularità timeline:
Giorno default + toggle Ora. Tocca dashboard aggregata **e** singolo QR.

## Accertato
- Le tre funzioni di bucketing in `apps/qr/lib/dashboard.ts` keyano **in UTC**:
  `dailyBuckets` (l.54 `toISOString().slice(0,10)`), `hourlyBuckets`
  (l.79 `slice(0,13)`), `hourDayMatrix` (l.126-127 `getUTCDay()/getUTCHours()`).
- **Non esisteva** alcuna tabella profilo: solo `qr_codes` e `qr_scans`
  (migrazione `20260724000001`). L'utente era puro `auth.users`.
- `.env.local` (apps/qr) ha **solo** anon key + URL: niente service role / DB URL
  → Claude non può applicare DDL, l'apply della migrazione è un'azione `[N]`.

## Domande e risposte
- **Q (Nick): il fuso tocca solo le label o il bucketing?** → Tocca il bucketing:
  label-only è corretto solo per la timeline oraria (barre a tempo assoluto);
  giornaliera va off-by-one al confine, heatmap sbaglia l'ora/giorno. Conseguenza:
  D-013 "funzioni pure invariate + label-only" regge solo per la timeline oraria.
- **Q: come dare al cliente il suo fuso?** → Idea di Nick: **preferenza sul
  profilo** (non cookie): nota lato server, deterministica, editabile, nessun flash.
- **Q: scope, sapendo che T-016 vuole comunque una riga per-utente?** →
  **«Fondazione profiles ora»**: tabella condivisa T-022+T-016. Accettato che è C e
  può sforare la sessione → si chiude col blocco A provato e B/C/D pianificati.

## Decisioni
- **Tabella `public.profiles`** (1:1 con auth.users, PK = owner_id) come casa
  per-utente: qui il fuso oggi, il piano/metering di T-016 domani. È la fondazione
  irreversibile che va **prima** dei suoi consumatori (§4).
- **Fuso = IANA name** (es. `Europe/Rome`), non offset: `Intl` gestisce DST e
  offset a mezz'ora. Default `'UTC'`.
- Auto-popolamento dal **browser** al primo login (`Intl…resolvedOptions().timeZone`),
  non da country/city digitati (un paese può avere più fusi; city→TZ è fragile).
  country/city restano colonne per uso futuro/editor.
- **Scartato**: cookie di TZ (flash al primo load); bucketing client-side con
  timestamp spediti al client (esce da Server Components di default, dati pesanti a
  360g); label-only (viola reg. 5/§6, analitica che mente su heatmap).

## Attriti
- **DDL non applicabile da Claude**: `.env.local` ha solo anon key + URL → l'apply
  della migrazione è un'azione `[N]` (Nick, SQL editor). Risolto: migrazione +
  test scritti, applicati da Nick, prova incassata (`profiles.test`+`grants.test`
  verdi) nello stesso giro.
- **D-013 va corretta**: la risposta di Nick e la lettura delle funzioni pure hanno
  mostrato che "label-only + funzioni pure invariate" è corretto solo per la
  timeline oraria; heatmap e giornaliera esigono bucketing TZ-aware. Conseguenza:
  D-013 si aggiorna (le pure guadagnano `timeZone`) → incisa come **D-014**.
- **Debito `updated_at`** (revisore, gravità 1): colonna senza touch-trigger.
  Migrazione già applicata → non si riscrive; si chiude nel blocco C.

## Stato dei blocchi

### Blocco A — FATTO E PROVATO (`[x]`) — sessione 2026-07-27c
- `supabase/migrations/20260727000001_profiles.sql`: tabella + RLS owner-scoped
  (select/insert/update own, niente delete) + trigger `on_auth_user_created`
  (`handle_new_user` SECURITY DEFINER, `search_path=''`, `on conflict do nothing`)
  + backfill utenti esistenti + **revoke L-001** su `handle_new_user`
  (from public, anon, authenticated).
- `apps/qr/lib/profiles.test.ts`: signup → profilo auto-creato a `'UTC'`; RLS isola
  i profili; un utente non scrive il fuso di un altro. **Verde sul DB dev** insieme
  a `grants.test.ts` (la nuova tabella con RLS non entra nella superficie anon).
- Migrazione **già applicata** al DB dev da Nick (2026-07-27c).
- **Debito noto (revisore, gravità 1)**: `updated_at` non ha trigger di
  aggiornamento → resta congelata alla creazione. Si chiude nel **blocco C**: la
  server action che scrive `timezone` setterà anche `updated_at = now()` (oppure
  una micro-migrazione col touch-trigger). La migrazione A **non si riscrive**:
  è già applicata (immutabilità).

### Blocco B — FATTO E PROVATO (`[x]`) — sessione 2026-07-27c
- `dailyBuckets/hourlyBuckets/hourDayMatrix` (`lib/dashboard.ts`) ricevono
  `timeZone: string = "UTC"` → i 16 test esistenti (senza arg) restano verdi.
  Helper `zonedFields(d, tz)` via `Intl.DateTimeFormat('en-CA', …).formatToParts`
  estrae giorno/ora/weekday **locali** (guard su `hour===24`); l'asse giornaliero
  usa un'**ancora a mezzogiorno** del giorno locale per non slittare col DST.
- `safeTimeZone(tz)`: un nome non-IANA (da `profiles.timezone` editabile) → fallback
  `'UTC'` invece del `RangeError` di Intl (rilievo revisore, gravità 1). Validato
  una volta per chiamata.
- **Prova: `dashboard.test.ts` 21/21 verde** — casi TZ: shift giornaliero
  (`23:30Z`→giorno dopo a Roma), heatmap ora+giorno spostati, `Asia/Kolkata` +5:30,
  label oraria localizzata, data invalida scartata, fuso invalido→UTC. tsc pulito,
  revisore approvato.

### Blocco C — DA FARE · wiring + preferenza
- `dashboard/page.tsx` e `dashboard/qr/[short_code]/page.tsx`: query del proprio
  `profiles.timezone` (owner-scoped, RLS) e passaggio alle funzioni B.
- Foglia `'use client'` minima che al primo login legge il fuso del browser e, se
  `profiles.timezone` è ancora `'UTC'` di default, lo salva via **server action**
  (che setta anche `updated_at = now()` → chiude il debito del blocco A).
- Editor TZ nel profilo (select IANA) — può essere un micro-task a sé.

### Blocco D — DA FARE · granularità Giorno/Ora
- Toggle sulla timeline: **Giorno default + toggle Ora**. Il periodo esistente
  "Orario · 7g" (`key:"7h"` in `page.tsx:32`) **resta** — il toggle si aggiunge
  sulle viste giornaliere (scelta incisa salvo obiezione di Nick).

## Decisione incisa
- **D-014** (2026-07-27c, `DECISIONI.md`): la tabella profiles come fondazione
  per-utente + l'aggiornamento di D-013 (le pure guadagnano `timeZone`). Scritta
  **subito** perché irreversibile e già applicata (§4/L-008), non rimandata alla
  chiusura di T-022.
