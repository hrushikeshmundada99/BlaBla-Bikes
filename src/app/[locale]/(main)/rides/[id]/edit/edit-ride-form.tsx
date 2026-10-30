"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRide } from "@/app/actions/rides";
import { FuelShareCalculator } from "@/components/rides/fuel-share-calculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, Info } from "lucide-react";

interface EditRideFormProps {
  ride: {
    id: string;
    fromPlace: string;
    toPlace: string;
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    departAt: string;
    seatsTotal: number;
    seatsAvailable: number;
    contributionInr: number;
    distanceKm: number;
    notes?: string | null;
    helmetAvailable: boolean;
  };
  isRestricted: boolean; // within 1 hour of departure or has accepted bookings
  locale: string;
}

export function EditRideForm({ ride, isRestricted, locale }: EditRideFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [notes, setNotes] = useState(ride.notes || "");
  const [contributionInr, setContributionInr] = useState(ride.contributionInr);
  const [helmetAvailable, setHelmetAvailable] = useState(ride.helmetAvailable);
  const [departAt, setDepartAt] = useState(() => {
    const d = new Date(ride.departAt);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await updateRide(ride.id, {
      notes,
      ...(isRestricted
        ? {}
        : {
            contributionInr,
            helmetAvailable,
            departAt,
          }),
    });

    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
      return;
    }

    router.push(`/${locale}/rides/${ride.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {isRestricted && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800">Restricted Edit Mode</p>
            <p className="text-amber-700 mt-0.5 leading-relaxed">
              Because departure is within 1 hour or passengers have already joined, the pickup/drop
              route, departure time, and fuel contribution are locked. You may update your ride notes
              and instructions.
            </p>
          </div>
        </div>
      )}

      {/* Fixed Route Information */}
      <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-soft space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-sm font-bold text-slate-800">Route & Distance</CardTitle>
        </CardHeader>
        <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Pickup Location</span>
            <span className="font-bold text-slate-900 text-sm">{ride.fromPlace}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Drop Destination</span>
            <span className="font-bold text-slate-900 text-sm">{ride.toPlace}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Trip Distance</span>
            <span className="font-semibold text-slate-700">{ride.distanceKm} km</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Pillion Capacity</span>
            <span className="font-semibold text-slate-700">{ride.seatsTotal} seats</span>
          </div>
        </CardContent>
      </Card>

      {/* Non-Restricted Fields */}
      {!isRestricted && (
        <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-soft space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-sm font-bold text-slate-800">
              Departure & Fuel Contribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="departAt" className="text-xs font-semibold text-slate-700">
                Departure Date & Time (IST)
              </label>
              <Input
                id="departAt"
                type="datetime-local"
                value={departAt}
                onChange={(e) => setDepartAt(e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white shadow-none focus-visible:ring-[#1853DB]"
              />
            </div>

            <FuelShareCalculator
              distanceKm={ride.distanceKm}
              passengers={ride.seatsTotal}
              value={contributionInr}
              onChange={(val) => setContributionInr(val)}
            />

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-800">Spare Helmet Provided</span>
              <input
                type="checkbox"
                checked={helmetAvailable}
                onChange={(e) => setHelmetAvailable(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-[#1853DB] focus:ring-[#1853DB]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ride Notes */}
      <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-soft space-y-2">
        <label htmlFor="notes" className="text-xs font-semibold text-slate-700">
          Ride Notes & Pickup Instructions (Max 280 characters)
        </label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={280}
          className="rounded-xl border-slate-200 bg-white shadow-none focus-visible:ring-[#1853DB] text-xs resize-none"
          rows={3}
        />
      </Card>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="h-11 rounded-xl text-xs flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-xl bg-[#1853DB] hover:bg-blue-700 text-white font-semibold text-xs flex-1"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving Changes...
            </span>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
