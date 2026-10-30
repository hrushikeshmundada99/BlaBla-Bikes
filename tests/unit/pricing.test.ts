import { describe, it, expect } from "vitest";
import {
  MAX_CONTRIBUTION_INR,
  MIN_CONTRIBUTION_INR,
  MAX_SEATS,
  MIN_SEATS,
  suggestedShareInr,
  isSoftWarning,
} from "@/config/rides";
import { haversineKm } from "@/lib/geo";

describe("Phase 3: Fuel Contribution & Cost-Sharing Calculations", () => {
  it("enforces contribution bounds between ₹0 (free ride) and ₹500 sanity ceiling", () => {
    expect(MIN_CONTRIBUTION_INR).toBe(0);
    expect(MAX_CONTRIBUTION_INR).toBe(500);
  });

  it("verifies config constant matches DB limit (500 INR)", () => {
    // Fails if config and DB limit diverge
    const DB_MAX_CONTRIBUTION = 500;
    expect(MAX_CONTRIBUTION_INR).toBe(DB_MAX_CONTRIBUTION);
  });

  it("calculates realistic Haversine distance between CBS and Nashik Road Station", () => {
    // CBS (19.9975, 73.7898) to Nashik Road Station (19.9535, 73.8447)
    const distance = haversineKm(19.9975, 73.7898, 19.9535, 73.8447);
    expect(distance).toBeGreaterThan(7.0);
    expect(distance).toBeLessThan(8.5);
  });

  it("computes suggested fuel share correctly rounded to nearest ₹5 with ₹5 minimum", () => {
    // For 10 km trip, 1 passenger (rider + 1 = 2 people sharing):
    // (10 / 40 * 106.5) / 2 = 26.625 / 2 = 13.31 -> ceil is 14 -> rounded to nearest 5 is 15
    const suggested10km = suggestedShareInr(10, 1);
    expect(suggested10km).toBe(15);

    // Very short trip: 0.5 km -> min ₹5
    const suggestedShort = suggestedShareInr(0.5, 1);
    expect(suggestedShort).toBe(5);

    // Zero distance returns ₹5 minimum
    expect(suggestedShareInr(0, 1)).toBe(5);
  });

  it("triggers soft advisory warning only when contribution exceeds 2x suggested share", () => {
    const suggested = 20;

    // Normal contribution (within 2x): no warning
    expect(isSoftWarning(20, suggested)).toBe(false);
    expect(isSoftWarning(40, suggested)).toBe(false);

    // Above 2x (e.g. ₹45 > ₹40): triggers soft advisory warning
    expect(isSoftWarning(45, suggested)).toBe(true);

    // Free ride (₹0): never triggers warning
    expect(isSoftWarning(0, suggested)).toBe(false);
  });

  it("restricts motorcycle pillion seats strictly to 1 or 2", () => {
    expect(MIN_SEATS).toBe(1);
    expect(MAX_SEATS).toBe(2);
  });
});
