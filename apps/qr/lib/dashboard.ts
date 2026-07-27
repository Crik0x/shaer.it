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

/**
 * Serie ORARIA delle ultime `hours` ore (UTC), riempita di zeri. È la controparte
 * di dailyBuckets per la vista ad alta risoluzione (es. "ultimi 7 giorni · orario"
 * = 168 ore). Label "YYYY-MM-DD HH:00".
 */
export function hourlyBuckets(
  isoDates: string[],
  hours: number,
  now: Date = new Date(),
): Slice[] {
  const counts = new Map<string, number>();
  for (const iso of isoDates) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;
    counts.set(d.toISOString().slice(0, 13), (counts.get(d.toISOString().slice(0, 13)) ?? 0) + 1);
  }
  const out: Slice[] = [];
  for (let i = hours - 1; i >= 0; i--) {
    const key = new Date(now.getTime() - i * 3600000).toISOString().slice(0, 13);
    out.push({ label: `${key.replace("T", " ")}:00`, hits: counts.get(key) ?? 0 });
  }
  return out;
}

/** Percentuale intera di una parte sul totale (0 se totale 0). */
export function pct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

/**
 * Visitatori unici stimati: numero di visitor_hash distinti e non nulli.
 * Il pseudonimo ruota ogni giorno (giorno nel sale), quindi su una finestra di più
 * giorni conta i (visitatore × giorno) distinti: è un limite VOLUTO della
 * pseudonimizzazione (D-2, non tracciabile a lungo termine), non un difetto.
 * Gli hash null (salt assente o IP mancante) non entrano nella stima.
 */
export function uniqueCount(hashes: (string | null | undefined)[]): number {
  const seen = new Set<string>();
  for (const h of hashes) if (h) seen.add(h);
  return seen.size;
}

export interface Heatmap {
  /** matrix[giorno][ora] — giorno 0=lun … 6=dom, ora 0…23 in UTC. */
  matrix: number[][];
  max: number;
  total: number;
}

/**
 * Heatmap giorno-della-settimana × ora (UTC), da timestamp ISO. Rivela il ritmo
 * settimanale delle scansioni (E6.6). Giorno 0 = lunedì (settimana all'italiana),
 * non domenica come `Date.getUTCDay()`.
 */
export function hourDayMatrix(isoDates: string[]): Heatmap {
  const matrix = Array.from({ length: 7 }, () => new Array(24).fill(0));
  let max = 0;
  let total = 0;
  for (const iso of isoDates) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;
    const day = (d.getUTCDay() + 6) % 7; // 0=dom→6, 1=lun→0 … settimana lun-based
    const hour = d.getUTCHours();
    const n = ++matrix[day][hour];
    if (n > max) max = n;
    total++;
  }
  return { matrix, max, total };
}

/**
 * Serializza un campo CSV. Due difese in ordine:
 *  1. Anti CSV/formula injection: una cella che inizia con = + - @ (o tab/CR) è
 *     interpretata come formula da Excel/Sheets. I valori country/city arrivano da
 *     header edge, spoofabili → si neutralizzano con un apostrofo guida (OWASP).
 *  2. Escaping RFC 4180: virgolette raddoppiate e quoting se c'è virgola/newline.
 */
function csvField(v: unknown): string {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Serializza righe in CSV RFC 4180 (CRLF, escaping di virgolette/virgole/newline).
 * `headers` fissa l'ordine e i nomi di colonna; ogni riga legge le stesse chiavi.
 */
export function toCsv(
  headers: { key: string; label: string }[],
  rows: Record<string, unknown>[],
): string {
  const head = headers.map((h) => csvField(h.label)).join(",");
  const body = rows.map((r) => headers.map((h) => csvField(r[h.key])).join(","));
  return [head, ...body].join("\r\n");
}

export type InsightTone = "good" | "warn" | "info";
export interface Insight {
  tone: InsightTone;
  text: string;
}

/** Soglie dei consigli: esplicite e in un solo posto, così il test le fissa. */
export const INSIGHT = {
  trendPct: 10, // variazione 7g su 7g precedenti oltre cui si segnala
  mobileShare: 70, // % device mobile oltre cui suggerire il responsive
  geoShare: 50, // % del paese di testa oltre cui segnalare la concentrazione
} as const;

/**
 * Consigli automatici deterministici (E6.10): una regola pura su soglie note, mai
 * un modello. Ordine di priorità: stato vuoto → trend → mobile → geo → unici.
 */
export function insights(input: {
  total: number;
  last7: number;
  prev7: number;
  devices: Slice[];
  countries: Slice[];
  uniques: number;
  windowTotal: number;
}): Insight[] {
  const out: Insight[] = [];
  if (input.total === 0) {
    out.push({ tone: "info", text: "Nessuna scansione ancora: condividi il tuo QR per iniziare a raccogliere dati." });
    return out;
  }

  if (input.prev7 > 0) {
    const delta = Math.round(((input.last7 - input.prev7) / input.prev7) * 100);
    if (delta >= INSIGHT.trendPct) {
      out.push({ tone: "good", text: `Scansioni in crescita del ${delta}% rispetto ai 7 giorni precedenti.` });
    } else if (delta <= -INSIGHT.trendPct) {
      out.push({ tone: "warn", text: `Scansioni in calo del ${Math.abs(delta)}% rispetto ai 7 giorni precedenti.` });
    }
  }

  const topDevice = input.devices[0];
  if (topDevice && /mobile/i.test(topDevice.label) && pct(topDevice.hits, input.windowTotal) >= INSIGHT.mobileShare) {
    out.push({
      tone: "info",
      text: `Pubblico prevalentemente mobile (${pct(topDevice.hits, input.windowTotal)}%): verifica che la destinazione sia responsive.`,
    });
  }

  const topCountry = input.countries[0];
  if (topCountry && topCountry.label !== "(ignoto)" && pct(topCountry.hits, input.windowTotal) >= INSIGHT.geoShare) {
    out.push({
      tone: "info",
      text: `Concentrazione geografica: ${pct(topCountry.hits, input.windowTotal)}% delle scansioni arriva da ${topCountry.label}.`,
    });
  }

  if (input.uniques === 0 && input.total > 0) {
    out.push({
      tone: "info",
      text: "Imposta VISITOR_SALT su Vercel per stimare i visitatori unici (ora non disponibile).",
    });
  }

  return out;
}
