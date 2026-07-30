# Shaer.it — Development Roadmap

Versione: 1.0 · Stato: In vigore · 2026-07-26
Padre: [MDD](MDD.md) · Requisiti: [PRD](PRD.md) · Tecnica: [SAD](SAD.md)

La verità operativa di cosa è aperto/chiuso resta `memoria/TODO.md` (legge di
conservazione dei task). Questa Roadmap dà la **sequenza per fasi** e le milestone;
il TODO dà il saldo giorno per giorno. In conflitto sul *fatto*, vince il TODO.

Principio d'ordine (lavoro.md §4): **chi stabilisce prima di chi consuma**; ciò
che è irreversibile prima di tutto ciò che lo userà.

---

## Stato di partenza (verificato — regola 1)

**Chiuso con prova (T-001…T-011):** scaffold, schema+RLS, redirect dinamico, auth+
dashboard scheletro, generatore QR (URL), analytics timeline, hardening grant anon,
seed dev, deploy `qr.shaer.it`, landing luxury + albero rete.
**Aperto:** `T-008` (`↻2`, config Supabase — azione Nick) · `T-012` (analisi
dashboard pronta; slice demo albero fatto, reale bloccato — ora **sbloccato** dalle
decisioni D-1/2/3 di oggi).

---

## Milestone e fasi

### M0 · Fondamenta documentali ✅ (questa sessione)
MDD, PRD, SAD, Design System, Roadmap in `MD/`. Decisioni D-1/2/3 fissate.

### M1 · Albero di QR reale + Dashboard scan-side `Fase 1` — **il prossimo blocco**
Sblocca il grosso di MDD sui dati che **già** raccogliamo o raccogliamo a costo
~zero (header). Nessuna PII ⇒ nessun cancello legale.

**Sequenza (stabilisce → consuma):**
1. **[irreversibile-ish, per primo]** Migrazione albero: `qr_codes.parent_id` +
   `purpose` + `granted_by` + anti-ciclo (SAD §3.1). *Stabilisce* la gerarchia.
2. Migrazione arricchimento scan additiva: `os, lang, referer, visitor_hash`
   (SAD §3.2). *Additiva, non rompe i QR vivi (regola 7).*
3. Update redirect `r/[short_code]/route.ts`: popola geo (header Vercel), os, lang,
   visitor_hash. *Consuma* lo schema di #2.
4. RPC `qr_tree_rollup`, `qr_breakdown`, `qr_geo`, `qr_uniques` (definer owner-scoped,
   CTE ricorsiva) + test rollup + **whitelist `grants.test.ts` invariata**. *Consuma* #1/#2/#3.
5. Dashboard reale (PRD E6.1–E6.7, E6.9): KPI, albero reale (rimpiazza la demo),
   serie+confronto, breakdown, geo, heatmap, tabella rami, export. *Consuma* le RPC.
6. `T-008`: Confirm email ON in prod (azione Nick) — chiude il debito auth.

*Precedenti da riusare (40 righe invece di una sessione):* `archivio/T-002`
(schema+RLS), `T-003` (redirect, regola 7), `T-006` (RPC timeline definer),
`T-007` (whitelist anon). Dossier vivo: `dossier/T-012-campaign-analytics.md`.

**Definition of Done M1:** l'owner loggato vede la propria dashboard su **dati
reali**, con albero di QR a rollup reale ed export; test verdi; nessuna PII raccolta.

### M2 · Landing ospitate + Session/Event `Fase 2`
D-1 ibrido in atto. Flag "landing ospitata" sul QR; pagina nostra + beacon;
`sessions`/`events` (SAD §3.3); funnel base (E6.8). **Consenso** registrato prima
di ogni evento con PII (D-2). Heatmap comportamentale (E5, E6.6 su eventi reali).

### M3 · Automazioni & Marketing `Fase 3`
Webhook (n8n/Make/Zapier), pixel marketing sulle landing (solo con consenso),
reminder abbandono, consigli automatici azionabili (E6.10). Mappa geo interattiva.

### M4 · CRM + API `Fase 4` — **apre il cancello D-2 (PII)**
Prima di raccogliere PII: DPA, consenso esplicito, retention, diritto all'oblio
(SAD §7). Poi profili cliente (E8), API REST pubblica per-owner (E9.1). Delega
intermediari cross-owner + aggancio economia crediti Shaer ([SHAER_MASTER](../SHAER_MASTER.md)).

### M5 · Enterprise & AI `Fase 5`
White-label, workspace, ruoli, marketplace plugin (E9.2). AI Recommendation Engine
sopra dati veri (Modulo 13). E-commerce/verticale ristorante come plugin —
**pagamenti via PSP terzo, mai eseguiti in autonomia**.

---

## Backlog per priorità (MoSCoW → fase)

| Pri | Item | PRD | Fase |
|-----|------|-----|------|
| M | Schema albero di QR (parent_id, purpose) | E3.1/3.3 | 1 |
| M | Rollup ricorsivo + test | E3.2 | 1 |
| M | Arricchimento scan (geo/os/lang/hash) | E4.3 | 1 |
| M | Dashboard reale KPI+serie+albero | E6.1–6.3 | 1 |
| M | Confirm email ON (T-008) | E1.1 | 1 |
| S | Breakdown/geo/heatmap/tabella/export | E6.4–6.7,6.9 | 1 |
| S | Generatore multi-tipo + branding + export | E2.2–2.4 | 1–2 |
| S | Delega intermediario (own-subtree) | E3.4 | 1–2 |
| S | Landing ospitate + Session/Event | E4.4,E5 | 2 |
| C | Funnel / consigli automatici | E6.8,6.10 | 2–3 |
| C | Webhook + pixel + reminder | E7 | 3 |
| C | CRM + consenso + oblio | E8 | 4 |
| C | API pubblica | E9.1 | 4 |
| W | White-label / ruoli / marketplace / AI | E9.2,Mod13 | 5 |

---

## Ritmo & metodo

Ogni item passa dal percorso di `lavoro.md`: classifica (S/M/C) → precedenti →
sequenza → implementazione additiva → **prova (test verde prima della carta)** →
dossier → commit. Il tetto di ogni sessione è il **contesto** (testimone 30%, tetto
40%), mai un numero di task. Nulla si cancella: si archivia.

**Prossima azione concreta:** M1 punto 1 (migrazione albero), dopo che Nick ha
sbloccato le decisioni (fatto) e idealmente chiuso T-008.
