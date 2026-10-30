import React from "react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { searchRides, type SearchRidesParams } from "@/app/actions/rides";
import { RideCard } from "@/components/rides/ride-card";
import { RideSearchHeader } from "@/components/rides/ride-search-header";
import { RideFilterBar } from "@/components/rides/ride-filter-bar";
import { SearchRidesMap } from "@/components/maps/search-rides-map";
import { NASHIK_CURATED_PLACES } from "@/data/nashik-places";
import { normalizePlaceText } from "@/lib/geo";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { PlusCircle, Bike } from "lucide-react";

interface RidesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    from?: string;
    to?: string;
    fromLat?: string;
    fromLng?: string;
    toLat?: string;
    toLng?: string;
    date?: string;
    maxPrice?: string;
    helmet?: string;
    verified?: string;
    timeWindow?: string;
    sort?: string;
    page?: string;
  }>;
}

function findCuratedCoords(placeName?: string): { lat: number; lng: number } | null {
  if (!placeName) return null;
  const q = normalizePlaceText(placeName);
  if (!q) return null;

  for (const p of NASHIK_CURATED_PLACES) {
    if (
      normalizePlaceText(p.name).includes(q) ||
      normalizePlaceText(p.nameHi).includes(q) ||
      normalizePlaceText(p.nameMr).includes(q) ||
      p.aliases.some((a) => normalizePlaceText(a).includes(q))
    ) {
      return { lat: p.latitude, lng: p.longitude };
    }
  }
  return null;
}

export default async function RidesPage({ params, searchParams }: RidesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;

  // Resolve search from/to coordinates (from query params or curated places)
  let resolvedFromLat = sp.fromLat ? parseFloat(sp.fromLat) : undefined;
  let resolvedFromLng = sp.fromLng ? parseFloat(sp.fromLng) : undefined;
  if ((!resolvedFromLat || !resolvedFromLng) && sp.from) {
    const found = findCuratedCoords(sp.from);
    if (found) {
      resolvedFromLat = found.lat;
      resolvedFromLng = found.lng;
    }
  }

  let resolvedToLat = sp.toLat ? parseFloat(sp.toLat) : undefined;
  let resolvedToLng = sp.toLng ? parseFloat(sp.toLng) : undefined;
  if ((!resolvedToLat || !resolvedToLng) && sp.to) {
    const found = findCuratedCoords(sp.to);
    if (found) {
      resolvedToLat = found.lat;
      resolvedToLng = found.lng;
    }
  }

  const fromPoint =
    resolvedFromLat && resolvedFromLng
      ? { lat: resolvedFromLat, lng: resolvedFromLng, name: sp.from || "Pickup" }
      : null;

  const toPoint =
    resolvedToLat && resolvedToLng
      ? { lat: resolvedToLat, lng: resolvedToLng, name: sp.to || "Destination" }
      : null;

  const queryParams: SearchRidesParams = {
    from: sp.from,
    to: sp.to,
    fromLat: resolvedFromLat,
    fromLng: resolvedFromLng,
    toLat: resolvedToLat,
    toLng: resolvedToLng,
    date: sp.date,
    maxPrice: sp.maxPrice ? parseInt(sp.maxPrice, 10) : undefined,
    helmet: sp.helmet === "true",
    verifiedOnly: sp.verified === "true",
    timeWindow: sp.timeWindow,
    sort: sp.sort === "cheapest" ? "cheapest" : "earliest",
    page,
    pageSize: 10,
  };

  const { rides, total, hasMore } = await searchRides(queryParams);

  // Helper for pagination link
  const createPageUrl = (newPage: number) => {
    const urlParams = new URLSearchParams();
    if (sp.from) urlParams.set("from", sp.from);
    if (sp.to) urlParams.set("to", sp.to);
    if (sp.fromLat) urlParams.set("fromLat", sp.fromLat);
    if (sp.fromLng) urlParams.set("fromLng", sp.fromLng);
    if (sp.toLat) urlParams.set("toLat", sp.toLat);
    if (sp.toLng) urlParams.set("toLng", sp.toLng);
    if (sp.date) urlParams.set("date", sp.date);
    if (sp.maxPrice) urlParams.set("maxPrice", sp.maxPrice);
    if (sp.helmet) urlParams.set("helmet", sp.helmet);
    if (sp.verified) urlParams.set("verified", sp.verified);
    if (sp.timeWindow) urlParams.set("timeWindow", sp.timeWindow);
    if (sp.sort) urlParams.set("sort", sp.sort);
    urlParams.set("page", newPage.toString());
    return `/${locale}/rides?${urlParams.toString()}`;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Find Bike Rides Across Nashik</h1>
        <p className="text-sm text-slate-500 mb-4">
          Connect with verified motorcycle owners heading your way and share fuel costs.
        </p>

        <RideSearchHeader
          initialFrom={sp.from || ""}
          initialTo={sp.to || ""}
          initialDate={sp.date || ""}
          initialFromLat={resolvedFromLat || 0}
          initialFromLng={resolvedFromLng || 0}
          initialToLat={resolvedToLat || 0}
          initialToLng={resolvedToLng || 0}
          locale={locale}
        />
      </div>

      {/* Main Grid: Filters + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Filter Bar */}
        <div className="lg:col-span-1">
          <RideFilterBar />
        </div>

        {/* Right Column: Map + Ride Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Leaflet Map: connects the two locations when searched, shows route & ride markers */}
          <SearchRidesMap
            from={fromPoint}
            to={toPoint}
            rides={rides}
            locale={locale}
            height="340px"
          />

          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-800">
              {total} {total === 1 ? "Ride Available" : "Rides Available"}
              {sp.from && sp.to && (
                <span className="font-normal text-slate-500">
                  {" "}near {sp.from} → {sp.to}
                </span>
              )}
            </h2>

            <Link
              href={`/${locale}/offer`}
              className="text-xs font-semibold text-[#1853DB] hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Going somewhere? Offer a ride
            </Link>
          </div>

          {rides.length > 0 ? (
            <div className="space-y-3">
              {rides.map((ride) => (
                <RideCard key={ride.id} ride={ride} locale={locale} />
              ))}

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total} rides
                </span>

                <div className="flex items-center gap-2">
                  {page > 1 && (
                    <Link href={createPageUrl(page - 1)}>
                      <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl">
                        Previous Page
                      </Button>
                    </Link>
                  )}
                  {hasMore && (
                    <Link href={createPageUrl(page + 1)}>
                      <Button
                        size="sm"
                        className="h-8 text-xs rounded-xl bg-[#1853DB] hover:bg-blue-700 text-white"
                      >
                        Load More Rides
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center space-y-4">
              <EmptyState
                icon="search"
                title="No rides found"
                description="We couldn't find any bike rides matching your route, date or active filters. Try searching for nearby major landmarks like CBS, College Road, or Nashik Road."
              />
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href={`/${locale}/offer`}>
                  <Button className="h-10 text-xs rounded-xl bg-[#1853DB] hover:bg-blue-700 text-white gap-1.5">
                    <Bike className="w-4 h-4" />
                    Offer this Ride Instead
                  </Button>
                </Link>
                <Link href={`/${locale}/rides`}>
                  <Button variant="outline" className="h-10 text-xs rounded-xl">
                    Clear All Filters
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
