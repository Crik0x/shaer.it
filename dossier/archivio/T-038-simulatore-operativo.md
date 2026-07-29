---
task: T-038
tier: C
titolo: Simulatore operativo §5.4 — postazioni, attribuzione, bonus, escrow
aree: [landing, demo, bonus, escrow, incentivi, funzione-pura, ui]
stato: chiuso
riporti: 0
sessioni: [2026-07-29c]
---

## Obiettivo
Riscrivere il `Simulator` della landing dallo scenario campagne generiche allo scenario
**QR operativo §5.4 MDD**: assegni un QR a una postazione/tavolo → la scansione è attribuita
all'operatore → matura un **bonus €** → l'importo è **trattenuto in escrow (held)** → si
**rilascia solo dopo l'approvazione**, gated da una soglia di team.

## Cosa è stato fatto
- **Motore in funzione pura** `apps/qr/lib/bonus.ts`: `operatorBonus` (quota % del fatturato con
  pavimento/tetto §5.4), `bonusPool` (somma = escrow held), `goalReached` (soglia team inclusiva).
- **Test** `apps/qr/lib/bonus.test.ts` — **4/4 verdi** (`node --test`): proporzionalità, clamp
  min/max, pool, soglia. La UI consuma le stesse regole (regola 5).
- **`apps/qr/app/_components/simulator.tsx`** riscritto mantenendo nome/interfaccia `<Simulator/>`
  (la landing lo consuma senza modifiche): postazioni Giulia/Sara/Marta, barra progresso verso
  l'obiettivo, pannello escrow con «Approva e rilascia» abilitato solo a soglia raggiunta.

## Decisioni di design
- **Escrow ri-armabile**: ogni nuova scansione riporta lo stato a «in attesa» (`approved=false`) —
  il bonus nuovo va ri-approvato. Insegna correttamente la semantica escrow, non la falsa.
- **Demo, non feature viva**: l'escrow/ledger reale è F1 (T-029+, non in codice). Il footer «Dati
  dimostrativi» inquadra la simulazione come visione — non si spaccia per vero (coerente con D-016).

## Prova
`node --test apps/qr/lib/bonus.test.ts` → 4/4. Render in browser (localhost:3000): numeri = funzione
testata (240×0.3=72, pool 174), reattività confermata su click (Sara 190→234 → bonus 70), console pulita.

## Composizione
**Stabilisce** il modello di calcolo bonus/escrow (quota % con pavimento/tetto, pool=held, soglia team
inclusiva, ri-armo dell'approvazione a ogni nuova scansione) validato con Nick nella demo. **T-033**
(Escrow reale, SAD §3.3) deve **confrontarlo e riusarlo o scartarlo esplicitamente**, non ri-derivarlo.
**Consuma**: nulla (demo indipendente).

## Attrito
Minimo. Il pattern «matematica di dominio in funzione pura + `node:test`, consumata dalla UI» era già
stabilito (`lib/dashboard.ts`, `lib/scan.ts`): riuso, non ri-derivazione.
