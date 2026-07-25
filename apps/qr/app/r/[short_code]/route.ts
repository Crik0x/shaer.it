import { NextRequest, NextResponse } from "next/server";
import { publicSupabase } from "@/lib/supabase-public";
import { anonymizeIp, firstForwardedIp, parseUserAgent } from "@/lib/scan";

// Il cuore del QR dinamico: /r/[short_code] risolve dal DB e fa 302.
// force-dynamic: mai in cache, ogni scansione ri-colpisce il DB — è ciò che
// rende "dinamico" il QR (la destinazione cambia, lo short_code no, regola 7).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ short_code: string }> },
) {
  const { short_code } = await params;

  const ua = req.headers.get("user-agent");
  const { device, browser } = parseUserAgent(ua);
  const ip = anonymizeIp(
    firstForwardedIp(req.headers.get("x-forwarded-for")) ?? req.headers.get("x-real-ip"),
  );

  const { data, error } = await publicSupabase().rpc("resolve_qr", {
    p_short_code: short_code,
    p_device: device,
    p_browser: browser,
    p_country: null,
    p_city: null,
    p_ip: ip,
  });

  // resolve_qr torna null se lo short_code non esiste → 404.
  // Il log è best-effort dentro la funzione: un QR pubblicato non si rompe mai.
  if (error || !data) {
    return new NextResponse("QR non trovato", { status: 404 });
  }

  return NextResponse.redirect(data as string, 302);
}
