"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { Bike, Search, PlusCircle, User, Menu, X, ShieldAlert } from "lucide-react";

interface TopBarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function TopBar({ onToggleSidebar, isSidebarOpen }: TopBarProps) {
  const t = useTranslations();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Left: Mobile Toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-700 to-primary-500 text-white shadow-sm group-hover:scale-105 transition-transform">
              <Bike className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                BlaBlaBikes
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Nashik
                </span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-1 hidden sm:inline">
                {t("common.costSharingOnly")}
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Right actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/rides/find"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <Search className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span>{t("nav.findRide")}</span>
          </Link>

          <Link href="/rides/offer" className="hidden sm:inline-block">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 font-semibold gap-1.5 shadow-none"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t("nav.offerRide")}</span>
            </Button>
          </Link>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Menu (Shows "Guest" when logged out) */}
          <div ref={userMenuRef} className="relative inline-block">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-label="User account menu"
              aria-expanded={isUserMenuOpen}
              className="flex items-center gap-2 h-9 pl-2 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-sm"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {t("common.guest")}
              </span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-lg z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    {t("common.guest")}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Nashik Commuter
                  </p>
                </div>
                <Link
                  href="/login"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center w-full px-2.5 py-1.5 text-xs rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center w-full px-2.5 py-1.5 text-xs rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/60 font-semibold transition-colors"
                >
                  {t("nav.signUp")}
                </Link>
                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                <Link
                  href="/safety"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-xs rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                  {t("nav.safety")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
