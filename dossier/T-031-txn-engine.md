---
task: T-031
tier: C
titolo: TXN engine — la transazione come tronco a cui tutto si appende
aree: [dominio, denaro, txn, fsm, ledger, escrow, rpc, migrazione]
stato: aperto
riporti: 0
sessioni: [2026-07-30]
---

# T-031 · TXN Engine (SAD §3.2/§4)

La transazione è il tronco a cui **tutto si appende**: reward, recensioni, movimenti
ledger. Consuma T-029 (ledger) + T-030 (RBAC/verify-gate). È il tronco di F1: da qui
appendono T-032 (wallet), T-033 (escrow), T-034 (recensioni), T-035 (referral).

## Decisione FSM (stabilita in questa sessione)

Stati: `OPEN · SUGGESTED · IN_PROGRESS · COMPLETED · EXPIRED · ABANDONED`
(= `check` SQL di `transactions.state`, SAD §3.2).

- **Solo in avanti, per adiacenza**: `OPEN→SUGGESTED→IN_PROGRESS→COMPLETED`. Nessun
  salto di stadio (`OPEN→COMPLETED` illegale), nessun ritorno, nessun self-loop.
- **Off-ramp terminali** `EXPIRED`/`ABANDONED` da **ogni** stato non-terminale
  (timeout o rinuncia in qualunque momento prima del completamento).
- **Terminali immutabili**: `COMPLETED/EXPIRED/ABANDONED` non hanno uscite.
- **Eventi**: `reward`/`review` solo su `COMPLETED` (AC-EE2.3, verifica avvenuta via
  QR); ogni altro evento di processo solo su stato non-terminale.

Scelta dell'interpretazione: adiacenza stretta (non "monotòna forward" con salti). È la
più restrittiva → additiva: un eventuale salto lecito futuro è un allargamento esplicito
con decisione, non un buco lasciato aperto ora sul denaro.

> **DA CONFERMARE con Nick PRIMA della fetta 2/2** (la migrazione è irreversibile — un
> `check`-enum e una FSM su denaro non si cambiano dopo che esistono transazioni). È un
> asse che SAD/MDD non esplicitavano: va portato al gate (regola 3) come opzione con
> conseguenza — **A) adiacenza stretta** (scelta ora, anti-frode massima, ogni salto è un
> allargamento futuro esplicito) vs **B) monotòna forward** (permette OPEN→IN_PROGRESS o
> SUGGESTED→COMPLETED, più flessibile ma più superficie d'abuso). A conferma → `D-NNN` in
> `DECISIONI.md`. Il motore puro è banale da adeguare a B se Nick sceglie così.

## Fetta 1/2 — FATTA e PROVATA (commit 266fffa)

Motore puro `packages/core-ledger/txn.ts` — gemello testabile della RPC definer, stessa
disciplina di `ledger.ts`/T-029 (la matematica è duplicata TS↔SQL per scelta anti-frode,
SAD §4). API: `canTransition(from,to)`, `nextStates(state)`, `isTerminal(state)`,
`canAppendEvent(state,type)`, più `TERMINAL_STATES`/`COMPLETED_ONLY_EVENTS`.

- **Prova**: `packages/core-ledger/txn.test.ts` **11/11 verde** (`node --test`), 36
  coppie stato×stato esaustive contro una verità `LEGAL` scritta a mano **indipendente**
  dalla tabella `NEXT`; `tsc --noEmit --strict` pulito.
- **Revisore**: approvato, zero rilievi (`memoria/review/2026-07-30-T031.json`).
- **Confine puro/DB onesto**: l'append-only vero (no update/delete su
  `transaction_events`) è policy del DB, **non finto in puro** (L-011).

## Fetta 2/2 — DA FARE (piano pronto)

Ordine stabilisce→consuma (la migrazione è irreversibile → prima di chi la consuma):

