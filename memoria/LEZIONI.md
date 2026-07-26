# Lezioni

Una lezione **o diventa codice, o muore**. Ogni voce nasce con una `conversione`:
`→ test` · `→ tipo` · `→ hook` · `→ regola`.

`→ regola` è l'unica che resta testo, e costa contesto a ogni sessione: **tetto 5
voci**. Una lezione ferma su `→ regola` per **3 sessioni** viene riscritta come
controllo meccanico o ritirata.

Gerarchia della forza: nota < lezione < regola < controllo meccanico < hook.

## Convertite — protette senza costare contesto

| Errore originale | Conversione |
|---|---|
| `anonymizeIp` IPv6: filtrando i gruppi vuoti si perdeva `::` e restava l'interface id (`fe80::1`→`fe80:1::`) | `→ test` — `apps/qr/lib/scan.test.ts` («anonymizeIp: IPv6 tiene 3 gruppi») |
| Next 16 rinomina Middleware→Proxy: un `middleware.ts` a root non si registra e rompe il dev server (500 «Could not parse module middleware.ts») | `→ hook` — `scripts/git-hooks/pre-commit` §7 blocca se esiste `apps/qr/middleware.ts` |
| L-001 · Con anon key pubblica il confine è il **DB**: un grant «solo authenticated» non è reale finché non è introspezionato (Supabase concede EXECUTE ad `anon` di default; `revoke … from public` non lo toglie, si revoca da `anon`) | `→ test` — `apps/qr/lib/grants.test.ts` (T-007): fallisce se una funzione/tabella esce dalla whitelist anon `{resolve_qr, anonymize_ip}` |
| L-004 · Type-error TS (es. callback Recharts annotato a mano) fino al deploy rosso: in locale nessuno girava `tsc` (T-011) | `→ hook` — `pre-commit §9`: `tsc --noEmit` su commit che toccano TS di `apps/qr` |
| L-005 · Frontmatter dossier non conforme a MODELLO (`livello:` vs `tier:`, chiavi assenti): rompe il grep del distillatore (T-011/012) | `→ hook` — `pre-commit §8`: 5 chiavi obbligatorie sui `dossier/*.md` |

## In vigore — testo, a scadenza

| id | nata | lezione | conversione | sessioni |
|---|---|---|---|---|
| L-003 | 2026-07-25 | Client Supabase browser creato **nel corpo** di un `'use client'` gira nel **prerender di build**: se manca l'env `NEXT_PUBLIC_*`, una pagina statica (`/login`) fa fallire `next build`. Crearlo **negli handler/effetti** | `→ regola` — provata (build senza env → verde) | 1 |

## Ritirate

- **L-002** (2026-07-24 → ritirata 2026-07-25) · «test auth: email con MX reali,
  mai `@example.com`». Ferma su `→ regola` 3 sessioni; l'errore non si è più
  ripresentato — usare `@shaer.it` nei test è ormai abitudine. Ritirata su
  decisione di Nick: la protezione de-facto resta, il costo contesto sparisce.
