import storage from '@core/storage';
import logger from '@utils/productionLogger';

/**
 * Sipariş durumu senkronizasyonu için utility
 * Müşteri ve satıcı siparişlerini senkronize eder
 */
class OrderSyncUtil {
  /**
   * Müşteri ve satıcı siparişlerini senkronize eder
   * @returns {Promise<number>} - Senkronize edilen sipariş sayısı
   */
  async syncOrders() {
    try {
      // Hem customer_orders hem de orders storage'larından veri al
      const customerOrders = await storage.get('customer_orders', []);
      const sellerOrders = await storage.get('orders', []);

      let syncCount = 0;

      // Tüm siparişleri birleştir (ID'ye göre)
      const allOrdersMap = new Map();

      // Önce müşteri siparişlerini ekle
      customerOrders.forEach(order => {
        allOrdersMap.set(order.id, {
          ...order,
          source: 'customer'
        });
      });

      // Sonra satıcı siparişlerini ekle veya güncelle
      sellerOrders.forEach(order => {
        const existingOrder = allOrdersMap.get(order.id);

        if (existingOrder) {
          // Sipariş zaten varsa, en güncel bilgileri kullan
          const customerUpdatedAt = new Date(existingOrder.updatedAt || existingOrder.createdAt || 0);
          const sellerUpdatedAt = new Date(order.updatedAt || order.createdAt || 0);

          // Satıcı güncellemesi daha yeniyse, satıcı bilgilerini kullan
          if (sellerUpdatedAt > customerUpdatedAt) {
            allOrdersMap.set(order.id, {
              ...existingOrder,
              status: order.status,
              statusNotes: order.statusNotes || existingOrder.statusNotes,
              updatedAt: order.updatedAt || new Date().toISOString(),
              lastSyncedAt: new Date().toISOString()
            });
            syncCount++;
          }
          // Müşteri iptal ettiyse, bu durumu her zaman koru
          else if (existingOrder.status === 'İptal Edildi' && order.status !== 'İptal Edildi') {
            allOrdersMap.set(order.id, {
              ...order,
              status: 'İptal Edildi',
              statusNotes: existingOrder.cancelReason || 'Müşteri tarafından iptal edildi',
              cancelReason: existingOrder.cancelReason,
              updatedAt: existingOrder.updatedAt,
              lastSyncedAt: new Date().toISOString()
            });
            syncCount++;
          }
        } else {
          // Sipariş yoksa ekle
          allOrdersMap.set(order.id, {
            ...order,
            source: 'seller',
            lastSyncedAt: new Date().toISOString()
          });
          syncCount++;
        }
      });

      // Normalize edilmiş siparişleri oluştur
      const normalizedOrders = Array.from(allOrdersMap.values()).map(order => {
        return {
          ...order,
          orderNumber: order.orderNumber || order.order_number || `SIP-${order.id}`,
          status: this.normalizeStatus(order.status),
          lastSyncedAt: new Date().toISOString()
        };
      });

      // Müşteri ve satıcı siparişlerini ayır
      const newCustomerOrders = normalizedOrders.map(order => ({
        ...order,
        synced: true
      }));

      const newSellerOrders = normalizedOrders.map(order => ({
        ...order,
        synced: true
      }));

      // Storage'ı güncelle
      await storage.set('customer_orders', newCustomerOrders);
      await storage.set('orders', newSellerOrders);

      logger.success(`Sipariş senkronizasyonu tamamlandı: ${syncCount} sipariş senkronize edildi`);
      return syncCount;
    } catch (error) {
      logger.error('Siparişler senkronize edilirken hata:', error);
      throw error;
    }
  }

  /**
   * Sipariş durumunu normalize eder
   * @param {string} status - Sipariş durumu
   * @returns {string} - Normalize edilmiş sipariş durumu
   */
  normalizeStatus(status) {
    if (!status) return 'Beklemede';

    const statusMap = {
      'pending': 'Beklemede',
      'confirmed': 'Onaylandı',
      'preparing': 'Hazırlanıyor',
      'ready': 'Hazır',
      'shipped': 'Kargoya Verildi',
      'delivered': 'Teslim Edildi',
      'cancelled': 'İptal Edildi',
      'İptal Edildi': 'İptal Edildi',
      'Beklemede': 'Beklemede',
      'Onaylandı': 'Onaylandı',
      'Hazırlanıyor': 'Hazırlanıyor',
      'Hazır': 'Hazır',
      'Kargoya Verildi': 'Kargoya Verildi',
      'Teslim Edildi': 'Teslim Edildi'
    };

    return statusMap[status] || status;
  }

