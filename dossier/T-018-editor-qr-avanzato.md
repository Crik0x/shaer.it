---
task: T-018
tier: M
titolo: Editor di creazione QR avanzato
aree: [qr-editor, generatore, design-system, ux]
stato: aperto
riporti: 0
sessioni: [2026-07-27]
---

# T-018 · Più opzioni e grafica migliore nella creazione QR

Aperto dal feedback di Nick (2026-07-27): "migliorare la dashboard della creazione
del QR, inserire più opzioni, grafica più adeguata".

## Stato di partenza
Il generatore esiste (T-005, `app/dashboard/qr/new`, lib `qrcode`). Oggi è
essenziale: URL destinazione + nome. Mancano opzioni di tipo/branding.

## Direzione (da confermare con Nick e con la Roadmap)
- **Più opzioni**: tipi di QR (link, testo, WhatsApp, vCard…), scelta `purpose`
  (root/campaign/referral/promo — già nello schema albero T-012), `parent_id`
  (agganciare a un ramo esistente).
- **Branding**: colore, logo al centro, correzione d'errore (già in Roadmap M?).
- **Slug personalizzato**: è il punto d'aggancio di **T-020** (campo slug qui, ma
  gated pro). T-018 e T-020 si toccano sull'editor → coordinare la sequenza.
- Vincoli: componenti pesanti (editor/preview QR) con `dynamic import` (regola 9),
  solo token (regola 8), nessuna libreria nuova senza conferma (regola 10).

## Nota
Verificare in `MD/QR_PLATFORM.md` / Roadmap quali opzioni sono già pianificate per
M2–M5 prima di inventare scope. Prova: unit sui puri (validazione/encoding) +
browser per il visivo.
