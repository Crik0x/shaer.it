import Link from "next/link";

import { serverSupabase } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import {
  groupCount,
  topBranch,
  dailyBuckets,
  pct,
  type RollupRow,
} from "@/lib/dashboard";

// Dashboard analitica reale, owner-scoped via RLS (auth.uid() = owner_id) e via la
// RPC definer qr_tree_rollup. Le statistiche si DERIVANO da qr_scans (append-only),
// mai da un saldo memorizzato (regola d'oro 9). Server Component: zero JS al client.
export const dynamic = "force-dynamic";

const DAYS = 30;

export default async function DashboardPage() {
  const supabase = await serverSupabase();
  const since = new Date(Date.now() - DAYS * 86400000).toISOString();
  const since7 = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    { count: qrCount },
    { count: scanCount },
    { count: scan7 },
    { data: scans },
    { data: rollupRaw },
    { data: qrs },
  ] = await Promise.all([
    supabase.from("qr_codes").select("*", { count: "exact", head: true }),
    supabase.from("qr_scans").select("*", { count: "exact", head: true }),
    supabase.from("qr_scans").select("*", { count: "exact", head: true }).gte("created_at", since7),
    supabase.from("qr_scans").select("created_at, device, browser").gte("created_at", since),
    supabase.rpc("qr_tree_rollup"),
    supabase
      .from("qr_codes")
      .select("name, target_url, short_code, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const total = scanCount ?? 0;
  const rows = (scans ?? []) as { created_at: string; device: string | null; browser: string | null }[];
  const series = dailyBuckets(rows.map((r) => r.created_at), DAYS);
  const devices = groupCount(rows.map((r) => r.device));
  const browsers = groupCount(rows.map((r) => r.browser));

  const rollup = (rollupRaw ?? []) as RollupRow[];
  const top = topBranch(rollup);
  const branches = [...rollup].sort((a, b) => Number(b.subtree_scans) - Number(a.subtree_scans));

  // profondità di ciascun nodo per l'indentazione ad albero della tabella rami
  const byId = new Map(rollup.map((r) => [r.id, r]));
  const depthOf = (r: RollupRow): number => {
    let d = 0;
    let cur: RollupRow | undefined = r;
    while (cur && cur.parent_id) {
      cur = byId.get(cur.parent_id);
      d++;
      if (d > 50) break;
    }
    return d;
  };

  const seriesMax = Math.max(1, ...series.map((s) => s.hits));

  const kpis = [
    { label: "Scansioni totali", value: total },
    { label: "QR attivi", value: qrCount ?? 0 },
    { label: "Ultimi 7 giorni", value: scan7 ?? 0 },
    { label: "Top ramo", value: top ? Number(top.subtree_scans) : 0, sub: top?.name },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            L&apos;analisi delle tue scansioni, derivata in tempo reale.
          </p>
        </div>
        <Button render={<Link href="/dashboard/qr/new" />} size="lg">
          Crea QR
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="mt-2 font-heading text-3xl font-semibold tracking-tight text-card-foreground">
              {k.value}
            </p>
            {k.sub ? (
              <p className="mt-1 truncate text-xs text-muted-foreground">{k.sub}</p>
            ) : null}
          </div>
        ))}
      </div>

      {/* Timeline ultimi 30 giorni */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-base font-semibold text-card-foreground">
            Scansioni · ultimi {DAYS} giorni
          </h2>
          <span className="text-xs text-muted-foreground">UTC</span>
        </div>
        <div className="mt-4 flex h-28 items-end gap-[2px]">
          {series.map((s) => (
            <div
              key={s.label}
              title={`${s.label}: ${s.hits}`}
              className="flex-1 rounded-t-sm bg-[var(--flow)]"
              style={{ height: `${Math.max(2, (s.hits / seriesMax) * 100)}%`, opacity: s.hits ? 1 : 0.25 }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{series[0]?.label}</span>
          <span>{series[series.length - 1]?.label}</span>
        </div>
      </div>

      {/* Breakdown device + browser */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Breakdown title="Dispositivo" slices={devices} total={rows.length} />
        <Breakdown title="Browser" slices={browsers} total={rows.length} />
      </div>

      {/* Rami e campagne (albero di QR, rollup reale) */}
      <div className="rounded-xl border border-border">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-heading text-base font-semibold text-card-foreground">
            Rami e campagne
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Scansioni proprie del nodo e dell&apos;intero sottoalbero (rollup).
          </p>
        </div>
        {branches.length > 0 ? (
          <div className="divide-y divide-border">
            {branches.map((r) => {
              const sub = Number(r.subtree_scans);
              return (
                <div key={r.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="min-w-0 flex-1" style={{ paddingLeft: `${depthOf(r) * 16}px` }}>
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.name || "Senza nome"}
                      <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                        {r.purpose}
                      </span>
                    </p>
                    <div className="mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-[var(--gold)]"
                        style={{ width: `${pct(sub, total)}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-foreground">{sub}</p>
                    <p className="text-xs text-muted-foreground">
                      {Number(r.own_scans)} proprie · {pct(sub, total)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            Nessun ramo ancora. <Link href="/dashboard/qr/new" className="underline">Crea un QR</Link>.
          </p>
        )}
      </div>

      {/* Elenco QR */}
      {qrs && qrs.length > 0 ? (
        <div>
          <h2 className="mb-3 font-heading text-base font-semibold text-card-foreground">
            I tuoi QR
          </h2>
          <div className="divide-y divide-border rounded-xl border border-border">
            {qrs.map((qr) => (
              <Link
                key={qr.short_code}
                href={`/dashboard/qr/${qr.short_code}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {qr.name || "QR senza nome"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{qr.target_url}</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  /r/{qr.short_code}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Non hai ancora nessun QR.{" "}
            <Link href="/dashboard/qr/new" className="font-medium text-foreground underline underline-offset-4">
              Creane uno
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

function Breakdown({
  title,
  slices,
  total,
}: {
  title: string;
  slices: { label: string; hits: number }[];
  total: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-base font-semibold text-card-foreground">{title}</h2>
      <div className="mt-4 space-y-2.5">
        {slices.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessun dato nel periodo.</p>
        ) : (
          slices.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="w-20 shrink-0 truncate text-sm text-foreground">{s.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-[var(--gold)]" style={{ width: `${pct(s.hits, total)}%` }} />
              </div>
              <span className="w-14 shrink-0 text-right text-xs text-muted-foreground">
                {s.hits} · {pct(s.hits, total)}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
