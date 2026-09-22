const CACHE_NAME = 'vetacucine-v3'; // ¡Subimos a V3 para forzar la purga masiva!

const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/reportes.html',
  '/taller.html',   // Agregado para que los operadores también se actualicen
  '/login.html',
  '/admin.html',
  '/manifest.json',
  '/icono.png'
];

// Instala la nueva versión y fuerza a que reemplace la vieja de inmediato
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
          console.log('Cache V3 abierta y guardando archivos');
          return cache.addAll(urlsToCache);
      })
  );
});

// Borra cualquier memoria caché vieja (las v1 o v2)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua (Adiós errores viejos):', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Toma el control de las pestañas abiertas inmediatamente
});

// Estrategia: "Red Primero (Network First)" mejorada
self.addEventListener('fetch', event => {
  // 1. REGLA DE ORO: ¡Nunca guardes en caché la base de datos (Supabase)!
  if (event.request.url.includes('supabase.co')) {
      return; // Deja que el navegador haga la petición en vivo, sin meterse
  }

  // 2. Para HTML y lo demás: Busca primero en internet. 
  // Si hay internet, descarga lo más nuevo y guárdalo. Si no hay internet, saca lo del caché.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la red funcionó, actualizamos silenciosamente el caché para cuando se queden sin datos
        if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Si falla el fetch (Están offline o sin señal en la planta), saca la copia de seguridad
        return caches.match(event.request);
      })
  );
});