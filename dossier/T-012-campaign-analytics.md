---
task: T-012
tier: C
titolo: Analizzatore ramificato di campagne + dashboard di analisi pubblicitaria
aree: [campagne, analytics, dashboard, dati-personali, schema-supabase, marketing]
stato: aperto
riporti: 0
sessioni: [2026-07-26]
---

# T-012 · Campaign analytics — l'oro per gli esercenti

## Reframe (decisione di Nick, 2026-07-26)
L'albero rete di T-011 **cambia funzione**: non più metafora referral, ma
**analizzatore ramificato di campagne**. Un *Progetto* monitora più *campagne*
(A, B, C, D); ogni campagna si ramifica in *sotto-campagne* (es. A→2 voci, B→4,
C→1, D→2). Le scansioni **risalgono per ramo** (rollup). La linea tracciata segue
i rami che portano più scansioni. Obiettivo: ogni esercente/produttore/
professionista costruisce una **campagna pubblicitaria mirata** sui dati raccolti.

Il motore puro `apps/qr/lib/rete.ts` (rollup, layout, litEdges) è **generico su un
albero pesato {id, parentId, scans}**: regge la gerarchia di campagne senza
modifiche. Cambia solo la semantica dei nodi e la dashboard attorno.

## Realtà oggi (verificata — regola 1)
- `qr_codes`: id, owner_id, name, target_url, short_code, created_at. **Nessuna
  gerarchia / campaign_id.**
- `qr_scans` (append-only): created_at, device, browser, country, city, ip.
  Il redirect (`app/r/[short_code]/route.ts`) popola **device, browser, ip
  anonimizzato**; **country/city passati `null`** (colonne vuote, nessun geo).
- Analytics esistente: RPC `qr_scans_timeline` (day/hour, owner-scoped definer).

## 1 · Dati fondamentali per scansione (cosa catturare)
**Già catturati:** quando (timestamp), device, browser, IP `/24`-`/48`.
**Quick-win a costo ~zero (header, additivo):**
- **Geo** paese/città/regione — su Vercel arrivano già come header
  `x-vercel-ip-country` / `-city` / `-country-region`. Le colonne esistono già.
- **OS** — dallo stesso user-agent già parsato (`lib/scan.ts`).
- **Lingua** — header `accept-language` (prima preferenza).
- **Sorgente** — header `referer` (limitato: le camera-app spesso non lo mandano).
- **Nuovo vs ritorno** — hash pseudonimo salato (IP anon + UA + salt giornaliero):
  stima gli **unici** e la frequenza **senza fingerprint invasivo né PII**.
**Da progettare (schema/strumentazione):**
- **campaign_id** sul QR → lega ogni scansione a una campagna (e, per gerarchia,
  al ramo). È il ponte che rende l'albero *reale*.
- **Conversione** scan→azione (acquisto, form, contatto): richiede un pixel/
  callback sulla destinazione. Sblocca il **ROI per campagna**.
**Privacy/GDPR (vincolo, non opzione):** IP già anonimizzato lato DB (L-001);
niente PII; "chi sono" = solo **aggregati** + hash pseudonimo per l'unicità, mai
device-fingerprint. Oltre l'aggregato serve base giuridica/consenso. Le regole 6
e 9 restano: segreti mai lato client, ogni tabella owner_id+RLS, stat **derivate**
dall'append-only, mai salvate come saldo.

## 2 · Le domande del marketing (dimensioni di analisi)
Ciò che agenzie ed esercenti cercano davvero, e la colonna che la risponde:
- **QUANDO** scansionano → heatmap giorno×ora, picchi, stagionalità → *quando
  pubblicare e presidiare*.
- **DOVE** → paese/città/mappa → *geo-targeting, dove spingere/aprire*.
- **CON COSA** → device/OS/browser → *creatività mobile-first, tech della landing*.
- **IN CHE LINGUA** → accept-language → *lingua della campagna*.
- **CHI TORNA** → nuovi vs ritorno, scans/visitatore → *fedeltà, retargeting*.
- **QUALE CAMPAGNA RENDE** → rollup per ramo, quota sul totale, tasso di crescita
  → *dove mettere il budget*.
- **FUNNEL/ROI** → scan→redirect→(conversione se strumentata) → *ritorno per €*.
- **TREND** → serie storica e crescita per campagna, confronto col periodo prima.

## 3 · Funzionalità della dashboard (cosa costruire)
1. **Albero campagne interattivo** (analizzatore ramificato) — c'è, da rifocalizzare.
2. **KPI tiles**: scansioni totali, campagne attive, top campagna, crescita %,
   unici stimati.
