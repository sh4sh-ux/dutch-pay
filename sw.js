const CACHE_NAME = "dutch-pay-v5.47";
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

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(STATIC_ASSETS.filter(Boolean));
    try {
      const response = await fetch("./index.html", { cache: "no-store" });
      if (response && response.status === 200) {
        await cache.put("./index.html", response.clone());
        await cache.put("./", response.clone());
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

    // 여기서 client.navigate()로 열린 창을 다시 불러오면 안 된다.
    // 그 이동의 HTML 요청은 아직 activate를 끝내지 못한 이 서비스워커가 처리해야 해서
    // 서로를 기다리다 멈춘다(첫 로드 실패, 이후 새로고침도 ERR_ABORTED).
    // 새 버전 안내는 index.html의 updatefound 핸들러가 맡는다 —
    // '새 버전이 있어요 · 탭해서 새로고침' 토스트를 띄우고 사용자가 누르면 페이지가 스스로 reload 한다.
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
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
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
