# TODO

**Saldo: 10 aperti — 8 nuovi (T-016, T-017, T-018, T-020, T-024, T-025, T-026, T-028), 2 riportati (T-022 `↻1`, T-008 `↻3`)**  ·  18 chiusi (T-001…T-005 il 2026-07-24; T-006, T-007, T-009, T-010 il 2026-07-25; T-011, T-013, T-012 il 2026-07-26; T-014, T-015, T-019, T-021, T-023 il 2026-07-27; T-027 il 2026-07-28)

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

- [ ] T-024 **Harness di verifica auth (SSR cookie → route Next)** (nuovo) `M` — dal distillatore,
      **4ª recidiva** del muro «comportamento dietro auth non testabile in-browser» (T-015, T-019,
      T-021, T-023). Test d'integrazione: `signInWithPassword` → inietta i cookie Supabase-SSR in un
      `fetch` verso `/dashboard`, `/dashboard/qr/[short_code]` e la landing → asserisce le stringhe
      chiave (KPI, «Dashboard»/«Esci», titoli widget). Chiude il → test del pattern; il browser resta
      solo per il pixel. Precedente: `apps/qr/lib/auth.test.ts`, `dossier/PATTERN.md` (riga muro-auth).

## Ecosistema — preparazione (nuovo livello)

*Shaer.it = super-piattaforma; il QR è il Modulo 0. Radice `MD/ecosistema/MDD.md` v1.3;
decisioni **E-D-01…E-D-16** (§12); roadmap a blocchi §10. Analisi in `dossier/T-025-ecosistema-fondazione.md`.*

- [ ] T-025 **PRD di ecosistema — riempire lo skeleton** `C` — `MD/ecosistema/PRD.md` v0.1
      (EE1…EE14). Riempire con requisiti + criteri **testabili**. Precede il SAD.
- [ ] T-026 **SAD di ecosistema** `C` — confini: ledger partita doppia + pool/escrow (E-D-16),
      TXN engine, RBAC admin-first (E-D-13), **parametri ③ ibrido** (E-D-09). Consuma T-025.
- [ ] T-028 **Analisi completa + blocchi eseguibili** `C` — stabilisce→consuma per B1…B12 (§10),
      decompone **F1** in task. Consuma MDD §10 + T-025/026. Prompt sotto.

## Riportati

- [>] T-022 **Fuso orario del cliente + granularità Giorno/Ora** `↻1` `C` — **blocchi A+B+C fatti e
      provati** (2026-07-27c): **A** tabella `profiles` (→ **D-014**); **B** funzioni TZ-aware
      (`dashboard.test`); **C** wiring — le pagine leggono `profiles.timezone` e lo passano, foglia
      client `timezone-sync` + server action `saveTimezone` (auth interna, guardia 'solo se UTC',
      chiude il debito `updated_at`), validazione in `lib/timezone.ts`. Prove: **23/23** unit +
      `profiles.test` C + **`next build` verde** + revisore approvato. Il **rendering nel fuso locale
      è `[~]`** (dietro auth → eyeball di Nick o T-024). Resta solo **D** (toggle Giorno/Ora, "7h"
      resta). Piano in `dossier/T-022-fuso-cliente.md`. Condivide la fondazione con T-016.

## Fatto

*(Il **saldo** dei chiusi vive nella riga di testata di questo file. La **prova
completa** — esito, valore misurato, riferimento — è nel libro mastro
`memoria/REGISTRO.md` (append-only, non caricato all'avvio) e nel dossier
archiviato in `dossier/archivio/T-NNN-*.md`. Qui non si ripete: era costo di
contesto a ogni sessione per informazione che REGISTRO già conserva. — potato
2026-07-27, opzione A.)*

**Chiusi (18):** T-001…T-007, T-009…T-015, T-019, T-021, T-023, T-027 → `memoria/REGISTRO.md`

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

**Sessione 2026-07-28 — pivot d'ecosistema, visione approvata.** Shaer.it = super-piattaforma, il QR è
il **Modulo 0**. Fatto (solo doc, niente codice): `MD/` ristrutturato (`ecosistema/` + `modulo-qr/`);
**MDD** v1.4 approvato (`MD/ecosistema/MDD.md`); **PRD** skeleton; **16 decisioni E-D-01…E-D-16 promosse
in `DECISIONI.md`** (T-027 chiuso). Scritto il hook `pre-commit §12` (L-010: ancora di STATO valida).
**Tocca a te:** i 3 nodi impl. §13 — **architettura parametri ③**, **dashboard cliente**, **privacy tracking
trasporto** — vanno chiusi prima di costruire F1. `[N]` del Modulo 0 valide: **N-f** (Stripe) · **T-008**.

## Prossima sessione — prompt da lanciare 

*(standing: dopo ogni `/chiusura` questa sezione porta il prompt pronto — `lavoro.md` §8-quater)*

```
/apertura. Shaer.it = super-piattaforma, il QR è il Modulo 0. Radice: MD/ecosistema/MDD.md v1.3
(decisioni E-D-01…E-D-16, roadmap a blocchi §10). PRD skeleton: MD/ecosistema/PRD.md (EE1…EE14).
Dominio economico: MD/SHAER_MASTER.md. Rif. funzionali: Struttura/Schema/Shaer_it_Simulatore_MVP_v5.html +
gemello D:\Desktop\I Damascati\Code\Sito\damascati. Analisi calda: dossier/T-025-ecosistema-fondazione.md.

Obiettivo — analisi completa e blocchi (T-028):
1) Se Nick conferma la visione → promuovi E-D-01…E-D-16 in memoria/DECISIONI.md col perché (T-027).
2) Per ogni blocco B1…B12 (§10) dichiara STABILISCE/CONSUMA (lavoro.md §4), ordina F1 (irreversibile primo);
   gate incongruenza su ogni scelta strutturale (stratega: 3 opzioni costate).
3) Decomponi F1 in task e scrivili in TODO (solo crescita). 4) Riempi il PRD da EE1 (Identità/RBAC) ed EE3 (Ledger/escrow).
Nodi da chiudere prima: parametri ③ (E-D-09) · dashboard cliente · privacy trasporto (E-D-06).
Non toccare apps/qr/ (Modulo 0 in produzione). Chiudi con /chiusura.
```
