import Link from "next/link";

import { serverSupabase } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import {
  groupCount,
  topBranch,
  dailyBuckets,
  hourlyBuckets,
  pct,
  uniqueCount,
  hourDayMatrix,
  insights,
  type RollupRow,
} from "@/lib/dashboard";

// Dashboard analitica reale, owner-scoped via RLS (auth.uid() = owner_id) e via la
// RPC definer qr_tree_rollup. Le statistiche si DERIVANO da qr_scans (append-only),
// mai da un saldo memorizzato (regola d'oro 9). Server Component: zero JS al client.
export const dynamic = "force-dynamic";

// Periodi dell'analisi, scelti via query param ?d=. Il periodo guida la finestra
// delle scansioni (timeline, breakdown, geo, heatmap, unici). La vista "orario"
// tiene 7 giorni ma a risoluzione oraria (168 barre). Server Component: cambiare
// periodo è una normale navigazione soft (RSC), zero JS al client (regola 9). I
// Link portano scroll={false}: il selettore è a metà pagina, altrimenti Next
// scrolla in cima a ogni cambio (link.md §scroll) — il "salto" segnalato (T-023).
const PERIODS = [
  { key: "7", label: "7 giorni", days: 7, hourly: false },
  { key: "30", label: "30 giorni", days: 30, hourly: false },
  { key: "60", label: "60 giorni", days: 60, hourly: false },
  { key: "120", label: "120 giorni", days: 120, hourly: false },
  { key: "360", label: "360 giorni", days: 360, hourly: false },
  { key: "7h", label: "Orario · 7g", days: 7, hourly: true },
] as const;
const DEFAULT_PERIOD_KEY = "30";

