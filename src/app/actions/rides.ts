"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  MAX_CONTRIBUTION_INR,
  MIN_CONTRIBUTION_INR,
  MIN_LEAD_MINUTES,
  SEARCH_RADIUS_KM,
  PAGE_SIZE,
} from "@/config/rides";
import { haversineKm, isSamePlace, normalizePlaceText } from "@/lib/geo";
import { getIstDayBounds } from "@/lib/date-utils";
import { checkRateLimit } from "@/lib/ratelimit";
import { type RideWithRider } from "@/components/rides/ride-card";
import { createRideSchema, type CreateRideInput } from "@/lib/validations/rides";

/**
 * Hook invoked when a ride is cancelled.
 * Phase 4 will use this hook to send cancellation notifications/refunds to passengers.
 */
export async function onRideCancelled(rideId: string): Promise<void> {
  // Marked hook function for Phase 4 notification integration
  if (process.env.NODE_ENV === "test" || typeof globalThis !== "undefined") {
    (globalThis as any).__lastCancelledRideId = rideId;
  }
}

/**
 * Server Action: Create a New Ride
 */
export async function createRide(input: CreateRideInput) {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required to offer a ride." };
  }

  // 2. Check email verified
  if (!user.email_confirmed_at) {
    return { error: "Please verify your email address before offering rides." };
  }

  // 3. Verify user profile and rider profile exist and not banned
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_banned")
    .eq("id", user.id)
    .single();

  if (profile?.is_banned) {
    return { error: "Your account is suspended. You cannot offer rides." };
  }

  const { data: riderProfile } = await supabase
    .from("rider_profiles")
    .select("user_id, verification")
    .eq("user_id", user.id)
    .single();

  if (!riderProfile) {
    return {
      error: "You must complete rider onboarding before offering rides.",
      needsRiderOnboarding: true,
    };
  }

  // 4. Rate limit: 10 ride creations per hour per user
  const rateLimit = await checkRateLimit(`create-ride:${user.id}`, 10, 3600);
  if (!rateLimit.success) {
    return { error: "Rate limit reached. You can create up to 10 rides per hour." };
  }

  // 5. Validate input
  const parsed = createRideSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid ride input.";
    return { error: firstError, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const valid = parsed.data;
  const departDate = new Date(valid.departAt);

  // 6. Check for overlapping rides by the same rider (±30 minutes of departure)
  const windowStart = new Date(departDate.getTime() - 30 * 60 * 1000).toISOString();
  const windowEnd = new Date(departDate.getTime() + 30 * 60 * 1000).toISOString();

  const { data: overlapping } = await supabase
    .from("rides")
    .select("id")
    .eq("rider_id", user.id)
    .neq("status", "cancelled")
    .gte("depart_at", windowStart)
    .lte("depart_at", windowEnd)
    .limit(1);

  if (overlapping && overlapping.length > 0) {
    return {
      error: "You already have another ride scheduled within 30 minutes of this departure.",
    };
  }

  // 7. Check idempotency if key provided
  if (valid.idempotencyKey) {
    const { data: existingWithKey } = await supabase
      .from("rides")
      .select("id")
      .eq("rider_id", user.id)
      .eq("idempotency_key", valid.idempotencyKey)
      .maybeSingle();

    if (existingWithKey) {
      return { success: true, rideId: existingWithKey.id };
    }
  }

  // 8. Recompute distance on server (never trust client)
  const straightLine = haversineKm(valid.fromLat, valid.fromLng, valid.toLat, valid.toLng);
  const distanceKm = Math.max(0.5, Math.round(straightLine * 1.3 * 10) / 10);

  // 9. Insert into database
  const { data: newRide, error: insertError } = await supabase
    .from("rides")
    .insert({
      rider_id: user.id,
      from_place: valid.fromPlace,
      to_place: valid.toPlace,
      from_lat: valid.fromLat.toString(),
      from_lng: valid.fromLng.toString(),
      to_lat: valid.toLat.toString(),
      to_lng: valid.toLng.toString(),
      depart_at: departDate.toISOString(),
      seats_total: valid.seatsTotal,
      seats_available: valid.seatsTotal,
      contribution_inr: valid.contributionInr,
      distance_km: distanceKm.toString(),
      notes: valid.notes || null,
      helmet_available: valid.helmetAvailable,
      idempotency_key: valid.idempotencyKey || null,
      status: "open",
    })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505" && valid.idempotencyKey) {
      // Idempotency key collision
      const { data: found } = await supabase
        .from("rides")
        .select("id")
        .eq("rider_id", user.id)
        .eq("idempotency_key", valid.idempotencyKey)
        .single();
      if (found) return { success: true, rideId: found.id };
    }
    return { error: insertError.message || "Failed to create ride." };
  }

  revalidatePath("/rides");
  revalidatePath("/rides/my");
  return { success: true, rideId: newRide.id };
}

