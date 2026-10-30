import React from "react";
import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getRideById } from "@/app/actions/rides";
import { EditRideForm } from "./edit-ride-form";

interface EditRidePageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function EditRidePage({ params }: EditRidePageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?next=/${locale}/rides/${id}/edit`);
  }

  const ride = await getRideById(id);
  if (!ride) {
    notFound();
  }

  if (ride.rider.id !== user.id) {
    redirect(`/${locale}/rides/${id}`);
  }

  if (ride.status === "cancelled" || ride.status === "completed") {
    redirect(`/${locale}/rides/${id}`);
  }

  const now = new Date();
  const departDate = new Date(ride.departAt);
  if (departDate < now) {
    redirect(`/${locale}/rides/${id}`);
  }

  const isWithinOneHour = departDate.getTime() - now.getTime() < 60 * 60 * 1000;

  // Check bookings table
  const { count: acceptedBookingsCount } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("ride_id", id)
    .eq("status", "accepted");

  const hasAcceptedBookings = (acceptedBookingsCount ?? 0) > 0;
  const isRestricted = isWithinOneHour || hasAcceptedBookings;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Offered Ride</h1>
        <p className="text-sm text-slate-500">
          Update departure notes and instructions for commuters.
        </p>
      </div>

      <EditRideForm
        ride={ride}
        isRestricted={isRestricted}
        locale={locale}
      />
    </div>
  );
}

