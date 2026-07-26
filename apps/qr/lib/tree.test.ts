import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Nessun tipo DB generato in questo progetto (come grants.test.ts): client permissivo.
type Db = SupabaseClient<any, any, any>;

// Test d'integrazione (Supabase reale). Lancialo con l'env, DOPO aver applicato
// la migrazione 20260726000001_qr_tree_and_scan_enrichment:
//   node --test --env-file=.env.local lib/tree.test.ts
//
// Meccanizza i rilievi del revisore (2026-07-26) sulla migrazione albero:
//  1) il trigger anti-ciclo rifiuta insert/update che chiudono un ciclo
//  2) qr_tree_rollup somma correttamente sé + l'intero sottoalbero POSSEDUTO
//  3) l'isolamento owner regge: owner B non vede nodi/scan di owner A
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const code = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

async function newOwner(): Promise<{ client: Db; uid: string }> {
  const client: Db = createClient(url!, anon!, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signUp({
    email: `tree.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@shaer.it`,
    password: "test-Password-123",
  });
  assert.equal(error, null, error?.message);
  assert.ok(data.session, "sessione (Confirm email OFF in dev)");
  return { client, uid: data.user!.id };
}

// crea un nodo QR posseduto dall'owner loggato; ritorna {id, short_code}
async function addNode(
  client: Db,
  ownerId: string,
  parentId: string | null,
  purpose: string,
) {
  const short = code("t");
  const { data, error } = await client
    .from("qr_codes")
    .insert({ owner_id: ownerId, name: short, target_url: "https://shaer.it", short_code: short, parent_id: parentId, purpose })
    .select("id, short_code")
    .single();
  assert.equal(error, null, error?.message);
  return data as { id: string; short_code: string };
}

// genera N scansioni su un nodo chiamando il redirect pubblico (unico writer)
async function scan(client: Db, shortCode: string, n: number) {
  for (let i = 0; i < n; i++) {
    const { error } = await client.rpc("resolve_qr", { p_short_code: shortCode });
    assert.equal(error, null, error?.message);
  }
}

test("trigger anti-ciclo: un update che chiude un ciclo è rifiutato", async (t) => {
  if (!url || !anon) return t.skip("env mancante: lancia con --env-file=.env.local");
  const { client, uid } = await newOwner();
  const a = await addNode(client, uid, null, "root");
  const b = await addNode(client, uid, a.id, "campaign"); // B figlio di A

  // tentare A.parent = B chiude il ciclo A→B→A: il trigger deve sollevare
  const { error } = await client.from("qr_codes").update({ parent_id: b.id }).eq("id", a.id);
  assert.ok(error, "l'update che crea il ciclo deve fallire");
  assert.match(error!.message, /cicl/i, `atteso errore di ciclo, ricevuto: ${error!.message}`);
});

test("anti-ciclo concorrente: due UPDATE A↔B, esattamente uno è rifiutato", async (t) => {
  if (!url || !anon) return t.skip("env mancante: lancia con --env-file=.env.local");
  // Copre il rilievo di gravità 4 del revisore: la race TOCTOU chiusa dall'advisory
  // xact lock nel trigger. A e B partono come radici indipendenti; scambiarsi il
  // genitore chiuderebbe un ciclo a 2 nodi. Serializzati dal lock, uno solo passa.
  const { client, uid } = await newOwner();
  const a = await addNode(client, uid, null, "root");
  const b = await addNode(client, uid, null, "root");
  const [r1, r2] = await Promise.all([
    client.from("qr_codes").update({ parent_id: b.id }).eq("id", a.id),
    client.from("qr_codes").update({ parent_id: a.id }).eq("id", b.id),
  ]);
  const errors = [r1.error, r2.error].filter(Boolean);
  assert.equal(errors.length, 1, "esattamente uno dei due update deve fallire (l'altro chiude il ciclo)");
  assert.match(errors[0]!.message, /cicl/i, `atteso errore di ciclo: ${errors[0]!.message}`);
});

test("qr_tree_rollup: somma sé + sottoalbero, own_scans corretto", async (t) => {
  if (!url || !anon) return t.skip("env mancante: lancia con --env-file=.env.local");
  const { client, uid } = await newOwner();
  const a = await addNode(client, uid, null, "root");      // radice
  const b = await addNode(client, uid, a.id, "campaign");  // A→B
  const c = await addNode(client, uid, b.id, "promo");     // A→B→C

  await scan(client, a.short_code, 2);
  await scan(client, b.short_code, 3);
  await scan(client, c.short_code, 5);

  const { data, error } = await client.rpc("qr_tree_rollup", { p_root: a.id });
  assert.equal(error, null, error?.message);
  const by = new Map((data as { id: string; own_scans: number; subtree_scans: number }[]).map((r) => [r.id, r]));

  assert.equal(Number(by.get(a.id)!.own_scans), 2, "A own");
  assert.equal(Number(by.get(a.id)!.subtree_scans), 10, "A sottoalbero = 2+3+5");
  assert.equal(Number(by.get(b.id)!.subtree_scans), 8, "B sottoalbero = 3+5");
  assert.equal(Number(by.get(c.id)!.subtree_scans), 5, "C sottoalbero = 5 (foglia)");
});

test("isolamento owner: B non vede i nodi di A nel rollup", async (t) => {
  if (!url || !anon) return t.skip("env mancante: lancia con --env-file=.env.local");
  const A = await newOwner();
  const a = await addNode(A.client, A.uid, null, "root");
  await scan(A.client, a.short_code, 4);

  const B = await newOwner();
  const { data, error } = await B.client.rpc("qr_tree_rollup", {});
  assert.equal(error, null, error?.message);
  const ids = new Set((data as { id: string }[]).map((r) => r.id));
  assert.ok(!ids.has(a.id), "il nodo di A non deve comparire nel rollup di B");
});
