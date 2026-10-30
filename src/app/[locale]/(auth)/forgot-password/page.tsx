"use client";

import * as React from "react";
import { forgotPasswordAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import { KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await forgotPasswordAction(null, formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to process request.");
    } else {
      setMessage(res.message || "Password reset instructions sent to your email.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset Password</h1>
        <p className="text-xs text-slate-500">
          Enter your email to receive a secure password reset link
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-soft space-y-5">
        {error && (
          <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Link Sent</h3>
            <p className="text-xs text-slate-600">{message}</p>
            <Link
              href="/login"
              className="inline-block mt-2 text-xs font-bold text-[#1853DB] hover:underline"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Account Email
              </label>
              <Input
                name="email"
                type="email"
                placeholder="e.g. rahul@example.com"
                required
                autoComplete="email"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1853DB] hover:bg-blue-700 text-white font-semibold h-11 rounded-xl shadow-sm gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? "Sending Link..." : "Send Reset Link"}</span>
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
