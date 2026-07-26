import { BarChart3, QrCode, Sparkles } from "lucide-react";

import { AuthPopover } from "./_components/auth-popover";
import { NetworkTreePanel } from "./_components/network-tree-panel";
import { SiteHeader } from "./_components/site-header";
import { Simulator } from "./_components/simulator";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5">
        {/* Hero + simulatore, affiancati su desktop, impilati su mobile */}
        <section className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-gold-light/60 px-3 py-1 text-xs font-medium tracking-wide text-gold-dark">
              <Sparkles className="size-3.5" />
              QR dinamici · analytics · campagne
            </span>

            <h1 className="text-balance font-display text-5xl font-normal leading-[1.02] tracking-tight text-ink sm:text-6xl">
              Il QR che ti dice{" "}
              <em className="italic text-gold-dark">come vendere di più</em>.
            </h1>

            <p className="max-w-md text-pretty text-base leading-7 text-muted-foreground">
              Ogni scansione diventa un dato. Vendite, registrazioni, contatti:
              un solo link personale, una dashboard che capisce i tuoi clienti e
              come far crescere le interazioni.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <AuthPopover
                label="Crea il tuo QR"
                className="bg-ink text-cream hover:bg-ink/90"
              />
              <a
                href="#demo"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-foreground transition-colors duration-300 hover:text-gold-dark"
              >
                Prova la demo qui accanto →
              </a>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <QrCode className="size-3.5 text-gold" /> Link immutabile, destinazione modificabile
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BarChart3 className="size-3.5 text-rose" /> Analytics per campagna
              </span>
            </div>
          </div>

          <div id="demo" className="scroll-mt-24">
            <Simulator />
          </div>
        </section>

        {/* Analizzatore ramificato: un Progetto → campagne → sotto-campagne.
            Le scansioni risalgono per ramo; la linea segue i rami più forti. */}
        <section className="border-t border-border py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-gold-light/60 px-3 py-1 text-xs font-medium tracking-wide text-gold-dark">
              Le tue campagne
            </span>
            <h2 className="mt-4 text-balance font-display text-4xl font-normal leading-tight text-ink sm:text-5xl">
              Ogni campagna{" "}
              <em className="italic text-gold-dark">si ramifica</em>.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-7 text-muted-foreground">
              Un progetto, più campagne, ognuna in sotto-campagne: le scansioni
              risalgono per ramo e la linea segue quelle che rendono di più.
              Clicca una campagna per il focus, «+» per aggiungerne una.
            </p>
          </div>
          <div className="mt-10">
            <NetworkTreePanel />
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-5 py-8 text-xs text-muted-foreground sm:flex-row">
          <span className="font-display text-base text-ink">
            shaer<span className="text-gold-dark">.it</span>{" "}
            <span className="font-sans text-xs text-muted-foreground">— QR platform</span>
          </span>
          <span>Dati dimostrativi · i numeri diventano reali dopo l’accesso.</span>
        </div>
      </footer>
    </div>
  );
}
