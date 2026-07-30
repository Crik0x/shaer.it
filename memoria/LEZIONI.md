# Lezioni

Una lezione **o diventa codice, o muore** (`lavoro.md §9`). Conversione: `→ test`·`→ tipo`·`→ hook`·`→ regola`.
`→ regola` resta testo e costa contesto: **tetto 5 voci**, e a 3 sessioni ferma si converte o si ritira.

## Convertite — protette senza costare contesto

| Errore originale | Conversione |
|---|---|
| `anonymizeIp` IPv6: filtrando i gruppi vuoti si perdeva `::` e restava l'interface id (`fe80::1`→`fe80:1::`) | `→ test` — `apps/web/lib/scan.test.ts` («anonymizeIp: IPv6 tiene 3 gruppi») |
| Next 16 rinomina Middleware→Proxy: un `middleware.ts` a root non si registra e rompe il dev server (500 «Could not parse module middleware.ts») | `→ hook` — `scripts/git-hooks/pre-commit` §7 blocca se esiste `apps/web/middleware.ts` |
| L-001 · Con anon key pubblica il confine è il **DB**: un grant «solo authenticated» non è reale finché non è introspezionato (Supabase concede EXECUTE ad `anon` di default; `revoke … from public` non lo toglie, si revoca da `anon`) | `→ test` — `apps/web/lib/grants.test.ts` (T-007): fallisce se una funzione/tabella esce dalla whitelist anon `{resolve_qr, anonymize_ip}` |
| L-004 · Type-error TS (es. callback Recharts annotato a mano) fino al deploy rosso: in locale nessuno girava `tsc` (T-011) | `→ hook` — `pre-commit §9`: `tsc --noEmit` su commit che toccano TS di `apps/web` |
| L-005 · Frontmatter dossier non conforme a MODELLO (`livello:` vs `tier:`, chiavi assenti): rompe il grep del distillatore (T-011/012) | `→ hook` — `pre-commit §8`: 5 chiavi obbligatorie sui `dossier/*.md` |
| L-006 · CTE ricorsiva su albero self-ref (`parent_id`) senza clausola `CYCLE` + trigger anti-ciclo senza lock atomico → UPDATE concorrenti che si scambiano il genitore chiudono un ciclo → loop infinito sul rollup ricorsivo owner-scoped (T-012, colto dal revisore) | `→ test` — `apps/web/lib/tree.test.ts` (anti-ciclo sequenziale + concorrente A↔B; verde sul DB reale 4/4) |
| L-007 · Funzione/RPC nuova (TS o SQL) committata senza test: la ferma solo il revisore, un round-trip. 3 occorrenze (T-011, T-012 ×2, la 3ª una RPC SQL inerte pure senza consumatore) | `→ hook` — `pre-commit §10` (avviso): il nome di una `export function`/`create function` nuova che non compare in nessun `*.test.ts` viene segnalato prima del commit |
| L-008 · Decisione strutturale marcata `[LOCKED]`/«deciso» in un dossier o in TODO ma non promossa a `DECISIONI.md` come `D-NNN` nello stesso giro. 3 occorrenze (T-008, T-016, T-020) | `→ hook` — `pre-commit §11` (avviso): righe aggiunte con `[LOCKED`/`deciso (202…` in `dossier/*.md` o `TODO.md` senza `DECISIONI.md` nel commit vengono segnalate |
| L-009 · `stato:` nel frontmatter di un dossier fuori dall'enum `aperto\|chiuso` (T-019 scrisse `in-corso`): superava il check-presenza chiavi di §8 ma rompe i filtri per stato. Colto solo dal distillatore | `→ hook` — `pre-commit §8`: valida il **dominio** di `stato`, non solo la presenza della chiave (blocca se ∉ `{aperto,chiuso}`) |
| L-010 · Sessione senza `/apertura`: ancora `Apertura:` di STATO stantia → la `/chiusura` diffa la baseline sbagliata (2026-07-28) | `→ hook` — `pre-commit §12`: l'ancora dev'essere un commit reale e antenato di HEAD (la freschezza resta a `/apertura`) |
| L-011 · In una RPC che scrive denaro, un `p_kind` dichiarato dal chiamante non è un'attestazione, e un gate d'invariante scoped a un conto esemplare invece che universale conia backed dal nulla (T-029 respinta) | `→ test` — `apps/web/lib/ledger.test.ts` (T-029a): i 2 exploit (conio da TREASURY via authenticated; scoperto conto non-TREASURY) e l'INSERT diretto sono **tentati e rifiutati**, verde 4/4 sul DB reale (2026-07-30) |
| L-013 · `revoke all … from authenticated` su una tabella con **già** una policy RLS di SELECT (es. ADMIN) rende la policy **morta**: il grant precede la RLS (revisore T-030 g4) | `→ test` — `apps/web/lib/grants.test.ts`: un non-ADMIN legge `admins` **vuoto** (RLS filtra), non `42501` |

## In vigore — testo, a scadenza

- **L-012** (2026-07-30) · Un `T-NNN` citato in un dossier/`DECISIONI.md` ma assente dal saldo di `TODO.md`
  si perde (viola §8-bis). **`→ hook`** (da costruire): `pre-commit` segnala un `T-NNN` presente in
  `dossier/*.md`/`DECISIONI.md` ma non nel saldo TODO. Sessioni in attesa: 2.
- **L-014** (2026-07-30) · I motori puri in `packages/` (`ledger.ts`, `rbac.ts`, `txn.ts`) non hanno
  copertura `tsc` nel pre-commit (§9 copre solo `apps/web`): type-checkati solo a mano, sessione per
  sessione. **`→ hook`** (da costruire): estendere `pre-commit §9` a `packages/**/*.ts` (speculare a
  L-004, costo basso). Sessioni in attesa: 1.
- **L-015** (2026-07-30) · Una decisione strutturale in un dossier `tier: C` scritta con parole diverse da
  «[LOCKED»/«deciso (202…» (qui «Decisione FSM») **sfugge** al `pre-commit §11` (L-008): manca sia il
  `D-NNN` sia la prova della conferma di Nick. 3ª recidiva del pattern PATTERN r.19 (T-029/030/031).
  **`→ hook`** (da costruire): estendere §11 alle intestazioni `## Decision*` in dossier `tier: C` senza
  `DECISIONI.md` nel commit. Sessioni in attesa: 1.

## Ritirate

- **L-003** (ritirata 2026-07-27) · client Supabase in `'use client'` → `next build` rosso: 0 ricorrenze da T-010, `tsc` (pre-commit §9) lo copre.
- **L-002** (ritirata 2026-07-25) · email test con MX reali (`@shaer.it`, mai `@example.com`): abitudine consolidata, 0 ricorrenze.
