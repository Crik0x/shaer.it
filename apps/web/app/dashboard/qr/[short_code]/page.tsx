import Link from "next/link";
import { notFound } from "next/navigation";

import { serverSupabase } from "@/lib/supabase-server";
import { redirectUrl } from "@/lib/qr";
import {
  groupCount,
  dailyBuckets,
  hourlyBuckets,
  pct,
  uniqueCount,
  hourDayMatrix,
  insights,
  type RollupRow,
} from "@/lib/dashboard";
import { QrPanel } from "./qr-panel";

// Analisi del singolo QR: stesso motore della dashboard aggregata (T-014), ma con
// le scansioni filtrate su questo qr_id. È COMPOSIZIONE delle funzioni pure già
// testate, non logica nuova (T-019). Owner-scoped via RLS (auth.uid() = owner_id):
// un short_code altrui è 404, non un leak. Le statistiche si DERIVANO da qr_scans
// (append-only), mai da un saldo memorizzato (regola d'oro 9). Server Component.
export const dynamic = "force-dynamic";

// Stessi periodi della dashboard aggregata (T-015), scelti via ?d=. Cambiare
// periodo è una normale navigazione: zero JS al client.
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

export default async function QrDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ short_code: string }>;
  searchParams: Promise<{ d?: string }>;
}) {
  const { short_code } = await params;
  const supabase = await serverSupabase();
  const nowMs = Date.now();

  // Owner-scoped via RLS: un utente vede solo i propri QR. Un short_code altrui
  // qui è un 404, non un leak.
  const { data: qr } = await supabase
    .from("qr_codes")
    .select("id, name, target_url, short_code, created_at, purpose")
    .eq("short_code", short_code)
    .maybeSingle();

  if (!qr) notFound();

  const url = redirectUrl(qr.short_code);

  const { d: periodKey } = await searchParams;
  const period =
    PERIODS.find((p) => p.key === periodKey) ??
    PERIODS.find((p) => p.key === DEFAULT_PERIOD_KEY)!;
  const since = new Date(nowMs - period.days * 86400000).toISOString();
  // Trend 7g vs 7g precedenti: fisso, indipendente dal periodo scelto (con periodo
  // 7g la finestra non conterrebbe i 7 giorni prima). Due count query dedicate.
  const since7 = new Date(nowMs - 7 * 86400000).toISOString();
  const since14 = new Date(nowMs - 14 * 86400000).toISOString();

  const [
    { count: scanCount },
    { count: last7 },
    { count: prev7 },
    { data: scans },
    { data: rollupRaw },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("qr_scans")
      .select("*", { count: "exact", head: true })
      .eq("qr_id", qr.id),
    supabase
      .from("qr_scans")
      .select("*", { count: "exact", head: true })
      .eq("qr_id", qr.id)
      .gte("created_at", since7),
    supabase
      .from("qr_scans")
      .select("*", { count: "exact", head: true })
      .eq("qr_id", qr.id)
      .gte("created_at", since14)
      .lt("created_at", since7),
    supabase
      .from("qr_scans")
      .select("created_at, device, browser, os, lang, country, city, visitor_hash")
      .eq("qr_id", qr.id)
      .gte("created_at", since),
    supabase.rpc("qr_tree_rollup"),
    supabase.from("profiles").select("timezone").maybeSingle(),
  ]);

  // Fuso del cliente (D-013/D-014): il dato è UTC, il display bucketizza qui.
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
  const cities = groupCount(rows.map((r) => r.city));
  const uniques = uniqueCount(rows.map((r) => r.visitor_hash));
  const heat = hourDayMatrix(rows.map((r) => r.created_at), tz);

  const tips = insights({
    total,
    last7: last7 ?? 0,
    prev7: prev7 ?? 0,
    devices,
    countries,
    uniques,
    windowTotal,
  });

  // Rollup del sottoalbero: questa riga dell'albero di QR (T-012). Se il nodo ha
  // discendenti, subtree_scans > own_scans e mostriamo lo scarto.
  const rollup = (rollupRaw ?? []) as RollupRow[];
  const node = rollup.find((r) => r.id === qr.id);
  const ownScans = node ? Number(node.own_scans) : total;
  const subtreeScans = node ? Number(node.subtree_scans) : total;
  const hasSubtree = subtreeScans > ownScans;

  const seriesMax = Math.max(1, ...series.map((s) => s.hits));

  const kpis = [
    { label: "Scansioni totali", value: total },
    { label: "Ultimi 7 giorni", value: last7 ?? 0 },
    { label: "Visitatori unici", value: uniques, sub: "stima giornaliera" },
    ...(hasSubtree
      ? [
          { label: "Sottoalbero", value: subtreeScans, sub: `${ownScans} proprie` },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Intestazione */}
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          ← Dashboard
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            {qr.name || "QR senza nome"}
          </h1>
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            {qr.purpose}
          </span>
        </div>
        <p className="mt-1 break-all text-sm text-muted-foreground">
          Indirizzo:{" "}
          <a href={url} className="underline underline-offset-4">
            {url}
          </a>
        </p>
        <p className="break-all text-sm text-muted-foreground">
          Destinazione attuale: {qr.target_url}
        </p>
      </div>

      <QrPanel content={url} filename={qr.short_code} />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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

      {/* Selettore periodo — governa timeline, breakdown, geo, heatmap, unici */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-sm text-muted-foreground">Periodo</span>
        {PERIODS.map((p) => {
          const active = p.key === period.key;
          return (
            <Link
              key={p.key}
              href={`/dashboard/qr/${qr.short_code}?d=${p.key}`}
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

      {/* Breakdown device + browser */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Breakdown title="Dispositivo" slices={devices} total={windowTotal} />
        <Breakdown title="Browser" slices={browsers} total={windowTotal} />
      </div>

      {/* Breakdown sistema operativo + lingua */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Breakdown title="Sistema operativo" slices={oses} total={windowTotal} />
        <Breakdown title="Lingua" slices={langs} total={windowTotal} />
      </div>

      {/* Geografia (dagli header edge di Vercel; in locale resta ignoto) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Breakdown title="Paese" slices={countries} total={windowTotal} />
        <Breakdown title="Città" slices={cities} total={windowTotal} />
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