interface ScanRow {
  created_at: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  lang: string | null;
  country: string | null;
  city: string | null;
  visitor_hash: string | null;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const TONE_DOT: Record<string, string> = {
  good: "bg-[var(--flow)]",
  warn: "bg-[var(--gold)]",
  info: "bg-muted-foreground",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const supabase = await serverSupabase();
  const nowMs = Date.now();
  const { d: periodKey } = await searchParams;
  const period = PERIODS.find((p) => p.key === periodKey) ??
    PERIODS.find((p) => p.key === DEFAULT_PERIOD_KEY)!;
  const since = new Date(nowMs - period.days * 86400000).toISOString();
  // Trend 7g vs 7g precedenti: fisso, indipendente dal periodo scelto (con periodo
  // 7g la finestra non conterrebbe i 7 giorni prima). Due count query dedicate.
  const since7 = new Date(nowMs - 7 * 86400000).toISOString();
  const since14 = new Date(nowMs - 14 * 86400000).toISOString();

  const [
    { count: qrCount },
    { count: scanCount },
    { count: last7 },
    { count: prev7 },
    { data: scans },
    { data: rollupRaw },
    { data: qrs },
    { data: profile },
  ] = await Promise.all([
    supabase.from("qr_codes").select("*", { count: "exact", head: true }),
    supabase.from("qr_scans").select("*", { count: "exact", head: true }),
    supabase.from("qr_scans").select("*", { count: "exact", head: true }).gte("created_at", since7),
    supabase
      .from("qr_scans")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since14)
      .lt("created_at", since7),
    supabase
      .from("qr_scans")
      .select("created_at, device, browser, os, lang, country, city, visitor_hash")
      .gte("created_at", since),
    supabase.rpc("qr_tree_rollup"),
    supabase
      .from("qr_codes")
      .select("name, target_url, short_code, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("profiles").select("timezone").maybeSingle(),
  ]);

  // Fuso del cliente (D-013/D-014): il dato è UTC, il display bucketizza qui. Le
  // funzioni pure hanno safeTimeZone → un valore corrotto non rompe il render.
  const tz = profile?.timezone ?? "UTC";

  const total = scanCount ?? 0;
  const rows = (scans ?? []) as ScanRow[];
  const windowTotal = rows.length;
  const series = period.hourly
    ? hourlyBuckets(rows.map((r) => r.created_at), period.days * 24, new Date(nowMs), tz)
    : dailyBuckets(rows.map((r) => r.created_at), period.days, new Date(nowMs), tz);
  const devices = groupCount(rows.map((r) => r.device));
  const browsers = groupCount(rows.map((r) => r.browser));
  const oses = groupCount(rows.map((r) => r.os));
  const langs = groupCount(rows.map((r) => r.lang));
  const countries = groupCount(rows.map((r) => r.country));
  const uniques = uniqueCount(rows.map((r) => r.visitor_hash));
  const heat = hourDayMatrix(rows.map((r) => r.created_at), tz);

  const scan7 = last7 ?? 0;
  const tips = insights({ total, last7: last7 ?? 0, prev7: prev7 ?? 0, devices, countries, uniques, windowTotal });

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
    { label: "Ultimi 7 giorni", value: scan7 },
    { label: "Visitatori unici", value: uniques, sub: "stima giornaliera" },
    { label: "Top ramo", value: top ? Number(top.subtree_scans) : 0, sub: top?.name },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            L&apos;analisi delle tue scansioni, derivata in tempo reale.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href="/dashboard/export.csv"
            className="inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
          >
            Esporta CSV
          </a>
          <Button render={<Link href="/dashboard/qr/new" />} size="lg">
            Crea QR
          </Button>
        </div>
      </div>

      {/* Consigli automatici */}
      {tips.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold text-card-foreground">Consigli</h2>
          <ul className="space-y-2">
            {tips.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TONE_DOT[t.tone]}`} />
                <span>{t.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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

      {/* Selettore periodo — governa timeline, breakdown, geo, heatmap, unici */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-sm text-muted-foreground">Periodo</span>
        {PERIODS.map((p) => {
          const active = p.key === period.key;
          return (
            <Link
              key={p.key}
              href={`/dashboard?d=${p.key}`}
              scroll={false}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                active
                  ? "border-transparent bg-foreground text-background"
                  : "border-border text-foreground hover:bg-muted"
              }`}
            >
              {p.label}
            </Link>
          );
        })}
      </div>

      {/* Timeline nel periodo scelto */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-base font-semibold text-card-foreground">
            Scansioni · {period.hourly ? "ultimi 7 giorni · orario" : `ultimi ${period.days} giorni`}
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

      {/* Breakdown — chi/cosa/dove in un'unica griglia densa (T-017): sei card
          in 3 colonne invece di tre righe a due, taglia lo scroll */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Breakdown title="Dispositivo" slices={devices} total={windowTotal} />
        <Breakdown title="Browser" slices={browsers} total={windowTotal} />
        <Breakdown title="Sistema operativo" slices={oses} total={windowTotal} />
        <Breakdown title="Lingua" slices={langs} total={windowTotal} />
        <Breakdown title="Paese" slices={countries} total={windowTotal} />
        <Breakdown title="Città" slices={groupCount(rows.map((r) => r.city))} total={windowTotal} />
      </div>

      {/* Heatmap giorno × ora (UTC) */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-base font-semibold text-card-foreground">
            Ritmo settimanale · giorno × ora
          </h2>
          <span className="text-xs text-muted-foreground">UTC</span>
        </div>
        {heat.total > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="flex gap-[3px] pl-9 text-[10px] text-muted-foreground">
                {Array.from({ length: 24 }, (_, h) => (
                  <span key={h} className="flex-1 text-center">
                    {h % 6 === 0 ? h : ""}
                  </span>
                ))}
              </div>
              <div className="mt-1 space-y-[3px]">
                {heat.matrix.map((hoursRow, d) => (
                  <div key={d} className="flex items-center gap-[3px]">
                    <span className="w-9 shrink-0 text-[10px] text-muted-foreground">{WEEKDAYS[d]}</span>
                    {hoursRow.map((n, h) => (
                      <div
                        key={h}
                        title={`${WEEKDAYS[d]} ${String(h).padStart(2, "0")}:00 — ${n} scansioni`}
                        className="aspect-square flex-1 rounded-[2px] bg-[var(--gold)]"
                        style={{ opacity: n === 0 ? 0.06 : 0.2 + 0.8 * (n / heat.max) }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Nessuna scansione nel periodo.</p>
        )}
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
