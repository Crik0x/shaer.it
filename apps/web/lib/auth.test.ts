import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

// Test d'integrazione (colpisce Supabase reale). Lancialo con l'env caricato:
//   node --test --env-file=.env.local lib/auth.test.ts
// Prova insieme AUTH (signup+login email/password) e RLS (un utente nuovo non
// vede i dati altrui). È verde solo se Confirm email è OFF nel progetto dev:
// senza sessione al signup, il primo assert fallisce e lo dice.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

test("auth+RLS: signup dà sessione e isola i dati owner-scoped", async (t) => {
  if (!url || !anon) {
    t.skip("env mancante: lancia con --env-file=.env.local");
    return;
  }

  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const email = `t004.${Date.now()}@shaer.it`;
  const password = "test-Password-123";

  // 1. signup → sessione immediata (Confirm email OFF in dev)
  const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
  });
  assert.equal(signUpErr, null, signUpErr?.message);
  assert.ok(
    signUp.session,
    "signUp deve dare una sessione: Confirm email va messo OFF nel progetto dev",
  );

  // 2. l'utente nuovo NON vede QR/scansioni del seed (RLS owner-scoped)
  const { count: qrCount, error: qrErr } = await supabase
    .from("qr_codes")
    .select("*", { count: "exact", head: true });
  assert.equal(qrErr, null, qrErr?.message);
  assert.equal(qrCount, 0, "un utente nuovo non deve vedere QR altrui");

  const { count: scanCount, error: scanErr } = await supabase
    .from("qr_scans")
    .select("*", { count: "exact", head: true });
  assert.equal(scanErr, null, scanErr?.message);
  assert.equal(scanCount, 0, "un utente nuovo non deve vedere scansioni altrui");

  // 3. login email+password funziona
  await supabase.auth.signOut();
  const { data: signIn, error: signInErr } =
    await supabase.auth.signInWithPassword({ email, password });
  assert.equal(signInErr, null, signInErr?.message);
  assert.ok(signIn.session, "login email+password deve dare una sessione");
});
