const CACHE_NAME = 'devsuite-v10';

// Archivos CRÍTICOS: Si alguno de estos falla, la app no funciona offline.
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/dist/bundle.js',
  '/dist/styles.css',
  '/manifest.json'
];

// Archivos OPCIONALES: Intentaremos cachearlos, pero si fallan (404), no romperemos la app.
const OPTIONAL_ASSETS = [
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instalación: Cachear recursos críticos estrictamente y opcionales suavemente
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Cacheando archivos críticos v10');
      
      // 1. Cachear lo crítico (falla si hay error)
      await cache.addAll(CRITICAL_ASSETS);

      // 2. Intentar cachear lo opcional (sin romper si falla)
      try {
        await cache.addAll(OPTIONAL_ASSETS);
      } catch (err) {
        console.warn('[Service Worker] No se pudieron cachear algunos recursos opcionales (probablemente iconos faltantes):', err);
      }
    })
  );
  self.skipWaiting();
});

// Activación: Limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Borrando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Estrategia Network First con fallback a Cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si no está en caché y no hay red, retornamos undefined (el navegador mostrará error de conexión standard)
          console.log('[Service Worker] Recurso no disponible offline:', event.request.url);
        });
      })
  );
});