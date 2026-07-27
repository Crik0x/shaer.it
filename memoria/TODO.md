# TODO

**Saldo: 6 aperti — 5 nuovi (T-016…T-020, di cui T-019 `[~]` motore fatto), 1 riportato (T-008 `↻3`)**  ·  14 chiusi (T-001…T-005 il 2026-07-24; T-006, T-007, T-009, T-010 il 2026-07-25; T-011, T-013, T-012 il 2026-07-26; T-014, T-015 il 2026-07-27)

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

- [N] **N-a · Config auth Supabase** (sblocca l'auth in prod, 2 min) — Dashboard Supabase
      progetto `alrguvxspssjwfmtuhdw` → **Authentication › URL Configuration**:
      1. **Site URL** = `https://qr.shaer.it`
      2. **Redirect URLs** › Add URL = `https://qr.shaer.it/**` (con `/**`, **non** `*shaer.it`:
         quello matcherebbe domini-sosia). Salva. → poi scrivi «N-a fatto».

- [N] **N-b · Verifica unici in produzione** (chiude l'ultimo `[~]`, 2 min) — su **telefono in
      rete cellulare** (IP reale, non il tuo Wi-Fi già visto): apri un tuo QR pubblicato, poi
      logga la dashboard su `qr.shaer.it` e controlla che **«Visitatori unici»** salga e che il
      **consiglio VISITOR_SALT sparisca**. Se resta a 0 → il redeploy non ha `VISITOR_SALT`:
      dimmelo. → poi scrivi «N-b fatto».

- [N] **N-c · Decisione T-016 · provider pagamento** — scegli uno, sblocca la costruzione del
      piano free/pro (io poi lo implemento):
      • **Stripe** (standard, webhook maturi, SCA/EU ok) — mia raccomandazione;
      • **Lemon Squeezy / Paddle** (merchant-of-record: gestiscono IVA UE al posto tuo, fee più alta);
      • **rimandare** (costruisco solo il *metering* e il gate a quota, pagamento dopo).
      → scrivi «T-016 provider = <scelta>».

- [N] **N-d · Decisione T-017 · riferimento estetico** — il restyling dashboard va fatto su un
      riferimento, non a mano libera (T-011 fu respinto per estetica). Opzioni:
      • mandami **1-2 screenshot** di dashboard che ti piacciono (Linear/Vercel/Stripe…);
      • oppure scrivi **«mano libera stile Stripe»** e procedo con quel canone.
      → scrivi la scelta.

- [N] **T-008 · Progetto Supabase prod separato (Confirm email ON)** `↻3` — deciso (2026-07-26c):
      **non** accendere Confirm email su `alrguvxspssjwfmtuhdw` (romperebbe i test d'integrazione).
      Passi: **Dashboard Supabase › New project** («shaer-qr-prod», stessa region) → **Authentication
      › Providers › Email**: *Confirm email* **ON** → copia URL + anon key + service key nei secret
      Vercel (ambiente Production) → applica le migrazioni `0001`+`0002` nel SQL editor del nuovo
      progetto. Dettaglio in `dossier/archivio/T-004-auth-dashboard.md`. → poi scrivi «T-008 fatto».

- [N] **N-e · Eyeball T-019** (chiude l'ultimo `[~]` del task, 2 min) — da **loggato** (locale o
      `qr.shaer.it`) apri un tuo QR dalla lista "I tuoi QR" → `/dashboard/qr/<short_code>`. Conferma:
      KPI popolati, il selettore **Periodo** naviga (URL `?d=`), timeline/breakdown/heatmap rendono,
      e — se il QR ha figli — compare il KPI **Sottoalbero**. → poi scrivi «N-e fatto» e T-019 chiude.

## Ora

- [ ] T-016 **Piano free/pro + metering** (nuovo) `C` 💰 — ≤100 scansioni/mese gratis, oltre
      si bloccano **analisi+export+nuovi QR**, **mai il redirect** (D-009, regola 7). Include
      export **PDF** (feature pro). **Prima di costruire**: provider pagamento (Stripe?),
      metering derivato vs materializzato, fuso del mese, comportamento a quota. Piano e nodi
      in **`dossier/T-016-piano-free-pro.md`**. Precede T-020. Precedente: **T-007** (whitelist anon).

- [ ] T-017 **Restyling densità dashboard** (nuovo) `M` — spazi/gerarchia/griglia dei widget,
      solo token (regola 8), Server Components. Chiedere a Nick wireframe o mano libera **prima**
      (precedente: **T-011** respinto per estetica). Piano in **`dossier/T-017-restyling-dashboard.md`**.

- [ ] T-018 **Editor QR avanzato** (nuovo) `M` — più tipi/opzioni + branding + `purpose`/`parent_id`;
      punto d'aggancio dello slug (T-020). Verificare Roadmap M2–M5 prima. Precedente: **T-005**.
      Piano in **`dossier/T-018-editor-qr-avanzato.md`**.

- [~] T-019 **Analisi singolo QR** `M` — **motore FATTO e provato**: `app/dashboard/qr/[short_code]/page.tsx`
      ricomposta in derivazione-in-JS (KPI, consigli, selettore periodo, timeline, breakdown
      device/browser/OS/lingua, geo, heatmap, rollup own/sottoalbero) riusando le funzioni pure già
      testate — `dashboard.test` 16/16, tsc pulito, route `307→/login` (compila sotto Next). Rimossi i
      2 componenti superati (AnalyticsPanel/analytics-chart). **Resta `[~]` il solo eyeball loggato**
      (magic-link non automatizzabile) → azione **N-e** nella sezione «Da te». Dossier `dossier/T-019-analisi-singolo-qr.md`.

- [ ] T-020 **Slug custom + @tag utente** (nuovo) `C` ⚠️ — pro, 2€/mese/link, immutabile in vita,
      riassegnabile se cancellato (D-010, eccezione regola 7). **Consuma T-016** (va dopo). Routing
      @tag e delete/scansioni orfane = nodi aperti. Piano in **`dossier/T-020-slug-custom-tag.md`**.

## Riportati

## Fatto

*(Il **saldo** dei chiusi vive nella riga di testata di questo file. La **prova
completa** — esito, valore misurato, riferimento — è nel libro mastro
`memoria/REGISTRO.md` (append-only, non caricato all'avvio) e nel dossier
archiviato in `dossier/archivio/T-NNN-*.md`. Qui non si ripete: era costo di
contesto a ogni sessione per informazione che REGISTRO già conserva. — potato
2026-07-27, opzione A.)*

**Chiusi (14):** T-001…T-007, T-009…T-015 → `memoria/REGISTRO.md`

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

**Sessione 2026-07-27b (in corso).** Nuova regola `lavoro.md` §8-ter: le tue azioni
vivono nella sezione **«Da te — azioni `[N]`»** qui sopra, ognuna col come-fare, e si
**rimuovono** quando le confermi. Le tue quattro `[N]` aperte:

- **N-a** config auth Supabase · **N-b** verifica unici in prod · **N-c** provider T-016 ·
  **N-d** riferimento estetico T-017 · più **T-008** (Supabase prod separato).

Sblocca ciò che vuoi con un messaggio secco (es. «N-a fatto», «T-016 provider = Stripe»)
e riparto. Nel frattempo io ho implementato **T-019** (analisi singolo QR) in autonomia —
esito nel commit e in STATO.
