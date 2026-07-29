"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Check,
  Lock,
  QrCode,
  TrendingUp,
  Users,
  Utensils,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { bonusPool, goalReached, operatorBonus, type Campaign } from "@/lib/bonus";
import type { SimPoint } from "./simulator-chart";

// Componente pesante (grafico): entra con dynamic import, no SSR (regola 9).
const SimulatorChart = dynamic(() => import("./simulator-chart"), {
  ssr: false,
  loading: () => <div className="h-[150px] rounded-xl bg-muted/40" />,
});

// Campagna interna della demo (§5.4 MDD): 30% del fatturato attribuito, rilascio
// dell'escrow gated dalla soglia di team. La matematica vive in @/lib/bonus.
const CAMPAIGN: Campaign = { rate: 0.3, goalRevenue: 1000 };

type Operator = {
  id: string;
  name: string;
  station: string;
  sales: number;
  revenue: number;
};

const SEED_OPS: Operator[] = [
  { id: "giulia", name: "Giulia", station: "Tavoli 1–3", sales: 8, revenue: 240 },
  { id: "sara", name: "Sara", station: "Tavoli 4–6", sales: 6, revenue: 190 },
  { id: "marta", name: "Marta", station: "Bar & dehors", sales: 5, revenue: 150 },
];

function seedPoints(total: number): SimPoint[] {
  // Rampa dolce che arriva al fatturato di partenza: la demo non nasce piatta.
  return Array.from({ length: 12 }, (_, i) => ({
    i,
    v: Math.round((total * (i + 3)) / 14 + Math.sin(i) * 6),
  }));
}

const euro = (n: number) =>
  n.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

// Conteggio animato: interpola verso il target con easeOutCubic, ~0.7s.
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

function AnimatedEuro({ value, className }: { value: number; className?: string }) {
  const shown = useCountUp(Math.round(value));
  return <span className={className}>{euro(shown)}</span>;
}

