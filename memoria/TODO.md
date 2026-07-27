# TODO

**Saldo: 8 aperti — 7 nuovi (T-016, T-017, T-018, T-020, T-021, T-022, T-023), 1 riportato (T-008 `↻3`)**  ·  15 chiusi (T-001…T-005 il 2026-07-24; T-006, T-007, T-009, T-010 il 2026-07-25; T-011, T-013, T-012 il 2026-07-26; T-014, T-015, T-019 il 2026-07-27)

Stati: `[ ]` da fare · `[~]` scritto ma non provato · `[A]` provato e accettato ·
`[x]` fatto con prova · `[>]` riportato (con `↻` e il suo dossier) ·
`[N]` **azione di Nick** (porta il come-fare; si **rimuove** a conferma — `lavoro.md` §8-ter)

**Questo file non si riscrive mai.** È un saldo, non una fotografia: cresce per
task nuovi, cala solo per task arrivati a destinazione **con prova** — fatto
(→REGISTRO) · archiviato (→DECISIONI, col perché) · riportato (resta, `↻`+1).
Senza destinazione, una riga rientra.
A **`↻3`** ci si ferma e si porta il task a Nick con due o tre vie d'uscita.
Solo la sezione «Per Nick» si sostituisce.

## Da te — azioni `[N]` (col come-fare, si rimuovono a conferma)

