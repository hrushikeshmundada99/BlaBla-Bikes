import React from "react";
import Link from "next/link";
import { formatRideDateTime } from "@/lib/date-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bike,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Users,
  HardHat,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export interface RideWithRider {
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
  status: string;
  rider: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    bikeModel?: string | null;
    verification?: "approved" | "pending" | "none" | "rejected";
  };
}

interface RideCardProps {
  ride: RideWithRider;
  locale: string;
}

export function RideCard({ ride, locale }: RideCardProps) {
  const { time, date } = formatRideDateTime(ride.departAt, locale);
  const isFree = ride.contributionInr === 0;
  const isApproved = ride.rider.verification === "approved";

  return (
    <Link
      href={`/${locale}/rides/${ride.id}`}
      className="group block rounded-2xl border border-slate-100 bg-white p-5 shadow-soft hover:border-[#1853DB]/40 hover:shadow-md transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        {/* Rider Profile Snapshot */}
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 rounded-xl border border-slate-200">
            <AvatarImage
              src={ride.rider.avatarUrl || undefined}
              alt={ride.rider.fullName}
            />
            <AvatarFallback className="rounded-xl bg-blue-50 text-[#1853DB] font-bold text-sm">
              {ride.rider.fullName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#1853DB] transition-colors">
                {ride.rider.fullName}
              </h4>
              {isApproved ? (
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

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Bike className="w-3.5 h-3.5 text-[#1853DB]" />
                {ride.rider.bikeModel || "Motorcycle"}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Sparkles className="w-3 h-3 text-amber-500" />
                New rider
              </span>
            </div>
          </div>
        </div>

        {/* Departure Time & Contribution */}
        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center">
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {isFree ? "Free" : `₹${ride.contributionInr}`}
            </span>
            {!isFree && (
              <span className="text-[11px] font-medium text-slate-400 block -mt-1">
                fuel share
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1853DB] bg-blue-50 px-2.5 py-1 rounded-lg mt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{time}</span>
            <span className="text-blue-300">·</span>
            <span className="text-slate-600 font-normal">{date}</span>
          </div>
        </div>
      </div>

      {/* Route Journey Path */}
      <div className="pt-4 flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1853DB] ring-4 ring-blue-50" />
          <div className="w-0.5 h-6 bg-slate-200" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-50" />
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          <div>
            <p className="text-xs font-bold text-slate-900 truncate">
              {ride.fromPlace}
            </p>
            <p className="text-[10px] text-slate-400">Pickup Area</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 truncate">
              {ride.toPlace}
            </p>
            <p className="text-[10px] text-slate-400">Drop Area</p>
          </div>
        </div>

        {/* Badges / Seats Left */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            {ride.helmetAvailable && (
              <span
                className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center"
                title="Spare helmet provided by rider"
              >
                <HardHat className="w-4 h-4" />
              </span>
            )}
            <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              {ride.seatsAvailable} {ride.seatsAvailable === 1 ? "seat left" : "seats left"}
            </span>
          </div>

          <span className="text-xs font-medium text-[#1853DB] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 mt-1">
            View Ride
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
