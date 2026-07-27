// Service Worker for 仙人掌大逃亡：奔跑吧小墨龍
const CACHE_VERSION = 'v1.2.3';
const CACHE_NAME = `ink-dragon-cache-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './favicon.png',
  './og-image.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 排除 Vite HMR 及非 GET 請求
  if (
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@react-refresh') ||
    url.pathname.includes('node_modules') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  const isHTML = event.request.headers.get('accept')?.includes('text/html') ||
                 url.pathname.endsWith('/') ||
                 url.pathname.endsWith('/index.html');

  if (isHTML) {
    // 🟢 HTML 頁面必須採取 Network-First 策略，防止拿舊 Hash 導致資產 404 白屏
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => cached || caches.match('./index.html'));
        })
    );
    return;
  }

  // 靜態資產 (JS, CSS, Images): Cache-First 搭配背景非同步刷新
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request);
    })
  );
});
