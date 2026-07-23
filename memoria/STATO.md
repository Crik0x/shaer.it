# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** _(la prima `/apertura` scriverà qui l'hash del commit)_

## Dove siamo

Il 23/07 il progetto è passato da «cartella di documenti» a cantiere: metodo 3Lab
v1.2.0 installato e compilato, repo git nella radice, decisioni fondanti prese
(D-001..D-004). Si costruisce **prima la QR Platform** (`MD/QR_PLATFORM.md`),
prodotto autonomo; il dominio Shaer (`MD/SHAER_MASTER.md`) viene dopo e riuserà
il motore QR/TXN. Nessuna riga di codice applicativo esiste ancora: il primo
task è lo scaffold Next.js 16 (T-001).

## Cosa esiste

- `MD/QR_PLATFORM.md` — definizione prodotto QR Platform (era `SCANNER/project.md`)
- `MD/SHAER_MASTER.md` — fonte canonica del dominio Shaer (crediti, TXN, recensioni)
- `MD/SAAS_BUILD_PLAN_V1.md` — riferimento tecnico Next 16 + Supabase + Stripe
- `Struttura/Schema/0001_initial_schema.sql` — schema Shaer smoke-tested, ma
  codifica il **vecchio** modello crediti (audit A3 del Master) e riguarda Shaer,
  **non** la QR Platform: non usarlo per T-002
- `Struttura/Schema/Shaer_it_Simulatore_MVP*.html` — simulatori economici (storia)
- `Archivio/2026-07-23/` — i doc superati assorbiti da SHAER_MASTER

## Cosa NON esiste ancora

- L'app (`apps/web/`), il progetto Supabase dedicato, il remoto GitHub, il deploy
  Vercel, il dominio tecnico di redirect (es. `qr.shaer.it`) — tutte cose che
  nascono con T-001..T-003.

## Note operative

- Aprire la sessione **dentro** `D:\Desktop\Shaer.it`, non in una cartella che la
  contiene, o il metodo resta spento.
- Hook attivo via `git config core.hooksPath scripts/git-hooks` (già configurato).
- Windows: negli script bash usare `$TEMP`, non `/tmp`; server dev da riusare,
  mai due `next dev` sulla stessa cartella.
