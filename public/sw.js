/// <reference no-default-lib="true"/>
/// <reference lib="es2020"/>
/// <reference lib="webworker"/>

const CACHE_NAME = 'nuvask-v3';
const BUILD_ASSETS = [/* __ASSET_URLS_PLACEHOLDER__ */];

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.png',
  '/icon.png',
  '/icon-192.png',
  '/icon-512.png',
];

const STATIC_ASSETS = [...SHELL_ASSETS, ...BUILD_ASSETS];

async function precacheAssets() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    STATIC_ASSETS.map(async (url) => {
      try {
        await cache.add(url);
      } catch {
        console.warn(`[SW] Failed to precache ${url}`);
      }
    })
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAssets());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

async function updateCache(event, request, response) {
  if (!response.ok) return;
  const clone = response.clone();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
  );
}

async function networkFirstShell(event, request) {
  try {
    const response = await fetch(request);
    await updateCache(event, request, response);
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const fallback = await caches.match('/index.html');
    return (
      fallback ??
      new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
      })
    );
  }
}

async function cacheFirstAsset(event, request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    await updateCache(event, request, response);
    return response;
  } catch {
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

async function networkWithCacheFallback(event, request) {
  try {
    const response = await fetch(request);
    await updateCache(event, request, response);
    return response;
  } catch {
    const cached = await caches.match(request);
    return (
      cached ??
      new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
      })
    );
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate' || SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(networkFirstShell(event, request));
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirstAsset(event, request));
    return;
  }

  event.respondWith(networkWithCacheFallback(event, request));
});
