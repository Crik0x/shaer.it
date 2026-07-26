import { test } from "node:test";
import assert from "node:assert/strict";
import { groupCount, topBranch, dailyBuckets, pct, type RollupRow } from "./dashboard.ts";

test("groupCount: conta e ordina per frequenza; null → (ignoto)", () => {
  const g = groupCount(["Chrome", "Safari", "Chrome", null, "", "Chrome"]);
  assert.deepEqual(g[0], { label: "Chrome", hits: 3 });
  assert.equal(g.find((s) => s.label === "(ignoto)")?.hits, 2);
  assert.equal(g.find((s) => s.label === "Safari")?.hits, 1);
});

test("topBranch: radice (parent null) col sottoalbero maggiore", () => {
  const rows: RollupRow[] = [
    { id: "a", parent_id: null, name: "A", purpose: "root", own_scans: 2, subtree_scans: 10 },
    { id: "b", parent_id: null, name: "B", purpose: "root", own_scans: 5, subtree_scans: 40 },
    { id: "c", parent_id: "b", name: "C", purpose: "campaign", own_scans: 35, subtree_scans: 35 },
  ];
  assert.equal(topBranch(rows)?.id, "b");
  assert.equal(topBranch([]), null);
});

test("topBranch: bigint come stringa è confrontato numericamente", () => {
  const rows: RollupRow[] = [
    { id: "a", parent_id: null, name: "A", purpose: "root", own_scans: "0", subtree_scans: "9" },
    { id: "b", parent_id: null, name: "B", purpose: "root", own_scans: "0", subtree_scans: "100" },
  ];
  assert.equal(topBranch(rows)?.id, "b"); // non "9" > "100" come stringhe
});

test("dailyBuckets: N giorni riempiti di zeri, ordine crescente", () => {
  const now = new Date("2026-07-26T12:00:00Z");
  const s = dailyBuckets(["2026-07-26T09:00:00Z", "2026-07-26T10:00:00Z", "2026-07-24T10:00:00Z"], 3, now);
  assert.equal(s.length, 3);
  assert.deepEqual(s.map((x) => x.label), ["2026-07-24", "2026-07-25", "2026-07-26"]);
  assert.deepEqual(s.map((x) => x.hits), [1, 0, 2]);
});

test("pct: intero, 0 se totale 0", () => {
  assert.equal(pct(1, 4), 25);
  assert.equal(pct(0, 0), 0);
  assert.equal(pct(2, 3), 67);
});
