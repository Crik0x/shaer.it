import { NextResponse } from "next/server";

import { serverSupabase } from "@/lib/supabase-server";

// Scambia il `code` del magic link (o della conferma email) per una sessione,
// poi manda alla dashboard. Se manca o fallisce → login con flag d'errore.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await serverSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
