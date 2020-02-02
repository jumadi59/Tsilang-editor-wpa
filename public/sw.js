importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');
if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

workbox.precaching.precacheAndRoute([
  '/manifest.json',
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
  /\.(?:css|woff|js|png|jpg|svg|gif)$/,
  workbox.strategies.cacheFirst({
    cacheName: 'assets-cache',
  }),
);