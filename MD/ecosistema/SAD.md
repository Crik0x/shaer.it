# Shaer.it — Software Architecture Document (SAD) · Ecosistema

Versione: 0.1 · Stato: **contratto costruibile F1** (B1…B4, EE1–EE3 pieni; EE4/5/6/12 di contorno) · 2026-07-29
Padre/mappa: [MDD](MDD.md) (visione, congelata) · Perché: [DECISIONI](../../memoria/DECISIONI.md) E-D-01…E-D-26
Dominio: [SHAER_MASTER](../SHAER_MASTER.md) §1.4–1.5 · SAD del Modulo 0: [modulo-qr/SAD](../modulo-qr/SAD.md).

> **Questo è la fonte tecnica unica di F1** (E-D-26): schema, RPC, confine di sicurezza, motore
> puro, infra, e i **criteri di accettazione** come lista di test (§8). Non c'è un PRD separato —
> era la stessa cosa a un'altra quota (archiviato). I requisiti di dettaglio dei blocchi non
> ancora costruiti (EE7–EE14) si scrivono **just-in-time**, spesso come il test stesso. Fa fede
> la **realtà verificata** (regola 1): il Modulo 0 (`apps/qr/`) è in produzione e non si tocca;
> F1 vive in `apps/shaer/` e `packages/`, **stesso Supabase** (D-005).

---

## 1 · Stack & topologia (D-005 — non cambiare senza chiedere)

- **Monorepo**, una repo: `apps/qr/` (Modulo 0, ✅ costruito) · **`apps/shaer/`** (F1, **nuova**) ·
  **`packages/`** (codice condiviso: **tipi DB generati**, motore di dominio puro, design system).
  Vercel: **un project per app**, Root Directory su `apps/<nome>`.
- **Stesso Supabase** del Modulo 0 (dev `alrguvxspssjwfmtuhdw`; prod separato = **T-008**). Le
  migrazioni F1 nascono in **`supabase/migrations/`** (root del repo — realtà verificata: le 8
  migrazioni QR sono lì, **non** sotto `apps/qr/`), applicate da Nick nel SQL editor (`[N]`).
- **Next.js 16 App Router** (TS), Server Components di default, `proxy.ts` (non `middleware.ts`,
  L → hook §7). **Tailwind + shadcn/ui**, token in `globals.css`. Modello dashboard = gemello
  **damascati** (E-D-12), struttura non palette.
- Test: `node --test` su `*.test.ts` (node 24 strippa TS). **Nessuna libreria nuova senza
  conferma** (regola 10). Off-ramp/KYC **non** si costruiscono in F1 (E-D-23): niente provider ora.

## 2 · Struttura del codice (F1)

```
apps/shaer/
  app/            (auth condivisa col Modulo 0), dashboard business + dashboard cliente (E-D-18)
  lib/            adapter I/O verso le RPC; nessuna logica di dominio qui
packages/
  core-ledger/    MOTORE PURO — partita doppia, solvibilità, split, escrow FSM, TXN FSM (no I/O)
  core-rbac/      MOTORE PURO — valutazione permessi, maker-checker, vincolo ruoli per-TXN
  db-types/       tipi generati dallo schema Supabase (verità dei nomi colonna, regola 5)
  design-system/  token + primitivi condivisi con apps/qr
supabase/migrations/   DDL F1 additivo, versionato (root repo)
```

Regole di posizionamento identiche al Modulo 0: `'use client'` solo sulle foglie interattive;
logica di dominio **pura** in `packages/core-*` con test affiancato; l'app non calcola valori
economici — li chiede alle **RPC definer** (§4) e le RPC invocano il motore puro (§5).

## 3 · Modello dati F1

### 3.0 · Realtà oggi (Modulo 0, verificata sulle migrazioni)
`qr_codes` (albero `parent_id`/`owner_id`/`granted_by`, `short_code` immutabile), `qr_scans`
(append-only, solo `resolve_qr` scrive), `profiles` (`timezone`, T-022 → D-014). Funzioni definer
whitelisted per anon: `{resolve_qr, anonymize_ip}` (`grants.test.ts`, L-001). **F1 è additivo su
questo**: l'albero di QR **è già** la struttura produttore→seller→buyer e i passaggi di consegna
(MDD §3) — non si duplica.

### 3.1 · Identità, ruoli, wallet, RBAC (EE1 · Mod. 1)
Il **profilo** è unico (già esiste); i ruoli e i permessi si aggiungono.

