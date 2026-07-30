# Ripresa

Fotografia per la sessione dopo: **«Per Nick»** (azioni e comandi) + **il prompt
da lanciare**. **Non si carica all'avvio** — la apre `/apertura` (costa zero a ogni
turno di lavoro). Si **sostituisce** a ogni `/chiusura`, non si accumula
(`lavoro.md` §8-quater).

## Per Nick — comandi e azioni

**Sessione 2026-07-30 (parte 3).** Ottimizzato il **metodo** (richiesta di Nick):
costo fisso sceso sotto budget e troncatura aggredita alla radice. Applicate
A1 (dedup `CLAUDE.md`↔`lavoro.md`), A2 (sezioni d'avvio → questo file), A3 (TODO a
riga secca), B2 (chiusura leggera se il diff non tocca produzione **e** nessun
dossier è C), C (testimone 25%→30%, tetto 40% invariato).

**Le tue `[N]`:** ① (minore) `SUPABASE_SERVICE_ROLE_KEY` in `apps/qr/.env.local`
(ramo positivo ledger) · ② **T-008** (Supabase prod, Confirm ON).
**Segnalo:** `Struttura/appadmin.html` + `prenotazioni.html` untracked, **non
committati** — dimmi se versionarli. Prototipo booking → Sprint 3.

## Prossima sessione — prompt da lanciare

*(standing: dopo ogni `/chiusura` questa sezione porta il prompt pronto —
`lavoro.md` §8-quater. Sessione mirata: puoi saltare `/apertura`, fisso io
l'àncora con `git rev-parse`.)*

```
T-030 (RBAC) è chiuso e provato (DB-test 7/7 sul DB reale, migrazione 20260730000001 applicata).
Prossimo bivio — entrambi consumano T-030 (verify-gate + RBAC), scegli tu:

• T-031 · TXN engine (F1) — il tronco a cui si appendono wallet/escrow/recensioni/referral
  (SAD §3.2/4). Test-first: motore puro FSM OPEN→SUGGESTED→IN_PROGRESS→COMPLETED→(EXPIRED/ABANDONED)
  in packages, poi migrazione `transactions` + aggiungi la FK su ledger_journal.transaction_id
  (già nullable, predisposta in 20260729000001). Leggi PRIMA: archivio/T-029 (ledger), SAD §3.2.
  Continua l'economia F1 (D-016: ledger F1 prima delle feature).

• T-042 · Schema gestionale G1 — businesses/offerings(service|product)/bundles/staff/role_templates,
  owner_id+RLS, prezzo_shaer INERTE (money OFF). Consuma il verify-gate di T-030. Modello in
  MD/ecosistema/MODULO-7-GESTIONALE.md §4. Rende il prodotto usabile lato business.

Dimmi quale apro. Poi test-first (regola 5) → revisore → [~]/[x] → /chiusura.
(Sessione mirata: puoi saltare /apertura, fisso io l'àncora con git rev-parse.)
```
