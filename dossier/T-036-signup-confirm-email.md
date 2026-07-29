---
task: T-036
tier: M
titolo: Signup robusto a Confirm-email — niente dashboard vuota senza sessione
aree: [auth, signup, supabase, confirm-email, sicurezza]
stato: aperto
riporti: 0
sessioni: [2026-07-29c]
---

## Obiettivo
Chiudere la radice del bug «registrazione infinita / utenti finti»: il signup della landing
manda l'utente in dashboard **assumendo** una sessione che con *Confirm email ON* non esiste.

## Cosa è stato fatto
`apps/qr/app/(auth)/login/login-form.tsx`: dopo `signUp`/`signInWithPassword` si legge `data.session`.
Se **manca** la sessione (caso Confirm ON: account creato ma inerte finché non si apre il link) →
schermata «Ti abbiamo inviato un'email di conferma…», **niente** `router.push("/dashboard")`.
Se la sessione c'è (dev, Confirm OFF) → si prosegue come prima. Regge entrambi i mondi. `tsc --noEmit` verde.

## Decisioni
- **Gestire l'assenza di sessione con un messaggio, non forzando il redirect.** Alternativa scartata:
  spingere comunque a `/dashboard` e gestire lì l'utente non autenticato → dashboard vuota/errore, UX peggiore
  e logica di guardia duplicata. Il punto di verità è `data.session`: assente ⇒ conferma pendente, presente ⇒ dentro.

## Perché resta `[~]`
Il ramo **Confirm ON è provabile solo sul progetto prod** (T-008, `[N]` di Nick): su dev
`alrguvxspssjwfmtuhdw` Confirm è OFF (accenderlo romperebbe i test d'integrazione, decisione 2026-07-26c).
Il ramo OFF è invariato e funzionante; il ramo ON è scritto ma non ancora osservato → `[~]` fino a T-008.

## Piano di chiusura (pronto)
1. Nick esegue **T-008** (Supabase prod, *Confirm email ON*, cablaggio Vercel) — come-fare in TODO «Da te».
2. Su prod: signup con email reale → schermata conferma; dopo il link → login → dashboard.
   Con email inesistente → resta alla schermata conferma, **nessun account usabile** = bug chiuso.
3. Opzionale: purga utenti finti già in dev (SQL in «Per Nick», con `select` di verifica prima).

## Attrito
Minimo (una funzione, un ramo). Nessuna decisione aperta. Dipendenza esterna = `[N]` T-008.
