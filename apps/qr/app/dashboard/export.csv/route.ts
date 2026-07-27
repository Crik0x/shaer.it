import { NextResponse } from "next/server";

import { serverSupabase } from "@/lib/supabase-server";
import { toCsv } from "@/lib/dashboard";

// Export CSV delle scansioni dell'owner loggato (E6.9) — il deliverable "oro" per
// le agenzie. Owner-scoped dalla RLS di serverSupabase (auth.uid() = owner_id): la
// query vede solo i dati dell'utente. La serializzazione è la funzione pura toCsv
// (testata in lib/dashboard.test.ts); qui c'è solo il cablaggio HTTP.
export const dynamic = "force-dynamic";

const HEADERS = [
  { key: "created_at", label: "Data (UTC)" },
  { key: "device", label: "Dispositivo" },
  { key: "browser", label: "Browser" },
  { key: "os", label: "Sistema operativo" },
  { key: "lang", label: "Lingua" },
  { key: "country", label: "Paese" },
  { key: "city", label: "Città" },
];

export async function GET() {
  const supabase = await serverSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Non autenticato", { status: 401 });
  }

  // visitor_hash escluso di proposito: è uno pseudonimo interno per la stima degli
  // unici, non un dato da esportare (minimizzazione, D-007). created_at → ISO.
  const { data, error } = await supabase
    .from("qr_scans")
    .select("created_at, device, browser, os, lang, country, city")
    .order("created_at", { ascending: false })
    .limit(50000);

  if (error) {
    return new NextResponse("Errore nell'export", { status: 500 });
  }

  const csv = toCsv(HEADERS, data ?? []);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="scansioni-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
