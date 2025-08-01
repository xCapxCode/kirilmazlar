// Sipariş senkronizasyon yardımcı fonksiyonları
import storage from '@core/storage';
import logger from '@utils/logger';

export const orderSyncUtils = {
  // Sipariş durumu güncelleme
  updateOrderStatus: (orderId, newStatus, notes = '') => {
    try {
      // Her iki storage'ı da güncelle
      const allOrders = storage.get('orders', []);
      const customerOrders = storage.get('customer_orders', []);

      const updatedAllOrders = allOrders.map(order =>
        order.id === orderId
          ? {
            ...order,
            status: newStatus,
            statusNotes: notes,
            updatedAt: new Date().toISOString()
          }
          : order
      );

      const updatedCustomerOrders = customerOrders.map(order =>
        order.id === orderId
          ? {
            ...order,
            status: newStatus,
            statusNotes: notes,
            updatedAt: new Date().toISOString()
          }
          : order
      );

      storage.set('orders', updatedAllOrders);
      storage.set('customer_orders', updatedCustomerOrders);

      return { success: true };
    } catch (error) {
      logger.error('Sipariş durumu güncellenirken hata:', error);
      return { success: false, error };
    }
  },

  // Sipariş silme
  deleteOrder: (orderId) => {
    try {
      // Her iki storage'dan da sil
      const allOrders = storage.get('orders', []);
      const customerOrders = storage.get('customer_orders', []);

      const filteredAllOrders = allOrders.filter(order => order.id !== orderId);
      const filteredCustomerOrders = customerOrders.filter(order => order.id !== orderId);

      storage.set('orders', filteredAllOrders);
      storage.set('customer_orders', filteredCustomerOrders);

      return { success: true };
    } catch (error) {
      logger.error('Sipariş silinirken hata:', error);
      return { success: false, error };
    }
  },

  // Yeni sipariş ekleme (müşteriden gelene)
  addOrder: (orderData) => {
    try {
      const orderId = `order-${Date.now()}`;
      const currentUser = storage.get('currentUser');

      const newOrder = {
        id: orderId,
        customerId: currentUser?.id || 'customer-1',
        customerName: currentUser?.name || currentUser?.full_name || 'Müşteri',
        customerPhone: currentUser?.phone || '0555 000 0000',
        customerAddress: orderData.deliveryAddress || 'Adres belirtilmemiş',
        items: orderData.items || [],
        subtotal: orderData.total - 15, // Teslimat ücreti çıkarılmış
        deliveryFee: 15.00,
        total: orderData.total,
        status: 'pending',
        paymentMethod: 'cash',
        notes: orderData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Hem orders hem customer_orders storage'ına kaydet
      const allOrders = storage.get('orders', []);
      const customerOrders = storage.get('customer_orders', []);

      allOrders.push(newOrder);
      customerOrders.push(newOrder);

      storage.set('orders', allOrders);
      storage.set('customer_orders', customerOrders);

      logger.info('✅ Yeni sipariş her iki storage\'a da kaydedildi:', orderId);
      return orderId; // Sadece ID döndür (CartContext bunu bekliyor)
    } catch (error) {
      logger.error('Sipariş eklenirken hata:', error);
      return null;
    }
  },

  // Tüm siparişleri temizle
  clearAllOrders: () => {
    storage.set('orders', []);
    logger.info('✅ Tüm siparişler temizlendi');
  }
};

export default orderSyncUtils;
