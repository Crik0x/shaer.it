import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canAssign,
  approverLimit,
  roleConflictOnTxn,
  type RoleAssignment,
} from "./rbac.ts";

// ── canAssign / approverLimit (AC-EE1.5, AC-EE1.7) ───────────────────────────

test("canAssign: un non-ADMIN non può assegnare permessi (AC-EE1.5)", () => {
  assert.equal(canAssign({ isAdmin: false }, "verify"), false);
  assert.equal(canAssign({ isAdmin: false }, "read"), false);
});

test("canAssign: un ADMIN assegna solo capability entro il limite", () => {
  assert.equal(canAssign({ isAdmin: true }, "read"), true);
  assert.equal(canAssign({ isAdmin: true }, "verify"), true);
});

test("canAssign: nemmeno un ADMIN può delegare owner/admin (AC-EE1.7, E-D-24)", () => {
  assert.equal(canAssign({ isAdmin: true }, "own"), false);
  assert.equal(canAssign({ isAdmin: true }, "admin"), false);
  assert.equal(canAssign({ isAdmin: true }, "write"), false);
});

test("approverLimit: whitelist chiusa a {read, verify}", () => {
  assert.equal(approverLimit("read"), true);
  assert.equal(approverLimit("verify"), true);
  assert.equal(approverLimit("own"), false);
  assert.equal(approverLimit("admin"), false);
  assert.equal(approverLimit(""), false);
});

// ── roleConflictOnTxn (AC-EE1.8, E-D-21) ─────────────────────────────────────

test("roleConflictOnTxn: chi partecipa e verifica la stessa TXN è in conflitto (AC-EE1.8)", () => {
  const a: RoleAssignment[] = [
    { subject: "u1", role: "seller" },
    { subject: "u1", role: "verify" },
  ];
  assert.equal(roleConflictOnTxn("u1", a), true);
});

test("roleConflictOnTxn: buyer e seller nello stesso soggetto è auto-scambio", () => {
  const a: RoleAssignment[] = [
    { subject: "u1", role: "buyer" },
    { subject: "u1", role: "seller" },
  ];
  assert.equal(roleConflictOnTxn("u1", a), true);
});

test("roleConflictOnTxn: soggetti distinti, un ruolo ciascuno, nessun conflitto", () => {
  const a: RoleAssignment[] = [
    { subject: "buyerX", role: "buyer" },
    { subject: "sellerY", role: "seller" },
    { subject: "verifierZ", role: "verify" },
  ];
  assert.equal(roleConflictOnTxn("buyerX", a), false);
  assert.equal(roleConflictOnTxn("sellerY", a), false);
  assert.equal(roleConflictOnTxn("verifierZ", a), false);
});

test("roleConflictOnTxn: un solo ruolo-parte, senza verify, non è conflitto", () => {
  const a: RoleAssignment[] = [{ subject: "u1", role: "transporter" }];
  assert.equal(roleConflictOnTxn("u1", a), false);
});

test("roleConflictOnTxn: verify da solo (verificatore terzo) non è conflitto", () => {
  const a: RoleAssignment[] = [{ subject: "u1", role: "verify" }];
  assert.equal(roleConflictOnTxn("u1", a), false);
});

// ── property-based (senza librerie nuove — regola 10) ─────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

test("property: verify + un qualsiasi ruolo-parte sullo stesso soggetto è sempre colto", () => {
  const parts = ["buyer", "seller", "producer", "transporter"] as const;
  for (let i = 0; i < 2000; i++) {
    const part = pick(parts);
    const a: RoleAssignment[] = [
      { subject: "s", role: part },
      { subject: "s", role: "verify" },
      // rumore: altri soggetti con ruoli qualsiasi, non devono influire
      { subject: "other", role: pick(parts) },
    ];
    assert.equal(roleConflictOnTxn("s", a), true);
  }
});
