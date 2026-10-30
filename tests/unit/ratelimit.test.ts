import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/ratelimit";

describe("Rate Limiting Service", () => {
  it("allows requests under the maximum limit and blocks subsequent requests", async () => {
    const testKey = `test-client-${Date.now()}`;

    // First 5 requests should pass
    for (let i = 0; i < 5; i++) {
      const res = await checkRateLimit(testKey, 5, 60);
      expect(res.success).toBe(true);
    }

    // 6th request should be blocked
    const blockedRes = await checkRateLimit(testKey, 5, 60);
    expect(blockedRes.success).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });
});

