/* HÉRITAGE PWA — offline interface only; hardware control is not available offline. */
const CACHE = 'heritage-v2-3-pwa';
const CORE = ['./','./index.html','./manifest.webmanifest','./heritage-192.png','./heritage-512.png','./heritage-192-maskable.png','./heritage-512-maskable.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));
});
self.addEventListener('fetch', event => {
  const req=event.request;
  if(req.method!=='GET' || new URL(req.url).origin!==self.location.origin) return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(resp => {
      if(resp.ok){const cloned=resp.clone();caches.open(CACHE).then(c => c.put('./index.html',cloned));}
      return resp;
    }).catch(async ()=> (await caches.match('./index.html')) || Response.error()));
    return;
  }
  event.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
