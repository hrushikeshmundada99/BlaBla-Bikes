import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as placesHandler } from "@/app/api/places/route";
import { GET as routeDistanceHandler } from "@/app/api/route-distance/route";
import { NextRequest } from "next/server";

describe("API Routes: Places and Route Distance", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/places", () => {
    it("returns curated Nashik places matching search query (case-insensitive)", async () => {
      const req = new NextRequest("http://localhost:3000/api/places?q=college");
      const res = await placesHandler(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(Array.isArray(data.places)).toBe(true);
      expect(data.places.length).toBeGreaterThan(0);
      expect(data.places[0].name).toContain("College Road");
    });

    it("matches alias 'cbs' to CBS (Central Bus Stand)", async () => {
      const req = new NextRequest("http://localhost:3000/api/places?q=cbs");
      const res = await placesHandler(req);
      const data = await res.json();

      const cbs = data.places.find((p: any) => p.name.includes("CBS"));
      expect(cbs).toBeDefined();
      expect(cbs.source).toBe("curated");
      expect(cbs.latitude).toBeCloseTo(19.9975, 3);
    });

    it("matches Marathi Devanagari queries", async () => {
      const req = new NextRequest("http://localhost:3000/api/places?q=पंचवटी");
      const res = await placesHandler(req);
      const data = await res.json();

      expect(data.places.some((p: any) => p.name.includes("Panchavati"))).toBe(true);
    });

    it("returns empty array for empty or invalid query without errors", async () => {
      const req = new NextRequest("http://localhost:3000/api/places?q=");
      const res = await placesHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.places).toEqual([]);
    });

    it("falls back to curated list only if Photon upstream is unreachable", async () => {
      // Mock fetch to simulate Photon network timeout / error
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network timeout"));

      const req = new NextRequest("http://localhost:3000/api/places?q=satpur");
      const res = await placesHandler(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.places.length).toBeGreaterThan(0);
      expect(data.places[0].name).toContain("Satpur");
    });
  });

  describe("GET /api/route-distance", () => {
    it("validates coordinates and rejects invalid inputs with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/route-distance?fromLat=invalid");
      const res = await routeDistanceHandler(req);
      expect(res.status).toBe(400);
    });

    it("computes fallback Haversine distance with approximate: true when OSRM fails", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("OSRM down"));

      // CBS to Nashik Road Station: ~7.6km straight, * 1.3 ~ 9.9km
      const req = new NextRequest(
        "http://localhost:3000/api/route-distance?fromLat=19.9975&fromLng=73.7898&toLat=19.9535&toLng=73.8447"
      );
      const res = await routeDistanceHandler(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.distanceKm).toBeGreaterThan(8);
      expect(data.distanceKm).toBeLessThan(12);
      expect(data.approximate).toBe(true);
      expect(data.durationMinutes).toBeGreaterThan(0);
    });

    it("returns OSRM distance and marks approximate: false on successful upstream response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: "Ok",
          routes: [{ distance: 5400, duration: 600 }],
        }),
      } as Response);

      const req = new NextRequest(
        "http://localhost:3000/api/route-distance?fromLat=19.9975&fromLng=73.7898&toLat=20.0102&toLng=73.7634"
      );
      const res = await routeDistanceHandler(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.distanceKm).toBe(5.4);
      expect(data.durationMinutes).toBe(10);
      expect(data.approximate).toBe(false);
    });
  });
});
