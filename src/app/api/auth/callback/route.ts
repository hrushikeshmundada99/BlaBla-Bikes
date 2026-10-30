import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";

  // Validate that `next` is a safe relative same-origin path to prevent open redirects
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user is banned
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_banned")
          .eq("id", user.id)
          .single();

        if (profile?.is_banned) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?error=account_banned`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fallback on error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

