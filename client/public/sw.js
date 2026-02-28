// define the cache name and the urls to cache
const CACHE_NAME = "salin-cache-v3"; // bumped for offline queue feature
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
  self.skipWaiting();
});

// fetch from cache first, then from the network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    }),
  );
});

// delete old caches on activate
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          }),
        ),
      ),
      self.clients.claim(),
    ]),
  );
});

// ============================================================
// Background Sync — replay queued offline requests
// ============================================================
self.addEventListener("sync", (event) => {
  if (event.tag === "salin-sync") {
    event.waitUntil(replayOfflineQueue());
  }
});

async function replayOfflineQueue() {
  // Open IndexedDB directly from service worker context
  const db = await openQueueDB();
  const requests = await getAllQueued(db);

  for (const item of requests) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });

      if (response.ok) {
        await removeQueued(db, item.id);
        // Notify open clients to refresh their data
        const clients = await self.clients.matchAll({ type: "window" });
        clients.forEach((client) =>
          client.postMessage({ type: "salin:sync-complete" }),
        );
      }
    } catch {
      // Network still unavailable — leave item in queue, retry next sync
    }
  }
}

// Minimal IndexedDB helpers for use inside the SW (no ES module imports)
function openQueueDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("salin-offline-queue", 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("requests")) {
        const store = db.createObjectStore("requests", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllQueued(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("requests", "readonly");
    const req = tx.objectStore("requests").index("timestamp").getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function removeQueued(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("requests", "readwrite");
    tx.objectStore("requests").delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
