import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { FeatureCards } from "@/components/home/feature-cards";
import { EmptyState } from "@/components/shared/empty-state";
import { FuelShareCalculator } from "@/components/rides/fuel-share-calculator";
import { RouteMap } from "@/components/maps/route-map";
import { PlacePickerMap } from "@/components/maps/place-picker-map";
import enMessages from "../../messages/en.json";

// Mock next-intl routing
vi.mock("@/i18n/routing", () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/",
}));

describe("Core UI Components", () => {
  it("renders feature cards with cost-sharing and confidence details matching design", () => {
    render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <FeatureCards />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("Ride across Nashik")).toBeInTheDocument();
    expect(screen.getByText("Fair shared costs")).toBeInTheDocument();
    expect(screen.getByText("Ride with confidence")).toBeInTheDocument();
  });

  it("renders accessible empty states with icon and description", () => {
    render(
      <EmptyState
        title="No Rides Available"
        description="Try adjusting your departure time or search a nearby Nashik hub."
      />
    );

    expect(screen.getByText("No Rides Available")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Try adjusting your departure time or search a nearby Nashik hub."
      )
    ).toBeInTheDocument();
  });

  it("renders RouteMap fallback skeleton without crashing", () => {
    render(
      <RouteMap
        from={{ lat: 19.9975, lng: 73.7898, name: "CBS" }}
        to={{ lat: 19.9535, lng: 73.8447, name: "Nashik Road" }}
      />
    );
    expect(screen.getByText("Loading Nashik route map...")).toBeInTheDocument();
  });

  it("renders PlacePickerMap fallback skeleton without crashing", () => {
    render(
      <PlacePickerMap
        value={{ lat: 19.9975, lng: 73.7898 }}
        onChange={vi.fn()}
      />
    );
    expect(
      screen.getByText("Loading interactive Nashik place picker...")
    ).toBeInTheDocument();
  });

  it("renders FuelShareCalculator and shows soft warning when above 2x", () => {
    const { rerender } = render(
      <FuelShareCalculator
        distanceKm={10}
        passengers={1}
        value={15}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Suggested:/)).toBeInTheDocument();
    expect(screen.getByText("Use Suggestion")).toBeInTheDocument();
    expect(screen.queryByText(/Advisory:/)).not.toBeInTheDocument();

    // Rerender with high contribution exceeding 2x (e.g. ₹60 when suggested is ₹15)
    rerender(
      <FuelShareCalculator
        distanceKm={10}
        passengers={1}
        value={60}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Advisory:/)).toBeInTheDocument();
  });
});
