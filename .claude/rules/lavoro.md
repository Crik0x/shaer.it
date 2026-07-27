# Il percorso di ogni task

**La regola madre**: ogni token speso a ri-scoprire ciò che i file già dicono, o a
leggere per intero un file che bastava grep-are, è sprecato.

## 1 · Verifica la realtà prima della carta

Una colonna → lo schema reale. Una route → il filesystem. Un fix → `git diff`.
Un comportamento → il test. I documenti descrivono le intenzioni, non lo stato.

## 2 · Lettura mirata

- File > 15 KB: **Grep** prima, poi **Read con offset/limit**. Mai full-read.
- Non ri-leggere un file appena modificato per «verificare»: l'edit sarebbe
  fallito se non avesse combaciato.
- Non caricare REGISTRO, DECISIONI, dossier o `docs/**` se non servono al task.
- Tool-call indipendenti: tutti nello stesso messaggio.
- Strumenti dedicati (Glob/Grep/Read) invece dei comandi di shell equivalenti.

## 2-bis · Classifica il task, e cerca i precedenti

Prima di iniziare, dichiara il livello — decide quanto dossier servirà (dettagli
in `dossier/MODELLO.md`, non serve caricarlo per classificare):

- **S · snella** — un file, nessuna decisione, nessuna incognita
- **M · media** — più file, o una scelta tecnica da fare
- **C · complessa** — tocca il dominio, il denaro, i dati personali o la
  compliance · serve una decisione di Nick · ha stati e flussi

Nel dubbio si sale, mai si scende.

Su **M** e **C**: prima di analizzare da capo, `grep` delle `aree` del task in
`dossier/archivio/` e `dossier/PATTERN.md`. Se un precedente esiste, leggerlo
costa 40 righe; ri-derivarlo costa una sessione.

## 3 · Gate incongruenza

Se due fonti dicono cose diverse, o un requisito è ambiguo: **fermati**. Esponi le
opzioni con il costo di ciascuna e aspetta. Per scelte strutturali invoca
l'agente `stratega` (3 opzioni: sicura, bilanciata, ambiziosa).

Mai risolvere un'ambiguità scegliendo in silenzio l'interpretazione più comoda.

## 4 · Gate ampiezza e passo di composizione

Più di 2 file da toccare → proponi un piano e aspetta l'ok.

**Con più task aperti, prima di scrivere una riga**: per ognuno dichiara cosa
**stabilisce** (una struttura, un nome, una variabile, una regola, un contratto) e
cosa **consuma** di ciò che altri stabiliscono.

- Due task che stabiliscono la stessa cosa → si fondono, o si ordina chi la
  stabilisce per primo. Mai in parallelo.
- Chi consuma viene dopo chi stabilisce.
- Un task che stabilisce qualcosa di irreversibile viene **prima** di tutti quelli
  che lo useranno — altrimenti si scrive due volte.

Il prodotto è una **sequenza**, approvata una volta sola, che poi non si
interrompe. Prevedere l'incastro costa minuti; scoprirlo a lavoro fatto costa il
lavoro.

Dove serve una decisione di Nick, **chiedila prima della sequenza, non
durante**, e sempre come opzioni con la loro conseguenza — mai come domanda aperta.

## 5 · Implementazione

- **Additiva** su ciò che è in produzione: si affianca, non si sostituisce,
  finché il nuovo non è provato.
- La logica di dominio vive in **funzioni pure**, testabili senza I/O né UI.
- Nessun nome di colonna o campo scritto a memoria: si prende dallo schema o dai
  tipi generati. Se il progetto non genera tipi, si verifica sullo schema reale
  prima di scrivere la query.

## 6 · La prova

Gerarchia, dalla più forte alla più debole:

1. **Un test verde** — per tutto ciò che è calcolabile. È la sola prova che si
   ri-verifica a costo zero e non mente mai.
2. **Un valore misurato** — una query, l'output di un comando, un numero atteso.
   Per cose misurabili vale più di uno screenshot.
3. **Il browser** — solo per ciò che è genuinamente visivo.

Un codice di stato `200` prova che *qualcosa* risponde, non *cosa*: verifica
sempre un contenuto identificativo. Il server di sviluppo **si riusa, non si
riavvia**: controlla se è già acceso, e su quale porta, prima di lanciarne un
altro.

> **Mai scrivere «fatto» per qualcosa che non si è visto funzionare.**
> Non poter verificare è legittimo e si segna `[~]`. Dichiarare verificato ciò
> che non lo è, no.

## 7 · Propagazione

Dopo ogni correzione: `grep` del pattern vecchio su tutto il repo. Il fix è finito
quando il grep torna vuoto, non quando «mi pare di aver sistemato».
Prima di cambiare un numero-soglia: `grep -rn` di quel numero su `CLAUDE.md`,
regole, comandi, agenti e script.

## 8 · Chiusura del task — il dossier

Commit che dice *cosa e perché*. Se il diff tocca il codice di produzione, prima
passa dall'agente `revisore`: `esito=respinto` → non si committa.

