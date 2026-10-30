import React from "react";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRideDateTime } from "@/lib/date-utils";
import { CancelRideDialog } from "@/components/rides/cancel-ride-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Clock,
  Calendar,
  Users,
  PlusCircle,
  Eye,
  Edit,
} from "lucide-react";

interface MyRidesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MyRidesPage({ params }: MyRidesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?next=/${locale}/rides/my`);
  }

  // Fetch all rides offered by this user
  const { data: offeredRides } = await supabase
    .from("rides")
    .select("*")
    .eq("rider_id", user.id)
    .order("depart_at", { ascending: false });

  const now = new Date();
  const allRides = offeredRides || [];

  const upcomingRides = allRides.filter(
    (r) => r.status !== "cancelled" && new Date(r.depart_at) >= now
  );

  const pastRides = allRides.filter(
    (r) => r.status === "cancelled" || new Date(r.depart_at) < now
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Rides</h1>
          <p className="text-sm text-slate-500">
            Manage your offered motorcycle carpools and track scheduled departures.
          </p>
        </div>

        <Link href={`/${locale}/offer`}>
          <Button className="h-10 text-xs rounded-xl bg-[#1853DB] hover:bg-blue-700 text-white gap-1.5 shadow">
            <PlusCircle className="w-4 h-4" />
            Offer a New Ride
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="offered" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl h-11 w-full sm:w-auto">
          <TabsTrigger value="offered" className="rounded-lg text-xs font-semibold px-5">
            Offered Rides ({allRides.length})
          </TabsTrigger>
          <TabsTrigger value="requested" className="rounded-lg text-xs font-semibold px-5">
            Requested Rides (0)
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Offered Rides */}
        <TabsContent value="offered" className="space-y-8">
          {/* Upcoming Rides Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1853DB]" />
              Upcoming Scheduled Rides ({upcomingRides.length})
            </h2>

            {upcomingRides.length > 0 ? (
              <div className="space-y-3">
                {upcomingRides.map((ride) => {
                  const { date, time } = formatRideDateTime(ride.depart_at, locale);
                  const isFree = ride.contribution_inr === 0;

                  return (
                    <Card
                      key={ride.id}
                      className="rounded-2xl border-slate-100 bg-white p-5 shadow-soft hover:border-slate-200 transition-all"
                    >
                      <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-semibold h-5 px-1.5 border-emerald-200 bg-emerald-50 text-emerald-700"
                            >
                              {ride.seats_available === 0 ? "Full" : "Open"}
                            </Badge>
                            <span className="text-xs text-slate-400 font-medium">
                              {ride.distance_km} km trip
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 truncate">
                            {ride.from_place} → {ride.to_place}
                          </h3>

                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-[#1853DB]">
                              <Clock className="w-3.5 h-3.5" />
                              {date}, {time}
                            </span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {ride.seats_available} of {ride.seats_total} seats left
                            </span>
                            <span className="font-bold text-slate-800">
                              {isFree ? "Free" : `₹${ride.contribution_inr}`}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <Link href={`/${locale}/rides/${ride.id}`}>
                            <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl gap-1">
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/${locale}/rides/${ride.id}/edit`}>
                            <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl gap-1">
                              <Edit className="w-3.5 h-3.5 text-slate-500" />
                              Edit
                            </Button>
                          </Link>
                          <CancelRideDialog rideId={ride.id} locale={locale} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-slate-100 bg-white text-center space-y-3">
                <EmptyState
                  icon="bike"
                  title="No upcoming rides"
                  description="You don't have any upcoming rides scheduled. Offer an empty seat on your motorcycle and split fuel costs!"
                />
                <Link href={`/${locale}/offer`}>
                  <Button className="h-9 text-xs rounded-xl bg-[#1853DB] hover:bg-blue-700 text-white">
                    Offer a Ride Now
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Past / Cancelled Rides Section */}
          {pastRides.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Past & Cancelled Rides ({pastRides.length})
              </h2>

              <div className="space-y-3 opacity-80">
                {pastRides.map((ride) => {
                  const { date, time } = formatRideDateTime(ride.depart_at, locale);
                  const isCancelled = ride.status === "cancelled";

                  return (
                    <Card key={ride.id} className="rounded-2xl border-slate-100 bg-white p-4 shadow-none">
                      <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold h-5 px-1.5 ${
                                isCancelled
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : "border-slate-200 bg-slate-50 text-slate-600"
                              }`}
                            >
                              {isCancelled ? "Cancelled" : "Completed"}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {date}, {time}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-700">
                            {ride.from_place} → {ride.to_place}
                          </p>
                        </div>

                        <Link href={`/${locale}/rides/${ride.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500">
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Requested Rides (Phase 4 integration placeholder with zero fake data) */}
        <TabsContent value="requested">
          <div className="p-8 rounded-2xl border border-slate-100 bg-white text-center">
            <EmptyState
              icon="search"
              title="Requested Rides"
              description="You have not requested any rides yet. The passenger booking and seat reservation features will be available in Phase 4."
            />
            <Link href={`/${locale}/rides`}>
              <Button variant="outline" className="h-9 text-xs rounded-xl mt-3">
                Browse Available Rides
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
