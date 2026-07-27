---
task: T-016
tier: C
titolo: Piano free/pro con metering delle scansioni
aree: [billing, dominio, denaro, metering, dashboard, analytics]
stato: aperto
riporti: 0
sessioni: [2026-07-27]
---

# T-016 · Piano free/pro (≤100 scansioni/mese gratis)

Aperto dal feedback di Nick (2026-07-27). Tier **C**: tocca il denaro e il dominio.

## Decisione presa (2026-07-27) — [LOCKED nel merito]
Oltre **100 scansioni/mese** sul piano gratuito si bloccano **analisi + export +
creazione di nuovi QR**. Il **redirect di un QR pubblicato NON si spegne mai**
(regola d'oro 7): un QR stampato resta risolvibile per sempre, a qualunque volume.
La soglia limita ciò che è *servizio a valore* (dashboard, export, nuovi QR), non
il diritto di esistere del QR.

## Composizione — cosa STABILISCE, cosa CONSUMA
- **Stabilisce**: il concetto di *piano* dell'owner (free/pro) e la funzione di
  **conteggio scansioni del mese corrente** (derivata da `qr_scans` append-only,
  mai un saldo — regola 9). Un gate riusabile "l'owner è entitled a X?".
- **Consuma**: `qr_scans` (owner-scoped RLS), il redirect (`app/r/[short_code]`)
  che NON deve mai leggere l'entitlement in modo bloccante.
- **Precede**: T-017/T-018/T-019 (UI) e T-020 (slug pro, 2€/link) — tutti
  consumano il gate di piano definito qui. **T-016 va prima di T-020.**

## Nodi aperti (decisioni ancora da prendere con Nick, PRIMA di costruire)
1. **Provider di pagamento**: Stripe? (regola 10 — libreria/servizio nuovo). Quale
   modello: subscription mensile pro + add-on per-link (T-020, 2€/mese/link)?
2. **Metering**: conteggio derivato on-read vs materializzato mensile. Su MVP →
   derivato (count su finestra mese). A scala → tabella di rollup.
3. **Fuso del "mese"**: UTC o timezone dell'owner? (coerenza con dayStampUtc).
4. **Grazia**: cosa vede l'owner a quota superata — banner + CTA upgrade, dati
   oscurati del tutto, dicendo che il tuo periodo di prova è terminato, non perdere le nuove registrazioni, fai upgrade e scarica il report quando vuoi, esporta i dati dei tuoi clienti e aumenta le vendite con la fidelity card.

## Precedenti da riusare
- `dossier/archivio/T-006-analytics-timeline.md` — RPC definer owner-scoped per
  conteggi derivati (se il metering diventa RPC).
- `dossier/archivio/T-014-dashboard-arricchimento.md` — l'export CSV già esiste:
  qui va messo **dietro il gate** (e il PDF, quando arriverà, nasce già pro).

## Note
Include l'**export PDF** (report brandizzato) come feature pro — scorporata da
T-014 perché richiede una libreria (regola 10). Non iniziare senza sciogliere i 4
nodi sopra: sono soldi e dominio, non dettagli.
