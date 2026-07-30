"use client";

import { createBrowserClient } from "@supabase/ssr";

// Client lato browser per il form di login/signup. Scrive la sessione nei
// cookie che il middleware e serverSupabase() poi leggono. La anon key è
// pubblica per design: la guardia è la RLS.
export function browserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
