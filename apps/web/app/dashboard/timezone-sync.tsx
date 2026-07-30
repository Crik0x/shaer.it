"use client";

import { useEffect, useRef } from "react";

import { saveTimezone } from "./actions";

// Foglia client (D-013/D-014): al primo caricamento della dashboard, se il
// profilo ha ancora il fuso di default ('UTC'), cattura il fuso del browser (Intl)
// e lo salva sul profilo via server action. Nessuna UI, nessun flash: il display
// resta UTC finché il salvataggio non rientra, poi il render successivo è locale.
// Fire-once per montaggio.
export function TimezoneSync({ currentTz }: { currentTz: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current || currentTz !== "UTC") return;
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!browserTz || browserTz === "UTC") return;
    done.current = true;
    void saveTimezone(browserTz);
  }, [currentTz]);
  return null;
}
