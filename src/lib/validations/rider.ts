import { z } from "zod";

export const normalizeRegNumber = (val: string) => val.toUpperCase().replace(/[\s-]/g, "");

// Indian vehicle registration standard format: State Code (2) + District (1-2) + Series (1-3) + Number (4)
// e.g. MH15AB1234, MH15A1234, MH04E1234
const indianVehicleRegRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/;

export const riderOnboardingSchema = z.object({
  bikeModel: z
    .string()
    .trim()
    .min(3, "Bike model must be at least 3 characters")
    .max(100, "Bike model cannot exceed 100 characters"),
  registrationNumber: z
    .string()
    .trim()
    .transform(normalizeRegNumber)
    .refine((val) => indianVehicleRegRegex.test(val), {
      message: "Please enter a valid vehicle registration number (e.g. MH15AB1234)",
    }),
  licenceNumber: z
    .string()
    .trim()
    .min(6, "Licence number must be at least 6 characters")
    .max(30, "Licence number cannot exceed 30 characters"),
  helmetAvailable: z.boolean().default(true),
});

export type RiderOnboardingInput = z.infer<typeof riderOnboardingSchema>;

