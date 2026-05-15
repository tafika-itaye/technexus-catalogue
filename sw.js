// TechNexus Service Worker — v20260515
const CACHE = 'technexus-20260515';
const STATIC = [
  '/',
  '/index.html',
  '/catalogue.html',
  '/computer-assembly.html',
  '/language-services.html',
  '/medical-supplies.html',
  '/software-development.html',
  '/credentials.html',
  '/eis.html',
  '/demos.html',
  '/404.html',
  '/styles.css',
  '/site-ui.js',
  '/wa-chat.js',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // HTML navigation: network-first, fallback to cache then offline page
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .catch(() => caches.match(e.request)
          .then(r => r || caches.match('/404.html'))
        )
    );
    return;
  }

  // Assets: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      });
    })
  );
});
