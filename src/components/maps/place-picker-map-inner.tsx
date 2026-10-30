"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createPickerIcon } from "./map-icons";
import { NASHIK_CENTER } from "@/config/rides";
import { isWithinNashikBounds } from "@/lib/geo";
import { AlertCircle, MapPin } from "lucide-react";

interface PlacePickerMapInnerProps {
  value?: { lat: number; lng: number };
  onChange: (coords: { lat: number; lng: number }) => void;
  className?: string;
  height?: string;
}

function MapEventsHandler({
  onPick,
}: {
  onPick: (coords: { lat: number; lng: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

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
  }, [map]);

  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}

export default function PlacePickerMapInner({
  value,
  onChange,
  className = "",
  height = "280px",
}: PlacePickerMapInnerProps) {
  const tileUrl =
    process.env.NEXT_PUBLIC_TILE_URL ||
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution =
    process.env.NEXT_PUBLIC_TILE_ATTRIBUTION ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const [position, setPosition] = useState<{ lat: number; lng: number }>(
    value || NASHIK_CENTER
  );

  useEffect(() => {
    if (value && (value.lat !== position.lat || value.lng !== position.lng)) {
      setPosition(value);
    }
  }, [value, position.lat, position.lng]);

  const pickerIcon = useMemo(() => createPickerIcon(), []);

  const handleDragEnd = (e: L.DragEndEvent) => {
    const marker = e.target as L.Marker;
    const latLng = marker.getLatLng();
    const newCoords = { lat: latLng.lat, lng: latLng.lng };
    setPosition(newCoords);
    onChange(newCoords);
  };

  const handlePick = (newCoords: { lat: number; lng: number }) => {
    setPosition(newCoords);
    onChange(newCoords);
  };

  const isOutside = !isWithinNashikBounds(position.lat, position.lng);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm ${className}`}>
      <div style={{ height }}>
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
          scrollWheelZoom={false}
        >
          <TileLayer url={tileUrl} attribution={attribution} />
          <MapEventsHandler onPick={handlePick} />

          <Marker
            position={[position.lat, position.lng]}
            icon={pickerIcon}
            draggable={true}
            eventHandlers={{
              dragend: handleDragEnd,
            }}
          />
        </MapContainer>
      </div>

      {/* Floating Instructions & Warnings */}
      <div className="absolute top-2 left-2 right-2 z-[400] flex flex-col gap-1 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200/70 text-xs text-slate-700 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Click or drag the pin to set pickup / drop point</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </span>
        </div>

        {isOutside && (
          <div className="bg-amber-50/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-amber-200 text-xs text-amber-800 flex items-center gap-1.5 font-medium pointer-events-auto">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Notice: Point is outside the standard Nashik city boundaries.</span>
          </div>
        )}
      </div>
    </div>
  );
}
