// core-rbac — motore puro dell'RBAC (SAD §3.1/§5, E-D-13/21/24).
// Nessun I/O, nessun DB: riceve attore/ruoli come argomenti, ritorna verdetti.
// È il gemello testabile delle RPC definer `assign_permission` / `approve_pending`:
// l'invariante è provato due volte — qui come funzione pura, là come rifiuto in-transazione.

export type Role = "buyer" | "seller" | "producer" | "transporter";

/** Le sole capability che un delegato può ricevere (E-D-24). MAI `own`/`admin`. */
export type Capability = "read" | "verify";
export const APPROVER_CAPABILITIES: readonly Capability[] = ["read", "verify"];

/** I ruoli-parte di una TXN: chi partecipa non può verificarla (E-D-21). */
export const PARTICIPANT_ROLES: readonly Role[] = ["buyer", "seller", "producer", "transporter"];

/**
 * Limite dell'approvatore (E-D-24, AC-EE1.7): una delega non può MAI conferire
 * proprietà o admin. Nessuna RPC promuove un delegato a owner: il cambio admin è
 * intervento manuale di Shaer, fuori UI (SAD §6). Qui la capability è ammessa solo
 * se sta nella whitelist — 'own'/'admin'/qualunque altra stringa è rifiutata.
 */
export function approverLimit(capability: string): boolean {
  return (APPROVER_CAPABILITIES as readonly string[]).includes(capability);
}

/** L'attore che tenta un'assegnazione di permesso. */
export interface Actor {
  isAdmin: boolean;
}

/**
 * RBAC admin-first (E-D-13/24, AC-EE1.5): un permesso lo assegna **solo** un ADMIN,
 * e solo entro il limite dell'approvatore. Non-ADMIN → rifiutato; capability fuori
 * whitelist → rifiutata anche se il chiamante è ADMIN.
 */
export function canAssign(actor: Actor, capability: string): boolean {
  return actor.isAdmin === true && approverLimit(capability);
}

/** Un ruolo/capability esercitato da un soggetto su una specifica TXN. */
export interface RoleAssignment {
  subject: string;
  role: Role | "verify";
}

/**
 * Conflitto di ruolo sulla stessa TXN (E-D-21, AC-EE1.8). Un soggetto è in conflitto se,
 * sulla **stessa** transazione, cumula:
 *   • `verify` + un ruolo-parte  → auto-verifica (verifica la TXN a cui partecipa), oppure
 *   • `buyer` + `seller`         → auto-scambio (è entrambe le parti della compravendita).
 * Soggetti diversi, ciascuno con un solo ruolo, non sono in conflitto: il conflitto è
 * sempre in capo a **un** soggetto.
 */
export function roleConflictOnTxn(subject: string, assignments: RoleAssignment[]): boolean {
  const held = new Set(assignments.filter((a) => a.subject === subject).map((a) => a.role));
  if (held.has("verify")) {
    for (const r of PARTICIPANT_ROLES) if (held.has(r)) return true;
  }
  if (held.has("buyer") && held.has("seller")) return true;
  return false;
}

// AC-EE1.6 "maker-checker una sola volta" non è puro: l'idempotenza esige lo stato
// dell'azione (già applicata o no) e vive nella RPC definer `approve_pending`, col suo
// test sul DB reale (SAD §4/§8). Qui non si finge uno stato che i soli argomenti non hanno.
