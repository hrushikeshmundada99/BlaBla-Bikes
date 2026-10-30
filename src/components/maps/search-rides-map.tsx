"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import { type RideWithRider } from "@/components/rides/ride-card";

interface SearchRidesMapProps {
  from?: {
    lat: number;
    lng: number;
    name?: string;
  } | null;
  to?: {
    lat: number;
    lng: number;
    name?: string;
  } | null;
  rides: RideWithRider[];
  locale?: string;
  className?: string;
  height?: string;
}

const DynamicSearchRidesMap = dynamic(() => import("./search-rides-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-2xl bg-slate-100 flex flex-col items-center justify-center gap-3 border border-slate-200">
      <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1853DB] flex items-center justify-center animate-pulse">
        <MapPin className="w-5 h-5" />
      </div>
      <p className="text-xs text-slate-500 font-medium">
        Loading Nashik live ride map...
      </p>
      <Skeleton className="w-3/4 h-3 rounded" />
    </div>
  ),
});

export function SearchRidesMap(props: SearchRidesMapProps) {
  return <DynamicSearchRidesMap {...props} />;
}

