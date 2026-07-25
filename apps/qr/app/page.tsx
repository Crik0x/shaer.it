import { BarChart3, QrCode, Sparkles } from "lucide-react";

import { AuthPopover } from "./_components/auth-popover";
import { SiteHeader } from "./_components/site-header";
import { Simulator } from "./_components/simulator";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5">
        {/* Hero + simulatore, affiancati su desktop, impilati su mobile */}
        <section className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-brand-blue-soft/60 px-3 py-1 text-xs font-medium text-brand-blue">
              <Sparkles className="size-3.5" />
              QR dinamici · analytics · campagne
            </span>

            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Il QR che ti dice{" "}
              <span className="text-brand-orange">come vendere di più</span>.
            </h1>

            <p className="max-w-md text-pretty text-base leading-7 text-muted-foreground">
              Ogni scansione diventa un dato. Vendite, registrazioni, contatti:
              un solo link personale, una dashboard che capisce i tuoi clienti e
              come far crescere le interazioni.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <AuthPopover
                label="Crea il tuo QR"
                className="bg-brand-blue text-brand-blue-foreground hover:bg-brand-blue/90"
              />
              <a
                href="#demo"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-foreground transition-colors duration-300 hover:text-brand-blue"
              >
                Prova la demo qui accanto →
              </a>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <QrCode className="size-3.5 text-brand-blue" /> Link immutabile, destinazione modificabile
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BarChart3 className="size-3.5 text-brand-orange" /> Analytics per campagna
              </span>
            </div>
          </div>

          <div id="demo" className="scroll-mt-24">
            <Simulator />
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-5 py-8 text-xs text-muted-foreground sm:flex-row">
          <span>
            shaer<span className="text-brand-orange">.it</span> — QR platform
          </span>
          <span>Dati dimostrativi · i numeri diventano reali dopo l’accesso.</span>
        </div>
      </footer>
    </div>
  );
}
