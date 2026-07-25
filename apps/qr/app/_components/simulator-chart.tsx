"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SimPoint = { i: number; v: number };

// Presentazione pura: riceve i punti già pronti. Colori solo da CSS variables
// del design system (brand-blue), animazione lenta a ogni cambio dato.
export default function SimulatorChart({ points }: { points: SimPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <AreaChart data={points} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id="sim-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-blue)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-brand-blue)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="i" hide />
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Tooltip
          cursor={{ stroke: "var(--color-border)" }}
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.75rem",
            color: "var(--color-foreground)",
            fontSize: "0.75rem",
            boxShadow: "none",
          }}
          labelFormatter={() => "Scansioni"}
          formatter={(v: number) => [v, "Totale"]}
        />
        <Area
          type="monotone"
          dataKey="v"
          stroke="var(--color-brand-blue)"
          strokeWidth={2.5}
          fill="url(#sim-fill)"
          isAnimationActive
          animationDuration={700}
          animationEasing="ease-out"
          dot={false}
          activeDot={{ r: 4, fill: "var(--color-brand-blue)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
