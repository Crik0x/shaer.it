---
task: T-006
tier: M
titolo: Analytics prima lettura — timeline scansioni per QR
aree: [analytics, scansioni, grafici, rls, sicurezza-db]
stato: chiuso
riporti: 0
sessioni: [2026-07-25]
---

### Obiettivo
Nel dettaglio di un QR, una timeline delle scansioni **derivata** da `qr_scans`
(append-only, nessun contatore memorizzato), con toggle di granularità
Giorno/Ora e grafico Recharts caricato in `dynamic import`.

### Accertato
- Colonna reale delle scansioni: **`created_at`** (non `scanned_at`) —
  `supabase/migrations/20260724000001_qr_platform_initial.sql:51`. Verificata
  prima di scrivere la query: il piano iniziale diceva `scanned_at`, sbagliato.
- Le migrazioni in questo progetto **le applica Nick nel SQL editor**; io versiono
  il file (`dossier/archivio/T-002` §19-20). Confermato anche qui.
- Pattern `dynamic(() => import(...), { ssr:false })` valido **solo dentro un
  Client Component** — replicato da `qr-panel.tsx:8` (già funzionante).
- Design tokens disponibili: `--color-primary/-border/-muted-foreground/-foreground`
  in `app/globals.css`, theme-aware light/dark. Recharts li consuma via
  `stroke="var(--color-...)"`.
- **Owner-scoping provato**, non solo scritto: `node --test --env-file=apps/web/.env.local
  apps/web/lib/qr-timeline.test.ts` → **pass 1/1**. Verifica aggregazione (hits=3),
  granularità day+hour, utente B vede 0 righe (definer + `auth.uid()` filter),
  `p_bucket='week'` rifiutato con errore.

### Domande e risposte
- **Dove aggrego?** → *lato DB (RPC)*. Conseguenza: nuova funzione SECURITY DEFINER
  owner-scoped + test, coerente con L-001 (confine = DB), scala oltre l'MVP.
  Scartato *lato app (JS)*: più semplice ma non scala e sposta la garanzia fuori dal DB.
- **Granularità?** → *Giorno + toggle Ora*. Un solo parametro `p_bucket` sulla
  stessa funzione, non due RPC.
- **Timezone?** → *UTC per ora*. Il fuso locale dell'utente si affina dopo.

### Decisioni
- **Fetch server di entrambe le granularità** (`day` + `hour`) in parallelo nella
  page (Server Component); il toggle client alterna due dataset già pronti, zero
  round-trip aggiuntivi e zero RPC lato client. Scartato: fetch client on-toggle
  (avrebbe richiesto client browser autenticato + esposizione della chiamata).
- **Grant solo `authenticated`, mai `anon`**: la timeline non è pubblica → la
  whitelist anon di T-007 resta a `resolve_qr` + `anonymize_ip`.
- Logica pura (`buildSeries`, `formatBucketLabel`) separata dall'I/O in
  `lib/qr-timeline.ts` → testabile a costo zero (`qr-timeline.pure.test.ts`, 2/2).

### Attriti
- Nome colonna a memoria (`scanned_at`) → causa: query scritta prima di guardare
  lo schema → risolto leggendo la migrazione iniziale → prevenibile? già coperto
  da regola §5 «nessun nome di colonna a memoria»; qui la regola ha funzionato
  (verifica fatta prima di scrivere).
- Screenshot browser non catturabile (pane non visualizzata in ambiente) →
  causa: limite dell'ambiente, non del codice → risolto con prova via DOM
  (`.recharts-surface` montato, 1 dot per l'unico bucket) + `get_page_text`
  (totale 3, label `25/07` → `25/07 08:00` al toggle) → prevenibile? no, è una
  proprietà dell'ambiente. La prova visiva resta valida in forma testuale/DOM.

### Vicoli ciechi
- Con **un solo punto dati** Recharts non disegna la `recharts-line-curve` (serve
  ≥2 punti): normale, non un bug. Il `dot` singolo è presente e corretto.
- Gap-filling dei bucket vuoti (giorni/ore senza scansioni) **non** implementato:
  la timeline mostra solo i bucket con dati. Accettabile per «prima lettura»;
  candidato a un T successivo se serve una linea continua.

### Composizione
- **Consuma** `qr_scans` (T-002/T-003) e il dettaglio QR (T-005, `page.tsx`).
- **Stabilisce** che l'aggregazione owner-scoped vive nel DB (RPC), non nell'app:
  T-007 (hardening grant) deve trattare `qr_scans_timeline` come funzione
  `authenticated`, **non** anon — non entra nella whitelist anon.
- Prova (gerarchia §6): test integrazione `qr-timeline.test.ts` **1/1** (owner-scoping,
  aggregazione, validazione param) · test puro `qr-timeline.pure.test.ts` **2/2** ·
  `tsc --noEmit` pulito · prova visiva DOM (totale 3, toggle `25/07`→`25/07 08:00`) ·
  revisore approvato 0 rilievi (`memoria/review/2026-07-25.json`).
