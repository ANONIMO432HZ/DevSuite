
const CACHE_NAME = 'devsuite-v38';

const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/dist/index.js',
  '/manifest.json',
  '/styles.css'
];

const OPTIONAL_ASSETS = [
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(CRITICAL_ASSETS);
      try {
        await cache.addAll(OPTIONAL_ASSETS);
      } catch (err) {
        console.warn('Could not cache optional assets:', err);
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Estrategia Stale-While-Revalidate:
  // 1. Sirve del caché inmediatamente si existe.
  // 2. Ve a la red en paralelo para actualizar el caché para la próxima vez.
  // 3. Si no hay caché, espera a la red.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Solo actualizamos el caché si la respuesta es válida
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // Si falla la red y no hay caché, retornamos undefined (que causará error)
        // o podríamos retornar una página offline genérica aquí.
        console.log('Network fetch failed in SWR:', err);
      });

      return cachedResponse || fetchPromise;
    })
  );
});