"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Shell della dashboard (T-017 · D-012): struttura da arkes_dashboard_v3 —
// sidebar 240px + main — coi token del progetto (regola 8), non la palette.
// Foglia client (regola 9): il layout Server Component fa la data-fetch e passa
// qui email + children; qui vive solo l'interattività (drawer mobile, active nav).
// Nav SOLO verso route esistenti; i moduli in roadmap sono «presto» disabilitati
// (niente link morti — regola 7).

type Icon = (props: { className?: string }) => React.ReactElement;

const IconOverview: Icon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);
const IconQr: Icon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M20 14v.01M14 20h.01M17 20h4v-3" />
  </svg>
);
const IconCal: Icon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" />
  </svg>
);
const IconBox: Icon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5M12 13v8" />
  </svg>
);
const IconHeart: Icon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-8.3a5 5 0 0 0 0-7.1Z" />
  </svg>
);
const IconNet: Icon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="19" r="2.5" /><circle cx="19" cy="19" r="2.5" /><path d="M12 7.5v4M10 13l-3 3.5M14 13l3 3.5" />
  </svg>
);

const LIVE: { label: string; href: string; icon: Icon }[] = [
  { label: "Panoramica", href: "/dashboard", icon: IconOverview },
  { label: "Crea QR", href: "/dashboard/qr/new", icon: IconQr },
];

const SOON: { label: string; icon: Icon }[] = [
  { label: "Prenotazioni", icon: IconCal },
  { label: "Prodotti", icon: IconBox },
  { label: "Fidelity", icon: IconHeart },
  { label: "Rete", icon: IconNet },
];

export function DashboardShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <>
      <div className="flex flex-col gap-0.5">
        {LIVE.map(({ label, href, icon: Ic }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <Ic className="size-[18px] shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6">
        <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-sidebar-foreground/45">
          Prossimi moduli
        </p>
        <div className="flex flex-col gap-0.5">
          {SOON.map(({ label, icon: Ic }) => (
            <span
              key={label}
              aria-disabled="true"
              className="flex cursor-default items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/40"
            >
              <Ic className="size-[18px] shrink-0" />
              {label}
              <span className="ml-auto rounded bg-sidebar-accent/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                presto
              </span>
            </span>
          ))}
        </div>
      </div>
    </>
  );

  const footer = (
    <div className="flex items-center gap-3 border-t border-sidebar-border px-4 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold uppercase text-sidebar-accent-foreground">
        {email.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-sidebar-foreground/70">{email}</p>
      </div>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="text-xs font-medium text-sidebar-foreground/80 underline underline-offset-4 hover:text-sidebar-foreground"
        >
          Esci
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-dvh bg-background">
      {/* Overlay drawer mobile */}
      {open ? (
        <button
          aria-label="Chiudi menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-foreground/30 md:hidden"
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center gap-2 px-5">
          <span className="font-heading text-sm font-semibold tracking-tight text-sidebar-foreground">
            Shaer.it
          </span>
          <span className="rounded bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-accent-foreground">
            QR
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2">{nav}</nav>
        {footer}
      </aside>

      {/* Main */}
      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <button
            aria-label="Apri menu"
            onClick={() => setOpen(true)}
            className="grid size-9 place-items-center rounded-md border border-border text-foreground md:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-sm text-muted-foreground">
            Shaer.it{" "}
            <span className="text-foreground/40">/</span>{" "}
            <span className="font-medium text-foreground">Panoramica</span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
