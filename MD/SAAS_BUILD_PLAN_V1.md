# [PLATFORM] — Piano di Costruzione
> Versione 1.0 | Luglio 2026
> Documento educativo e operativo per costruire la piattaforma da zero.
> Scritto per essere leggibile anche da chi non ha mai costruito un'app web da zero,
> con playbook diretto per chi sa già programmare.

---

## COME LEGGERE QUESTO DOCUMENTO

Il documento è strutturato in due modi paralleli:

1. **Testo principale** — pensato per essere formativo. Spiega ogni concetto assumendo poca familiarità, così vale anche per chi arriva da HTML/CSS o da altri linguaggi diversi da JavaScript.
2. **Box "▶ Diretto"** — comandi e codice pronti da copiare, per chi vuole solo eseguire.

Se sai già cosa sono terminale, git, npm, React e SQL, puoi leggere solo i box "▶ Diretto" e i titoli. Altrimenti leggi tutto in sequenza — ci vorrà probabilmente un pomeriggio per digerirlo la prima volta.

---

## INDICE

**PARTE I — CONCETTI**
1. [Cosa costruiamo, in una pagina](#1-cosa-costruiamo-in-una-pagina)
2. [Perché questo stack tecnico e non altri](#2-perché-questo-stack)
3. [Come si legano i pezzi tra loro](#3-come-si-legano-i-pezzi)
4. [Concetti fondamentali di Next.js 16](#4-concetti-nextjs-16)
5. [Concetti fondamentali di Supabase](#5-concetti-supabase)
6. [Multi-tenancy, spiegata semplice](#6-multi-tenancy)

**PARTE II — PREPARAZIONE**
7. [Preparazione dell'ambiente di sviluppo](#7-preparazione-ambiente)
8. [Account e servizi da creare](#8-account-esterni)
9. [Come i servizi si parlano tra loro](#9-collegamenti-servizi)

**PARTE III — SPRINT 1: FONDAMENTA**
10. [Panoramica dello Sprint 1](#10-sprint-1-overview)
11. [Giorno 1 — Ambiente e progetto Next.js](#11-giorno-1)
12. [Giorno 2 — Supabase e prime tabelle](#12-giorno-2)
13. [Giorno 3 — Autenticazione funzionante](#13-giorno-3)
14. [Giorno 4 — Layout, sidebar e routing](#14-giorno-4)
15. [Giorno 5 — Wizard onboarding tenant](#15-giorno-5)
16. [Deliverable dello Sprint 1 e checklist](#16-deliverable-sprint-1)

**PARTE IV — SPRINT 2-10 (roadmap eseguibile)**
17. [Sprint 2 — Sedi, staff, servizi](#17-sprint-2)
18. [Sprint 3 — Widget prenotazione pubblico](#18-sprint-3)
19. [Sprint 4 — Billing SaaS e primo tenant esterno](#19-sprint-4)
20. [Sprint 5 — Shop](#20-sprint-5)
21. [Sprint 6 — Fidelity](#21-sprint-6)
22. [Sprint 7-10 — Network / MLM](#22-sprint-7-10)

**PARTE V — TRASVERSALE**
23. [Best practice di sviluppo solo](#23-best-practice)
24. [Debug e problemi comuni](#24-debug)
25. [Glossario](#25-glossario)
26. [Risorse per approfondire](#26-risorse)

---

# PARTE I — CONCETTI

## 1. COSA COSTRUIAMO, IN UNA PAGINA

Una piattaforma SaaS multi-tenant chiamata **[PLATFORM]** che permette a un piccolo imprenditore di:

- Gestire un centro servizi con prenotazioni online (modulo **STUDIO**)
- Vendere prodotti online (modulo **SHOP**)
- Costruire una rete di vendita multi-livello (modulo **NETWORK**)
- Fidelizzare i clienti con punti e livelli (modulo **FIDELITY**)
- Scrivere articoli e pagine (modulo **CMS**)

Il primo cliente della piattaforma è **Arkés Nails & Beauty** (il tenant zero). Da lì apri ad altri clienti che pagano una subscription mensile + una piccola percentuale sul transato.

Ogni cliente ("tenant") vive in un ambiente isolato dagli altri — vede solo i propri dati, i propri ordini, i propri ambassador. La sicurezza di questo isolamento è la responsabilità architetturale numero uno.

Riferimenti: leggi `SAAS_PIANO_STRATEGICO_V1.md` per il modello di business, `SAAS_ARCHITETTURA_TECNICA_V1.md` per lo schema del database.

---

## 2. PERCHÉ QUESTO STACK

### Cosa significa "stack"

Uno stack tecnologico è l'insieme degli strumenti che scegli per costruire un'applicazione: che linguaggio, che database, che hosting, che servizi esterni. La scelta dello stack determina cosa puoi costruire velocemente, cosa ti costerà tempo, cosa ti bloccherà.

### I sei strumenti scelti

| Strumento | Ruolo | Alternative scartate |
|---|---|---|
| **Next.js 16** | Framework per costruire l'applicazione web | Remix, SvelteKit, plain React |
| **Supabase** | Database + autenticazione + storage + funzioni | Firebase, Prisma+Neon, PlanetScale |
| **Vercel** | Hosting dell'applicazione | Netlify, AWS Amplify, Railway |
| **Stripe** | Pagamenti (checkout, subscription, payout) | PayPal, Adyen, Square |
| **Resend** | Invio email transazionali | Postmark, SendGrid, Mailgun |
| **Tailwind CSS + shadcn/ui** | Stili e componenti dell'interfaccia | Material-UI, Chakra, Bootstrap |

### Perché Next.js 16

Next.js è un framework costruito sopra React. React è la libreria di Facebook per costruire interfacce web componibili. Next.js aggiunge sopra React tutto quello che serve per un'app vera: routing (le pagine), server-side rendering (velocità e SEO), API integrate, ottimizzazione automatica.

Perché la versione 16 in particolare:
- **Turbopack** è ora il bundler di default. Un bundler è il programma che trasforma il tuo codice sorgente in file ottimizzati per il browser. Turbopack è scritto in Rust ed è 5-10 volte più veloce di Webpack (il vecchio bundler). Concretamente: quando cambi una riga di codice, il browser vede l'aggiornamento in 50 millisecondi invece che in 3 secondi. Quando lavori 8 ore al giorno per mesi, questa differenza vale ore.
- **App Router** (introdotto nella 13, maturato nella 15 e 16) è il modo moderno di gestire il routing: una cartella nel filesystem = una URL nell'app. Quando vuoi che `/dashboard/prenotazioni` esista, crei la cartella `app/dashboard/prenotazioni/` e ci metti dentro un file `page.tsx`. È il sistema che renderà **automaticamente funzionanti** i bottoni della sidebar del nostro mockup.
- **Server Components** sono componenti React che girano sul server, non nel browser. Puoi fare `await supabase.from('bookings').select()` direttamente dentro un componente e il codice non viene inviato al browser. Zero JavaScript nel bundle per la logica di dati.
- **Cache Components** con la nuova direttiva `"use cache"` (stabile in 16) danno controllo esplicito su cosa è cacheato e cosa no. Prima era implicito e confuso; ora è chiaro.
- **Params come Promise**: nella 16 quando accedi ai parametri di una rotta dinamica (per esempio `/tenant/[slug]/settings`) devi fare `const { slug } = await params`. È una modifica importante rispetto a Next.js 14: se copi codice vecchio, non funziona.

Confronto rapido con alternative:
- **Remix** è ottimo, filosoficamente simile, ma comunità più piccola e meno template pronti.
- **SvelteKit** è più elegante ma richiede imparare Svelte oltre a JavaScript.
- **Plain React** senza framework significa configurare tu tutto (routing, SSR, build): tempo perso su cose risolte.

### Perché Supabase

Supabase è un servizio che ti dà, in un unico pannello:
- Un database PostgreSQL vero (non un database "finto" tipo NoSQL semplificato)
- Un sistema di autenticazione completo (login con email, Google, ecc.)
- Storage per i file (immagini, PDF)
- Edge Functions per eseguire codice sul server senza gestire server
- Realtime per notifiche live (quando un dato cambia, tutti i client aperti lo vedono subito)
- Una console web per amministrare tutto

Il punto forte è **PostgreSQL vero**. Postgres è il database relazionale più affidabile e potente al mondo. Su Supabase hai accesso completo a SQL, viste, funzioni, trigger, estensioni (come `ltree` per gli alberi della struttura MLM). Puoi fare cose sofisticate come le nostre view calcolate per i saldi ambassador o le colonne generate per la compliance 70/30.

Il secondo punto forte è **Row Level Security (RLS)**: politiche di sicurezza scritte direttamente in SQL che il database applica ad ogni query. Se scrivi una policy che dice "un utente può vedere solo le prenotazioni del suo tenant", ogni query eseguita da chiunque rispetta quella regola. Non c'è modo di aggirarla dal codice del client — è imposto dal database stesso. È la nostra difesa principale contro le fughe di dati tra tenant diversi.

Confronto rapido:
- **Firebase** ha auth e realtime ma il database (Firestore) è NoSQL, brutto da usare per query complesse come i nostri MLM. Non ha SQL. Non ha RLS. Bocciato.
- **Prisma + Neon** ti dà Postgres puro ma devi gestire auth e storage da soli. Più lavoro.
- **PlanetScale** era MySQL con branching, ma non ha più il piano gratuito e MySQL è meno potente di Postgres.

### Perché Vercel

Vercel è la piattaforma di hosting fatta dagli stessi creatori di Next.js. Quando fai `git push` sul tuo repository GitHub, Vercel automaticamente costruisce l'app e la mette online. Nessuna configurazione di server, di reverse proxy, di certificati SSL. Tutto risolto.

Ha anche funzionalità che ci serviranno più avanti: **domini custom programmatici** (quando un tenant vuole `booking.suobrand.com`, chiami un'API Vercel e succede automaticamente) ed **edge network** (l'app viene servita dal server più vicino all'utente, ovunque nel mondo — importante per l'espansione UE).

Piano gratuito ("Hobby") è ottimo per iniziare. Quando la piattaforma cresce, passi a Pro (€20/mese) per feature come SSL wildcard su domini custom, analytics avanzati, team collaboration.

### Perché Stripe

Stripe è lo standard de facto per pagamenti online. Tre prodotti che useremo:
- **Stripe Checkout** — la pagina di pagamento pronta all'uso. Non gestisci tu numeri carta (PCI compliance è complicato).
- **Stripe Billing** — subscription management. Gli utenti pagano €29/mese e Stripe si occupa di rinnovi, fallimenti, cambio piano.
- **Stripe Connect** — per pagare gli ambassador MLM. Ogni ambassador ha un suo Stripe account collegato, tu invii i soldi come "transfer" e Stripe gestisce tasse e compliance internazionale.

Alternative come PayPal hanno developer experience molto peggiore, meno feature avanzate, commissioni comparabili.

### Perché Resend

Resend è un servizio di email transazionali moderno. "Transazionale" significa email che parte in risposta a un evento (conferma prenotazione, reset password, notifica ordine) — non newsletter di massa.

L'API è pulita (`resend.emails.send({...})`), i template si scrivono in React, il pricing è ragionevole (€20/mese per 50.000 email). Alternative come SendGrid e Mailgun sono più vecchie e complicate.

### Perché Tailwind + shadcn/ui

**Tailwind CSS** è un modo di scrivere stili applicando classi predefinite direttamente nell'HTML, invece di scrivere CSS separato. Sembra brutto la prima volta (`<div class="flex items-center gap-2 p-4 bg-white">`) ma dopo una settimana lo apprezzi: non devi mai inventare nomi di classi, non hai file CSS che crescono a caso, il design è sistematizzato.

**shadcn/ui** non è una libreria: è un catalogo di componenti che *copi* nel tuo progetto. Con `npx shadcn add button` copia il file del Button dentro `components/ui/button.tsx`. Da lì è tuo, lo modifichi, lo personalizzi. Nessun vendor lock-in, nessuna dipendenza pesante.

È diventato lo standard nel mondo Next.js perché combina la flessibilità del "copia-incolla" con la coerenza di un design system.

### Cosa NON serve adesso

Cose che potresti sentir nominare ma che nel nostro stack NON servono:
- Redis — Supabase gestisce cache e realtime da solo
- Docker — Vercel e Supabase sono servizi gestiti, non serve containerizzare
- Kubernetes — assolutamente overkill
- GraphQL — Supabase espone il database via REST e SQL diretto, GraphQL sarebbe complessità aggiuntiva senza beneficio
- Redux / MobX / altri state manager complessi — Server Components riducono lo stato client al minimo, gestione locale con `useState` è sufficiente per l'80% dei casi

---

## 3. COME SI LEGANO I PEZZI TRA LORO

Un diagramma vale mille parole. Ecco come i pezzi comunicano:

```
                    ┌──────────────────────┐
                    │  Browser dell'utente │
                    └──────────┬───────────┘
                               │ HTTPS
                               ▼
                    ┌──────────────────────┐
                    │        VERCEL        │
                    │  (edge network)      │
                    │                      │
                    │  Next.js 16 app:     │
                    │  - Server Components │
                    │  - Route Handlers    │
                    │  - proxy.ts (auth)   │
                    └────┬──────┬──────┬───┘
                         │      │      │
                ┌────────┘      │      └────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │   SUPABASE   │ │    STRIPE    │ │    RESEND    │
        │              │ │              │ │              │
        │ Postgres DB  │ │ Checkout     │ │ Email        │
        │ Auth (JWT)   │ │ Billing      │ │ transazionali│
        │ Storage      │ │ Connect      │ │              │
        │ Edge Fns     │ │ Webhook →    │ │              │
        │ Realtime     │ │              │ │              │
        └──────────────┘ └──────┬───────┘ └──────────────┘
                                │ webhook
                                ▼
                    ┌──────────────────────┐
                    │  Vercel /api/stripe  │
                    │  (route handler)     │
                    │  aggiorna Supabase   │
                    └──────────────────────┘
```

Flusso tipico "cliente prenota un servizio":

1. Cliente apre `/prenota` nel browser
2. Vercel serve la pagina (Next.js Server Component) — legge servizi disponibili da Supabase
3. Cliente sceglie servizio, data, ora e conferma
4. Il form invia i dati a un Route Handler (`/api/booking`) su Vercel
5. Il Route Handler chiama Supabase per inserire la prenotazione
6. Il Route Handler chiama Resend per inviare email di conferma
7. Se il servizio è a pagamento anticipato, prima passa da Stripe Checkout
8. Stripe manda un webhook a `/api/stripe/webhook` quando il pagamento è avvenuto
9. Il webhook aggiorna la prenotazione a "pagata" su Supabase

**Il codice della piattaforma vive interamente su Vercel** (il repo GitHub è deployato lì). Supabase, Stripe, Resend sono servizi esterni con cui la tua app comunica via API.

---

## 4. CONCETTI FONDAMENTALI DI NEXT.JS 16

### App Router: la cartella diventa la URL

In Next.js 16 la struttura delle URL è determinata dalla struttura di cartelle dentro `app/`. Regola semplice:

```
app/
├── page.tsx                  → URL: /
├── prenota/
│   └── page.tsx              → URL: /prenota
├── dashboard/
│   ├── page.tsx              → URL: /dashboard
│   ├── prenotazioni/
│   │   └── page.tsx          → URL: /dashboard/prenotazioni
│   └── staff/
│       └── page.tsx          → URL: /dashboard/staff
```

Quando nel sidebar del mockup ho scritto `<a href="/dashboard/prenotazioni">Prenotazioni</a>`, in un progetto Next.js reale quel link **funziona automaticamente** se esiste il file `app/dashboard/prenotazioni/page.tsx`. Ecco perché la sidebar del mockup HTML non fa nulla: perché non c'è un progetto Next.js dietro. Nella piattaforma vera basterà creare i file corrispondenti.

### File speciali di Next.js

Dentro ogni cartella puoi avere file con nomi speciali che Next.js riconosce:

- `page.tsx` — il contenuto della pagina (quello che l'utente vede)
- `layout.tsx` — la struttura che avvolge la pagina (menu, sidebar, footer). Persiste tra le navigazioni.
- `loading.tsx` — quello che si vede mentre la pagina sta caricando
- `error.tsx` — cosa mostrare se c'è un errore
- `not-found.tsx` — 404 personalizzato
- `proxy.ts` (al root del progetto) — codice che gira PRIMA di ogni richiesta, per esempio per controllare l'auth. Sostituisce il vecchio `middleware.ts`.

### Server Components vs Client Components

**Server Components** (default) sono componenti che girano sul server. Il loro codice non viene inviato al browser. Possono fare `async/await`, leggere database direttamente, usare variabili d'ambiente segrete.

```tsx
// app/dashboard/page.tsx — Server Component (default)
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .order('starts_at')
  
  return <div>Prossime prenotazioni: {bookings?.length}</div>
}
```

Questo codice gira sul server. Il browser riceve solo l'HTML risultante. Nessun JavaScript per fetchare dati, nessun loading state manuale, nessuna gestione della session lato client.

**Client Components** sono componenti che girano nel browser. Servono per l'interattività: pulsanti che aprono modali, form controllati, gestione dello stato locale. Si dichiarano mettendo `'use client'` come prima riga del file.

```tsx
// components/theme-switcher.tsx — Client Component
'use client'
import { useState } from 'react'

export function ThemeSwitcher() {
  const [dark, setDark] = useState(false)
  return <button onClick={() => setDark(!dark)}>Cambia tema</button>
}
```

**Regola pratica:** parti sempre da Server Component. Passa a Client Component solo quando ti serve `useState`, `useEffect`, event handlers (onClick, onChange), o browser API (localStorage, ecc.).

### Params come Promise (novità Next.js 16)

Quando una rotta è dinamica (per esempio `/dashboard/prenotazioni/[id]` dove `[id]` è variabile), Next.js 16 passa `params` come Promise:

```tsx
// app/dashboard/prenotazioni/[id]/page.tsx
export default async function BookingDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params  // ← devi awaitare
  return <div>Prenotazione {id}</div>
}
```

Se copi codice da tutorial vecchi (Next 13 o 14), vedrai `params.id` senza await. In Next.js 16 quello dà errore. Ricordati sempre `await params` e `await searchParams`.

### La `proxy.ts` per l'autenticazione

Prima si chiamava `middleware.ts`, in Next.js 16 è diventata `proxy.ts` (per chiarire che è un proxy edge, non un middleware generico). Sta al root del progetto ed è il codice che intercetta ogni richiesta prima che raggiunga la pagina.

Uso tipico: proteggere le pagine che richiedono login.

```ts
// proxy.ts
import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}
```

Il `matcher` dice: applica questo codice a tutte le URL tranne asset statici. `updateSession` (che scriviamo in `lib/supabase/proxy.ts`) verifica il cookie di sessione Supabase e, se necessario, lo rinnova.

### Cache Components (novità Next.js 16)

Prima, Next.js cachava molte cose in automatico e capirne il comportamento era confuso. In Next.js 16 il default è **dinamico** (ogni richiesta viene eseguita) e il caching è **opt-in esplicito** tramite la direttiva `"use cache"`:

```tsx
// Componente cachato manualmente
async function ServicesList({ tenantId }: { tenantId: string }) {
  'use cache'
  const supabase = await createClient()
  const { data } = await supabase
    .from('services')
    .select()
    .eq('tenant_id', tenantId)
  return <ul>{data?.map(s => <li key={s.id}>{s.name}</li>)}</ul>
}
```

Il compiler genera automaticamente una cache key. Puoi controllare la durata con `cacheLife('minutes')` e invalidare con `cacheTag('services', tenantId)`.

Per il nostro progetto: **all'inizio ignorare la cache**. Rendi tutto dinamico. Aggiungi `"use cache"` solo quando misuri che una pagina è lenta.

### Turbopack (default in Next.js 16)

Turbopack è il nuovo bundler. Non richiede configurazione — quando fai `npm run dev` viene usato automaticamente. Vantaggi che noterai subito: il dev server parte in meno di un secondo, gli aggiornamenti sono istantanei, i build production sono più veloci.

---

## 5. CONCETTI FONDAMENTALI DI SUPABASE

### Il progetto Supabase è tre cose

Quando crei un progetto Supabase ottieni:

1. **Un database PostgreSQL vero**, accessibile via SQL (dalla console web) o via API REST auto-generata (Supabase esamina le tabelle e genera automaticamente endpoint HTTP per ognuna).
2. **Un sistema di auth**, con tabella `auth.users` che gestisce email/password, Google OAuth, magic link. Genera JWT (JSON Web Token) firmati.
3. **Un CDN per Storage**, con URL diretti per servire immagini e file.

Tutto sotto la stessa console web e la stessa API.

### Auth: come funzionano i JWT

Quando un utente si logga, Supabase genera un JWT — un token firmato criptograficamente che contiene informazioni sull'utente (id, email, ruoli). Il token viene inviato al browser come cookie.

Ogni richiesta successiva porta il cookie. Il tuo codice Next.js legge il cookie, lo valida, e sa chi è l'utente. Il database Supabase legge lo stesso token e applica le policy RLS di conseguenza.

Il JWT contiene una sezione `app_metadata` dove tu puoi mettere dati custom. Nel nostro caso ci metteremo:

```json
{
  "tenant_id": "uuid-del-tenant",
  "roles": ["admin"],
  "active_plan": "starter"
}
```

Un trigger PostgreSQL popola questa sezione automaticamente ogni volta che qualcuno si logga.

### Row Level Security (RLS): il cuore della sicurezza

Le policy RLS sono regole SQL che filtrano cosa un utente può vedere o modificare. Esempio:

```sql
-- Enable RLS on the table
alter table public.bookings enable row level security;

-- Policy: "you can only see bookings of your tenant"
create policy "bookings_tenant_isolation" on public.bookings
  for all
  using (tenant_id = auth.tenant_id());
```

`auth.tenant_id()` è una funzione helper che legge il JWT e restituisce l'uuid del tenant corrente. La policy dice: "ogni query SELECT/UPDATE/DELETE su bookings può toccare solo righe dove tenant_id corrisponde a quello nel JWT dell'utente."

Applicata a livello database. Nessun modo di aggirarla dal client. Se un utente maligno prova a fare `SELECT * FROM bookings` con l'API REST di Supabase, il database restituisce solo le sue righe.

Questo è **fondamentale per il multi-tenancy**. Ogni tabella del nostro schema avrà policy simili.

### Il client Supabase su Next.js: server, browser, proxy

Ci sono tre modi di parlare con Supabase da Next.js, e usano tre client leggermente diversi:

1. **Server client** — dentro Server Components e Route Handlers. Legge il cookie dalle request headers, chiama Supabase con quel token.
2. **Browser client** — dentro Client Components. Legge il cookie via `document.cookie`, gestisce il refresh automatico del token.
3. **Proxy client** — dentro `proxy.ts`. Aggiorna il cookie di sessione se il token è vicino alla scadenza.

Sono tre file separati in `lib/supabase/`. Ne parliamo nel dettaglio nello Sprint 1.

### Migrations SQL

Il database va costruito con migrations: file SQL numerati che descrivono come lo schema evolve nel tempo. Supabase CLI ti dà i comandi:

```bash
supabase migration new nome_migrazione   # crea un nuovo file
supabase db push                          # applica le migration al remote
```

Le migration vivono in `supabase/migrations/` nel repo. Nomenclatura: `YYYYMMDDHHMMSS_descrizione.sql`. Sono immutabili una volta pushate in produzione — se devi modificare qualcosa fai una nuova migration.

### Edge Functions

Sono funzioni serverless che girano su Supabase, scritte in TypeScript ed eseguite in Deno. Le usi per operazioni server-side che NON vuoi far girare dentro Next.js (per esempio: cron jobs, webhook Stripe, calcolo commissioni MLM).

Le scrivi in `supabase/functions/nome-funzione/index.ts` e le deployi con `supabase functions deploy nome-funzione`.

---

## 6. MULTI-TENANCY

### Cosa significa "tenant"

Ogni cliente della piattaforma è un "tenant" — un inquilino dello stesso edificio (il database), ognuno nel suo appartamento (i suoi dati) e nessuno può entrare nell'appartamento degli altri.

Nell'architettura scelta abbiamo un solo database PostgreSQL condiviso da tutti i tenant. Ogni tabella "di business" ha una colonna `tenant_id` che dice a quale tenant appartiene ciascuna riga. Le policy RLS filtrano tutto in base al `tenant_id` letto dal JWT.

### Come il tenant_id arriva nel JWT

Al login, un trigger PostgreSQL guarda a quale tenant appartiene l'utente (via tabella `tenant_members`) e aggiorna `auth.users.raw_app_meta_data` con `{"tenant_id": "...", "roles": [...]}`. Alla generazione del prossimo JWT (che avviene subito dopo il login), questi dati finiscono nel token.

Da quel momento, ogni chiamata a Supabase da parte di quell'utente porta con sé il tenant_id nel JWT, e le policy RLS filtrano automaticamente.

### Quando un utente appartiene a più tenant

Un utente può essere membro di più tenant (es. Nick è owner di Arkés Beauty ma potrebbe essere anche cliente di un altro tenant). In quel caso mostriamo un **tenant switcher** nella sidebar (già visibile nel mockup, il pulsante "Arkés Beauty NETWORK") che permette di cambiare tenant attivo. Il cambio scrive il nuovo tenant_id nel JWT e ricarica la pagina.

### Il rischio da temere

Una policy RLS scritta male = fuga di dati tra tenant. Un tenant vede gli ordini di un altro. Fine del progetto.

Difese:
- **Ogni policy include SEMPRE `tenant_id = auth.tenant_id()`** — è il primo controllo, sempre.
- **Test automatici** che simulano utenti di tenant diversi e verificano che non vedano nulla che non dovrebbero.
- **Review manuale** di ogni migration che introduce nuove tabelle o policy.

Un pattern universale che seguiremo per ogni tabella con `tenant_id`:

```sql
alter table public.NOMETABELLA enable row level security;

create policy "NOMETABELLA_tenant_isolation" on public.NOMETABELLA
  for all using (tenant_id = auth.tenant_id());

create policy "NOMETABELLA_admin" on public.NOMETABELLA
  for all using (
    tenant_id = auth.tenant_id() AND auth.is_tenant_admin()
  );

create policy "NOMETABELLA_platform_admin" on public.NOMETABELLA
  for all using (auth.is_platform_admin());
```

Tre policy per ogni tabella. Sempre.

---

# PARTE II — PREPARAZIONE

## 7. PREPARAZIONE DELL'AMBIENTE DI SVILUPPO

### Cos'è "l'ambiente di sviluppo"

L'insieme di software installati sul tuo computer per scrivere codice: editor, terminale, compilatori, gestore di versioni. Serve una volta sola, poi ci lavori sopra.

### Il terminale

Il terminale è la finestra dove digiti comandi. Su Mac si chiama Terminal (o meglio iTerm2 che si scarica gratis), su Windows si chiama PowerShell (integrato) o Windows Terminal (da Microsoft Store), su Linux di solito è già presente.

Comandi base che userai continuamente:
- `cd nome-cartella` — entra in una cartella
- `cd ..` — torna indietro
- `ls` (Mac/Linux) o `dir` (Windows) — elenca file
- `mkdir nome` — crea cartella
- `pwd` — mostra dove sei
- `clear` — pulisci la schermata

### Node.js e npm

**Node.js** è un runtime per eseguire JavaScript fuori dal browser (sul tuo computer). Next.js gira su Node.

**npm** (Node Package Manager) è incluso con Node.js. Serve per installare "package" (librerie di codice riutilizzabili) dal registry pubblico.

Alternative a npm che funzionano allo stesso modo: **pnpm** (più veloce, consigliato) e **yarn**. In questo documento uso `npm` perché è il default, ma sentiti libero di sostituire con `pnpm` — se hai già familiarità con pnpm/yarn, sono più veloci di npm per progetti grandi.

**▶ Diretto:**
```bash
# Verifica se Node è installato
node --version    # dovrebbe essere >= 20.x per Next.js 16
npm --version

# Se non ce l'hai, installa Node.js LTS da https://nodejs.org
# Su Mac con Homebrew:
brew install node

# Su Windows: scarica installer da nodejs.org
# Su Linux (Debian/Ubuntu):
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Alternativa consigliata: usa nvm (Node Version Manager)
# https://github.com/nvm-sh/nvm
nvm install 20
nvm use 20
```

### Git

**Git** è il sistema di versionamento del codice. Registra ogni modifica che fai, ti permette di tornare indietro, di lavorare in parallelo su feature diverse.

**GitHub** è un servizio online per ospitare repository Git — l'equivalente di Google Drive ma per codice.

**▶ Diretto:**
```bash
git --version   # verifica installazione

# Se non c'è:
# Mac: viene con Xcode Command Line Tools → xcode-select --install
# Windows: scarica da https://git-scm.com
# Linux: sudo apt install git

# Configurazione iniziale (una volta sola)
git config --global user.name "Il Tuo Nome"
git config --global user.email "tuaemail@example.com"
```

Comandi Git più usati:
- `git init` — inizializza un repo nella cartella corrente
- `git status` — vedi cosa è cambiato
- `git add .` — prepara tutte le modifiche per il commit
- `git commit -m "messaggio"` — salva le modifiche con un messaggio
- `git push` — invia i commit al remote (GitHub)
- `git pull` — scarica gli aggiornamenti dal remote
- `git checkout -b nome-branch` — crea un nuovo branch (linea di sviluppo parallela)
- `git log` — cronologia dei commit

### Visual Studio Code (VS Code)

L'editor che consiglio: gratuito, potente, il più usato al mondo per web development. Scarica da `https://code.visualstudio.com/`.

Estensioni essenziali da installare:
- **ESLint** — segnala errori nel codice mentre scrivi
- **Prettier - Code formatter** — formatta automaticamente il codice
- **Tailwind CSS IntelliSense** — autocompletamento per classi Tailwind
- **TypeScript Vue Plugin** (o le tipizzazioni integrate) — supporto TypeScript
- **GitLens** — Git superpotenziato dentro VS Code

Per installarle: apri VS Code, clicca sull'icona dei blocchetti a sinistra (Extensions), cerca il nome, clicca "Install".

### Estensioni CLI utili

**Supabase CLI** — per gestire migration da terminale:
```bash
# Mac
brew install supabase/tap/supabase

# Windows (via scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Verifica
supabase --version
```

**Stripe CLI** — per testare webhook in locale:
```bash
# Mac
brew install stripe/stripe-cli/stripe

# Windows: scarica installer da https://github.com/stripe/stripe-cli/releases
```

**Vercel CLI** — per deploy da terminale (opzionale, il deploy automatico da git basta):
```bash
npm install -g vercel
```

---

## 8. ACCOUNT E SERVIZI DA CREARE

### Account necessari

Ordine consigliato di creazione:

**1. GitHub** — `https://github.com`
- Serve per ospitare il codice
- Piano gratuito è sufficiente

**2. Vercel** — `https://vercel.com`
- Serve per hosting dell'app
- Fai login *con GitHub* (semplifica il collegamento)
- Piano Hobby è gratuito, sufficiente per l'inizio

**3. Supabase** — `https://supabase.com`
- Serve per database + auth + storage
- Fai login *con GitHub*
- Crea un progetto: nome `platform-dev`, regione `Frankfurt (eu-central-1)` (più vicina all'Italia)
- Password del database: **salvala subito in un password manager**, la userai spesso

**4. Stripe** — `https://stripe.com`
- Serve per pagamenti
- Registrazione richiede dati aziendali (P.IVA, indirizzo). Per test iniziali puoi usare la modalità Test senza dati completi
- Abilita **Stripe Connect** dalle impostazioni (serve per payout MLM)

**5. Resend** — `https://resend.com`
- Serve per email transazionali
- Piano gratuito: 3.000 email/mese, sufficiente per iniziare
- **Verifica un dominio** dopo il signup — usa `arkesbeauty.it` per Arkés, poi il dominio della piattaforma quando ce l'hai

### Domini

Registra due domini se non li hai già:
- Uno per la piattaforma (es. `nomeplatform.com`)
- `arkesbeauty.it` (già esiste per Arkés)

Fornitore consigliato: **Cloudflare Registrar** (prezzo di costo, DNS veloce integrato). Alternativa: Namecheap, GoDaddy.

### Password manager

Se non ne hai uno, prendine uno subito: **1Password**, **Bitwarden** (gratuito open source), **Dashlane**. Ci finiranno decine di credenziali (Supabase password, Stripe secret key, Resend API key, ecc.) — non tenerle in file di testo o nel browser.

---

## 9. COME I SERVIZI SI PARLANO TRA LORO

### Variabili d'ambiente

Ogni servizio esterno (Supabase, Stripe, Resend) ha una **API key** — una stringa segreta che identifica il tuo account. Il tuo codice ha bisogno di conoscerle per chiamare quei servizi. Ma non puoi metterle nel codice sorgente — se pushi su GitHub, diventano pubbliche.

La soluzione sono le **environment variables** (variabili d'ambiente): valori che vivono fuori dal codice, letti a runtime.

Nel tuo progetto Next.js locale, le variabili vivono in un file `.env.local` che NON viene mai committato su Git (è in `.gitignore` automaticamente). Esempio:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

Regola: le variabili che iniziano con `NEXT_PUBLIC_` sono visibili nel browser. Le altre sono solo lato server. Quindi:
- Anon key Supabase → `NEXT_PUBLIC_` (è pensata per essere pubblica, sfruttiamo RLS per la sicurezza)
- Service role key Supabase → NO `NEXT_PUBLIC_` (bypassa RLS, solo server)
- Stripe secret key → NO `NEXT_PUBLIC_` (usa la publishable key per il browser)

Su Vercel le stesse variabili si configurano nel pannello del progetto (Settings → Environment Variables). Non committi mai .env.local ma copi manualmente i valori nel dashboard Vercel.

### Webhook

Alcuni servizi (Stripe soprattutto) hanno bisogno di notificarti eventi: "il pagamento è avvenuto", "la subscription è stata cancellata". Non aspettano che tu chieda — ti chiamano.

Per ricevere le loro chiamate esponi una URL nel tuo codice (per esempio `https://tuaplatform.com/api/stripe/webhook`) e la configuri nel dashboard del servizio esterno. Quel servizio ti manda POST con dati JSON quando succede l'evento.

Per testarli in sviluppo locale, la Stripe CLI ha un comando `stripe listen` che inoltra i webhook al tuo `localhost:3000`.

---

# PARTE III — SPRINT 1: FONDAMENTA

## 10. SPRINT 1: OVERVIEW

**Obiettivo:** a fine settimana avere un'app Next.js deployata su Vercel, connessa a Supabase, con login funzionante e sidebar navigabile. Non c'è ancora business logic — è l'infrastruttura da cui parte tutto.

**Deliverable finale dello Sprint 1:**
- Repo GitHub `[platform]-app` con progetto Next.js 16
- Deploy live su Vercel (URL tipo `platform-app.vercel.app`)
- Progetto Supabase collegato con schema base (`tenants`, `tenant_members`, `profiles`)
- Signup + login funzionanti (email + Google)
- Dashboard con sidebar (identica al mockup) e bottoni che navigano a pagine reali
- Wizard onboarding: al primo accesso, un nuovo utente crea il suo tenant

**Tempo stimato:** 5 giorni pieni per persona C. Per persona A raddoppia — è normale.

---

## 11. GIORNO 1 — AMBIENTE E PROGETTO NEXT.JS

### Verifica prerequisiti

**▶ Diretto:**
```bash
node --version    # deve essere >= 20.x
npm --version
git --version
code --version    # VS Code
```

Se qualcuno manca, torna alla sezione 7.

### Crea il progetto Next.js 16

**▶ Diretto:**
```bash
# Dalla cartella dove vuoi il progetto (es. ~/dev)
cd ~/dev

# Crea progetto Next.js 16
npx create-next-app@latest platform-app

# Rispondi ai prompt:
# - TypeScript? Yes
# - ESLint? Yes
# - Tailwind CSS? Yes
# - src/ directory? No (preferisco senza src/)
# - App Router? Yes
# - Turbopack? Yes (default)
# - Customize import alias? No (usa @/ default)

cd platform-app
```

Il comando crea una cartella con la struttura base di Next.js. Se apri VS Code (`code .`) vedi:

```
platform-app/
├── app/
│   ├── layout.tsx        ← layout root
│   ├── page.tsx          ← homepage
│   ├── globals.css       ← CSS globale + Tailwind
│   └── favicon.ico
├── public/               ← file statici
├── node_modules/         ← dipendenze installate
├── .gitignore
├── next.config.ts        ← configurazione Next
├── tailwind.config.ts    ← configurazione Tailwind
├── tsconfig.json         ← configurazione TypeScript
└── package.json          ← lista dipendenze e script
```

### Avvia il dev server

**▶ Diretto:**
```bash
npm run dev
```

Apri il browser su `http://localhost:3000` — vedi la homepage di Next.js. Dev server con Turbopack, hot reload automatico.

### Installa le dipendenze del progetto

Le librerie che ci serviranno:

**▶ Diretto:**
```bash
# Supabase client + helper SSR per App Router
npm install @supabase/supabase-js @supabase/ssr

# Utility per gestione classi Tailwind
npm install clsx tailwind-merge

# Icone (come nel mockup)
npm install lucide-react

# Form + validazione
npm install react-hook-form @hookform/resolvers zod

# Stripe (per dopo)
npm install stripe @stripe/stripe-js

# Resend (per dopo)
npm install resend
```

### Setup shadcn/ui

**▶ Diretto:**
```bash
npx shadcn@latest init

# Rispondi:
# - Style: Default
# - Base color: Neutral
# - CSS variables: Yes

# Aggiungi i primi componenti che useremo
npx shadcn@latest add button input label card dialog dropdown-menu form
```

Ora hai `components/ui/` con i componenti base pronti.

### Configura Tailwind con i colori Arkés

Apri `tailwind.config.ts` e aggiungi la palette del brand (che riprenderemo dal mockup):

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A87C',
          light: '#F5ECD8',
          deep: '#A8824F',
        },
        ink: '#1C1410',
        cream: '#FAF7F4',
        warm: '#F5EDE8',
        rose: {
          DEFAULT: '#C4687A',
          light: '#F2D4DA',
          deep: '#9A4058',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Jost', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

**Nota:** questi sono i colori Arkés. Nel design multi-tenant vero i colori del brand vengono letti dal database (`tenants.brand_colors`). Per ora hard-coded, poi rendiamo dinamico.

### Crea il repo GitHub e primo push

**▶ Diretto:**
```bash
# Nel terminale, dentro platform-app
git init
git add .
git commit -m "chore: initial Next.js 16 setup"

# Vai su https://github.com/new e crea repo "platform-app" (privato)
# Poi:
git remote add origin git@github.com:tuousername/platform-app.git
git branch -M main
git push -u origin main
```

### Deploy su Vercel

Metodo consigliato: dashboard Vercel.

1. Vai su `https://vercel.com/new`
2. Importa il repo `platform-app` da GitHub
3. Framework: Next.js (auto-detect)
4. Click "Deploy"
5. Aspetta ~2 minuti
6. Vedi URL tipo `platform-app-xyz.vercel.app`

Ogni push su `main` da qui in poi triggera un deploy automatico. Quando fai una feature branch (`git checkout -b feature/nome`), Vercel genera un preview URL per quel branch (utilissimo per testare senza toccare la prod).

**Fine giorno 1:** hai un'app Next.js live su internet.

---

## 12. GIORNO 2 — SUPABASE E PRIME TABELLE

### Crea il progetto Supabase

Se non l'hai già fatto: vai su `https://supabase.com/dashboard`, click "New project".

- Nome: `platform-dev`
- Region: `Frankfurt (eu-central-1)`
- Database password: generane una forte, salvala in password manager

Attendi il provisioning (~2 minuti).

### Copia le API keys

Nel dashboard Supabase, vai su **Settings → API**. Copia:
- `Project URL` (es. `https://abc123.supabase.co`)
- `anon` key (`eyJ...`)
- `service_role` key (`eyJ...`) — segretissima, mai nel browser

### Configura le environment variables

Nella root del progetto crea `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Verifica che `.env.local` sia in `.gitignore` (`create-next-app` lo aggiunge di default).

Su Vercel: **Settings → Environment Variables** → aggiungi le stesse tre.

### Crea i client Supabase per Next.js

Crea la cartella `lib/supabase/` con tre file:

**`lib/supabase/browser.ts`** (per Client Components):

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`lib/supabase/server.ts`** (per Server Components e Route Handlers):

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — ignore.
          }
        },
      },
    }
  )
}
```

**`lib/supabase/proxy.ts`** (per il proxy.ts al root):

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect a login se non autenticato e sta cercando di accedere a /dashboard
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}
```

E crea `proxy.ts` al root del progetto:

```ts
// proxy.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Installa Supabase CLI e collega il progetto

**▶ Diretto:**
```bash
# Se non installata (vedi sezione 7)
supabase --version

# Login (apre browser)
supabase login

# Inizializza dentro il progetto
supabase init

# Collega al progetto remote
supabase link --project-ref abc123
# (abc123 è il ref del tuo progetto, lo vedi nell'URL della dashboard)
```

### Prima migration: tabelle core

```bash
supabase migration new init_core
```

Questo crea `supabase/migrations/YYYYMMDDHHMMSS_init_core.sql`. Aprilo e mettici:

```sql
-- ═══════════════════════════════════════
-- INIT CORE: tenants, profiles, tenant_members
-- ═══════════════════════════════════════

-- Estensioni utili
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ────────────── PLANS ──────────────
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  price_cents_monthly int not null,
  price_cents_yearly int,
  currency text not null default 'EUR',
  features jsonb not null default '{}',
  modules text[] not null,
  is_active boolean not null default true,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- Seed dei piani
insert into public.plans (code, name, price_cents_monthly, modules, features, sort_order) values
  ('starter', 'Starter', 2900, array['studio'], '{"max_locations":1,"max_staff":3}', 1),
  ('business', 'Business', 7900, array['studio','shop','fidelity'], '{"max_locations":3,"max_staff":10}', 2),
  ('network', 'Network', 14900, array['studio','shop','fidelity','network','cms'], '{"max_locations":-1,"max_staff":-1}', 3);

-- ────────────── TENANTS ──────────────
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  legal_name text,
  vat_number text,
  plan_id uuid not null references public.plans(id),
  custom_domain text unique,
  logo_url text,
  brand_colors jsonb not null default '{"primary":"#C9A87C","secondary":"#C4687A"}',
  timezone text not null default 'Europe/Rome',
  default_currency text not null default 'EUR',
  default_locale text not null default 'it',
  country text not null default 'IT',
  billing_email text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz default (now() + interval '14 days'),
  is_active boolean not null default true,
  onboarding_completed boolean not null default false,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ────────────── PROFILES ──────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  preferred_locale text default 'it',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: quando un nuovo utente si registra su auth.users,
-- crea automaticamente il suo profilo
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────── TENANT MEMBERS ──────────────
create table public.tenant_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in (
    'owner','admin','manager','staff','agent','partner_buyer','customer'
  )),
  is_active boolean not null default true,
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique(tenant_id, user_id, role)
);

-- ────────────── HELPER FUNCTIONS ──────────────

-- Legge il tenant_id corrente dal JWT
create or replace function auth.tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id',
    ''
  )::uuid;
$$;

-- Check se l'utente ha un dato ruolo nel tenant corrente
create or replace function auth.has_tenant_role(check_role text)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.tenant_members
    where user_id = auth.uid()
      and tenant_id = auth.tenant_id()
      and role = check_role
      and is_active = true
  );
$$;

-- Check se admin del tenant corrente
create or replace function auth.is_tenant_admin()
returns boolean
language sql
stable
as $$
  select auth.has_tenant_role('owner') or auth.has_tenant_role('admin');
$$;

-- Check se super-admin della piattaforma
create or replace function auth.is_platform_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_platform_admin')::boolean,
    false
  );
$$;

-- ────────────── RLS ──────────────

-- Plans: lettura pubblica dei piani attivi
alter table public.plans enable row level security;
create policy "plans_public_read" on public.plans
  for select using (is_active = true);

-- Tenants: solo membri possono leggere il proprio tenant
alter table public.tenants enable row level security;
create policy "tenants_member_read" on public.tenants
  for select using (
    id in (select tenant_id from public.tenant_members where user_id = auth.uid() and is_active = true)
  );
create policy "tenants_owner_update" on public.tenants
  for update using (
    id in (select tenant_id from public.tenant_members where user_id = auth.uid() and role = 'owner')
  );
create policy "tenants_platform_admin" on public.tenants
  for all using (auth.is_platform_admin());

-- Profiles: si vede solo il proprio
alter table public.profiles enable row level security;
create policy "profiles_own_read" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_own_update" on public.profiles
  for update using (id = auth.uid());

-- Tenant members: si vedono i membri del proprio tenant
alter table public.tenant_members enable row level security;
create policy "tenant_members_self" on public.tenant_members
  for all using (user_id = auth.uid());
create policy "tenant_members_admin_read" on public.tenant_members
  for select using (
    tenant_id in (
      select tenant_id from public.tenant_members
      where user_id = auth.uid() and role in ('owner','admin') and is_active = true
    )
  );
```

Salva il file. Poi applica la migration:

**▶ Diretto:**
```bash
supabase db push
```

Vai nel dashboard Supabase → **Table Editor** → verifichi che le tabelle esistano.

### Trigger per popolare il JWT con tenant_id

Questo è cruciale: dobbiamo dire a Supabase Auth di inserire il `tenant_id` dentro `app_metadata` di ogni utente. Il modo pulito è un **Auth Hook** che modifica il JWT alla generazione.

Crea nuova migration:

```bash
supabase migration new jwt_tenant_hook
```

```sql
-- Hook che aggiunge tenant_id e roles al JWT
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  user_tenant record;
  claims jsonb;
begin
  claims := event->'claims';
  
  -- Trova il primo tenant attivo dell'utente (il default)
  -- In futuro il tenant "attivo" sarà scelto esplicitamente dall'utente
  select tm.tenant_id, array_agg(tm.role) as roles
  into user_tenant
  from public.tenant_members tm
  where tm.user_id = (event->>'user_id')::uuid
    and tm.is_active = true
  group by tm.tenant_id
  limit 1;

  if user_tenant.tenant_id is not null then
    claims := jsonb_set(claims, '{app_metadata,tenant_id}', to_jsonb(user_tenant.tenant_id::text));
    claims := jsonb_set(claims, '{app_metadata,roles}', to_jsonb(user_tenant.roles));
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Da attivare manualmente nel dashboard:
-- Authentication → Hooks → Custom Access Token → public.custom_access_token_hook
```

Applica: `supabase db push`.

Poi nel dashboard Supabase → **Authentication → Hooks → Send Auth Hooks**, seleziona `custom_access_token` → `public.custom_access_token_hook`.

**Fine giorno 2:** database strutturato, RLS attiva, JWT arricchito.

---

## 13. GIORNO 3 — AUTENTICAZIONE FUNZIONANTE

### Configura provider Auth in Supabase

Dashboard Supabase → **Authentication → Providers**:
- **Email**: abilitato di default. Disabilita "Confirm email" per test locali (riattivalo in produzione).
- **Google**: abilita, incolla Client ID e Client Secret da Google Cloud Console.

Per Google OAuth avrai bisogno di un progetto Google Cloud:
1. Vai su `https://console.cloud.google.com`
2. Nuovo progetto: "Platform Dev"
3. APIs & Services → Credentials → OAuth 2.0 Client ID
4. Application type: Web application
5. Authorized redirect URIs: `https://abc123.supabase.co/auth/v1/callback`
6. Copia Client ID e Secret in Supabase

### Crea le pagine di login/signup

**`app/(auth)/login/page.tsx`**:

Cartelle tra parentesi `(auth)` sono **route groups** — organizzano il codice senza aggiungere segmenti all'URL. Quindi la pagina è disponibile a `/login`, non `/(auth)/login`.

```tsx
// app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm border border-black/5">
        <h1 className="font-serif text-3xl mb-2">Accedi</h1>
        <p className="text-sm text-black/60 mb-6">
          Non hai un account? <Link href="/signup" className="text-gold-deep underline">Registrati</Link>
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-ink text-cream hover:bg-gold-deep">
            {loading ? 'Accesso in corso…' : 'Accedi'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-black/10"></div>
          <span className="text-xs text-black/40">oppure</span>
          <div className="flex-1 h-px bg-black/10"></div>
        </div>

        <Button variant="outline" onClick={handleGoogleLogin} className="w-full">
          Continua con Google
        </Button>
      </div>
    </div>
  )
}
```

**`app/(auth)/signup/page.tsx`** — analogo, con `signUp` invece di `signInWithPassword`.

**`app/auth/callback/route.ts`** — route handler per il callback OAuth di Google:

```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
```

### Test del flusso

Apri `http://localhost:3000/signup`, crea un account. Poi login. Se tutto funziona, sei redirectato a `/dashboard` (che ancora non esiste, quindi vedrai 404 — normale, lo creiamo nel giorno 4).

**Fine giorno 3:** signup, login (email + Google), logout tutti funzionanti.

---

## 14. GIORNO 4 — LAYOUT, SIDEBAR E ROUTING

### Struttura routing dashboard

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (public)/
│   ├── page.tsx          → homepage marketing piattaforma
│   └── prenota/          → widget prenotazione pubblico (Sprint 3)
├── (dashboard)/
│   ├── layout.tsx        → sidebar + topbar (dal mockup)
│   ├── dashboard/
│   │   └── page.tsx      → panoramica (KPI, activity)
│   ├── clienti/page.tsx
│   ├── prenotazioni/page.tsx
│   ├── calendario/page.tsx
│   ├── servizi/page.tsx
│   ├── staff/page.tsx
│   ├── sedi/page.tsx
│   ├── prodotti/page.tsx
│   ├── ordini/page.tsx
│   ├── magazzino/page.tsx
│   ├── ambassador/page.tsx
│   ├── rete/page.tsx
│   ├── commissioni/page.tsx
│   ├── payout/page.tsx
│   ├── kit/page.tsx
│   ├── fidelity/page.tsx
│   ├── journal/page.tsx
│   └── impostazioni/page.tsx
├── layout.tsx            → root layout (font, HTML)
└── page.tsx              → redirect a /dashboard o /login
```

### Root layout

**`app/layout.tsx`**:

```tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-serif'
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: '[PLATFORM]',
  description: 'La piattaforma per gestire il tuo business.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="font-sans bg-cream text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
```

### Dashboard layout con sidebar

**`app/(dashboard)/layout.tsx`**:

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Verifica che l'utente abbia almeno un tenant
  const { data: memberships } = await supabase
    .from('tenant_members')
    .select('tenant_id, role, tenants(name, slug, plan_id)')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (!memberships || memberships.length === 0) {
    redirect('/onboarding')
  }

  return (
    <div className="grid grid-cols-[248px_1fr] min-h-screen">
      <Sidebar tenant={memberships[0].tenants} />
      <div className="flex flex-col min-w-0">
        <Topbar user={user} />
        <main className="p-7">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Componente Sidebar

**`components/dashboard/sidebar.tsx`** — traduzione del mockup HTML in React:

```tsx
import Link from 'next/link'
import { NavItem, NavGroup } from './nav-item'
import {
  LayoutGrid, User, Users, Calendar, Sparkles, MapPin,
  Package, ShoppingBag, Archive, Star, Network, Percent,
  ArrowLeftRight, Gift, Heart, Pen, Cog
} from 'lucide-react'

export function Sidebar({ tenant }: { tenant: { name: string, slug: string } }) {
  return (
    <aside className="bg-ink text-cream flex flex-col sticky top-0 h-screen overflow-y-auto">
      <div className="px-5 pt-5 pb-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center">
          <span className="font-serif text-lg text-ink">{tenant.name[0]}</span>
        </div>
        <div className="font-serif text-2xl">{tenant.name}</div>
      </div>

      <button className="mx-3 mb-2 px-3 py-2 border border-white/12 rounded-lg flex items-center gap-2 text-left">
        <span className="w-2 h-2 rounded-full bg-gold"></span>
        <span className="flex-1 text-sm">{tenant.name}</span>
      </button>

      <nav className="flex-1 px-3 pb-5">
        <NavItem href="/dashboard" icon={LayoutGrid} label="Panoramica" />
        <NavItem href="/clienti" icon={User} label="Clienti" />

        <NavGroup label="Studio">
          <NavItem href="/prenotazioni" icon={Calendar} label="Prenotazioni" />
          <NavItem href="/calendario" icon={Calendar} label="Calendario" />
          <NavItem href="/servizi" icon={Sparkles} label="Servizi" />
          <NavItem href="/staff" icon={Users} label="Staff" />
          <NavItem href="/sedi" icon={MapPin} label="Sedi" />
        </NavGroup>

        <NavGroup label="Shop">
          <NavItem href="/prodotti" icon={Package} label="Prodotti" />
          <NavItem href="/ordini" icon={ShoppingBag} label="Ordini" />
          <NavItem href="/magazzino" icon={Archive} label="Magazzino" />
        </NavGroup>

        <NavGroup label="Network">
          <NavItem href="/ambassador" icon={Star} label="Ambassador" accent="rose" />
          <NavItem href="/rete" icon={Network} label="Struttura rete" accent="rose" />
          <NavItem href="/commissioni" icon={Percent} label="Commissioni" accent="rose" />
          <NavItem href="/payout" icon={ArrowLeftRight} label="Payout" accent="rose" />
          <NavItem href="/kit" icon={Gift} label="Kit" accent="rose" />
        </NavGroup>

        <NavGroup label="Fidelizzazione">
          <NavItem href="/fidelity" icon={Heart} label="Fidelity" />
          <NavItem href="/journal" icon={Pen} label="Journal" />
        </NavGroup>

        <NavItem href="/impostazioni" icon={Cog} label="Impostazioni" />
      </nav>
    </aside>
  )
}
```

**`components/dashboard/nav-item.tsx`**:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NavItem({
  href, icon: Icon, label, accent
}: {
  href: string
  icon: LucideIcon
  label: string
  accent?: 'rose'
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative',
        'text-cream/60 hover:bg-white/5 hover:text-cream',
        isActive && (accent === 'rose'
          ? 'bg-rose/16 text-cream'
          : 'bg-gold/14 text-cream'),
      )}
    >
      {isActive && (
        <span className={cn(
          'absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r',
          accent === 'rose' ? 'bg-rose' : 'bg-gold'
        )} />
      )}
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}

export function NavGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="px-3 pb-1.5 text-[9.5px] tracking-widest uppercase text-cream/40 font-medium flex items-center gap-2">
        {label}
        <span className="flex-1 h-px bg-white/8"></span>
      </div>
      {children}
    </div>
  )
}
```

### Pagina Panoramica di default

**`app/(dashboard)/dashboard/page.tsx`**:

```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl">Buongiorno</h1>
      <p className="text-sm text-black/45 mt-1">
        Benvenuto sulla piattaforma. Da qui gestirai tutto il tuo business.
      </p>
      {/* KPI, command center, activity feed — dallo Sprint 2 in poi */}
    </div>
  )
}
```

### Pagine placeholder per il resto

Per ora, ogni cartella menzionata nella sidebar deve avere un `page.tsx`, anche vuoto — altrimenti i link danno 404.

Crea uno script per generarli:

**▶ Diretto:**
```bash
mkdir -p app/\(dashboard\)/{clienti,prenotazioni,calendario,servizi,staff,sedi,prodotti,ordini,magazzino,ambassador,rete,commissioni,payout,kit,fidelity,journal,impostazioni}

# Poi in ognuna metti un page.tsx placeholder
for dir in clienti prenotazioni calendario servizi staff sedi prodotti ordini magazzino ambassador rete commissioni payout kit fidelity journal impostazioni; do
cat > "app/(dashboard)/$dir/page.tsx" << EOF
export default function Page() {
  return (
    <div>
      <h1 className="font-serif text-3xl">$dir</h1>
      <p className="text-sm text-black/45 mt-2">In costruzione.</p>
    </div>
  )
}
EOF
done
```

**Fine giorno 4:** sidebar funzionante, tutti i bottoni portano a pagine reali (placeholder), state attivo visibile.

---

## 15. GIORNO 5 — WIZARD ONBOARDING TENANT

### Il flusso

Quando un nuovo utente si registra e non ha ancora un tenant (`tenant_members` vuoto), lo redirigiamo a `/onboarding`. Lì compila un wizard in 3 step:
1. Nome del business (es. "Arkés Nails & Beauty")
2. Slug (es. `arkes`) e dati fiscali base
3. Scelta del piano

Alla fine, crea:
- Un record in `tenants`
- Un record in `tenant_members` con role `owner`
- Redirect a `/dashboard`

### Pagina onboarding

**`app/(auth)/onboarding/page.tsx`**:

Struttura semplificata. Il codice completo lo lascio come esercizio con guida:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
// ... imports vari

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    vat_number: '',
    plan_code: 'starter',
    billing_email: ''
  })
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit() {
    // 1. Recupera plan_id dallo slug
    const { data: plan } = await supabase
      .from('plans')
      .select('id')
      .eq('code', form.plan_code)
      .single()

    // 2. Recupera user corrente
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !plan) return

    // 3. Crea tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        slug: form.slug,
        name: form.name,
        vat_number: form.vat_number,
        billing_email: form.billing_email,
        plan_id: plan.id
      })
      .select()
      .single()

    if (tenantError || !tenant) {
      alert('Errore nella creazione del tenant: ' + tenantError?.message)
      return
    }

    // 4. Crea tenant_member come owner
    await supabase
      .from('tenant_members')
      .insert({
        tenant_id: tenant.id,
        user_id: user.id,
        role: 'owner',
        accepted_at: new Date().toISOString()
      })

    // 5. Refresh JWT (il claims si aggiornano al prossimo refresh)
    await supabase.auth.refreshSession()

    router.push('/dashboard')
    router.refresh()
  }

  // ... render dei 3 step con form fields
  return <div>{/* wizard UI */}</div>
}
```

### Redirect logic

In `app/page.tsx` (root):

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (!memberships || memberships.length === 0) {
    redirect('/onboarding')
  }

  redirect('/dashboard')
}
```

**Fine giorno 5:** utente nuovo → signup → onboarding wizard → crea tenant → dashboard.

---

## 16. DELIVERABLE DELLO SPRINT 1 E CHECKLIST

A fine settimana:

- [ ] Repo GitHub `platform-app` con codice pushato
- [ ] Vercel deploy live e funzionante
- [ ] Progetto Supabase con schema base applicato
- [ ] Signup con email funziona
- [ ] Login con email funziona
- [ ] Login con Google funziona
- [ ] Logout funziona
- [ ] Nuovo utente redirect a /onboarding
- [ ] Onboarding wizard crea tenant e primo membership
- [ ] Dashboard mostra sidebar con brand del tenant
- [ ] Tutti i bottoni della sidebar navigano a pagine reali
- [ ] Refresh della pagina mantiene la sessione (cookie persistono)
- [ ] Test: aprire dashboard senza login → redirect a /login (protetto da proxy.ts)

**Commit finale dello Sprint 1:**

```bash
git add .
git commit -m "feat: sprint 1 complete — auth, sidebar, onboarding"
git push
```

---

# PARTE IV — SPRINT 2-10

Per gli sprint successivi il documento è più conciso: obiettivi + deliverable, non codice completo. Ogni sprint avrà il suo documento dedicato con il codice quando ci arriveremo.

## 17. SPRINT 2 — SEDI, STAFF, SERVIZI

**Obiettivo:** l'amministratore del tenant può configurare le proprie sedi, il proprio staff e il proprio catalogo servizi.

**Cosa costruire:**
- Migrations: `locations`, `location_hours`, `location_closures`, `staff`, `staff_locations`, `staff_schedules`, `staff_time_off`, `service_categories`, `services`, `location_services`, `staff_services`
- RLS su tutte le tabelle (pattern tenant_isolation + admin + platform_admin)
- Pagine `/sedi`, `/staff`, `/servizi` con CRUD completo (list + form + delete con conferma)
- Server Actions per le mutation (invece di API routes classiche)
- Upload immagini staff su Supabase Storage bucket `staff-photos`
- Import iniziale dei dati Arkés (2 sedi, 8 staff, 133 servizi dal listino V1) via seed script

**Deliverable verificabile:** login come admin Arkés, andare su /sedi, aggiungere una nuova sede, verificare che sia visibile.

**Tempo stimato:** 5-7 giorni.

## 18. SPRINT 3 — WIDGET PRENOTAZIONE PUBBLICO

**Obiettivo:** un cliente finale può prenotare un appuntamento senza login, dalla URL pubblica del tenant.

**Cosa costruire:**
- Migrations: `bookings`, `booking_services`, `booking_events`
- Route pubblica `/[tenant]/prenota` che serve un widget mobile-first
- Server logic per calcolare slot disponibili (data + servizio + staff + orari + prenotazioni esistenti + time_off)
- Form multi-step: servizi → sede/staff → data/ora → dati cliente
- Server Action `createBooking` che inserisce prenotazione + invia email conferma via Resend
- Integrazione Google Calendar via n8n (per Arkés) o API dirette (per altri tenant)
- Pagina admin `/prenotazioni` con lista + filtri + calendario view

**Deliverable verificabile:** primo booking pubblico da un browser non loggato che arriva a Supabase.

**Questo è il primo pezzo che vale davvero soldi — a fine Sprint 3 puoi già usare la piattaforma su Arkés.**

**Tempo stimato:** 7-10 giorni.

## 19. SPRINT 4 — BILLING SAAS E PRIMO TENANT ESTERNO

**Obiettivo:** un nuovo utente può registrarsi, pagare la subscription, iniziare a usare la piattaforma senza il tuo intervento.

**Cosa costruire:**
- Integrazione Stripe Checkout per la subscription (piani Starter/Business/Network)
- Webhook `/api/stripe/webhook` che gestisce `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Sync stato subscription su `tenants.stripe_subscription_id` e feature flags
- Free trial 14 giorni (già in schema con `trial_ends_at`)
- Pagina `/impostazioni/fatturazione` per gestire piano, vedere fatture, aggiornare metodo di pagamento (via Stripe Customer Portal)
- Cron job giornaliero che sospende tenant scaduti
- Terms of Service e Privacy Policy da consulente legale
- Landing page marketing della piattaforma con signup CTA

**Deliverable verificabile:** primo tenant esterno (un tuo amico/conoscente) si iscrive, paga, usa Booking widget.

**Tempo stimato:** 5-7 giorni.

## 20. SPRINT 5 — SHOP

**Obiettivo:** i tenant possono vendere prodotti online.

**Cosa costruire:**
- Migrations shop (13 tabelle: products, variants, inventory, orders, payments, ecc.)
- CRUD prodotti con upload immagini multiple
- Storefront pubblico `/[tenant]/shop` con lista + PDP (Product Detail Page)
- Carrello persistente (guest + auth)
- Checkout con Stripe (multi-item, VAT, shipping)
- Gestione ordini admin: lista, dettaglio, cambio stato, fulfillment
- Inventario multi-sede con movimenti
- Email transazionali (conferma ordine, spedito, consegnato)

**Deliverable verificabile:** primo ordine e-commerce da guest → paid → shipped.

**Tempo stimato:** 10-14 giorni.

## 21. SPRINT 6 — FIDELITY

**Obiettivo:** i tenant possono attivare un programma punti che accumula da prenotazioni e ordini.

**Cosa costruire:**
- Migrations fidelity (`loyalty_programs`, `loyalty_cards`, `loyalty_transactions`)
- Wizard configurazione regole punti
- Trigger DB o Edge Function che calcola punti su booking/order completati
- Riscatto punti come sconto in checkout
- Card virtuale nella dashboard cliente con QR code
- Livelli con benefit differenziati

**Deliverable verificabile:** cliente Arkés fa una prenotazione, riceve punti, li riscatta al successivo appuntamento.

**Tempo stimato:** 7 giorni.

## 22. SPRINT 7-10 — NETWORK / MLM

Questo è il modulo più complesso — 4 sprint dedicati.

**Sprint 7 — Fondamenta MLM:**
- Migrations network (compensation_plans, kit_definitions, agents, network_positions, commission_events, volume_periods)
- Wizard compensation plan builder (con preset Matrix 3×8 di Arkés)
- Registrazione ambassador (referral link, kit purchase, matrix placement)
- Edge Function `mlm-place-agent` (algoritmo di spillover)

**Sprint 8 — Motore commissioni:**
- Edge Function `mlm-compute-commissions` che interpreta le regole JSON del piano
- Ledger append-only con `commission_events`
- View `agent_balances` per saldi calcolati
- Volume tracking mensile per compliance 70/30

**Sprint 9 — Payout e wallet:**
- Stripe Connect onboarding per ambassador
- Wallet transactions e balances
- Payout requests con approvazione admin manuale (vincolo legale)
- Edge Function `payout-process` con Stripe Transfer

**Sprint 10 — Dashboard ambassador:**
- Layout dedicato area ambassador (separato da admin tenant)
- Visualizzazione downline (albero con ltree)
- Materiali marketing su Storage
- Report commissioni, ranking, storia

**Deliverable finale:** Arkés MLM completamente digitale su piattaforma. Tutti i moduli attivi.

**Tempo stimato:** 6-8 settimane totali.

---

# PARTE V — TRASVERSALE

## 23. BEST PRACTICE DI SVILUPPO SOLO

### Git workflow

Anche da solo, usa branch per ogni feature:

```bash
git checkout -b feature/booking-widget
# ... lavori ...
git commit -m "feat: booking widget mobile-first"
git push -u origin feature/booking-widget

# Vercel genera preview automaticamente
# Testi sulla preview URL, se OK:
git checkout main
git merge feature/booking-widget
git push
```

Convenzione messaggi commit (Conventional Commits):
- `feat:` nuova funzionalità
- `fix:` bugfix
- `chore:` maintenance
- `docs:` documentazione
- `refactor:` refactoring senza cambio funzionalità
- `test:` test aggiunti
- `perf:` ottimizzazioni

### TypeScript per la sicurezza dei dati

Genera tipi automatici dal database Supabase:

```bash
supabase gen types typescript --linked > lib/database.types.ts
```

Poi nel client:

```ts
import { Database } from '@/lib/database.types'
export const supabase = createBrowserClient<Database>(...)
```

Ora ogni query è type-safe: se scrivi `.from('bookins')` (typo), TypeScript ti avverte.

### Testing pragmatico da solo

Non serve coprire tutto con test unitari. Focalizzati su:
- **Test end-to-end** dei flow critici (signup, prenotazione, checkout) con Playwright
- **Test di RLS**: script che simula un utente di tenant A e verifica che non veda dati di tenant B

### Deploy safety

- Ambiente staging su Supabase separato (`platform-staging`) collegato a un branch `staging` su Git
- Ogni migration testata su staging prima di push su prod
- Backup Supabase automatici (già attivi sul piano Pro)
- Monitoraggio Sentry per errori

### Non ottimizzare troppo presto

Regola d'oro: prima fai funzionare, poi fai giusto, poi fai veloce.

Il 90% delle "ottimizzazioni" che potresti fare presto sono premature. Aspetta finché non hai dati concreti (Vercel analytics, Sentry, PostHog) che dicono cosa è lento.

---

## 24. DEBUG E PROBLEMI COMUNI

**"Cannot find module @/lib/..."**
→ Verifica `tsconfig.json` — deve avere `"baseUrl": "."` e `"paths": {"@/*": ["./*"]}`.

**"Error: Dynamic server usage" in una page**
→ Stai facendo qualcosa di dinamico (leggere cookie, chiamare `await cookies()`) in un componente che Next.js sta provando a rendere statico. Aggiungi `export const dynamic = 'force-dynamic'` in cima al file.

**RLS blocca query legittime**
→ Vai su Supabase dashboard → SQL Editor → esegui la stessa query con `SET role authenticated; SET request.jwt.claims TO '{...}';`. Debug delle policy in SQL è più veloce.

**JWT non contiene tenant_id**
→ Verifica che il Custom Access Token Hook sia attivato in Auth → Hooks e che l'utente sia in `tenant_members`.

**Deploy Vercel fallisce**
→ Guarda i log build. Cause comuni: variabili d'ambiente mancanti, TypeScript errors, dipendenze non installate.

**Stripe webhook non arriva in locale**
→ Devi usare `stripe listen --forward-to localhost:3000/api/stripe/webhook`. Copia il webhook secret restituito nel tuo `.env.local`.

**Cookies non persistono tra request**
→ In Next.js 16, i cookie devono essere impostati nell'oggetto response del proxy. Verifica il file `lib/supabase/proxy.ts`.

---

## 25. GLOSSARIO

**API (Application Programming Interface)**: modo per due programmi di comunicare. Le API REST usano URL e HTTP verbs (GET, POST, PUT, DELETE).

**App Router**: sistema di routing di Next.js 13+ basato su cartelle.

**Bundler**: programma che unisce e ottimizza il codice sorgente per il browser (Turbopack, Webpack).

**Client Component**: componente React che gira nel browser. Ha `'use client'` all'inizio.

**CLI (Command Line Interface)**: programma controllato via terminale.

**Cookie**: piccolo file che il browser salva per conto di un sito. Usato per session/auth.

**CRUD**: Create, Read, Update, Delete — le quattro operazioni base sui dati.

**Deploy**: pubblicazione dell'app in un ambiente accessibile agli utenti.

**Edge Function**: funzione serverless eseguita su un network edge (vicino all'utente).

**Environment Variable**: variabile di configurazione letta a runtime, non nel codice.

**Framework**: struttura di base che ti guida nel costruire un tipo di applicazione (Next.js per web).

**JWT (JSON Web Token)**: token crittografato che porta informazioni sull'utente.

**Migration**: file SQL che descrive un cambio allo schema del database.

**Multi-tenant**: architettura dove più clienti condividono la stessa infrastruttura ma i loro dati sono isolati.

**npm/pnpm/yarn**: package manager per JavaScript.

**OAuth**: protocollo standard per delegare l'autenticazione a un provider (Google, Facebook).

**PostgreSQL / Postgres**: database relazionale open source.

**Repo (Repository)**: cartella tracciata da Git contenente il codice del progetto.

**Route Handler**: funzione Next.js che risponde a una richiesta HTTP (equivalente API endpoint).

**RLS (Row Level Security)**: policy PostgreSQL che filtrano righe per utente.

**RSC (React Server Component)**: componente React che gira sul server, default in Next.js 16.

**RUNTIME**: quando il codice viene eseguito (contrapposto a build time).

**SaaS (Software as a Service)**: modello di business dove vendi accesso al software via subscription.

**Schema**: la struttura di un database (tabelle, colonne, tipi).

**Server Component**: componente React che gira sul server, non nel browser. Default in App Router.

**Serverless**: modello dove non gestisci server — il provider scala automaticamente.

**Session**: stato di autenticazione dell'utente, tipicamente conservato in cookie.

**SSR (Server Side Rendering)**: rendering HTML sul server invece che nel browser.

**Subscription (Stripe)**: pagamento ricorrente automatico.

**Tenant**: cliente della piattaforma SaaS.

**TypeScript**: JavaScript con tipizzazione statica. Cattura errori a compile time.

**Webhook**: URL che riceve notifiche automatiche da un servizio esterno quando succede un evento.

---

## 26. RISORSE PER APPROFONDIRE

### Documentazione ufficiale
- Next.js 16: `https://nextjs.org/docs`
- Supabase: `https://supabase.com/docs`
- Stripe: `https://stripe.com/docs`
- Tailwind CSS: `https://tailwindcss.com/docs`
- shadcn/ui: `https://ui.shadcn.com/docs`

### Tutorial video (in italiano/inglese)
- "Next.js 16 App Router Full Course" — YouTube (Lee Robinson)
- "Supabase Crash Course for Beginners" — YouTube
- "Building a SaaS with Next.js and Stripe" — YouTube (Web Dev Simplified)

### Libri
- "The Pragmatic Programmer" (David Thomas, Andrew Hunt) — mindset ingegneristico
- "Designing Data-Intensive Applications" (Martin Kleppmann) — quando avrai bisogno di scalare
- "Practical PostgreSQL" — SQL avanzato

### Community
- Discord Supabase: `https://discord.supabase.com`
- Discord Next.js: `https://nextjs-discord.com`
- Reddit: `r/nextjs`, `r/webdev`
- Twitter/X: segui @rauchg (Vercel), @kiwicopple (Supabase), @dan_abramov2 (React)

### Newsletter
- **This Week in React** (Sébastien Lorber) — settimanale, alta qualità
- **Bytes** (Cassidy Williams) — accessibile e divertente
- **Supabase Weekly** — feature updates

### Playground per esperimenti
- StackBlitz: `https://stackblitz.com` — prova Next.js senza installare nulla
- SQL Fiddle: `http://sqlfiddle.com` — test query SQL

---

## PROSSIMI PASSI

Dopo aver letto questo documento:

1. **Setup ambiente completo** (giorno 1 dello Sprint 1)
2. **Approva la scelta del nome piattaforma** — prima di creare progetto Supabase e dominio
3. **Fai lo Sprint 1 giorno per giorno**, chiedendo aiuto quando qualcosa non è chiaro
4. **A fine Sprint 1, apri una nuova sessione** e chiedi "iniziamo Sprint 2" — ti do il documento dedicato

**Documenti di riferimento del progetto** (tutti versionati in questo repo):
- `ARKES_RIEPILOGO_PROGETTO.md` — tutto sul salone
- `SAAS_PIANO_STRATEGICO_V1.md` — business plan
- `SAAS_ARCHITETTURA_TECNICA_V1.md` — schema DB completo
- `SAAS_SESSION_GUIDE_V1.md` — briefing rapido per ogni sessione
- `SAAS_BUILD_PLAN_V1.md` — **questo file**

---

*[PLATFORM] — Piano di Costruzione V1.0 | Luglio 2026*
*⚠️ Aggiornare ad ogni milestone raggiunta o cambio significativo di direzione*