- [N] **N-f · Chiavi Stripe nei secret Vercel** (sblocca l'implementazione di T-016) — in
      **Vercel › progetto qr › Settings › Environment Variables**, ambiente **Production**:
      1. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = la `pk_live_…` (già fornita: sicura lato client).
      2. `STRIPE_SECRET_KEY` = la tua `sk_live_…` — **prendila dalla dashboard Stripe e incollala
         solo qui, mai in chat né nel repo**.
      3. `STRIPE_WEBHOOK_SECRET` = `whsec_…` — te lo dò io quando implemento il webhook (dopo).
      → poi scrivi «N-f fatto» (le prime due bastano per partire).

- [N] **T-008 · Progetto Supabase prod separato (Confirm email ON)** `↻3` — deciso (2026-07-26c):
      **non** accendere Confirm email su `alrguvxspssjwfmtuhdw` (romperebbe i test d'integrazione).
      Passi: **Dashboard Supabase › New project** («shaer-qr-prod», stessa region) → **Authentication
      › Providers › Email**: *Confirm email* **ON** → copia URL + anon key + service key nei secret
      Vercel (ambiente Production) → applica le migrazioni `0001`+`0002` nel SQL editor del nuovo
      progetto. Dettaglio in `dossier/archivio/T-004-auth-dashboard.md`. → poi scrivi «T-008 fatto».

## Ora

- [ ] T-016 **Piano free/pro + metering** (nuovo) `C` 💰 — ≤100 scansioni/mese gratis, oltre
      si bloccano **analisi+export+nuovi QR**, **mai il redirect** (D-009, regola 7). Include
      export **PDF** (feature pro). Provider = **Stripe** (D-011; chiavi in env via N-f). **Prima
      di costruire**: metering derivato vs materializzato, fuso del mese, comportamento a quota.
      Piano e nodi in **`dossier/T-016-piano-free-pro.md`**. Precede T-020. Precedente: **T-007**.

- [ ] T-017 **Restyling densità dashboard** (nuovo) `M` — spazi/gerarchia/griglia dei widget,
      solo token (regola 8), Server Components. Riferimento = **`D:\Desktop\Arkés\arkes_dashboard_v3.html`**
      (D-012): si prende la **struttura**, non la palette. Leggere quel file all'apertura del task.
      Precedente: **T-011** (respinto per estetica). Piano in **`dossier/T-017-restyling-dashboard.md`**.

- [ ] T-018 **Editor QR avanzato** (nuovo) `M` — più tipi/opzioni + branding + `purpose`/`parent_id`;
      punto d'aggancio dello slug (T-020). Verificare Roadmap M2–M5 prima. Precedente: **T-005**.
      Piano in **`dossier/T-018-editor-qr-avanzato.md`**.

- [ ] T-020 **Slug custom + @tag utente** (nuovo) `C` ⚠️ — pro, 2€/mese/link, immutabile in vita,
      riassegnabile se cancellato (D-010, eccezione regola 7). **Consuma T-016** (va dopo). Routing
      @tag e delete/scansioni orfane = nodi aperti. Piano in **`dossier/T-020-slug-custom-tag.md`**.

- [ ] T-021 **Nav consapevole del login (landing + logout)** (nuovo) `M` — bug segnalato da Nick
      (2026-07-27b): da **loggato** la homepage mostra ancora **Login/Registrati**; deve mostrare
      **«Dashboard»** e un **Logout** raggiungibile. Rendere la nav della landing consapevole della
      sessione (`serverSupabase().auth.getUser()`), Server Component; il logout riusa
      `app/auth/signout`. Precedente: **T-004** (auth), **T-011** (landing). Aprire `dossier/T-021-nav-auth.md`.

- [ ] T-022 **Fuso orario del cliente + granularità Giorno/Ora** (nuovo) `M` — bug/decisione
      (D-013, risposta di Nick su T-006): oggi le analitiche mostrano **UTC**; il cliente deve vedere
      il **suo fuso**. Il dato resta UTC (funzioni pure invariate), la **conversione è solo di
      presentazione** → foglia `'use client'` con Intl (TZ del browser) o cookie di TZ. Timeline:
      **Giorno default + toggle Ora**. Tocca dashboard aggregata **e** singolo QR. Aprire `dossier/T-022-fuso-cliente.md`.

- [ ] T-023 **Selettore periodo senza ricaricare/saltare in cima** (nuovo) `M` — bug (Nick 2026-07-27b):
      cambiare **Periodo** fa un full-reload che riporta la vista in cima. Passare a navigazione
      client-side (o scroll-restoration) mantenendo il param `?d=` e i Server Component per il dato.
      Tocca dashboard aggregata **e** `dashboard/qr/[short_code]`. Aprire `dossier/T-023-selettore-no-reload.md`.

## Riportati

## Fatto

*(Il **saldo** dei chiusi vive nella riga di testata di questo file. La **prova
completa** — esito, valore misurato, riferimento — è nel libro mastro
`memoria/REGISTRO.md` (append-only, non caricato all'avvio) e nel dossier
archiviato in `dossier/archivio/T-NNN-*.md`. Qui non si ripete: era costo di
contesto a ogni sessione per informazione che REGISTRO già conserva. — potato
2026-07-27, opzione A.)*

**Chiusi (15):** T-001…T-007, T-009…T-015, T-019 → `memoria/REGISTRO.md`

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

**Sessione 2026-07-27b — chiusa.** Confermate **N-a** e **N-b** (rimosse); **T-019 chiuso**
(il tuo eyeball conferma rendering e navigazione → REGISTRO). Decisioni incise: **D-011**
Stripe, **D-012** riferimento estetico Arkés, **D-013** fuso cliente + granularità Giorno/Ora.
I tuoi problemi sono diventati task: **T-021** (nav login/logout landing), **T-022** (fuso
cliente), **T-023** (selettore senza reload). `[N]` aperte residue: **N-f** (chiavi Stripe in
Vercel) · **T-008** (Supabase prod).

## Prossima sessione — prompt da lanciare

*(standing: dopo ogni `/chiusura` questa sezione porta il prompt pronto — `lavoro.md` §8-quater)*

```
/apertura. Sequenza consigliata: prima i tre bug rapidi dal feedback di Nick —
T-021 (nav landing consapevole del login: pulsante Dashboard + logout quando loggato),
T-023 (selettore Periodo senza full-reload/scroll-jump), T-022 (fuso del cliente in
display, dato resta UTC; timeline Giorno + toggle Ora, D-013). Poi, se resta budget,
T-016 (piano free/pro, provider Stripe D-011: chiavi via N-f) prima di T-020. Chiudi con /chiusura.
```
