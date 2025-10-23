/* Focus Fade SW (minimal): handled by next-pwa build; keep logic tiny */
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('install', () => {
  // no pre-cache here; next-pwa will inject workbox routes
})

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim())
})
