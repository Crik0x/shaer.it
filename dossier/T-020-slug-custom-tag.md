---
task: T-020
tier: C
titolo: Slug personalizzato + @tag utente
aree: [dominio, identita, routing, billing, schema-supabase]
stato: aperto
riporti: 0
sessioni: [2026-07-27]
---

# T-020 · Slug URL personalizzato + @tag utente

Aperto dal feedback di Nick (2026-07-27). Tier **C**: tocca la regola 7
(immutabilità dello short_code) e l'identità multi-tenant.

## Decisione presa (2026-07-27)
- **Slug personalizzato**: scelto **alla creazione** del QR, solo utenti **pro**,
  **add-on 2€/mese per ogni link** personalizzato. Finché il link vive, lo slug è
  immutabile (regola 7). **Se cancellato**: i dati del QR si cancellano e lo slug
  **torna disponibile** per un altro utente. → eccezione controllata alla regola 7:
  un QR *cancellato* non è più "pubblicato", quindi il suo indirizzo può essere
  riassegnato. Chi lo cancella accetta la perdita dati e la liberazione dello slug.
- **@tag personale**: un handle per utente (namespace). Semantica di routing
  ancora **da decidere** con Nick (vedi nodi).

## Composizione
- **Consuma** il gate di piano di **T-016** (pro + add-on): T-016 va **prima**.
- **Stabilisce**: unicità globale dello slug (indice unique su `short_code`, già
  di fatto la chiave del redirect) e, per @tag, unicità dell'handle per owner.
- **Tocca la regola 7**: oggi `short_code` è immutabile e generato. Qui diventa
  *scelto* alla creazione (ancora immutabile in vita) + *riassegnabile dopo delete*.
  Serve un' intake mirata su cosa succede ai `qr_scans` orfani al delete.

## Nodi aperti (da sciogliere con Nick prima di costruire)
1. **@tag routing**: `qr.shaer.it/@utente/slug` (namespace per utente, slug unico
   solo dentro l'handle) **oppure** slug globale + @tag solo campo profilo/vanity?
   La prima rende lo slug meno conteso ma cambia la forma dell'URL pubblico.
2. **Delete e riassegnazione**: hard-delete del QR + delete a cascata dei suoi
   `qr_scans`? Contrasta con l'append-only (regola 9). Forse soft-delete che libera
   lo slug ma conserva le scansioni anonimizzate. **Da decidere.**
3. **Billing add-on per-link**: come si concilia col piano mensile di T-016
   (proration, cosa succede allo slug se l'add-on scade).

## Precedenti da riusare
- `dossier/archivio/T-003-redirect-dinamico.md` — come nasce e si risolve lo
  short_code, il punto esatto dove la regola 7 morde.
- `MD/SHAER_MASTER.md` — l'identità utente/@tag può anticipare il dominio Shaer.
