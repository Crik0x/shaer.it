import { NextResponse } from "next/server";

// DIAGNOSTICA TEMPORANEA (T-deploy): mostra cosa Vercel ha inlinato nel build per
// le NEXT_PUBLIC_*. NON espone segreti — la anon key è solo presenza+lunghezza,
// l'URL è già pubblico (è nel repo). Da RIMUOVERE appena il deploy è verde.
// È esclusa dal proxy nel matcher di proxy.ts, così risponde anche col 500.
export const dynamic = "force-dynamic";

export function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? null;
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: url, // pubblico, ok mostrarlo
    NEXT_PUBLIC_SUPABASE_ANON_KEY_presente: key.length > 0,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_lunghezza: key.length, // un JWT valido è ~200+
    NEXT_PUBLIC_SITE_URL: site,
  });
}
