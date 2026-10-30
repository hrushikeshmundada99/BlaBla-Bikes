import { describe, it, expect } from "vitest";
import { haversineKm, isSamePlace, normalizePlaceText, isWithinNashikBounds } from "@/lib/geo";
import { getIstDayBounds } from "@/lib/date-utils";

describe("Geographic & Date Helpers", () => {
  it("calculates accurate Haversine distance", () => {
    // CBS (19.9975, 73.7898) to Canada Corner (20.0019, 73.7801) ~1.12 km
    const dist = haversineKm(19.9975, 73.7898, 20.0019, 73.7801);
    expect(dist).toBeGreaterThan(0.9);
    expect(dist).toBeLessThan(1.5);
  });

  it("identifies points within 300 meters as the same place", () => {
    // Exact same
    expect(isSamePlace(19.9975, 73.7898, 19.9975, 73.7898, 300)).toBe(true);

    // ~50m apart
    expect(isSamePlace(19.9975, 73.7898, 19.9978, 73.7899, 300)).toBe(true);

    // Far apart (> 1 km)
    expect(isSamePlace(19.9975, 73.7898, 20.0102, 73.7634, 300)).toBe(false);
  });

  it("normalizes place search text, handling punctuation, spaces, and Devanagari", () => {
    expect(normalizePlaceText("  C.B.S.  ")).toBe("c b s");
    expect(normalizePlaceText("College-Road, (Nashik)")).toBe("college road nashik");
    expect(normalizePlaceText("कॅनडा    कॉर्नर...")).toBe("कॅनडा कॉर्नर");
  });

  it("validates coordinates against Nashik bounding box", () => {
    // CBS (inside Nashik)
    expect(isWithinNashikBounds(19.9975, 73.7898)).toBe(true);

    // Mumbai / Pune (outside Nashik)
    expect(isWithinNashikBounds(18.5204, 73.8567)).toBe(false);
  });

  it("converts calendar date to exact UTC bounds for Asia/Kolkata (IST midnight)", () => {
    // 2026-10-30 in IST:
    // Start of day in IST (00:00:00 IST) is 2026-10-29 18:30:00 UTC
    // End of day in IST (23:59:59 IST) is 2026-10-30 18:29:59 UTC
    const bounds = getIstDayBounds("2026-10-30");

    expect(bounds.startIso).toBe("2026-10-29T18:30:00.000Z");
    expect(bounds.endIso).toBe("2026-10-30T18:29:59.999Z");
  });
});

