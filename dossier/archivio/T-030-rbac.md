---
task: T-030
tier: C
titolo: RBAC — identità, ruoli, permessi admin-first, verify-gate, maker-checker
aree: [rbac, ruoli, permessi, verifica, maker-checker, admin-first, definer, rls, sicurezza, gestionale]
stato: chiuso
riporti: 0
sessioni: [2026-07-30]
---

## Composizione — cosa stabilisce per chi consuma
- **Identità/ruoli**: `user_roles` (buyer/seller/producer/transporter, ≤3, `verified_at`) + `is_admin()` +
  `admins` (elevabile). Consuma: **T-032** (conti utente per ruolo), **T-039** (gate «verificato»).
- **Maker-checker multisig** (`pending_actions.required_approvals` + `pending_approvals`, E-D-33): riusabile
  tal quale. Consuma: **T-031** (approvazioni TXN sensibili), **T-042/T-043** (deleghe business).
- **Finestra ADMIN in RLS** (E-D-33 p.3): fondata; la ricerca per email/nome = RPC del pannello **T-043**,
  non riaprire la migrazione. **T-042**: i ruoli operativi (staff/titolare, piano 3 E-D-29) NON vanno in
  `permissions` admin-first — tabelle proprie del gestionale.
- **Non costruito qui** (deliberato): upload KYC (stub, E-D-23); write-flow di `work_*` (T-042).

## CHIUSO (2026-07-30) — prova
Migrazione applicata da Nick sul DB dev; **DB-test `apps/qr/lib/grants.test.ts` verde 9/9** sul DB reale
(`node --test --env-file=apps/qr/.env.local apps/qr/lib/grants.test.ts`): anon-surface + no-INSERT-diretto
(42501) + admin-first + tetto ≤3 (anche **concorrente**) + verify-gate + grant_default_role +
verify_role/approve_pending + admins-SELECT-RLS. Revisore
approvato (`memoria/review/2026-07-30.json`). Commit `ac3d97e`. Sblocca T-031/T-042/T-043.

## Obiettivo
Fondare identità/ruoli/permessi che il ledger F1 e il gestionale (Modulo 7) consumano.
Stabilisce `user_id`+`role`, il **verify-gate** (verified_at NULL → nessuna op business),
i limiti dell'approvatore (E-D-24) e il maker-checker. Consuma RLS/definer di T-029.
Spec di riferimento: `MD/ecosistema/SAD.md` §3.1/§4/§5/§6.

## Fatto in questa sessione (prova)
- **Motore puro `packages/core-rbac/rbac.ts`** (SAD §5) — `canAssign(actor, capability)`,
  `approverLimit(capability)`, `roleConflictOnTxn(subject, assignments)`.
- **Test verde 10/10** `packages/core-rbac/rbac.test.ts`: AC-EE1.5 (non-ADMIN rifiutato),
  AC-EE1.7 (delega owner/admin rifiutata anche per ADMIN), AC-EE1.8 (auto-verifica +
  auto-scambio buyer/seller), + property test 2000×. Comando: `node --test packages/core-rbac/rbac.test.ts`.
- AC-EE1.6 (maker-checker idempotente) **non** è puro: vive nella RPC `approve_pending`,
  test sul DB reale (come "solo-TREASURY-conia" per il ledger).

## Attriti
- **Attrito:** a metà T-030 (leggendo il SAD §3.1 per scrivere la migrazione) è emerso che il SAD non
  distingueva gli **assi di permesso**: la sua `permissions` admin-first e la visione-gestionale
  «il titolare assegna ruoli allo staff» sembravano lo stesso RBAC ma sono piani diversi.
  **Causa vera:** il SAD descrive l'architettura a una quota che non anticipa tutti gli assi concreti;
  l'ambiguità è affiorata solo quando l'implementazione ha provato a tradurla in schema — non in intake.
  **Come risolto:** fermato (regola 3), esposte le opzioni con conseguenza, Nick ha deciso → E-D-29 (tre
  piani) + E-D-30 (dati=consenso×abbonamento). **Prevenibile:** sì — vedi `dossier/PATTERN.md` (gate assi
  di permesso/denaro prima della migrazione). Stesso attrito, stessa forma, di T-029 (conio vs trasferimento).
