const CACHE_NAME = "dutch-pay-v5.26";
const STATIC_ASSETS = [
  "./category-icons.js",
  "./category-grid-v5.26.css",
  "./category-grid-v5.26.js",
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

  // v5.25 소스에만 적용한다. 이후 index.html 버전이 올라가면 강제로 덮어쓰지 않는다.
  html = html
    .replace("const APP_VERSION='v5.25';", "const APP_VERSION='v5.26';")
    .replace("const BUILD_TIME='2026-09-02 07:58';", "const BUILD_TIME='2026-09-02 08:36';");

  if (!html.includes("category-grid-v5.26.css")) {
    html = html.replace(
      "</head>",
      '<link rel="stylesheet" href="./category-grid-v5.26.css"/>\n</head>'
    );
  }

  if (!html.includes("category-grid-v5.26.js")) {
    html = html.replace(
      "</body>",
      '<script src="./category-grid-v5.26.js"></script>\n</body>'
    );
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");
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
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith("dutch-pay") && key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isHTML = event.request.mode === "navigate"
    || url.pathname.endsWith(".html")
    || url.pathname.endsWith("/");

  if (isHTML) {
    // HTML: 네트워크 우선 + v5.26 카테고리 레이아웃/버전 적용, 실패 시 캐시 폴백
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
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

  // 정적 파일: 캐시 우선, 없으면 네트워크
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
