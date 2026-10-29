"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { NASHIK_PLACES, type NashikPlace } from "@/lib/constants/nashik-places";
import { MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface NashikAutocompleteProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, place?: NashikPlace) => void;
  icon?: "from" | "to";
  className?: string;
}

export function NashikAutocomplete({
  id,
  name,
  placeholder,
  value,
  onChange,
  icon = "from",
  className,
}: NashikAutocompleteProps) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setQuery(value);
  }, [value]);

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

  const getLocalizedName = (place: NashikPlace) => {
    if (locale === "hi") return place.nameHi;
    if (locale === "mr") return place.nameMr;
    return place.name;
  };

  const filteredPlaces = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NASHIK_PLACES.slice(0, 8);
    return NASHIK_PLACES.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.nameHi.toLowerCase().includes(q) ||
        p.nameMr.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const handleSelect = (place: NashikPlace) => {
    const localized = getLocalizedName(place);
    setQuery(localized);
    onChange(localized, place);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          {icon === "from" ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-primary-600 bg-white dark:bg-slate-900" />
          ) : (
            <MapPin className="w-4 h-4 text-red-500" />
          )}
        </div>
        <input
          id={id}
          name={name}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3.5 py-2 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {isOpen && filteredPlaces.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 animate-in fade-in-50 zoom-in-95">
          <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Nashik Landmarks
          </div>
          {filteredPlaces.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => handleSelect(place)}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 text-left rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-primary-950/60 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-primary-500 shrink-0" />
              <div className="flex flex-col">
                <span>{getLocalizedName(place)}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {place.name} • {place.category}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
