import { redirect } from "next/navigation";

import { serverSupabase } from "@/lib/supabase-server";

import { DashboardShell } from "./dashboard-shell";
import { TimezoneSync } from "./timezone-sync";

// Protezione forte (Data Access Layer): il proxy fa il check ottimistico, ma è
// qui che si decide davvero. Senza utente → /login. La shell (sidebar + main,
// T-017/D-012) è una foglia client: qui resta solo la data-fetch owner-scoped.
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
    <DashboardShell email={user.email ?? ""}>
      <TimezoneSync currentTz={profile?.timezone ?? "UTC"} />
      {children}
    </DashboardShell>
  );
}
