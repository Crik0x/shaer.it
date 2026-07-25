import { QrCode } from "lucide-react";

import { AuthPopover } from "./auth-popover";

// Header della landing: marchio + i due punti d'ingresso (Accedi / Registrati),
// entrambi aperti in popover. Sticky con vetro smerigliato, linea delicata.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <a href="/" className="group flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-brand-blue text-brand-blue-foreground shadow-sm transition-transform duration-300 ease-out group-hover:-rotate-6">
            <QrCode className="size-4" />
          </span>
          <span className="text-[0.95rem] font-semibold tracking-tight text-foreground">
            shaer<span className="text-brand-orange">.it</span>
          </span>
        </a>

        <div className="flex items-center gap-2">
          <AuthPopover label="Accedi" variant="ghost" />
          <AuthPopover
            label="Registrati"
            className="bg-brand-blue text-brand-blue-foreground hover:bg-brand-blue/90"
          />
        </div>
      </div>
    </header>
  );
}
