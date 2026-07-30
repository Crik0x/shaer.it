import { test } from "node:test";
import assert from "node:assert/strict";
import {
  anonymizeIp,
  firstForwardedIp,
  parseUserAgent,
  primaryLang,
  visitorHash,
  dayStampUtc,
} from "./scan.ts";

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

test("parseUserAgent: os (iOS/Android prima di macOS/Linux)", () => {
  assert.equal(parseUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)").os, "iOS");
  assert.equal(parseUserAgent("Mozilla/5.0 (Linux; Android 14; Pixel)").os, "Android");
  assert.equal(parseUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)").os, "Windows");
  assert.equal(parseUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)").os, "macOS");
  assert.equal(parseUserAgent("Mozilla/5.0 (X11; Linux x86_64)").os, "Linux");
  assert.equal(parseUserAgent("curl/8.0").os, "other");
});

test("primaryLang: prima preferenza, ignora q", () => {
  assert.equal(primaryLang("it-IT,it;q=0.9,en;q=0.8"), "it-IT");
  assert.equal(primaryLang("en"), "en");
  assert.equal(primaryLang(null), null);
  assert.equal(primaryLang(""), null);
});

test("visitorHash: deterministico, ruota col giorno, null senza IP", () => {
  const a = visitorHash("203.0.113.0", "UA-x", "2026-07-26", "salt");
  const b = visitorHash("203.0.113.0", "UA-x", "2026-07-26", "salt");
  const c = visitorHash("203.0.113.0", "UA-x", "2026-07-27", "salt"); // altro giorno
  assert.equal(a, b, "stesso input → stesso hash");
  assert.notEqual(a, c, "giorno diverso → hash diverso (non tracciabile a lungo)");
  assert.equal(a!.length, 32);
  assert.equal(visitorHash(null, "UA-x", "2026-07-26", "salt"), null, "senza IP anon → null");
});

test("dayStampUtc: YYYY-MM-DD in UTC", () => {
  assert.equal(dayStampUtc(new Date("2026-07-26T23:59:00Z")), "2026-07-26");
});