export function Simulator() {
  const [ops, setOps] = useState<Operator[]>(SEED_OPS);
  const initialRevenue = SEED_OPS.reduce((s, o) => s + o.revenue, 0);
  const [points, setPoints] = useState<SimPoint[]>(() => seedPoints(initialRevenue));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [pulse, setPulse] = useState(0);
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalRevenue = ops.reduce((s, o) => s + o.revenue, 0);
  const held = bonusPool(ops.map((o) => o.revenue), CAMPAIGN);
  const reached = goalReached(totalRevenue, CAMPAIGN);
  const progress = Math.min(100, Math.round((totalRevenue / CAMPAIGN.goalRevenue) * 100));

  const scan = useCallback(() => {
    const idx = Math.floor(Math.random() * SEED_OPS.length);
    const sale = 15 + Math.floor(Math.random() * 31); // scontrino 15–45 €
    setOps((prev) => {
      const next = prev.map((o, i) =>
        i === idx ? { ...o, sales: o.sales + 1, revenue: o.revenue + sale } : o,
      );
      const rev = next.reduce((s, o) => s + o.revenue, 0);
      setPoints((pts) => [...pts.slice(-19), { i: (pts.at(-1)?.i ?? 0) + 1, v: rev }]);
      return next;
    });
    // Ogni nuovo incasso è bonus nuovo: torna «in attesa», va ri-approvato (escrow).
    setApproved(false);
    setActiveId(SEED_OPS[idx].id);
    setPulse((p) => p + 1);
    if (clearRef.current) clearTimeout(clearRef.current);
    clearRef.current = setTimeout(() => setActiveId(null), 900);
  }, []);

  useEffect(
    () => () => {
      if (clearRef.current) clearTimeout(clearRef.current);
    },
    [],
  );

  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* Alone pastello dietro la scheda */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_30%_0%,var(--gold-soft),transparent_70%),radial-gradient(50%_50%_at_90%_20%,var(--rose-soft),transparent_70%)] blur-xl"
      />

      <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
        {/* Intestazione: la campagna interna */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold/60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-gold" />
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Campagna interna · live
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Utensils className="size-3.5 text-gold" /> Trattoria del Porto
          </span>
        </div>

        {/* Obiettivo team + fatturato + grafico */}
        <div className="mt-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Fatturato del team</p>
              <AnimatedEuro
                value={totalRevenue}
                className="text-4xl font-semibold tracking-tight tabular-nums text-foreground"
              />
            </div>
            <span
              className={cn(
                "mb-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
                reached
                  ? "bg-gold-light text-gold-dark"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <TrendingUp className="size-3" />
              obiettivo {euro(CAMPAIGN.goalRevenue)}
            </span>
          </div>

          {/* Barra progresso verso la soglia che sblocca il rilascio */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-gold-dark transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3">
            <SimulatorChart points={points} />
          </div>
        </div>

        {/* Le postazioni: ogni QR è legato a un operatore, la vendita gli è attribuita */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {ops.map((o) => {
            const active = activeId === o.id;
            const bonus = operatorBonus(o.revenue, CAMPAIGN);
            return (
              <div
                key={o.id}
                className={cn(
                  "rounded-2xl border border-border/60 bg-background/60 p-3 transition-all duration-500 ease-out",
                  active && "scale-[1.03] ring-2 ring-gold/50",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-7 items-center justify-center rounded-xl bg-gold-light text-gold-dark">
                    <Users className="size-3.5" />
                  </span>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[0.6rem] font-medium tabular-nums text-muted-foreground">
                    {o.sales} vend.
                  </span>
                </div>
                <p className="mt-2 truncate text-sm font-semibold text-foreground">{o.name}</p>
                <p className="truncate text-[0.65rem] text-muted-foreground">{o.station}</p>
                <p className="mt-1.5 text-[0.7rem] tabular-nums text-muted-foreground">
                  {euro(o.revenue)}
                </p>
                <p className="text-[0.7rem] font-semibold tabular-nums text-rose">
                  bonus {euro(bonus)}
                </p>
              </div>
            );
          })}
        </div>

        {/* L'escrow: il bonus è trattenuto (held), si rilascia solo su approvazione */}
        <div
          className={cn(
            "mt-4 flex items-center justify-between gap-3 rounded-2xl border p-3 transition-colors duration-500",
            approved
              ? "border-gold/40 bg-gold-light/50"
              : "border-border/60 bg-background/60",
          )}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-xl transition-colors",
                approved ? "bg-gold text-cream" : "bg-muted text-muted-foreground",
              )}
            >
              {approved ? <Check className="size-4" /> : <Lock className="size-4" />}
            </span>
            <div>
              <p className="text-[0.7rem] text-muted-foreground">
                {approved ? "Bonus rilasciato al personale" : "Bonus in escrow (trattenuto)"}
              </p>
              <AnimatedEuro
                value={held}
                className="text-lg font-semibold tabular-nums text-foreground"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={!reached || approved}
            onClick={() => setApproved(true)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all duration-300",
              approved
                ? "bg-gold-light text-gold-dark"
                : reached
                  ? "bg-ink text-cream hover:bg-ink/90 active:scale-[0.98]"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            {approved ? (
              <>
                <Check className="size-3.5" /> Rilasciato
              </>
            ) : reached ? (
              "Approva e rilascia"
            ) : (
              "Raggiungi l'obiettivo"
            )}
          </button>
        </div>

        {/* Il pulsante-QR: ogni click = un cliente che scansiona a una postazione */}
        <button
          type="button"
          onClick={scan}
          className="group mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-ink to-gold-dark px-5 py-3 text-sm font-semibold text-cream shadow-sm transition-all duration-300 ease-out hover:shadow-md active:scale-[0.98]"
        >
          <span key={pulse} className="flex size-5 items-center justify-center">
            <QrCode className="size-5 transition-transform duration-500 ease-out group-hover:rotate-6" />
          </span>
          Simula una scansione a una postazione
        </button>
        <p className="mt-2 text-center text-[0.7rem] text-muted-foreground">
          Ogni scansione è attribuita a chi lavora quella postazione: vendite, bonus,
          escrow si muovono in tempo reale.
        </p>
      </div>
    </div>
  );
}
