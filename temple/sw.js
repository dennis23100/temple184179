/* 每日星星 service worker：讓 app 加到主畫面後可以離線開啟 */
const CACHE = "temple-star-v4";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/bgm.mp3",
  "./assets/stars1.png",
  "./assets/stars2.png",
  "./assets/stars3.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled(SHELL.map(url => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 同網域資源：先拿網路上最新的，失敗才用快取（星星圖換新版才會即時更新） */
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
