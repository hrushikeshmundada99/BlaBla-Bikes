import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory fallback for local development and testing
class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  async limit(identifier: string, maxRequests = 5, windowMs = 60000) {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return { success: true, remaining: maxRequests - 1, reset: now + windowMs };
    }

    if (record.count >= maxRequests) {
      return { success: false, remaining: 0, reset: record.resetTime };
    }

    record.count += 1;
    return { success: true, remaining: maxRequests - record.count, reset: record.resetTime };
  }
}

const memoryLimiter = new InMemoryRateLimiter();

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const upstashLimiter = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "blablabikes:ratelimit",
    })
  : null;

export async function checkRateLimit(key: string, maxRequests = 5, windowSeconds = 60) {
  if (upstashLimiter) {
    try {
      const res = await upstashLimiter.limit(key);
      return {
        success: res.success,
        remaining: res.remaining,
        reset: res.reset,
      };
    } catch (err) {
      console.warn("Upstash rate limit check failed, using fallback:", err);
    }
  }

  // Fallback to in-memory rate limiting
  return await memoryLimiter.limit(key, maxRequests, windowSeconds * 1000);
}

