// lib/supabase/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/ssr";

export async function updateSession(req: NextRequest) {
  // Create the response we’ll mutate with Supabase cookies
  const res = NextResponse.next();

  // ✅ Use the middleware client (not createServerClient)
  const supabase = createMiddlewareClient({
    req,
    res,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });

  // Touch auth so session cookies stay fresh
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith("/admin") && !user) {
    const loginUrl = new URL("/auth/login", req.url);
    const redirectRes = NextResponse.redirect(loginUrl);

    // 🔐 Carry over cookies set on `res` to the redirect response
    for (const { name, value, options } of res.cookies.getAll()) {
      redirectRes.cookies.set(name, value, options);
    }

    return redirectRes;
  }

  // IMPORTANT: return the SAME response we passed into createMiddlewareClient
  return res;
}