/**
 * Server Action: Update Ride Notes & Details
 */
export async function updateRide(
  rideId: string,
  input: {
    notes?: string;
    fromPlace?: string;
    toPlace?: string;
    fromLat?: number;
    fromLng?: number;
    toLat?: number;
    toLng?: number;
    departAt?: string;
    contributionInr?: number;
    helmetAvailable?: boolean;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  // Fetch current ride
  const { data: ride } = await supabase
    .from("rides")
    .select("*")
    .eq("id", rideId)
    .single();

  if (!ride) {
    return { error: "Ride not found." };
  }

  if (ride.rider_id !== user.id) {
    return { error: "Unauthorized. You can only edit your own rides." };
  }

  if (ride.status === "cancelled" || ride.status === "completed") {
    return { error: `Cannot edit a ride that is already ${ride.status}.` };
  }

  const now = new Date();
  const departDate = new Date(ride.depart_at);
  if (departDate < now) {
    return { error: "Cannot edit rides in the past." };
  }

  // Check if within 1 hour of departure or has accepted bookings
  const isWithinOneHour = departDate.getTime() - now.getTime() < 60 * 60 * 1000;

  // Check bookings table
  const { count: acceptedBookingsCount } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("ride_id", rideId)
    .eq("status", "accepted");

  const hasAcceptedBookings = (acceptedBookingsCount ?? 0) > 0;
  const isRestricted = isWithinOneHour || hasAcceptedBookings;

  if (isRestricted) {
    // Only notes can be updated
    const { error: updateError } = await supabase
      .from("rides")
      .update({ notes: input.notes?.slice(0, 280) || null })
      .eq("id", rideId);

    if (updateError) return { error: updateError.message };

    revalidatePath(`/rides/${rideId}`);
    revalidatePath("/rides/my");
    return {
      success: true,
      restricted: true,
      message:
        "Only notes could be updated because departure is within 1 hour or passengers have already joined.",
    };
  }

  // Full update allowed
  const updatePayload: Record<string, any> = {};
  if (input.notes !== undefined) updatePayload.notes = input.notes?.slice(0, 280) || null;
  if (input.helmetAvailable !== undefined) updatePayload.helmet_available = input.helmetAvailable;
  if (input.contributionInr !== undefined) {
    if (
      input.contributionInr < MIN_CONTRIBUTION_INR ||
      input.contributionInr > MAX_CONTRIBUTION_INR
    ) {
      return { error: `Contribution must be between ₹${MIN_CONTRIBUTION_INR} and ₹${MAX_CONTRIBUTION_INR}.` };
    }
    updatePayload.contribution_inr = Math.round(input.contributionInr);
  }

  if (input.departAt) {
    const newDepart = new Date(input.departAt);
    if (newDepart.getTime() - now.getTime() < MIN_LEAD_MINUTES * 60 * 1000) {
      return { error: `Departure must be at least ${MIN_LEAD_MINUTES} minutes ahead.` };
    }
    updatePayload.depart_at = newDepart.toISOString();
  }

  if (input.fromPlace && input.toPlace && input.fromLat && input.fromLng && input.toLat && input.toLng) {
    if (isSamePlace(input.fromLat, input.fromLng, input.toLat, input.toLng)) {
      return { error: "Pickup and drop locations must be different." };
    }
    updatePayload.from_place = input.fromPlace;
    updatePayload.to_place = input.toPlace;
    updatePayload.from_lat = input.fromLat.toString();
    updatePayload.from_lng = input.fromLng.toString();
    updatePayload.to_lat = input.toLat.toString();
    updatePayload.to_lng = input.toLng.toString();

    const distance = Math.max(
      0.5,
      Math.round(haversineKm(input.fromLat, input.fromLng, input.toLat, input.toLng) * 1.3 * 10) / 10
    );
    updatePayload.distance_km = distance.toString();
  }

  const { error: fullUpdateError } = await supabase
    .from("rides")
    .update(updatePayload)
    .eq("id", rideId);

  if (fullUpdateError) return { error: fullUpdateError.message };

  revalidatePath(`/rides/${rideId}`);
  revalidatePath("/rides/my");
  return { success: true };
}

/**
 * Server Action: Cancel a Ride
 */
export async function cancelRide(rideId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  const { data: ride } = await supabase
    .from("rides")
    .select("rider_id, status, depart_at")
    .eq("id", rideId)
    .single();

  if (!ride) {
    return { error: "Ride not found." };
  }

  if (ride.rider_id !== user.id) {
    return { error: "Unauthorized. You can only cancel your own rides." };
  }

  if (ride.status === "cancelled") {
    return { error: "Ride is already cancelled." };
  }

  if (ride.status === "completed") {
    return { error: "Cannot cancel a completed ride." };
  }

  const { error: cancelError } = await supabase
    .from("rides")
    .update({ status: "cancelled" })
    .eq("id", rideId);

  if (cancelError) {
    return { error: cancelError.message };
  }

  // Trigger cancellation hook
  await onRideCancelled(rideId);

  revalidatePath(`/rides/${rideId}`);
  revalidatePath("/rides");
  revalidatePath("/rides/my");
  return { success: true };
}

export interface SearchRidesParams {
  from?: string;
  to?: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  date?: string;
  maxPrice?: number;
  helmet?: boolean;
  verifiedOnly?: boolean;
  timeWindow?: string;
  sort?: "earliest" | "cheapest";
  page?: number;
  pageSize?: number;
}

/**
 * Server Action: Search Rides with Spatial Radius, Date & Filter Matching
 */
export async function searchRides(params: SearchRidesParams): Promise<{
  rides: RideWithRider[];
  total: number;
  hasMore: boolean;
}> {
  const supabase = await createClient();
  const page = params.page || 1;
  const pageSize = params.pageSize || PAGE_SIZE;

  // Base query: open rides with available seats and future departure
  let query = supabase
    .from("rides")
    .select("*")
    .eq("status", "open")
    .gt("seats_available", 0)
    .gte("depart_at", new Date().toISOString());

  // Date filter (Asia/Kolkata day bounds)
  if (params.date && params.date.trim()) {
    const { startIso, endIso } = getIstDayBounds(params.date.trim());
    query = query.gte("depart_at", startIso).lte("depart_at", endIso);
  }

  // Max fuel contribution
  if (params.maxPrice !== undefined && params.maxPrice < MAX_CONTRIBUTION_INR) {
    query = query.lte("contribution_inr", params.maxPrice);
  }

  // Helmet toggle
  if (params.helmet === true) {
    query = query.eq("helmet_available", true);
  }

  // Sorting
  if (params.sort === "cheapest") {
    query = query
      .order("contribution_inr", { ascending: true })
      .order("depart_at", { ascending: true });
  } else {
    query = query.order("depart_at", { ascending: true });
  }

  const { data: rawRides, error } = await query;
  if (error || !rawRides) {
    return { rides: [], total: 0, hasMore: false };
  }

  // In-memory spatial & text matching + time window filter
  const matched = rawRides.filter((ride) => {
    // 1. Origin match
    if (params.fromLat && params.fromLng) {
      const dist = haversineKm(
        params.fromLat,
        params.fromLng,
        Number(ride.from_lat),
        Number(ride.from_lng)
      );
      if (dist > SEARCH_RADIUS_KM) return false;
    } else if (params.from && params.from.trim()) {
      const normQuery = normalizePlaceText(params.from);
      const normPlace = normalizePlaceText(ride.from_place);
      if (!normPlace.includes(normQuery)) return false;
    }

    // 2. Destination match
    if (params.toLat && params.toLng) {
      const dist = haversineKm(
        params.toLat,
        params.toLng,
        Number(ride.to_lat),
        Number(ride.to_lng)
      );
      if (dist > SEARCH_RADIUS_KM) return false;
    } else if (params.to && params.to.trim()) {
      const normQuery = normalizePlaceText(params.to);
      const normPlace = normalizePlaceText(ride.to_place);
      if (!normPlace.includes(normQuery)) return false;
    }

    // 3. Time Window match (IST hour)
    if (params.timeWindow && params.timeWindow !== "all") {
      const d = new Date(ride.depart_at);
      const istHour = (d.getUTCHours() + 5.5 + (d.getUTCMinutes() >= 30 ? 0.5 : 0)) % 24;
      if (params.timeWindow === "morning" && (istHour < 6 || istHour >= 12)) return false;
      if (params.timeWindow === "afternoon" && (istHour < 12 || istHour >= 17)) return false;
      if (params.timeWindow === "evening" && (istHour < 17 || istHour >= 21)) return false;
      if (params.timeWindow === "late" && istHour >= 6 && istHour < 21) return false;
    }

    return true;
  });

  if (matched.length === 0) {
    return { rides: [], total: 0, hasMore: false };
  }

  // Fetch public profiles & rider profiles
  const riderIds = Array.from(new Set(matched.map((r) => r.rider_id)));

  const [{ data: profiles }, { data: riderProfiles }] = await Promise.all([
    supabase
      .from("public_profiles")
      .select("id, full_name, avatar_url")
      .in("id", riderIds),
    supabase
      .from("public_rider_profiles")
      .select("user_id, bike_model, helmet_available, is_verified")
      .in("user_id", riderIds),
  ]);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
  const riderProfileMap = new Map((riderProfiles || []).map((rp) => [rp.user_id, rp]));

  // Combine and filter verifiedOnly if requested
  const combinedRides: RideWithRider[] = [];
  for (const r of matched) {
    const prof = profileMap.get(r.rider_id);
    const rp = riderProfileMap.get(r.rider_id);

    const isVerified = rp?.is_verified ?? false;
    if (params.verifiedOnly && !isVerified) {
      continue;
    }

    combinedRides.push({
      id: r.id,
      fromPlace: r.from_place,
      toPlace: r.to_place,
      fromLat: Number(r.from_lat),
      fromLng: Number(r.from_lng),
      toLat: Number(r.to_lat),
      toLng: Number(r.to_lng),
      departAt: r.depart_at,
      seatsTotal: r.seats_total,
      seatsAvailable: r.seats_available,
      contributionInr: r.contribution_inr,
      distanceKm: Number(r.distance_km),
      notes: r.notes,
      helmetAvailable: r.helmet_available,
      status: r.status,
      rider: {
        id: r.rider_id,
        fullName: prof?.full_name || "Nashik Commuter",
        avatarUrl: prof?.avatar_url || null,
        bikeModel: rp?.bike_model || "Motorcycle",
        verification: isVerified ? "approved" : "none",
      },
    });
  }

  const total = combinedRides.length;
  const start = (page - 1) * pageSize;
  const paginated = combinedRides.slice(start, start + pageSize);

  return {
    rides: paginated,
    total,
    hasMore: start + pageSize < total,
  };
}

/**
 * Server Action: Get Individual Ride By ID
 */
export async function getRideById(rideId: string): Promise<RideWithRider | null> {
  const supabase = await createClient();

  const { data: r, error } = await supabase
    .from("rides")
    .select("*")
    .eq("id", rideId)
    .single();

  if (error || !r) return null;

  const [{ data: prof }, { data: rp }] = await Promise.all([
    supabase
      .from("public_profiles")
      .select("id, full_name, avatar_url, bio")
      .eq("id", r.rider_id)
      .maybeSingle(),
    supabase
      .from("public_rider_profiles")
      .select("user_id, bike_model, helmet_available, is_verified")
      .eq("user_id", r.rider_id)
      .maybeSingle(),
  ]);

  return {
    id: r.id,
    fromPlace: r.from_place,
    toPlace: r.to_place,
    fromLat: Number(r.from_lat),
    fromLng: Number(r.from_lng),
    toLat: Number(r.to_lat),
    toLng: Number(r.to_lng),
    departAt: r.depart_at,
    seatsTotal: r.seats_total,
    seatsAvailable: r.seats_available,
    contributionInr: r.contribution_inr,
    distanceKm: Number(r.distance_km),
    notes: r.notes,
    helmetAvailable: r.helmet_available,
    status: r.status,
    rider: {
      id: r.rider_id,
      fullName: prof?.full_name || "Nashik Commuter",
      avatarUrl: prof?.avatar_url || null,
      bikeModel: rp?.bike_model || "Motorcycle",
      verification: rp?.is_verified ? "approved" : "none",
    },
  };
}
