/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { clientsClaim, skipWaiting } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare const self: ServiceWorkerGlobalScope;

skipWaiting();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
clientsClaim();

// SPA navigation — serve cached shell when offline
const navigationHandler = createHandlerBoundToURL("/index.html");
registerRoute(
  new NavigationRoute(navigationHandler, {
    denylist: [/^\/api\//, /^\/functions\//],
  }),
);

// Static assets (fonts, icons) — cache-first, long TTL
registerRoute(
  ({ request }) =>
    request.destination === "font" ||
    request.destination === "manifest",
  new CacheFirst({
    cacheName: "static-assets",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  }),
);

// Product images — cache-first with expiration
registerRoute(
  ({ request, url }) =>
    request.destination === "image" ||
    url.pathname.startsWith("/images/"),
  new CacheFirst({
    cacheName: "product-images",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  }),
);

// Supabase API requests — network-first for fresh data
registerRoute(
  ({ url }) => url.hostname.includes("supabase.co"),
  new NetworkFirst({
    cacheName: "supabase-api",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }),
    ],
    networkTimeoutSeconds: 5,
  }),
);

// JS/CSS chunks — stale-while-revalidate
registerRoute(
  ({ request }) =>
    request.destination === "script" ||
    request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "js-css-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  }),
);

// Web Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json() as {
      title?: string;
      body?: string;
      url?: string;
      icon?: string;
    };

    const title = payload.title ?? "OffGrid Lifestyle";
    const options: NotificationOptions = {
      body: payload.body ?? "",
      icon: payload.icon ?? "/favicon_io/android-chrome-192x192.png",
      badge: "/favicon_io/favicon-32x32.png",
      data: { url: payload.url ?? "/" },
      tag: "offgrid-notification",
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("OffGrid Lifestyle", {
        body: text,
        icon: "/favicon_io/android-chrome-192x192.png",
      }),
    );
  }
});

// Notification click — open the target URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string })?.url ?? "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
