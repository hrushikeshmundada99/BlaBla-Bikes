"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { logoutAction } from "@/app/actions/auth";
import {
  Home,
  LayoutGrid,
  Search,
  Calendar,
  PlusCircle,
  MessageSquare,
  User,
  LogIn,
  LogOut,
  Bike,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(Boolean(data.user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (onClose) onClose();
    await logoutAction();
    setIsLoggedIn(false);
    router.push("/login");
    router.refresh();
  };

  const mainNav = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/dashboard", label: t("dashboard"), icon: LayoutGrid },
    { href: "/rides/find", label: t("findRides"), icon: Search },
    { href: "/rides/my-rides", label: t("myRides"), icon: Calendar },
  ];

  const riderNav = [
    { href: "/rides/offer", label: t("offerRide"), icon: PlusCircle },
    { href: "/onboarding/rider", label: "Rider Verification", icon: Bike },
    { href: "/chat", label: t("coordinationChat"), icon: MessageSquare },
    { href: "/profile", label: t("profile"), icon: User },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container matching Image 2 */}
      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 w-60 border-r border-slate-200/70 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between overflow-y-auto px-4 py-6",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="space-y-6">
          {/* MAIN SECTION */}
          <div>
            <h4 className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
              {t("mainSection")}
            </h4>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      active
                        ? "bg-[#EBF3FF] text-[#1853DB] font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        active ? "text-[#1853DB]" : "text-slate-500"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* RIDER SECTION */}
          <div>
            <h4 className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
              {t("riderSection")}
            </h4>
            <nav className="space-y-1">
              {riderNav.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      active
                        ? "bg-[#EBF3FF] text-[#1853DB] font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        active ? "text-[#1853DB]" : "text-slate-500"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ACCOUNT SECTION */}
          <div>
            <h4 className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
              {t("accountSection")}
            </h4>
            <nav className="space-y-1">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>{t("logout")}</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isLinkActive("/login")
                      ? "bg-[#EBF3FF] text-[#1853DB] font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  <span>Login / Sign Up</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
