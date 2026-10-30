import React from "react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getRideById } from "@/app/actions/rides";
import { formatRideDateTime } from "@/lib/date-utils";
import { RouteMap } from "@/components/maps/route-map";
import { CancelRideDialog } from "@/components/rides/cancel-ride-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Bike,
  ShieldCheck,
  ShieldAlert,
  Clock,
  HardHat,
  AlertTriangle,
  Edit,
  Shield,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface RideDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: RideDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { title: "Ride Not Found | BlaBlaBikes" };
  }

  const ride = await getRideById(id);
  if (!ride) {
    return { title: "Ride Not Found | BlaBlaBikes" };
  }

  return {
    title: `Ride: ${ride.fromPlace} to ${ride.toPlace} | BlaBlaBikes Nashik`,
    description: `Peer-to-peer bike ride-share from ${ride.fromPlace} to ${ride.toPlace}. Split fuel costs legally across Nashik.`,
  };
}

export default async function RideDetailPage({ params }: RideDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  // Validate UUID to prevent invalid lookups
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const ride = await getRideById(id);
  if (!ride) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === ride.rider.id;
  const isCancelled = ride.status === "cancelled";
  const departDate = new Date(ride.departAt);
  const isPast = departDate < new Date();
  const { date, time } = formatRideDateTime(ride.departAt, locale);
  const isFree = ride.contributionInr === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Cancelled or Past Ride Banners */}
      {isCancelled && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">This ride has been cancelled</p>
            <p className="text-xs text-rose-700 mt-0.5">
              The rider cancelled this departure. It is no longer open for commuters.
            </p>
          </div>
        </div>
      )}

      {!isCancelled && isPast && (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 text-sm flex items-start gap-3">
          <Clock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">This ride has already departed</p>
            <p className="text-xs text-slate-600 mt-0.5">
              Scheduled departure was on {date} at {time}.
            </p>
          </div>
        </div>
      )}

      {/* Header Overview Card */}
      <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Nashik Bike Ride
              </span>
              <Badge
                variant="outline"
                className={`text-[11px] font-semibold h-5 px-2 ${
                  isCancelled
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : isPast
                    ? "border-slate-200 bg-slate-50 text-slate-600"
                    : ride.seatsAvailable === 0
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {isCancelled
                  ? "Cancelled"
                  : isPast
                  ? "Completed"
                  : ride.seatsAvailable === 0
                  ? "Full"
                  : "Open"}
              </Badge>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {ride.fromPlace} → {ride.toPlace}
            </h1>
          </div>

          <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center">
            <div className="text-right">
              <span className="text-3xl font-black text-slate-900">
                {isFree ? "Free" : `₹${ride.contributionInr}`}
              </span>
              {!isFree && (
                <span className="text-xs font-medium text-slate-400 block -mt-1">
                  fuel share / seat
                </span>
              )}
            </div>

            {isOwner && !isCancelled && !isPast && (
              <div className="flex items-center gap-2 mt-2">
                <Link href={`/${locale}/rides/${ride.id}/edit`}>
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl gap-1">
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </Link>
                <CancelRideDialog rideId={ride.id} locale={locale} />
              </div>
            )}
          </div>
        </div>

        {/* Departure Time & Distance Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Date</span>
            <span className="font-bold text-slate-800 text-sm">{date}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Departure Time</span>
            <span className="font-bold text-[#1853DB] text-sm">{time} (IST)</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Est. Distance</span>
            <span className="font-bold text-slate-800 text-sm">{ride.distanceKm} km</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Pillion Seats</span>
            <span className="font-bold text-slate-800 text-sm">
              {ride.seatsAvailable} of {ride.seatsTotal} available
            </span>
          </div>
        </div>

        {/* Route Map */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Route Map (Nashik City)
          </h3>
          <RouteMap
            from={{ lat: ride.fromLat, lng: ride.fromLng, name: ride.fromPlace }}
            to={{ lat: ride.toLat, lng: ride.toLng, name: ride.toPlace }}
            height="320px"
          />
        </div>

        {/* Pickup and Drop Details */}
        <div className="pt-2 flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#1853DB] ring-4 ring-blue-50" />
            <div className="w-0.5 h-12 bg-slate-200" />
            <div className="w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-50" />
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Pickup Point</p>
              <p className="text-sm font-bold text-slate-900">{ride.fromPlace}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Drop Destination</p>
              <p className="text-sm font-bold text-slate-900">{ride.toPlace}</p>
            </div>
          </div>
        </div>

        {/* Ride Notes */}
        {ride.notes && (
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-1">
            <span className="font-bold text-[#1853DB]">Rider Instructions & Notes:</span>
            <p className="text-slate-700 leading-relaxed">{ride.notes}</p>
          </div>
        )}
      </Card>

      {/* Rider Profile Snapshot */}
      <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-soft space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Rider Details
        </h3>

        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 rounded-2xl border border-slate-200">
            <AvatarImage src={ride.rider.avatarUrl || undefined} alt={ride.rider.fullName} />
            <AvatarFallback className="rounded-2xl bg-blue-50 text-[#1853DB] font-bold text-base">
              {ride.rider.fullName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{ride.rider.fullName}</h2>
              {ride.rider.verification === "approved" ? (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] gap-1 font-semibold border-emerald-200 bg-emerald-50 text-emerald-700"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified rider
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] gap-1 font-semibold border-slate-200 bg-slate-50 text-slate-600"
                >
                  <ShieldAlert className="w-3 h-3 text-slate-400" />
                  Unverified rider
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Bike className="w-3.5 h-3.5 text-[#1853DB]" />
                {ride.rider.bikeModel || "Motorcycle"}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Sparkles className="w-3 h-3 text-amber-500" />
                New rider
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <HardHat className="w-4 h-4 text-emerald-600" />
            <span>
              {ride.helmetAvailable
                ? "Spare helmet provided by rider"
                : "Passenger must bring own helmet"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-[#1853DB]" />
            <span>Strictly non-commercial carpooling</span>
          </div>
        </div>
      </Card>

      {/* Safety Tips Block */}
      <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-soft space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Commuter Safety in Nashik</span>
        </div>

        <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">1.</span>
            <span>
              <strong>Helmet Mandatory:</strong> Pillion riders are legally required to wear a certified ISI helmet on all Nashik roads as per the Motor Vehicles Act.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">2.</span>
            <span>
              <strong>Confirm Details:</strong> Always verify the rider&apos;s bike model and pickup spot at known public landmarks before boarding.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">3.</span>
            <span>
              <strong>Emergency Assistance:</strong> Police Helpline <strong>112</strong> · Women Helpline <strong>1091</strong> · Ambulance <strong>108</strong>.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
