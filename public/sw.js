// ==========================================================
// AURORA DESTINY AI — SERVICE WORKER & PUSH NOTIFICATION
// Sacred Astrological Can-Chi Push Notification Worker
// Curated by Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo
// ==========================================================

const CACHE_NAME = 'aurora-destiny-v1';

// Install event - activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification event (triggered via Web Push API or backend push service)
self.addEventListener('push', (event) => {
  let data = {
    title: 'Aurora Destiny AI • Nhắc Nhở Vận Khí Can Chi',
    body: 'Khí vận thiên bàn vừa chuyển canh giờ mới.',
    icon: '/og-image.svg',
    badge: '/og-image.svg',
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
    icon: data.icon || '/og-image.svg',
    badge: data.badge || '/og-image.svg',
    tag: data.tag || 'canchi-alert',
    renotify: true,
    requireInteraction: false,
    vibrate: data.vibrate || [200, 100, 200],
    data: data.data || { url: '/?tab=daily' },
    actions: data.actions || [
      { action: 'open_timeline', title: 'Xem Canh Giờ' },
      { action: 'dismiss', title: 'Đã Hiểu' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event - focus or open client window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/?tab=daily';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            if ('navigate' in client) {
              client.navigate(targetUrl);
            }
            return;
          }
        }
      }
      // Otherwise open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
