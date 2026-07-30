---
description: Apre la sessione — àncora, costo, saldo dei task, sequenza di lavoro
---

Apri la sessione. Sei passi, in ordine, senza saltarne nessuno.

**1 · Àncora.** `git rev-parse --short HEAD`. Scrivi il risultato in
`memoria/STATO.md` nel campo `Apertura:` (sostituendo il precedente). È il
riferimento contro cui `/chiusura` farà il diff meccanico: senza, la chiusura non
può funzionare.

**2 · Costo e resa.** Esegui `node scripts/costo.mjs`. Riporta il totale e il
delta rispetto all'ultima riga di `memoria/costo.csv`. Se supera 6.000 token,
dillo subito e proponi cosa potare — mai un task aperto.
Poi `node scripts/resa.mjs`: una riga su cosa il metodo ha intercettato finora.
È il contrappeso del costo — ricorda perché lo paghi.

**3 · Il saldo.** Da `memoria/TODO.md`, di' subito il numero vero:
`hai N task aperti — X riportati dalle sessioni precedenti, Y nuovi`.
Poi elenca:
- i **riportati**, col loro `↻` e **il percorso del loro dossier** — l'analisi
  esiste già, non si rifà
- quelli a **`↻3` o più**: fermati su questi, non vanno riportati un'altra volta
  in silenzio. Portameli con la diagnosi e due o tre vie d'uscita
- i `[~]` — scritti ma non provati: sono debito, vanno chiusi o declassati
- apri `memoria/RIPRESA.md` (**non** è caricato all'avvio): «Per Nick» + il
  prompt di ripresa. Se «Per Nick» ha azioni `[N]` ancora aperte, chiedi se sono
  state eseguite; il prompt è il piano già pronto per la sessione di oggi

**4 · Precedenti.** Per i task nuovi di livello **M** o **C**, `grep` delle loro
aree in `dossier/PATTERN.md` e `dossier/archivio/`. Se esiste un precedente,
dillo: leggerlo costa 40 righe, ri-derivarlo costa una sessione.

**5 · La sequenza.** Prima di toccare qualsiasi cosa, con tutti i task aperti
davanti, dichiara per ognuno cosa **stabilisce** e cosa **consuma**. Poi proponi
un ordine in cui:
- chi stabilisce viene prima di chi consuma
- due task che stabiliscono la stessa cosa si fondono o si ordinano, mai in
  parallelo
- ciò che è irreversibile viene prima di tutto ciò che lo userà

Se una decisione mi spetta, **chiedimela adesso** — con le opzioni e la
conseguenza di ognuna, mai come domanda aperta. Meglio dieci minuti di domande che
un lavoro rifatto.

**6 · Stato reale e via.** Controlla se un server di sviluppo è già acceso, e su
quale porta, prima di proporne un altro — un `200` non prova quale applicazione
stai guardando, verifica un contenuto identificativo. Segnala un albero sporco
(`git status --short`). Poi aspetta il mio ok sulla sequenza e comincia.

Ritmo: testimone al **30%** del contesto, tetto duro al **40%**.
Riepilogo di apertura ≤ 15 righe. Non caricare REGISTRO, DECISIONI, dossier o
`docs/**` se non servono ai task di oggi.
