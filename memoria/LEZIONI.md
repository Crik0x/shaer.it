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

## In vigore — testo, a scadenza

| id | nata | lezione | conversione | sessioni |
|---|---|---|---|---|
| L-002 | 2026-07-24 | Supabase valida l'email al signup con **MX reali**: domini di test senza MX (`example.com`, `test.shaer.it`) → 400 `email_address_invalid`. Nei test auth usare un dominio con MX veri (es. `shaer.it`) | `→ regola` — target mai realizzato (helper email in T-007) | **3 ⚠ — decisione dovuta** |
| L-003 | 2026-07-25 | Un client Supabase browser creato **nel corpo** di un componente `'use client'` gira anche nel **prerender di build**: se l'env `NEXT_PUBLIC_*` manca al build, una pagina statica (es. `/login`) fa fallire `next build`. Creare il client **dentro gli handler/effetti**, mai nel corpo | `→ regola` — provata col build senza env (`mv .env.local` → verde) | 0 |

## Ritirate
