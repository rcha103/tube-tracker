// Tube Tracker service worker.
//
// Only ever intercepts GET requests — writes (POST/PUT/DELETE) always pass
// straight through untouched. The offline write-queue lives entirely in the
// page's own JS (see index.html), not here: Background Sync (the natural
// SW-side replay mechanism) isn't supported on iOS Safari, the platform this
// whole offline design is built around, so there's nothing to gain from a
// second replay code path here.
//
// Bump CACHE_VERSION whenever the precache list or a caching strategy changes
// — activate() deletes any cache not in ALL_CACHES, so a version bump
// auto-retires everything from the previous version.
const CACHE_VERSION = 'v1';
const SHELL_CACHE = `tt-shell-${CACHE_VERSION}`;
const API_CACHE = `tt-api-${CACHE_VERSION}`;
const IMG_CACHE = `tt-img-${CACHE_VERSION}`;
const ALL_CACHES = [SHELL_CACHE, API_CACHE, IMG_CACHE];

const SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/vendor/leaflet/leaflet.js',
  '/vendor/leaflet/leaflet.css',
  '/vendor/leaflet/images/marker-icon.png',
  '/vendor/leaflet/images/marker-icon-2x.png',
  '/vendor/leaflet/images/marker-shadow.png',
  '/vendor/leaflet/images/layers.png',
  '/vendor/leaflet/images/layers-2x.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !ALL_CACHES.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isShellAsset(url) {
  return url.pathname === '/' || SHELL_ASSETS.includes(url.pathname);
}
function isApiDataGet(url) {
  return url.pathname === '/api/cities'
    || /^\/api\/cities\/[^/]+\/(lines|stations|visited|pins)$/.test(url.pathname);
}
function isApiImageGet(url) {
  return /^\/api\/cities\/[^/]+\/(diagram|logo)\/image$/.test(url.pathname);
}

// Shell assets rarely change — serve instantly from cache, refresh in the
// background so the cache self-heals over time without ever blocking.
async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req).then((res) => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || (await network) || new Response('', { status: 504 });
}

// Live user data — freshness matters more than speed; cache is purely the
// offline fallback.
async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(req);
    if (cached) return cached;
    throw err;
  }
}

// Diagram/logo images: the frontend appends a `?t=<timestamp>` cache-buster
// to force a fresh fetch after upload, but for offline purposes we only ever
// want ONE cache entry per city+kind (the latest), so the cache key strips
// the query string — every successful online fetch simply overwrites it.
function stripQuery(url) {
  const u = new URL(url);
  u.search = '';
  return u.toString();
}
async function networkFirstImage(req, cacheName) {
  const cache = await caches.open(cacheName);
  const key = stripQuery(req.url);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(key, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(key);
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // writes: never intercepted, queueing lives in page JS
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // cross-origin (map basemap tiles etc.): never intercepted

  if (isShellAsset(url)) event.respondWith(cacheFirst(req, SHELL_CACHE));
  else if (isApiImageGet(url)) event.respondWith(networkFirstImage(req, IMG_CACHE));
  else if (isApiDataGet(url)) event.respondWith(networkFirst(req, API_CACHE));
  // else: /api/.../export, /api/.../diagram (status JSON), etc. — untouched, default network handling
});
