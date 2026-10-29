"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Bike, Shield, Heart } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const commonT = useTranslations("common");

  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary-600 text-white">
              <Bike className="w-4 h-4" />
            </div>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {commonT("appName")}
            </span>
            <span className="text-xs text-slate-400">Nashik, MH</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Link
              href="/legal/terms"
              className="hover:text-primary-600 transition-colors"
            >
              {t("terms")}
            </Link>
            <Link
              href="/legal/privacy"
              className="hover:text-primary-600 transition-colors"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/legal/community"
              className="hover:text-primary-600 transition-colors"
            >
              {t("community")}
            </Link>
            <Link
              href="/safety"
              className="hover:text-primary-600 transition-colors flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              {t("safety")}
            </Link>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 text-center sm:text-left">
          <p>© {new Date().getFullYear()} {t("rights")}</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Nashik commuters
          </p>
        </div>
      </div>
    </footer>
  );
}

