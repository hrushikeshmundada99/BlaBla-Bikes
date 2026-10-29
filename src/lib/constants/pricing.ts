/**
 * Cost-sharing and legal carpooling constants for Nashik, Maharashtra
 * In accordance with Section 66 of the Indian Motor Vehicles Act, 1988,
 * and state guidelines for non-commercial carpooling.
 */

export const PRICING_CONFIG = {
  // Maximum legal fuel-contribution rate per kilometer (in INR)
  // Motorcycle average mileage: ~40-50 km/l, Petrol price: ~₹104-106/l -> Actual fuel cost is ~₹2.10 - ₹2.60 / km
  // ₹4.00/km provides a fair, strictly non-profit ceiling including wear-and-tear share.
  MAX_FUEL_RATE_PER_KM: 4.0,

  // Default suggested fair-share rate
  DEFAULT_SUGGESTED_RATE_PER_KM: 2.5,

  // Minimum fee (base overhead contribution for short trips)
  MIN_CONTRIBUTION_INR: 10,

  // Maximum allowed seats per motorcycle ride
  MIN_SEATS: 1,
  MAX_SEATS: 2,

  // Nashik city geographic bounds [minLng, minLat, maxLng, maxLat]
  NASHIK_BOUNDING_BOX: [73.68, 19.9, 73.9, 20.08] as const,

  // Emergency Hotlines
  POLICE_HOTLINE: "112",
  WOMEN_HELPLINE: "1091",
  AMBULANCE_HOTLINE: "108",
};

/**
 * Calculates Haversine distance in kilometers between two coordinates
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;

  // City road factor (~1.25x straight line distance for winding city roads in Nashik)
  const roadFactor = 1.25;
  return Math.round(straightLine * roadFactor * 10) / 10;
}

/**
 * Calculate the maximum allowed fuel contribution for a trip
 */
export function calculateMaxContribution(distanceKm: number): number {
  return Math.ceil(distanceKm * PRICING_CONFIG.MAX_FUEL_RATE_PER_KM);
}

/**
 * Calculate suggested fuel contribution
 */
export function calculateSuggestedContribution(distanceKm: number): number {
  const calculated = Math.round(
    distanceKm * PRICING_CONFIG.DEFAULT_SUGGESTED_RATE_PER_KM
  );
  return Math.max(calculated, PRICING_CONFIG.MIN_CONTRIBUTION_INR);
}
