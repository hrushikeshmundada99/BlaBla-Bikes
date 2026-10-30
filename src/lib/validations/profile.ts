import { z } from "zod";

const indianPhoneRegex = /^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6789]\d{9}$/;

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must not exceed 60 characters"),
  bio: z
    .string()
    .max(280, "Bio cannot exceed 280 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, "Please enter a valid 10-digit Indian phone number (e.g. 9822012345)")
    .optional()
    .or(z.literal("")),
  preferredLanguage: z.enum(["en", "hi", "mr"]),
});

export const emergencyContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Contact name must be at least 2 characters")
    .max(100, "Contact name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, "Please enter a valid 10-digit Indian phone number"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;

