"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  MessageCircle,
  QrCode,
  ShoppingBag,
  TrendingUp,
  UserPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { SimPoint } from "./simulator-chart";

// Componente pesante (grafico): entra con dynamic import, no SSR (regola 9).
const SimulatorChart = dynamic(() => import("./simulator-chart"), {
  ssr: false,
  loading: () => <div className="h-[150px] rounded-xl bg-muted/40" />,
});

type Accent = "orange" | "blue";
type Campaign = {
  key: string;
  label: string;
  hint: string;
  accent: Accent;
  icon: typeof ShoppingBag;
  weight: number;
};

const CAMPAIGNS: Campaign[] = [
  { key: "vendite", label: "Vendite", hint: "Campagna A", accent: "orange", icon: ShoppingBag, weight: 45 },
  { key: "registrazioni", label: "Registrazioni", hint: "Campagna B", accent: "blue", icon: UserPlus, weight: 35 },
  { key: "contatti", label: "Contatti WhatsApp", hint: "Campagna C", accent: "orange", icon: MessageCircle, weight: 20 },
];

const SEED: Record<string, number> = { vendite: 128, registrazioni: 74, contatti: 41 };

function seedPoints(total: number): SimPoint[] {
  // Rampa dolce che arriva al totale: la dashboard non nasce vuota.
  return Array.from({ length: 12 }, (_, i) => ({
    i,
    v: Math.round((total * (i + 3)) / 14 + Math.sin(i) * 4),
  }));
}

function pickCampaign(): Campaign {
  const roll = Math.random() * 100;
  let acc = 0;
  for (const c of CAMPAIGNS) {
    acc += c.weight;
    if (roll <= acc) return c;
  }
  return CAMPAIGNS[0];
}

// Conteggio animato: interpola il valore mostrato verso il target con
// easeOutCubic — nessuno scatto, ~0.7s.
function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const shown = useCountUp(value);
  return <span className={className}>{shown.toLocaleString("it-IT")}</span>;
}

const ACCENT: Record<Accent, { chip: string; ring: string }> = {
  orange: {
    chip: "bg-brand-orange-soft text-brand-orange",
    ring: "ring-brand-orange/40",
  },
  blue: {
    chip: "bg-brand-blue-soft text-brand-blue",
    ring: "ring-brand-blue/40",
  },
};

export function Simulator() {
  const [counts, setCounts] = useState<Record<string, number>>(SEED);
  const initialTotal = SEED.vendite + SEED.registrazioni + SEED.contatti;
  const [total, setTotal] = useState(initialTotal);
  const [points, setPoints] = useState<SimPoint[]>(() => seedPoints(initialTotal));
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scan = useCallback(() => {
    const c = pickCampaign();
    const hit = 1 + Math.floor(Math.random() * 3);
    setCounts((prev) => ({ ...prev, [c.key]: prev[c.key] + hit }));
    setTotal((prev) => {
      const next = prev + hit;
      setPoints((pts) => [...pts.slice(-19), { i: (pts.at(-1)?.i ?? 0) + 1, v: next }]);
      return next;
    });
    setActiveKey(c.key);
    setPulse((p) => p + 1);
    if (clearRef.current) clearTimeout(clearRef.current);
    clearRef.current = setTimeout(() => setActiveKey(null), 900);
  }, []);

  useEffect(() => () => {
    if (clearRef.current) clearTimeout(clearRef.current);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* Alone pastello dietro la scheda */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_30%_0%,var(--brand-blue-soft),transparent_70%),radial-gradient(50%_50%_at_90%_20%,var(--brand-orange-soft),transparent_70%)] blur-xl"
      />

      <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
        {/* Intestazione */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-blue/60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-brand-blue" />
            </span>
            <span className="text-xs font-medium text-muted-foreground">Dashboard live</span>
          </div>
          <span className="text-xs text-muted-foreground">@il-tuo-tag</span>
        </div>

        {/* Totale + grafico */}
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground">Scansioni totali</p>
          <div className="flex items-end gap-2">
            <AnimatedNumber
              value={total}
              className="text-4xl font-semibold tracking-tight tabular-nums text-foreground"
            />
            <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-brand-orange-soft px-2 py-0.5 text-xs font-medium text-brand-orange">
              <TrendingUp className="size-3" /> live
            </span>
          </div>
          <div className="mt-2">
            <SimulatorChart points={points} />
          </div>
        </div>

        {/* Le tre campagne */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {CAMPAIGNS.map((c) => {
            const a = ACCENT[c.accent];
            const active = activeKey === c.key;
            return (
              <div
                key={c.key}
                className={cn(
                  "rounded-2xl border border-border/60 bg-background/60 p-3 transition-all duration-500 ease-out",
                  active && cn("scale-[1.03] ring-2", a.ring),
                )}
              >
                <span className={cn("inline-flex size-7 items-center justify-center rounded-xl", a.chip)}>
                  <c.icon className="size-3.5" />
                </span>
                <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
                  <AnimatedNumber value={counts[c.key]} />
                </p>
                <p className="truncate text-[0.7rem] font-medium text-foreground">{c.label}</p>
                <p className="text-[0.65rem] text-muted-foreground">{c.hint}</p>
              </div>
            );
          })}
        </div>

        {/* Il pulsante-QR: ogni click è una scansione simulata */}
        <button
          type="button"
          onClick={scan}
          className="group mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-orange px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:shadow-md active:scale-[0.98]"
        >
          <span key={pulse} className="flex size-5 items-center justify-center">
            <QrCode className="size-5 transition-transform duration-500 ease-out group-hover:rotate-6" />
          </span>
          Simula una scansione
        </button>
        <p className="mt-2 text-center text-[0.7rem] text-muted-foreground">
          Clicca: guarda i dati muoversi in tempo reale.
        </p>
      </div>
    </div>
  );
}
