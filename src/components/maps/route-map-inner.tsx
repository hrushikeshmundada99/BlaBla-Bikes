"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { createOriginIcon, createDestinationIcon } from "./map-icons";
import { NASHIK_CENTER } from "@/config/rides";

interface RouteMapInnerProps {
  from: {
    lat: number;
    lng: number;
    name?: string;
  };
  to: {
    lat: number;
    lng: number;
    name?: string;
  };
  className?: string;
  height?: string;
}

function MapController({
  from,
  to,
  routeCoordinates,
}: {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  routeCoordinates?: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size in case container size changed or just became visible
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Auto-fit bounds along the shortest road path
    if (routeCoordinates && routeCoordinates.length > 1) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else {
      const bounds = L.latLngBounds([
        [from.lat, from.lng],
        [to.lat, to.lng],
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    // Enable scroll-wheel zoom on click, disable on blur/mouseout to avoid hijacking mobile scroll
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
  }, [map, from, to, routeCoordinates]);

  return null;
}

export default function RouteMapInner({
  from,
  to,
  className = "",
  height = "320px",
}: RouteMapInnerProps) {
  const tileUrl =
    process.env.NEXT_PUBLIC_TILE_URL ||
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution =
    process.env.NEXT_PUBLIC_TILE_ATTRIBUTION ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const originIcon = useMemo(() => createOriginIcon(), []);
  const destIcon = useMemo(() => createDestinationIcon(), []);

  const [roadCoordinates, setRoadCoordinates] = useState<[number, number][]>([
    [from.lat, from.lng],
    [to.lat, to.lng],
  ]);

  // Fetch shortest road path
  useEffect(() => {
    const controller = new AbortController();
    fetch(
      `/api/route-distance?fromLat=${from.lat}&fromLng=${from.lng}&toLat=${to.lat}&toLng=${to.lng}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.geometry) && data.geometry.length > 0) {
          setRoadCoordinates(data.geometry);
        }
      })
      .catch(() => {
        // Keeps straight line fallback
      });

    return () => controller.abort();
  }, [from.lat, from.lng, to.lat, to.lng]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={[NASHIK_CENTER.lat, NASHIK_CENTER.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        scrollWheelZoom={false}
      >
        <TileLayer url={tileUrl} attribution={attribution} />
        <MapController from={from} to={to} routeCoordinates={roadCoordinates} />

        <Marker position={[from.lat, from.lng]} icon={originIcon}>
          <Popup>
            <div className="text-xs font-semibold text-slate-800">
              {from.name ? String(from.name) : "Pickup: Origin"}
            </div>
          </Popup>
        </Marker>

        <Marker position={[to.lat, to.lng]} icon={destIcon}>
          <Popup>
            <div className="text-xs font-semibold text-slate-800">
              {to.name ? String(to.name) : "Drop: Destination"}
            </div>
          </Popup>
        </Marker>

        {/* Shortest Road Path: Bold Red Line */}
        {roadCoordinates.length > 0 && (
          <>
            {/* Subtle outer casing */}
            <Polyline
              positions={roadCoordinates}
              pathOptions={{
                color: "#991B1B",
                weight: 8,
                opacity: 0.25,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Bold solid red line along roads */}
            <Polyline
              positions={roadCoordinates}
              pathOptions={{
                color: "#DC2626",
                weight: 5,
                opacity: 0.95,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
