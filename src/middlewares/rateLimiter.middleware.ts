/**
 * Simple In-Memory Rate Limiter Middleware
 *
 * For production with multiple server instances, replace with Redis-based rate limiter.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.util';
import logger from '../utils/logger.util';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 60_000);

/**
 * Create a rate limiter middleware
 *
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum requests allowed within the window
 * @param keyGenerator - Function to generate a unique key for the request (defaults to IP)
 */
export function rateLimiter(
  windowMs: number = 60_000,
  maxRequests: number = 10,
  keyGenerator?: (req: Request) => string,
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = keyGenerator
      ? keyGenerator(req)
      : req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      // First request or window expired — reset
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      logger.warn('[RateLimiter] Exceeded limit', { key, count: entry.count });
      throw new AppError(
        'Too many requests. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED',
      );
    }

    entry.count++;
    next();
  };
}

/**
 * Pre-configured rate limiters for OTP endpoints
 */
export const otpSendLimiter = rateLimiter(60_000, 3, (req) => {
  // Rate limit by phone number if available, otherwise by IP
  const phone = req.body?.phone;
  return phone ? `otp-send:${phone}` : `otp-send:${req.ip || 'unknown'}`;
});

export const otpVerifyLimiter = rateLimiter(60_000, 5, (req) => {
  // Rate limit by phone number if available, otherwise by IP
  const phone = req.body?.phone;
  return phone ? `otp-verify:${phone}` : `otp-verify:${req.ip || 'unknown'}`;
});
