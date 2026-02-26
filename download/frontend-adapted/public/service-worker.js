/**
 * Service Worker - Institution AL HANANE
 * Gestion du cache et des notifications push
 */

const CACHE_NAME = 'alhanane-v2.0.0';
const STATIC_CACHE_NAME = 'alhanane-static-v2.0.0';
const DYNAMIC_CACHE_NAME = 'alhanane-dynamic-v2.0.0';

// Fichiers à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation terminée');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erreur installation:', error);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name !== STATIC_CACHE_NAME && 
                     name !== DYNAMIC_CACHE_NAME &&
                     name !== CACHE_NAME;
            })
            .map((name) => {
              console.log('[SW] Suppression ancien cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activé');
        return self.clients.claim();
      })
  );
});

// Stratégie de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers l'API (toujours en ligne)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Retourner une réponse d'erreur hors ligne
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: { 
                code: 'offline', 
                message: 'Vous êtes hors ligne. Veuillez vérifier votre connexion.' 
              } 
            }),
            { 
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        })
    );
    return;
  }

  // Stratégie: Network First, puis Cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Mettre en cache la réponse pour les requêtes réussies
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // En cas d'échec, utiliser le cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Si pas de cache et c'est une page HTML, afficher la page offline
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            return new Response('Ressource non disponible hors ligne', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// ========================================
// NOTIFICATIONS PUSH FCM
// ========================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push reçu:', event);

  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        notification: {
          title: 'Institution AL HANANE',
          body: event.data.text()
        }
      };
    }
  }

  const notification = data.notification || {};
  const payload = data.data || {};

  const options = {
    body: notification.body || 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: payload.deeplink || '/',
      kind: payload.kind || 'general',
      id: payload.id || null,
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ],
    tag: payload.kind ? `notification-${payload.kind}` : 'general-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(
      notification.title || 'Institution AL HANANE',
      options
    )
  );
});

// Gestion du clic sur la notification
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clic notification:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === 'close') {
    return;
  }

  // Ouvrir l'application ou la mettre au premier plan
  const urlToOpen = data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Chercher une fenêtre existante
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        
        // Ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Gestion de la fermeture de notification
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification fermée:', event);
});

// ========================================
// SYNCHRONISATION EN ARRIÈRE-PLAN
// ========================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Sync:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(
      syncPendingData()
    );
  }
});

async function syncPendingData() {
  console.log('[SW] Synchronisation des données en attente...');
}

// ========================================
// MESSAGES DEPUIS L'APPLICATION
// ========================================

self.addEventListener('message', (event) => {
  console.log('[SW] Message reçu:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service Worker chargé -', CACHE_NAME);
