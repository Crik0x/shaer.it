import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

import { generateShortCode } from "./short-code.ts";

// Test d'integrazione (Supabase reale). Lancialo con l'env:
//   node --test --env-file=.env.local lib/qr-create.test.ts
// Prova il cuore di T-005 lato dati: generazione short_code + insert owner-scoped
// + isolamento RLS (un altro utente non vede né può creare per te).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

test("createQr (dati): insert owner-scoped, short_code unico, RLS isola", async (t) => {
  if (!url || !anon) {
    t.skip("env mancante: lancia con --env-file=.env.local");
    return;
  }

  const clientA = createClient(url, anon, { auth: { persistSession: false } });
  const clientB = createClient(url, anon, { auth: { persistSession: false } });

  const pwd = "test-Password-123";
  const { data: a, error: aErr } = await clientA.auth.signUp({
    email: `t005a.${Date.now()}@shaer.it`,
    password: pwd,
  });
  assert.equal(aErr, null, aErr?.message);
  const userA = a.user!;

  // 1. insert del proprietario: passa la RLS (auth.uid() = owner_id)
  const shortCode = generateShortCode();
  const { error: insErr } = await clientA.from("qr_codes").insert({
    owner_id: userA.id,
    target_url: "https://esempio.com/pagina",
    name: "Test T-005",
    short_code: shortCode,
  });
  assert.equal(insErr, null, insErr?.message);

  // 2. il proprietario lo rilegge
  const { data: mine } = await clientA
    .from("qr_codes")
    .select("short_code, target_url")
    .eq("short_code", shortCode)
    .maybeSingle();
  assert.equal(mine?.short_code, shortCode);

  // 3. insert con owner_id altrui → bloccato dalla RLS (with check)
  const { error: spoofErr } = await clientA.from("qr_codes").insert({
    owner_id: crypto.randomUUID(),
    target_url: "https://esempio.com/spoof",
    name: "spoof",
    short_code: generateShortCode(),
  });
  assert.notEqual(spoofErr, null, "insert con owner_id altrui deve fallire (RLS)");

  // 4. un altro utente NON vede il QR di A (isolamento owner-scoped)
  const { data: b } = await clientB.auth.signUp({
    email: `t005b.${Date.now()}@shaer.it`,
    password: pwd,
  });
  assert.ok(b.session, "utente B loggato");
  const { data: seen } = await clientB
    .from("qr_codes")
    .select("short_code")
    .eq("short_code", shortCode)
    .maybeSingle();
  assert.equal(seen, null, "B non deve vedere il QR di A");
});