**Ogni task lascia un dossier** in `dossier/T-NNN-slug.md` — struttura e sezioni
in `dossier/MODELLO.md`. Il livello decide la profondità: su una **S** basta
l'attrito (e se non c'è stato attrito, tre righe: anche questo è un dato). Su una
**C** il dossier è pieno.

Il dossier di un task che **non** si chiude si scrive **mentre il contesto è
ancora caldo**, non alla sessione dopo. Deve contenere il piano già pronto: se
dice «continuare l'analisi», non è finito.

A task chiuso il dossier va in `dossier/archivio/`. **Non si cancella mai.**

## 8-bis · La legge del TODO

`memoria/TODO.md` **non si riscrive mai.** È un saldo, non una fotografia.

- Cresce solo per task nuovi.
- Cala solo per task arrivati a destinazione **con prova**.
- Un task riportato **mantiene il suo id** e guadagna un contatore: `↻1`, `↻2`.
- In testa al file, la riga di saldo: `12 aperti — 9 nuovi, 3 riportati`.

A **`↻3` ci si ferma.** Tre riporti non sono sfortuna: o il task è troppo grande,
o è bloccato da qualcosa che nessuno ha ancora nominato, o non serve davvero.
Si porta a Nick con la diagnosi e due o tre vie d'uscita, ciascuna con la sua
conseguenza.

Solo la sezione «Per Nick» si sostituisce. Tutto il resto si conserva.

## 8-ter · Le azioni di Nick — stato `[N]`

Ciò che **solo Nick può fare** (infrastruttura, segreti, pagamenti, decisioni di
dominio, prove che esigono un IP/dispositivo reale) non è un task che si «fa»: è un
task che si **consegna**. Vive in TODO con lo stato `[N]` e la regola è secca:

- **Ogni `[N]` porta il come-fare**, passo per passo, pronto da eseguire senza
  altro contesto. Un `[N]` che dice solo *cosa* e non *come* è incompleto.
- **Quando Nick conferma «fatto», la riga `[N]` si rimuove** — non si archivia, non
  lascia saldo: la prova del suo effetto vive già nel task che la consumava (o nel
  REGISTRO se era un task a sé). È la sola eccezione alla legge di conservazione
  §8-bis, e vale **solo** per le `[N]`.
- Claude **non blocca** sulle `[N]`: sviluppa tutto il lavoro che non le consuma,
  le scrive, e riprende da dove servono appena Nick le ha eseguite.
- Chiudendo, Claude **avvisa sempre** prima di andare in `/chiusura`.

Aggiungi `[N]` alla legenda degli stati in testa a `TODO.md`.

## 9 · Le lezioni: o diventano codice, o muoiono

Quando un errore si ripete o una correzione insegna qualcosa, si scrive in
`memoria/LEZIONI.md` con un campo **conversione**:

| Conversione | Significato |
|---|---|
| `→ test` | esiste un test che fallirebbe se l'errore tornasse |
| `→ tipo` | un tipo o un vincolo dello schema rende l'errore impossibile |
| `→ hook` | un controllo pre-commit lo intercetta |
| `→ regola` | non è meccanizzabile: resta testo — **max 5 voci** |

**Una lezione ferma su `→ regola` per 3 sessioni viene riscritta come controllo o
ritirata.** Una volta convertita, resta in LEZIONI.md come una riga sola che punta
al test/tipo/hook che la incarna: il testo costoso sparisce, la protezione resta.

Gerarchia della forza: nota < lezione < regola < controllo meccanico < hook.
Salire di un gradino è sempre meglio che riscrivere lo stesso avviso più forte.

## 9-bis · Il ritmo della sessione

- **Al 25% del contesto consumato**: si scrivono i dossier e si fissa il TODO.
  È il testimone — da lì una sessione a freddo deve poter continuare da sola.
- **Al 40%**: tetto duro. Non si apre altro lavoro, si chiude.

Il limite non è mai un numero di task: è il contesto. Se i task aperti sono più di
quanti ne stiano in una sessione, la risposta è la **sequenza**, non il taglio.

## 10 · Il costo del metodo

I file sempre caricati hanno un budget di **6.000 token**. `/costo` lo misura e lo
storicizza in `memoria/costo.csv`. Oltre 8.000 l'hook pre-commit blocca.
Se il budget si avvicina, si pota — non si alza la soglia.

## 10-bis · La resa del metodo

Il costo si misura da §10. Ma un metodo che sa solo quanto costa, e non quanto
rende, dimostra di essere economico senza dimostrare di valere — resta
un'opinione. `scripts/resa.mjs` è il contrappeso: a ogni chiusura registra le
quattro cose che il metodo esiste per intercettare —

- **precedenti riusati** — un dossier o un pattern letto invece di ri-derivato
- **declassamenti** — un `[x]` senza prova sceso a `[~]`: un «fatto» falso colto
- **lezioni convertite** — una lezione diventata test, tipo o hook
- **riporti fermati** — un task arrivato a `↻3` e portato a Nick, non ri-rimandato

Non ha tetto: la resa non si pota, si accumula. Non entra nei file sempre
caricati — costa zero contesto. Quando il costo di §10 sale, è questa la colonna
contro cui si giudica se ne valeva la pena.
