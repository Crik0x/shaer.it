// Validazione del fuso orario (IANA), condivisa da chi lo SCRIVE (la server action
// saveTimezone: input non fidato dal browser) e da chi lo LEGGE per il display
// (le funzioni pure di dashboard.ts). Una funzione pura, testabile in isolamento
// senza runtime Next — perciò vive qui e non nel file "use server" delle action.

/** true se `tz` è un nome IANA valido. Intl lancia RangeError su un nome ignoto:
 *  qui si intercetta. È il guard che decide cosa entra in `profiles.timezone`. */
export function isValidTimeZone(tz: string): boolean {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** `tz` se valido, altrimenti 'UTC': un `profiles.timezone` corrotto non deve
 *  crashare la dashboard con il RangeError di Intl (seconda difesa lato render). */
export function safeTimeZone(tz: string): string {
  return isValidTimeZone(tz) ? tz : "UTC";
}
