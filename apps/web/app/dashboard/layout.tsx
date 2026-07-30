import { redirect } from "next/navigation";

import { serverSupabase } from "@/lib/supabase-server";

import { TimezoneSync } from "./timezone-sync";

// Protezione forte (Data Access Layer): il proxy fa il check ottimistico, ma è
// qui che si decide davvero. Senza utente → /login.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await serverSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fuso del profilo (owner-scoped via RLS). Se è ancora il default 'UTC', la
  // foglia client sotto lo aggiorna col fuso del browser al primo caricamento.
  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .maybeSingle();

  return (
    <div className="min-h-dvh bg-background">
      <TimezoneSync currentTz={profile?.timezone ?? "UTC"} />
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
            Shaer.it
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm font-medium text-foreground underline underline-offset-4"
              >
                Esci
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