```sql
-- fino a 3 ruoli per utente, ciascuno con verifica documentale (SELLER/PRODUCER/TRANSPORTER)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  role text not null check (role in ('buyer','seller','producer','transporter')),
  verified_at timestamptz null,                 -- NULL = non-verificato → nessuna op business
  verified_by uuid null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (user_id, role));                        -- niente ruoli duplicati
-- AC-EE1.1 "max 3 ruoli attivi": l'enum ha 4 valori ma il tetto ≤3 lo impone il definer di
-- assegnazione (conteggio righe per user_id) — un 4° ruolo è rifiutato lì, non dal unique.

-- RBAC admin-first (E-D-13/24): permessi speciali assegnati UNO A UNO da un ADMIN
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  grantee_id uuid not null references auth.users(id),    -- il profilo delegato (approvatore)
  scope text not null,                                    -- compartimento (E-D-09): es. 'incentivi:ristorante:42'
  capability text not null check (capability in ('read','verify')),  -- MAI 'own'/'admin' (E-D-24)
  granted_by uuid not null references auth.users(id),     -- deve essere ADMIN (policy §6)
  business_id uuid null references auth.users(id),        -- il business su cui vale la delega
  created_at timestamptz not null default now());

-- relazione di lavoro utente↔business via accordo (E-D-21)
create table public.work_relationships (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references auth.users(id),
  business_id uuid not null references auth.users(id),
  agreed_at timestamptz null,                    -- NULL = proposta; valorizzato = accordo confermato
  created_at timestamptz not null default now());

create table public.work_sessions (             -- append-only: timbra inizio/fine (E-D-21)
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.work_relationships(id),
  started_at timestamptz not null, ended_at timestamptz null,
  special_roles text[] not null default '{}');
```

- **Wallet**: **non è una tabella**. È la vista derivata `SUM(postings)` per `(user_id, role,
  class)` sul ledger (§3.3) — AC-EE1.3/EE3.4: nessuna colonna saldo esiste a schema.
- **Maker-checker** (R-EE1.5): un'azione permanente da profilo delegato nasce `pending` in
  `pending_actions` e non produce effetti finché un approvatore abilitato non la conferma
  (idempotente, applicata una sola volta) — vedi §3.2 (stessa macchina degli stati).

### 3.2 · TXN Engine (EE2 · Mod. 2) — l'unica verità
La transazione è il tronco a cui **tutto si appende** (reward, recensioni, movimenti ledger).

```sql
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),        -- RLS owner-scoped
  qr_id uuid null references public.qr_codes(id),          -- il QR/lotto che la verifica (Mod. 0)
  state text not null default 'OPEN'
    check (state in ('OPEN','SUGGESTED','IN_PROGRESS','COMPLETED','EXPIRED','ABANDONED')),
  kind text not null,                                       -- sale | transport | reward | fidelity …
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());

create table public.transaction_events (   -- APPEND-ONLY: nessun update/delete (policy §6)
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id),
  owner_id uuid not null,
  type text not null,                       -- suggested | sold | reward | review | received | delivered
  meta jsonb not null default '{}',
  created_at timestamptz not null default now());
```

**Macchina a stati** (funzione pura `core-ledger/txn.ts`, provata senza DB — regola 5): le
transizioni sono **solo in avanti**; `COMPLETED/EXPIRED/ABANDONED` sono **terminali immutabili**.
La transizione è **applicata** solo dalla RPC definer `txn_transition` (§4), che rifiuta ogni salto
illegale (AC-EE2.1) e ogni evento su stato terminale (AC-EE2.5). Reward/recensioni si appendono
**solo** su `COMPLETED` (AC-EE2.3/EE4.1), verificata via QR.

### 3.3 · Ledger a partita doppia + escrow (EE3 · Mod. 3) — la fondazione economica
Modello canonico **journal + postings** (SHAER_MASTER §1.4). `1 credito = 0,01 €`.

