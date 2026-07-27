# TODO

**Saldo: 9 aperti — 7 nuovi (T-016, T-017, T-018, T-020, T-021, T-023, T-024), 2 riportati (T-022 `↻1`, T-008 `↻3`)**  ·  15 chiusi (T-001…T-005 il 2026-07-24; T-006, T-007, T-009, T-010 il 2026-07-25; T-011, T-013, T-012 il 2026-07-26; T-014, T-015, T-019 il 2026-07-27)

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

- [~] T-021 **Nav consapevole del login (landing + logout)** (nuovo) `M` — **codice fatto**
      (2026-07-27c): `site-header.tsx` reso async + consapevole della sessione (Dashboard + form
      logout `/auth/signout` da loggato; Accedi/Registrati da anonimo). tsc verde, revisore
      approvato, logged-out eyeballed. `[~]`: manca solo l'**eyeball del ramo loggato** (dietro auth,
      Claude non autentica → § Per Nick). Dossier `dossier/T-021-nav-auth.md`.

- [~] T-023 **Selettore periodo senza ricaricare/saltare in cima** (nuovo) `M` — **codice fatto**
      (2026-07-27c): `scroll={false}` sui Link del periodo (dashboard aggregata + singolo QR).
      Causa reale = scroll-to-top di Next su nav soft (doc `link.md §scroll`), non un full-reload.
      Prova **documentale** + tsc + revisore. `[~]`: eyeball di Nick per promuovere. Dossier
      `dossier/T-023-selettore-no-reload.md`.

- [ ] T-024 **Harness di verifica auth (SSR cookie → route Next)** (nuovo) `M` — dal distillatore,
      **4ª recidiva** del muro «comportamento dietro auth non testabile in-browser» (T-015, T-019,
      T-021, T-023). Test d'integrazione: `signInWithPassword` → inietta i cookie Supabase-SSR in un
      `fetch` verso `/dashboard`, `/dashboard/qr/[short_code]` e la landing → asserisce le stringhe
      chiave (KPI, «Dashboard»/«Esci», titoli widget). Chiude il → test del pattern; il browser resta
      solo per il pixel. Precedente: `apps/qr/lib/auth.test.ts`, `dossier/PATTERN.md` (riga muro-auth).

## Riportati

- [>] T-022 **Fuso orario del cliente + granularità Giorno/Ora** `↻1` `C` — **blocco A fatto e
      provato** (2026-07-27c): tabella `profiles` (migrazione `20260727000001`, applicata al DB dev)
      + `profiles.test.ts` verde, RLS/L-001 ok, revisore approvato → **D-014**. Restano **B** (funzioni
      pure TZ-aware, default UTC), **C** (wiring + preferenza dal browser + chiude il debito
      `updated_at`), **D** (toggle Giorno/Ora). **Piano completo e pronto** in
      `dossier/T-022-fuso-cliente.md`. Precede/condivide la fondazione con T-016.

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

**Sessione 2026-07-27c — chiusa.** **Serve il tuo eyeball su :3000** per chiudere T-021 e T-023
(codice fatto + revisore ok, ma dietro auth Claude non verifica): (1) da **loggato** la homepage
mostra **Dashboard + Esci**? (2) cambiando **Periodo** la vista **non salta in cima**? Rispondi e li
chiudo a `[A]`. **T-022 blocco A provato** (tabella `profiles` applicata da te → `profiles.test`
verde) → **D-014**; B/C/D nel dossier. Nato **T-024** (harness auth: 4ª recidiva).
`[N]` residue: **N-f** (Stripe in Vercel) · **T-008** (Supabase prod, `↻3`).

## Prossima sessione — prompt da lanciare

*(standing: dopo ogni `/chiusura` questa sezione porta il prompt pronto — `lavoro.md` §8-quater)*

```
/apertura. Se Nick ha confermato gli eyeball (Dashboard+Esci da loggato; Periodo senza salto),
chiudi T-021 e T-023 a [A]→REGISTRO. Poi prosegui T-022 (fondazione profiles già applicata, D-014):
blocchi B (funzioni pure TZ-aware con param timeZone, default UTC; +casi in dashboard.test.ts),
C (wiring + preferenza dal browser; chiude il debito updated_at) e D (toggle Giorno/Ora, "7h" resta)
— piano completo nel dossier T-022. Valuta T-024 (harness auth) prima di altri task scoped-utente,
evita il 5° [~]. Chiudi con /chiusura.
```
