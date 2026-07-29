# TODO

**Saldo: 14 aperti — 12 nuovi (T-016, T-017, T-018, T-020, T-024, T-029…T-035), 2 riportati (T-022 `↻1`, T-008 `↻3`)**  ·  21 chiusi (…T-023 il 2026-07-27; T-027 il 2026-07-28; **T-025, T-026, T-028 il 2026-07-29b**)

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

- [N] **T-008 · Progetto Supabase prod separato (Confirm email ON)** `↻3` — deciso (2026-07-26c):
      **non** accendere Confirm email su `alrguvxspssjwfmtuhdw` (romperebbe i test d'integrazione).
      Passi: **Dashboard Supabase › New project** («shaer-qr-prod», stessa region) → **Authentication
      › Providers › Email**: *Confirm email* **ON** → copia URL + anon key + service key nei secret
      Vercel (ambiente Production) → applica le migrazioni `0001`+`0002` nel SQL editor del nuovo
      progetto. Dettaglio in `dossier/archivio/T-004-auth-dashboard.md`. → poi scrivi «T-008 fatto».

## Ora

- [ ] T-016 **Piano free/pro + metering** (nuovo) `C` 💰 — ≤100 scansioni/mese gratis, oltre
      si bloccano **analisi+export+nuovi QR**, **mai il redirect** (D-009, regola 7). Include
      export **PDF** (feature pro). Provider = **Stripe** (D-011; `pk`+`sk` già in env sul progetto qr;
      `STRIPE_WEBHOOK_SECRET` quando implemento il webhook). **Prima
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

## Ecosistema — F1 costruzione (da T-028, sequenza stabilisce→consuma)

*Dettaglio (schema, RPC, prove) in `MD/ecosistema/SAD.md` §3–8 — qui solo ordine e dipendenze, non si
ripete (E-D-26). Ogni task è **test-first** (regola 5). Codice in `apps/shaer/`+`packages/core-*`.
Precedenti (distillatore): T-030→`archivio/T-004`,`T-007`; T-032→`archivio/T-002`; T-029a→`archivio/T-007`+`PATTERN.md`.*

- [~] T-029 **Ledger core** `C` 💰 — **p.1/2 fatta** (`e91b64e`, 8/8, motore puro). **p.2/2 layer DB =
      bozza RESPINTA** dal revisore (2 bug critici: conio dal nulla). Piano di correzione pronto in
      **`dossier/T-029-ledger-core.md`**: `ledger_post` transfer-only + anti-scoperto + test DB reale (T-029a);
      conio backed → task nuovo col layer pagamenti. **Prima: rispondere `Q-MINT`** in `DOMANDE-NICK.md`.
- [ ] T-030 **Identità, ruoli, RBAC** `C` — SAD §3.1/4/6. **Stabilisce** `user_id`+`role`, gate verifica,
      limiti approvatore (E-D-24), vincolo ruoli/TXN (E-D-21). **Consuma** pattern RLS/definer di T-029.
- [ ] T-031 **TXN engine** `C` — SAD §3.2/4. **Stabilisce** il tronco TXN. **Consuma** T-029 (journal.txn_id) + T-030 (owner/ruoli).
- [ ] T-032 **Wallet derivato + conti utente** `M` — SAD §3.1/3.3. **Consuma** T-029 (postings) + T-030 (roles).
- [ ] T-033 **Escrow + circuito chiuso** `C` 💰 — SAD §3.3 (E-D-16/22). **Consuma** T-029 (held) + T-031 (txn).
- [ ] T-034 **Recensioni & Rank bayesiano** `M` — SAD §3.5. **Consuma** T-031 (COMPLETED).
- [ ] T-035 **Referral versionato + `param_sets`** `M` — SAD §3.4/3.5. **Stabilisce** `param_sets` (③ ibrido).
      **Consuma** T-029 (reward) + T-031 (txn).

## Riportati

- [>] T-022 **Fuso orario del cliente + granularità Giorno/Ora** `↻1` `C` — blocchi A+B+C fatti e provati
      (23/23 + `next build` + revisore). Resta solo **D** (toggle Giorno/Ora) + rendering fuso locale `[~]`
      (dietro auth → T-024). Dettaglio in `dossier/T-022-fuso-cliente.md`. Condivide la fondazione con T-016.

## Fatto

*(Prova completa in `memoria/REGISTRO.md` + `dossier/archivio/`. Qui non si ripete — potato 2026-07-27.)*

**Chiusi (21):** T-001…T-007, T-009…T-015, T-019, T-021, T-023, T-025, T-026, T-027, T-028 → `memoria/REGISTRO.md`

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

**Sessione 2026-07-29b — SAD F1, struttura snellita, ledger avviato.** Fatto: SAD F1 (`SAD.md` v0.1);
doc snelliti (**E-D-26**: PRD archiviato, MDD congelato, 2 fonti vive); sistema `DOMANDE-NICK` vivo;
**motore puro ledger verde** (`e91b64e`, 8/8); migrazione DB **respinta dal revisore** (2 bug: conio dal
nulla — colti *prima* della produzione); **E-D-27/28** (solvibilità + modello ricarica/spesa/settlement).
**Tocca a te — una conferma:** hai detto di aver messo le **chiavi Stripe su Vercel** — dimmi **su quale
progetto** (qr o un nuovo shaer) e **quali** (pk/sk/webhook), così so se `N-f` è chiuso e posso costruire
la RPC di ricarica. **T-008** (Supabase prod) resta `[N]` pre-lancio. Prossimo passo tecnico che sviluppo
io: **T-029a** (`ledger_post` transfer-only + anti-scoperto + test DB reale).

## Prossima sessione — prompt da lanciare 

*(standing: dopo ogni `/chiusura` questa sezione porta il prompt pronto — `lavoro.md` §8-quater)*

```
/apertura. Shaer.it = super-piattaforma, QR = Modulo 0. Fonti vive: SAD (MD/ecosistema/SAD.md v0.1, F1)
+ DECISIONI (E-D-01…28). Domande: MD/ecosistema/DOMANDE-NICK.md. Dominio: MD/SHAER_MASTER.md.

Obiettivo — T-029a (piano pronto in dossier/T-029-ledger-core.md; bozza respinta in T-029-ledger-core.draft.sql):
riscrivere il layer DB del ledger. Tabelle della bozza OK; RPC ledger_post = SOLO trasferimenti + ANTI-SCOPERTO
(nessun conto <0, TREASURY inclusa), niente conio (E-D-28); kind con CHECK; fix temp-table + guard NULL.
TEST-FIRST (regola 5, L-011): test DB reale che TENTA gli exploit (kind auto-dichiarato; scoperto non-TREASURY;
INSERT diretto) e li vede RIFIUTATI + grants.test sui grant DML. Migrazione = [N], poi test.
Conio (ricarica € Stripe) = task nuovo dopo conferma chiavi (vedi «Per Nick»). Precedenti: archivio/T-007 +
PATTERN.md. Non toccare apps/qr/. /chiusura.
```
