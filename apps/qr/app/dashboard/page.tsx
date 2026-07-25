import Link from "next/link";

import { serverSupabase } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";

// Indicatori derivati dai dati reali, owner-scoped via RLS (auth.uid() =
// owner_id): l'utente vede solo i propri conteggi. Le scansioni si CONTANO da
// qr_scans (append-only), mai da un saldo memorizzato (regola d'oro 9).
export default async function DashboardPage() {
  const supabase = await serverSupabase();

  const [{ count: qrCount }, { count: scanCount }, { data: qrs }] =
    await Promise.all([
      supabase.from("qr_codes").select("*", { count: "exact", head: true }),
      supabase.from("qr_scans").select("*", { count: "exact", head: true }),
      supabase
        .from("qr_codes")
        .select("name, target_url, short_code, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  const stats = [
    { label: "QR creati", value: qrCount ?? 0 },
    { label: "Scansioni totali", value: scanCount ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            I tuoi QR dinamici: l&apos;indirizzo è fisso, la destinazione la
            cambi quando vuoi.
          </p>
        </div>
        <Button render={<Link href="/dashboard/qr/new" />} size="lg">
          Crea QR
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-heading text-3xl font-semibold tracking-tight text-card-foreground">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {qrs && qrs.length > 0 ? (
        <div className="divide-y divide-border rounded-xl border border-border">
          {qrs.map((qr) => (
            <Link
              key={qr.short_code}
              href={`/dashboard/qr/${qr.short_code}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {qr.name || "QR senza nome"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {qr.target_url}
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                /r/{qr.short_code}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Non hai ancora nessun QR.{" "}
            <Link
              href="/dashboard/qr/new"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Creane uno
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
