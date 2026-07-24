import { test } from "node:test";
import assert from "node:assert/strict";
import { generateShortCode } from "./short-code.ts";

test("generateShortCode: lunghezza di default 8", () => {
  assert.equal(generateShortCode().length, 8);
});

test("generateShortCode: lunghezza custom rispettata", () => {
  for (const n of [1, 4, 12, 32]) {
    assert.equal(generateShortCode(n).length, n);
  }
});

test("generateShortCode: solo caratteri base62", () => {
  const re = /^[0-9a-zA-Z]+$/;
  for (let i = 0; i < 200; i++) {
    assert.match(generateShortCode(10), re);
  }
});

test("generateShortCode: length <= 0 è un errore", () => {
  assert.throws(() => generateShortCode(0));
  assert.throws(() => generateShortCode(-1));
});

test("generateShortCode: nessuna collisione su 5000 codici da 8", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 5000; i++) seen.add(generateShortCode(8));
  assert.equal(seen.size, 5000);
});
