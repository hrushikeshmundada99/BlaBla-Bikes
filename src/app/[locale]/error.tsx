"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  React.useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
      <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("error")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Something went wrong while loading this page. Please try again.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={() => reset()} variant="default" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          <span>{t("retry")}</span>
        </Button>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
