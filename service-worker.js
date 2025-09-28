self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('mindsight-cache').then((cache) => {
      return cache.addAll([
        '/Mindsight/',
        '/Mindsight/index.html',
        '/Mindsight/style.css',
        '/Mindsight/script.js',
        '/Mindsight/manifest.json',
        '/Mindsight/icon-192.png',
        '/Mindsight/icon-512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
