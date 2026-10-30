/**
 * Geographic calculation and place normalization helpers for BlaBlaBikes.
 */

import { SAME_PLACE_THRESHOLD_M, NASHIK_BBOX } from "@/config/rides";

/**
 * Calculates Great Circle distance between two points in kilometers using the Haversine formula.
 */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371.0; // Earth mean radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Checks whether two coordinate points are within a given distance threshold (default 300m),
 * meaning they represent effectively the same location.
 */
export function isSamePlace(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  thresholdMeters: number = SAME_PLACE_THRESHOLD_M
): boolean {
  const distanceKm = haversineKm(lat1, lon1, lat2, lon2);
  const distanceMeters = distanceKm * 1000;
  return distanceMeters <= thresholdMeters;
}

/**
 * Checks if a coordinate is within the Nashik city bounding box (with 5km buffer).
 * [minLng, minLat, maxLng, maxLat]
 */
export function isWithinNashikBounds(lat: number, lng: number): boolean {
  const [minLng, minLat, maxLng, maxLat] = NASHIK_BBOX;
  // ~0.05 deg buffer (~5km)
  const buffer = 0.05;
  return (
    lat >= minLat - buffer &&
    lat <= maxLat + buffer &&
    lng >= minLng - buffer &&
    lng <= maxLng + buffer
  );
}

/**
 * Normalizes place search strings:
 * - Lowercase
 * - Trim and collapse multiple spaces
 * - Strip unnecessary punctuation while preserving Devanagari and Latin alphanumeric chars
 */
export function normalizePlaceText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    // Replace punctuation (dots, commas, hyphens, brackets, slashes) with space
    .replace(/[.,\-_/\\()[\]{}|@#!$%^&*+=~`<>?:"';]/g, " ")
    // Collapse consecutive whitespaces
    .replace(/\s+/g, " ")
    .trim();
}
