// AutoFlow Studio Admin Service Worker (Web Push & PWA support)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = { title: 'New Support Message', body: 'A customer sent a message.' };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: 'New Support Message', body: event.data.text() };
    }
  }

  const options = {
    body: payload.body,
    icon: '/images/logo.webp',
    badge: '/images/logo.webp',
    vibrate: [100, 50, 100],
    data: {
      url: payload.url || '/admin/chat'
    }
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Look for any open window client that matches the destination URL root
      for (let client of windowClients) {
        if (client.url.includes('/admin/chat') && 'focus' in client) {
          // If a query parameter was passed, navigate the client to it
          if (targetUrl !== client.url && 'navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // If no admin chat window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
