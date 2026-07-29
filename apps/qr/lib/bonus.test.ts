import { test } from "node:test";
import assert from "node:assert/strict";

import { operatorBonus, bonusPool, goalReached, type Campaign } from "./bonus.ts";

// Motore incentivi §5.4 (demo landing): quota proporzionale, pavimento/tetto,
// pool = escrow, soglia di team. Puro: nessun I/O.
//   node --test lib/bonus.test.ts

const base: Campaign = { rate: 0.3, goalRevenue: 1000 };

test("operatorBonus: quota proporzionale al fatturato", () => {
  assert.equal(operatorBonus(200, base), 60);
  assert.equal(operatorBonus(0, base), 0);
  assert.equal(operatorBonus(-50, base), 0);
});

test("operatorBonus: pavimento e tetto §5.4", () => {
  const c: Campaign = { ...base, minPerOp: 50, maxPerOp: 100 };
  assert.equal(operatorBonus(100, c), 50); // 30 → alzato al minimo 50
  assert.equal(operatorBonus(500, c), 100); // 150 → tagliato al massimo 100
  assert.equal(operatorBonus(300, c), 90); // 90 dentro la banda
});

test("bonusPool: somma dei bonus = importo in escrow", () => {
  assert.equal(bonusPool([200, 300, 100], base), 180); // 60+90+30
});

test("goalReached: soglia inclusiva", () => {
  assert.equal(goalReached(1000, base), true);
  assert.equal(goalReached(999.99, base), false);
});
