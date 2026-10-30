"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MAX_CONTRIBUTION_INR } from "@/config/rides";
import { Filter, RotateCcw, ShieldCheck, HardHat, ArrowUpDown } from "lucide-react";

export function RideFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const maxPrice = searchParams.get("maxPrice")
    ? parseInt(searchParams.get("maxPrice")!, 10)
    : MAX_CONTRIBUTION_INR;
  const helmetOnly = searchParams.get("helmet") === "true";
  const verifiedOnly = searchParams.get("verified") === "true";
  const timeWindow = searchParams.get("timeWindow") || "all";
  const sort = searchParams.get("sort") || "earliest";

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "" || (key === "maxPrice" && value === String(MAX_CONTRIBUTION_INR))) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page"); // reset pagination
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    const params = new URLSearchParams();
    if (searchParams.get("from")) params.set("from", searchParams.get("from")!);
    if (searchParams.get("to")) params.set("to", searchParams.get("to")!);
    if (searchParams.get("date")) params.set("date", searchParams.get("date")!);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#1853DB]" />
          <h3 className="font-bold text-sm text-slate-900">Filter Rides</h3>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Sort Option */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          Sort By
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateParam("sort", "earliest")}
            className={`h-9 rounded-xl border text-xs font-semibold transition-all ${
              sort === "earliest"
                ? "border-[#1853DB] bg-blue-50 text-[#1853DB]"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Earliest First
          </button>
          <button
            type="button"
            onClick={() => updateParam("sort", "cheapest")}
            className={`h-9 rounded-xl border text-xs font-semibold transition-all ${
              sort === "cheapest"
                ? "border-[#1853DB] bg-blue-50 text-[#1853DB]"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Lowest Fuel Share
          </button>
        </div>
      </div>

      {/* Time Window Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700">Time of Day</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "all", label: "All Day" },
            { id: "morning", label: "Morning (6 AM - 12 PM)" },
            { id: "afternoon", label: "Afternoon (12 PM - 5 PM)" },
            { id: "evening", label: "Evening (5 PM - 9 PM)" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => updateParam("timeWindow", item.id === "all" ? null : item.id)}
              className={`h-9 px-2 text-left rounded-xl border text-[11px] font-semibold truncate transition-all ${
                timeWindow === item.id
                  ? "border-[#1853DB] bg-blue-50 text-[#1853DB]"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Max Fuel Contribution Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">Max Fuel Share</label>
          <span className="text-xs font-bold text-slate-900">
            {maxPrice >= MAX_CONTRIBUTION_INR ? "Any (₹500)" : `Up to ₹${maxPrice}`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={MAX_CONTRIBUTION_INR}
          step={5}
          value={maxPrice}
          onChange={(e) => updateParam("maxPrice", e.target.value)}
          className="w-full accent-[#1853DB] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>₹0 (Free)</span>
          <span>₹250</span>
          <span>₹500</span>
        </div>
      </div>

      {/* Checkbox Toggles */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <label className="flex items-center justify-between cursor-pointer p-1 rounded-lg hover:bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-slate-700">Verified Riders Only</span>
          </div>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => updateParam("verified", e.target.checked ? "true" : null)}
            className="w-4 h-4 rounded border-slate-300 text-[#1853DB] focus:ring-[#1853DB]"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer p-1 rounded-lg hover:bg-slate-50">
          <div className="flex items-center gap-2">
            <HardHat className="w-4 h-4 text-[#1853DB]" />
            <span className="text-xs font-medium text-slate-700">Helmet Provided</span>
          </div>
          <input
            type="checkbox"
            checked={helmetOnly}
            onChange={(e) => updateParam("helmet", e.target.checked ? "true" : null)}
            className="w-4 h-4 rounded border-slate-300 text-[#1853DB] focus:ring-[#1853DB]"
          />
        </label>
      </div>
    </div>
  );
}
