// Genera lo short_code di un QR. Lo schema non ha default (col. `short_code`
// not null unique): lo produce l'app, e il vincolo `unique` del DB resta la
// garanzia finale contro le collisioni (la Server Action fa retry su 23505).
//
// base62 senza bias: 62*4 = 248, quindi si scartano i byte >= 248 prima del
// modulo 62 (rejection sampling). `crypto` è globale sia in Node che nel browser.
const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LIMIT = 248; // 4 * 62

export function generateShortCode(length = 8): string {
  if (length <= 0) throw new Error("length deve essere > 0");
  let out = "";
  while (out.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length - out.length));
    for (const b of bytes) {
      if (b < LIMIT) out += ALPHABET[b % 62];
    }
  }
  return out;
}
