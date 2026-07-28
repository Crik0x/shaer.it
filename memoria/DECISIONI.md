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

## D-014 · 2026-07-27 · Tabella profiles come fondazione per-utente
Contesto: T-022 (fuso del cliente) richiede una casa per-utente dove salvare il fuso;
non esisteva alcuna tabella profilo (solo `qr_codes`, `qr_scans`). Anche T-016 (piano
free/pro + metering) richiederà una riga per-utente. Decisione: creare
**`public.profiles`** (1:1 con `auth.users`, PK `owner_id`) come **fondazione
condivisa** — `timezone` (IANA, default `'UTC'`), `country`, `city` — con RLS
owner-scoped, trigger `on_auth_user_created` (`handle_new_user` definer, revoca L-001)
+ backfill. È **irreversibile** (migrazione `20260727000001` applicata al DB dev il
2026-07-27c) e precede i suoi consumatori (§4): T-016 la **estende**, non la ricrea.
**Aggiorna D-013**: le funzioni pure di `lib/dashboard.ts` NON restano "invariate" —
guadagnano un parametro `timeZone` (default UTC) per bucketizzare nel fuso del cliente,
perché label-only sbaglia heatmap e timeline giornaliera (corretto solo per l'oraria).
Alternative scartate: cookie di TZ (flash al primo load); bucketing client-side coi
timestamp spediti al client (esce da Server Components di default, dati pesanti a 360g).

## E-D-01 · 2026-07-28 · La "rete" è a due livelli — [LOCKED]
Contesto: MLM sì o no? (visione ecosistema, MDD §4.1). Decisione: (A) l'economia referral
**propria** di Shaer è sempre **mono-livello** (solo diretto), via programmi promozionali
parametrici e a tempo; (B) l'**MLM multi-livello** esiste solo come **servizio venduto** al
business (motore parametrico, profondità/larghezza configurabili). Perché: il principio n°6
di SHAER_MASTER vieta la piramide *di Shaer*, non lo strumento *venduto ai business*.
Alternativa scartata: "solo mono-livello, niente MLM" (scarta il NETWORK del build plan e un servizio a valore).

## E-D-02 · 2026-07-28 · Shaer.it = super-piattaforma unica — [LOCKED]
Decisione: build plan (ampiezza moduli) + SHAER_MASTER (motore economico a crediti) + QR
(verifica) = **un solo prodotto**, non tre. Il QR è il Modulo 0. Perché: l'interoperabilità
cross-merchant col wallet unico è il valore che nessun concorrente ha (MDD §1-2).
Alternativa scartata: tenere QR/Shaer/moduli come prodotti separati (silos, la cosa che Shaer combatte).

## E-D-03 · 2026-07-28 · Fidelity universale, non per-tenant — [LOCKED]
Decisione: punti/cashback vivono sul **wallet unico di rete**, spendibili cross-merchant nel
mondo; non fidelity per-negozio. Perché: è il meccanismo di ritenzione del cliente (MDD §2).
Alternativa scartata: fidelity per-tenant come nel build plan (ricrea i silos).

## E-D-04 · 2026-07-28 · Business pay-per-activation, cliente gratuito e premiante — [LOCKED]
Decisione: ogni modulo si attiva a pagamento lato business (subscription + % transato + take
sul margine + fee B2B); il cliente è gratuito e guadagna cashback/commissioni. Perché: nessuno
paga per moduli che non usa; il cliente è beneficiario, non prodotto (MDD §7).
Alternativa scartata: tutto incluso a prezzo unico (barriera d'ingresso, spreco lato business).

## E-D-05 · 2026-07-28 · Il Modulo 0 (QR) è la fondazione anti-frode — [LOCKED]
Decisione: l'albero di QR (`owner_id`/`granted_by`, scan verificate) è la base su cui si
innestano ledger/TXN/recensioni; non si riprogetta. Perché: è già in produzione e provato;
il principio n°1 (integrità solo da TXN verificate via QR) lo richiede (MDD §9). Estende D-008.
Alternativa scartata: riscrivere il modello dati per l'economia (butta 17 task chiusi).

## E-D-06 · 2026-07-28 · Attore TRANSPORTER + Tracciabilità supply-chain — [LOCKED, nodo impl aperto]
Decisione: nuovo attore **TRANSPORTER** (distinto dal rivenditore) + modulo tracciabilità:
hand-off del lotto via scansione QR, dati real-time operatore+dispositivo, condivisione
**chirurgica**, esposizione al consumatore di distanza/costo trasporto. Perché: chiude la
catena internazionale verificata e tutela il consumatore (MDD §3, §5.2). Nodo impl aperto:
privacy/consenso del tracking dipendenti e base giuridica della posizione (MDD §13).
Alternativa scartata: logistica come dato non verificato dichiarato dal seller (niente anti-frode).

## E-D-07 · 2026-07-28 · Wishlist/Compleanni/Crowdfunding — priorità da subito — [LOCKED]
Decisione: modulo wishlist + regali collettivi + gruppi/obiettivi, **da sviluppare presto**.
Perché: è un motore di **segnale d'interesse** più preciso dei cookie (interesse reale,
acquistato sì/no e quando → ri-suggestione temporizzata); ancora a SHAER_MASTER §1.6 (MDD §5.1).
Alternativa scartata: rimandarlo a fase tarda (si perde il segnale che alimenta tutto il resto).

## E-D-08 · 2026-07-28 · Due dashboard + riferimenti verificati — [LOCKED]
Decisione: dashboard **business** (ricca, ≈ arkes_dashboard_v3) e **cliente** (ridotta, da
definire); base funzionale comune = simulatore MVP v5. Perché: due esperienze, una rete
(MDD §8). Nodo aperto: struttura definitiva della dashboard cliente (MDD §13).
Alternativa scartata: una sola dashboard per entrambi (bisogni e permessi troppo diversi).

## E-D-09 · 2026-07-28 · Compartimentazione (decentralizzazione controllata) — [LOCKED, nodo impl aperto]
Decisione: config e segreti in **compartimenti separati**, least-privilege, controllo master al
fondatore; nessun punto (file/tabella/servizio/persona) espone l'intera logica. Perché: sicurezza
interna e protezione del know-how ("nessuno sa e ruba tutto", MDD §11). Nodo impl aperto:
architettura dei parametri — opzione **③ ibrido** (motore unico + dati compartimentati) consigliata,
da confermare nel SAD (MDD §13). Alternativa scartata: motore/config centralizzati ("una sola bottiglia").

## E-D-10 · 2026-07-28 · Ecosistema componibile del commerciante — [LOCKED]
Decisione: ogni business attiva solo i servizi che gli servono e ne compone un ecosistema che
**coopera** con gli altri; nascono i moduli operativi magazzino/riordino/presenze/export
commercialista. Perché: la cooperazione tra ecosistemi è ciò che rende la piattaforma unica (MDD §5.3).
Alternativa scartata: pacchetti verticali rigidi per settore (meno flessibili, più da mantenere).

## E-D-11 · 2026-07-28 · Finanziamento campagne = budget + split + commissione admin — [LOCKED]
Decisione: chi crea la campagna dedica un **budget** e decide lo split (passaparola/MLM, cashback,
altro); Shaer applica la propria commissione dal pannello admin, a tutti o a singoli; i reward
sono **crediti Shaer** dal budget. Perché: è il minipool di SHAER_MASTER §1.4; scioglie "crediti
vs valore business" (MDD §4.2). Verità funzionale nel simulatore v5.
Alternativa scartata: reward in valore proprietario del business (esce dal ledger, non verificabile).

## E-D-12 · 2026-07-28 · damascati = progetto gemello di riferimento — [LOCKED]
Decisione: dashboard e funzionamento si modellano su `D:\Desktop\I Damascati\Code\Sito\damascati`
(stesso stack Next 16 + Supabase, stesso metodo). Perché: condivide le fondamenta → si attinge
struttura e pattern di componenti invece di re-inventarli (MDD §8). Coerente con D-005 (repo separate).
Alternativa scartata: progettare le dashboard da zero (spreco, il gemello esiste già).

## E-D-13 · 2026-07-28 · Pannello unico + RBAC admin-first + maker-checker — [LOCKED]
Decisione: un solo pannello filtrato per ruolo; i dipendenti richiedono **verifica/approvazione**
prima di ogni modifica **permanente**. Ambito v1: **admin-first** (l'admin Shaer assegna permessi
scelti uno a uno; il commerciante in seguito). Perché: sicurezza + compartimentazione (MDD §8.1).
Alternativa scartata: permessi full-business subito (superficie di rischio e complessità premature).

## E-D-14 · 2026-07-28 · Catalogo sempre visibile (PRESTO) + trial — [LOCKED]
Decisione: le voci inattive si mostrano (stile `PRESTO` di damascati) per spingere al FULL;
l'ADMIN attiva prove a tutti/categoria/singolo. Perché: lato UX del pay-per-activation, incuriosisce
e converte (MDD §8.2). Alternativa scartata: nascondere le funzioni non acquistate (zero curiosità, zero upsell).

## E-D-15 · 2026-07-28 · QR operativo + motore incentivi — [LOCKED]
Decisione: QR per postazione/tavolo/dipendente (QR personale abbinato al profilo utente, nomi
modificabili), con attribuzione vendite e **motore incentivi** team (% fatturato su prodotti scelti)
e singolo (bonus fisso o % con min/max). Perché: trasforma il QR in strumento di gestione del
personale verificato (MDD §5.4). Alternativa scartata: incentivi gestiti fuori piattaforma (non verificabili, frodabili).

## E-D-16 · 2026-07-28 · Bonus in escrow a circuito chiuso + arbitrato — [LOCKED]
Decisione: il bonus è **bloccato nel pool** in **crediti Shaer**, spendibili solo se il commerciante
**versa soldi veri** (altrimenti punto contabile); rilasciato solo dopo approvazione del commerciante
+ assenza contestazioni + verifica/arbitrato Shaer. Circuito: utente→QR→commerciante→pool→dipendente.
Perché: tutela promessa e commerciante, nessuno froda (held balance C43, TXN unica verità; MDD §5.4).
Alternativa scartata: bonus in € payroll fuori piattaforma (esce dall'anti-frode e dal ledger).
