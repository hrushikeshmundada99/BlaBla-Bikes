import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { profileSchema, emergencyContactSchema } from "@/lib/validations/profile";
import { riderOnboardingSchema, normalizeRegNumber } from "@/lib/validations/rider";

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
});
