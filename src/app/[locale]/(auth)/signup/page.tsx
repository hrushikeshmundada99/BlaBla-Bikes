"use client";

import * as React from "react";
import { signupAction } from "@/app/actions/auth";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import { UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [loading, setLoading] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const res = await signupAction(null, formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Unable to register. Please try again.");
    } else {
      setSuccess(res.message || "Registration successful! Please check your email.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Account</h1>
        <p className="text-xs text-slate-500">
          Join verified commuters in Nashik for non-commercial ride-sharing
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-soft space-y-5">
        {error && (
          <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Check Your Email</h3>
            <p className="text-xs text-slate-600">{success}</p>
            <Link
              href="/login"
              className="inline-block mt-2 text-xs font-bold text-[#1853DB] hover:underline"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <Input
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  required
                  autoComplete="name"
                />
              </div>

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
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 10 characters"
                  required
                  autoComplete="new-password"
                />
                <PasswordStrengthMeter password={password} />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1853DB] hover:bg-blue-700 text-white font-semibold h-11 rounded-xl shadow-sm gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? "Creating Account..." : "Sign Up"}</span>
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-semibold text-[10px]">
                  Or register with
                </span>
              </div>
            </div>

            <GoogleButton next="/dashboard" />

            <div className="text-center pt-2 text-xs text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1853DB] font-semibold hover:underline">
                Log In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

