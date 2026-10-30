"use client";

import * as React from "react";
import { Suspense } from "react";
import { loginAction } from "@/app/actions/auth";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/routing";
import { LogIn, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const urlError = searchParams.get("error");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(
    urlError === "account_banned"
      ? "This account has been suspended for safety policy violations."
      : urlError === "auth_callback_failed"
      ? "Authentication callback failed. Please try logging in again."
      : null
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await loginAction(null, formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Invalid credentials. Please try again.");
    } else {
      router.push(next);
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
        <p className="text-xs text-slate-500">
          Sign in to your BlaBlaBikes Nashik account
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-soft space-y-5">
        {error && (
          <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <Input
              name="email"
              type="email"
              placeholder="e.g. rahul@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-[#1853DB] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              name="password"
              type="password"
              placeholder="••••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1853DB] hover:bg-blue-700 text-white font-semibold h-11 rounded-xl shadow-sm gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? "Signing In..." : "Log In"}</span>
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-semibold text-[10px]">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleButton next={next} />

        <div className="text-center pt-2 text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#1853DB] font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-xs text-slate-400">Loading login form...</div>}>
      <LoginForm />
    </Suspense>
  );
}
