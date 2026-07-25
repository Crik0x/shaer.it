// T-006 · Analytics — forma e formattazione della timeline scansioni.
// Logica PURA (nessun I/O, nessuna UI): la RPC qr_scans_timeline ritorna già
// l'aggregato (bucket, hits); qui lo si normalizza per il grafico.
// Timezone: i bucket sono in UTC (scelta T-006); il label li mostra in UTC.

export type Bucket = "day" | "hour";

// Riga grezza come torna dalla RPC (hits è bigint → può arrivare come stringa).
export interface TimelineRow {
  bucket: string;
  hits: number | string;
}

export interface TimelinePoint {
  bucket: string; // ISO originale, per ordinamento/chiave
  label: string; // etichetta leggibile per l'asse X
  hits: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

// Etichetta UTC: 'day' → "gg/mm", 'hour' → "gg/mm HH:00".
export function formatBucketLabel(iso: string, bucket: Bucket): string {
  const d = new Date(iso);
  const day = `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`;
  return bucket === "hour" ? `${day} ${pad(d.getUTCHours())}:00` : day;
}

// Normalizza le righe RPC in punti ordinati per tempo crescente, hits numerico.
export function buildSeries(rows: TimelineRow[], bucket: Bucket): TimelinePoint[] {
  return rows
    .map((r) => ({
      bucket: r.bucket,
      label: formatBucketLabel(r.bucket, bucket),
      hits: Number(r.hits),
    }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket));
}
