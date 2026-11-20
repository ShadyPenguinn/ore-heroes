// Offline support for Ore Heroes: pages are fetched fresh when online (so updates arrive) and served from cache when offline.
// Its own cache name, separate from Blacksmith Battles.
const C='ore-heroes-v9';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','art/mine.png','art/mine.json','art/forge.png','art/forge.json','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'])));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('ore-heroes-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
  e.respondWith(fetch(r.url.startsWith(self.location.origin)?new Request(r,{cache:'no-cache'}):r).then(res=>{if(res.ok&&(r.url.startsWith(self.location.origin)||r.url.includes('fonts.g')))caches.open(C).then(c=>c.put(r,res.clone()));return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('index.html'))))});
