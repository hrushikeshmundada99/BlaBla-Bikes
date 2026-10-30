"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlaceAutocomplete } from "./place-autocomplete";
import { Search, Calendar } from "lucide-react";

interface RideSearchHeaderProps {
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  initialFromLat?: number;
  initialFromLng?: number;
  initialToLat?: number;
  initialToLng?: number;
  locale: string;
}

export function RideSearchHeader({
  initialFrom = "",
  initialTo = "",
  initialDate = "",
  initialFromLat = 0,
  initialFromLng = 0,
  initialToLat = 0,
  initialToLng = 0,
  locale,
}: RideSearchHeaderProps) {
  const router = useRouter();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [fromLat, setFromLat] = useState(initialFromLat);
  const [fromLng, setFromLng] = useState(initialFromLng);
  const [toLat, setToLat] = useState(initialToLat);
  const [toLng, setToLng] = useState(initialToLng);
  const [date, setDate] = useState(initialDate);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from.trim()) params.set("from", from.trim());
    if (to.trim()) params.set("to", to.trim());
    if (fromLat && fromLng) {
      params.set("fromLat", fromLat.toString());
      params.set("fromLng", fromLng.toString());
    }
    if (toLat && toLng) {
      params.set("toLat", toLat.toString());
      params.set("toLng", toLng.toString());
    }
    if (date) params.set("date", date);

    router.push(`/${locale}/rides?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-soft space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <PlaceAutocomplete
          id="search-from"
          label="From (Pickup Area)"
          placeholder="e.g. CBS, College Road, Satpur..."
          value={from}
          coordinates={fromLat !== 0 ? { lat: fromLat, lng: fromLng } : undefined}
          required={false}
          onSelect={(place) => {
            setFrom(place.name);
            setFromLat(place.lat);
            setFromLng(place.lng);
          }}
        />

        <PlaceAutocomplete
          id="search-to"
          label="To (Drop Area)"
          placeholder="e.g. Nashik Road, Panchavati, Dwarka..."
          value={to}
          coordinates={toLat !== 0 ? { lat: toLat, lng: toLng } : undefined}
          required={false}
          onSelect={(place) => {
            setTo(place.name);
            setToLat(place.lat);
            setToLng(place.lng);
          }}
        />

        <div className="space-y-1.5">
          <label htmlFor="search-date" className="text-xs font-semibold text-slate-700">
            Date (IST)
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <Input
              id="search-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 h-11 rounded-xl border-slate-200 bg-white shadow-none focus-visible:ring-[#1853DB]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="h-10 px-6 rounded-xl bg-[#1853DB] hover:bg-blue-700 text-white font-semibold text-xs shadow gap-2"
        >
          <Search className="w-3.5 h-3.5" />
          Find Rides Across Nashik
        </Button>
      </div>
    </form>
  );
}
