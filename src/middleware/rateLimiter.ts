/**
 * Rate Limiter Middleware
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: number[];
}

const store: RateLimitStore = {};

export function rateLimiter(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[key]) {
      store[key] = [];
    }

    store[key] = store[key].filter((timestamp) => now - timestamp < windowMs);

    if (store[key].length >= maxRequests) {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((store[key][0] + windowMs - now) / 1000),
      });
      return;
    }

    store[key].push(now);
    next();
  };
}
