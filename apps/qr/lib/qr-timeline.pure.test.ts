import { test } from "node:test";
import assert from "node:assert/strict";

import { buildSeries, formatBucketLabel } from "./qr-timeline.ts";

// Unit test PURO (nessun DB, gira sempre): prova la normalizzazione della
// timeline indipendentemente da Supabase.
test("formatBucketLabel: UTC, 'day' e 'hour'", () => {
  assert.equal(formatBucketLabel("2026-07-25T00:00:00Z", "day"), "25/07");
  assert.equal(formatBucketLabel("2026-07-25T09:00:00Z", "hour"), "25/07 09:00");
  // il fuso locale non deve spostare il bucket: resta UTC
  assert.equal(formatBucketLabel("2026-07-25T23:00:00Z", "hour"), "25/07 23:00");
});

test("buildSeries: ordina per tempo, hits→number", () => {
  const rows = [
    { bucket: "2026-07-25T00:00:00Z", hits: "5" },
    { bucket: "2026-07-23T00:00:00Z", hits: 2 },
    { bucket: "2026-07-24T00:00:00Z", hits: "0" },
  ];
  const s = buildSeries(rows, "day");
  assert.deepEqual(
    s.map((p) => p.label),
    ["23/07", "24/07", "25/07"],
  );
  assert.deepEqual(
    s.map((p) => p.hits),
    [2, 0, 5],
  );
  assert.equal(typeof s[0].hits, "number");
});