- **Attrito (revisore, g4):** `revoke all ... from authenticated` su `admins` che ha già una policy di SELECT
  (`admins_select_admin`) → **policy morta**: il grant a livello tabella precede la RLS, scriverla non basta.
  **Causa vera:** confusione fra «togliere il DML» e «togliere tutto»; la SELECT va lasciata al filtro RLS.
  **Come risolto:** `revoke insert,update,delete ... from authenticated` (mig. riga ~380). **Prevenibile:** sì →
  `→ test` L-013 (`grants.test.ts`: non-ADMIN legge `admins` vuoto, non 42501).
- **Attrito (revisore, g3):** tetto ≤3 in `assign_role` via `count`+`insert` **senza lock** → race concorrente
  (identico a T-012 anti-ciclo). **Causa vera:** un vincolo di cardinalità tradotto come check applicativo, non
  come serializzazione. **Come risolto:** `pg_advisory_xact_lock` (mig. riga 237) **+ test concorrente**
  (`grants.test.ts`, Promise.allSettled su assign_role) — vedi `dossier/PATTERN.md`.

## Decisioni prese (alternative scartate)
- **Tre piani separati** (E-D-29) invece di un piano unico dove il titolare assegna anche verify/lettura
  conti — scartato perché riaprirebbe l'anti-frode del ledger (E-D-24).
- **Dati cliente = consenso × abbonamento** (E-D-30) invece di visibilità libera al commerciante — scartato
  per il consenso obbligatorio/granulare (base GDPR) e per monetizzare il dato via abbonamento (MDD §15).
- **Motore puro prima, migrazione [N] dopo** — stessa forma di T-029: il pezzo provabile a costo zero si
  chiude subito e in verde; il layer DB resta un `[N]` che Nick applica.

## INCONGRUENZA — SCIOLTA (E-D-29/30, Nick 2026-07-30)
Erano due (poi tre) piani di permessi che il SAD non distingueva. Deciso:
1. **ADMIN Shaer.it = superuser** (fa tutto, assiste ogni commerciante) — E-D-29.
2. **Sensibili (verify TXN, lettura conti): admin-first** — invariato (E-D-24). Piano di **T-030**.
3. **Operativi del gestionale (menu/catalogo/staff/prenotazioni proprie): al titolare**, via
   ruoli-template con `expires_at`, dipendente vede solo le proprie. **Non toccano money/verify.**
   Vivono nel gestionale (**T-042**), NON nella `permissions` admin-first → E-D-24 intatto.
4. **Dati cliente (storico/abitudini): consenso utente × abbonamento commerciante** (E-D-30) —
   terzo asse, fase CRM/fidelity. Tabella `consents` fondativa = task dedicato prima del CRM.

→ La migrazione di T-030 costruisce **solo il piano 2** (platform admin-first + verify-gate). I
piani 3–4 sono di T-042 e della fase CRM. Nessun blocco residuo: la migrazione è sbloccata.

## Piano pronto — migrazione + RPC (dopo la decisione)
Migrazione additiva `supabase/migrations/2026073000000X_rbac.sql` (SAD §3.1):
- `user_roles` (buyer/seller/producer/transporter, `verified_at`/`verified_by`, unique(user_id,role));
  tetto ≤3 ruoli imposto dal **definer** di assegnazione (conteggio righe), non dallo unique (AC-EE1.1).
- `permissions` (grantee_id, scope, capability∈{read,verify}, granted_by=ADMIN, business_id) — piano 1.
- `work_relationships` (employee↔business, agreed_at) + `work_sessions` (append-only, special_roles[]).
- RLS owner-scoped ovunque; RPC definer `assign_permission` + `approve_pending` (`pending_actions`);
  entrambe `authenticated`-only, **fuori** whitelist anon → estendere `grants.test.ts` (SAD §4/§8).
