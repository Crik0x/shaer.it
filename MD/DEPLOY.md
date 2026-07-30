# Deploy — QR Platform (`apps/web`) su Vercel

Checklist operativa. Struttura decisa in `memoria/DECISIONI.md` → **D-005**
(monorepo ecosistema Shaer, un Vercel project per app).

## Stato

- Repo GitHub: `https://github.com/Crik0x/shaer.it.git` (privata)
- App da deployare: `apps/web` (QR Platform)
- Supabase: progetto `alrguvxspssjwfmtuhdw` (condiviso con il futuro Shaer MVP)

## 1 · Push su GitHub

```bash
git remote add origin https://github.com/Crik0x/shaer.it.git
git push -u origin main
```

Sicurezza: `.gitignore` esclude `.env*` ovunque; nessun segreto è tracciato
(verificato con `git ls-files | grep -i env` → vuoto).

## 2 · Vercel — nuovo project

1. **New Project** → importa `Crik0x/shaer.it`
2. **Root Directory = `apps/web`** ← fondamentale, è un monorepo
3. Framework: Next.js (auto-rilevato)
4. **Environment Variables** (valori dal tuo `apps/web/.env.local`, mai committati):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` → il dominio del redirect (vedi §4)

Domani, per il Shaer MVP: **secondo** Vercel project, stessa repo, Root Directory
`apps/shaer`.

## 3 · Supabase — Auth per il dominio di produzione

Dashboard → **Authentication → URL Configuration**:
- **Site URL**: il dominio di prod (es. `https://qr.shaer.it`)
- **Redirect URLs**: aggiungi `https://<dominio>/auth/callback` (e l'URL
  `*.vercel.app` se lo usi per il collaudo)

Senza questo, magic link e callback OAuth si rompono in produzione.

## 4 · `NEXT_PUBLIC_SITE_URL` — decisione `[LOCKED]` (regola d'oro 7)

Decide cosa codificano i QR **per sempre**: un QR stampato non si ristampa.

- **Produzione** → un dominio **tuo**, es. `https://qr.shaer.it` (record DNS una
  volta, sempre ri-puntabile → i QR stampati non muoiono mai).
- **Collaudo** → l'URL `*.vercel.app` va bene per provare la pipeline, ma **non
  stampare QR** finché il dominio definitivo non è impostato.

## 5 · Prima del lancio pubblico

- **T-008**: riattivare *Confirm email* ON su Supabase (in dev è OFF).
- Verificare uno scan reale end-to-end dal telefono sul dominio di prod.
