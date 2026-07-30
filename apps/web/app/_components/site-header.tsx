import Link from "next/link";
import { LayoutDashboard, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { serverSupabase } from "@/lib/supabase-server";

import { AuthPopover } from "./auth-popover";

// Header della landing: marchio + zona d'ingresso consapevole della sessione.
// Da loggato mostra Dashboard + Esci (riusa /auth/signout, come il layout della
// dashboard); da anonimo i due popover Accedi / Registrati. Server Component:
// la sessione si legge lato server, nessun flash di stato sbagliato.
export async function SiteHeader() {
  const supabase = await serverSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          {user ? (
            <>
              <Button
                variant="ghost"
                size="lg"
                render={
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                }
              />
              <form action="/auth/signout" method="post">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-ink text-cream hover:bg-ink/90"
                >
                  Esci
                </Button>
              </form>
            </>
          ) : (
            <>
              <AuthPopover label="Accedi" variant="ghost" />
              <AuthPopover
                label="Registrati"
                className="bg-ink text-cream hover:bg-ink/90"
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
