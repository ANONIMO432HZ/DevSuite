
const CACHE_NAME = 'devsuite-v41';

// Archivos que SIEMPRE deben estar en caché para que la app arranque
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/dist/index.js',
  '/manifest.json',
  '/styles.css'
];

// Instalar SW y guardar caché inicial
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching critical assets');
      return cache.addAll(CRITICAL_ASSETS);
    })
  );
  self.skipWaiting(); // Forzar activación inmediata
});

// Limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Tomar control de clientes inmediatamente
});

self.addEventListener('fetch', (event) => {
  // Solo interceptamos peticiones GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. ESTRATEGIA PARA NAVEGACIÓN (HTML) - SPA Fallback
  // Si piden una página (mode: navigate), intentamos red primero, 
  // pero si falla (offline), devolvemos SIEMPRE index.html del caché.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 2. ESTRATEGIA PARA RECURSOS ESTÁTICOS (JS, CSS, Imágenes)
  // Stale-While-Revalidate: Devuelve caché rápido, actualiza en segundo plano.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Guardar copia fresca en caché
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // Si falla red y no hay caché, no hacemos nada (el navegador mostrará error para recursos no críticos)
        // console.log('[SW] Network fetch failed:', err);
      });

      // Devolver lo que tengamos en caché, o esperar a la red
      return cachedResponse || fetchPromise;
    })
  );
});