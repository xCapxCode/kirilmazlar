import storage from '@core/storage';
import logger from '@utils/productionLogger';

/**
 * Eski siparişleri temizleme utility'si
 * Belirli bir tarihten önce oluşturulmuş siparişleri temizler
 */
class OrderCleanupUtil {
  /**
   * Belirli bir tarihten önce oluşturulmuş siparişleri temizler
   * @param {number} days - Kaç günden eski siparişlerin temizleneceği
   * @returns {Promise<number>} - Temizlenen sipariş sayısı
   */
  async cleanupOldOrders(days = 30) {
    try {
      // Hem customer_orders hem de orders storage'larından veri al
      const customerOrders = await storage.get('customer_orders', []);
      const sellerOrders = await storage.get('orders', []);

      // Temizleme tarihini hesapla
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Eski siparişleri filtrele
      const newCustomerOrders = customerOrders.filter(order => {
        const orderDate = new Date(order.orderDate || order.createdAt || order.created_at);
        return orderDate >= cutoffDate || order.status === 'Beklemede' || order.status === 'Onaylandı' || order.status === 'Hazırlanıyor';
      });

      const newSellerOrders = sellerOrders.filter(order => {
        const orderDate = new Date(order.orderDate || order.createdAt || order.created_at);
        return orderDate >= cutoffDate || order.status === 'Beklemede' || order.status === 'Onaylandı' || order.status === 'Hazırlanıyor';
      });

      // Temizlenen sipariş sayısını hesapla
      const cleanedCustomerOrders = customerOrders.length - newCustomerOrders.length;
      const cleanedSellerOrders = sellerOrders.length - newSellerOrders.length;

      // Storage'ı güncelle
      await storage.set('customer_orders', newCustomerOrders);
      await storage.set('orders', newSellerOrders);

      return cleanedCustomerOrders + cleanedSellerOrders;
    } catch (error) {
      logger.error('Eski siparişler temizlenirken hata:', error);
      throw error;
    }
  }

  /**
   * Tamamlanan siparişleri arşivler
   * @returns {Promise<number>} - Arşivlenen sipariş sayısı
   */
  async archiveCompletedOrders() {
    try {
      // Hem customer_orders hem de orders storage'larından veri al
      const customerOrders = await storage.get('customer_orders', []);
      const sellerOrders = await storage.get('orders', []);

      // Arşivlenecek siparişleri filtrele
      const ordersToArchive = customerOrders.filter(order =>
        order.status === 'Teslim Edildi' || order.status === 'İptal Edildi'
      );

      // Arşivlenecek sipariş yoksa işlemi sonlandır
      if (ordersToArchive.length === 0) {
        return 0;
      }

      // Arşiv storage'ını al
      const archivedOrders = await storage.get('archived_orders', []);

      // Arşive ekle
      const updatedArchivedOrders = [...archivedOrders, ...ordersToArchive];

      // Aktif siparişleri filtrele
      const activeCustomerOrders = customerOrders.filter(order =>
        order.status !== 'Teslim Edildi' && order.status !== 'İptal Edildi'
      );

      const activeSellerOrders = sellerOrders.filter(order =>
        order.status !== 'Teslim Edildi' && order.status !== 'İptal Edildi'
      );

      // Storage'ı güncelle
      await storage.set('archived_orders', updatedArchivedOrders);
      await storage.set('customer_orders', activeCustomerOrders);
      await storage.set('orders', activeSellerOrders);

      return ordersToArchive.length;
    } catch (error) {
      logger.error('Tamamlanan siparişler arşivlenirken hata:', error);
      throw error;
    }
  }

  /**
   * Arşivlenen siparişleri getirir
   * @returns {Promise<Array>} - Arşivlenen sipariş listesi
   */
  async getArchivedOrders() {
    try {
      return await storage.get('archived_orders', []);
    } catch (error) {
      logger.error('Arşivlenen siparişler yüklenirken hata:', error);
      throw error;
    }
  }

  /**
   * Arşivlenen siparişleri temizler
   * @returns {Promise<number>} - Temizlenen sipariş sayısı
   */
  async clearArchivedOrders() {
    try {
      const archivedOrders = await storage.get('archived_orders', []);
      await storage.set('archived_orders', []);
      return archivedOrders.length;
    } catch (error) {
      logger.error('Arşivlenen siparişler temizlenirken hata:', error);
      throw error;
    }
  }
}

export default new OrderCleanupUtil();