  /**
   * Sipariş durumunu günceller ve senkronize eder
   * @param {number|string} orderId - Sipariş ID'si
   * @param {string} status - Yeni durum
   * @param {string} notes - Durum notları
   * @param {string} source - Güncelleme kaynağı ('customer' veya 'seller')
   * @returns {Promise<Object|null>} - Güncellenen sipariş veya null
   */
  async updateOrderStatus(orderId, status, notes = '', source = 'customer') {
    try {
      // Hem customer_orders hem de orders storage'larını güncelle
      const customerOrders = await storage.get('customer_orders', []);
      const sellerOrders = await storage.get('orders', []);

      // Sipariş var mı kontrol et
      const customerOrder = customerOrders.find(order => order.id === orderId);
      const sellerOrder = sellerOrders.find(order => order.id === orderId);

      if (!customerOrder && !sellerOrder) {
        logger.error(`ID'si ${orderId} olan sipariş bulunamadı`);
        return null;
      }

      const now = new Date().toISOString();
      const normalizedStatus = this.normalizeStatus(status);

      // Customer orders'da güncelle
      const updatedCustomerOrders = customerOrders.map(order =>
        order.id === orderId
          ? {
            ...order,
            status: normalizedStatus,
            statusNotes: notes,
            updatedAt: now,
            updatedBy: source,
            synced: true
          }
          : order
      );

      // Eğer customer orders'da yoksa ve seller orders'da varsa ekle
      if (!customerOrder && sellerOrder) {
        updatedCustomerOrders.push({
          ...sellerOrder,
          status: normalizedStatus,
          statusNotes: notes,
          updatedAt: now,
          updatedBy: source,
          synced: true
        });
      }

      // Seller orders'da güncelle
      const updatedSellerOrders = sellerOrders.map(order =>
        order.id === orderId
          ? {
            ...order,
            status: normalizedStatus,
            statusNotes: notes,
            updatedAt: now,
            updatedBy: source,
            synced: true
          }
          : order
      );

      // Eğer seller orders'da yoksa ve customer orders'da varsa ekle
      if (!sellerOrder && customerOrder) {
        updatedSellerOrders.push({
          ...customerOrder,
          status: normalizedStatus,
          statusNotes: notes,
          updatedAt: now,
          updatedBy: source,
          synced: true
        });
      }

      // Her iki storage'ı da güncelle
      await storage.set('customer_orders', updatedCustomerOrders);
      await storage.set('orders', updatedSellerOrders);

      // Güncellenen siparişi döndür
      const updatedOrder = updatedCustomerOrders.find(order => order.id === orderId) ||
        updatedSellerOrders.find(order => order.id === orderId);

      logger.success(`Sipariş durumu güncellendi: ${orderId} -> ${normalizedStatus} (${source})`);

      return updatedOrder;
    } catch (error) {
      logger.error(`ID'si ${orderId} olan sipariş durumu güncellenirken hata:`, error);
      throw error;
    }
  }

  /**
   * Siparişi iptal eder ve senkronize eder
   * @param {number|string} orderId - Sipariş ID'si
   * @param {string} reason - İptal nedeni
   * @param {string} source - İptal kaynağı ('customer' veya 'seller')
   * @returns {Promise<Object|null>} - Güncellenen sipariş veya null
   */
  async cancelOrder(orderId, reason = '', source = 'customer') {
    try {
      return await this.updateOrderStatus(orderId, 'İptal Edildi', reason, source);
    } catch (error) {
      logger.error(`ID'si ${orderId} olan sipariş iptal edilirken hata:`, error);
      throw error;
    }
  }
}

export default new OrderSyncUtil();