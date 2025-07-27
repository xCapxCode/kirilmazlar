/**
 * ===========================================
 * KIRIILMAZLAR PANEL - SERVICE WORKER MANAGER
 * Service Worker registration and management
 * ===========================================
 */

import logger from './productionLogger.js';

class ServiceWorkerManager {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
    this.registration = null;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Register service worker
   */
  async register() {
    if (!this.isSupported) {
      logger.warn('Service Worker not supported in this browser');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      logger.system('Service Worker registered successfully');

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdate();
      });

      // Check for existing service worker
      if (this.registration.active) {
        logger.system('Service Worker is active');
      }

      return this.registration;
    } catch (error) {
      logger.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Handle service worker updates
   */
  handleUpdate() {
    const newWorker = this.registration.installing;

    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is available
          this.showUpdateNotification();
        }
      });
    }
  }

  /**
   * Show update notification to user
   */
  showUpdateNotification() {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
    `;

    notification.innerHTML = `
      <div>
        <strong>Güncelleme Mevcut</strong>
        <div style="margin-top: 4px; font-size: 12px;">
          Uygulamanın yeni sürümü hazır. Sayfayı yenileyin.
        </div>
        <button onclick="window.location.reload()" style="
          margin-top: 8px;
          background: white;
          color: #2563eb;
          border: none;
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">
          Yenile
        </button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-left: 8px;
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">
          Sonra
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);

    logger.system('Update notification shown to user');
  }

  /**
   * Force update service worker
   */
  async forceUpdate() {
    if (!this.registration) return;

    try {
      await this.registration.update();
      logger.system('Service Worker update forced');
    } catch (error) {
      logger.error('Failed to force Service Worker update:', error);
    }
  }

  /**
   * Unregister service worker
   */
  async unregister() {
    if (!this.registration) return;

    try {
      await this.registration.unregister();
      logger.system('Service Worker unregistered');
    } catch (error) {
      logger.error('Failed to unregister Service Worker:', error);
    }
  }

  /**
   * Cache management
   */
  async clearCaches() {
    if (!this.isSupported) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      logger.system('All caches cleared');
    } catch (error) {
      logger.error('Failed to clear caches:', error);
    }
  }

  /**
   * Check cache storage usage
   */
  async getCacheUsage() {
    if (!this.isSupported || !navigator.storage?.estimate) {
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota,
        usage: estimate.usage,
        usagePercent: Math.round((estimate.usage / estimate.quota) * 100)
      };
    } catch (error) {
      logger.error('Failed to get cache usage:', error);
      return null;
    }
  }

  /**
   * Background sync registration
   */
  async registerBackgroundSync(tag) {
    if (!this.registration?.sync) {
      logger.warn('Background sync not supported');
      return;
    }

    try {
      await this.registration.sync.register(tag);
      logger.debug(`Background sync registered: ${tag}`);
    } catch (error) {
      logger.error(`Failed to register background sync ${tag}:`, error);
    }
  }

  /**
   * Push notification subscription
   */
  async subscribeToPushNotifications() {
    if (!this.registration?.pushManager) {
      logger.warn('Push notifications not supported');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.getVapidKey()
      });

      logger.system('Push notification subscription created');
      return subscription;
    } catch (error) {
      logger.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Get VAPID key for push notifications
   */
  getVapidKey() {
    // In a real application, this would be your VAPID public key
    return null;
  }

  /**
   * Message service worker
   */
  async messageServiceWorker(message) {
    if (!navigator.serviceWorker.controller) return;

    try {
      const messageChannel = new MessageChannel();

      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };

        navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
      });
    } catch (error) {
      logger.error('Failed to message service worker:', error);
      return null;
    }
  }

  /**
   * Get service worker version
   */
  async getVersion() {
    return await this.messageServiceWorker({ type: 'GET_VERSION' });
  }

  /**
   * Check if running in PWA mode
   */
  isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  /**
   * Initialize service worker manager
   */
  async initialize() {
    if (!this.isProduction) {
      logger.debug('Service Worker disabled in development mode');
      return;
    }

    try {
      await this.register();

      // Check cache usage periodically
      setInterval(async () => {
        const usage = await this.getCacheUsage();
        if (usage && usage.usagePercent > 80) {
          logger.warn('High cache usage detected:', usage);
        }
      }, 60000); // Check every minute

      logger.system('ServiceWorkerManager initialized successfully');
    } catch (error) {
      logger.error('ServiceWorkerManager initialization failed:', error);
    }
  }
}

// Create singleton instance
const serviceWorkerManager = new ServiceWorkerManager();

export default serviceWorkerManager;
