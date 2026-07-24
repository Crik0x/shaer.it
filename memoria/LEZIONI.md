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
| `anonymizeIp` IPv6: filtrando i gruppi vuoti si perdeva `::` e restava l'interface id (`fe80::1`→`fe80:1::`) | `→ test` — `apps/web/lib/scan.test.ts` («anonymizeIp: IPv6 tiene 3 gruppi») |
| Next 16 rinomina Middleware→Proxy: un `middleware.ts` a root non si registra e rompe il dev server (500 «Could not parse module middleware.ts») | `→ hook` — `scripts/git-hooks/pre-commit` §7 blocca se esiste `apps/web/middleware.ts` |

## In vigore — testo, a scadenza

| id | nata | lezione | conversione | sessioni |
|---|---|---|---|---|
| L-001 | 2026-07-24 | Con anon key pubblica il confine di sicurezza è il **DB**, non l'app: ogni garanzia (mascheratura IP, permessi) va imposta dentro la funzione `SECURITY DEFINER`/RLS, mai solo lato applicazione | `→ regola` — target: test sui grant anon (**T-007**) | 2 |
| L-002 | 2026-07-24 | Supabase valida l'email al signup con **MX reali**: domini di test senza MX (`example.com`, `test.shaer.it`) → 400 `email_address_invalid`. Nei test auth usare un dominio con MX veri (es. `shaer.it`) | `→ regola` — target: helper/fixture email di test in **T-007** | 1 |

## Ritirate
