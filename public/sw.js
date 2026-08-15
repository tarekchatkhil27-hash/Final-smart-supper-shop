// This is a minimal Service Worker to pass PWABuilder's requirements
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A minimal fetch handler is required by PWA standards
  // In a real PWA, you would handle caching here.
  event.respondWith(fetch(event.request));
});
