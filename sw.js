const CACHE_NAME = 'vetacucine-v2'; // EL TRUCO ESTÁ AQUÍ: Cambiamos a v2

const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/reportes.html',
  '/login.html',
  '/admin.html',
  '/manifest.json',
  '/icono.png' // Asegúrate de que el nombre de tu icono coincida
];

// Instala la nueva versión y fuerza a que reemplace la vieja de inmediato
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); 
});

// Borra cualquier memoria caché vieja (la v1 que tiene el error)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); 
});

// Estrategia: "Intenta sacar de Internet primero, si no hay red, usa el Caché"
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});