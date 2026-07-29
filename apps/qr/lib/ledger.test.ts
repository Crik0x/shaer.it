import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

// Test d'integrazione (Supabase reale). Lancialo con l'env:
//   node --test --env-file=.env.local lib/ledger.test.ts
// T-029a · meccanizza L-011: la RPC `ledger_post` scrive denaro, quindi l'AUTORITÀ
// vive nel DB (L-001). Questo test TENTA i due exploit che hanno fatto respingere la
// bozza (conio dal nulla) e li vuole RIFIUTATI, più le guardie di forma. Richiede la
// migrazione 20260729000001_ledger_core applicata (finché non lo è, il test è rosso: è
// il suo scopo — è la prova che aspetta l'applicazione [N] di Nick).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function authedClient() {
  const client = createClient(url!, anon!, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signUp({
    email: `t029a.${Date.now()}.${Math.random().toString(36).slice(2)}@shaer.it`,
    password: "test-Password-123",
  });
  assert.equal(error, null, error?.message);
  assert.ok(data.session, "utente autenticato (Confirm email OFF in dev)");
  return client;
}

async function systemAccountId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  code: string,
): Promise<string> {
  const { data, error } = await client
    .from("accounts")
    .select("id")
    .eq("system_code", code)
    .single();
  assert.equal(error, null, `lettura conto ${code}: ${error?.message}`);
  return (data as { id: string }).id;
}

test("ledger_post: conio da TREASURY via authenticated è RIFIUTATO (anti-scoperto)", async (t) => {
  if (!url || !anon) return t.skip("env mancante: --env-file=.env.local");
  const client = await authedClient();
  const treasury = await systemAccountId(client, "SHAER_TREASURY");
  const escrow = await systemAccountId(client, "SHAER_ESCROW");

  // L'EXPLOIT della bozza: kind='purchase' auto-dichiarato per fingere un incasso € e
  // coniare backed da TREASURY. Ora kind è un'etichetta senza potere e l'anti-scoperto
  // impedisce a TREASURY di andare negativa. Deve fallire.
  const { error } = await client.rpc("ledger_post", {
    p_kind: "purchase",
    p_transaction_id: null,
    p_postings: [
      { account_id: treasury, class: "purchased", amount: -100 },
      { account_id: escrow, class: "purchased", amount: 100 },
    ],
  });
  assert.notEqual(error, null, "conio da TREASURY deve essere rifiutato");
});

test("ledger_post: scoperto da conto non-TREASURY è RIFIUTATO", async (t) => {
  if (!url || !anon) return t.skip("env mancante");
  const client = await authedClient();
  const settlement = await systemAccountId(client, "SHAER_SETTLEMENT");
  const revenue = await systemAccountId(client, "SHAER_REVENUE");

  // Il 2° buco della bozza: il gate guardava solo TREASURY, ogni altro conto poteva
  // andare negativo (= coniare). Ora l'anti-scoperto è universale.
  const { error } = await client.rpc("ledger_post", {
    p_kind: "transfer",
    p_transaction_id: null,
    p_postings: [
      { account_id: settlement, class: "purchased", amount: -100 },
      { account_id: revenue, class: "purchased", amount: 100 },
    ],
  });
  assert.notEqual(error, null, "scoperto da SETTLEMENT deve essere rifiutato");
});

test("ledger tables: INSERT diretto da authenticated è RIFIUTATO (unico-writer)", async (t) => {
  if (!url || !anon) return t.skip("env mancante");
  const client = await authedClient();
  const treasury = await systemAccountId(client, "SHAER_TREASURY");

  // Nessun grant DML: si scrive solo attraverso il definer. Un INSERT diretto bypasserebbe
  // ogni invariante → deve fallire (grant assente + nessuna policy).
  const { error: jErr } = await client
    .from("ledger_journal")
    .insert({ kind: "transfer" });
  assert.notEqual(jErr, null, "INSERT diretto su ledger_journal deve fallire");

  const { error: pErr } = await client.from("ledger_postings").insert({
    journal_id: crypto.randomUUID(),
    account_id: treasury,
    class: "purchased",
    amount: 1,
  });
  assert.notEqual(pErr, null, "INSERT diretto su ledger_postings deve fallire");
});

