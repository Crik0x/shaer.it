import Link from "next/link";
import { notFound } from "next/navigation";

import { serverSupabase } from "@/lib/supabase-server";
import { redirectUrl } from "@/lib/qr";
import { QrPanel } from "./qr-panel";

export default async function QrDetailPage({
  params,
}: {
  params: Promise<{ short_code: string }>;
}) {
  const { short_code } = await params;
  const supabase = await serverSupabase();

  // Owner-scoped via RLS: un utente vede solo i propri QR. Un short_code altrui
  // qui è un 404, non un leak.
  const { data: qr } = await supabase
    .from("qr_codes")
    .select("name, target_url, short_code, created_at")
    .eq("short_code", short_code)
    .maybeSingle();

  if (!qr) notFound();

  const url = redirectUrl(qr.short_code);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-2 font-heading text-xl font-semibold tracking-tight text-foreground">
          {qr.name || "QR senza nome"}
        </h1>
        <p className="mt-1 break-all text-sm text-muted-foreground">
          Indirizzo:{" "}
          <a href={url} className="underline underline-offset-4">
            {url}
          </a>
        </p>
        <p className="break-all text-sm text-muted-foreground">
          Destinazione attuale: {qr.target_url}
        </p>
      </div>

      <QrPanel content={url} filename={qr.short_code} />
    </div>
  );
}
