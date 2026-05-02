// ============ SERVICE WORKER - SOLA VERBO ============
const CACHE_NAME = 'sola-verbo-v2';
const ASSETS_TO_CACHE = [
    '/',
    'index.html',
    'style.css',
    'favicon.svg',
    'manifest.json',
    'icon.png',
    'icon-192.png',
    // JavaScript
    'js/config.js',
    'js/data.js',
    'js/navigation.js',
    'js/search.js',
    'js/results.js',
    'js/study.js',
    'js/ui.js',
    'js/audio.js',
    'js/pages.js',
    'js/app.js'
];

// ============ SERVICE WORKER - SOLA VERBO ============
const CACHE_NAME = 'sola-verbo-v5';

// Instalar
self.addEventListener('install', event => {
    console.log('📦 Service Worker instalando...');
    // Pular waiting para ativar imediatamente
    self.skipWaiting();
});

// Ativar
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker ativado!');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('🗑️ Removendo cache antigo:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch - Cache conforme usa (sem addAll)
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Para JSONs da Bíblia - Network First, sem cache
    if (url.pathname.includes('/data/') && url.pathname.endsWith('.json')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
        return;
    }
    
    // Para outros arquivos - Cache First
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then(response => {
                    // Só cachear respostas válidas
                    if (response && response.status === 200 && response.type === 'basic') {
                        const clonedResponse = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            try {
                                cache.put(event.request, clonedResponse);
                            } catch(e) {}
                        });
                    }
                    return response;
                });
            })
    );
});