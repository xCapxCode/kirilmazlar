// Sipariş senkronizasyon yardımcı fonksiyonları
// UNIFIED STORAGE KEYS - Her dosya aynı key'leri kullanacak
const STORAGE_KEYS = {
  ORDERS: 'kirilmazlar_orders',
  SELLER_ORDERS: 'kirilmazlar_seller_orders',  
  CUSTOMER_ORDERS: 'kirilmazlar_customer_orders'
};

export const orderSyncUtils = {
  // Sipariş durumu güncelleme
  updateOrderStatus: (orderId, newStatus, notes = '') => {
    try {
      // Ana siparişler listesini güncelle
      const allOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
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
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedAllOrders));
      
      // Satıcı paneli siparişlerini güncelle
      const sellerOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.SELLER_ORDERS) || '[]');
      const updatedSellerOrders = sellerOrders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus, 
              statusNotes: notes,
              updatedAt: new Date().toISOString() 
            }
          : order
      );
      localStorage.setItem(STORAGE_KEYS.SELLER_ORDERS, JSON.stringify(updatedSellerOrders));

      // Müşteri paneli siparişlerini güncelle
      const customerOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMER_ORDERS) || '[]');
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
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDERS, JSON.stringify(updatedCustomerOrders));

      // Cross-tab communication için event trigger
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.ORDERS,
        newValue: JSON.stringify(updatedAllOrders)
      }));

      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.SELLER_ORDERS,
        newValue: JSON.stringify(updatedSellerOrders)
      }));

      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.CUSTOMER_ORDERS, 
        newValue: JSON.stringify(updatedCustomerOrders)
      }));

      return { success: true };
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
      return { success: false, error };
    }
  },

  // Sipariş silme
  deleteOrder: (orderId) => {
    try {
      // Ana siparişler listesinden sil
      const allOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      const filteredAllOrders = allOrders.filter(order => order.id !== orderId);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filteredAllOrders));
      
      // Satıcı panelinden sil
      const sellerOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.SELLER_ORDERS) || '[]');
      const filteredSellerOrders = sellerOrders.filter(order => order.id !== orderId);
      localStorage.setItem(STORAGE_KEYS.SELLER_ORDERS, JSON.stringify(filteredSellerOrders));

      // Müşteri panelinden sil
      const customerOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMER_ORDERS) || '[]');
      const filteredCustomerOrders = customerOrders.filter(order => order.id !== orderId);
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDERS, JSON.stringify(filteredCustomerOrders));

      // Cross-tab communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.ORDERS,
        newValue: JSON.stringify(filteredAllOrders)
      }));

      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.SELLER_ORDERS,
        newValue: JSON.stringify(filteredSellerOrders)
      }));

      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.CUSTOMER_ORDERS,
        newValue: JSON.stringify(filteredCustomerOrders)
      }));

      return { success: true };
    } catch (error) {
      console.error('Sipariş silinirken hata:', error);
      return { success: false, error };
    }
  },

  // Yeni sipariş ekleme (müşteriden gelene)
  addOrder: (orderData) => {
    try {
      const orderId = Date.now();
      const newOrder = {
        ...orderData,
        id: orderId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending' // Beklemede olarak başla
      };

      // Ana siparişler listesine ekle
      const allOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      allOrders.push(newOrder);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(allOrders));

      // Hem satıcı hem müşteri paneline ekle
      const sellerOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.SELLER_ORDERS) || '[]');
      const customerOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMER_ORDERS) || '[]');

      sellerOrders.push(newOrder);
      customerOrders.push(newOrder);

      localStorage.setItem(STORAGE_KEYS.SELLER_ORDERS, JSON.stringify(sellerOrders));
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDERS, JSON.stringify(customerOrders));

      // Cross-tab communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.ORDERS,
        newValue: JSON.stringify(allOrders)
      }));

      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.SELLER_ORDERS,
        newValue: JSON.stringify(sellerOrders)
      }));

      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.CUSTOMER_ORDERS,
        newValue: JSON.stringify(customerOrders)
      }));

      return { success: true, data: newOrder };
    } catch (error) {
      console.error('Sipariş eklenirken hata:', error);
      return { success: false, error };
    }
  },

  // Tüm siparişleri temizle
  clearAllOrders: () => {
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SELLER_ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_ORDERS);
    
    // Cross-tab communication
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.ORDERS,
      newValue: '[]'
    }));

    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.SELLER_ORDERS,
      newValue: '[]'
    }));

    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.CUSTOMER_ORDERS,
      newValue: '[]'
    }));
  }
};

export default orderSyncUtils;
