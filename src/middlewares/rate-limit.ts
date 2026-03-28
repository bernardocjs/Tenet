import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

export function createRateLimiter(
  max: number,
  windowMs = 15 * 60 * 1000,
): RateLimitRequestHandler {
  return rateLimit({
    max,
    windowMs,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: "error",
      message: "Too many requests, please try again later",
    },
  });
}