```sql
create table public.accounts (               -- 6 conti di sistema + conti utente-per-ruolo
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('system','user')),
  system_code text null check (system_code in
    ('SHAER_TREASURY','SHAER_ESCROW','SHAER_SETTLEMENT','SHAER_REVENUE','SHAER_ADV','SHAER_BURN')),
  user_id uuid null references auth.users(id),
  role text null check (role in ('buyer','seller','producer','transporter')),
  unique nulls not distinct (system_code, user_id, role));

create table public.ledger_journal (         -- l'intestazione di un movimento atomico
  id uuid primary key default gen_random_uuid(),
  kind text not null,                         -- purchase | reward | escrow_hold | escrow_release | fidelity_redeem | transfer
  transaction_id uuid null references public.transactions(id),   -- il tronco a cui si appende
  created_at timestamptz not null default now());

create table public.ledger_postings (        -- le righe: la loro somma per journal È ZERO
  id uuid primary key default gen_random_uuid(),
  journal_id uuid not null references public.ledger_journal(id),
  account_id uuid not null references public.accounts(id),
  class text not null check (class in ('promo','purchased','earned')),
  amount_credits bigint not null,             -- con segno; interi (mai float sul denaro)
  held boolean not null default false,        -- escrow: escluso dal disponibile finché false
  created_at timestamptz not null default now());
```

**Invarianti** — realizzati DB-authoritative (vedi §4, enforcement locus):
- **Somma zero** (R-EE3.3/AC-EE3.1): `SUM(amount_credits) = 0` per ogni `journal_id`.
- **Solo TREASURY conia** (AC-EE3.2); `promo` esce da **budget autorizzato in ADV** (R-EE3.3).
- **Saldo derivato** (R-EE3.4): `SUM(amount_credits) WHERE NOT held` per `(account, class)`.
  **Nessuna colonna saldo** (AC-EE3.4 = assenza a schema).
- **Solvibilità** (R-EE3.5/AC-EE3.3): dopo ogni journal, riserva € (TREASURY) ≥ `purchased+earned`
  circolanti — property-based test.
- **3 classi**: `promo` non prelevabile (AC-EE3.5); `earned` esce solo con `kyc_verified`
  (AC-EE3.6) — **gate specificato, non costruito** in F1 (E-D-23).

**Escrow** (E-D-16/22) = macchina a stati sul journal `escrow_hold`, non tabella a sé:
`held=true` → escluso dal disponibile (AC-EE3.7). Rilascio (`escrow_release`, `held→false`) solo
se: **approvazione commerciante + doppia conferma → rilascio immediato**; la **finestra di
contestazione (5 gg)** si apre **solo** se una promessa non è onorata, arbitro = **customer care**
(E-D-22). **Circuito chiuso** (E-D-16/AC-EE3.8): i crediti escrow sono spendibili **solo se** il
commerciante ha versato € veri; altrimenti restano **punto contabile** (`held` permanente finché
non arriva il versamento in `SHAER_SETTLEMENT`).

### 3.4 · Parametri ③ ibrido (E-D-17) — motore unico, dati compartimentati
Il **motore** (§5) è unico, puro, testabile; i **valori** vivono in tabelle con **RLS per
compartimento** (E-D-09), **versionati e immutabili** dove un accordo vi matura sopra (E-D-20,
stessa legge del QR, regola 7).

```sql
create table public.param_sets (             -- un compartimento di parametri, versionato
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  domain text not null,                       -- 'referral' | 'fidelity_split' | 'incentive' | 'fee'
  version int not null,
  published_at timestamptz null,              -- pubblicato ⇒ IMMUTABILE (E-D-20)
  values jsonb not null,                      -- i valori; il motore li riceve come argomenti, non li cerca
  unique (owner_id, domain, version));
```

- **Referral** (E-D-20): parametri immutabili una volta `published_at`; un cambio crea una **nuova
  `version`**; ogni reward resta legato alla versione sotto cui è maturato (AC-EE5.2). Scadenza
  configurabile ore/giorni/mesi/mai nei `values` (AC-EE5.3).
- **Fidelity split** (E-D-25): `values = {emittente:0.30, shaer:0.30, esercente:0.40}`,
  configurabile dal pannello Admin; i tre addendi **sommano a 1** (AC-EE10.2), i movimenti di
  redeem cross-merchant sommano a zero sul ledger. Redeem presso l'emittente = 100% (AC-EE10.1).
- **Incentivi/fee** (E-D-15, SHAER_MASTER §1.4 C31/C32/C37): stessi meccanismo, `values`
  compartimentati per business.

### 3.5 · Di contorno (schema minimo, riempimento in T-028)
- **Recensioni & rank** (EE4): `reviews(txn_id→COMPLETED, category, stars, created_at)`; rank =
  media bayesiana con soglia 3 (AC-EE4.2), funzione pura `core-ledger/rank.ts`.
