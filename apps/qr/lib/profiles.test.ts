import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

// Test d'integrazione (Supabase reale). Lancialo con l'env:
//   node --test --env-file=.env.local lib/profiles.test.ts
// T-022 · prova il blocco A: il trigger on_auth_user_created crea il profilo al
// signup (timezone di default 'UTC') e la RLS lo isola per owner. Richiede la
// migrazione 20260727000001_profiles applicata (Confirm email OFF in dev).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

test("profiles: il signup crea il profilo (UTC) e la RLS lo isola per owner", async (t) => {
  if (!url || !anon) {
    t.skip("env mancante: lancia con --env-file=.env.local");
    return;
  }

  const a = createClient(url, anon, { auth: { persistSession: false } });
  const b = createClient(url, anon, { auth: { persistSession: false } });

  // Utente A: signup → il trigger deve avergli creato il profilo.
  const { data: signA, error: errA } = await a.auth.signUp({
    email: `t022a.${Date.now()}@shaer.it`,
    password: "test-Password-123",
  });
  assert.equal(errA, null, errA?.message);
  assert.ok(signA.session, "signup A dà sessione (Confirm email OFF in dev)");

  // 1. il profilo esiste ed è agganciato all'utente, timezone di default 'UTC'
  const { data: mine, error: mineErr } = await a
    .from("profiles")
    .select("owner_id, timezone");
  assert.equal(mineErr, null, mineErr?.message);
  assert.equal(mine?.length, 1, "il trigger deve aver creato esattamente 1 profilo");
  assert.equal(mine?.[0].owner_id, signA.user?.id, "il profilo è dell'utente A");
  assert.equal(mine?.[0].timezone, "UTC", "timezone di default 'UTC'");

  // Utente B: signup indipendente.
  const { data: signB, error: errB } = await b.auth.signUp({
    email: `t022b.${Date.now()}@shaer.it`,
    password: "test-Password-123",
  });
  assert.equal(errB, null, errB?.message);
  assert.ok(signB.session, "signup B dà sessione");

  // 2. RLS: B vede solo il proprio profilo, mai quello di A.
  const { data: bSees, error: bErr } = await b
    .from("profiles")
    .select("owner_id");
  assert.equal(bErr, null, bErr?.message);
  assert.equal(bSees?.length, 1, "B vede un solo profilo (il suo)");
  assert.equal(bSees?.[0].owner_id, signB.user?.id, "e non è quello di A");

  // 3. B non può scrivere il fuso di A (with check owner-scoped).
  const { error: hackErr } = await b
    .from("profiles")
    .update({ timezone: "Europe/Rome" })
    .eq("owner_id", signA.user!.id);
  // niente riga aggiornata (RLS filtra) → nessun errore ma zero effetto; ri-leggo A
  assert.equal(hackErr, null, "l'update non-scoped non esplode, semplicemente non tocca righe");
  const { data: aStill } = await a.from("profiles").select("timezone");
  assert.equal(aStill?.[0].timezone, "UTC", "il fuso di A resta intatto");
});

test("profiles: la preferenza di fuso si salva solo se ancora 'UTC' e tocca updated_at (blocco C)", async (t) => {
  if (!url || !anon) {
    t.skip("env mancante: lancia con --env-file=.env.local");
    return;
  }

  const c = createClient(url, anon, { auth: { persistSession: false } });
  const { data: sign, error } = await c.auth.signUp({
    email: `t022c.${Date.now()}@shaer.it`,
    password: "test-Password-123",
  });
  assert.equal(error, null, error?.message);
  assert.ok(sign.session, "signup dà sessione");

  const { data: before } = await c
    .from("profiles")
    .select("timezone, updated_at")
    .single();
  assert.equal(before?.timezone, "UTC", "parte dal default");

  // Replica l'operazione DB di saveTimezone: aggiorna solo se ancora 'UTC',
  // settando updated_at (il debito del blocco A).
  const { error: upErr } = await c
    .from("profiles")
    .update({ timezone: "Europe/Rome", updated_at: new Date().toISOString() })
    .eq("owner_id", sign.user!.id)
    .eq("timezone", "UTC");
  assert.equal(upErr, null, upErr?.message);

  const { data: after } = await c
    .from("profiles")
    .select("timezone, updated_at")
    .single();
  assert.equal(after?.timezone, "Europe/Rome", "il fuso è stato salvato");
  assert.ok(
    new Date(after!.updated_at).getTime() > new Date(before!.updated_at).getTime(),
    "updated_at è avanzato → debito del blocco A chiuso su questo percorso",
  );

  // La guardia 'solo se UTC': un secondo salvataggio NON sovrascrive una scelta già fatta.
  const { error: up2 } = await c
    .from("profiles")
    .update({ timezone: "Asia/Kolkata", updated_at: new Date().toISOString() })
    .eq("owner_id", sign.user!.id)
    .eq("timezone", "UTC");
  assert.equal(up2, null, up2?.message);
  const { data: final } = await c.from("profiles").select("timezone").single();
  assert.equal(final?.timezone, "Europe/Rome", "la guardia rispetta la scelta già fatta");
});
