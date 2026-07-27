import { test } from "node:test";
import assert from "node:assert/strict";

import { isValidTimeZone, safeTimeZone } from "./timezone.ts";

// T-022 · il guard che decide cosa entra in profiles.timezone (input non fidato
// dal browser) e cosa il render accetta. Pura, testabile senza runtime Next.

test("isValidTimeZone: nomi IANA validi sì, ignoti/vuoti no", () => {
  assert.equal(isValidTimeZone("Europe/Rome"), true);
  assert.equal(isValidTimeZone("UTC"), true);
  assert.equal(isValidTimeZone("Asia/Kolkata"), true); // offset a mezz'ora
  assert.equal(isValidTimeZone("Mars/Phobos"), false);
  assert.equal(isValidTimeZone("Not a zone"), false);
  assert.equal(isValidTimeZone(""), false);
});

test("safeTimeZone: fuso valido passa, invalido/vuoto → UTC", () => {
  assert.equal(safeTimeZone("Europe/Rome"), "Europe/Rome");
  assert.equal(safeTimeZone("Mars/Phobos"), "UTC");
  assert.equal(safeTimeZone(""), "UTC");
});
