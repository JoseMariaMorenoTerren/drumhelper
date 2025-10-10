// Service Worker para Drum Helper PWA
const CACHE_NAME = 'drum-helper-v1.1.3';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './js/app.js',
    './js/metronome.js',
    './js/lyricsScroller.js',
    './js/songManager.js',
    './manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando versión', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cacheando archivos');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                // Forzar activación inmediata
                return self.skipWaiting();
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activando versión', CACHE_NAME);
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Eliminando cache antiguo', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Tomar control inmediato de todas las pestañas
            return self.clients.claim();
        })
    );
});

// Intercepción de requests - Estrategia Network First para HTML, Cache First para recursos estáticos
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Para archivos HTML, intentar red primero para obtener actualizaciones
    if (event.request.destination === 'document' || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Si la red funciona, cachear la nueva versión
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    return response;
                })
                .catch(() => {
                    // Si falla la red, usar cache
                    return caches.match(event.request);
                })
        );
    } else {
        // Para recursos estáticos (CSS, JS), usar cache primero
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    // Si no está en cache, buscar en red y cachear
                    return fetch(event.request)
                        .then((response) => {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                            return response;
                        });
                })
        );
    }
});
