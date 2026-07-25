import Link from "next/link";
import { QrCode } from "lucide-react";

import { AuthPopover } from "./auth-popover";

// Header della landing: marchio + i due punti d'ingresso (Accedi / Registrati),
// entrambi aperti in popover. Sticky con vetro smerigliato, filo d'oro delicato.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-ink text-cream shadow-sm transition-transform duration-300 ease-out group-hover:-rotate-6">
            <QrCode className="size-4" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            shaer<span className="text-gold-dark">.it</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <AuthPopover label="Accedi" variant="ghost" />
          <AuthPopover
            label="Registrati"
            className="bg-ink text-cream hover:bg-ink/90"
          />
        </div>
      </div>
    </header>
  );
}
