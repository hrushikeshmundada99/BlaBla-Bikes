import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { FeatureCards } from "@/components/home/feature-cards";
import { EmptyState } from "@/components/shared/empty-state";
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
});
