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

## In vigore — testo, a scadenza

| id | nata | lezione | conversione | sessioni |
|---|---|---|---|---|
| L-001 | 2026-07-24 | Con anon key pubblica il confine di sicurezza è il **DB**, non l'app: ogni garanzia (mascheratura IP, permessi) va imposta dentro la funzione `SECURITY DEFINER`/RLS, mai solo lato applicazione | `→ regola` — target: test sui grant anon (**T-007**) | 1 |

## Ritirate
