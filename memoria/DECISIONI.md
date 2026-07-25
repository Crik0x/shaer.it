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