3. **Serie storica** per campagna (già c'è `qr_scans_timeline`) + confronto periodi.
4. **Heatmap** giorno×ora.
5. **Breakdown** device/OS/browser (donut/bar) e lingua.
6. **Geo**: barre paese/città (poi mappa).
7. **Tabella campagne** ordinabile: scan, quota %, crescita, ultima scansione.
8. **Confronto A/B** tra due rami/sotto-campagne.
9. **Export report** PDF/CSV — il deliverable che le agenzie consegnano.
10. **Consigli automatici** azionabili («il 68% scansiona 18–21 → pubblica la
    sera»; «Milano guida → spingi lì»; «campagna B cresce +40% → rialloca budget»).

## 4 · Cosa serve per un report completo
Periodo · totali e trend · mix per dimensione (tempo/geo/device/lingua) · top e
bottom campagne · unici stimati e frequenza · confronto col periodo precedente ·
per-campagna il rollup · **raccomandazioni azionabili**. Questo è il pacchetto
«oro»: numeri + interpretazione, non solo grafici.

## 5 · Sequenza per il REALE (le decisioni che spettano a Nick)
Chi *stabilisce* prima di chi *consuma* (§4):
1. **Schema gerarchia** — tabella `campaigns` (id, owner_id, **parent_id**
   nullable, name, created_at, RLS) + `qr_codes.campaign_id` FK. *Irreversibile-
   ish → prima di tutto.*
2. **Arricchimento scan** — migrazione additiva (os, lang, visitor_hash) + update
   del redirect per popolare geo (header Vercel), os, lang, hash. *Additivo, non
   rompe i QR vivi (regola 7).*
3. **RPC di aggregazione** owner-scoped definer (come `qr_scans_timeline`): rollup
   ricorsivo per ramo, breakdown per dimensione, unici. Derivate, mai saldo.
4. **Dashboard reale** (Server Components + Suspense; grafici pesanti dynamic):
   KPI, tree reale, serie, heatmap, breakdown, tabella, export.

**Decisioni a Nick (opzioni con conseguenza), da prendere PRIMA di costruire il
reale:**
- **D-A · Profondità dati raccolti**: (i) solo aggregati geo/os/lang (privacy
  massima, nessun consenso extra); (ii) + `visitor_hash` salato per unici/
  frequenza (poco invasivo, stima unici; valutare consenso); (iii) + conversione
  con pixel sulla destinazione (ROI vero, ma tocca il sito dell'esercente).
- **D-B · Primo bersaglio**: (i) **demo simulata** sulla landing (mostra la
  visione, zero schema, subito); (ii) **dashboard reale** autenticata su dati veri
  (serve schema+RPC, più lungo). Non mutuamente esclusivi: la demo può precedere.
- **D-C · Forma gerarchia**: campaign_id sul QR + parent_id sulle campagne
  (semplice, un QR = una campagna) vs. molti-a-molti (un QR in più campagne, più
  complesso). Raccomando la prima.

## Slice fatto in questa sessione (2026-07-26)
- **Rifocalizzazione dell'albero landing → gerarchia di campagne** (Progetto →
  A/B/C/D → sotto-voci), etichette e popover in chiave campagna. Demo simulata
  (D-B opzione i), additivo, motore invariato. Verifica: build + test rollup 11/11.
- Il resto (schema, arricchimento, RPC, dashboard reale) resta qui come piano
  pronto, in attesa delle decisioni D-A/B/C.

## Attriti
`attrito → causa vera → come risolto → prevenibile?`
- **Reframe a metà sessione** → l'albero era stato costruito (T-011) come rete-
  referral; Nick ne ha cambiato la funzione in gerarchia di campagne dopo il deploy
  → il motore puro `lib/rete.ts` era già **generico su albero pesato {id,parentId,
  scans}**, quindi è bastato cambiare seed+etichette senza toccare la logica →
  **no**: è una decisione di prodotto, non un errore; la genericità del motore l'ha
  resa a costo quasi nullo (lezione: tenere la logica di dominio agnostica paga).
- **Confine demo/reale non deciso** → «dashboard completa» richiesta su dati che
  oggi non raccogliamo (nessun `campaign_id`, geo `null`) → NON costruita alla cieca:
  fermato al gate, prodotta l'analisi e le decisioni D-A/B/C, implementata solo la
  demo simulata sicura → **no**: gate di ampiezza applicato correttamente (§4).

## Stato e piano
Aperto. Fatto: analisi completa (questo dossier) + refocus albero demo. **Bloccato**
sulle decisioni D-A/B/C di Nick (sezione §5). Piano pronto ed eseguibile a freddo:
1. Nick decide D-A/B/C. 2. Migrazione `campaigns` (owner_id, parent_id, RLS) +
`qr_codes.campaign_id` (precedente: `archivio/T-002`). 3. Arricchimento scan
additivo su `route.ts` (precedente: `archivio/T-003`, regola 7). 4. RPC rollup
owner-scoped definer (precedente: `archivio/T-006`) + aggiungerla alla whitelist
`grants.test.ts` (precedente: `archivio/T-007`). 5. Dashboard reale.
