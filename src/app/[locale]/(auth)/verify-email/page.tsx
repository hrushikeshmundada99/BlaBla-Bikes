"use client";

import * as React from "react";
import { resendVerificationAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { MailCheck, RotateCw, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
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
      setMessage("Verification email has been resent to your inbox.");
    } else {
      setMessage(res.error || "Failed to resend email. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-soft text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1853DB] flex items-center justify-center mx-auto">
          <MailCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Verify Your Email</h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            We sent a verification link to your email address. Please click the link to confirm your account and unlock ride offering and booking.
          </p>
        </div>

        {message && (
          <div className="p-3 rounded-xl bg-blue-50 text-xs font-semibold text-[#1853DB]">
            {message}
          </div>
        )}

        <div className="pt-2 space-y-3">
          <Button
            type="button"
            variant="outline"
            disabled={cooldown > 0 || loading}
            onClick={handleResend}
            className="w-full h-11 rounded-xl text-xs font-semibold gap-2 border-slate-200"
          >
            {loading ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <span>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Link"}</span>
            )}
          </Button>

          <Link href="/dashboard" className="block">
            <Button
              type="button"
              className="w-full h-11 rounded-xl bg-[#1853DB] text-white text-xs font-semibold gap-1.5"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
