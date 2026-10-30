"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password?: string;
  className?: string;
}

export function PasswordStrengthMeter({ password = "", className }: PasswordStrengthMeterProps) {
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (score === 3) return { level: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 4) return { level: 3, label: "Good", color: "bg-blue-500" };
    return { level: 4, label: "Strong", color: "bg-emerald-500" };
  };

  if (!password) return null;

  const { level, label, color } = getStrength(password);

  return (
    <div className={cn("space-y-1.5 mt-2", className)}>
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
        <span>Password Strength:</span>
        <span className={cn(level === 4 ? "text-emerald-600 font-bold" : "")}>{label}</span>
      </div>
      <div className="flex h-1.5 w-full gap-1 rounded-full bg-slate-100 overflow-hidden">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={cn(
              "flex-1 transition-all duration-300",
              step <= level ? color : "bg-slate-200"
            )}
          />
        ))}
      </div>
    </div>
  );
}

