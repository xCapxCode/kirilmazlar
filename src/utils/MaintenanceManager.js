/**
 * ===========================================
 * KIRIILMAZLAR PANEL - MAINTENANCE MANAGER
 * Maintenance mode and graceful shutdown
 * ===========================================
 */

import logger from '../utils/productionLogger.js';

class MaintenanceManager {
  constructor() {
    this.isMaintenanceMode = false;
    this.maintenanceConfig = {
      startTime: null,
      endTime: null,
      message: 'Sistem bakımda. Lütfen daha sonra tekrar deneyin.',
      allowedUsers: [], // Admin users who can access during maintenance
      bypassRoutes: ['/health', '/status', '/admin/maintenance'], // Routes that work during maintenance
      redirectUrl: '/maintenance'
    };

    this.shutdownConfig = {
      gracefulShutdownTime: 30000, // 30 seconds
      warningTime: 60000, // 1 minute warning before shutdown
      isShuttingDown: false
    };

    this.maintenanceCheckInterval = null;
  }

  /**
   * Initialize maintenance manager
   */
  initialize() {
    try {
      this.checkMaintenanceStatus();
      this.setupMaintenanceMonitoring();
      this.setupBeforeUnloadHandler();

      logger.system('MaintenanceManager initialized successfully');
    } catch (error) {
      logger.error('MaintenanceManager initialization failed:', error);
    }
  }

  /**
   * Check if maintenance mode is active
   */
  checkMaintenanceStatus() {
    const storedConfig = localStorage.getItem('maintenanceConfig');
    if (storedConfig) {
      try {
        const config = JSON.parse(storedConfig);
        const now = Date.now();

        if (config.startTime && config.endTime) {
          if (now >= config.startTime && now <= config.endTime) {
            this.enableMaintenanceMode(config);
          } else if (now > config.endTime) {
            // Maintenance period ended
            this.disableMaintenanceMode();
            localStorage.removeItem('maintenanceConfig');
          }
        }
      } catch (error) {
        logger.error('Failed to parse maintenance config:', error);
        localStorage.removeItem('maintenanceConfig');
      }
    }
  }

