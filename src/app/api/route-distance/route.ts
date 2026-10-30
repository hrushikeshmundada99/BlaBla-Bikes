import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { haversineKm } from "@/lib/geo";
import { checkRateLimit } from "@/lib/ratelimit";

interface RouteDistanceResponse {
  distanceKm: number;
  durationMinutes: number;
  approximate: boolean;
}

// In-memory cache for computed routes (10 min TTL)
const routeCache = new Map<string, { data: RouteDistanceResponse; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCachedRoute(key: string): RouteDistanceResponse | null {
  const entry = routeCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    routeCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedRoute(key: string, data: RouteDistanceResponse) {
  if (routeCache.size >= 500) {
    const firstKey = routeCache.keys().next().value;
    if (firstKey) routeCache.delete(firstKey);
  }
  routeCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

const coordsSchema = z.object({
  fromLat: z.coerce.number().min(-90).max(90),
  fromLng: z.coerce.number().min(-180).max(180),
  toLat: z.coerce.number().min(-90).max(90),
  toLng: z.coerce.number().min(-180).max(180),
});

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // Rate limit: 30 requests per minute per IP
  const rateLimit = await checkRateLimit(`route:${ip}`, 30, 60);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  const { searchParams } = request.nextUrl;
  const parsed = coordsSchema.safeParse({
    fromLat: searchParams.get("fromLat"),
    fromLng: searchParams.get("fromLng"),
    toLat: searchParams.get("toLat"),
    toLng: searchParams.get("toLng"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid coordinates provided." },
      { status: 400 }
    );
  }

  const { fromLat, fromLng, toLat, toLng } = parsed.data;

  // Round cache key to 4 decimals (~11m resolution)
  const cacheKey = `${fromLat.toFixed(4)},${fromLng.toFixed(4)}-${toLat.toFixed(4)},${toLng.toFixed(4)}`;
  const cached = getCachedRoute(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  // 1. Try OSRM demo routing engine with 3s timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    // OSRM expects: {longitude},{latitude}
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;

    const res = await fetch(osrmUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BlaBlaBikes-Nashik/1.0 (nashik.rideshare@blablabikes.in)",
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && Array.isArray(data.routes) && data.routes[0]) {
        const route = data.routes[0];
        const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
        const durationMinutes = Math.max(1, Math.round(route.duration / 60));

        const result: RouteDistanceResponse = {
          distanceKm,
          durationMinutes,
          approximate: false,
        };

        setCachedRoute(cacheKey, result);
        return NextResponse.json(result);
      }
    }
  } catch {
    // OSRM failed or timed out; fall through to Haversine fallback
  }

  // 2. Fallback: Haversine distance * 1.3 (city road winding factor in Nashik)
  const straightLine = haversineKm(fromLat, fromLng, toLat, toLng);
  const distanceKm = Math.max(0.5, Math.round(straightLine * 1.3 * 10) / 10);
  // Estimate ~30 km/h average motorcycle city speed
  const durationMinutes = Math.max(2, Math.round((distanceKm / 30) * 60));

  const result: RouteDistanceResponse = {
    distanceKm,
    durationMinutes,
    approximate: true,
  };

  setCachedRoute(cacheKey, result);
  return NextResponse.json(result);
}

