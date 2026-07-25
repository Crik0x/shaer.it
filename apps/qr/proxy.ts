import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next 16: il Middleware si chiama Proxy (stessa funzionalità). Qui rinfresca la
// sessione a ogni richiesta (i token Supabase scadono) e fa un check ottimistico
// su /dashboard: senza utente → /login. La protezione forte resta nel layout
// dashboard (getUser server-side). Il redirect pubblico /r/* NON è toccato:
// resta anonimo e sempre risolvibile (regola d'oro 7).
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Tutto tranne asset statici e il redirect pubblico /r/*.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|r/|env-check|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
