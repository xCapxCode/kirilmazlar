import storage from '@core/storage';

/**
 * Sipariş yönetimi için servis sınıfı
 * Sipariş CRUD işlemleri ve senkronizasyon için kullanılır
 */
class OrderService {
  /**
   * Tüm siparişleri getirir
   * @param {Object} options - Filtreleme seçenekleri
   * @returns {Promise<Array>} - Sipariş listesi
   */
  async getAll(options = {}) {
    try {
      // Hem customer_orders hem de orders storage'larından veri al
      const customerOrders = await storage.get('customer_orders', []);
      const sellerOrders = await storage.get('orders', []);
      
      // Siparişleri birleştir - customer_orders öncelikli
      const allOrders = [...customerOrders];
      
      // Seller orders'dan duplicate olmayanları ekle
      sellerOrders.forEach(sellerOrder => {
        const exists = allOrders.find(order => order.id === sellerOrder.id);
        if (!exists) {
          allOrders.push(sellerOrder);
        }
      });
      
      // Siparişleri normalize et
      const normalizedOrders = allOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber || order.order_number || `SIP-${order.id}`,
        customerName: order.customerName || order.customer_name || 'Müşteri',
        customerEmail: order.customerEmail || order.customer_email || '',
        customerPhone: order.customerPhone || order.customer_phone || '',
        items: order.items || order.orderItems || [],
        total: parseFloat(order.total || order.total_amount || 0),
        status: this.normalizeStatus(order.status),
        orderDate: order.createdAt || order.created_at || order.orderDate || new Date().toISOString(),
        deliveryAddress: order.deliveryAddress || order.delivery_address || '',
        notes: order.notes || order.order_notes || '',
        paymentMethod: order.paymentMethod || order.payment_method || 'Nakit',
        source: order.source || 'customer'
      }));
      
      // Filtreleme
      let filteredOrders = normalizedOrders;
      
      if (options.status) {
        filteredOrders = filteredOrders.filter(order => order.status === options.status);
      }
      
      if (options.customerId) {
        filteredOrders = filteredOrders.filter(order => 
          order.customerId === options.customerId || 
          order.customer_id === options.customerId
        );
      }
      
      if (options.dateRange) {
        const now = new Date();
        let startDate;
        
        switch (options.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = null;
        }
        
        if (startDate) {
          filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate >= startDate;
          });
        }
      }
      
      // Sıralama
      if (options.sortBy) {
        switch (options.sortBy) {
          case 'newest':
            filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            break;
          case 'oldest':
            filteredOrders.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
            break;
          case 'total':
            filteredOrders.sort((a, b) => b.total - a.total);
            break;
          case 'customer':
            filteredOrders.sort((a, b) => a.customerName.localeCompare(b.customerName, 'tr'));
            break;
        }
      } else {
        // Varsayılan sıralama: en yeni siparişler önce
        filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      }
      
      return filteredOrders;
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
      throw error;
    }
  }

  /**
   * ID'ye göre sipariş getirir
   * @param {number|string} id - Sipariş ID'si
   * @returns {Promise<Object|null>} - Sipariş nesnesi veya null
   */
  async getById(id) {
    try {
      const customerOrders = await storage.get('customer_orders', []);
      const sellerOrders = await storage.get('orders', []);
      
      // Önce customer_orders'da ara
      let order = customerOrders.find(order => order.id === id);
      
      // Bulunamazsa orders'da ara
      if (!order) {
        order = sellerOrders.find(order => order.id === id);
      }
      
      if (!order) {
        return null;
      }
      
      // Siparişi normalize et
      return {
        id: order.id,
        orderNumber: order.orderNumber || order.order_number || `SIP-${order.id}`,
        customerName: order.customerName || order.customer_name || 'Müşteri',
        customerEmail: order.customerEmail || order.customer_email || '',
        customerPhone: order.customerPhone || order.customer_phone || '',
        items: order.items || order.orderItems || [],
        total: parseFloat(order.total || order.total_amount || 0),
        status: this.normalizeStatus(order.status),
        orderDate: order.createdAt || order.created_at || order.orderDate || new Date().toISOString(),
        deliveryAddress: order.deliveryAddress || order.delivery_address || '',
        notes: order.notes || order.order_notes || '',
        paymentMethod: order.paymentMethod || order.payment_method || 'Nakit',
        source: order.source || 'customer'
      };
    } catch (error) {
      console.error(`ID'si ${id} olan sipariş yüklenirken hata:`, error);
      throw error;
    }
  }

  /**
   * Yeni sipariş oluşturur
   * @param {Object} orderData - Sipariş verileri
   * @returns {Promise<Object>} - Oluşturulan sipariş
   */
  async create(orderData) {
    try {
      // Hem customer_orders hem de orders storage'larından veri al
      const customerOrders = await storage.get('customer_orders', []);
      
      // Yeni ID oluştur
      const newId = customerOrders.length > 0 
        ? Math.max(...customerOrders.map(o => typeof o.id === 'number' ? o.id : 0)) + 1 
        : 1;
      
      // Sipariş numarası oluştur
      const orderNumber = orderData.orderNumber || `SIP-${new Date().getFullYear()}-${String(newId).padStart(4, '0')}`;
      
      // Sipariş nesnesini oluştur
      const newOrder = {
        ...orderData,
        id: newId,
        orderNumber,
        status: orderData.status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Storage'a kaydet
      const updatedCustomerOrders = [...customerOrders, newOrder];
      await storage.set('customer_orders', updatedCustomerOrders);
      
      // Satıcı siparişlerine de ekle
      const sellerOrders = await storage.get('orders', []);
      const updatedSellerOrders = [...sellerOrders, newOrder];
      await storage.set('orders', updatedSellerOrders);
      
      return newOrder;
    } catch (error) {
      console.error('Sipariş oluşturulurken hata:', error);
      throw error;
    }
  }

  /**
   * Sipariş durumunu günceller
   * @param {number|string} id - Sipariş ID'si
   * @param {string} status - Yeni durum
   * @param {string} notes - Durum notları
   * @param {string} source - Güncelleme kaynağı ('customer' veya 'seller')
   * @returns {Promise<Object|null>} - Güncellenen sipariş veya null
   */
  async updateStatus(id, status, notes = '', source = 'system') {
    try {
      // Hem customer_orders hem de orders storage'larını güncelle
      const customerOrders = await storage.get('customer_orders', []);
      const sellerOrders = await storage.get('orders', []);
      
      // Sipariş var mı kontrol et
      const customerOrder = customerOrders.find(order => order.id === id);
      const sellerOrder = sellerOrders.find(order => order.id === id);
      
      if (!customerOrder && !sellerOrder) {
        console.error(`ID'si ${id} olan sipariş bulunamadı`);
        return null;
      }
      
      const now = new Date().toISOString();
      const normalizedStatus = this.normalizeStatus(status);
      
      // Customer orders'da güncelle
      const updatedCustomerOrders = customerOrders.map(order => 
        order.id === id 
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
        order.id === id 
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
      const updatedOrder = updatedCustomerOrders.find(order => order.id === id) || 
                          updatedSellerOrders.find(order => order.id === id);
      
      console.log(`✅ Sipariş durumu güncellendi: ${id} -> ${normalizedStatus}`);
      
      return updatedOrder;
    } catch (error) {
      console.error(`❌ ID'si ${id} olan sipariş durumu güncellenirken hata:`, error);
      throw error;
    }
  }

  /**
   * Sipariş siler
   * @param {number|string} id - Sipariş ID'si
   * @returns {Promise<boolean>} - Başarılı ise true, değilse false
   */
  async delete(id) {
    try {
      // Hem customer_orders hem de orders storage'larından sil
      const customerOrders = await storage.get('customer_orders', []);
      const sellerOrders = await storage.get('orders', []);
      
      const updatedCustomerOrders = customerOrders.filter(order => order.id !== id);
      const updatedSellerOrders = sellerOrders.filter(order => order.id !== id);
      
      if (updatedCustomerOrders.length === customerOrders.length && 
          updatedSellerOrders.length === sellerOrders.length) {
        return false; // Sipariş bulunamadı
      }
      
      await storage.set('customer_orders', updatedCustomerOrders);
      await storage.set('orders', updatedSellerOrders);
      
      return true;
    } catch (error) {
      console.error(`ID'si ${id} olan sipariş silinirken hata:`, error);
      throw error;
    }
  }

  /**
   * Sipariş iptal eder
   * @param {number|string} id - Sipariş ID'si
   * @param {string} reason - İptal nedeni
   * @returns {Promise<Object|null>} - Güncellenen sipariş veya null
   */
  async cancel(id, reason = '') {
    try {
      return await this.updateStatus(id, 'cancelled', reason);
    } catch (error) {
      console.error(`ID'si ${id} olan sipariş iptal edilirken hata:`, error);
      throw error;
    }
  }

  /**
   * Test siparişlerini temizler
   * @returns {Promise<number>} - Silinen sipariş sayısı
   */
  async clearTestOrders() {
    try {
      // Hem customer_orders hem de orders storage'larından test siparişlerini sil
      const customerOrders = await storage.get('customer_orders', []);
      
      // Gerçek siparişleri koru
      const realOrders = customerOrders.filter(order => 
        !order.orderNumber?.includes('TEST') && 
        !order.customerName?.includes('Test') &&
        order.source !== 'demo'
      );
      
      await storage.set('customer_orders', realOrders);
      await storage.set('orders', []); // Seller orders'ı tamamen temizle
      
      return customerOrders.length - realOrders.length;
    } catch (error) {
      console.error('Test siparişleri temizlenirken hata:', error);
      throw error;
    }
  }

  /**
   * Sipariş durumunu normalize eder
   * @param {string} status - Sipariş durumu
   * @returns {string} - Normalize edilmiş sipariş durumu
   */
  normalizeStatus(status) {
    const statusMap = {
      'pending': 'Beklemede',
      'confirmed': 'Onaylandı',
      'preparing': 'Hazırlanıyor',
      'ready': 'Hazır',
      'shipped': 'Kargoya Verildi',
      'delivered': 'Teslim Edildi',
      'cancelled': 'İptal Edildi'
    };
    
    return statusMap[status] || status || 'Beklemede';
  }

  /**
   * Müşteriye göre siparişleri getirir
   * @param {number|string} customerId - Müşteri ID'si
   * @returns {Promise<Array>} - Sipariş listesi
   */
  async getByCustomerId(customerId) {
    try {
      const orders = await this.getAll();
      return orders.filter(order => 
        order.customerId === customerId || 
        order.customer_id === customerId
      );
    } catch (error) {
      console.error(`Müşteri ID'si ${customerId} olan siparişler yüklenirken hata:`, error);
      throw error;
    }
  }

  /**
   * Son siparişleri getirir
   * @param {number} limit - Maksimum sipariş sayısı
   * @returns {Promise<Array>} - Sipariş listesi
   */
  async getRecentOrders(limit = 5) {
    try {
      const orders = await this.getAll({ sortBy: 'newest' });
      return orders.slice(0, limit);
    } catch (error) {
      console.error('Son siparişler yüklenirken hata:', error);
      throw error;
    }
  }
}

export default new OrderService();
