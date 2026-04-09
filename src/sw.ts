/// <reference lib="webworker" />

import { Serwist } from 'serwist'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'serwist'
import { ExpirationPlugin } from 'serwist'

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<{ url: string; revision: string | null }>
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname.startsWith('/_next/static/'),
      handler: new StaleWhileRevalidate({
        cacheName: 'next-static',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 120,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          }),
        ],
      }),
    },
    {
      matcher: ({ request, url }) =>
        request.mode === 'navigate' &&
        !url.pathname.startsWith('/product/') &&
        !url.pathname.startsWith('/checkout') &&
        !url.pathname.startsWith('/cart'),
      handler: new NetworkFirst({
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
      }),
    },
    {
      matcher: ({ request }) => request.destination === 'image',
      handler: new CacheFirst({
        cacheName: 'images',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          }),
        ],
      }),
    },
    {
      matcher: ({ request }) =>
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'font',
      handler: new StaleWhileRevalidate({
        cacheName: 'static-resources',
      }),
    },
    {
      matcher: ({ url }) =>
        url.pathname.startsWith('/api/') &&
        !url.pathname.startsWith('/api/price-calculate') &&
        !url.pathname.startsWith('/api/checkout') &&
        !url.pathname.startsWith('/api/configurator-meta-debug'),
      handler: new NetworkFirst({
        cacheName: 'api',
        networkTimeoutSeconds: 5,
      }),
    },
  ],
})

serwist.addEventListeners()

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match('/~offline')
      return cached ?? Response.error()
    }),
  )
})
