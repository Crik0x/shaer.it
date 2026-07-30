// core-txn — motore puro della macchina a stati della transazione (SAD §3.2/§5).
// Nessun I/O: riceve stato e mossa, ritorna un verdetto. È il gemello testabile
// dell'autorità DB (RPC `txn_transition`/`txn_append_event`, SAD §4): la FSM è
// provata due volte — qui pura, là come rifiuto in-transazione. La transazione è
// il tronco a cui tutto si appende (reward, recensioni, movimenti ledger).

export type TxnState =
  | "OPEN"
  | "SUGGESTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "EXPIRED"
  | "ABANDONED";

/** Terminali immutabili (SAD §3.2): nessuna transizione ne esce. */
export const TERMINAL_STATES: readonly TxnState[] = ["COMPLETED", "EXPIRED", "ABANDONED"];

export function isTerminal(state: TxnState): boolean {
  return TERMINAL_STATES.includes(state);
}

/**
 * Grafo delle transizioni legali (SAD §3.2, "solo in avanti").
 * Percorso felice per adiacenza: OPEN→SUGGESTED→IN_PROGRESS→COMPLETED.
 * Off-ramp terminali EXPIRED/ABANDONED da OGNI stato non-terminale (timeout o rinuncia
 * in qualunque momento prima del completamento). I terminali non hanno uscite.
 */
const NEXT: Record<TxnState, readonly TxnState[]> = {
  OPEN: ["SUGGESTED", "EXPIRED", "ABANDONED"],
  SUGGESTED: ["IN_PROGRESS", "EXPIRED", "ABANDONED"],
  IN_PROGRESS: ["COMPLETED", "EXPIRED", "ABANDONED"],
  COMPLETED: [],
  EXPIRED: [],
  ABANDONED: [],
};

/** Gli stati raggiungibili in un passo da `state` (vuoto se terminale). */
export function nextStates(state: TxnState): readonly TxnState[] {
  return NEXT[state];
}

/**
 * Una transizione è legale se `to` è un successore diretto di `from` (AC-EE2.1).
 * Ogni salto illegale — all'indietro, saltando uno stadio, verso sé stessi, o da un
 * terminale (AC-EE2.5) — è rifiutato.
 */
export function canTransition(from: TxnState, to: TxnState): boolean {
  return NEXT[from].includes(to);
}

/** Eventi che si appendono SOLO sulla transazione completata (SAD §3.2, AC-EE2.3/EE4.1). */
export const COMPLETED_ONLY_EVENTS: readonly string[] = ["reward", "review"];

/**
 * Legalità dell'append di un evento (SAD §4, `txn_append_event`):
 * - `reward`/`review` solo su COMPLETED (AC-EE2.3): premi e recensioni esigono che la
 *   verifica sia avvenuta;
 * - ogni altro evento di processo solo su stato non-terminale (AC-EE2.5): su una
 *   transazione chiusa non si appende più nulla.
 *
 * L'append-only vero e proprio (nessun update/delete su `transaction_events`) è una
 * POLICY del DB (SAD §3.6/§6), non esprimibile in una funzione pura: non la si finge qui
 * — come `ledger.ts` non finge "solo TREASURY conia".
 */
export function canAppendEvent(state: TxnState, type: string): boolean {
  if (COMPLETED_ONLY_EVENTS.includes(type)) return state === "COMPLETED";
  return !isTerminal(state);
}
