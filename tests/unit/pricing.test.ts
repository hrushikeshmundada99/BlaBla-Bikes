import { describe, it, expect } from "vitest";
import {
  calculateDistanceKm,
  calculateMaxContribution,
  calculateSuggestedContribution,
  PRICING_CONFIG,
} from "@/lib/constants/pricing";

describe("Pricing and Cost-Sharing Calculations", () => {
  it("enforces maximum fuel rate cap of ₹4.00 per km", () => {
    expect(PRICING_CONFIG.MAX_FUEL_RATE_PER_KM).toBe(4.0);
  });

  it("calculates accurate distances between key Nashik landmarks", () => {
    // CBS (19.9975, 73.7898) to Nashik Road Station (19.9535, 73.8447)
    // Straight line ~7.6 km, with city factor ~9.5 km
    const distance = calculateDistanceKm(19.9975, 73.7898, 19.9535, 73.8447);
    expect(distance).toBeGreaterThan(8);
    expect(distance).toBeLessThan(12);
  });

  it("strictly caps maximum contribution at ₹4/km ceiling", () => {
    const distance10km = 10;
    const maxFee = calculateMaxContribution(distance10km);
    expect(maxFee).toBe(40); // 10 * 4 = 40

    const distance15Point5km = 15.5;
    const maxFee15 = calculateMaxContribution(distance15Point5km);
    expect(maxFee15).toBe(62); // 15.5 * 4 = 62
  });

  it("calculates realistic suggested fuel contribution with minimum floor", () => {
    // Short trip: 2 km -> suggested 2 * 2.5 = 5, but minimum floor is ₹10
    const shortTrip = calculateSuggestedContribution(2);
    expect(shortTrip).toBe(PRICING_CONFIG.MIN_CONTRIBUTION_INR);

    // Regular commute: 12 km -> suggested 12 * 2.5 = 30
    const regularTrip = calculateSuggestedContribution(12);
    expect(regularTrip).toBe(30);
    expect(regularTrip).toBeLessThanOrEqual(calculateMaxContribution(12));
  });

  it("restricts seats between 1 and 2 maximum for motorcycles", () => {
    expect(PRICING_CONFIG.MIN_SEATS).toBe(1);
    expect(PRICING_CONFIG.MAX_SEATS).toBe(2);
  });
});

