"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { NashikAutocomplete } from "./nashik-autocomplete";

export function HeroSearch() {
  const t = useTranslations("home");
  const router = useRouter();

  const [fromLocation, setFromLocation] = React.useState("");
  const [toLocation, setToLocation] = React.useState("");
  const [tripDate, setTripDate] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromLocation) params.set("from", fromLocation);
    if (toLocation) params.set("to", toLocation);
    if (tripDate) params.set("date", tripDate);

    router.push(`/rides?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1753DB] via-[#1A57DC] to-[#1E62E6] text-white p-7 sm:p-10 lg:p-12 shadow-[0_8px_30px_rgb(24,83,219,0.18)]">
      <div className="max-w-4xl space-y-2">
        {/* Hero Title matching Image 2 */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug text-white">
          {t("heroTitle")}
        </h1>
        {/* Subtitle matching Image 2 */}
        <p className="text-xs sm:text-sm text-blue-100 font-normal leading-relaxed max-w-2xl pb-6">
          {t("heroSubtitle")}
        </p>
      </div>

      {/* Integrated Search Bar inside Hero matching Image 2 */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-xl shadow-xl flex flex-col lg:flex-row items-stretch overflow-hidden mt-2"
      >
        {/* Column 1: FROM */}
        <div className="flex-1 px-5 py-3 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-center text-left">
          <label
            htmlFor="search-from"
            className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-0.5"
          >
            FROM
          </label>
          <NashikAutocomplete
            id="search-from"
            value={fromLocation}
            onChange={(val) => setFromLocation(val)}
            placeholder="Area or landmark (e.g. CBS)"
          />
        </div>

        {/* Column 2: TO */}
        <div className="flex-1 px-5 py-3 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-center text-left">
          <label
            htmlFor="search-to"
            className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-0.5"
          >
            TO
          </label>
          <NashikAutocomplete
            id="search-to"
            value={toLocation}
            onChange={(val) => setToLocation(val)}
            placeholder="Area or landmark (e.g. Canada Corner)"
          />
        </div>

        {/* Column 3: DATE */}
        <div className="w-full lg:w-52 px-5 py-3 border-b lg:border-b-0 border-slate-200 flex flex-col justify-center text-left relative">
          <label
            htmlFor="search-date"
            className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-0.5"
          >
            DATE
          </label>
          <div className="relative flex items-center justify-between">
            <input
              id="search-date"
              type="date"
              value={tripDate}
              onChange={(e) => setTripDate(e.target.value)}
              className="text-xs sm:text-sm font-medium text-slate-700 outline-none w-full bg-transparent cursor-pointer"
            />
          </div>
        </div>

        {/* Column 4: SEARCH BUTTON */}
        <button
          type="submit"
          className="bg-[#1853DB] hover:bg-[#1546BD] active:scale-[0.99] text-white px-9 py-4 font-semibold text-sm sm:text-base flex items-center justify-center transition-all min-h-[56px]"
        >
          {t("searchButton")}
        </button>
      </form>
    </section>
  );
}
