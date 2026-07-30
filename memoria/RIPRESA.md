# Ripresa

Fotografia per la sessione dopo: **«Per Nick»** (azioni e comandi) + **il prompt
da lanciare**. **Non si carica all'avvio** — la apre `/apertura` (costa zero a ogni
turno di lavoro). Si **sostituisce** a ogni `/chiusura`, non si accumula
(`lavoro.md` §8-quater).

## Per Nick — comandi e azioni

**Sessione 2026-07-31.** ① **Rename `apps/qr`→`apps/web`**: l'app Next è la piattaforma Shaer.it, il
QR è il Modulo 0 (commit `5373a7f`). ② **T-024 harness auth CHIUSO** (`8e2abc0`): ora ogni route
protetta è provabile da un test, non dal tuo occhio. ③ **T-017 dashboard `[~]`**: shell con sidebar,
build verde — **manca solo il tuo ok visivo**.

**👁️ Guarda T-017:** il dev server gira su :3000 (utente `t017.demo.c.20260731@shaer.it` già loggato).
Apri il pannello Browser su `/dashboard`, oppure `npm run dev` in `apps/web`. Se ti piace → diventa `[x]`;
altrimenti dimmi cosa aggiustare.

**Le tue `[N]`:**
- **Vercel Root Directory → `apps/web`** (Settings › Build & Deployment): senza, il prossimo deploy non
  trova l'app. → «root dir aggiornata».
- **T-008** `↻3` (Supabase prod, Confirm ON) — invariata.
- **Chiavi Stripe** quando vorrai affrontare T-016/T-020 (senza, scrivo solo la logica pura).

**Decisione che ti spetta (cricchetto lezioni):** **L-012** è ferma a 3 sessioni come `→ hook` non
costruito. Regola: a 3 si converte o si ritira. Due vie: **(a)** costruisco il pre-commit che segnala un
`T-NNN` citato nei dossier/DECISIONI ma assente dal saldo TODO; **(b)** la ritiro (0 ricorrenze reali dopo
la prima). Dimmi.

**Segnalo:** `Struttura/appadmin.html` + `prenotazioni.html` untracked, **non committati** — dimmi se
versionarli (prototipo booking → Sprint 3).

## Prossima sessione — prompt da lanciare

*(standing: dopo ogni `/chiusura` questa sezione porta il prompt pronto — `lavoro.md` §8-quater.)*

```
Chiudi prima T-017: guarda /dashboard (dev server :3000, utente t017.demo.c già loggato, oppure
npm run dev in apps/web). Se la shell sidebar + la griglia densa vanno bene → segna T-017 [x] in TODO
e sposta il dossier in archivio; altrimenti aggiusta e ri-verifica con next build + albero a11y
(pixel bloccato dall'ambiente = PATTERN «prova pixel», L-017).

Poi, in sequenza stabilisce→consuma:
1. T-016 (piano free/pro + metering, C 💰) — Stripe (D-011). BLOCCANTE: servono le chiavi Stripe [N].
   Senza, scrivo la logica pura (quota ≤100 scan/mese, mai il redirect D-009, export PDF pro) + lo
   schema, e lascio appeso il checkout live. Provala con l'harness T-024 (dashboard-auth.test.ts) per
   il metering scoped-utente. → dossier/T-016-piano-free-pro.md.
2. T-020 (slug custom + @tag, C ⚠️) — CONSUMA T-016 (pro 2€/mese, D-010). Immutabile/riassegnabile.
   Stessa harness per provare che lo slug pro è visibile solo al proprietario. → dossier/T-020-slug-custom-tag.md.

Prima di scrivere: se tocchi [N]/decisioni, chiedi PRIMA (regola 3). L'harness auth di T-024 è il
precedente da riusare per ogni prova scoped-utente (archivio/T-024-harness-auth-ssr.md).
```
