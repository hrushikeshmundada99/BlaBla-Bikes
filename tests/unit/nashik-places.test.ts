import { describe, it, expect } from "vitest";
import { NASHIK_PLACES } from "@/lib/constants/nashik-places";
import { PRICING_CONFIG } from "@/lib/constants/pricing";

describe("Nashik Places Autocomplete Catalog", () => {
  it("contains essential hubs requested (CBS, Canada Corner, College Road, Panchavati, etc.)", () => {
    const ids = NASHIK_PLACES.map((p) => p.id);
    expect(ids).toContain("cbs");
    expect(ids).toContain("canada-corner");
    expect(ids).toContain("college-road");
    expect(ids).toContain("panchavati");
    expect(ids).toContain("satpur");
    expect(ids).toContain("nashik-road");
    expect(ids).toContain("gangapur-road");
    expect(ids).toContain("indira-nagar");
    expect(ids).toContain("dwarka");
    expect(ids).toContain("mumbai-naka");
    expect(ids).toContain("cidco");
    expect(ids).toContain("ambad");
    expect(ids).toContain("deolali-camp");
  });

  it("has complete localized names in English, Hindi, and Marathi for every place", () => {
    for (const place of NASHIK_PLACES) {
      expect(place.name).toBeTruthy();
      expect(place.nameHi).toBeTruthy();
      expect(place.nameMr).toBeTruthy();
      expect(place.nameHi.length).toBeGreaterThan(0);
      expect(place.nameMr.length).toBeGreaterThan(0);
    }
  });

  it("ensures all coordinates fall within the Nashik municipal bounding box", () => {
    const [minLng, minLat, maxLng, maxLat] = PRICING_CONFIG.NASHIK_BOUNDING_BOX;

    for (const place of NASHIK_PLACES) {
      expect(place.longitude).toBeGreaterThanOrEqual(minLng);
      expect(place.longitude).toBeLessThanOrEqual(maxLng);
      expect(place.latitude).toBeGreaterThanOrEqual(minLat);
      expect(place.latitude).toBeLessThanOrEqual(maxLat);
    }
  });
});
