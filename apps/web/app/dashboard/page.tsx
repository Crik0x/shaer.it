import { serverSupabase } from "@/lib/supabase-server";

// Indicatori derivati dai dati reali, owner-scoped via RLS (auth.uid() =
// owner_id): l'utente vede solo i propri conteggi. Le scansioni si CONTANO da
// qr_scans (append-only), mai da un saldo memorizzato (regola d'oro 9).
export default async function DashboardPage() {
  const supabase = await serverSupabase();

  const [{ count: qrCount }, { count: scanCount }] = await Promise.all([
    supabase.from("qr_codes").select("*", { count: "exact", head: true }),
    supabase.from("qr_scans").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "QR creati", value: qrCount ?? 0 },
    { label: "Scansioni totali", value: scanCount ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Il tuo spazio QR. Il generatore e le analytics arrivano a breve.
        </p>
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

      {qrCount === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Non hai ancora nessun QR. Il generatore arriva con il prossimo
            rilascio.
          </p>
        </div>
      )}
    </div>
  );
}
