# Shaer.it — QR Platform

Piattaforma SaaS proprietaria di QR Code dinamici (creazione, gestione, tracking,
analytics) — primo prodotto dell'ecosistema Shaer.it: il motore di transazioni
verificate via QR che l'MVP Shaer userà come fondamenta anti-frode.

@.claude/rules/lavoro.md
@memoria/STATO.md
@memoria/TODO.md
@memoria/LEZIONI.md

`memoria/REGISTRO.md`, `memoria/DECISIONI.md`, `dossier/` e `MD/` **non si
caricano all'avvio**: si aprono mirati quando servono.

---

## Le regole d'oro

Le prime sei valgono ovunque e vivono per esteso in `.claude/rules/lavoro.md` (e
nel `CLAUDE.md` globale): qui restano come **indice** — il numero è l'indirizzo
citato in tutto il repo, non cambia. Dalla settima in poi sono di questo progetto.

1. **Verificare la realtà prima della carta.** → `lavoro.md §1`.
2. **Fermarsi sull'incongruenza**: opzioni **col costo**, poi la decisione. → `lavoro.md §3`.
3. **Legge di conservazione dei task.** `TODO.md` è un saldo, non si riscrive mai. → `lavoro.md §8-bis`.
4. **L'analisi non muore col task**: ogni task lascia un dossier. → `lavoro.md §8`.
5. **Nessuna prova narrativa dove può esserci un test.** `[~]` solo per il visivo. → `lavoro.md §6`.
6. **Non leggere né stampare mai i file `.env*`.** Nessun segreto lato client.
7. **Un QR pubblicato non si rompe mai.** Lo `short_code` è immutabile e il
   redirect resta sempre risolvibile: un QR stampato su carta non si può
   ristampare. Cambia la destinazione, mai l'indirizzo. Le decisioni `✅` di
   `MD/SHAER_MASTER.md` sono `[LOCKED]`: si riaprono solo con la frase di blocco.
8. **Design system**: Tailwind + shadcn/ui, estetica Stripe/Vercel/Linear
   (`MD/QR_PLATFORM.md` §6). I token vivono nella config Tailwind e nei CSS
   variables globali: mai colori o font inline nelle pagine.
9. **Server Components di default.** `'use client'` solo sulle foglie
   interattive; i componenti pesanti (editor QR, scanner, mappe, grafici) entrano
   con `dynamic import`; streaming con Suspense dove il dato è lento. Le
   statistiche si **derivano** dalle scansioni (append-only), mai si memorizzano
   come saldo. Ogni tabella nasce con `owner_id` e RLS: multi-tenant da subito.
10. **Nessuna libreria nuova senza conferma esplicita.**
11. **Tutto ciò che è rivolto a Nick parla la sua lingua**, ed è pronto da copiare.

## Stack (non cambiare senza chiedere)

- **Next.js 16 App Router** (TypeScript) in `apps/qr/`, deploy Vercel
- **Supabase**: PostgreSQL + Auth + Storage + RLS (progetto dedicato, non quello di damascati)
- **Tailwind CSS + shadcn/ui** · qrcode (generazione) · ZXing (scanner) · Recharts
- Fonti di verità di dominio in `MD/`: `QR_PLATFORM.md` (il prodotto che si
  costruisce ora) · `SHAER_MASTER.md` (dominio Shaer, per dopo — economia crediti,
  TXN, recensioni) · `SAAS_BUILD_PLAN_V1.md` (riferimento tecnico Next 16+Supabase)
- Lo stack Next 14 + Express + FCM citato in `SHAER_MASTER §1.3` è **superato**
  (D-004): fa fede questo file.

## Convenzioni

Lingua italiana, tono diretto e minimo, modifiche chirurgiche, «ogni domanda è
un'opzione con la sua conseguenza» e versionamento-git valgono dal `CLAUDE.md`
globale — qui solo ciò che è di questo progetto:

- **Il tetto di sessione è il contesto**, mai un numero di task: testimone al
  **30%**, tetto duro al **40%**.
- **Con più task aperti**: prima la sequenza, poi il codice (`lavoro.md` §4).
- **Dopo ogni step funzionante**: commit che dice *cosa e perché*, non come.
- **Nulla si cancella**: si archivia datato in `Archivio/AAAA-MM-GG/`.
- **«Per Nick» e il prompt di ripresa** vivono in `memoria/RIPRESA.md` (caricato
  da `/apertura`), si **sostituiscono** a ogni avanzamento.

## Trappole note di questo dominio

⟨Si riempie da sola: quando il `distillatore` distilla un pattern che si è
ripetuto, la sua prevenzione finisce qui o, meglio, in un test.⟩

## Comandi

`/apertura` · `/chiusura` · `/costo` · `/intake` (intervistatore, per aprire un
nuovo scope — es. quando si passerà dall'app QR al dominio Shaer)
