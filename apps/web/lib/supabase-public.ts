import { createClient } from "@supabase/supabase-js";

// Client anonimo lato server per il redirect pubblico. Nessuna sessione utente:
// chiama solo resolve_qr (SECURITY DEFINER). La anon key è pubblica per design;
// la RLS è la guardia. Per l'auth degli utenti (T-004) servirà @supabase/ssr.
export function publicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY mancanti in .env.local");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
