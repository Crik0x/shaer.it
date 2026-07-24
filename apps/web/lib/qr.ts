// L'URL pubblico che il QR codifica: l'indirizzo immutabile del redirect
// (`/r/{short_code}`), mai il target diretto. Cambia la destinazione
// (target_url), mai l'indirizzo (regola d'oro 7).
//
// In dev il fallback è localhost; in produzione va impostata
// NEXT_PUBLIC_SITE_URL (es. https://qr.shaer.it). È pubblica per design.
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function redirectUrl(shortCode: string): string {
  return `${siteUrl()}/r/${shortCode}`;
}
