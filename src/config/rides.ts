/**
 * BlaBlaBikes Ride Configuration & Cost-Sharing Tunables
 * One central configuration for all ride parameters and fuel share suggestions.
 * Note: Riders choose fuel contributions freely. There is NO per-km cap.
 */

export const MAX_CONTRIBUTION_INR = 500; // Sanity ceiling against typos, NOT a pricing rule
export const MIN_CONTRIBUTION_INR = 0; // Free ride allowed
export const MAX_SEATS = 2; // Pillion capacity (max 2 passengers)
export const MIN_SEATS = 1;
export const MIN_LEAD_MINUTES = 15; // Lead time before departure
export const MAX_DAYS_AHEAD = 60; // Max scheduling window
export const DEFAULT_MILEAGE_KMPL = 40; // Typical commuter motorcycle fuel efficiency in km/litre

/**
 * Petrol price baseline in Nashik, Maharashtra (INR per litre).
 * NOTE: Check against current local retail fuel prices before deploying to production.
 */
export const PETROL_PRICE_INR_PER_L = 106.5;

export const SOFT_WARN_MULTIPLIER = 2; // Threshold for soft advisory warning
export const SAME_PLACE_THRESHOLD_M = 300; // Minimum distance between from and to in meters
export const PAGE_SIZE = 10; // Number of rides per page in search
export const SEARCH_RADIUS_KM = 2; // Geofence radius for place match in km
export const TIMEZONE = "Asia/Kolkata"; // Nashik timezone

// Nashik geographic bounding box [minLng, minLat, maxLng, maxLat]
export const NASHIK_BBOX = [73.68, 19.9, 73.9, 20.08] as const;
export const NASHIK_CENTER = { lat: 19.9975, lng: 73.7898 };

/**
 * Fuel-share helper: suggested fuel share estimation.
 * Formula: ceil((distanceKm / DEFAULT_MILEAGE_KMPL * PETROL_PRICE_INR_PER_L) / (passengers + 1))
 * Rounded to the nearest ₹5, minimum ₹5.
 * Guide only, never blocks submission.
 */
export function suggestedShareInr(distanceKm: number, passengers: number = 1): number {
  if (distanceKm <= 0) return 5;
  const totalFuelCost = (distanceKm / DEFAULT_MILEAGE_KMPL) * PETROL_PRICE_INR_PER_L;
  const share = Math.ceil(totalFuelCost / (passengers + 1));
  const rounded = Math.round(share / 5) * 5;
  return Math.max(rounded, 5);
}

/**
 * Check if the chosen contribution triggers a soft advisory warning (above 2x suggestion)
 */
export function isSoftWarning(contributionInr: number, suggestedInr: number): boolean {
  if (contributionInr <= 0 || suggestedInr <= 0) return false;
  return contributionInr > suggestedInr * SOFT_WARN_MULTIPLIER;
}
