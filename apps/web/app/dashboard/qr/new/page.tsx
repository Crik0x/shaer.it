import Link from "next/link";

import { CreateForm } from "./create-form";

// Server Component: guscio. Il form interattivo è la foglia client.
export default function NewQrPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-2 font-heading text-xl font-semibold tracking-tight text-foreground">
          Nuovo QR
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Scegli la destinazione. L&apos;indirizzo del QR resta immutabile: la
          destinazione potrai cambiarla quando vuoi.
        </p>
      </div>
      <CreateForm />
    </div>
  );
}
