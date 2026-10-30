"use client";

import React, { useState } from "react";
import {
  suggestedShareInr,
  isSoftWarning,
  MAX_CONTRIBUTION_INR,
  MIN_CONTRIBUTION_INR,
  DEFAULT_MILEAGE_KMPL,
  PETROL_PRICE_INR_PER_L,
} from "@/config/rides";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, AlertTriangle, Sparkles } from "lucide-react";

interface FuelShareCalculatorProps {
  distanceKm: number;
  passengers: number;
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export function FuelShareCalculator({
  distanceKm,
  passengers,
  value,
  onChange,
  error,
}: FuelShareCalculatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const suggested = suggestedShareInr(distanceKm, passengers);
  const showSoftWarn = isSoftWarning(value, suggested);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="contributionInr"
            className="text-xs font-semibold text-slate-700"
          >
            Fuel Contribution (₹ per passenger) <span className="text-rose-500">*</span>
          </label>
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setShowTooltip(!showTooltip)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label="How suggested fuel share is calculated"
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            {showTooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl z-50 pointer-events-none">
                <p className="font-semibold text-blue-300 mb-1">
                  How is this estimated?
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Based on trip distance ({distanceKm > 0 ? `${distanceKm} km` : "est."}),
                  typical bike mileage (~{DEFAULT_MILEAGE_KMPL} km/l), and current Nashik
                  petrol price (~₹{PETROL_PRICE_INR_PER_L}/l) shared equally across rider and pillion passengers.
                </p>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-slate-900 rotate-45"></div>
              </div>
            )}
          </div>
        </div>

        {distanceKm > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Suggested: <strong className="text-slate-800">₹{suggested}</strong>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange(suggested)}
              className="h-6 text-[11px] px-2 py-0 border-blue-200 text-[#1853DB] hover:bg-blue-50 gap-1 rounded-md"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              Use Suggestion
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
          ₹
        </span>
        <Input
          id="contributionInr"
          type="number"
          min={MIN_CONTRIBUTION_INR}
          max={MAX_CONTRIBUTION_INR}
          step={1}
          value={isNaN(value) ? "" : value}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            onChange(isNaN(val) ? 0 : val);
          }}
          className="pl-8 pr-20 h-11 rounded-xl border-slate-200 bg-white font-medium text-slate-900 shadow-none focus-visible:ring-[#1853DB]"
          placeholder="e.g. 35 (or 0 for free ride)"
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
          {value === 0 ? "Free ride" : "per passenger"}
        </span>
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      {/* Soft Advisory Warning (Never blocks submit) */}
      {showSoftWarn && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-amber-800">Advisory: </strong>
            This is higher than a typical fuel share for this distance. BlaBlaBikes is strictly
            for sharing fuel costs with fellow commuters, not for commercial profit.
          </div>
        </div>
      )}
    </div>
  );
}
