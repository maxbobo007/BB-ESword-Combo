const CACHE = 'bbesword-mww2w9fe';
const ASSETS = ["./","./index.html","./bundle.js","./Ionicons.ttf","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ASSETS.map(u => fetch(u, { cache: 'reload' }).then(r => c.put(u, r)))))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    })),
  );
});
