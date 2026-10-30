import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { profileSchema, emergencyContactSchema } from "@/lib/validations/profile";
import { riderOnboardingSchema, normalizeRegNumber } from "@/lib/validations/rider";
import { createRideSchema } from "@/lib/validations/rides";

describe("Phase 2 Zod Validations", () => {
  describe("Auth Validation", () => {
    it("rejects passwords under 10 characters", () => {
      const res = signupSchema.safeParse({
        fullName: "Rahul Sharma",
        email: "rahul@example.com",
        password: "Pass1!",
      });
      expect(res.success).toBe(false);
    });

    it("accepts valid passwords with uppercase, lowercase, numbers/symbols and >= 10 chars", () => {
      const res = signupSchema.safeParse({
        fullName: "Rahul Sharma",
        email: "rahul@example.com",
        password: "NashikRide2026!",
      });
      expect(res.success).toBe(true);
    });

    it("validates email addresses properly", () => {
      const res = loginSchema.safeParse({
        email: "invalid-email",
        password: "ValidPassword123!",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("Profile & Indian Phone Validation", () => {
    it("validates 10-digit Indian mobile numbers", () => {
      expect(profileSchema.safeParse({
        fullName: "Amit Shinde",
        phone: "9822011234",
        preferredLanguage: "mr",
      }).success).toBe(true);

      expect(profileSchema.safeParse({
        fullName: "Amit Shinde",
        phone: "+919822011234",
        preferredLanguage: "mr",
      }).success).toBe(true);

      // Invalid format
      expect(profileSchema.safeParse({
        fullName: "Amit Shinde",
        phone: "12345",
        preferredLanguage: "mr",
      }).success).toBe(false);
    });

    it("validates emergency contact schema", () => {
      expect(emergencyContactSchema.safeParse({
        name: "Pooja Patil",
        phone: "9822099999",
      }).success).toBe(true);
    });
  });

  describe("Rider Vehicle Registration Validation", () => {
    it("normalizes and validates Indian MH-15 vehicle registration numbers", () => {
      expect(normalizeRegNumber("mh 15 ab 1234")).toBe("MH15AB1234");
      expect(normalizeRegNumber("MH-15-CD-5678")).toBe("MH15CD5678");

      const valid = riderOnboardingSchema.safeParse({
        bikeModel: "Honda Shine 125",
        registrationNumber: "MH 15 AB 1234",
        licenceNumber: "MH1520180012345",
        helmetAvailable: true,
      });
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.registrationNumber).toBe("MH15AB1234");
      }

      // Invalid format
      const invalid = riderOnboardingSchema.safeParse({
        bikeModel: "Honda Shine",
        registrationNumber: "INVALID123",
        licenceNumber: "LIC12345",
        helmetAvailable: true,
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("Phase 3 Ride Creation Validation", () => {
    const futureValidDepart = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const baseValidInput = {
      fromPlace: "CBS Shalimar",
      toPlace: "Nashik Road Railway Station",
      fromLat: 19.9975,
      fromLng: 73.7898,
      toLat: 19.9535,
      toLng: 73.8447,
      departAt: futureValidDepart,
      seatsTotal: 1,
      contributionInr: 30,
      helmetAvailable: true,
      notes: "Will wait near main entrance.",
    };

    it("accepts valid ride with whole rupee contribution", () => {
      const res = createRideSchema.safeParse(baseValidInput);
      expect(res.success).toBe(true);
    });

    it("accepts free rides (contribution ₹0)", () => {
      const res = createRideSchema.safeParse({
        ...baseValidInput,
        contributionInr: 0,
      });
      expect(res.success).toBe(true);
    });

    it("accepts maximum contribution of ₹500", () => {
      const res = createRideSchema.safeParse({
        ...baseValidInput,
        contributionInr: 500,
      });
      expect(res.success).toBe(true);
    });

    it("rejects contribution above ₹500 or below ₹0", () => {
      expect(
        createRideSchema.safeParse({ ...baseValidInput, contributionInr: 501 }).success
      ).toBe(false);
      expect(
        createRideSchema.safeParse({ ...baseValidInput, contributionInr: -5 }).success
      ).toBe(false);
    });

    it("rejects non-integer contributions (e.g. 12.50)", () => {
      const res = createRideSchema.safeParse({
        ...baseValidInput,
        contributionInr: 12.5,
      });
      expect(res.success).toBe(false);
    });

    it("rejects identical pickup and destination", () => {
      const res = createRideSchema.safeParse({
        ...baseValidInput,
        fromPlace: "CBS Shalimar",
        toPlace: "cbs shalimar",
      });
      expect(res.success).toBe(false);
    });

    it("rejects pickup and destination points within 300 meters", () => {
      // Points ~50 meters apart
      const res = createRideSchema.safeParse({
        ...baseValidInput,
        fromLat: 19.9975,
        fromLng: 73.7898,
        toLat: 19.9977,
        toLng: 73.7899,
      });
      expect(res.success).toBe(false);
    });

    it("restricts pillion seats to 1 or 2 (rejects 0 or 3)", () => {
      expect(createRideSchema.safeParse({ ...baseValidInput, seatsTotal: 0 }).success).toBe(false);
      expect(createRideSchema.safeParse({ ...baseValidInput, seatsTotal: 3 }).success).toBe(false);
      expect(createRideSchema.safeParse({ ...baseValidInput, seatsTotal: 2 }).success).toBe(true);
    });

    it("rejects departures less than 15 minutes ahead or in the past", () => {
      const pastTime = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const tooSoon = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      expect(createRideSchema.safeParse({ ...baseValidInput, departAt: pastTime }).success).toBe(false);
      expect(createRideSchema.safeParse({ ...baseValidInput, departAt: tooSoon }).success).toBe(false);
    });

    it("rejects departures more than 60 days in the future", () => {
      const farFuture = new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString();
      expect(createRideSchema.safeParse({ ...baseValidInput, departAt: farFuture }).success).toBe(false);
    });

    it("accepts Devanagari place names", () => {
      const res = createRideSchema.safeParse({
        ...baseValidInput,
        fromPlace: "सीबीएस (मध्यवर्ती बस स्थानक)",
        toPlace: "कॅनडा कॉर्नर",
      });
      expect(res.success).toBe(true);
    });
  });
});

