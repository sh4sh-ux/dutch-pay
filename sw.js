const CACHE_NAME = "dutch-pay-v5.28";
const STATIC_ASSETS = [
  "./category-icons-v5.28-1.js",
  "./category-icons-v5.28-2.js",
  "./category-icons-v5.28-3.js",
  "./category-icons-v5.28-4.js",
  "./category-grid-v5.27.css",
  "./category-grid-v5.27.js",
  "./manifest.webmanifest",
  "./favicon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

async function enhanceHtmlResponse(response) {
  if (!response) return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  let html = await response.text();
  html = html
    .replace("const APP_VERSION='v5.25';", "const APP_VERSION='v5.28';")
    .replace("const BUILD_TIME='2026-09-02 07:58';", "const BUILD_TIME='2026-09-02 09:05';");

  const revisedIconScripts = [
    '<script src="./category-icons-v5.28-1.js"></script>',
    '<script src="./category-icons-v5.28-2.js"></script>',
    '<script src="./category-icons-v5.28-3.js"></script>',
    '<script src="./category-icons-v5.28-4.js"></script>'
  ].join('\n');

  if (html.includes('<script src="category-icons.js"></script>')) {
    html = html.replace('<script src="category-icons.js"></script>', revisedIconScripts);
  }

  if (!html.includes("category-grid-v5.27.css")) {
    html = html.replace(
      "</head>",
      '<link rel="stylesheet" href="./category-grid-v5.27.css"/>\n</head>'
    );
  }

  if (!html.includes("category-grid-v5.27.js")) {
    html = html.replace(
      "</body>",
      '<script src="./category-grid-v5.27.js"></script>\n</body>'
    );
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("cache-control", "no-cache");
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(STATIC_ASSETS.filter(Boolean));
    try {
      const response = await fetch("./index.html", { cache: "no-store" });
      const enhanced = await enhanceHtmlResponse(response);
      if (enhanced && enhanced.status === 200) {
        await cache.put("./index.html", enhanced.clone());
        await cache.put("./", enhanced.clone());
      }
    } catch (_) {}
  })());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith("dutch-pay") && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();

    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    await Promise.all(windows.map((client) => {
      try { return client.navigate(client.url); } catch (_) { return null; }
    }));
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isHTML = event.request.mode === "navigate"
    || url.pathname.endsWith(".html")
    || url.pathname.endsWith("/");

  if (isHTML) {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, { cache: "no-store" });
        const enhanced = await enhanceHtmlResponse(response);
        if (enhanced && enhanced.status === 200) {
          const copy = enhanced.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return enhanced;
      } catch (_) {
        return caches.match(event.request).then((c) => c || caches.match("./index.html"));
      }
    })());
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
