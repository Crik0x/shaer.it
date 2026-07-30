// Logica pura del logging di una scansione: niente I/O, niente UI.
// Testabile a costo zero (lib/scan.test.ts). La route la usa; non la duplica.

import { createHash } from "node:crypto";

/** Primo IP di un header X-Forwarded-For ("client, proxy1, proxy2"). */
export function firstForwardedIp(xff: string | null | undefined): string | null {
  if (!xff) return null;
  const first = xff.split(",")[0]?.trim();
  return first ? first : null;
}

/**
 * Anonimizza un IP prima di scriverlo: mai l'indirizzo pieno.
 * IPv4 → ultimo ottetto azzerato (a.b.c.0). IPv6 → primi 3 gruppi + "::".
 */
export function anonymizeIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const clean = ip.trim();
  if (!clean) return null;

  if (clean.includes(".") && !clean.includes(":")) {
    const parts = clean.split(".");
    if (parts.length !== 4 || parts.some((p) => p === "" || Number.isNaN(Number(p)))) {
      return null;
    }
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }

  if (clean.includes(":")) {
    // Tiene i primi 3 gruppi e scarta il resto. La parte prima di "::" basta:
    // ciò che sta dopo (interface id, host) è quanto di più identificante ci sia.
    const left = clean.includes("::") ? clean.slice(0, clean.indexOf("::")) : clean;
    const groups = left.split(":").filter((g) => g !== "");
    if (groups.length === 0) return null;
    return `${groups.slice(0, 3).join(":")}::`;
  }

  return null;
}

export type UaInfo = { device: string; browser: string; os: string };

/** Euristica minima e testabile su user-agent. Nessuna libreria esterna. */
export function parseUserAgent(ua: string | null | undefined): UaInfo {
  const s = ua ?? "";
  const device = /Mobi|Android|iPhone|iPad|iPod/i.test(s) ? "mobile" : "desktop";

  let browser = "other";
  if (/Edg\//i.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(s)) browser = "Opera";
  else if (/Chrome\//i.test(s)) browser = "Chrome";
  else if (/Firefox\//i.test(s)) browser = "Firefox";
  else if (/Safari\//i.test(s)) browser = "Safari";

  // OS: l'ordine conta — iOS/Android prima di macOS/Linux (i loro UA contengono
  // "like Mac OS X" / "Linux"). Windows Phone è morto: Windows = desktop.
  let os = "other";
  if (/iPhone|iPad|iPod/i.test(s)) os = "iOS";
  else if (/Android/i.test(s)) os = "Android";
  else if (/Windows/i.test(s)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(s)) os = "macOS";
  else if (/Linux|X11/i.test(s)) os = "Linux";

  return { device, browser, os };
}

/** Prima preferenza di lingua da accept-language ("it-IT,it;q=0.9" → "it-IT"). */
export function primaryLang(header: string | null | undefined): string | null {
  if (!header) return null;
  const first = header.split(",")[0]?.split(";")[0]?.trim();
  return first || null;
}

/** Timbro giorno UTC (YYYY-MM-DD): ruota il salt del visitor_hash ogni 24h. */
export function dayStampUtc(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Hash pseudonimo del visitatore: stima gli unici SENZA fingerprint invasivo né
 * PII. Sale = IP già anonimizzato + user-agent + timbro giorno + salt di server.
 * Cambia ogni giorno (non tracciabile a lungo termine) ed è irreversibile.
 * Se manca l'IP anon → null (senza il pezzo identificante non stimiamo nulla).
 */
export function visitorHash(
  anonIp: string | null | undefined,
  ua: string | null | undefined,
  dayStamp: string,
  salt: string,
): string | null {
  if (!anonIp) return null;
  return createHash("sha256")
    .update(`${anonIp}|${ua ?? ""}|${dayStamp}|${salt}`)
    .digest("hex")
    .slice(0, 32);
}
