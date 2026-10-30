"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRide } from "@/app/actions/rides";
import { createRideSchema, type CreateRideInput } from "@/lib/validations/rides";
import { PlaceAutocomplete } from "@/components/rides/place-autocomplete";
import { FuelShareCalculator } from "@/components/rides/fuel-share-calculator";
import { RouteMap } from "@/components/maps/route-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, Users, ShieldCheck, Clock, MapPin, AlertCircle, Loader2 } from "lucide-react";

interface OfferRideFormProps {
  riderProfile: {
    helmetAvailable: boolean;
    verification: string;
    bikeModel: string;
  };
  locale: string;
}

export function OfferRideForm({ riderProfile, locale }: OfferRideFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationMinutes: number;
    approximate: boolean;
  } | null>(null);

  // Set idempotency key on client mount to prevent duplicate submissions
  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  // Default departure time = now + 30 minutes, formatted for datetime-local
  const defaultDepart = new Date(Date.now() + 30 * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const defaultDepartStr = `${defaultDepart.getFullYear()}-${pad(defaultDepart.getMonth() + 1)}-${pad(defaultDepart.getDate())}T${pad(defaultDepart.getHours())}:${pad(defaultDepart.getMinutes())}`;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRideInput>({
    resolver: zodResolver(createRideSchema),
    defaultValues: {
      fromPlace: "",
      toPlace: "",
      fromLat: 0,
      fromLng: 0,
      toLat: 0,
      toLng: 0,
      departAt: defaultDepartStr,
      seatsTotal: 1,
      contributionInr: 25,
      helmetAvailable: riderProfile.helmetAvailable ?? true,
      notes: "",
      idempotencyKey: "",
    },
  });

  const fromPlace = watch("fromPlace");
  const toPlace = watch("toPlace");
  const fromLat = watch("fromLat");
  const fromLng = watch("fromLng");
  const toLat = watch("toLat");
  const toLng = watch("toLng");
  const seatsTotal = watch("seatsTotal");
  const contributionInr = watch("contributionInr");
  const helmetAvailable = watch("helmetAvailable");

  const hasBothPlaces = fromLat !== 0 && fromLng !== 0 && toLat !== 0 && toLng !== 0;

  // Fetch estimated route distance and duration when both coordinates are available
  useEffect(() => {
    if (!hasBothPlaces) {
      setRouteInfo(null);
      return;
    }

    let isMounted = true;
    async function fetchRoute() {
      try {
        const res = await fetch(
          `/api/route-distance?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`
        );
        if (res.ok && isMounted) {
          const data = await res.json();
          setRouteInfo(data);
        }
      } catch {
        // Fallback or ignore
      }
    }

    fetchRoute();
    return () => {
      isMounted = false;
    };
  }, [hasBothPlaces, fromLat, fromLng, toLat, toLng]);

  const onSubmit = async (data: CreateRideInput) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await createRide({
        ...data,
        idempotencyKey,
      });

      if (res.error) {
        setFormError(res.error);
        setIsSubmitting(false);
        return;
      }

      if (res.rideId) {
        router.push(`/${locale}/rides/${res.rideId}`);
      } else {
        router.push(`/${locale}/rides/my`);
      }
    } catch {
      setFormError("An unexpected error occurred while posting the ride. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to offer ride</p>
            <p className="text-xs text-rose-700 mt-0.5">{formError}</p>
          </div>
        </div>
      )}

      {/* Origin & Destination Section */}
      <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-soft space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#1853DB]" />
            Route & Pickup / Drop Points
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <PlaceAutocomplete
            id="fromPlace"
            label="Pickup Location (Nashik Area / Landmark)"
            value={fromPlace}
            coordinates={fromLat !== 0 ? { lat: fromLat, lng: fromLng } : undefined}
            error={errors.fromPlace?.message}
            onSelect={(place) => {
              setValue("fromPlace", place.name, { shouldValidate: true });
              setValue("fromLat", place.lat, { shouldValidate: true });
              setValue("fromLng", place.lng, { shouldValidate: true });
            }}
          />

          <PlaceAutocomplete
            id="toPlace"
            label="Destination / Drop Location"
            value={toPlace}
            coordinates={toLat !== 0 ? { lat: toLat, lng: toLng } : undefined}
            error={errors.toPlace?.message}
            onSelect={(place) => {
              setValue("toPlace", place.name, { shouldValidate: true });
              setValue("toLat", place.lat, { shouldValidate: true });
              setValue("toLng", place.lng, { shouldValidate: true });
            }}
          />

          {/* Route Map Preview */}
          {hasBothPlaces && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold">Estimated Route & Distance:</span>
                {routeInfo && (
                  <span className="font-medium text-[#1853DB] bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {routeInfo.distanceKm} km · ~{routeInfo.durationMinutes} mins
                    {routeInfo.approximate && " (approx)"}
                  </span>
                )}
              </div>
              <RouteMap
                from={{ lat: fromLat, lng: fromLng, name: fromPlace }}
                to={{ lat: toLat, lng: toLng, name: toPlace }}
                height="240px"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date, Time & Pillion Capacity */}
      <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-soft space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1853DB]" />
            Departure & Pillion Seat Sharing
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="departAt" className="text-xs font-semibold text-slate-700">
              Departure Date & Time (IST) <span className="text-rose-500">*</span>
            </label>
            <Input
              id="departAt"
              type="datetime-local"
              {...register("departAt")}
              className="h-11 rounded-xl border-slate-200 bg-white shadow-none focus-visible:ring-[#1853DB]"
            />
            {errors.departAt && (
              <p className="text-xs text-rose-500 font-medium">{errors.departAt.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="seatsTotal" className="text-xs font-semibold text-slate-700">
              Empty Seats Offered <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setValue("seatsTotal", num, { shouldValidate: true })}
                  className={`h-11 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    seatsTotal === num
                      ? "border-[#1853DB] bg-blue-50/70 text-[#1853DB] ring-2 ring-blue-100"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{num} {num === 1 ? "Seat" : "Seats"}</span>
                </button>
              ))}
            </div>
            {errors.seatsTotal && (
              <p className="text-xs text-rose-500 font-medium">{errors.seatsTotal.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fuel Cost-Sharing Calculator */}
      <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-soft space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bike className="w-5 h-5 text-emerald-600" />
            Fuel Contribution & Helmet
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <FuelShareCalculator
            distanceKm={routeInfo?.distanceKm || 0}
            passengers={seatsTotal}
            value={contributionInr}
            onChange={(val) => setValue("contributionInr", val, { shouldValidate: true })}
            error={errors.contributionInr?.message}
          />

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Spare Helmet Available for Passenger
                </p>
                <p className="text-[11px] text-slate-500">
                  Maharashtra Motor Vehicles Act requires helmet for pillion riders.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              id="helmetAvailable"
              checked={helmetAvailable}
              onChange={(e) => setValue("helmetAvailable", e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-[#1853DB] focus:ring-[#1853DB]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="notes" className="text-xs font-semibold text-slate-700">
              Ride Notes & Landmark Instructions (Optional)
            </label>
            <Textarea
              id="notes"
              {...register("notes")}
              maxLength={280}
              placeholder="e.g. Will wait near the Bank of Maharashtra ATM, wearing a black jacket."
              className="rounded-xl border-slate-200 bg-white shadow-none focus-visible:ring-[#1853DB] text-xs resize-none"
              rows={2}
            />
            {errors.notes && (
              <p className="text-xs text-rose-500 font-medium">{errors.notes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Anti-Commercial / Strictly Peer-to-Peer Carpooling Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed space-y-1">
        <p className="font-semibold text-[#1853DB]">Strictly Peer-to-Peer Cost Sharing</p>
        <p className="text-blue-800/90">
          BlaBlaBikes connects Nashik two-wheeler owners traveling on existing daily routes.
          This is strictly private fuel cost-sharing, never a taxi or commercial passenger service.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl bg-[#1853DB] hover:bg-blue-700 text-white font-semibold text-sm shadow-md"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Publishing Ride...
          </span>
        ) : (
          "Offer Ride & Share Fuel"
        )}
      </Button>
    </form>
  );
}
