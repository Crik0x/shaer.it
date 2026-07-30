import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

import { generateShortCode } from "./short-code.ts";

// Test d'integrazione (Supabase reale). Lancialo con l'env:
//   node --test --env-file=.env.local lib/qr-timeline.test.ts
// Prova il cuore di T-006 lato dati: la RPC qr_scans_timeline aggrega le
// scansioni per bucket, è owner-scoped (un altro utente vede vuoto) e valida il
// parametro di granularità.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

test("qr_scans_timeline: aggrega per bucket, owner-scoped, valida p_bucket", async (t) => {
  if (!url || !anon) {
    t.skip("env mancante: lancia con --env-file=.env.local");
    return;
  }

  const clientA = createClient(url, anon, { auth: { persistSession: false } });
  const clientB = createClient(url, anon, { auth: { persistSession: false } });
  const anonClient = createClient(url, anon, { auth: { persistSession: false } });

  const pwd = "test-Password-123";
  const { data: a, error: aErr } = await clientA.auth.signUp({
    email: `t006a.${Date.now()}@shaer.it`,
    password: pwd,
  });
  assert.equal(aErr, null, aErr?.message);
  const userA = a.user!;

  // QR del proprietario
  const shortCode = generateShortCode();
  const { error: insErr } = await clientA.from("qr_codes").insert({
    owner_id: userA.id,
    target_url: "https://esempio.com/t006",
    name: "Test T-006",
    short_code: shortCode,
  });
  assert.equal(insErr, null, insErr?.message);

  // 3 scansioni via resolve_qr (l'unico che può scrivere qr_scans: definer).
  // Tutte "ora" → cadono nello stesso bucket giornaliero.
  const N = 3;
  for (let i = 0; i < N; i++) {
    const { error } = await anonClient.rpc("resolve_qr", { p_short_code: shortCode });
    assert.equal(error, null, error?.message);
  }

  // 1. il proprietario vede un bucket 'day' con hits = N
  const { data: dayRows, error: dayErr } = await clientA.rpc("qr_scans_timeline", {
    p_short_code: shortCode,
    p_bucket: "day",
  });
  assert.equal(dayErr, null, dayErr?.message);
  assert.equal(dayRows.length, 1, "una sola giornata con scansioni");
  assert.equal(Number(dayRows[0].hits), N, "hits = numero di scansioni");

  // 2. anche 'hour' aggrega (stessa ora → un bucket)
  const { data: hourRows, error: hourErr } = await clientA.rpc("qr_scans_timeline", {
    p_short_code: shortCode,
    p_bucket: "hour",
  });
  assert.equal(hourErr, null, hourErr?.message);
  assert.equal(hourRows.length, 1, "una sola ora con scansioni");
  assert.equal(Number(hourRows[0].hits), N);

  // 3. un altro utente NON vede la timeline del QR di A (definer + owner filter)
  const { data: b } = await clientB.auth.signUp({
    email: `t006b.${Date.now()}@shaer.it`,
    password: pwd,
  });
  assert.ok(b.session, "utente B loggato");
  const { data: bRows, error: bErr } = await clientB.rpc("qr_scans_timeline", {
    p_short_code: shortCode,
    p_bucket: "day",
  });
  assert.equal(bErr, null, bErr?.message);
  assert.equal(bRows.length, 0, "B non deve vedere la timeline di A");

  // 4. p_bucket non ammesso → errore (non spazzatura)
  const { error: badErr } = await clientA.rpc("qr_scans_timeline", {
    p_short_code: shortCode,
    p_bucket: "week",
  });
  assert.notEqual(badErr, null, "p_bucket='week' deve fallire");
});
