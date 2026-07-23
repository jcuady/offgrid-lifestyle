/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { clientsClaim, skipWaiting } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { absoluteNotificationUrl } from "./lib/pushPayload";

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
      tag?: string;
    };

    const title = payload.title ?? "OffGrid Lifestyle";
    const path = payload.url ?? "/";
    const tag =
      typeof payload.tag === "string" && payload.tag.trim()
        ? payload.tag.trim().slice(0, 120)
        : `offgrid:${path}`;
    const options: NotificationOptions & { renotify?: boolean } = {
      body: payload.body ?? "",
      icon: payload.icon ?? "/favicon_io/android-chrome-192x192.png",
      badge: "/favicon_io/favicon-32x32.png",
      data: { url: path },
      tag,
      // Ensure rapid same-order updates still surface in the OS tray.
      renotify: true,
    };

    event.waitUntil(
      Promise.all([
        self.registration.showNotification(title, options),
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
          for (const client of clients) {
            client.postMessage({ type: "OG_PUSH_RECEIVED", url: path, title, body: options.body });
          }
        }),
      ]),
    );
  } catch {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("OffGrid Lifestyle", {
        body: text,
        icon: "/favicon_io/android-chrome-192x192.png",
        tag: "offgrid:plaintext",
        renotify: true,
      } as NotificationOptions),
    );
  }
});

// Notification click — focus an open tab and navigate to the deep link.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const rawUrl = (event.notification.data as { url?: string })?.url ?? "/";
  const targetUrl = absoluteNotificationUrl(rawUrl, self.location.origin);

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windowClients) {
        if (!("focus" in client)) continue;
        await client.focus();
        const navClient = client as WindowClient & { navigate?: (url: string) => Promise<WindowClient | null> };
        if (typeof navClient.navigate === "function") {
          return navClient.navigate(targetUrl);
        }
        client.postMessage({ type: "OG_NAVIGATE", url: rawUrl });
        return client;
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })(),
  );
});
