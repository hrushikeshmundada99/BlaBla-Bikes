"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Home, Search, PlusCircle, MessageSquare, User } from "lucide-react";

export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const items = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/rides/find", label: t("findRides"), icon: Search },
    {
      href: "/rides/offer",
      label: t("offerRide"),
      icon: PlusCircle,
      highlight: true,
    },
    { href: "/chat", label: t("coordinationChat"), icon: MessageSquare },
    { href: "/profile", label: t("profile"), icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 flex items-center justify-around"
    >
      {items.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-5 group"
            >
              <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 mt-1">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors",
              isActive
                ? "text-primary-600 dark:text-primary-400 font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            )}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium leading-tight truncate max-w-[64px]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
