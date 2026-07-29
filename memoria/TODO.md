# TODO

**Saldo: 17 aperti — 15 nuovi (T-016, T-017, T-018, T-020, T-024, T-025, T-026, T-028, T-029…T-035), 2 riportati (T-022 `↻1`, T-008 `↻3`)**  ·  18 chiusi (T-001…T-005 il 2026-07-24; T-006, T-007, T-009, T-010 il 2026-07-25; T-011, T-013, T-012 il 2026-07-26; T-014, T-015, T-019, T-021, T-023 il 2026-07-27; T-027 il 2026-07-28)

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

## Ecosistema — preparazione (chiusa, → dettaglio in STATO/DECISIONI/SAD)

- [~] T-025 **PRD di ecosistema** `C` — assorbito: decisioni → DECISIONI (E-D-01…26); PRD **archiviato** (E-D-26).
- [~] T-026 **SAD di ecosistema** `C` — `MD/ecosistema/SAD.md` v0.1 (F1). Coda EE7–14 = JIT. Da chiudere a `/chiusura`.
- [~] T-028 **Decomposizione F1** `C` — fatto: emessi T-029…T-035 (sotto). Da chiudere a `/chiusura`.

## Ecosistema — F1 costruzione (da T-028, sequenza stabilisce→consuma)

*Dettaglio (schema, RPC, prove) in `MD/ecosistema/SAD.md` §3–8 — qui solo ordine e dipendenze, non si
ripete (E-D-26). Ogni task è **test-first** (regola 5). Codice in `apps/shaer/`+`packages/core-*`.*

- [~] T-029 **Ledger core** `C` 💰 — **p.1/2 fatta** (`e91b64e`, 8/8): motore puro. **p.2/2 = layer DB**
      (SAD §3.3/§4): migrazione + RPC `ledger_post`, `[N]`. **Prima: rispondere `Q-SOLV`** in `DOMANDE-NICK.md`
      (modello solvibilità). `journal.transaction_id` senza FK (T-031 non esiste).
- [ ] T-030 **Identità, ruoli, RBAC** `C` — SAD §3.1/4/6. **Stabilisce** `user_id`+`role`, gate verifica,
      limiti approvatore (E-D-24), vincolo ruoli/TXN (E-D-21). **Consuma** pattern RLS/definer di T-029.
- [ ] T-031 **TXN engine** `C` — SAD §3.2/4. **Stabilisce** il tronco TXN. **Consuma** T-029 (journal.txn_id) + T-030 (owner/ruoli).
- [ ] T-032 **Wallet derivato + conti utente** `M` — SAD §3.1/3.3. **Consuma** T-029 (postings) + T-030 (roles).
- [ ] T-033 **Escrow + circuito chiuso** `C` 💰 — SAD §3.3 (E-D-16/22). **Consuma** T-029 (held) + T-031 (txn).
- [ ] T-034 **Recensioni & Rank bayesiano** `M` — SAD §3.5. **Consuma** T-031 (COMPLETED).
- [ ] T-035 **Referral versionato + `param_sets`** `M` — SAD §3.4/3.5. **Stabilisce** `param_sets` (③ ibrido).
      **Consuma** T-029 (reward) + T-031 (txn).

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

*(Prova completa in `memoria/REGISTRO.md` + `dossier/archivio/`. Qui non si ripete — potato 2026-07-27.)*

**Chiusi (18):** T-001…T-007, T-009…T-015, T-019, T-021, T-023, T-027 → `memoria/REGISTRO.md`

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

**Sessione 2026-07-29 — nodi sciolti + PRD fondativo.** Hai risposto a tutte le 8 domande di
`MD/ecosistema/DOMANDE-NICK.md`: promosse in **E-D-17…E-D-25** (`DECISIONI.md`), riversate nel **PRD
v0.3** (EE1–EE7/EE10/EE12 con criteri testabili) e nell'**MDD v1.5** (§13 senza nodi aperti). Solo doc,
`apps/qr/` intatto. **Tocca a te — niente di infrastrutturale ora:** T-008 e N-f (Stripe) restano `[N]`
**pre-lancio, da NON fare adesso** (te li richiamo io al momento giusto). Il prossimo passo tecnico è
il **SAD (T-026)**, che sviluppo io. Se vuoi, alla prossima apertura dimmi solo «vai col SAD».

## Prossima sessione — prompt da lanciare 

*(standing: dopo ogni `/chiusura` questa sezione porta il prompt pronto — `lavoro.md` §8-quater)*

```
/apertura. Shaer.it = super-piattaforma, il QR è il Modulo 0. Radice: MD/ecosistema/MDD.md v1.5
(E-D-01…E-D-25, §13 senza nodi aperti). PRD: MD/ecosistema/PRD.md v0.3 (EE1–EE7/EE10/EE12 con criteri
testabili; coda EE8/9/11/13/14+NFR da scrivere). Dominio: MD/SHAER_MASTER.md. Rif.: simulatore
Struttura/Schema/Shaer_it_Simulatore_MVP_v5.html + gemello D:\Desktop\I Damascati\Code\Sito\damascati.

Obiettivo — SAD di ecosistema (T-026):
1) Confini tecnici da PRD+decisioni: ledger partita doppia + escrow (E-D-16/22), TXN engine (stati
   append-only), RBAC + limiti approvatore (E-D-13/24), parametri ③ ibrido = motore unico + dati
   compartimentati RLS (E-D-17). Logica dominio in funzioni pure testabili (regola 5); multi-tenant da subito.
2) Gate incongruenza su ogni scelta strutturale (stratega, 3 opzioni costate).
3) Poi coda PRD (EE8/9/11+NFR) e T-028 (decomponi F1, solo crescita TODO). Non toccare apps/qr/. /chiusura.
```
