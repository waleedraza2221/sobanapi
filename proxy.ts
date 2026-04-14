import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect app routes
  const isAppRoute =
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/pricing") &&
    !pathname.startsWith("/features") &&
    !pathname.startsWith("/about") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    pathname !== "/";

  if (isAppRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect logged-in users away from auth pages
  if (user && pathname.startsWith("/auth")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  // Protect admin routes — require admin role
  if (user && pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
