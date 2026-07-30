---
task: T-024
tier: M
titolo: Harness verifica auth — sessione SSR-cookie iniettata in una route Next
aree: [auth, ssr, cookie, test, harness, dashboard, next16]
stato: chiuso
riporti: 0
sessioni: [2026-07-31]
---

# T-024 · Harness prova auth (SSR cookie → route)

4ª recidiva del muro «auth non testabile» (PATTERN r.18): ogni comportamento dietro
login — rendering owner-scoped, nav loggata — restava verificabile solo a occhio da
Nick, pur essendo una sessione reale già ottenibile in dev senza email via
`signInWithPassword`. Il gate finale ricadeva su di lui a ogni cosa scoped-utente nuova.

## Il muro, e come è caduto

I 3 tentativi passati sono morti dove tutti muoiono: **replicare a mano l'encoding del
cookie `@supabase/ssr`** (JSON → base64url → chunking `sb-<ref>-auth-token.N`). Il formato
è finicky e cambia fra versioni.

La svolta: **non codificare a mano — far codificare alla libreria stessa.** Un cookie-jar
in memoria (`getAll`/`setAll` su una `Map`) passato a `createServerClient`; una
`auth.setSession({access_token, refresh_token})` fa scrivere alla libreria i cookie già
codificati/chunkati dentro il jar. Si legge il jar → `Cookie:` header. Immune al drift di
formato: qualunque versione di `@supabase/ssr` codifica come sa fare lei.

Corollario verificato: per valori base64url `encodeURIComponent` è di fatto un no-op, e il
parser cookie di Next li ridecodifica — l'encoding **non era** il problema, il codificare a
mano sì.

## Cosa prova

`apps/web/lib/dashboard-auth.test.ts` (1/1 verde sul dev server, 2026-07-31):

1. `signUp` utente effimero → sessione reale (Confirm email OFF in dev).
2. Jar in memoria + `createServerClient` + `setSession` → cookie SSR codificato dalla libreria.
3. `fetch /dashboard` **con** cookie → `200` + l'HTML contiene **l'email di quella sessione**
   (prova identificativa, regola 6: non un 200 generico) + «Esci» (header autenticato).
4. `fetch /dashboard` **senza** cookie → redirect a `/login` (check ottimistico di `proxy.ts`).

Il browser (regola 6) resta per la sola resa visiva/pixel.

## Attrito

Nessuno di rilievo una volta trovata la via del jar. Il test skippa pulito se manca l'env
o se il dev server è spento (`BASE_URL`, default `:3000`) — non è un test puro, colpisce
sia Supabase reale sia una route HTTP viva.

## Riuso

Il pattern jar→setSession→fetch è la fondazione per provare qualunque route protetta futura:
`/dashboard/qr/[short_code]`, header landing loggato, e le prove owner-scoped di **T-016**
(metering/quota dietro login) e **T-020** (slug pro dietro login) — che erano la ragione per
cui T-024 veniva prima nella sequenza.

## Conversione lezione

PATTERN r.18 passa da ⏳ DA FARE (→ test) a ✅ IMPLEMENTATO. Il gate finale su Nick per il
codice scoped-utente non è più necessario dove un assert può vederlo.
