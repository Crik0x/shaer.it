---
task: T-030
tier: C
titolo: RBAC — identità, ruoli, permessi admin-first, verify-gate, maker-checker
aree: [rbac, ruoli, permessi, verifica, maker-checker, admin-first, definer, rls, sicurezza, gestionale]
stato: aperto
riporti: 0
sessioni: [2026-07-30]
---

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

## [N] per Nick (dopo la decisione + scrittura migrazione)
Applicare la migrazione RBAC nel SQL editor (DB dev `alrguvxspssjwfmtuhdw`), poi
rigenerare `packages/db-types`, poi far girare `rbac` DB-test → verde.

## Prossimo passo a freddo
1. Nick decide il piano RBAC (separati vs fusi) → promuovi E-D-NN.
2. Scrivi la migrazione §3.1 + le 2 RPC definer + estendi grants.test → revisore → `[N]` apply.
3. Poi T-042 (schema gestionale) consuma questo.
