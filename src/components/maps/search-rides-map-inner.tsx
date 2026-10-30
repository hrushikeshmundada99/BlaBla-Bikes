"use client";

import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  createOriginIcon,
  createDestinationIcon,
  createRidePinIcon,
} from "./map-icons";
import { NASHIK_CENTER } from "@/config/rides";
import { type RideWithRider } from "@/components/rides/ride-card";
import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";

interface SearchRidesMapInnerProps {
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

function MapController({
  from,
  to,
  rides,
}: {
  from?: { lat: number; lng: number } | null;
  to?: { lat: number; lng: number } | null;
  rides: RideWithRider[];
}) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // If both from and to are present, fit bounds to the search route
    if (from && to && from.lat && from.lng && to.lat && to.lng) {
      const bounds = L.latLngBounds([
        [from.lat, from.lng],
        [to.lat, to.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (from && from.lat && from.lng) {
      map.setView([from.lat, from.lng], 14);
    } else if (to && to.lat && to.lng) {
      map.setView([to.lat, to.lng], 14);
    } else if (rides.length > 0) {
      // Fit bounds to include available rides across Nashik
      const points: [number, number][] = rides
        .filter((r) => r.fromLat && r.fromLng)
        .slice(0, 10)
        .map((r) => [r.fromLat, r.fromLng]);

      if (points.length > 1) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } else if (points.length === 1) {
        map.setView(points[0], 13);
      }
    }

    // Scroll wheel zoom enabled on click only
    map.scrollWheelZoom.disable();
    const enableZoom = () => map.scrollWheelZoom.enable();
    const disableZoom = () => map.scrollWheelZoom.disable();

    const container = map.getContainer();
    container.addEventListener("click", enableZoom);
    container.addEventListener("mouseleave", disableZoom);

    return () => {
      clearTimeout(timer);
      container.removeEventListener("click", enableZoom);
      container.removeEventListener("mouseleave", disableZoom);
    };
  }, [map, from, to, rides]);

  return null;
}

export default function SearchRidesMapInner({
  from,
  to,
  rides,
  locale = "en",
  className = "",
  height = "320px",
}: SearchRidesMapInnerProps) {
  const tileUrl =
    process.env.NEXT_PUBLIC_TILE_URL ||
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution =
    process.env.NEXT_PUBLIC_TILE_ATTRIBUTION ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const originIcon = useMemo(() => createOriginIcon(), []);
  const destIcon = useMemo(() => createDestinationIcon(), []);

  const hasRoute = Boolean(
    from && to && from.lat && from.lng && to.lat && to.lng
  );

  const polylinePositions = useMemo<[number, number][]>(() => {
    if (hasRoute && from && to) {
      return [
        [from.lat, from.lng],
        [to.lat, to.lng],
      ];
    }
    return [];
  }, [hasRoute, from, to]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-md ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={[NASHIK_CENTER.lat, NASHIK_CENTER.lng]}
        zoom={12}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        scrollWheelZoom={false}
      >
        <TileLayer url={tileUrl} attribution={attribution} />
        <MapController from={from} to={to} rides={rides} />

        {/* 1. Searched Route: Origin Pin A */}
        {from && from.lat && from.lng && (
          <Marker position={[from.lat, from.lng]} icon={originIcon}>
            <Popup>
              <div className="text-xs font-semibold text-slate-800 p-1">
                <span className="text-[#1853DB] font-bold block mb-0.5">
                  Pickup Search
                </span>
                {from.name || "Selected Pickup"}
              </div>
            </Popup>
          </Marker>
        )}

        {/* 2. Searched Route: Destination Pin B */}
        {to && to.lat && to.lng && (
          <Marker position={[to.lat, to.lng]} icon={destIcon}>
            <Popup>
              <div className="text-xs font-semibold text-slate-800 p-1">
                <span className="text-emerald-600 font-bold block mb-0.5">
                  Destination Drop
                </span>
                {to.name || "Selected Drop"}
              </div>
            </Popup>
          </Marker>
        )}

        {/* 3. Connecting Polyline between searched points */}
        {hasRoute && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: "#1853DB",
              weight: 4,
              opacity: 0.85,
              dashArray: "7, 7",
            }}
          />
        )}

        {/* 4. Available Ride Markers across Nashik */}
        {rides.map((ride) => {
          if (!ride.fromLat || !ride.fromLng) return null;

          return (
            <Marker
              key={ride.id}
              position={[ride.fromLat, ride.fromLng]}
              icon={createRidePinIcon(ride.contributionInr)}
            >
              <Popup>
                <div className="p-1.5 space-y-1.5 min-w-[180px]">
                  <div className="flex items-center justify-between gap-2 border-b pb-1">
                    <span className="font-bold text-xs text-slate-900">
                      {ride.rider.fullName}
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      {ride.contributionInr === 0 ? "Free" : `₹${ride.contributionInr}`}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p className="truncate">
                      <strong>From:</strong> {ride.fromPlace}
                    </p>
                    <p className="truncate">
                      <strong>To:</strong> {ride.toPlace}
                    </p>
                    <p className="text-slate-500">
                      {ride.seatsAvailable} seat(s) available
                    </p>
                  </div>

                  <Link
                    href={`/${locale}/rides/${ride.id}`}
                    className="block text-center text-xs font-semibold text-white bg-[#1853DB] hover:bg-blue-700 py-1 rounded-md transition-colors mt-1"
                  >
                    View Ride
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Status Banner on Top of Map */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-md border border-slate-200/80 text-xs text-slate-800 flex items-center gap-2 pointer-events-auto">
          {hasRoute ? (
            <>
              <Navigation className="w-3.5 h-3.5 text-[#1853DB]" />
              <span className="font-bold text-slate-900">
                {from?.name?.split(",")[0]} → {to?.name?.split(",")[0]}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-[#1853DB] font-medium">
                {rides.length} {rides.length === 1 ? "ride available" : "rides available"}
              </span>
            </>
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5 text-[#1853DB]" />
              <span className="font-semibold text-slate-900">
                Nashik Motorcycle Carpool Network
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600">
                {rides.length} active departures
              </span>
            </>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-slate-500 border border-slate-200 shadow-sm pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-[#1853DB]"></span>
          <span>Click map to zoom</span>
        </div>
      </div>
    </div>
  );
}
