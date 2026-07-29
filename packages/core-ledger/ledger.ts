// core-ledger — motore puro del ledger a partita doppia (SAD §3.3/§5).
// Nessun I/O, nessun accesso al DB: riceve i dati come argomenti, ritorna verdetti.
// È il gemello testabile dell'autorità DB (RPC `ledger_post`): l'invariante è provato
// due volte — qui come funzione pura, là come rifiuto in-transazione (SAD §4).

export type CreditClass = "promo" | "purchased" | "earned";

/** Una riga di libro mastro. `amount` è con segno, in crediti interi (1 credito = 0,01 €). */
export interface Posting {
  account: string; // id conto o codice sistema (es. 'SHAER_TREASURY')
  class: CreditClass;
  amount: number; // intero con segno; + = accredito, − = addebito
}

/** Classi coperte da riserva € (solvibilità le vincola). `promo` non è coperto. */
export const BACKED_CLASSES: readonly CreditClass[] = ["purchased", "earned"];

/**
 * Invariante di partita doppia (AC-EE3.1). La classe del credito si preserva nei
 * movimenti (SHAER_MASTER C35), quindi il vincolo è **somma zero per ogni classe**:
 * più forte della sola somma totale, e la implica. Interi obbligatori: mai float sul denaro.
 */
export function isBalanced(postings: Posting[]): boolean {
  if (postings.length === 0) return false; // un movimento vuoto non è un movimento
  const byClass = new Map<CreditClass, number>();
  for (const p of postings) {
    if (!Number.isInteger(p.amount)) return false;
    byClass.set(p.class, (byClass.get(p.class) ?? 0) + p.amount);
  }
  for (const sum of byClass.values()) if (sum !== 0) return false;
  return true;
}

// AC-EE3.2 "solo TREASURY conia": non è enforceable in modo puro a livello di singolo
// journal — un journal bilanciato non crea mai credito netto, e distinguere un conio da un
// giroconto esige il *tipo* di conto (system_code/kind). Vive quindi nella RPC `ledger_post`
// con la metadata dei conti (SAD §3.3/§4), dove il test lo verifica sul DB reale. Qui non si
// finge un invariante che i soli postings non contengono.

/**
 * Invariante di solvibilità (AC-EE3.3): dopo ogni movimento, la riserva € deve
 * coprire tutti i crediti coperti (`purchased` + `earned`) circolanti.
 * 1 credito = 0,01 € = 1 centesimo, quindi il confronto è diretto in centesimi.
 */
export function checkSolvency(reserveCents: number, backedCirculating: number): boolean {
  return reserveCents >= backedCirculating;
}
