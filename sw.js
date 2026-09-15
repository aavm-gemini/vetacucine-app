self.addEventListener('install', (e) => {
  console.log('[Service Worker] App Instalada correctamente');
});

self.addEventListener('fetch', (e) => {
  // Por ahora dejamos que el internet fluya normalmente
});