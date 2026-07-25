import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

// Test d'integrazione (Supabase reale). Lancialo con l'env:
//   node --test --env-file=.env.local lib/grants.test.ts
// T-007 · meccanizza L-001: con l'anon key pubblica il confine di sicurezza è il
// DB. Fallisce se una funzione INVOCABILE diventa EXECUTE-abile da `anon`, o una
// tabella di `public` perde la RLS, fuori dalla whitelist prevista. Richiede la
// migrazione 20260725000002_security_anon_surface applicata.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// L'unica superficie anon ammessa: il redirect pubblico (resolve_qr) e la sua
// garanzia di privacy lato DB (anonymize_ip). Tutto il resto è privato
// (authenticated) o non esposto. Match per NOME funzione: la firma di
// pg_get_function_identity_arguments include i nomi degli argomenti e varia con
// la versione di Postgres — il nome no.
const ANON_FUNCTION_WHITELIST = new Set(["resolve_qr", "anonymize_ip"]);
const funcName = (sig: string) => sig.split("(")[0];

test("superficie anon = whitelist: niente esposto fuori da resolve_qr/anonymize_ip", async (t) => {
  if (!url || !anon) {
    t.skip("env mancante: lancia con --env-file=.env.local");
    return;
  }

  const client = createClient(url, anon, { auth: { persistSession: false } });

  // security_anon_surface è granted ad `authenticated`: serve un login.
  const { data: signUp, error: authErr } = await client.auth.signUp({
    email: `t007.${Date.now()}@shaer.it`,
    password: "test-Password-123",
  });
  assert.equal(authErr, null, authErr?.message);
  assert.ok(signUp.session, "utente autenticato (Confirm email OFF in dev)");

  const { data: rows, error } = await client.rpc("security_anon_surface");
  assert.equal(error, null, error?.message);
  assert.ok(Array.isArray(rows), "la RPC ritorna righe");

  const funcs = rows
    .filter((r: { kind: string }) => r.kind === "function_anon_execute")
    .map((r: { obj: string }) => r.obj);
  const tablesNoRls = rows
    .filter((r: { kind: string }) => r.kind === "table_without_rls")
    .map((r: { obj: string }) => r.obj);

  // 1. nessuna tabella di `public` senza RLS (una nuova tabella non protetta
  //    sarebbe leggibile da anon: è il buco che questo test intercetta).
  assert.deepEqual(tablesNoRls, [], `tabelle senza RLS: ${tablesNoRls.join(", ")}`);

  // 2. ogni funzione anon-esposta è nella whitelist (una nuova funzione — es. un
  //    definer per sbaglio granted ad anon — bypasserebbe la RLS: L-001).
  const fuoriWhitelist = funcs.filter((f: string) => !ANON_FUNCTION_WHITELIST.has(funcName(f)));
  assert.deepEqual(fuoriWhitelist, [], `funzioni anon fuori whitelist: ${fuoriWhitelist.join(", ")}`);

  // 3. la whitelist non è morta: le due funzioni previste esistono davvero nella
  //    superficie anon. Protegge anche la regola d'oro 7 — se resolve_qr perde
  //    il grant ad anon, il redirect pubblico si rompe e il test lo grida.
  const nomiEsposti = new Set(funcs.map(funcName));
  for (const expected of ANON_FUNCTION_WHITELIST) {
    assert.ok(nomiEsposti.has(expected), `manca dalla superficie anon: ${expected}`);
  }
});
