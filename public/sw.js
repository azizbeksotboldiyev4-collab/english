// Azizbek EDU — Service Worker
// Strategiyalar:
// - HTML navigatsiya: NetworkFirst (yangi versiya bo'lsa, oladi; offline bo'lsa, cache)
// - Static assets (JS/CSS/IMG/Font): CacheFirst (tez yuklash)
// - API/Supabase so'rovlari: faqat network (cache qilinmaydi)

const VERSION = 'v1.0.0';
const STATIC_CACHE = `azizbek-edu-static-${VERSION}`;
const HTML_CACHE = `azizbek-edu-html-${VERSION}`;
const ASSET_CACHE = `azizbek-edu-assets-${VERSION}`;

// O'rnatish vaqtida asosiy fayllarni cache'ga oldindan yuklash
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Eski versiyalardagi cache'larni tozalash
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, HTML_CACHE, ASSET_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// So'rovlarni qabul qilish
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Faqat GET so'rovlarni cache qilamiz
  if (req.method !== 'GET') return;

  // Supabase API, AI Gateway va boshqa tashqi API'larni cache qilmaymiz
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('lovable.dev') ||
    url.hostname.includes('googleapis.com') ||
    url.pathname.startsWith('/functions/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/rest/')
  ) {
    return; // browser default
  }

  // HTML navigatsiya — NetworkFirst (yangi versiya muhim)
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(HTML_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // Static assets (JS, CSS, rasmlar, fontlar) — CacheFirst
  if (
    url.origin === self.location.origin &&
    /\.(?:js|css|png|jpg|jpeg|svg|webp|gif|ico|woff2?|ttf|otf)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(ASSET_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        });
      })
    );
  }
});

// Yangilanish uchun xabar
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
