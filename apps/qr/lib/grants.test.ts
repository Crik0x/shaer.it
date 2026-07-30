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

// ---------------------------------------------------------------------------
// T-030 · superficie RBAC. Con l'anon key pubblica il confine è il DB (L-001): le
// tabelle di controllo si scrivono SOLO via RPC definer, mai con DML diretto. Questi
// test diventano verdi dopo l'apply della migrazione 20260730000001_rbac ([N] Nick):
// prima dell'apply falliscono (tabella/funzione assenti) — è il rosso onesto atteso.
async function authClient() {
  const client = createClient(url!, anon!, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signUp({
    email: `t030.${Date.now()}.${Math.random().toString(36).slice(2)}@shaer.it`,
    password: "test-Password-123",
  });
  assert.equal(error, null, error?.message);
  assert.ok(data.session, "utente autenticato (Confirm email OFF in dev)");
  return { client, uid: data.user!.id };
}

test("RBAC: authenticated non può INSERT diretto nelle tabelle di controllo (solo definer)", async (t) => {
  if (!url || !anon) {
    t.skip("env mancante: lancia con --env-file=.env.local");
    return;
  }
  const { client, uid } = await authClient();

  // Ogni tentativo di scrittura diretta deve essere respinto dal DB (grant revocato →
  // 42501 permission denied, oppure RLS 42501). NON 42P01: quello sarebbe "tabella assente".
  const tentativi: Array<[string, Record<string, unknown>]> = [
    ["user_roles", { user_id: uid, role: "seller" }],
    ["permissions", { grantee_id: uid, scope: "x", capability: "read", granted_by: uid }],
    ["pending_actions", { actor_id: uid, scope: "x", action_type: "y" }],
    ["pending_approvals", { action_id: uid, approver_id: uid }],
    ["admins", { user_id: uid, role: "superadmin" }],
  ];
  for (const [table, row] of tentativi) {
    const { error } = await client.from(table).insert(row);
    assert.ok(error, `${table}: l'INSERT diretto doveva fallire, invece è passato`);
    assert.equal(
      error!.code,
      "42501",
      `${table}: atteso 42501 (permission denied), ottenuto ${error!.code}: ${error!.message}`,
    );
  }
});

test("RBAC: assign_permission rifiuta un chiamante non-ADMIN (admin-first, E-D-13/24)", async (t) => {
  if (!url || !anon) {
    t.skip("env mancante: lancia con --env-file=.env.local");
    return;
  }
  const { client, uid } = await authClient();

  const { error } = await client.rpc("assign_permission", {
    p_grantee: uid,
    p_scope: "incentivi:test",
    p_capability: "read",
    p_business_id: null,
  });
  assert.ok(error, "assign_permission da non-ADMIN doveva essere rifiutata");
  assert.match(error!.message, /ADMIN/, `atteso rifiuto admin-first, ottenuto: ${error!.message}`);
});

test("RBAC: assign_role attiva un ruolo via definer e impone il tetto ≤3 (AC-EE1.1)", async (t) => {
  if (!url || !anon) {
    t.skip("env mancante: lancia con --env-file=.env.local");
    return;
  }
  const { client } = await authClient();
  // Al signup l'utente ha già 'buyer' (trigger). seller + producer = 3 ruoli: ok.
  for (const role of ["seller", "producer"]) {
    const { error } = await client.rpc("assign_role", { p_role: role });
    assert.equal(error, null, `assign_role(${role}) doveva riuscire: ${error?.message}`);
  }
  // Il 4° ruolo (transporter) supera il tetto: rifiutato dal definer, non dallo unique.
  const { error: quarto } = await client.rpc("assign_role", { p_role: "transporter" });
  assert.ok(quarto, "il 4° ruolo doveva essere rifiutato (tetto ≤3)");
  assert.match(quarto!.message, /massimo 3 ruoli/, `atteso tetto ≤3, ottenuto: ${quarto!.message}`);

  // Prova del verify-gate: il ruolo business nasce NON verificato (verified_at NULL).
  const { data: roles, error: readErr } = await client
    .from("user_roles")
    .select("role, verified_at")
    .eq("role", "seller");
  assert.equal(readErr, null, readErr?.message);
  assert.equal(roles?.[0]?.verified_at, null, "un ruolo business nasce non-verificato (verify-gate)");
});

test("RBAC: is_admin() è esposto ad authenticated ma risponde false per un utente non-ADMIN", async (t) => {
  if (!url || !anon) {
    t.skip("env mancante: lancia con --env-file=.env.local");
    return;
  }
  const { client } = await authClient();
  // is_admin() è no-arg (sonda solo il chiamante): un utente fresco non è ADMIN.
  const { data, error } = await client.rpc("is_admin");
  assert.equal(error, null, error?.message);
  assert.equal(data, false, "un utente appena registrato non deve risultare ADMIN");
});

test("RBAC: grant_default_role assegna 'buyer' verificato al signup (trigger)", async (t) => {
  if (!url || !anon) {
    t.skip("env mancante: lancia con --env-file=.env.local");
    return;
  }
  const { client } = await authClient();
  // Il trigger grant_default_role deve aver creato il ruolo buyer già verificato (nessun documento).
  const { data, error } = await client.from("user_roles").select("role, verified_at").eq("role", "buyer");
  assert.equal(error, null, error?.message);
  assert.ok(data && data.length === 1, "grant_default_role deve creare 1 ruolo buyer al signup");
  assert.ok(data![0].verified_at, "buyer nasce verificato (nessun verify-gate sul consumatore)");
});

test("RBAC: verify_role rifiuta un non-ADMIN; approve_pending rifiuta un'azione inesistente", async (t) => {
  if (!url || !anon) {
    t.skip("env mancante: lancia con --env-file=.env.local");
    return;
  }
  const { client, uid } = await authClient();
  // verify_role è admin-first (E-D-24/29): un utente qualsiasi non può sbloccare il verify-gate.
  const { error: vErr } = await client.rpc("verify_role", { p_user: uid, p_role: "seller" });
  assert.ok(vErr, "verify_role da non-ADMIN doveva fallire");
  assert.match(vErr!.message, /ADMIN/, `atteso rifiuto admin-first, ottenuto: ${vErr!.message}`);
  // approve_pending: ramo provabile senza maker/checker reali — un'azione inesistente è respinta.
  const { error: aErr } = await client.rpc("approve_pending", { p_action_id: uid });
  assert.ok(aErr, "approve_pending su azione inesistente doveva fallire");
  assert.match(aErr!.message, /inesistente/, `atteso 'azione inesistente', ottenuto: ${aErr!.message}`);
});
