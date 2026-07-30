# Ripresa

Fotografia per la sessione dopo: **«Per Nick»** (azioni e comandi) + **il prompt
da lanciare**. **Non si carica all'avvio** — la apre `/apertura` (costa zero a ogni
turno di lavoro). Si **sostituisce** a ogni `/chiusura`, non si accumula
(`lavoro.md` §8-quater).

## Per Nick — comandi e azioni

**Sessione 2026-07-30 (parte 3).** ① Ottimizzato il **metodo** (commit `0289e20`): costo
fisso −11% (A1/A2/A3/B2/C). ② **T-031 TXN engine — fetta 1/2 fatta e provata** (commit
`266fffa`): motore puro FSM, 11/11 test + revisore approvato.

**⚠️ Decisione che ti spetta — PRIMA della fetta 2/2** (la migrazione è irreversibile):
la macchina a stati della transazione è, per come l'ho scritta, **adiacenza stretta**
(`OPEN→SUGGESTED→IN_PROGRESS→COMPLETED`, un passo alla volta; `EXPIRED`/`ABANDONED` da
ogni stato non-terminale). L'alternativa è **monotòna-forward** (permette salti in avanti,
es. `OPEN→IN_PROGRESS` o `SUGGESTED→COMPLETED`).
- **A) adiacenza stretta** — anti-frode massima, ogni salto futuro è un allargamento
  esplicito. *(mia scelta di default)*
- **B) monotòna-forward** — più flessibile, più superficie d'abuso.
A conferma la registro come `D-NNN`. Il motore puro è banale da adeguare a B.

**Le tue `[N]`:** ① (minore) `SUPABASE_SERVICE_ROLE_KEY` in `apps/web/.env.local` (ramo
positivo ledger) · ② **T-008** (Supabase prod, Confirm ON).
**Segnalo:** `Struttura/appadmin.html` + `prenotazioni.html` untracked, **non committati**
— dimmi se versionarli. Prototipo booking → Sprint 3.

## Prossima sessione — prompt da lanciare

*(standing: dopo ogni `/chiusura` questa sezione porta il prompt pronto —
`lavoro.md` §8-quater. Sessione mirata: puoi saltare `/apertura`, fisso io
l'àncora con `git rev-parse`.)*

```
T-031 fetta 1/2 (motore puro FSM) è chiusa e provata (11/11 + revisore, commit 266fffa).
Si fa la fetta 2/2 — piano pronto in dossier/T-031-txn-engine.md.

PASSO 0 (bloccante): confermami la FSM — A) adiacenza stretta (default) o B) monotòna-forward.
  A conferma la registro come D-NNN in DECISIONI.md, POI si scrive la migrazione (irreversibile).

Poi, in ordine stabilisce→consuma:
1. Migrazione apps/web/supabase/migrations/2026073100000X_txn.sql (DDL → [N], la applichi tu):
   transactions + transaction_events (append-only) + FK su ledger_journal.transaction_id
   (già nullable) + revoke INSERT/UPDATE/DELETE from authenticated + RLS owner-scoped.
2. RPC definer txn_transition(txn_id,to_state) e txn_append_event(txn_id,type,meta): rivalidano
   canTransition/canAppendEvent dentro la transazione DB (SAD §4). Unico writer.
3. Integration test apps/web/lib/txn.test.ts (node --test --env-file=apps/web/.env.local): tenta e
   fa RIFIUTARE salto illegale, evento su terminale, reward su non-COMPLETED, INSERT diretto (42501).
4. Estendi apps/web/lib/grants.test.ts alla nuova superficie (L-001).

Leggi PRIMA: dossier/archivio/T-029 (schema exploit-rifiutato), T-030 (maker-checker + L-013),
T-007 (grants.test), SAD §3.2/§4. Test-first (regola 5) → revisore → [~]/[x] → /chiusura.
```
