import { test } from "node:test";
import assert from "node:assert/strict";
import { isBalanced, checkSolvency, type Posting } from "./ledger.ts";

// ── isBalanced (AC-EE3.1) ────────────────────────────────────────────────────

test("isBalanced: un trasferimento pari nella stessa classe somma a zero", () => {
  const j: Posting[] = [
    { account: "buyer", class: "purchased", amount: -500 },
    { account: "seller", class: "purchased", amount: 500 },
  ];
  assert.equal(isBalanced(j), true);
});

test("isBalanced: un movimento sbilanciato è rifiutato", () => {
  const j: Posting[] = [
    { account: "buyer", class: "purchased", amount: -500 },
    { account: "seller", class: "purchased", amount: 499 },
  ];
  assert.equal(isBalanced(j), false);
});

test("isBalanced: bilanciato nel totale ma non per classe è rifiutato (classe preservata)", () => {
  const j: Posting[] = [
    { account: "a", class: "promo", amount: -500 },
    { account: "b", class: "purchased", amount: 500 },
  ];
  assert.equal(isBalanced(j), false);
});

test("isBalanced: importi non interi rifiutati (mai float sul denaro)", () => {
  const j: Posting[] = [
    { account: "a", class: "earned", amount: -1.5 },
    { account: "b", class: "earned", amount: 1.5 },
  ];
  assert.equal(isBalanced(j), false);
});

test("isBalanced: movimento vuoto rifiutato", () => {
  assert.equal(isBalanced([]), false);
});

// AC-EE3.2 "solo TREASURY conia" non è testabile qui: esige il tipo di conto e vive
// nella RPC `ledger_post` (SAD §4), col suo test sul DB reale. → continuazione di T-029.

// ── checkSolvency (AC-EE3.3) ─────────────────────────────────────────────────

test("checkSolvency: riserva ≥ crediti coperti circolanti", () => {
  assert.equal(checkSolvency(10_000, 10_000), true);
  assert.equal(checkSolvency(10_001, 10_000), true);
  assert.equal(checkSolvency(9_999, 10_000), false);
});

// ── fuzz property-based (senza librerie nuove — regola 10) ────────────────────

function randInt(lo: number, hi: number): number {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

test("property: un journal costruito bilanciato per classe passa sempre isBalanced", () => {
  const classes: Posting["class"][] = ["promo", "purchased", "earned"];
  for (let i = 0; i < 2000; i++) {
    const postings: Posting[] = [];
    for (const cls of classes) {
      // per ogni classe presente, genera n coppie (+x, −x): somma di classe = 0 per costruzione
      const pairs = randInt(0, 3);
      for (let k = 0; k < pairs; k++) {
        const amt = randInt(1, 1_000_000);
        postings.push({ account: `s${k}`, class: cls, amount: amt });
        postings.push({ account: `d${k}`, class: cls, amount: -amt });
      }
    }
    if (postings.length === 0) continue; // scarta il caso vuoto (già coperto a parte)
    assert.equal(isBalanced(postings), true);
  }
});

test("property: un singolo squilibrio casuale è sempre colto", () => {
  for (let i = 0; i < 2000; i++) {
    const amt = randInt(1, 1_000_000);
    const drift = randInt(1, 1000);
    const postings: Posting[] = [
      { account: "s", class: "earned", amount: amt },
      { account: "d", class: "earned", amount: -(amt - drift) }, // manca `drift`
    ];
    assert.equal(isBalanced(postings), false);
  }
});
