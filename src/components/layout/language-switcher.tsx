"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", label: "EN", fullLabel: "English" },
  { code: "hi", label: "हिं", fullLabel: "हिन्दी" },
  { code: "mr", label: "मरा", fullLabel: "मराठी" },
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (locale: "en" | "hi" | "mr") => {
    // Save to cookie for persistence
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    setIsOpen(false);
    router.replace(pathname, { locale });
  };

  const currentLang =
    languages.find((l) => l.code === currentLocale) || languages[0];

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Globe className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
        <span>{currentLang.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-lg z-50 animate-in fade-in-50 zoom-in-95">
          {languages.map((lang) => {
            const isActive = lang.code === currentLocale;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  "flex items-center justify-between w-full px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors text-left",
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <span>{lang.fullLabel}</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">
                  {lang.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

