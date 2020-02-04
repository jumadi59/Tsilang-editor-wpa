importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');
if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

workbox.precaching.precacheAndRoute([
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  {
    url: '/index.html',
    revision: '1'
  },
  {
    url: '/tsilang-editor.html',
    revision: '1'
  },
]);

workbox.routing.registerRoute(
  /\/tsilang-editor.html/g,
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'pages-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 80,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      })
    ]
  })
);

workbox.routing.registerRoute(
  /\.(?:css|js|woff|png|jpg|svg|gif)$/,
  workbox.strategies.cacheFirst({
    cacheName: 'assets-cache',
  }),
);

workbox.routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'assets-cache',
  })
);


workbox.routing.registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  workbox.strategies.cacheFirst({
    cacheName: 'assets-cache',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  /^https:\/\/cdnjs\.cloudflare\.com/,
  workbox.strategies.cacheFirst({
    cacheName: 'assets-cache',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);