  /**
   * Setup maintenance monitoring
   */
  setupMaintenanceMonitoring() {
    // Check maintenance status every minute
    this.maintenanceCheckInterval = setInterval(() => {
      this.checkMaintenanceStatus();
    }, 60000);

    // Listen for maintenance messages from server
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'maintenance') {
          this.handleMaintenanceMessage(event.data);
        }
      });
    }
  }

  /**
   * Handle maintenance message from server/service worker
   */
  handleMaintenanceMessage(data) {
    if (data.action === 'enable') {
      this.enableMaintenanceMode(data.config);
    } else if (data.action === 'disable') {
      this.disableMaintenanceMode();
    } else if (data.action === 'schedule') {
      this.scheduleMaintenanceMode(data.config);
    }
  }

  /**
   * Enable maintenance mode
   */
  enableMaintenanceMode(config = {}) {
    this.isMaintenanceMode = true;
    this.maintenanceConfig = {
      ...this.maintenanceConfig,
      ...config,
      startTime: config.startTime || Date.now()
    };

    // Show maintenance notification
    this.showMaintenanceNotification();

    // Redirect if not on allowed route
    if (!this.isRouteAllowed(window.location.pathname)) {
      this.redirectToMaintenancePage();
    }

    // Disable non-essential functionality
    this.disableNonEssentialFeatures();

    logger.system('Maintenance mode enabled:', this.maintenanceConfig);
  }

  /**
   * Disable maintenance mode
   */
  disableMaintenanceMode() {
    this.isMaintenanceMode = false;
    this.maintenanceConfig.startTime = null;
    this.maintenanceConfig.endTime = null;

    // Re-enable functionality
    this.enableAllFeatures();

    // Hide maintenance notification
    this.hideMaintenanceNotification();

    // Refresh page if on maintenance page
    if (window.location.pathname === this.maintenanceConfig.redirectUrl) {
      window.location.href = '/';
    }

    logger.system('Maintenance mode disabled');
  }

  /**
   * Schedule maintenance mode
   */
  scheduleMaintenanceMode(config) {
    const scheduledConfig = {
      ...this.maintenanceConfig,
      ...config
    };

    // Store scheduled maintenance
    localStorage.setItem('maintenanceConfig', JSON.stringify(scheduledConfig));

    // Show pre-maintenance notification
    this.showPreMaintenanceNotification(config);

    logger.system('Maintenance mode scheduled:', scheduledConfig);
  }

  /**
   * Check if current route is allowed during maintenance
   */
  isRouteAllowed(pathname) {
    return this.maintenanceConfig.bypassRoutes.some(route =>
      pathname.startsWith(route)
    );
  }

  /**
   * Check if current user can bypass maintenance
   */
  canUserBypassMaintenance() {
    // Check if current user is in allowed users list
    const currentUser = this.getCurrentUser();
    return currentUser && this.maintenanceConfig.allowedUsers.includes(currentUser.id);
  }

  /**
   * Get current user (placeholder)
   */
  getCurrentUser() {
    // This would integrate with your auth system
    try {
      const authData = localStorage.getItem('auth');
      return authData ? JSON.parse(authData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Show maintenance notification
   */
  showMaintenanceNotification() {
    // Remove existing notification
    this.hideMaintenanceNotification();

    const notification = document.createElement('div');
    notification.id = 'maintenance-notification';
    notification.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #f59e0b;
      color: white;
      padding: 12px 20px;
      text-align: center;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    const endTime = this.maintenanceConfig.endTime;
    const endTimeStr = endTime ? new Date(endTime).toLocaleString('tr-TR') : 'bilinmiyor';

    notification.innerHTML = `
      <div>
        <strong>🔧 Bakım Modu Aktif</strong>
        <span style="margin-left: 16px;">${this.maintenanceConfig.message}</span>
        <span style="margin-left: 16px;">Bitiş: ${endTimeStr}</span>
      </div>
    `;

    document.body.insertBefore(notification, document.body.firstChild);

    // Adjust body padding to account for notification
    document.body.style.paddingTop = '48px';
  }

  /**
   * Hide maintenance notification
   */
  hideMaintenanceNotification() {
    const notification = document.getElementById('maintenance-notification');
    if (notification) {
      notification.remove();
      document.body.style.paddingTop = '';
    }
  }

  /**
   * Show pre-maintenance notification
   */
  showPreMaintenanceNotification(config) {
    const startTime = new Date(config.startTime).toLocaleString('tr-TR');

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 350px;
    `;

    notification.innerHTML = `
      <div>
        <strong>📅 Planlı Bakım</strong>
        <div style="margin-top: 8px; font-size: 13px;">
          Sistem bakımı planlandı: ${startTime}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-top: 12px;
          background: white;
          color: #3b82f6;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">
          Tamam
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 30000);
  }

  /**
   * Redirect to maintenance page
   */
  redirectToMaintenancePage() {
    if (window.location.pathname !== this.maintenanceConfig.redirectUrl) {
      window.location.href = this.maintenanceConfig.redirectUrl;
    }
  }

  /**
   * Disable non-essential features during maintenance
   */
  disableNonEssentialFeatures() {
    // Disable API calls except for essential ones
    this.interceptAPIRequests();

    // Disable user interactions that might cause issues
    this.disableUserInteractions();

    // Clear any running intervals/timers
    this.pauseBackgroundTasks();
  }

  /**
   * Re-enable all features
   */
  enableAllFeatures() {
    // Re-enable API calls
    this.restoreAPIRequests();

    // Re-enable user interactions
    this.enableUserInteractions();

    // Resume background tasks
    this.resumeBackgroundTasks();
  }

  /**
   * Intercept API requests during maintenance
   */
  interceptAPIRequests() {
    if (!window.originalFetch) {
      window.originalFetch = window.fetch;
    }

    window.fetch = async (...args) => {
      const url = args[0];

      // Allow essential API calls
      const essentialEndpoints = ['/health', '/status', '/auth/refresh'];
      const isEssential = essentialEndpoints.some(endpoint => url.includes(endpoint));

      if (!isEssential) {
        throw new Error('Service temporarily unavailable due to maintenance');
      }

      return window.originalFetch(...args);
    };
  }

  /**
   * Restore API requests
   */
  restoreAPIRequests() {
    if (window.originalFetch) {
      window.fetch = window.originalFetch;
      delete window.originalFetch;
    }
  }

  /**
   * Disable user interactions
   */
  disableUserInteractions() {
    // Add overlay to prevent interactions
    const overlay = document.createElement('div');
    overlay.id = 'maintenance-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.1);
      z-index: 9999;
      pointer-events: auto;
      cursor: not-allowed;
    `;

    document.body.appendChild(overlay);
  }

  /**
   * Enable user interactions
   */
  enableUserInteractions() {
    const overlay = document.getElementById('maintenance-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Pause background tasks
   */
  pauseBackgroundTasks() {
    // This would pause things like periodic data fetching, notifications, etc.
    logger.debug('Background tasks paused for maintenance');
  }

  /**
   * Resume background tasks
   */
  resumeBackgroundTasks() {
    // Resume paused background tasks
    logger.debug('Background tasks resumed after maintenance');
  }

  /**
   * Setup before unload handler for graceful shutdown
   */
  setupBeforeUnloadHandler() {
    window.addEventListener('beforeunload', (event) => {
      if (this.shutdownConfig.isShuttingDown) {
        event.preventDefault();
        event.returnValue = 'Sistem kapatılıyor, lütfen bekleyin...';
        return event.returnValue;
      }
    });
  }

  /**
   * Initiate graceful shutdown
   */
  initiateGracefulShutdown() {
    if (this.shutdownConfig.isShuttingDown) return;

    this.shutdownConfig.isShuttingDown = true;

    // Show shutdown warning
    this.showShutdownWarning();

    // Perform graceful shutdown steps
    setTimeout(() => {
      this.performGracefulShutdown();
    }, this.shutdownConfig.warningTime);

    logger.system('Graceful shutdown initiated');
  }

  /**
   * Show shutdown warning
   */
  showShutdownWarning() {
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #dc2626;
      color: white;
      padding: 20px 30px;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      z-index: 10001;
      font-family: system-ui, -apple-system, sans-serif;
      text-align: center;
    `;

    warning.innerHTML = `
      <div>
        <strong>⚠️ Sistem Kapatılıyor</strong>
        <div style="margin-top: 12px;">
          Lütfen işlemlerinizi kaydedin. Sistem 1 dakika içinde kapatılacak.
        </div>
      </div>
    `;

    document.body.appendChild(warning);
  }

  /**
   * Perform graceful shutdown
   */
  performGracefulShutdown() {
    try {
      // Save any pending data
      this.savePendingData();

      // Close connections
      this.closeConnections();

      // Clear sensitive data
      this.clearSensitiveData();

      logger.system('Graceful shutdown completed');

      // Redirect to shutdown page or close
      window.location.href = '/shutdown';

    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
    }
  }

  /**
   * Save any pending data
   */
  savePendingData() {
    // Save any unsaved form data, drafts, etc.
    logger.debug('Saving pending data before shutdown');
  }

  /**
   * Close connections
   */
  closeConnections() {
    // Close WebSocket connections, EventSource, etc.
    logger.debug('Closing connections before shutdown');
  }

  /**
   * Clear sensitive data
   */
  clearSensitiveData() {
    // Clear any sensitive data from memory/storage if needed
    logger.debug('Clearing sensitive data before shutdown');
  }

  /**
   * Get maintenance status
   */
  getMaintenanceStatus() {
    return {
      isMaintenanceMode: this.isMaintenanceMode,
      config: this.maintenanceConfig,
      canBypass: this.canUserBypassMaintenance(),
      shutdownStatus: this.shutdownConfig
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.maintenanceCheckInterval) {
      clearInterval(this.maintenanceCheckInterval);
    }

    this.hideMaintenanceNotification();
    this.enableAllFeatures();

    logger.system('MaintenanceManager cleaned up');
  }
}

// Create singleton instance
const maintenanceManager = new MaintenanceManager();

// Global maintenance functions
window.enableMaintenance = (config) => maintenanceManager.enableMaintenanceMode(config);
window.disableMaintenance = () => maintenanceManager.disableMaintenanceMode();
window.scheduleMaintenance = (config) => maintenanceManager.scheduleMaintenanceMode(config);
window.getMaintenanceStatus = () => maintenanceManager.getMaintenanceStatus();
window.initiateShutdown = () => maintenanceManager.initiateGracefulShutdown();

export default maintenanceManager;