test("ledger_post: guardie di forma (kind, bilancio, vuoto, float)", async (t) => {
  if (!url || !anon) return t.skip("env mancante");
  const client = await authedClient();
  const treasury = await systemAccountId(client, "SHAER_TREASURY");
  const escrow = await systemAccountId(client, "SHAER_ESCROW");

  // kind fuori enum (CHECK sulla colonna) — importi a zero per isolare il solo kind
  const badKind = await client.rpc("ledger_post", {
    p_kind: "hack",
    p_transaction_id: null,
    p_postings: [
      { account_id: treasury, class: "purchased", amount: 0 },
      { account_id: escrow, class: "purchased", amount: 0 },
    ],
  });
  assert.notEqual(badKind.error, null, "kind fuori enum deve fallire");

  // journal sbilanciato (somma per classe ≠ 0)
  const unbalanced = await client.rpc("ledger_post", {
    p_kind: "transfer",
    p_transaction_id: null,
    p_postings: [
      { account_id: treasury, class: "purchased", amount: -100 },
      { account_id: escrow, class: "purchased", amount: 50 },
    ],
  });
  assert.notEqual(unbalanced.error, null, "journal sbilanciato deve fallire");

  // postings vuoti
  const empty = await client.rpc("ledger_post", {
    p_kind: "transfer",
    p_transaction_id: null,
    p_postings: [],
  });
  assert.notEqual(empty.error, null, "postings vuoti devono fallire");

  // amount float (mai float sul denaro)
  const float = await client.rpc("ledger_post", {
    p_kind: "transfer",
    p_transaction_id: null,
    p_postings: [
      { account_id: treasury, class: "purchased", amount: 10.5 },
      { account_id: escrow, class: "purchased", amount: -10.5 },
    ],
  });
  assert.notEqual(float.error, null, "amount float deve fallire");
});

test("ledger_post: un trasferimento VALIDO di crediti esistenti è ACCETTATO", async (t) => {
  if (!url || !anon) return t.skip("env mancante");
  if (!serviceKey) return t.skip("SUPABASE_SERVICE_ROLE_KEY mancante: salto il ramo positivo");

  // service_role semina un saldo (simula il futuro conio backed, RPC separata E-D-28):
  // TREASURY conia 100 purchased → ESCROW. Poi un authenticated MUOVE crediti esistenti
  // (ESCROW → REVENUE) restando ≥ 0 su ogni conto toccato: deve essere accettato.
  const admin = createClient(url!, serviceKey, { auth: { persistSession: false } });
  const treasury = await systemAccountId(admin, "SHAER_TREASURY");
  const escrow = await systemAccountId(admin, "SHAER_ESCROW");
  const revenue = await systemAccountId(admin, "SHAER_REVENUE");

  const { data: j, error: jErr } = await admin
    .from("ledger_journal")
    .insert({ kind: "deposit" })
    .select("id")
    .single();
  assert.equal(jErr, null, jErr?.message);
  const journalId = (j as { id: string }).id;
  const { error: seedErr } = await admin.from("ledger_postings").insert([
    { journal_id: journalId, account_id: treasury, class: "purchased", amount: -100 },
    { journal_id: journalId, account_id: escrow, class: "purchased", amount: 100 },
  ]);
  assert.equal(seedErr, null, seedErr?.message);

  const client = await authedClient();
  const { data, error } = await client.rpc("ledger_post", {
    p_kind: "transfer",
    p_transaction_id: null,
    p_postings: [
      { account_id: escrow, class: "purchased", amount: -30 },
      { account_id: revenue, class: "purchased", amount: 30 },
    ],
  });
  assert.equal(error, null, `trasferimento valido rifiutato: ${error?.message}`);
  assert.ok(typeof data === "string", "ledger_post ritorna l'uuid del journal");
});
