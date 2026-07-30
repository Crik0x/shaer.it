// Motore incentivi §5.4 MDD (usato dalla demo della landing e dai suoi test).
// Il bonus di un operatore è una quota del fatturato che ha attribuito, con
// pavimento/tetto opzionali; il pool è la somma dei bonus = l'importo trattenuto
// in escrow (held); il rilascio è gated da una soglia di team. Funzioni pure:
// nessun I/O, nessuna UI — demo e test consumano le stesse regole (regola 5).

export type Campaign = {
  rate: number; // frazione del fatturato attribuito (es. 0.30 = 30%)
  goalRevenue: number; // soglia € di team che sblocca il rilascio dell'escrow
  minPerOp?: number; // pavimento del bonus singolo (§5.4 "minimo preimpostato")
  maxPerOp?: number; // tetto del bonus singolo (§5.4 "massimo preimpostato")
};

/** Bonus maturato da un operatore sul fatturato che ha attribuito. */
export function operatorBonus(revenue: number, c: Campaign): number {
  if (revenue <= 0) return 0;
  let b = revenue * c.rate;
  if (c.minPerOp != null) b = Math.max(b, c.minPerOp);
  if (c.maxPerOp != null) b = Math.min(b, c.maxPerOp);
  return round2(b);
}

/** Somma dei bonus individuali = importo trattenuto in escrow (held). */
export function bonusPool(revenues: number[], c: Campaign): number {
  return round2(revenues.reduce((sum, r) => sum + operatorBonus(r, c), 0));
}

/** L'escrow si rilascia solo se il team supera la soglia (poi serve l'approvazione). */
export function goalReached(totalRevenue: number, c: Campaign): boolean {
  return totalRevenue >= c.goalRevenue;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