- **Referral** (EE5): `referral_programs(param_set_id)` + `referral_rewards(txn_id, program_version)`;
  reward solo sul diretto (mono-livello, AC-EE5.1).
- **Wishlist/regali** (EE6): `wishlists`, `gift_pools(target_credits)`, `gift_contributions`
  (revoca entro 2h = AC-EE6.1, funzione pura sul `created_at`).
- **Trasporto** (EE12): 2 eventi `transaction_events` (`received`/`delivered`) sul lotto; derivati
  (tempo/distanza/costo) calcolati, **niente GPS continuo** (E-D-19); l'output al consumatore
  **non contiene PII** del lavoratore (AC-EE12.2, compartimentazione E-D-09).

### 3.6 · Invarianti trasversali
- Ogni tabella nasce con **`owner_id`/`user_id` + RLS owner-scoped** (multi-tenant, regola 9).
- **Append-only** su `transaction_events`, `ledger_postings`, `work_sessions`: nessun update/delete.
- **Saldi sempre derivati**, mai materializzati. **Interi** sul denaro, mai float.
- Confine reale = **DB** (L-001): ogni grant introspezionato, non presunto (`grants.test` esteso).

## 4 · API interna (RPC) e **enforcement locus** degli invarianti

**Decisione strutturale (fissata, non ambigua).** Regola 5 vuole la logica in funzioni pure; L-001
[LOCKED] dice che con anon key pubblica **il confine è il DB**. Per il ledger le due si conciliano
così: il **motore puro** (§5) calcola *cosa* postare; l'**autorità** che *accetta o rifiuta* è una
**RPC `SECURITY DEFINER`** che rivalida gli invarianti dentro la transazione DB ed è **l'unico
writer** (le tabelle ledger/txn non hanno `INSERT` diretto per `authenticated` — esattamente il
pattern `qr_scans`/`resolve_qr`). Un client che scrive dritto viene respinto dai grant. La matematica
è duplicata (TS calcola, SQL rivalida) *per scelta*: è il prezzo dell'anti-frode, ed è la ragione
d'esistere della piattaforma. *(Opzione event-sourced con projection layer: rimandata oltre F1.)*

| RPC (definer, `set search_path=''`) | Scopo | Invariante che impone |
|---|---|---|
| `ledger_post(entries[], kind, txn_id?)` | unico writer del ledger | somma-zero, solo-TREASURY-conia, solvibilità |
| `txn_transition(txn_id, to_state)` | applica la FSM TXN | solo-avanti, terminali immutabili |
| `txn_append_event(txn_id, type, meta)` | appende evento | solo su stato non-terminale; reward/review solo su COMPLETED |
| `escrow_release(journal_id)` | sblocca `held` | approvazione+doppia conferma / finestra 5gg / arbitrato (E-D-22) |
| `fidelity_redeem(points, merchant)` | riscatto punti | split 30/30/40 (o 100% emittente), somma-zero (E-D-25) |
| `assign_permission(grantee, scope, capability)` | RBAC admin-first | il chiamante è ADMIN; capability ∈ {read,verify} (E-D-24) |
| `approve_pending(action_id)` | maker-checker | applica una sola volta (idempotenza), approvatore abilitato |

