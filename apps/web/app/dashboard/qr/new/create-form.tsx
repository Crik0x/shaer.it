"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { createQr, type CreateQrState } from "../actions";

const inputClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function CreateForm() {
  const [state, action, pending] = useActionState<CreateQrState, FormData>(
    createQr,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Nome <span className="text-muted-foreground">(facoltativo)</span>
        </label>
        <input id="name" name="name" type="text" className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="target_url"
          className="text-sm font-medium text-foreground"
        >
          URL di destinazione
        </label>
        <input
          id="target_url"
          name="target_url"
          type="url"
          required
          placeholder="https://esempio.com/pagina"
          className={inputClass}
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creazione…" : "Crea QR"}
      </Button>
    </form>
  );
}
