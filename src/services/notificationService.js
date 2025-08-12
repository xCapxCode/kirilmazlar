/**
 * Notification Service
 * Sistem genelinde bildirim yönetimi
 */

import logger from '@utils/productionLogger';

class NotificationService {
  constructor() {
    this.listeners = [];
    this.notifications = this.loadNotifications();
  }

  /**
   * Bildirimler LocalStorage'dan yükle
   */
  loadNotifications() {
    try {
      const saved = localStorage.getItem('systemNotifications');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      logger.error('Bildirimler yüklenirken hata:', error);
      return [];
    }
  }

  /**
   * Bildirimler LocalStorage'a kaydet
   */
  saveNotifications() {
    try {
      localStorage.setItem('systemNotifications', JSON.stringify(this.notifications));
    } catch (error) {
      logger.error('Bildirimler kaydedilirken hata:', error);
    }
  }

  /**
   * Yeni bildirim ekle
   */
  addNotification(notification) {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    this.notifications.unshift(newNotification);

    // Max 100 bildirim tut
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.saveNotifications();
    this.notifyListeners('added', newNotification);

    // Global event dispatch
    window.dispatchEvent(new CustomEvent('newSystemNotification', {
      detail: newNotification
    }));

    return newNotification.id;
  }

  /**
   * Bildirim okundu işaretle
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners('read', notification);
    }
  }

  /**
   * Tüm bildirimleri okundu işaretle
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners('allRead');
  }

  /**
   * Bildirim sil
   */
  removeNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifyListeners('removed', notificationId);
  }

  /**
   * Tüm bildirimleri temizle
   */
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners('cleared');
  }

  /**
   * Bildirimleri getir
   */
  getNotifications() {
    return this.notifications;
  }

  /**
   * Okunmamış bildirim sayısı
   */
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Event listener ekle
   */
  addListener(listener) {
    this.listeners.push(listener);
  }

  /**
   * Event listener kaldır
   */
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Listeners'a bildir
   */
  notifyListeners(action, data) {
    this.listeners.forEach(listener => {
      try {
        listener(action, data);
      } catch (error) {
        logger.error('Listener error:', error);
      }
    });
  }

  /**
   * Sipariş bildirimi
   */
  notifyNewOrder(order) {
    return this.addNotification({
      type: 'info',
      title: 'Yeni Sipariş',
      message: `${order.customerName || 'Müşteri'} tarafından yeni sipariş verildi.`,
      icon: 'ShoppingCart',
      metadata: { orderId: order.id, type: 'order' }
    });
  }

  /**
   * Stok uyarısı
   */
  notifyLowStock(product) {
    return this.addNotification({
      type: 'warning',
      title: 'Stok Uyarısı',
      message: `${product.name} ürününün stoku azalıyor (${product.stock} adet kaldı).`,
      icon: 'AlertTriangle',
      metadata: { productId: product.id, type: 'stock' }
    });
  }

  /**
   * Sipariş durum güncellemesi
   */
  notifyOrderStatusUpdate(order, newStatus) {
    const statusMessages = {
      'Onaylandı': 'onaylandı',
      'Hazırlanıyor': 'hazırlanmaya başlandı',
      'Teslim Edildi': 'teslim edildi',
      'İptal Edildi': 'iptal edildi'
    };

    return this.addNotification({
      type: newStatus === 'Teslim Edildi' ? 'success' : 'info',
      title: 'Sipariş Durumu',
      message: `${order.id} numaralı sipariş ${statusMessages[newStatus] || newStatus}.`,
      icon: newStatus === 'Teslim Edildi' ? 'CheckCircle' : 'Package',
      metadata: { orderId: order.id, status: newStatus, type: 'order_status' }
    });
  }

  /**
   * Yeni müşteri bildirimi
   */
  notifyNewCustomer(customer) {
    return this.addNotification({
      type: 'info',
      title: 'Yeni Müşteri',
      message: `${customer.name} sisteme yeni müşteri olarak kaydoldu.`,
      icon: 'UserPlus',
      metadata: { customerId: customer.id, type: 'customer' }
    });
  }

  /**
   * Sistem bildirimi
   */
  notifySystem(title, message, type = 'info') {
    return this.addNotification({
      type,
      title,
      message,
      icon: type === 'error' ? 'AlertCircle' : 'Info',
      metadata: { type: 'system' }
    });
  }
}

// Singleton instance
const notificationService = new NotificationService();

export default notificationService;
