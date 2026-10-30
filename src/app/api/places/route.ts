import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { NASHIK_CURATED_PLACES } from "@/data/nashik-places";
import { normalizePlaceText, isSamePlace } from "@/lib/geo";
import { checkRateLimit } from "@/lib/ratelimit";

export interface PlaceResult {
  id: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  source: "curated" | "photon";
  description?: string;
}

// In-memory LRU-like cache (10 min TTL, max 500 entries)
interface CacheEntry {
  data: PlaceResult[];
  expiresAt: number;
}

const placesCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_ENTRIES = 500;

function getCached(key: string): PlaceResult[] | null {
  const entry = placesCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    placesCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key: string, data: PlaceResult[]) {
  if (placesCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = placesCache.keys().next().value;
    if (firstKey) placesCache.delete(firstKey);
  }
  placesCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

const querySchema = z.object({
  q: z.string().trim().min(1).max(100),
});

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // Rate limit: 30 requests per minute per IP
  const rateLimit = await checkRateLimit(`places:${ip}`, 30, 60);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  const { searchParams } = request.nextUrl;
  const rawQ = searchParams.get("q") || "";

  const parsed = querySchema.safeParse({ q: rawQ });
  if (!parsed.success) {
    return NextResponse.json({ places: [] });
  }

  const query = parsed.data.q;
  const normalizedQuery = normalizePlaceText(query);
  if (!normalizedQuery) {
    return NextResponse.json({ places: [] });
  }

  const cacheKey = normalizedQuery;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({ places: cached });
  }

  const results: PlaceResult[] = [];

  // 1. Search Curated Nashik Places
  for (const place of NASHIK_CURATED_PLACES) {
    const matchName = normalizePlaceText(place.name).includes(normalizedQuery);
    const matchHi = normalizePlaceText(place.nameHi).includes(normalizedQuery);
    const matchMr = normalizePlaceText(place.nameMr).includes(normalizedQuery);
    const matchAlias = place.aliases.some((alias) =>
      normalizePlaceText(alias).includes(normalizedQuery)
    );

    if (matchName || matchHi || matchMr || matchAlias) {
      results.push({
        id: `curated-${place.id}`,
        name: place.name,
        displayName: `${place.name}, Nashik`,
        latitude: place.latitude,
        longitude: place.longitude,
        source: "curated",
        description: place.description,
      });
    }
  }

  // 2. Fallback / supplement with Photon geocoding with Nashik bbox bias
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const photonUrl = new URL("https://photon.komoot.io/api/");
    photonUrl.searchParams.set("q", `${query} Nashik`);
    photonUrl.searchParams.set("lat", "19.9975");
    photonUrl.searchParams.set("lon", "73.7898");
    photonUrl.searchParams.set("bbox", "73.68,19.90,73.90,20.08");
    photonUrl.searchParams.set("limit", "6");

    const res = await fetch(photonUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "BlaBlaBikes-Nashik/1.0 (nashik.rideshare@blablabikes.in)",
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.features)) {
        for (const feature of data.features) {
          const coords = feature.geometry?.coordinates;
          if (!coords || coords.length < 2) continue;
          const [lng, lat] = coords;
          const props = feature.properties || {};
          const name = props.name || props.street || props.district || query;

          // De-duplicate against already matched curated places
          const isDuplicate = results.some((existing) =>
            isSamePlace(existing.latitude, existing.longitude, lat, lng, 300)
          );

          if (!isDuplicate) {
            results.push({
              id: `photon-${lat}-${lng}`,
              name,
              displayName: [name, props.city || "Nashik"].filter(Boolean).join(", "),
              latitude: lat,
              longitude: lng,
              source: "photon",
              description: props.district || props.suburb,
            });
          }
        }
      }
    }
  } catch {
    // If Photon fails or times out, safely ignore and return curated results
  }

  // Store in cache
  setCached(cacheKey, results);

  return NextResponse.json({ places: results });
}
