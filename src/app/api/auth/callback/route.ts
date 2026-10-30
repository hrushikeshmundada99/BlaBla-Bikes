import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");
  const rawNext = searchParams.get("next") ?? "/dashboard";

  // Validate that `next` is a safe relative same-origin path to prevent open redirects
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (error) {
    const encodedDesc = encodeURIComponent(error_description || error);
    return NextResponse.redirect(`${origin}/login?error=${encodedDesc}`);
  }

  const supabase = await createClient();

  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!verifyError) {
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
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
