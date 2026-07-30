"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LoginForm } from "@/app/(auth)/login/login-form";

// Il login/signup non è una pagina a parte: compare in un popover ancorato al
// pulsante nell'header. Riusa LoginForm — stessa logica di /login (L-003:
// il client Supabase nasce negli handler, non nel corpo).
export function AuthPopover({
  label,
  variant = "default",
  className,
}: {
  label: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant={variant} size="lg" className={className}>
            {label}
          </Button>
        }
      />
      <PopoverContent className="w-[20rem]">
        <div className="mb-4 space-y-1">
          <p className="text-sm font-semibold text-foreground">Entra in Shaer</p>
          <p className="text-xs text-muted-foreground">
            Accedi o crea il tuo account in pochi secondi.
          </p>
        </div>
        <LoginForm />
      </PopoverContent>
    </Popover>
  );
}
