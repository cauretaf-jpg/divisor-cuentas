const CACHE_NAME = 'cuenta-clara-v13.18';

const ASSETS = [
  './',
  './index.html',
  './app.html',
  './como-funciona.html',
  './funciones.html',
  './preguntas-frecuentes.html',
  './privacidad.html',
  './terminos.html',
  './contacto.html',
  './styles.css?v=13.18',
  './shared-utils.js?v=13.18',
  './script.js?v=13.18',
  './supabase-config.js?v=13.18',
  './manifest.json',
  './perfil.html',
  './profile.js?v=13.18',
  './ads.txt',
  './assets/logo.svg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      ),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});


self.addEventListener('push', (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'Cuenta Clara', body: event.data ? event.data.text() : 'Tienes una novedad pendiente.' };
  }

  const title = payload.title || 'Cuenta Clara';
  const options = {
    body: payload.body || 'Tienes una solicitud pendiente.',
    icon: './assets/logo.svg',
    badge: './assets/logo.svg',
    tag: payload.tag || payload.notificationId || 'cuenta-clara-push',
    renotify: true,
    data: {
      url: payload.url || './app.html#shared',
      accountId: payload.accountId || '',
      notificationId: payload.notificationId || '',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification?.data?.url || './app.html#shared', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl).catch(() => {});
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
