---
task: T-019
tier: M
titolo: Pagina analisi del singolo QR
aree: [analytics, dashboard, qr-detail, dati-personali, ux]
stato: aperto
riporti: 0
sessioni: [2026-07-27, 2026-07-27b]
---

# T-019 · Migliorare l'analisi del singolo QR code

Aperto dal feedback di Nick (2026-07-27): "stessa cosa per l'analisi del singolo QR".

## Direzione (confermata)
Riusare **le stesse funzioni pure** di `lib/dashboard.ts` (groupCount, dailyBuckets,
hourlyBuckets, hourDayMatrix, uniqueCount, insights) filtrando le scansioni sul
singolo `qr_id`. È **composizione**, non logica nuova: il motore è già scritto e
testato in T-014.

## Fatto — sessione 2026-07-27b
`app/dashboard/qr/[short_code]/page.tsx` **riscritta** da timeline-via-RPC a
derivazione-in-JS, allineata alla dashboard aggregata (T-014/T-015):

- Query `qr_scans` filtrata `.eq("qr_id", qr.id)` + finestra periodo `?d=` (stessi
  PERIODS di T-015, default 30g, vista oraria 7g a 168 barre).
- Widget scoped al QR: KPI (totali, ultimi 7g, unici, + **Sottoalbero/proprie** se il
  nodo ha discendenti), consigli `insights()`, timeline a barre, breakdown
  device/browser/OS/lingua, geo paese/città, heatmap giorno×ora.
- **Rollup** (T-012): `qr_tree_rollup()` → riga del nodo → `own_scans` vs
  `subtree_scans`; il KPI "Sottoalbero" compare solo se `subtree > own`.
- Trend 7g vs 7g precedenti: due count query dedicate `.eq("qr_id")`, indipendenti dal
  periodo (come l'aggregata).
- Rimossi i 2 componenti ora superati: `analytics-panel.tsx`, `analytics-chart.tsx`
  (una superficie Recharts in meno, L-004). `qr-timeline.ts` + i suoi test + la RPC
  `qr_scans_timeline` restano (infra testata, RPC ancora valida).

### Prova
- `dashboard.test.ts` **16/16 verde** — l'intero motore riusato è coperto.
- `tsc --noEmit -p apps/qr` **pulito** (colonne verificate sullo schema: `qr_scans.qr_id`,
  `os/lang/country/city/visitor_hash`; `qr_codes.purpose`).
- Route `GET /dashboard/qr/demo123` → **307 → /login**, nessun 500: il modulo route
  compila sotto il compilatore reale di Next, non solo tsc.

## Resta `[~]` — l'eyeball loggato
Il solo pezzo non verificato è il **rendering della pagina da utente loggato**. Non
automatizzabile in locale: l'auth è magic-link (serve il click su un link email), la
guardia `dashboard/layout.tsx` fa `auth.getUser()` e redirige a /login senza sessione.
In locale gli unici sono comunque sempre 0 (`visitor_hash` null, nessun IP reale).

### Come chiudere (2 min)
1. Loggarsi (locale o `qr.shaer.it`), aprire un QR dalla lista "I tuoi QR" → apre
   `/dashboard/qr/<short_code>`.
2. Confermare: KPI popolati, selettore Periodo naviga (URL `?d=`), timeline/breakdown/
   heatmap rendono, e — se il QR ha figli — compare il KPI "Sottoalbero".
3. In prod, dopo il redeploy con `VISITOR_SALT`, gli unici del singolo QR salgono
   scansionando da IP reale (stesso meccanismo di N-b).
→ allora T-019 passa da `[~]` a `[x]`, prova nel REGISTRO.

## Attriti
Un attrito solo, ed è strutturale, non un errore: **la verifica visiva di una pagina
scoped-utente è bloccata dall'auth magic-link.** La guardia `dashboard/layout.tsx` fa
`auth.getUser()` e redirige senza sessione; ottenere una sessione nel preview esigerebbe
il click su un link email → non automatizzabile. Costo: il gate finale ricade su Nick
(eyeball), il task resta `[~]`. **Prevenibile**: una sessione reale in dev è già ottenibile
via `signInWithPassword` (`lib/auth.test.ts`), mai collegata a un test che colpisce la
route HTTP — vedi il pattern nuovo in `dossier/PATTERN.md` (2ª occorrenza con T-015).

## Note
- Nessuna RPC nuova: derivazione-in-JS coerente con la scelta di scala di T-014.
- Se T-017 cambia il layout della dashboard aggregata, riallineare questa pagina
  (stessi widget, stessi token).
