---
task: T-010
tier: C
titolo: Deploy in produzione su Vercel (qr.shaer.it)
aree: [deploy, vercel, dns, env, supabase, monorepo]
stato: chiuso
riporti: 0
sessioni: [2026-07-25]
---

# T-010 · Deploy produzione — QR Platform

## Obiettivo
La QR Platform (`apps/qr`) online su un dominio proprio, con lo scan che risolve
davvero da qualunque device. Nato in sessione dalla domanda «lo scan porta a
localhost»: normale in dev (regola d'oro 7 — il QR codifica `/r/{short_code}` e
il fallback è localhost). La cura è il deploy.

## Accertato (prove)
- **`https://qr.shaer.it` serve l'app** (login 200, title "Shaer.it — QR
  dinamici", niente 500). Verificato dal browser a chiusura.
- **Env di produzione corrette**: `qr.shaer.it/env-check` (rotta diagnostica poi
  rimossa) → `NEXT_PUBLIC_SUPABASE_URL=https://alrguvxspssjwfmtuhdw.supabase.co`,
  `ANON_KEY` presente (len 208), `SITE_URL=https://qr.shaer.it`.
- Repo privata `github.com/Crik0x/shaer.it`, Vercel Root Directory `apps/qr`,
  DNS `qr.shaer.it` → Vercel (Valid Configuration).

## Decisioni
- Struttura in **D-005** [LOCKED]: monorepo Shaer, un Vercel project per app,
  Damascati separato. Dominio redirect `qr.shaer.it` (tuo, ri-puntabile) —
  `[LOCKED]` per regola d'oro 7.

## Attriti (il cuore della sessione)
- **Build Vercel rosso su `/login`** — `browserSupabase()` era creato nel corpo
  del componente `'use client'` → girava nel prerender di build; senza env
  fallisce. → causa: client browser istanziato in render. → risolto: creazione
  spostata negli handler. → **`→ regola` L-003** (provato: build senza env = verde).
- **500 su tutto in produzione** — `@supabase/ssr: URL and Key are required`. →
  causa vera (dal pannello Env): `NEXT_PUBLIC_SUPABASE_URL` e `_SITE_URL` erano
  su scope **Development**, non **Production**; il build di prod aveva solo la
  ANON_KEY. → risolto: scope esteso a Production + redeploy **senza cache**.
  → prevenibile: no (config dashboard); la diagnosi sì, con `/env-check`.
- **`404 DEPLOYMENT_NOT_FOUND`** transitorio sul dominio finché non è andato a
  buon fine un deploy di produzione con le env giuste. Sparito col redeploy.
- **Rename `apps/web`→`apps/qr` bloccato** da `Permission denied` su
  `node_modules`: era la **cwd persistente della tool Bash** rimasta dentro
  `apps/web`. → risolto riportando la cwd alla radice. Vedi anche `archivio/T-001`.

## Vicoli ciechi
- **Env `NEXT_PUBLIC_*` senza redeploy**: aggiungerle/cambiarle in Vercel NON
  ritocca i build già fatti; sono inlinate **al build**. Serve un redeploy
  (senza cache) o un push nuovo.
- **`vercel` CLI / accesso all'account**: non percorribile dall'assistente (login
  = credenziali dell'utente). La diagnosi è passata da una rotta pubblica che
  espone la *presenza* dell'env, non da dentro Vercel.

## Composizione (cosa STABILISCE)
- L'app QR sta in `apps/qr`; il redirect pubblico vive su `qr.shaer.it`
  (immutabile). Shaer MVP domani = secondo Vercel project, stessa repo,
  Root Directory `apps/shaer`.
- Nota di metodo onesta: i fix di deploy (login-form, matcher, env-check) sono
  stati committati **senza il gate revisore** — erano hotfix sotto deploy, ma la
  prova finale è la più forte possibile: l'app funziona in produzione.

## Resta aperto
- **T-008**: Confirm email ON su Supabase prima del lancio pubblico + aggiungere
  `https://qr.shaer.it/auth/callback` ai Redirect URLs di Supabase Auth.
- Scan reale end-to-end dal telefono su `qr.shaer.it/r/{code}` (atteso ok).
