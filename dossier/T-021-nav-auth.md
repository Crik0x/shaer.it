---
task: T-021
tier: M
titolo: Nav della landing consapevole del login (Dashboard + logout)
aree: [auth, landing, nav, server-components]
stato: aperto
riporti: 0
sessioni: [2026-07-27c]
---

## Obiettivo
La nav della landing, da utente loggato, mostra **Dashboard** + un **logout**
raggiungibile invece di Accedi/Registrati. Da anonimo resta com'era.

## Accertato
- `apps/qr/app/_components/site-header.tsx` era un Server Component sincrono con due
  `AuthPopover` (Accedi/Registrati) sempre visibili — il bug.
- Il pattern di sessione lato server esiste già: `dashboard/layout.tsx:15` usa
  `serverSupabase().auth.getUser()`; il logout è `app/auth/signout/route.ts`
  (POST → `signOut()` → redirect `/login`), consumato via `<form action="/auth/signout" method="post">`.

## Decisioni
- **Header async Server Component** (non foglia client): la sessione si legge lato
  server, nessun flash di stato sbagliato. Scartato un client component con fetch
  della sessione (flash + JS inutile, contro reg. 9).
- Logout come `<form>` POST che riusa `/auth/signout`, identico al pattern del
  layout dashboard — nessuna nuova route.

## Attriti
- **Verifica dietro auth**: il ramo *loggato* (il fix vero) non è eyeball-abile
  senza una sessione, e creare account / digitare password è fuori dalle azioni
  che Claude esegue. Provato: (a) logged-out eyeballed su :3000 via `read_page`
  (Accedi/Registrati presenti, l'header async non rompe il rendering); (b) tsc
  verde; (c) revisore approvato; (d) il ramo loggato è strutturalmente identico al
  layout dashboard già in produzione. **Manca solo l'eyeball del ramo loggato** →
  stato `[~]`. Promuove a `[x]`/`[A]` l'occhio di Nick (ha una sessione sul :3000).

## Prova / stato di chiusura
Codice completo, tsc verde, revisore approvato. `[~]` in attesa dell'eyeball di Nick
sul ramo loggato (Dashboard + Esci). Nessun lavoro residuo di codice.
