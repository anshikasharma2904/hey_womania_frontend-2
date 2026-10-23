const CACHE_NAME = "hw-image-cache-v1";

// Cache-first strategy exclusively for image assets (Cloudflare & static images)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isImage =
    event.request.destination === "image" ||
    url.hostname.includes("imagedelivery.net") ||
    /\.(png|jpe?g|webp|avif|gif|svg)(\?.*)?$/i.test(url.pathname);

  if (!isImage || event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Return immediately from disk cache if present (0ms response)
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Fetch from network and store copy in persistent cache for subsequent views
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        return cachedResponse || Response.error();
      }
    })
  );
});

// Clean up old caches on version bump
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key.startsWith("hw-image-cache")) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});
