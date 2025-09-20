// lib/supabase/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function updateSession(req: NextRequest) {
  // Create the response we’ll mutate with Supabase cookies
  const res = NextResponse.next();

  // ✅ Use the server client configured with request/response cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  // Touch auth so session cookies stay fresh
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith("/admin") && !user) {
    const loginUrl = new URL("/auth/login", req.url);
    const redirectRes = NextResponse.redirect(loginUrl);

    // 🔐 Carry over cookies set on `res` to the redirect response
    for (const cookie of res.cookies.getAll()) {
      redirectRes.cookies.set(cookie);
    }

    return redirectRes;
  }

  // IMPORTANT: return the SAME response we passed into createServerClient
  return res;
}
