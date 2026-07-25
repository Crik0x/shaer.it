import { test } from "node:test";
import assert from "node:assert/strict";

import {
  children,
  subtreeScans,
  subtreeSize,
  maxDepth,
  inFocus,
  litEdges,
  layout,
  nodeStats,
  nodeRadius,
  nodeColor,
  initials,
  VMAX,
  type ReteTree,
} from "./rete.ts";

// Nodo isolato con volume `v`: sottoalbero == scans proprie.
const solo = (v: number): ReteTree => ({
  a: { id: "a", parentId: null, name: "x", scans: v },
});

// Albero di prova:
//   Tu(20)
//    ├ A(10) ── C(5), D(3)
//    └ B(8)  ── E(100)
const TREE: ReteTree = {
  n0: { id: "n0", parentId: null, name: "Tu", scans: 20 },
  n1: { id: "n1", parentId: "n0", name: "A", scans: 10 },
  n2: { id: "n2", parentId: "n0", name: "B", scans: 8 },
  n3: { id: "n3", parentId: "n1", name: "C", scans: 5 },
  n4: { id: "n4", parentId: "n1", name: "D", scans: 3 },
  n5: { id: "n5", parentId: "n2", name: "E", scans: 100 },
};

test("children: solo i figli diretti", () => {
  assert.deepEqual(
    children(TREE, "n0").map((n) => n.id).sort(),
    ["n1", "n2"],
  );
  assert.deepEqual(children(TREE, "n5"), []);
});

test("subtreeScans: rollup del sottoalbero, nodo incluso", () => {
  assert.equal(subtreeScans(TREE, "n3"), 5);
  assert.equal(subtreeScans(TREE, "n1"), 18); // 10+5+3
  assert.equal(subtreeScans(TREE, "n2"), 108); // 8+100
  assert.equal(subtreeScans(TREE, "n0"), 146); // 20+18+108
});

test("subtreeSize: conteggio discendenti, nodo escluso", () => {
  assert.equal(subtreeSize(TREE, "n0"), 5);
  assert.equal(subtreeSize(TREE, "n1"), 2);
  assert.equal(subtreeSize(TREE, "n5"), 0);
});

test("maxDepth: profondità della gamba", () => {
  assert.equal(maxDepth(TREE, "n0"), 2);
  assert.equal(maxDepth(TREE, "n1"), 1);
  assert.equal(maxDepth(TREE, "n3"), 0);
});

test("inFocus: id sta nel sottoalbero del focus (o è il focus)", () => {
  assert.equal(inFocus(TREE, "n5", "n2"), true);
  assert.equal(inFocus(TREE, "n2", "n2"), true);
  assert.equal(inFocus(TREE, "n1", "n2"), false);
});

test("litEdges: top-3 gambe del focus + spina dorsale del figlio più forte", () => {
  const { edges, heads } = litEdges(TREE, "n0");
  // gambe dirette accese
  assert.ok(edges.has("n0>n2"));
  assert.ok(edges.has("n0>n1"));
  // spina: n2→n5 (100) e n1→n3 (5, > n4=3)
  assert.ok(edges.has("n2>n5"));
  assert.ok(edges.has("n1>n3"));
  // n4 non è sulla spina: il suo arco NON è acceso
  assert.ok(!edges.has("n1>n4"));
  assert.deepEqual([...heads].sort(), ["n1", "n2"]);
});

test("layout: il nodo interno si centra sui figli, le foglie hanno colonne distinte", () => {
  const l = layout(TREE, "n0");
  assert.equal(l.leaves, 3);
  assert.equal(l.maxD, 2);
  // radice centrata sulla media dei due figli
  assert.equal(l.pos.n0.x, (l.pos.n1.x + l.pos.n2.x) / 2);
  // foglie su colonne distinte
  const xs = new Set([l.pos.n3.x, l.pos.n4.x, l.pos.n5.x]);
  assert.equal(xs.size, 3);
  // profondità in pixel monotona con la profondità logica
  assert.ok(l.pos.n0.y < l.pos.n1.y && l.pos.n1.y < l.pos.n3.y);
});

test("nodeStats: proprie, rete, profondità, gambe per volume", () => {
  const s = nodeStats(TREE, "n0");
  assert.equal(s.scans, 20);
  assert.equal(s.rete, 5);
  assert.equal(s.depth, 2);
  // gambe dirette ordinate per volume: B(108) prima di A(18)
  assert.deepEqual(s.legs.map((l) => l.id), ["n2", "n1"]);
});

test("nodeRadius: radice fissa, poi cresce con √volume fino a saturare", () => {
  // la radice ha raggio fisso a prescindere dal volume
  assert.equal(nodeRadius(solo(999), "a", "a"), 30);
  // volume 0 → raggio minimo 16; volume ≥ VMAX → massimo 32
  assert.equal(nodeRadius(solo(0), "a", "root"), 16);
  assert.equal(nodeRadius(solo(VMAX), "a", "root"), 32);
  // monotòno e dentro i limiti per un volume intermedio
  const r = nodeRadius(solo(400), "a", "root");
  assert.ok(r > 16 && r < 32);
});

test("nodeColor: una soglia per fascia di volume", () => {
  assert.equal(nodeColor(solo(1200), "a"), "#9B3B57");
  assert.equal(nodeColor(solo(700), "a"), "#C4687A");
  assert.equal(nodeColor(solo(400), "a"), "#D9683A");
  assert.equal(nodeColor(solo(200), "a"), "#E08A2E");
  assert.equal(nodeColor(solo(80), "a"), "#E0A94B");
  assert.equal(nodeColor(solo(79), "a"), "#C9A87C");
  assert.equal(nodeColor(solo(0), "a"), "#C9A87C");
});

test("initials: due lettere maiuscole, robusto a vuoto e spazi", () => {
  assert.equal(initials("Giulia"), "GI");
  assert.equal(initials("A"), "A");
  assert.equal(initials("  bruno"), "BR");
  assert.equal(initials(""), "?");
  assert.equal(initials("   "), "?");
});
