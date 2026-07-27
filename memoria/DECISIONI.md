# Decisioni

Append-only. **Non si carica all'avvio**: si apre solo quando una decisione va
riaperta o citata. Una voce = max 6 righe.
`[LOCKED]` non si riapre senza un motivo nuovo. `[OPEN]` va chiusa prima di
costruirci sopra.

Formato di ogni voce: contesto · decisione · perché · **alternativa scartata**.
L'alternativa scartata è la parte che impedisce di rifare la stessa discussione
fra tre settimane.

## D-001 · 2026-07-23 · Prima la QR Platform, poi l'MVP Shaer — [LOCKED]
Contesto: due definizioni di prodotto convivevano (QR Platform in `SCANNER/project.md`
del 23/07, MVP Shaer in `SHAER_MASTER.md` del 18/06). Decisione di Nick: si costruisce
la QR Platform come prodotto autonomo; Shaer la userà come motore di verifica TXN.
Perché: risultato tangibile in settimane e il pezzo anti-frode di Shaer nasce collaudato.
Alternativa scartata: partire dall'MVP Shaer — troppe decisioni di dominio ancora
aperte (C42, C43, C9–C11) e complessità ledger/compliance subito addosso.

## D-002 · 2026-07-23 · Metodo: 3Lab v1.2.0 + intervistatore — [LOCKED]
Contesto: esportare il metodo di damascati qui. Decisione: si installa il kit neutro
3Lab v1.2.0 (`installa.mjs`), più il solo agente `intervistatore` + `/intake` presi da
damascati (servirà a chiudere le decisioni aperte del Master quando si aprirà lo scope Shaer).
Perché: 3Lab è il metodo già distillato — tiene ciò che ha funzionato, scarta ciò che
damascati stesso ha derogato, aggiunge dossier e misura di costo/resa.
Alternativa scartata: copiare damascati com'è (7 agenti, DIARIO, tetti in righe) —
porterebbe i difetti già documentati in `3Lab/CAMBIAMENTI.md`.

## D-003 · 2026-07-23 · Repo git nella radice di D:\Desktop\Shaer.it — [LOCKED]
Decisione: un solo repo alla radice; codice in `apps/`, dominio in `MD/`, storia in
`Archivio/AAAA-MM-GG/`; binari (docx/pptx/pdf) fuori dal versionamento via .gitignore.
Perché: docs e codice versionati insieme evitano la deriva carta/realtà vista su damascati.
Alternativa scartata: sottocartella `Code/` con i doc fuori repo (struttura damascati).

## D-004 · 2026-07-23 · Stack: Next.js 16 full-stack su Supabase — [LOCKED]
Decisione: Next.js 16 App Router + Supabase (Auth/DB/Storage/RLS) + Tailwind/shadcn +
Vercel. RSC e streaming come default, `dynamic import` per i componenti pesanti,
Cache Components/PPR quando servirà. Supera lo stack `SHAER_MASTER §1.3`.
Perché: un solo runtime, lo stack già padroneggiato su damascati, i file più recenti
(SAAS_BUILD_PLAN dell'11/07) convergono lì.
Alternativa scartata: Next 14 PWA + Node/Express + FCM — due deploy da mantenere.

## D-005 · 2026-07-25 · Monorepo ecosistema Shaer, Damascati fuori — [LOCKED]
Contesto: QR Platform è il primo prodotto; Shaer MVP la userà come motore; Damascati
la integrerà. Decisione: **una repo** per l'ecosistema Shaer — `apps/qr` (rinominata
da `apps/web`), domani `apps/shaer`, con `packages/` per il codice condiviso (tipi DB,
core QR, design system) e **lo stesso Supabase**. **Damascati resta la sua repo + il
suo Supabase** e consuma il QR come *servizio* (dominio redirect / API). Vercel: **un
project per app**, Root Directory su `apps/<nome>`, GitHub-connected (repo privata).
Perché: integrare è un confine di rete, non di codice — solo l'accoppiamento forte
(Shaer MVP↔motore: stessi tipi/RLS) giustifica la stessa repo; modifiche atomiche
motore+consumatore, un solo `packages/` come verità.
Alternativa scartata: (a) tutto in una repo incluso Damascati — accoppia due SaaS con
DB diversi; (b) polyrepo QR/Shaer separati — sync cross-repo e pacchetto da pubblicare
per ogni modifica trasversale, puro attrito per un dev solo.

## D-006 · 2026-07-26 · Post-scan ibrido: redirect + landing ospitate — [LOCKED]
Contesto: MDD vuole Session/Event/CRM, ma il QR oggi fa redirect a un URL esterno
(T-003) → dopo lo scan non vediamo più nulla, non possiamo iniettare tracking sul sito
altrui. Decisione: ibrido — il redirect resta il default (regola 7), le landing
ospitate col beacon si aggiungono dove servono; Session/Event/CRM raggiungibili solo lì.
Perché: MDD si costruisce per gradi senza rompere il modello redirect esistente.
Alternativa scartata: solo landing ospitate (build enorme, rompe i QR redirect); solo
redirect (MDD Moduli 2–11 restano visione irraggiungibile).

