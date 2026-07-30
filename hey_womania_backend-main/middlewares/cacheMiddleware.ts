import { Request, Response, NextFunction } from "express";

interface CacheEntry {
  body: any;
  contentType?: string;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

/**
 * Express middleware for caching GET responses in memory.
 * @param ttlSeconds Time to live in seconds (default: 60)
 */
export function cacheMiddleware(ttlSeconds: number = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = req.originalUrl || req.url;
    const now = Date.now();
    const cached = memoryCache.get(key);

    if (cached && cached.expiresAt > now) {
      res.setHeader("X-Cache", "HIT");
      res.setHeader("Cache-Control", `public, max-age=${ttlSeconds}, s-maxage=300, stale-while-revalidate=600`);
      if (cached.contentType) {
        res.setHeader("Content-Type", cached.contentType);
      }
      return res.send(cached.body);
    }

    // Capture response for caching
    const originalSend = res.send.bind(res);
    res.setHeader("X-Cache", "MISS");
    res.setHeader("Cache-Control", `public, max-age=${ttlSeconds}, s-maxage=300, stale-while-revalidate=600`);

    res.send = (body: any): Response => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const contentType = res.getHeader("Content-Type") as string | undefined;
        memoryCache.set(key, {
          body,
          contentType,
          expiresAt: Date.now() + ttlSeconds * 1000
        });
      }
      return originalSend(body);
    };

    next();
  };
}

/**
 * Clear entries from the in-memory cache.
 * If prefix is supplied, only matching keys will be cleared.
 */
export function invalidateBackendCache(prefix?: string) {
  if (!prefix) {
    memoryCache.clear();
    return;
  }

  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix) || key.includes(prefix)) {
      memoryCache.delete(key);
    }
  }
}
