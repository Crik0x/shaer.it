import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client autenticato lato server (Server Components, Route Handler, layout).
// La sessione vive nei cookie gestiti da @supabase/ssr: ogni query passa la
// RLS con auth.uid() = owner_id. È IL client owner-scoped di T-004: le letture
// di qr_codes / qr_scans qui vedono solo i dati dell'utente loggato.
export async function serverSupabase() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY mancanti in .env.local");
  }
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Invocato da un Server Component: scrivere cookie qui non è
          // permesso. Il refresh della sessione lo fa il middleware.
        }
      },
    },
  });
}
