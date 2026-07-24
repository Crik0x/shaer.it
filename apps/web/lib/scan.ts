// Logica pura del logging di una scansione: niente I/O, niente UI.
// Testabile a costo zero (lib/scan.test.ts). La route la usa; non la duplica.

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

export type UaInfo = { device: string; browser: string };

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

  return { device, browser };
}
