import { z } from "zod";
import {
  MAX_CONTRIBUTION_INR,
  MIN_CONTRIBUTION_INR,
  MIN_SEATS,
  MAX_SEATS,
  MIN_LEAD_MINUTES,
  MAX_DAYS_AHEAD,
  SAME_PLACE_THRESHOLD_M,
} from "@/config/rides";
import { isSamePlace } from "@/lib/geo";

/**
 * Zod Schema for Ride Creation
 */
export const createRideSchema = z
  .object({
    fromPlace: z.string().trim().min(2, "Pickup location is required").max(150),
    toPlace: z.string().trim().min(2, "Drop location is required").max(150),
    fromLat: z.number().min(-90).max(90),
    fromLng: z.number().min(-180).max(180),
    toLat: z.number().min(-90).max(90),
    toLng: z.number().min(-180).max(180),
    departAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Valid departure date and time required",
    }),
    seatsTotal: z.coerce.number().int().min(MIN_SEATS).max(MAX_SEATS),
    contributionInr: z.coerce
      .number()
      .int("Contribution must be in whole rupees")
      .min(MIN_CONTRIBUTION_INR, `Minimum contribution is ₹${MIN_CONTRIBUTION_INR}`)
      .max(MAX_CONTRIBUTION_INR, `Maximum contribution is ₹${MAX_CONTRIBUTION_INR}`),
    helmetAvailable: z.boolean(),
    notes: z.string().trim().max(280, "Notes cannot exceed 280 characters").optional(),
    idempotencyKey: z.string().trim().max(64).optional(),
  })
  .superRefine((data, ctx) => {
    // 1. Check pickup and drop differ
    if (data.fromPlace.toLowerCase() === data.toPlace.toLowerCase()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toPlace"],
        message: "Pickup and destination places must be different.",
      });
    }

    // 2. Check distance threshold (>300m)
    if (isSamePlace(data.fromLat, data.fromLng, data.toLat, data.toLng, SAME_PLACE_THRESHOLD_M)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toPlace"],
        message: `Pickup and destination are too close (must be at least ${SAME_PLACE_THRESHOLD_M} meters apart).`,
      });
    }

    // 3. Check departure time window
    const departDate = new Date(data.departAt);
    const now = new Date();
    const minLeadTime = new Date(now.getTime() + MIN_LEAD_MINUTES * 60 * 1000);
    const maxFutureTime = new Date(now.getTime() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000);

    if (departDate < minLeadTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["departAt"],
        message: `Departure time must be at least ${MIN_LEAD_MINUTES} minutes from now.`,
      });
    }

    if (departDate > maxFutureTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["departAt"],
        message: `Departure time cannot be more than ${MAX_DAYS_AHEAD} days in advance.`,
      });
    }
  });

export type CreateRideInput = z.infer<typeof createRideSchema>;

