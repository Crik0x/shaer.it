"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TimelinePoint } from "@/lib/qr-timeline";

// Presentazione pura: riceve i punti già aggregati e formattati (buildSeries).
// Colori solo da CSS variables del design system: niente valori inline.
export default function AnalyticsChart({ points }: { points: TimelinePoint[] }) {
  if (points.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border">
        <span className="text-sm text-muted-foreground">
          Nessuna scansione ancora.
        </span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={288}>
      <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="label"
          stroke="var(--color-muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          allowDecimals={false}
          stroke="var(--color-muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ stroke: "var(--color-border)" }}
          contentStyle={{
            background: "var(--color-muted)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
            color: "var(--color-foreground)",
            fontSize: "0.8125rem",
          }}
          labelStyle={{ color: "var(--color-muted-foreground)" }}
        />
        <Line
          type="monotone"
          dataKey="hits"
          name="Scansioni"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={{ r: 2, fill: "var(--color-primary)" }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