**Whitelist anon invariata**: nessuna di queste è anon — sono tutte `authenticated`-only
(l'utente loggato, owner-scoped). `grants.test.ts` si **estende** alla nuova superficie: fallisce se
una tabella ledger/txn concede `INSERT` a `authenticated`, o se una RPC esce dalla whitelist attesa.

## 5 · Il motore puro (`packages/core-*`) — regola 5

Logica di dominio in **funzioni pure**, testabili senza I/O né UI, riusate identiche da RPC e app:
- `core-ledger`: `balanceEntries(...)→postings[]` (garantisce somma-zero); `checkSolvency(reserve,
  circulating)→bool`; `splitFidelity(points, params)→postings[]`; `nextTxnState(from,event)→state|null`;
  `escrowReleasable(state, confirmations, window)→bool`. Ricevono i **parametri come argomenti**
  (③ ibrido: mai leggono `param_sets` da sé — l'I/O sta nella RPC che li chiama).
- `core-rbac`: `canAssign(actor, capability)`, `roleConflictOnTxn(subject, roles)` (E-D-21),
  `approverLimit(capability)` (E-D-24, mai `own`/`admin`).

La RPC definer fa il minimo I/O (legge stato + `param_sets` del compartimento, chiama la funzione
pura, scrive), così l'invariante è provato **due volte**: dal test puro (property-based) e
dall'autorità DB.

## 6 · Sicurezza & Privacy

| Livello | Misura |
|---|---|
| Confine dati | anon key pubblica ⇒ confine = **DB**: RLS + definer, **testato** (L-001, `grants.test`) |
| Tenant | `owner_id`/`user_id` + RLS su ogni tabella; RPC owner-scoped |
| RBAC | admin-first (E-D-13): `assign_permission` verifica che il chiamante sia ADMIN; capability ∈ {read,verify} soltanto |
| Approvatore | **mai** proprietà/admin (E-D-24): nessuna RPC promuove un delegato a owner; cambio admin = intervento manuale Shaer (fuori UI) |
| Maker-checker | azione permanente da delegato ⇒ `pending`, senza effetto fino ad `approve_pending` (idempotente) |
| Compartimenti | parametri e permessi per-`scope` con RLS (E-D-09): nessun profilo "vede e tocca tutto" |
| Ledger | unico writer definer; somma-zero + solvibilità in-transazione; interi, mai float |
| Privacy trasporto | 2 scansioni, niente GPS continuo (E-D-19); output al consumatore senza PII lavoratore |
| Segreti | mai lato client; `.env*` mai letti/stampati (regola 6); off-ramp/KYC non in F1 (E-D-23) |

**Degradazione sicura**: `earned` non esce senza `kyc_verified` (gate specificato, non costruito);
crediti escrow senza versamento € restano punto contabile (non spendibili). Nessun off-ramp in F1.

## 7 · Ambienti & infra

- **Dev**: `apps/shaer` su Vercel project dedicato (Root Directory `apps/shaer`), **stesso Supabase**
  del Modulo 0 (D-005). Auth condivisa. **Prod**: Supabase separato = **T-008** (`[N]`).
- Migrazioni F1 in `supabase/migrations/` (root), **additive**, applicate da Nick nel SQL editor (`[N]`).
- `packages/db-types` rigenerato dallo schema dopo ogni migrazione: è la verità dei nomi colonna
  (regola 5, mai a memoria).

## 8 · Test come prova (regola 5)

Gerarchia: test verde > valore misurato > browser. Da coprire in F1, tutti **calcolabili ⇒ test**:
- **Ledger** (`core-ledger.test`): somma-zero (AC-EE3.1), solo-TREASURY-conia (AC-EE3.2),
  solvibilità **property-based** (AC-EE3.3), saldo derivato = SUM (AC-EE3.4), off-ramp promo negato
  (AC-EE3.5), escrow `held` escluso + rilascio a 3 condizioni (AC-EE3.7), punto contabile senza € (AC-EE3.8).
- **TXN FSM** (`txn.test`): transizione illegale rifiutata (AC-EE2.1), append-only (AC-EE2.2),
  reward su non-COMPLETED rifiutato (AC-EE2.3), terminale chiuso (AC-EE2.5).
- **RBAC** (`rbac.test`): permesso da non-ADMIN rifiutato (AC-EE1.5), delegato→owner rifiutato
  (AC-EE1.7), doppio ruolo auto-verificante su stessa TXN rifiutato (AC-EE1.8), maker-checker una
  sola volta (AC-EE1.6).
- **Split/fidelity** (`fidelity.test`): emittente 100% (AC-EE10.1), cross-merchant addendi=1 e
  ledger a zero (AC-EE10.2). **Referral** (`referral.test`): 2° livello rifiutato (AC-EE5.1),
  versione immutabile (AC-EE5.2). **Wishlist**: revoca 2h (AC-EE6.1).
- **Grants** (`grants.test` esteso): nessun INSERT diretto a `authenticated` sulle tabelle
  ledger/txn; whitelist anon invariata dopo le nuove RPC.

Il visivo (`[~]`) resta solo per le home/dashboard (E-D-18): eyeball di Nick o harness T-024.

---

*Prossimo passo:* **T-028** ha già decomposto F1 (B1…B4) nei task **T-029…T-035** (vedi `TODO.md`,
ordinati stabilisce→consuma). I requisiti dei blocchi successivi (EE7–EE14) si scrivono
just-in-time quando si costruiscono — non come prosa in anticipo (E-D-26).
