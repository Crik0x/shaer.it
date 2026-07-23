---
description: Avvia o prosegue l'intake socratico su un nuovo scope (es. collaborazioni, fase 6)
---

Richiesta o risposta dell'utente: $ARGUMENTS

Modalità brownfield: PRIMA di fare domande, leggi i file esistenti pertinenti allo
scope (MD/, memoria/, codice): la copertura dedotta dai file ha fonte "dedotto" e
confidenza max 70 finché Nick non conferma.

1. Se esiste memoria/intake_state.json, leggilo; altrimenti questo è il ciclo 1.
2. Passa al sub-agente **intervistatore** la richiesta + le risposte raccolte +
   ciò che hai dedotto dai file (marcato come dedotto).
3. Salva l'output in memoria/intake_state.json (sovrascrivi).
4. Mostrami in modo leggibile:
   - barra di copertura per ciascuna delle 8 aree (es. vincoli ▓▓▓▓▓░░░░░ 52%)
   - media e ciclo corrente
   - le domande (max 3), ognuna con il suo "perché" in una riga
   - le assunzioni aperte
5. Se pronto_per_progettazione=true: proponi la progettazione (struttura + roadmap +
   assunzioni esplicite) e fermati in attesa di ok.
6. Altrimenti fermati e aspetta le risposte: le ripasserai con /intake <risposte>.

Mai più di 3 domande per turno. Se i file bastano a orientarsi, salta le domande.
Mai procedere alla progettazione senza l'ok esplicito di Nick.
