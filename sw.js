const CACHE_NAME='makro-gestao-integrada-v89';
const APP_SHELL=[
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/vendor/html2canvas.min.js',
  './assets/vendor/jspdf.umd.min.js',
  './assets/icons/app-icon.svg',
  './assets/icons/app-icon-192.png',
  './assets/icons/app-icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/makro-symbol-source.png',
  './assets/backgrounds/makro-operacao-01.jpg',
  './assets/backgrounds/makro-operacao-02.jpg',
  './assets/backgrounds/makro-operacao-03.jpg',
  './assets/backgrounds/makro-operacao-04.jpg',
  './assets/backgrounds/makro-operacao-05.jpg',
  './assets/backgrounds/makro-operacao-06.jpg',
  './assets/backgrounds/makro-operacao-07.jpg',
  './assets/backgrounds/makro-operacao-08.jpg',
  './assets/backgrounds/makro-operacao-09.jpg',
  './assets/backgrounds/makro-operacao-10.jpg',
  './assets/backgrounds/makro-operacao-11.jpg',
  './assets/backgrounds/makro-operacao-12.jpg'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  if(request.mode==='navigate'||url.pathname.endsWith('/index.html')){
    event.respondWith(
      fetch(request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
          return response;
        })
        .catch(()=>caches.match(request).then(cached=>cached||caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
      return response;
    }))
  );
});
