// ==========================================================================
// DIARY SMART — SERVICE WORKER (OFFLINE SUPPORT & CACHING)
// ==========================================================================

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE_NAME = 'diary-smart-v2';
const offlineFallbackPage = "index.html";

const assetsToCache = [
  '/',
  '/index.html',
  '/diary.html',
  '/goals.html',
  '/settings.html',
  '/script.js',
  '/icon-192.png',
  '/icon-512.png'
];

// 1. Skip waiting ili Service Worker mpya ichukue nafasi mara moja
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// 2. Usakinishaji na kuhifadhi faili zote kwenye cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
  self.skipWaiting();
});

// 3. Kuondoa cache za zamani zilizopitwa na wakati wakati wa activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clientsClaim();
});

// Wezesha navigation preload kama inatumika
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// 4. Mfumo wa Fetch (Inashughulikia maombi ya mtandaoni na offline fallback)
self.addEventListener('fetch', (event) => {
  // Kama ombi ni la kurasa (navigate), tumia mfumo wa offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;
        if (preloadResp) {
          return preloadResp;
        }
        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp || cache.match('/');
      }
    })());
    return;
  }

  // Kwa maombi mengine (faili za CSS, JS, picha, n.k), chota kwenye cache kwanza au nenda mtandaoni
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});