import { test } from "node:test";
import assert from "node:assert/strict";
import {
  groupCount,
  topBranch,
  dailyBuckets,
  pct,
  uniqueCount,
  hourlyBuckets,
  hourDayMatrix,
  toCsv,
  insights,
  INSIGHT,
  type RollupRow,
  type Slice,
} from "./dashboard.ts";

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

test("hourlyBuckets: N ore riempite di zeri, ordine crescente, label oraria", () => {
  const now = new Date("2026-07-27T12:30:00Z");
  const s = hourlyBuckets(
    ["2026-07-27T12:05:00Z", "2026-07-27T12:50:00Z", "2026-07-27T10:00:00Z"],
    3,
    now,
  );
  assert.equal(s.length, 3);
  assert.deepEqual(s.map((x) => x.label), ["2026-07-27 10:00", "2026-07-27 11:00", "2026-07-27 12:00"]);
  assert.deepEqual(s.map((x) => x.hits), [1, 0, 2]);
});

test("pct: intero, 0 se totale 0", () => {
  assert.equal(pct(1, 4), 25);
  assert.equal(pct(0, 0), 0);
  assert.equal(pct(2, 3), 67);
});

test("uniqueCount: distinti non nulli; ignora null/undefined/vuoto", () => {
  assert.equal(uniqueCount(["a", "b", "a", null, undefined, "c"]), 3);
  assert.equal(uniqueCount([null, undefined]), 0);
  assert.equal(uniqueCount([]), 0);
});

test("hourDayMatrix: giorno lun-based (0=lun), ora UTC, max e total", () => {
  // 2026-07-27 è un lunedì. 08:00 e 09:00 lun, 08:00 mar, 08:00 dom (2026-08-02).
  const h = hourDayMatrix([
    "2026-07-27T08:30:00Z",
    "2026-07-27T08:45:00Z",
    "2026-07-27T09:00:00Z",
    "2026-07-28T08:00:00Z",
    "2026-08-02T08:00:00Z",
  ]);
  assert.equal(h.matrix[0][8], 2, "lun 08 UTC = 2");
  assert.equal(h.matrix[0][9], 1, "lun 09 UTC = 1");
  assert.equal(h.matrix[1][8], 1, "mar 08 UTC = 1");
  assert.equal(h.matrix[6][8], 1, "dom 08 UTC = 1 (domenica → indice 6)");
  assert.equal(h.max, 2);
  assert.equal(h.total, 5);
  assert.equal(h.matrix.length, 7);
  assert.equal(h.matrix[0].length, 24);
});

test("hourDayMatrix: scarta le date invalide senza contarle", () => {
  const h = hourDayMatrix(["non-una-data", "2026-07-27T10:00:00Z"]);
  assert.equal(h.total, 1);
});

test("toCsv: header + righe, escaping RFC 4180 (virgole, virgolette, newline)", () => {
  const csv = toCsv(
    [
      { key: "name", label: "Nome" },
      { key: "note", label: "Nota" },
    ],
    [
      { name: "Alfa", note: "ok" },
      { name: 'Con "virgolette"', note: "a, b\nc" },
      { name: "Vuoto", note: null },
    ],
  );
  const lines = csv.split("\r\n");
  assert.equal(lines[0], "Nome,Nota");
  assert.equal(lines[1], "Alfa,ok");
  assert.equal(lines[2], '"Con ""virgolette""","a, b\nc"');
  assert.equal(lines[3], "Vuoto,");
});

test("toCsv: neutralizza le formule (CSV injection) con apostrofo guida", () => {
  const csv = toCsv(
    [{ key: "v", label: "V" }],
    [{ v: "=SUM(A1:A9)" }, { v: "+1" }, { v: "-2" }, { v: "@cmd" }, { v: "IT" }],
  );
  const lines = csv.split("\r\n");
  assert.equal(lines[1], "'=SUM(A1:A9)");
  assert.equal(lines[2], "'+1");
  assert.equal(lines[3], "'-2");
  assert.equal(lines[4], "'@cmd");
  assert.equal(lines[5], "IT", "un valore innocuo resta intatto");
});

const noSlices: Slice[] = [];

test("insights: stato vuoto → un solo consiglio informativo", () => {
  const r = insights({ total: 0, last7: 0, prev7: 0, devices: noSlices, countries: noSlices, uniques: 0, windowTotal: 0 });
  assert.equal(r.length, 1);
  assert.equal(r[0].tone, "info");
});

test("insights: crescita e calo oltre soglia, silenzio sotto", () => {
  const base = { total: 100, devices: noSlices, countries: noSlices, uniques: 5, windowTotal: 100 };
  const up = insights({ ...base, last7: 60, prev7: 40 }); // +50%
  assert.ok(up.some((i) => i.tone === "good" && /crescita del 50%/.test(i.text)));
  const down = insights({ ...base, last7: 40, prev7: 60 }); // -33%
  assert.ok(down.some((i) => i.tone === "warn" && /calo del 33%/.test(i.text)));
  const flat = insights({ ...base, last7: 42, prev7: 40 }); // +5% < soglia
  assert.ok(!flat.some((i) => /crescita|calo/.test(i.text)));
});

test("insights: mobile e geo scattano solo oltre la loro soglia", () => {
  const mobile: Slice[] = [{ label: "Mobile", hits: INSIGHT.mobileShare }, { label: "Desktop", hits: 100 - INSIGHT.mobileShare }];
  const geo: Slice[] = [{ label: "IT", hits: INSIGHT.geoShare }, { label: "FR", hits: 100 - INSIGHT.geoShare }];
  const r = insights({ total: 100, last7: 0, prev7: 0, devices: mobile, countries: geo, uniques: 3, windowTotal: 100 });
  assert.ok(r.some((i) => /mobile/i.test(i.text)));
  assert.ok(r.some((i) => /IT/.test(i.text)));
});

test("insights: geo (ignoto) non genera un consiglio geografico", () => {
  const geo: Slice[] = [{ label: "(ignoto)", hits: 90 }, { label: "IT", hits: 10 }];
  const r = insights({ total: 100, last7: 0, prev7: 0, devices: noSlices, countries: geo, uniques: 3, windowTotal: 100 });
  assert.ok(!r.some((i) => /concentrazione geografica/i.test(i.text)));
});

test("insights: zero unici con scansioni → suggerisce VISITOR_SALT", () => {
  const r = insights({ total: 50, last7: 0, prev7: 0, devices: noSlices, countries: noSlices, uniques: 0, windowTotal: 50 });
  assert.ok(r.some((i) => /VISITOR_SALT/.test(i.text)));
});