## D-007 · 2026-07-26 · Dati: PII+CRM col cancello GDPR — [LOCKED]
Contesto: profondità dei dati sul visitatore (D-2 dell'apertura). Decisione: PII
completo + CRM, ma **vincolato** — PII solo con base giuridica piena (consenso, DPA,
diritto all'oblio, SAD §7); default operativo degradato ad **aggregati pseudonimi** +
`visitor_hash` finché il consenso non c'è. Perché: massimo valore analitico scelto da
Nick, ma la PII è un traguardo con cancello legale, non l'impostazione di partenza.
Alternativa scartata: aggregati-only (zero rischio, niente CRM); PII senza cancello
(rischio legale alto prima della validazione).

## D-008 · 2026-07-26 · Gerarchia = albero di QR, non tabella campagne — [LOCKED]
Contesto: forma della gerarchia (D-3 dell'apertura; T-012 l'aveva ipotizzata come
`campaigns`+`campaign_id`). Decisione: **ogni nodo È un QR** — `qr_codes.parent_id`
self-ref + `owner_id` per-nodo (delega intermediario via `granted_by`) + `purpose`;
single-parent in v1. Perché: modella la rivendita per-nodo e ogni livello monitora il
suo sottoalbero — ponte diretto verso SHAER_MASTER (referral/anti-frode/crediti).
Alternativa scartata: `campaigns` separata + `campaign_id` (non modella la delega
per-nodo); molti-a-molti (over-engineering per v1).

## D-009 · 2026-07-27 · Piano free/pro: soglia 100 scansioni/mese — [LOCKED]
Contesto: monetizzazione (feedback Nick 2026-07-27, T-016). Decisione: le analisi
sono gratuite fino a **100 scansioni/mese**; oltre, si bloccano **analisi + export +
creazione di nuovi QR**, ma **mai il redirect** di un QR già pubblicato (regola d'oro
7: un QR stampato resta risolvibile a qualunque volume). La soglia limita il servizio
a valore, non il diritto del QR a esistere. Perché: valore analitico gratuito come
amo, gate sul servizio pro senza tradire la promessa di permanenza del redirect.
Alternativa scartata: bloccare anche il redirect oltre soglia (rompe un QR stampato —
viola la regola 7); free illimitato (nessuna leva di conversione).

## D-010 · 2026-07-27 · Slug personalizzato: eccezione controllata alla regola 7 — [LOCKED]
Contesto: URL personalizzati (feedback Nick 2026-07-27, T-020). Decisione: lo slug è
scelto **alla creazione**, solo utenti **pro**, add-on **2€/mese per link**; immutabile
finché il link vive (regola 7). **Se il QR viene cancellato**, i suoi dati si cancellano
e lo slug **torna disponibile** ad altri utenti. Perché: un QR *cancellato* non è più
pubblicato → il suo indirizzo può essere riassegnato senza rompere nulla di vivo; chi
cancella accetta perdita dati e liberazione dello slug. Il routing del @tag utente resta
da decidere (T-020, nodo aperto). Alternativa scartata: slug modificabile in vita (rompe
la regola 7, un QR stampato punterebbe a un indirizzo morto); slug mai riassegnabile
(spreca lo spazio dei nomi corti, il più conteso).

## D-011 · 2026-07-27 · Provider pagamento = Stripe (T-016)
Contesto: scelta del provider per il piano free/pro (N-c, feedback Nick 2026-07-27b).
Decisione: **Stripe**. Perché: webhook maturi, SCA/EU ok, standard di mercato. La
publishable key (`pk_live_…`, fornita da Nick) è sicura lato client e va in env Vercel
come `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`; la secret key (`sk_live_…`) **mai in repo né
in chat** → solo nei secret Vercel (ambiente Production). Alternativa scartata:
Lemon Squeezy / Paddle (merchant-of-record, IVA UE gestita, ma fee più alta e meno
controllo); rimandare (scartato: Nick ha scelto di sbloccare la costruzione ora).

## D-012 · 2026-07-27 · Riferimento estetico T-017 = arkes_dashboard_v3
Contesto: il restyling dashboard (T-017) va fatto su un riferimento, non a mano libera
(N-d; T-011 respinto per estetica). Decisione: seguire una **struttura simile** a
`D:\Desktop\Arkés\arkes_dashboard_v3.html` (fuori dal repo; da leggere all'apertura di
T-017). I colori restano i token del progetto (regola 8): si prende la **struttura**
—griglia, densità, gerarchia dei widget— non la palette. Alternativa scartata: mano
libera stile Stripe (Nick ha fornito un riferimento concreto).

## D-013 · 2026-07-27 · Fuso orario: UTC nel dato, fuso del cliente nel display
Contesto: le analitiche mostrano "UTC" ovunque (timeline, heatmap); risposta di Nick su
T-006. Decisione: **storage e calcolo restano in UTC** (append-only, deterministico,
testabile); il **display converte nel fuso del cliente**. Granularità timeline:
**Giorno di default + toggle Ora**. Nota implementativa (per il task): un Server
Component non conosce il fuso del browser → la formattazione delle label va su una foglia
`'use client'` (Intl con la TZ del browser) o via un cookie di TZ; le funzioni pure di
`lib/dashboard.ts` continuano a bucketizzare in UTC, la conversione è solo di
presentazione. Alternativa scartata: mostrare UTC al cliente (confonde chi legge orari
locali); salvare in fuso locale (rompe determinismo e confronti cross-fuso).
