"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { NashikAutocomplete } from "./nashik-autocomplete";
import { Calendar, Search, ArrowRightLeft, Fuel } from "lucide-react";

export function HeroSearch() {
  const t = useTranslations("home");
  const commonT = useTranslations("common");
  const router = useRouter();

  const [fromLocation, setFromLocation] = React.useState("");
  const [toLocation, setToLocation] = React.useState("");
  const [tripDate, setTripDate] = React.useState(
    () => new Date().toISOString().split("T")[0]
  );

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromLocation) params.set("from", fromLocation);
    if (toLocation) params.set("to", toLocation);
    if (tripDate) params.set("date", tripDate);

    router.push(`/rides/find?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white p-6 sm:p-10 lg:p-12 shadow-card">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-900/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
        {/* Cost-sharing Trust Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-50 shadow-inner">
          <Fuel className="w-3.5 h-3.5 text-blue-200" />
          <span>{commonT("costSharingOnly")}</span>
          <span className="w-1 h-1 rounded-full bg-blue-300" />
          <span className="text-blue-200">Nashik City</span>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
          {t("heroTitle")}
        </h1>
        <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
          {t("heroSubtitle")}
        </p>

        {/* Search Bar Container */}
        <div className="pt-4">
          <form
            onSubmit={handleSearch}
            className="p-3 sm:p-4 rounded-2xl bg-white text-slate-900 shadow-2xl border border-white/20 flex flex-col lg:flex-row items-center gap-3"
          >
            {/* From Location */}
            <div className="w-full lg:flex-1">
              <label
                htmlFor="search-from"
                className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left pl-1 mb-1"
              >
                {t("searchFrom")}
              </label>
              <NashikAutocomplete
                id="search-from"
                value={fromLocation}
                onChange={(val) => setFromLocation(val)}
                placeholder="e.g. CBS / College Road"
                icon="from"
              />
            </div>

            {/* Swap Button (desktop) */}
            <div className="hidden lg:flex items-center pt-5">
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap pickup and destination"
                className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* To Location */}
            <div className="w-full lg:flex-1">
              <label
                htmlFor="search-to"
                className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left pl-1 mb-1"
              >
                {t("searchTo")}
              </label>
              <NashikAutocomplete
                id="search-to"
                value={toLocation}
                onChange={(val) => setToLocation(val)}
                placeholder="e.g. Nashik Road / Satpur"
                icon="to"
              />
            </div>

            {/* Date Input */}
            <div className="w-full lg:w-44">
              <label
                htmlFor="search-date"
                className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left pl-1 mb-1"
              >
                {t("searchDate")}
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="search-date"
                  type="date"
                  value={tripDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setTripDate(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3.5 py-2 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Search Submit Button */}
            <div className="w-full lg:w-auto lg:pt-5">
              <Button
                type="submit"
                size="lg"
                className="w-full lg:w-auto h-12 px-7 rounded-xl font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{t("searchButton")}</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Quick popular tags */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-blue-100">
          <span className="font-semibold text-blue-200">Daily Hubs:</span>
          {["CBS", "College Road", "Nashik Road", "Panchavati", "Satpur MIDC"].map(
            (hub) => (
              <button
                key={hub}
                type="button"
                onClick={() => setFromLocation(hub)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors border border-white/10"
              >
                {hub}
              </button>
            )
          )}
        </div>
      </div>
    </section>
  );
}
