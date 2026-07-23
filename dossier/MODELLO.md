# Il dossier — modello e livelli

Un dossier per **ogni** task. La sua profondità scala con la task: su una task
snella l'analisi non serve, l'attrito sì.

**Non si carica mai all'avvio.** Si apre quando si riprende quel task, o quando
il `distillatore` cerca precedenti simili. Un dossier chiuso va in `archivio/` —
**mai cancellato**: è il corpus da cui si impara a prevenire.

## I tre livelli

| | Quando | Cosa contiene |
|---|---|---|
| **S · snella** | un file, nessuna decisione, nessuna incognita — *«cambia il colore del pulsante»* | solo gli **attriti**: cosa ha impedito che filasse liscio, e come si è risolto. Nessun attrito → tre righe e basta: l'assenza di attrito è essa stessa un dato |
| **M · media** | più file, o una scelta tecnica da fare | attriti **+** le decisioni prese e le alternative scartate |
| **C · complessa** | tocca il dominio, il denaro, i dati personali o la compliance · richiede una decisione di Nick · ha stati e flussi — *«il cliente sceglie un commerciante, mette a carrello, paga in punti, il commerciante approva…»* | dossier pieno, tutte le sezioni |

Nel dubbio fra due livelli si sale, mai si scende. Un dossier troppo ricco costa
qualche minuto; uno troppo povero costa la ri-derivazione di tutto.

## Frontmatter — obbligatorio a ogni livello

Serve a rendere il corpus **cercabile**: è così che un task nuovo trova i suoi
precedenti senza che nessuno debba ricordarseli, e così che agenti futuri potranno
lavorarci sopra.

```yaml
---
task: T-042
tier: C
titolo: Checkout a punti con approvazione del commerciante
aree: [pagamenti, punti, notifiche, commercianti]
stato: aperto        # aperto | chiuso
riporti: 0           # quante volte è passato di sessione
sessioni: [2026-07-21]
---
```

`aree` sono i tag su cui si cerca. Usa termini di dominio, non di implementazione:
`pagamenti` sì, `useState` no.

## Le sezioni

**S** usa solo *Attriti*. **M** aggiunge *Decisioni*. **C** le usa tutte.

### Obiettivo
Cosa deve esistere alla fine, in due righe. Scritto in modo che si capisca se è
stato raggiunto o no.

### Accertato
Cosa è **vero**, con `file:riga` o l'output di un comando. Non impressioni:
prove. È la sezione che fa risparmiare più token alla sessione dopo.

### Domande e risposte
Ogni domanda posta a Nick, con la risposta e la **conseguenza** che ne è derivata.
Impedisce di ripresentare una domanda già chiusa.

### Decisioni
Cosa si è scelto e **cosa si è scartato, col perché**. Se una decisione è
strutturale va anche in `memoria/DECISIONI.md` come `D-NNN`: qui resta il
ragionamento, lì la sentenza.

### Attriti
Il cuore dell'apprendimento, e la sola sezione obbligatoria a ogni livello.
Una riga per attrito:

`attrito → causa vera → come si è risolto → si può prevenire? (test/tipo/hook/no)`

Un attrito che si può prevenire meccanicamente diventa una voce di
`memoria/LEZIONI.md` con la sua conversione, e smette di essere un problema.

### Vicoli ciechi
Cosa è stato provato e **non** funziona, col perché. Vale quanto la soluzione:
impedisce di ritentare la stessa strada fra tre settimane.

### Stato e piano
Solo se il task **non** si chiude. Dove ci si è fermati, e il piano già pronto —
scritto perché una sessione a freddo lo esegua senza ri-pensarlo. Se qui c'è
scritto «continuare l'analisi», il dossier non è finito: l'analisi va fatta ora,
finché il contesto è caldo.

### Composizione
Con quali altri task aperti si scontra, e cosa questo task **stabilisce** che gli
altri dovranno rispettare.
