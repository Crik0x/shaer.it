"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import type { Bucket, TimelinePoint } from "@/lib/qr-timeline";

// Recharts è pesante e solo lato client: entra con dynamic import (ssr: false),
// così non pesa sul bundle server né sul primo render (regola d'oro 9).
const AnalyticsChart = dynamic(() => import("./analytics-chart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-xl border border-border">
      <span className="text-sm text-muted-foreground">Carico il grafico…</span>
    </div>
  ),
});

const BUCKETS: { value: Bucket; label: string }[] = [
  { value: "day", label: "Giorno" },
  { value: "hour", label: "Ora" },
];

export function AnalyticsPanel({
  day,
  hour,
}: {
  day: TimelinePoint[];
  hour: TimelinePoint[];
}) {
  const [bucket, setBucket] = useState<Bucket>("day");
  const points = bucket === "day" ? day : hour;
  const total = day.reduce((s, p) => s + p.hits, 0);

  return (
    <section className="space-y-4 rounded-xl border border-border p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
            Scansioni
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {total} in totale · orari in UTC
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border p-0.5 text-sm">
          {BUCKETS.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => setBucket(b.value)}
              className={
                bucket === b.value
                  ? "rounded-md bg-primary px-3 py-1 text-primary-foreground"
                  : "rounded-md px-3 py-1 text-muted-foreground hover:text-foreground"
              }
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <AnalyticsChart points={points} />
    </section>
  );
}
