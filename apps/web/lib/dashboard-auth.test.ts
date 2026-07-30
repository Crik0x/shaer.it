import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

// Harness auth SSR-cookie → route protetta (T-024). Prova che una sessione reale,
// iniettata come cookie Supabase-SSR in una richiesta HTTP verso una route Next
// protetta, autentica il rendering server-side. Rompe il muro "auth non testabile"
// (4ª recidiva, PATTERN r.18).
//
// Il trucco che aggira il muro: NON si codifica il cookie a mano (dove sono morti
// i 3 tentativi passati) — si lascia che sia @supabase/ssr a scriverlo in un
// cookie-jar in memoria via setSession→setAll, quindi immune al drift di formato.
//
// Richiede il dev server acceso (BASE_URL, default http://localhost:3000):
//   (in apps/web)  npm run dev
//   node --test --env-file=.env.local lib/dashboard-auth.test.ts
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

function memoryJar() {
  const m = new Map<string, string>();
  return {
    getAll: () => [...m.entries()].map(([name, value]) => ({ name, value })),
    setAll: (list: { name: string; value: string }[]) =>
      list.forEach(({ name, value }) => m.set(name, value)),
    // Il browser rimanda i cookie come `name=value`; il parser di Next li
    // ridecodifica con decodeURIComponent, quindi qui si ri-codifica.
    header: () =>
      [...m.entries()]
        .map(([n, v]) => `${n}=${encodeURIComponent(v)}`)
        .join("; "),
  };
}

async function serverReachable() {
  try {
    await fetch(BASE + "/login", { redirect: "manual" });
    return true;
  } catch {
    return false;
  }
}

test("harness auth: cookie SSR reale → /dashboard autenticato; senza cookie → /login", async (t) => {
  if (!url || !anon) {
    t.skip("env mancante: lancia con --env-file=.env.local");
    return;
  }
  if (!(await serverReachable())) {
    t.skip(`dev server assente su ${BASE}: lancia 'npm run dev' in apps/web`);
    return;
  }

  // 1. sessione reale via signup (Confirm email OFF in dev → sessione immediata)
  const client = createClient(url, anon, { auth: { persistSession: false } });
  const email = `t024.${Date.now()}@shaer.it`;
  const password = "test-Password-123";
  const { data: signUp, error: suErr } = await client.auth.signUp({
    email,
    password,
  });
  assert.equal(suErr, null, suErr?.message);
  const session = signUp.session;
  assert.ok(session, "signup deve dare una sessione (Confirm email OFF in dev)");

  // 2. @supabase/ssr codifica i cookie in un jar in memoria (encoding = libreria)
  const jar = memoryJar();
  const server = createServerClient(url, anon, { cookies: jar });
  await server.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  const cookie = jar.header();
  assert.match(
    cookie,
    /sb-[^=]*-auth-token/,
    "il jar deve contenere il cookie auth Supabase-SSR",
  );

  // 3a. CON cookie → 200 + HTML del dashboard autenticato. L'email della sessione
  //     nell'HTML è la prova identificativa (regola 6): non un 200 generico, ma
  //     il rendering owner-scoped di QUESTA sessione.
  const authed = await fetch(BASE + "/dashboard", {
    headers: { cookie },
    redirect: "manual",
  });
  assert.equal(authed.status, 200, `atteso 200 con cookie, ricevuto ${authed.status}`);
  const html = await authed.text();
  assert.ok(
    html.includes(email),
    "l'HTML deve mostrare l'email della sessione (rendering owner-scoped)",
  );
  assert.ok(html.includes("Esci"), "l'header autenticato deve avere il bottone 'Esci'");

  // 3b. SENZA cookie → redirect a /login (check ottimistico del proxy)
  const anonResp = await fetch(BASE + "/dashboard", { redirect: "manual" });
  assert.ok(
    [302, 303, 307, 308].includes(anonResp.status),
    `senza cookie atteso un redirect, ricevuto ${anonResp.status}`,
  );
  assert.match(
    anonResp.headers.get("location") ?? "",
    /\/login/,
    "il redirect deve puntare a /login",
  );
});
