import { describe, it, expect } from "vitest";
import { onRideCancelled } from "@/app/actions/rides";

describe("Ride Actions & Hooks", () => {
  it("triggers onRideCancelled hook when a ride is cancelled", async () => {
    const testRideId = "11111111-2222-3333-4444-555555555555";
    await onRideCancelled(testRideId);
    expect((globalThis as any).__lastCancelledRideId).toBe(testRideId);
  });
});

