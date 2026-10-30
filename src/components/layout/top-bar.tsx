"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { LanguageSwitcher } from "./language-switcher";
import { createClient } from "@/lib/supabase/client";
import { logoutAction } from "@/app/actions/auth";
import {
  Search,
  PlusCircle,
  ChevronDown,
  Menu,
  X,
  ShieldAlert,
  User,
  LayoutDashboard,
  LogOut,
  Bike,
} from "lucide-react";
import Image from "next/image";

interface TopBarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function TopBar({ onToggleSidebar, isSidebarOpen }: TopBarProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const [user, setUser] = React.useState<{
    id: string;
    email?: string;
    name?: string;
    avatarUrl?: string | null;
  } | null>(null);

  React.useEffect(() => {
    const supabase = createClient();

    // Check initial user
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0],
          avatarUrl: data.user.user_metadata?.avatar_url || null,
        });

        // Also fetch profile avatar if updated
        supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setUser((prev) =>
                prev
                  ? {
                      ...prev,
                      name: profile.full_name || prev.name,
                      avatarUrl: profile.avatar_url || prev.avatarUrl,
                    }
                  : null
              );
            }
          });
      } else {
        setUser(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
          avatarUrl: session.user.user_metadata?.avatar_url || null,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logoutAction();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
        {/* Left: Mobile Toggle + Logo + Nav Links matching Image 2 */}
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* BlaBlaBikes Brand Logo matching Image 2 */}
          <Link href="/" className="flex items-center">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1853DB]">
              BlaBlaBikes
            </span>
          </Link>

          {/* Find a ride link */}
          <Link
            href="/rides/find"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-[#1853DB] transition-colors"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>{t("nav.findRide")}</span>
          </Link>

          {/* Outlined Pill "Offer a ride" button matching Image 2 */}
          <Link href="/rides/offer" className="hidden sm:inline-block">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1853DB] text-[#1853DB] hover:bg-blue-50/70 px-4 py-1.5 text-xs sm:text-sm font-semibold transition-colors">
              <PlusCircle className="w-4 h-4" />
              <span>{t("nav.offerRide")}</span>
            </div>
          </Link>
        </div>

        {/* Right: Help Icon + User Menu ("Guest ⌵" or User) + Language Switcher */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Help Question Mark Circle Icon */}
          <Link
            href="/safety"
            aria-label="Help and Safety"
            className="flex items-center justify-center w-7 h-7 rounded-full bg-[#1853DB] text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span className="text-xs font-bold leading-none">?</span>
          </Link>

          {/* User Menu matching Image 2 */}
          <div ref={userMenuRef} className="relative inline-block">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-label="User account menu"
              aria-expanded={isUserMenuOpen}
              className="flex items-center gap-2 py-1 text-sm font-semibold text-slate-800 hover:text-slate-950 transition-colors"
            >
              {user?.avatarUrl ? (
                <div className="w-6 h-6 rounded-full overflow-hidden relative border border-slate-200">
                  <Image
                    src={user.avatarUrl}
                    alt={user.name || "User"}
                    fill
                    className="object-cover"
                    sizes="24px"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1853DB] flex items-center justify-center text-xs font-bold">
                  {user ? (user.name?.[0] || "U").toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
              )}

              <span className="truncate max-w-[120px]">{user ? user.name : t("common.guest")}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-100 bg-white p-2 shadow-lg z-50 animate-in fade-in-50 zoom-in-95">
                {user ? (
                  <>
                    <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t("nav.dashboard")}</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t("nav.profile")}</span>
                    </Link>

                    <Link
                      href="/onboarding/rider"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                    >
                      <Bike className="w-3.5 h-3.5 text-slate-400" />
                      <span>Rider Verification</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>{t("nav.logout")}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                      <p className="text-xs font-semibold text-slate-900">
                        {t("common.guest")}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Nashik Commuter
                      </p>
                    </div>
                    <Link
                      href="/login"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center w-full px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center w-full px-2.5 py-1.5 text-xs rounded-lg text-[#1853DB] hover:bg-blue-50 font-semibold transition-colors"
                    >
                      {t("nav.signUp")}
                    </Link>
                    <div className="border-t border-slate-100 my-1" />
                    <Link
                      href="/safety"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-xs rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                      {t("nav.safety")}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
