import { test } from "node:test";
import assert from "node:assert/strict";
import { anonymizeIp, firstForwardedIp, parseUserAgent } from "./scan.ts";

test("firstForwardedIp: prende il primo, ignora i proxy", () => {
  assert.equal(firstForwardedIp("203.0.113.7, 10.0.0.1, 10.0.0.2"), "203.0.113.7");
  assert.equal(firstForwardedIp("  198.51.100.5  "), "198.51.100.5");
  assert.equal(firstForwardedIp(null), null);
  assert.equal(firstForwardedIp(""), null);
});

test("anonymizeIp: IPv4 azzera l'ultimo ottetto", () => {
  assert.equal(anonymizeIp("203.0.113.42"), "203.0.113.0");
  assert.equal(anonymizeIp("10.0.0.255"), "10.0.0.0");
});

test("anonymizeIp: IPv6 tiene 3 gruppi", () => {
  assert.equal(anonymizeIp("2001:db8:1234:5678::1"), "2001:db8:1234::");
  assert.equal(anonymizeIp("fe80::1"), "fe80::");
});

test("anonymizeIp: input non validi → null", () => {
  assert.equal(anonymizeIp(null), null);
  assert.equal(anonymizeIp(""), null);
  assert.equal(anonymizeIp("   "), null);
  assert.equal(anonymizeIp("non-un-ip"), null);
  assert.equal(anonymizeIp("1.2.3"), null);
  assert.equal(anonymizeIp("1.2.3.x"), null);
});

test("parseUserAgent: device", () => {
  assert.equal(parseUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)").device, "mobile");
  assert.equal(parseUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)").device, "desktop");
  assert.equal(parseUserAgent(null).device, "desktop");
});

test("parseUserAgent: browser (ordine di precedenza)", () => {
  assert.equal(parseUserAgent("... Chrome/120 ... Edg/120").browser, "Edge");
  assert.equal(parseUserAgent("... Chrome/120 Safari/537 OPR/106").browser, "Opera");
  assert.equal(parseUserAgent("... Chrome/120 Safari/537.36").browser, "Chrome");
  assert.equal(parseUserAgent("... Firefox/121").browser, "Firefox");
  assert.equal(parseUserAgent("... Version/17 Safari/605.1").browser, "Safari");
  assert.equal(parseUserAgent("curl/8.0").browser, "other");
});
