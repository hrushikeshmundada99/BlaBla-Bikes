"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Map } from "lucide-react";
import { type PlaceResult } from "@/app/api/places/route";
import { PlacePickerMap } from "@/components/maps/place-picker-map";

interface PlaceAutocompleteProps {
  id: string;
  label: string;
  value: string;
  coordinates?: { lat: number; lng: number };
  placeholder?: string;
  error?: string;
  onSelect: (place: { name: string; lat: number; lng: number }) => void;
  required?: boolean;
}

export function PlaceAutocomplete({
  id,
  label,
  value,
  coordinates,
  placeholder = "Search area, landmark or chowk...",
  error,
  onSelect,
  required = true,
}: PlaceAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced search (300ms)
  useEffect(() => {
    if (!query || query.trim().length < 1) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.places || []);
          setIsOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPlace = (place: PlaceResult) => {
    setQuery(place.name);
    setIsOpen(false);
    onSelect({
      name: place.name,
      lat: place.latitude,
      lng: place.longitude,
    });
  };

  const handleMapPickerConfirm = (coords: { lat: number; lng: number }) => {
    const formattedName = `${query || "Selected Point"} (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
    setQuery(formattedName);
    onSelect({
      name: formattedName,
      lat: coords.lat,
      lng: coords.lng,
    });
    setShowMapPicker(false);
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowMapPicker(!showMapPicker)}
          className="text-xs text-[#1853DB] hover:underline flex items-center gap-1 font-medium"
        >
          <Map className="w-3.5 h-3.5" />
          {showMapPicker ? "Close Map" : "Pick on Map"}
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <MapPin className="w-4 h-4" />
        </div>
        <Input
          id={id}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="pl-10 pr-9 h-11 rounded-xl border-slate-200 bg-white shadow-none focus-visible:ring-[#1853DB]"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
      </div>

      {coordinates && (
        <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
          <span>✓ Coordinates set ({coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)})</span>
        </p>
      )}

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="relative z-50">
          <ul className="absolute left-0 right-0 top-1 bg-white rounded-xl shadow-lg border border-slate-100 max-h-60 overflow-y-auto divide-y divide-slate-50 py-1">
            {results.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => handleSelectPlace(place)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/50 flex items-start gap-2.5 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-[#1853DB] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {place.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {place.description || place.displayName}
                    </p>
                  </div>
                  {place.source === "curated" && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-[#1853DB] shrink-0">
                      Nashik Hub
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Embedded Map Picker Modal / Drawer */}
      {showMapPicker && (
        <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">Drag marker to exact location</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowMapPicker(false)}
              className="h-7 text-xs"
            >
              Done
            </Button>
          </div>
          <PlacePickerMap
            value={coordinates}
            onChange={(coords) => handleMapPickerConfirm(coords)}
            height="220px"
          />
        </div>
      )}
    </div>
  );
}
