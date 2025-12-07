// define the cache name and the urls to cache
const CACHE_NAME = "salin-cache-v2"; // updated version for Remember Me feature
const urlsToCache = [
  "/",
  "/index.html",
  "/src/styles/main.css",
  "/src/styles/reset.css",
  "/src/styles/variables.css",
  "/src/js/app.js",
  "/src/js/api.js",
  "/src/js/utils/storage.js",
  "/assets/icons/salin.png",
  "/assets/icons/icon-192.png",
];

// install the service worker and cache the urls
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

// fetch from cache first, then from the network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // cache hit - return response
      if (response) {
        return response;
      }

      // clone the request
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    }),
  );
});

// delete old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
