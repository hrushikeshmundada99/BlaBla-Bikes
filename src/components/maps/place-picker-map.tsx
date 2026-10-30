"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

interface PlacePickerMapProps {
  value?: { lat: number; lng: number };
  onChange: (coords: { lat: number; lng: number }) => void;
  className?: string;
  height?: string;
}

const DynamicPlacePickerMap = dynamic(() => import("./place-picker-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 rounded-2xl bg-slate-100 flex flex-col items-center justify-center gap-3 border border-slate-200">
      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center animate-pulse">
        <MapPin className="w-5 h-5" />
      </div>
      <p className="text-xs text-slate-500 font-medium">Loading interactive Nashik place picker...</p>
      <Skeleton className="w-3/4 h-3 rounded" />
    </div>
  ),
});

export function PlacePickerMap(props: PlacePickerMapProps) {
  return <DynamicPlacePickerMap {...props} />;
}
