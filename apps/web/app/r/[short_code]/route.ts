import { NextRequest, NextResponse } from "next/server";
import { publicSupabase } from "@/lib/supabase-public";
import {
  anonymizeIp,
  firstForwardedIp,
  parseUserAgent,
  primaryLang,
  visitorHash,
  dayStampUtc,
} from "@/lib/scan";

// Salt del visitor_hash: un segreto di server che rende l'hash non correlabile da
// fuori. Se manca, NON si usa un salt pubblico prevedibile (indebolirebbe in
// silenzio la pseudonimizzazione): si salta l'hash (visitor_hash null). Impostare
// VISITOR_SALT su Vercel per abilitare la stima degli unici.
const VISITOR_SALT = process.env.VISITOR_SALT ?? null;

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
  const { device, browser, os } = parseUserAgent(ua);
  const ip = anonymizeIp(
    firstForwardedIp(req.headers.get("x-forwarded-for")) ?? req.headers.get("x-real-ip"),
  );

  // Geo dagli header di Vercel (edge network). In locale sono assenti → null.
  const h = req.headers;
  const country = h.get("x-vercel-ip-country");
  // x-vercel-ip-city arriva URL-encoded ("San%20Francisco").
  const cityRaw = h.get("x-vercel-ip-city");
  const city = cityRaw ? decodeURIComponent(cityRaw) : null;
  const lang = primaryLang(h.get("accept-language"));
  const referer = h.get("referer");
  // Hash sull'IP GIÀ anonimizzato: stima gli unici senza materiale identificante.
  // Senza salt di server → null (mai un hash con salt pubblico).
  const visitor = VISITOR_SALT ? visitorHash(ip, ua, dayStampUtc(), VISITOR_SALT) : null;

  const sb = publicSupabase();
  const base = {
    p_short_code: short_code,
    p_device: device,
    p_browser: browser,
    p_country: country,
    p_city: city,
    p_ip: ip,
  };

  // Chiamata arricchita (os/lang/referer/visitor_hash). Se la migrazione 0002 non
  // è ancora applicata, la funzione a 10 arg non esiste: si ripiega sui 6 arg —
  // un QR pubblicato non si rompe MAI (regola d'oro 7), l'arricchimento è additivo.
  let { data, error } = await sb.rpc("resolve_qr", {
    ...base,
    p_os: os,
    p_lang: lang,
    p_referer: referer,
    p_visitor_hash: visitor,
  });
  if (error && /find the function|does not exist|schema cache/i.test(error.message ?? "")) {
    ({ data, error } = await sb.rpc("resolve_qr", base));
  }

  // resolve_qr torna null se lo short_code non esiste → 404.
  // Il log è best-effort dentro la funzione: un QR pubblicato non si rompe mai.
  if (error || !data) {
    return new NextResponse("QR non trovato", { status: 404 });
  }

  return NextResponse.redirect(data as string, 302);
}
