/* Mirchoni V4. Offline shell + bounded runtime photo cache. No booking data or PII cached. */
const CACHE_VERSION='v6-2026-11-18-photos';
const SHELL='mirchoni-shell-'+CACHE_VERSION;
const PAGES='mirchoni-pages-'+CACHE_VERSION;
const PHOTOS='mirchoni-photos-'+CACHE_VERSION;
const OTHER='mirchoni-extras-'+CACHE_VERSION;
const ALL=[SHELL,PAGES,PHOTOS,OTHER];
const CORE=[
 "./",
 "./index.html",
 "./offline.html",
 "./manifest.webmanifest",
 "./assets/css/cinematic.css",
 "./assets/css/pwa.css",
 "./assets/css/polish.css",
 "./assets/css/v6.css",
 "./assets/js/cinematic.js",
 "./assets/js/pwa.js",
 "./assets/js/image-manager.js",
 "./assets/css/style.css",
 "./assets/css/signature.css",
 "./assets/js/main.js",
 "./assets/js/signature.js",
 "./assets/img/favicon.svg",
 "./assets/img/fallback.svg",
 "./assets/img/fallback-room.svg",
 "./assets/img/fallback-garden.svg",
 "./assets/img/fallback-hills.svg",
 "./assets/img/fallback-fire.svg",
 "./assets/img/app-icon-192.png",
 "./assets/img/app-icon-512.png",
 "./assets/img/app-icon-maskable.png",
 "./assets/img/ai/sunset-gardens.webp",
 "./assets/img/ai/sunset-gardens-mobile.webp",
 "./assets/img/real/premium-room.webp",
 "./stays.html",
 "./story.html",
 "./experiences.html",
 "./gallery.html",
 "./contact.html",
 "./superior-cottage.html",
 "./premium-cottage.html",
 "./premium-heritage-cottage.html",
 "./heritage-family-cottage.html"
];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(SHELL).then(cache=>cache.addAll(CORE)));
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
   const keys=await caches.keys();
   await Promise.all(keys.filter(k=>k.startsWith('mirchoni-')&&!ALL.includes(k)).map(k=>caches.delete(k)));
   await self.clients.claim();
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});
async function limitCache(cache,limit){
 const keys=await cache.keys();
 if(keys.length>limit)await Promise.all(keys.slice(0,keys.length-limit).map(k=>cache.delete(k)));
}
function usable(r){return r&&r.ok}
async function cacheFirst(req,cacheName,limit){
 const cache=await caches.open(cacheName);
 const stored=await cache.match(req);
 if(stored)return stored;
 try{
  const response=await fetch(req);
  if(usable(response)){
    try{await cache.put(req,response.clone());if(limit)await limitCache(cache,limit)}catch{}
  }
  return response;
 }catch(e){
  if(req.destination==='image'){
   const shell=await caches.open(SHELL);
   const path=new URL(req.url).pathname.toLowerCase();
   const image=path.includes('outside')||path.includes('garden')?'./assets/img/fallback-hills.svg':'./assets/img/fallback-room.svg';
   return await shell.match(image) || Response.error();
  }
  throw e;
 }
}
async function networkFirstPage(req){
 const pages=await caches.open(PAGES);
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),3500);
 try{
  const response=await fetch(req,{signal:controller.signal});
  if(response.ok){try{await pages.put(req,response.clone())}catch{}}
  if(response.ok)return response;
  const cached=await pages.match(req);
  return cached||response;
 }catch(e){
  const cached=await pages.match(req);
  const shell=await caches.open(SHELL);
  return cached||await shell.match(req)||await shell.match('./offline.html')||Response.error();
 }finally{clearTimeout(timeout)}
}
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.protocol!=='http:'&&url.protocol!=='https:')return;
 if(req.mode==='navigate'){
   if(url.origin!==self.location.origin)return;
   event.respondWith(networkFirstPage(req));return;
 }
 if(url.origin===self.location.origin){
  event.respondWith(cacheFirst(req,SHELL));return;
 }
 if(req.destination==='image'){
  // Never cache opaque third-party 404s: use the browser network/cache only.
  return;
 }
 if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'){
  event.respondWith(cacheFirst(req,OTHER,18));return;
 }
 // External WhatsApp and other live links are never intercepted or cached.
});
