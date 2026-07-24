---
task: T-003
tier: C
titolo: Redirect dinamico /r/[short_code]
aree: [redirect, dati-personali, privacy, rls, security-definer, next-route-handler]
stato: chiuso
riporti: 0
sessioni: [2026-07-24]
---

### Obiettivo
Route `/r/[short_code]` che risolve dal DB, logga la scansione (IP anonimizzato) in
append e fa 302; `short_code` immutabile. Raggiunto e provato end-to-end.

### Accertato (prove)
- `apps/web/app/r/[short_code]/route.ts` — GET, `dynamic='force-dynamic'`, chiama
  `resolve_qr` via client anon lato server (`lib/supabase-public.ts`).
- Live sul dev server (:3000):
  - `GET /r/demo123` → `302 Found`, `location: https://example.com/`
  - `GET /r/inesistente` → `404`
- `qr_scans` count = **3** dopo le prove (1 RPC + 2 route) → logging funziona.
- `lib/scan.ts` funzioni pure: **6/6** `node --test` verdi.
- `anonymize_ip` (DB) verificata via RPC: `203.0.113.199→203.0.113.0`,
  `2001:db8:1234:5678::1→2001:db8:1234::`, `non-un-ip→null`, idempotente.
- Typecheck `tsc --noEmit` pulito; `params` come `Promise` conforme ai docs Next 16
  (`node_modules/next/dist/docs/.../15-route-handlers.md`).

### Domande e risposte
- «resolver mock o DB reale?» (il DB era diventato disponibile) → Nick: **DB reale**,
  con URL+anon key. Conseguenza: `resolve_qr` reale, non mock usa-e-getta.

### Decisioni
- **Log best-effort dentro resolve_qr** (blocco `exception when others`): se loggare
  fallisce, il redirect risolve comunque — regola d'oro 7. Scartato: log fuori dalla
  transazione o bloccante.
- **Doppia anonimizzazione IP** (app + DB): app = minimizzazione (l'IP pieno non lascia
  il server); DB (`anonymize_ip`) = garanzia per QUALSIASI chiamante della RPC.
- **302 (non 307)**: come da TODO; il browser ri-colpisce la route ogni volta.

### Attriti
- **Bug IPv6 in `anonymizeIp`** colto dal test: filtrando i gruppi vuoti si perdeva il
  `::` e si tratteneva l'interface id (`fe80::1`→`fe80:1::`). Corretto tenendo la parte
  prima di `::`. → `test` (già in `scan.test.ts`).
- **[BLOCCANTE, revisore] anonimizzazione solo lato app**: con anon key pubblica la
  garanzia GDPR era bypassabile chiamando `resolve_qr` via PostgREST con IP pieno.
  Causa vera: **il confine di sicurezza con una chiave pubblica è il DB, non l'app**.
  Risolto spostando la maschera in `anonymize_ip` dentro il definer. → lezione `→ regola`.
- `.ts` extension negli import: Node la esige per l'ESM relativo, `tsc` no → abilitato
  `allowImportingTsExtensions` (compatibile con `noEmit`).

### Vicoli ciechi
- Seed via signup anon: `example.com` rifiutato + conferma email attiva → nessun token.
  Non percorribile con la sola anon key; serve creare l'utente (dashboard/SQL).
- Leggere `qr_scans` per provare il log: RLS lo blocca all'anon; non uso la password del
  seed user per autenticarmi (regola di sicurezza). Prova = count via SQL di Nick +
  `anonymize_ip` verificata via RPC.

### Composizione
Consuma il contratto `resolve_qr` di T-002 e ne **estende** lo schema con
`anonymize_ip`. Stabilisce il pattern route-handler + client anon che T-004/T-005
riuseranno. Nota deploy (revisore, gravità 2, non bloccante): **dietro un proxy non
fidato `x-forwarded-for` è spoofabile** → su Vercel affidabile; altrove valutare fonte
IP o accettare il rischio.
