# Agente «architetto / PM» — da costruire

**Stato:** da costruire · **Costo:** un agente in più da scrivere, testare e mantenere
(come i 4 esistenti) · **Precede:** niente lo blocca; conviene quando i file di scope
crescono e `MAPPA.md` a mano inizia a costare.

## Perché

La `MAPPA.md` va tenuta in ordine **tra** le sessioni: profili, pannello, servizi,
stato di costruzione, e il registro delle incongruenze. Farlo a mano a ogni `/chiusura`
funziona finché lo scope è piccolo. Quando cresce, serve un guardiano che **rilegga
tutto** e segnali cosa non torna — senza toccare il codice.

## Cosa fa (e cosa NON fa)

Modello: come `distillatore` e `revisore` — **riporta, non corregge mai**.

Invocato (comando `/mappa` o dentro `/chiusura`), rilegge `MD/**`, `dossier/**`,
`memoria/STATO.md`, `memoria/TODO.md`, e produce un report + una `MAPPA.md` aggiornata
in bozza, che Nick approva prima che sostituisca la precedente. Segnala:

- **Buchi** — un modulo del catalogo (`MDD §5`) senza dossier né task che lo apra.
- **Doppioni** — due file che dichiarano la stessa cosa (es. la collisione Modulo 7
  Prenotazioni vs Gestionale già in `MAPPA §6`).
- **Orfani** — un `T-NNN` citato in un dossier/`DECISIONI.md` ma assente dal saldo
  `TODO.md` (è la **L-012** di `LEZIONI.md`, oggi ancora `→ regola`: questo agente la
  converte in `→ controllo`).
- **Deriva** — `STATO.md`/`MAPPA.md` che dicono cose diverse dalla realtà del codice
  (una route, una colonna, un test) — verifica reale, non narrativa (regola 1).
- **Decisioni non promosse** — un `[LOCKED]`/«deciso» in un dossier senza `E-D-NN`
  in `DECISIONI.md` (è la **L-008**, già `→ hook §11`: qui si incrocia col saldo).

## Piano pronto

1. `.claude/agents/architetto.md` — system prompt **in inglese** (come gli altri
   agenti), tools `Read, Grep, Glob` (sola lettura, come `distillatore`). Input: la
   lista dei file-fonte; output: un report a sezioni fisse (buchi/doppioni/orfani/
   deriva/decisioni) + la bozza di `MAPPA.md`.
2. `.claude/commands/mappa.md` — comando `/mappa` che invoca l'agente e mostra il
   report; l'aggiornamento di `MAPPA.md` resta un passo che Nick conferma.
3. Aggancio opzionale in `/chiusura`: dopo il `distillatore`, un giro di `architetto`
   così la mappa non deriva mai più di una sessione.
4. Prova: un caso-seme con un buco noto e un orfano noto (es. rimuovere un T-NNN dal
   saldo) → l'agente deve segnalarli entrambi. Verde = pronto.

## Riferimenti da leggere prima di costruirlo

- `.claude/agents/distillatore.md` e `revisore.md` — il pattern «riporta, non corregge».
- `.claude/rules/lavoro.md §8-bis` (legge del TODO) e `§9` (conversione lezioni).
- `MD/ecosistema/MAPPA.md §6` — il formato del registro incongruenze che l'agente mantiene.