- Il verify-gate KYC in F1 è **specificato, non costruito** (E-D-23): `verified_at` esiste, l'upload
  documenti è stub. Tabelle gestionale (businesses/staff/role_templates) = T-042, non qui.

## REALIZZATO — migrazione scritta (2026-07-30, sessione 2) `[~]` · include **E-D-33**
- **`supabase/migrations/20260730000001_rbac.sql`** — tabelle `admins` (ADMIN elevabile dal DB, E-D-33:
  `role`+`powers` preimpostati, seed solo service_role), `user_roles` (tetto ≤3 via definer), `permissions`
  (read/verify), `pending_actions` (+`required_approvals`) e **`pending_approvals`** (maker-checker **multisig
  a soglia**, E-D-33), `work_relationships`+`work_sessions` (struttura+RLS, write-flow a T-042).
- **Finestra ADMIN in RLS** (E-D-33 «gestire tutti i profili»): `is_admin()` **no-arg** (sonda solo il chiamante,
  no probe altrui), EXECUTE ad authenticated, usato nelle SELECT policy → l'ADMIN vede tutte le righe di
  controllo + lista `admins` + policy additiva su `profiles`. Ricerca per email/nome = RPC dedicata del
  pannello (T-043), non qui.
- **Definer**: `grant_default_role` (trigger buyer al signup + backfill), `assign_role`, `verify_role`
  (admin-first, stub KYC E-D-23), `assign_permission` (rispecchia `canAssign`), `approve_pending` (**multisig
  idempotente**: firma distinta ≠ maker, chiude a `required_approvals`; ADMIN o delega `verify`). Grant:
  authenticated solo EXECUTE sui 5 RPC; nessun DML diretto; anon invariato (L-001).
- **`apps/qr/lib/grants.test.ts`** — +6 test: no INSERT diretto (42501) su user_roles/permissions/
  pending_actions/pending_approvals/admins; `assign_permission` rifiuta non-ADMIN; `assign_role` impone ≤3 +
  verify-gate; `is_admin()` esposto ma false per non-ADMIN; `grant_default_role` (buyer verificato al signup);
  `verify_role` rifiuta non-ADMIN + `approve_pending` rifiuta azione inesistente. `tsc --noEmit` verde. I test
  sono DB-reali → verdi **dopo** l'apply (rossi prima: tabelle assenti = rosso onesto).
- **Gap sciolto in implementazione**: il SAD non definiva *come* si riconosce un ADMIN → realizzato con tabella
  `admins` + `is_admin()` (fedele a E-D-32). La **2FA** è livello auth (Supabase MFA), fuori dallo SQL.
- **Manca**: revisore (diff tocca produzione, §8) → poi commit → poi `[N]` apply.

## [N] per Nick — applicare la migrazione RBAC
1. Supabase dashboard DB dev `alrguvxspssjwfmtuhdw` › **SQL editor** › incolla il contenuto di
   `supabase/migrations/20260730000001_rbac.sql` › **Run**. (Assume schema con ledger già applicato.)
2. Facoltativo: renditi ADMIN per provare il ramo admin-first →
   `insert into public.admins (user_id) values ('<il-tuo-auth-uid>');`
3. Dalla root: `node --test --env-file=apps/qr/.env.local apps/qr/lib/grants.test.ts` → i 6 test RBAC
   diventano verdi. (`.env.local` sta in `apps/qr/`, non nella root — `--env-file` è relativo al cwd.)
   → scrivi «migrazione RBAC applicata».

## Prossimo passo a freddo
1. ~~Nick decide il piano RBAC~~ → E-D-29/30/31/32 fatte. ~~Scrivi migrazione + RPC + test~~ → fatto `[~]`.
2. **revisore** sul diff SQL+test → se approvato, commit → `[N]` apply.
3. Poi **T-031** (TXN engine) o **T-042** (schema gestionale G1) consumano questo.
