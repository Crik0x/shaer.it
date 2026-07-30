---
description: Chiude la sessione — diff meccanico, dossier, distillatore, saldo TODO, commit
---

Chiudi la sessione. Il controllo è **meccanico, non mnemonico**: non ricordare
cosa hai fatto, guardalo.

**Prima di tutto, il livello della sessione** — la chiusura scala come il dossier.
Guarda il diff (`git diff <ancora>..HEAD --stat`) e i dossier toccati:

- **snella** — nessun file di produzione toccato **e** nessun dossier è di livello
  C (S ed M vanno bene): fai i passi 1, 2, 6, 7 e **salta revisore e
  distillatore**. Distillare dossier leggeri costa più di quanto rende.
- **piena** — tutto il resto (un file di produzione toccato, oppure un dossier C):
  sette passi, in ordine.

Nel dubbio, piena.

**1 · Diff meccanico di TODO.**
Leggi l'àncora `Apertura:` da `memoria/STATO.md`, poi:
`git show <ancora>:memoria/TODO.md`
Confronta con il TODO di adesso e costruisci una tabella:
`id · task · destinazione · prova`

Le sole destinazioni lecite sono **fatto** (→REGISTRO, con la prova),
**archiviato** (→DECISIONI, col perché), **riportato** (resta in TODO, `↻`+1).

> **Una riga sparita senza destinazione con prova rientra in TODO com'era.**
> Non chiedere il permesso di rimetterla: rimettila e dimmelo.

**Il verso opposto vale uguale, ed è obbligatorio.** Prima capisci *cosa è stato
fatto* in questa sessione; poi ogni task **eseguito e chiuso**, o che **Nick ha
confermato fatto** (le `[N]` incluse), **esce dalle sezioni operative**: va in
«Chiusi»/REGISTRO con la prova (o si rimuove, se `[N]`). Chiuso il passo, **nessun
`[ ]`/`[~]` nelle sezioni «da fare» è qualcosa che abbiamo già eseguito**. Il TODO è
il residuo, mai lo storico. *(Un task solo parzialmente fatto resta, ma con la fetta
chiusa marcata: il residuo dev'essere leggibile come «da fare» onesto.)*

**2 · Stati onesti.**
Ogni `[x]` senza una prova rintracciabile viene **declassato a `[~]`**.
La prova è: un test che passa, un valore misurato, un hash di commit, uno
screenshot. «Mi pare» non è una prova. Meglio un `[~]` scomodo che un `[x]` falso.

**3 · Revisore.**
Se il diff di sessione tocca il codice di produzione, invoca l'agente `revisore` sul
diff. Salva il JSON in `memoria/review/AAAA-MM-GG.json`.
**Se `esito=respinto`: niente chiusura.** Si sistema, poi si richiude.

**4 · I dossier.**
Un dossier per **ogni** task toccato — struttura in `dossier/MODELLO.md`, la
profondità la decide il `tier`.

Per i task **non chiusi** questo è il passo più importante della giornata:
l'analisi si scrive **adesso**, mentre il contesto è caldo. Deve contenere il
piano già pronto. Se stai scrivendo «continuare l'analisi», l'analisi va fatta
ora — è l'unico momento in cui costa poco.

Per i task **chiusi**: aggiorna `stato: chiuso` e sposta il file in
`dossier/archivio/`. Mai cancellarlo.

**5 · Distillatore.**
Invoca l'agente `distillatore` sui dossier della sessione. Riporta:
- i rilievi sui dossier disonesti o incompleti — **e correggili prima di chiudere**
- i `pattern_nuovi` → aggiungili a `dossier/PATTERN.md`
- le `lezioni_proposte` → in `memoria/LEZIONI.md` con la loro conversione
- i `precedenti_utili` → annotali accanto ai task aperti in TODO

Poi fai girare il **cricchetto delle lezioni**: per ogni lezione ancora
`→ regola`, incrementa il contatore di sessioni. A 3, va riscritta come controllo
meccanico o ritirata — proponimi quale delle due. Se le voci `→ regola` sono più
di 5, se ne converte una prima di aggiungerne un'altra.

**6 · Aggiorna la memoria — e MISURA.**
- `STATO.md` si **riscrive**: è una fotografia, ed è il solo file che si riscrive
- `TODO.md` **non si riscrive mai**. Si aggiorna: i chiusi escono con la loro
  destinazione, i riportati restano col loro id e `↻`+1, i nuovi si aggiungono.
  Aggiorna la riga di saldo in testa. A **`↻3` fermati** e portami il task con la
  diagnosi e due o tre vie d'uscita, ciascuna con la sua conseguenza.
  «Per Nick» e il prompt di ripresa non stanno più in TODO: vivono in `RIPRESA.md`.
- **`memoria/RIPRESA.md`** (`lavoro.md` §8-quater): riscrivi «Per Nick» (azioni
  `[N]`, segnalazioni) **e** il blocco-prompt «Prossima sessione» col piano pronto
  per la sessione dopo. È il file che `/apertura` carica al posto delle sezioni
  d'avvio. **Sempre**, dopo ogni chiusura: se manca, la chiusura non è finita.
  Il prompt riflette la **realtà di adesso**: non ripropone un task già eseguito né
  una decisione già presa. Se la sessione ha chiuso ciò che il vecchio prompt
  chiedeva, il nuovo riparte da ciò che resta — mai una fotografia stantìa.
- `REGISTRO.md` in append: `T-NNN · data · task · esito · prova`
- esegui `node scripts/costo.mjs`: i tetti si **misurano**, non si stimano a occhio
- esegui `node scripts/resa.mjs --registra P D C R` coi quattro numeri di questa
  sessione — precedenti riusati, `[x]` declassati, lezioni convertite, riporti
  fermati a `↻3`. È il contrappeso del costo: il metodo ora si pesa **e** segna
  cosa ha intercettato. Zero su tutti è un dato onesto, non un fallimento.

**7 · Commit e riepilogo.**
Commit in italiano. Riepilogo finale ≤ 10 righe: cosa è entrato, cosa resta
riportato e **dove sta la sua analisi**, cosa aspetta Nick, il costo del metodo
col suo delta e la riga di resa — cosa il metodo ha intercettato oggi.
