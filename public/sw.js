/**
 * ===========================================
 * KIRIILMAZLAR PANEL - SERVICE WORKER
 * Caching strategy and offline functionality
 * ===========================================
 */

const CACHE_NAME = 'kirilmazlar-panel-v1.0.0';
const STATIC_CACHE = 'kirilmazlar-static-v1';
const DYNAMIC_CACHE = 'kirilmazlar-dynamic-v1';
const API_CACHE = 'kirilmazlar-api-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico'
];

// Dynamic cache patterns
const CACHE_PATTERNS = {
  images: /\.(png|jpg|jpeg|svg|gif|webp)$/i,
  fonts: /\.(woff|woff2|ttf|otf)$/i,
  styles: /\.css$/i,
  scripts: /\.js$/i
};

// API cache patterns
const API_PATTERNS = {
  products: /\/api\/products/,
  customers: /\/api\/customers/,
  orders: /\/api\/orders/
};

// Cache first strategy for static assets
const cacheFirst = async (request) => {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    throw error;
  }
};

// Network first strategy for API calls
const networkFirst = async (request) => {
  try {
    const fresh = await fetch(request);

    if (fresh.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, fresh.clone());
    }

    return fresh;
  } catch (error) {
    const cache = await caches.open(API_CACHE);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    throw error;
  }
};

// Stale while revalidate for dynamic content
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(fresh => {
    if (fresh.ok) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  }).catch(error => {
    console.error('Stale while revalidate fetch failed:', error);
    return cached;
  });

  return cached || await fetchPromise;
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleaned up');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('[SW] Cache cleanup failed:', error);
      })
  );
});

// Fetch event - route requests to appropriate caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // API requests - network first
        if (Object.values(API_PATTERNS).some(pattern => pattern.test(url.pathname))) {
          return await networkFirst(request);
        }

        // Static assets - cache first
        if (STATIC_ASSETS.includes(url.pathname) ||
          Object.values(CACHE_PATTERNS).some(pattern => pattern.test(url.pathname))) {
          return await cacheFirst(request);
        }

        // Dynamic content - stale while revalidate
        if (url.origin === self.location.origin) {
          return await staleWhileRevalidate(request);
        }

        // External resources - network only
        return await fetch(request);

      } catch (error) {
        console.error('[SW] Fetch failed:', error);

        // Return offline fallback for navigation requests
        if (request.mode === 'navigate') {
          const cache = await caches.open(STATIC_CACHE);
          return await cache.match('/index.html');
        }

        throw error;
      }
    })()
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'offline-orders') {
    event.waitUntil(syncOfflineOrders());
  }

  if (event.tag === 'offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline orders when connection is restored
async function syncOfflineOrders() {
  try {
    console.log('[SW] Syncing offline orders...');

    // Get offline orders from IndexedDB or localStorage
    const offlineOrders = await getOfflineOrders();

    for (const order of offlineOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        });

        if (response.ok) {
          await removeOfflineOrder(order.id);
          console.log('[SW] Offline order synced:', order.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync offline order:', order.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Offline orders sync failed:', error);
  }
}

// Sync other offline data
async function syncOfflineData() {
  try {
    console.log('[SW] Syncing offline data...');

    // Implement offline data sync logic
    const offlineData = await getOfflineData();

    // Sync customer updates
    if (offlineData.customers) {
      for (const customer of offlineData.customers) {
        try {
          await fetch(`/api/customers/${customer.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(customer)
          });
        } catch (error) {
          console.error('[SW] Failed to sync customer:', customer.id, error);
        }
      }
    }

    console.log('[SW] Offline data sync completed');
  } catch (error) {
    console.error('[SW] Offline data sync failed:', error);
  }
}

// Helper functions for offline data management
async function getOfflineOrders() {
  // This would typically use IndexedDB
  // For now, return empty array
  return [];
}

async function removeOfflineOrder(orderId) {
  // Remove from IndexedDB
  console.log('[SW] Removing offline order:', orderId);
}

async function getOfflineData() {
  // Get offline data from IndexedDB
  return {
    customers: [],
    products: []
  };
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Kırılmazlar Panel', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME
    });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);

  if (event.tag === 'data-refresh') {
    event.waitUntil(refreshCriticalData());
  }
});

// Refresh critical data in the background
async function refreshCriticalData() {
  try {
    console.log('[SW] Refreshing critical data...');

    const criticalEndpoints = [
      '/api/products',
      '/api/customers'
    ];

    for (const endpoint of criticalEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const cache = await caches.open(API_CACHE);
          await cache.put(endpoint, response.clone());
        }
      } catch (error) {
        console.error('[SW] Failed to refresh data from:', endpoint, error);
      }
    }

    console.log('[SW] Critical data refresh completed');
  } catch (error) {
    console.error('[SW] Critical data refresh failed:', error);
  }
}

console.log('[SW] Service worker script loaded');
