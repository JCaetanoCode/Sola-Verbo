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

// Instalar o Service Worker
self.addEventListener('install', event => {
    console.log('📦 Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('🗂️ Cacheando assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('✅ Assets cacheados com sucesso!');
                return self.skipWaiting();
            })
    );
});

// Ativar o Service Worker
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

// Interceptar requisições - Cache First para dados, Network First para JSONs
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Para arquivos JSON (dados da Bíblia) - Network First
    if (url.pathname.endsWith('.json')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Clonar resposta para cache
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => {
                    // Se offline, tentar cache
                    return caches.match(event.request);
                })
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
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clonedResponse);
                    });
                    return response;
                });
            })
    );
});

// Mensagem de atualização
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});