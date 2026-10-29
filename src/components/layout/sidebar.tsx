"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutDashboard,
  Search,
  Calendar,
  PlusCircle,
  MessageSquare,
  User,
  LogIn,
  UserPlus,
  Fuel,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const mainNav = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/rides/find", label: t("nav.findRides"), icon: Search },
    { href: "/rides/my-rides", label: t("nav.myRides"), icon: Calendar },
  ];

  const riderNav = [
    { href: "/rides/offer", label: t("nav.offerRide"), icon: PlusCircle },
    {
      href: "/chat",
      label: t("nav.coordinationChat"),
      icon: MessageSquare,
      badge: undefined,
    },
    { href: "/profile", label: t("nav.profile"), icon: User },
  ];

  const accountNav = [
    { href: "/login", label: t("nav.login"), icon: LogIn },
    { href: "/register", label: t("nav.signUp"), icon: UserPlus },
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
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between overflow-y-auto p-4",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="space-y-6">
          {/* MAIN SECTION */}
          <div>
            <h4 className="px-3 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">
              {t("nav.mainSection")}
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
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                      active
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        active
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-slate-400"
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
            <h4 className="px-3 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">
              {t("nav.riderSection")}
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
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                      active
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          active
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-slate-400"
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ACCOUNT SECTION */}
          <div>
            <h4 className="px-3 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">
              {t("nav.accountSection")}
            </h4>
            <nav className="space-y-1">
              {accountNav.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                      active
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        active
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-slate-400"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Nashik Safety & Cost-Cap Badge in bottom of sidebar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/40 p-3 border border-blue-100 dark:border-blue-900/60">
            <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300 font-bold text-xs mb-1">
              <Fuel className="w-3.5 h-3.5" />
              <span>Fuel-Share Cap: ₹4/km</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Legally compliant peer-to-peer carpooling for Godavari Valley commuters.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
