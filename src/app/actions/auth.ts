"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/ratelimit";
import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";
import { redirect } from "@/i18n/routing";

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function loginAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitKey = `login:${ip}:${email}`;

  const rateCheck = await checkRateLimit(rateLimitKey, 5, 60);
  if (!rateCheck.success) {
    return {
      success: false,
      error: "Too many login attempts. Please wait a minute and try again.",
    };
  }

  const validated = loginSchema.safeParse({ email, password });
  if (!validated.success) {
    return {
      success: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error || !data.user) {
    return {
      success: false,
      error: "Invalid email or password. Please try again.",
    };
  }

  // Check if banned
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_banned")
    .eq("id", data.user.id)
    .single();

  if (profile?.is_banned) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "This account has been suspended for safety policy violations.",
    };
  }

  return { success: true };
}

export async function signupAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitKey = `signup:${ip}:${email}`;

  const rateCheck = await checkRateLimit(rateLimitKey, 5, 60);
  if (!rateCheck.success) {
    return {
      success: false,
      error: "Too many requests. Please wait a minute before trying again.",
    };
  }

  const validated = signupSchema.safeParse({ fullName, email, password });
  if (!validated.success) {
    return {
      success: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const origin = headerList.get("origin") || "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        full_name: validated.data.fullName,
      },
      emailRedirectTo: `${origin}/api/auth/callback?next=/verify-email`,
    },
  });

  if (error) {
    console.error("Signup error:", error.message);
    return {
      success: false,
      error: "Unable to create account. Please check your details and try again.",
    };
  }

  return {
    success: true,
    message: "Registration successful! Please check your email to verify your account.",
  };
}

export async function forgotPasswordAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const email = formData.get("email") as string;

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitKey = `forgot:${ip}:${email}`;

  const rateCheck = await checkRateLimit(rateLimitKey, 5, 60);
  if (!rateCheck.success) {
    return {
      success: false,
      error: "Too many requests. Please wait a minute before trying again.",
    };
  }

  const validated = forgotPasswordSchema.safeParse({ email });
  if (!validated.success) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  const supabase = await createClient();
  const origin = headerList.get("origin") || "http://localhost:3000";

  await supabase.auth.resetPasswordForEmail(validated.data.email, {
    redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
  });

  // Always return a generic success message to prevent email enumeration
  return {
    success: true,
    message: "If an account exists with this email, a password reset link has been sent.",
  };
}

export async function resetPasswordAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const password = formData.get("password") as string;

  const validated = resetPasswordSchema.safeParse({ password });
  if (!validated.success) {
    return {
      success: false,
      error: "Please enter a strong password with at least 10 characters.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  });

  if (error) {
    return {
      success: false,
      error: "Failed to update password. Your reset link may have expired.",
    };
  }

  return {
    success: true,
    message: "Password updated successfully. You can now log in.",
  };
}

export async function resendVerificationAction(): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { success: false, error: "No active session found. Please log in." };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitKey = `resend:${ip}:${user.email}`;

  const rateCheck = await checkRateLimit(rateLimitKey, 1, 60);
  if (!rateCheck.success) {
    return {
      success: false,
      error: "Please wait 60 seconds before requesting another email.",
    };
  }

  const origin = headerList.get("origin") || "http://localhost:3000";
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: user.email,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { success: false, error: "Failed to resend email. Please try again later." };
  }

  return { success: true, message: "Verification email sent. Please check your inbox." };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect({ href: "/login", locale: "en" });
}

