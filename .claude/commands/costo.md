---
description: Misura il costo fisso del metodo e propone cosa potare
---

Esegui `node scripts/costo.mjs`.

Riporta:
- il totale in token e la percentuale della finestra
- il delta rispetto all'ultima riga di `memoria/costo.csv`
- i tre file più cari

Se il totale supera **6.000 token**, proponi concretamente cosa potare, in questo
ordine di preferenza:

1. una lezione `→ regola` che può diventare test, tipo o hook (guadagno permanente)
2. righe di `STATO.md` che descrivono storia invece che stato attuale
3. regole ridondanti tra `CLAUDE.md` e `.claude/rules/lavoro.md`
4. analisi finite dentro TODO che appartengono a un dossier — **si spostano, non
   si eliminano**: in TODO resta una riga e il puntatore

**`TODO.md` è intoccabile.** Non proporre mai di rimuovere, accorpare o
«semplificare» un task aperto. Se il TODO è grosso è perché il backlog è grosso:
è un'informazione vera, non un problema di file. In quel caso non potare — dimmi
il numero: *«hai 18 task aperti, il TODO pesa 900 token, ed è giusto così»*.

**Non proporre mai di alzare la soglia.** Il budget è il vincolo, non la variabile:
se il metodo non ci sta dentro, è il metodo a essere troppo grande — non il
lavoro da fare.

Il costo è metà del conto. L'altra metà — cosa il metodo ha intercettato — la
tiene `scripts/resa.mjs` (§10-bis). Prima di proporre una potatura, guarda anche
quella: potare guardando solo il costo è ottimizzare un lato solo del bilancio.
