"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { browserSupabase } from "@/lib/supabase-browser";

type Mode = "login" | "signup";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    // Creato qui, non nel corpo: il client browser non deve girare durante il
    // prerender di build (altrimenti /login esplode se manca l'env — L-003).
    const supabase = browserSupabase();
    const fn =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });
    const { data, error } = await fn;
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Con Confirm email ON (prod) signUp NON ritorna una sessione: l'account
    // esiste ma è inerte finché non si apre il link via email. Senza sessione
    // non si va in dashboard — si dice all'utente di confermare. Con Confirm
    // OFF (dev) la sessione c'è subito e si prosegue. Vale per entrambi.
    if (!data.session) {
      setMessage(
        "Ti abbiamo inviato un'email di conferma: apri il link per attivare l'account, poi accedi.",
      );
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function onMagicLink() {
    if (!email) {
      setError("Inserisci l'email per il magic link.");
      return;
    }
    setPending(true);
    setError(null);
    setMessage(null);
    const supabase = browserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage("Ti abbiamo inviato un link di accesso. Controlla l'email.");
  }

  return (
    <form onSubmit={onPassword} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {mode === "login" ? "Accedi" : "Crea account"}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        disabled={pending}
        onClick={onMagicLink}
      >
        Invia magic link
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? "Non hai un account?" : "Hai già un account?"}{" "}
        <button
          type="button"
          className="font-medium text-foreground underline underline-offset-4"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setMessage(null);
          }}
        >
          {mode === "login" ? "Registrati" : "Accedi"}
        </button>
      </p>
    </form>
  );
}
