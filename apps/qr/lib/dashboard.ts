// Logica pura della dashboard analitica: aggregazioni derivate dalle scansioni
// (append-only), zero I/O, zero UI. Testabile a costo zero (lib/dashboard.test.ts).
// La dashboard consuma queste funzioni; non duplica il calcolo nella pagina.

/** Riga di qr_tree_rollup (bigint può arrivare come stringa da PostgREST). */
export interface RollupRow {
  id: string;
  parent_id: string | null;
  name: string;
  purpose: string;
  own_scans: number | string;
  subtree_scans: number | string;
}

export interface Slice {
  label: string;
  hits: number;
}

/** Conteggio per valore, ordinato per frequenza decrescente. null → "(ignoto)". */
export function groupCount(values: (string | null | undefined)[]): Slice[] {
  const m = new Map<string, number>();
  for (const v of values) {
    const k = v && v.trim() ? v : "(ignoto)";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([label, hits]) => ({ label, hits }))
    .sort((a, b) => b.hits - a.hits || a.label.localeCompare(b.label));
}

/** Il ramo di primo livello (parent_id null) con più scansioni di sottoalbero. */
export function topBranch(rows: RollupRow[]): RollupRow | null {
  const roots = rows.filter((r) => r.parent_id === null);
  const pool = roots.length ? roots : rows;
  let best: RollupRow | null = null;
  for (const r of pool) {
    if (!best || Number(r.subtree_scans) > Number(best.subtree_scans)) best = r;
  }
  return best;
}

/**
 * Serie giornaliera degli ultimi `days` giorni (UTC), riempita di zeri: ogni
 * giorno esiste anche senza scansioni, così il grafico non ha buchi.
 */
export function dailyBuckets(
  isoDates: string[],
  days: number,
  now: Date = new Date(),
): Slice[] {
  const counts = new Map<string, number>();
  for (const iso of isoDates) {
    const day = new Date(iso).toISOString().slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  const out: Slice[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10);
    out.push({ label: d, hits: counts.get(d) ?? 0 });
  }
  return out;
}

/** Percentuale intera di una parte sul totale (0 se totale 0). */
export function pct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}
