"use client";

import * as React from "react";
import { resetPasswordAction } from "@/app/actions/auth";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/routing";
import { KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
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
    const res = await resetPasswordAction(null, formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to update password.");
    } else {
      setSuccess("Your password has been reset successfully.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Choose New Password</h1>
        <p className="text-xs text-slate-500">
          Enter a new secure password with at least 10 characters
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
            <h3 className="text-sm font-bold text-slate-900">Success!</h3>
            <p className="text-xs text-slate-600">{success}</p>
            <Link
              href="/login"
              className="inline-block mt-2 text-xs font-bold text-[#1853DB] hover:underline"
            >
              Continue to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                New Password
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
              className="w-full bg-[#1853DB] hover:bg-blue-700 text-white font-semibold h-11 rounded-xl shadow-sm gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? "Updating..." : "Update Password"}</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

