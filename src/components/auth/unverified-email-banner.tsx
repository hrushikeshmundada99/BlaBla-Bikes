"use client";

import * as React from "react";
import { resendVerificationAction } from "@/app/actions/auth";
import { AlertCircle, Mail, RotateCw } from "lucide-react";

export function UnverifiedEmailBanner() {
  const [cooldown, setCooldown] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setMessage(null);

    const res = await resendVerificationAction();
    setLoading(false);

    if (res.success) {
      setCooldown(60);
      setMessage("Verification email sent! Check your inbox.");
    } else {
      setMessage(res.error || "Failed to resend. Please try again.");
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <p className="text-xs sm:text-sm font-bold">Email Verification Required</p>
          <p className="text-xs text-amber-700">
            You can browse rides, but must verify your email before offering or requesting a seat.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {message && <span className="text-xs font-semibold text-amber-800">{message}</span>}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-100 text-xs font-bold text-amber-800 disabled:opacity-50 transition-colors shadow-sm shrink-0"
        >
          {loading ? (
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Mail className="w-3.5 h-3.5" />
          )}
          <span>{cooldown > 0 ? `Wait ${cooldown}s` : "Resend Email"}</span>
        </button>
      </div>
    </div>
  );
}

