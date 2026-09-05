const CACHE = "pmwork-v3";
const PRECACHE = /* PRECACHE */ [];
const CORE = ["./", "./ru/", "./en/", "./ru/workspace/", "./en/workspace/", "./manifest-ru.webmanifest", "./manifest-en.webmanifest", "./icon.svg"];
const scope = new URL(self.registration.scope);
self.addEventListener("install", event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE), urls = PRECACHE.length ? PRECACHE : CORE;
  for (let i = 0; i < urls.length; i += 8) await cache.addAll(urls.slice(i, i + 8));
})()));
// A new release activates after old tabs close, preventing mixed-version chunks.
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("pmwork-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if(event.request.method !== "GET" || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(event.request, {ignoreSearch:true});
    if(hit && /\.(woff2|png|svg|css|js)$/.test(url.pathname)) return hit;
    try {
      const response = await fetch(event.request);
      if(response.ok) event.waitUntil(cache.put(event.request,response.clone()));
      return response;
    } catch {
      if(hit)return hit;
      if(event.request.mode === "navigate") {
        const pathname = url.pathname;
        return (await cache.match(new URL(pathname.includes("/en/") ? "./en/" : "./ru/", scope))) || new Response("Offline", {status:503,headers:{"Content-Type":"text/plain"}});
      }
      return new Response("Offline resource unavailable",{status:503,headers:{"Content-Type":"text/plain"}});
    }
  })());
});
self.addEventListener('message', event => { if(event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