1. **Migrazione** `apps/qr/supabase/migrations/2026073100000X_txn.sql` (DDL → `[N]`:
   Nick la applica dal SQL editor su `alrguvxspssjwfmtuhdw`, come 20260729/20260730):
   - `transactions` (id, owner_id→auth.users, qr_id→qr_codes null, state check-enum
     default OPEN, kind, expires_at, created_at, updated_at) — `owner_id` + **RLS
     owner-scoped**.
   - `transaction_events` (id, transaction_id→transactions, owner_id, type, meta jsonb,
     created_at) — **APPEND-ONLY**: policy che nega UPDATE/DELETE (SAD §3.6/§6).
   - **FK** su `ledger_journal.transaction_id` → `transactions(id)` (la colonna esiste
     già **nullable**, predisposta in 20260729000001: qui si aggiunge solo il vincolo).
   - `revoke insert/update/delete … from authenticated` su entrambe (l'unico writer è la
     RPC definer, pattern `qr_scans`/`resolve_qr`).
2. **RPC definer** (`security definer`, `set search_path=''`, SAD §4):
   - `txn_transition(txn_id, to_state)` — rivalida `canTransition` **dentro** la
     transazione DB; rifiuta salto illegale (AC-EE2.1) e transizione da terminale
     (AC-EE2.5); owner-scoped; aggiorna `updated_at`.
   - `txn_append_event(txn_id, type, meta)` — rivalida `canAppendEvent`; reward/review
     solo su COMPLETED (AC-EE2.3); nessun evento su terminale.
   - Idempotenza dove serve (una transizione applicata una volta).
3. **Integration test DB reale** `apps/qr/lib/txn.test.ts` (come `ledger.test.ts`,
   `node --test --env-file=apps/qr/.env.local`): tenta e fa **rifiutare** salto illegale,
   evento su terminale, reward su non-COMPLETED, INSERT diretto in `transactions`/
   `transaction_events` da `authenticated` (deve dare 42501).
4. **Estendi `apps/qr/lib/grants.test.ts`** alla nuova superficie (SAD §4 fondo, L-001):
   fallisce se `transactions`/`transaction_events` concedono INSERT ad `authenticated`, o
   se `txn_transition`/`txn_append_event` escono dalla whitelist attesa `authenticated`.

## Leggi prima (precedenti)

- `dossier/archivio/T-029-ledger-core.md` — pattern motore puro + RPC definer + il modo
  di provare i rifiuti su DB reale (i 2 exploit tentati).
- `dossier/archivio/T-030-rbac.md` — riusa `pending_actions`/`pending_approvals`
  (maker-checker multisig) se una transizione esige approvazione; e L-013 (grant vs RLS).
- `MD/ecosistema/SAD.md` §3.2 (tabelle), §4 (RPC + enforcement locus), §3.6 (invarianti).

## Attrito / note

- **Incongruenza SAD** (interna): §5 cita `nextTxnState(from,event)`, §4 usa
  `txn_transition(txn_id, to_state)`. Il motore segue §4 (più specifica). Non è un bug del
  codice. *Prevenibile? No*: è drift di prosa fra due sezioni del SAD, non meccanizzabile;
  si sana quando si tocca il SAD.
- **Gap tsc**: i motori puri in `packages/` non hanno copertura `tsc` nel pre-commit (solo
  `apps/qr`, §9). `ledger.ts`/`rbac.ts`/`txn.ts` sono type-checkati solo a mano.
  *Prevenibile? Sì, hook*: estendere `pre-commit §9` a `packages/**/*.ts` (LEZIONI, speculare
  a L-004).
- **Decisione FSM in corsa** (vedi riquadro sopra): asse strutturale risolto senza fermarsi
  al gate (regola 3). *Prevenibile? Sì, hook*: 3ª recidiva (T-029/030/031) → PATTERN +
  estensione `pre-commit §11` a intestazioni `## Decision*` in dossier `tier: C` senza
  `DECISIONI.md` nel commit.
