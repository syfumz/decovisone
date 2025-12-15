const CACHE_NAME = 'gallery-v1';
const STATIC_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/main.js'
];

// install → cache file inti
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_CACHE))
  );
});

// fetch → khusus image gallery
self.addEventListener('fetch', e => {
  const req = e.request;

  // hanya handle GET
  if (req.method !== 'GET') return;

  // JIKA IMAGE
  if (req.destination === 'image') {
    e.respondWith(
      caches.match(req).then(cacheRes => {
        return (
          cacheRes ||
          fetch(req).then(fetchRes => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(req, fetchRes.clone());
              return fetchRes;
            });
          })
        );
      })
    );
    return;
  }

  // default (html, css, js)
  e.respondWith(
    caches.match(req).then(res => res || fetch(req))
  );
});

