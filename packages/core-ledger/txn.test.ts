import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canTransition,
  isTerminal,
  nextStates,
  canAppendEvent,
  TERMINAL_STATES,
  type TxnState,
} from "./txn.ts";

const ALL: readonly TxnState[] = [
  "OPEN",
  "SUGGESTED",
  "IN_PROGRESS",
  "COMPLETED",
  "EXPIRED",
  "ABANDONED",
];

// Verità del grafo scritta a mano, INDIPENDENTE dalla tabella NEXT del modulo:
// se l'implementazione e questa verità divergono, il test esaustivo sotto lo coglie.
const LEGAL = new Set<string>([
  "OPEN>SUGGESTED",
  "OPEN>EXPIRED",
  "OPEN>ABANDONED",
  "SUGGESTED>IN_PROGRESS",
  "SUGGESTED>EXPIRED",
  "SUGGESTED>ABANDONED",
  "IN_PROGRESS>COMPLETED",
  "IN_PROGRESS>EXPIRED",
  "IN_PROGRESS>ABANDONED",
]);

// ── canTransition: la tabella intera, tutte le 36 coppie (AC-EE2.1/EE2.5) ─────

test("canTransition: le 36 coppie stato×stato combaciano con il grafo atteso", () => {
  for (const from of ALL) {
    for (const to of ALL) {
      const atteso = LEGAL.has(`${from}>${to}`);
      assert.equal(
        canTransition(from, to),
        atteso,
        `${from}→${to} dovrebbe essere ${atteso ? "legale" : "illegale"}`,
      );
    }
  }
});

// ── letture mirate, per ancorare gli AC ai casi che contano ──────────────────

test("percorso felice: ogni passo di adiacenza è legale", () => {
  assert.equal(canTransition("OPEN", "SUGGESTED"), true);
  assert.equal(canTransition("SUGGESTED", "IN_PROGRESS"), true);
  assert.equal(canTransition("IN_PROGRESS", "COMPLETED"), true);
});

test("AC-EE2.1: un salto di stadio è rifiutato (solo adiacenza)", () => {
  assert.equal(canTransition("OPEN", "IN_PROGRESS"), false);
  assert.equal(canTransition("OPEN", "COMPLETED"), false);
  assert.equal(canTransition("SUGGESTED", "COMPLETED"), false);
});

test("solo in avanti: nessuna transizione all'indietro né su sé stessi", () => {
  assert.equal(canTransition("SUGGESTED", "OPEN"), false);
  assert.equal(canTransition("IN_PROGRESS", "SUGGESTED"), false);
  assert.equal(canTransition("COMPLETED", "IN_PROGRESS"), false);
  for (const s of ALL) assert.equal(canTransition(s, s), false);
});

test("off-ramp: EXPIRED e ABANDONED raggiungibili da ogni stato non-terminale", () => {
  for (const s of ["OPEN", "SUGGESTED", "IN_PROGRESS"] as const) {
    assert.equal(canTransition(s, "EXPIRED"), true, `${s}→EXPIRED`);
    assert.equal(canTransition(s, "ABANDONED"), true, `${s}→ABANDONED`);
  }
});

test("AC-EE2.5: da un terminale non esce alcuna transizione", () => {
  for (const t of TERMINAL_STATES) {
    assert.deepEqual(nextStates(t), []);
    for (const to of ALL) {
      assert.equal(canTransition(t, to), false, `${t}→${to} deve essere illegale`);
    }
  }
});

test("isTerminal: solo COMPLETED/EXPIRED/ABANDONED sono terminali", () => {
  assert.equal(isTerminal("OPEN"), false);
  assert.equal(isTerminal("SUGGESTED"), false);
  assert.equal(isTerminal("IN_PROGRESS"), false);
  assert.equal(isTerminal("COMPLETED"), true);
  assert.equal(isTerminal("EXPIRED"), true);
  assert.equal(isTerminal("ABANDONED"), true);
});

// ── canAppendEvent (AC-EE2.3/EE4.1 · AC-EE2.5) ───────────────────────────────

test("AC-EE2.3: reward/review si appendono SOLO su COMPLETED", () => {
  for (const type of ["reward", "review"]) {
    assert.equal(canAppendEvent("COMPLETED", type), true, `${type}@COMPLETED`);
    for (const s of ["OPEN", "SUGGESTED", "IN_PROGRESS", "EXPIRED", "ABANDONED"] as const) {
      assert.equal(canAppendEvent(s, type), false, `${type}@${s} deve essere rifiutato`);
    }
  }
});

test("eventi di processo si appendono solo su stato non-terminale (AC-EE2.5)", () => {
  for (const type of ["suggested", "sold", "received", "delivered"]) {
    assert.equal(canAppendEvent("OPEN", type), true, `${type}@OPEN`);
    assert.equal(canAppendEvent("IN_PROGRESS", type), true, `${type}@IN_PROGRESS`);
    // su una transazione chiusa non si appende più nulla di processo
    assert.equal(canAppendEvent("COMPLETED", type), false, `${type}@COMPLETED`);
    assert.equal(canAppendEvent("EXPIRED", type), false, `${type}@EXPIRED`);
    assert.equal(canAppendEvent("ABANDONED", type), false, `${type}@ABANDONED`);
  }
});

// ── proprietà: coerenza del grafo su ogni coppia ─────────────────────────────

test("property: nessuna transizione legale ha per origine un terminale", () => {
  for (const from of ALL) {
    for (const to of ALL) {
      if (canTransition(from, to)) assert.equal(isTerminal(from), false, `${from}→${to}`);
    }
  }
});

test("property: ogni transizione legale porta a uno stato più avanti o a un terminale", () => {
  const RANK: Record<TxnState, number> = {
    OPEN: 0,
    SUGGESTED: 1,
    IN_PROGRESS: 2,
    COMPLETED: 3,
    EXPIRED: 3,
    ABANDONED: 3,
  };
  for (const from of ALL) {
    for (const to of ALL) {
      if (canTransition(from, to)) assert.ok(RANK[to] > RANK[from], `${from}→${to} non avanza`);
    }
  }
});
