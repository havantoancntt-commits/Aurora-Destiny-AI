// ==========================================================
// AURORA DESTINY AI — ENTERPRISE SERVICE WORKER & SYNC
// Sacred Astrological Can-Chi Push Notification & Offline Engine
// Curated by Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo
// ==========================================================

const CACHE_VERSION = 'v3.1.0-tinhhoa';
const STATIC_CACHE_NAME = `aurora-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `aurora-dynamic-${CACHE_VERSION}`;

// Precache essential application shell assets
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/og-image.svg'
];

// 1. Install Event: Cache essential assets and allow immediate activation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('⚠️ [PWA Service Worker] Some precache assets could not be cached immediately:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up outdated cache versions and claim all client windows
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('🧹 [PWA Service Worker] Purging legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Message Listener: Support instant in-app update triggering
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. Fetch Event: Multi-tiered strategy prioritizing privacy, offline resilience, and freshness
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // A. PRIVACY & SECURITY FIRST: Never cache or intercept API endpoints, auth, downloads or mutations
  if (
    url.pathname.startsWith('/api/') ||
    request.method !== 'GET' ||
    url.pathname.includes('/auth/')
  ) {
    return; // Pass through straight to network
  }

  // B. NAVIGATION REQUESTS (HTML page): Network-First with Cache Fallback for seamless offline experience
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const rootFallback = await caches.match('/');
          if (rootFallback) return rootFallback;
          return new Response('Hệ thống đang hoạt động ở chế độ ngoại tuyến an toàn.', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // C. STATIC ASSETS & FONTS (Google Fonts, Images, CSS, JS): Stale-While-Revalidate / Cache-First
  if (
    url.origin === self.location.origin ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});

// 5. PUSH NOTIFICATION: Can-Chi hourly transit alerts & Astrological updates
self.addEventListener('push', (event) => {
  let data = {
    title: 'Tinh Hoa Tử Vi • Vận Khí Can Chi',
    body: 'Thời khắc thiên bàn vừa chuyển canh giờ mới. Hãy kiểm tra nhịp năng lượng.',
    icon: '/pwa-192x192.png',
    badge: '/icon.svg',
    tag: 'canchi-hourly-alert',
    data: { url: '/?tab=daily' }
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/icon.svg',
    tag: data.tag || 'canchi-alert',
    renotify: true,
    requireInteraction: false,
    vibrate: data.vibrate || [150, 80, 150],
    data: data.data || { url: '/?tab=daily' },
    actions: data.actions || [
      { action: 'open_timeline', title: 'Xem Canh Giờ' },
      { action: 'dismiss', title: 'Đã Hiểu' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 6. NOTIFICATION CLICK HANDLER
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/?tab=daily';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && client.url.includes(self.location.origin)) {
          client.focus();
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
