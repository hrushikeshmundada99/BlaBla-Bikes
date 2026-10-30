import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest, initialResponse?: NextResponse) {
  let response = initialResponse ?? NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = initialResponse ?? NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ALWAYS use getUser() for validated authentication, NEVER trust getSession() alone
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Extract locale prefix (e.g. /en, /hi, /mr)
  const segments = pathname.split("/");
  const locale = ["en", "hi", "mr"].includes(segments[1]) ? segments[1] : "en";
  const pathWithoutLocale = segments.slice(2).join("/");

  // Protected paths
  const protectedPaths = [
    "dashboard",
    "profile",
    "rides/my-rides",
    "rides/offer",
    "chat",
    "onboarding",
    "admin",
  ];

  const isProtected = protectedPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );

  if (isProtected && !user) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection: check role
  if (pathWithoutLocale.startsWith("admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_banned")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin" || profile.is_banned) {
      const homeUrl = new URL(`/${locale}`, request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
}

