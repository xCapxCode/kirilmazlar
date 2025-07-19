import storage from '../core/storage/index.js';
import orderService from './orderService';

/**
 * Müşteri yönetimi için servis sınıfı
 * Müşteri CRUD işlemleri için kullanılır
 */
class CustomerService {
  /**
   * Tüm müşterileri getirir
   * @returns {Promise<Array>} - Müşteri listesi
   */
  async getAll() {
    try {
      const customers = await storage.get('customers', []);
      return customers;
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
      throw error;
    }
  }

  /**
   * ID'ye göre müşteri getirir
   * @param {number|string} id - Müşteri ID'si
   * @returns {Promise<Object|null>} - Müşteri nesnesi veya null
   */
  async getById(id) {
    try {
      const customers = await storage.get('customers', []);
      return customers.find(customer => customer.id === id) || null;
    } catch (error) {
      console.error(`ID'si ${id} olan müşteri yüklenirken hata:`, error);
      throw error;
    }
  }

  /**
   * Yeni müşteri oluşturur
   * @param {Object} customerData - Müşteri verileri
   * @returns {Promise<Object>} - Oluşturulan müşteri nesnesi
   */
  async create(customerData) {
    try {
      const customers = await storage.get('customers', []);
      
      const newCustomer = {
        id: Date.now(),
        ...customerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };
      
      const updatedCustomers = [...customers, newCustomer];
      await storage.set('customers', updatedCustomers);
      
      return newCustomer;
    } catch (error) {
      console.error('Müşteri oluşturulurken hata:', error);
      throw error;
    }
  }

  /**
   * Müşteri bilgilerini günceller
   * @param {number|string} id - Müşteri ID'si
   * @param {Object} updateData - Güncellenecek veriler
   * @returns {Promise<Object|null>} - Güncellenmiş müşteri nesnesi veya null
   */
  async update(id, updateData) {
    try {
      const customers = await storage.get('customers', []);
      const customerIndex = customers.findIndex(customer => customer.id === id);
      
      if (customerIndex === -1) {
        return null;
      }
      
      const updatedCustomer = {
        ...customers[customerIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      customers[customerIndex] = updatedCustomer;
      await storage.set('customers', customers);
      
      return updatedCustomer;
    } catch (error) {
      console.error(`ID'si ${id} olan müşteri güncellenirken hata:`, error);
      throw error;
    }
  }

  /**
   * Müşteriyi siler
   * @param {number|string} id - Müşteri ID'si
   * @returns {Promise<boolean>} - Başarılı ise true, değilse false
   */
  async delete(id) {
    try {
      const customers = await storage.get('customers', []);
      const filteredCustomers = customers.filter(customer => customer.id !== id);
      
      if (filteredCustomers.length === customers.length) {
        return false; // Müşteri bulunamadı
      }
      
      await storage.set('customers', filteredCustomers);
      return true;
    } catch (error) {
      console.error(`ID'si ${id} olan müşteri silinirken hata:`, error);
      throw error;
    }
  }

  /**
   * Müşteri arama işlemi
   * @param {string} query - Arama sorgusu
   * @returns {Promise<Array>} - Filtrelenmiş müşteri listesi
   */
  async search(query) {
    try {
      const customers = await storage.get('customers', []);
      
      if (!query || query.trim() === '') {
        return customers;
      }
      
      const searchTerm = query.toLowerCase().trim();
      
      return customers.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm) ||
        customer.phone?.includes(searchTerm) ||
        customer.address?.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Müşteri arama işleminde hata:', error);
      throw error;
    }
  }

  /**
   * Müşterinin sipariş geçmişini getirir
   * @param {number|string} customerId - Müşteri ID'si
   * @returns {Promise<Array>} - Müşterinin sipariş listesi
   */
  async getCustomerOrders(customerId) {
    try {
      const orders = await orderService.getAll();
      return orders.filter(order => order.customerId === customerId);
    } catch (error) {
      console.error(`Müşteri ${customerId} siparişleri yüklenirken hata:`, error);
      throw error;
    }
  }

  /**
   * Müşteri istatistiklerini getirir
   * @param {number|string} customerId - Müşteri ID'si
   * @returns {Promise<Object>} - Müşteri istatistikleri
   */
  async getCustomerStats(customerId) {
    try {
      const orders = await this.getCustomerOrders(customerId);
      
      const totalOrders = orders.length;
      const completedOrders = orders.filter(order => order.status === 'Teslim Edildi').length;
      const totalSpent = orders
        .filter(order => order.status === 'Teslim Edildi')
        .reduce((sum, order) => sum + (order.total || 0), 0);
      const averageOrderValue = completedOrders > 0 ? totalSpent / completedOrders : 0;
      
      return {
        totalOrders,
        completedOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate: orders.length > 0 ? 
          Math.max(...orders.map(order => new Date(order.orderDate).getTime())) : null
      };
    } catch (error) {
      console.error(`Müşteri ${customerId} istatistikleri yüklenirken hata:`, error);
      throw error;
    }
  }

  /**
   * En iyi müşterileri getirir (harcama miktarına göre)
   * @param {number} limit - Kaç müşteri getirileceği
   * @returns {Promise<Array>} - En iyi müşteri listesi
   */
  async getTopCustomers(limit = 10) {
    try {
      const customers = await storage.get('customers', []);
      const customersWithStats = await Promise.all(
        customers.map(async (customer) => {
          const stats = await this.getCustomerStats(customer.id);
          return {
            ...customer,
            ...stats
          };
        })
      );
      
      return customersWithStats
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, limit);
    } catch (error) {
      console.error('En iyi müşteriler yüklenirken hata:', error);
      throw error;
    }
  }

  /**
   * Aktif müşteri sayısını getirir
   * @returns {Promise<number>} - Aktif müşteri sayısı
   */
  async getActiveCustomerCount() {
    try {
      const customers = await storage.get('customers', []);
      return customers.filter(customer => customer.status === 'active').length;
    } catch (error) {
      console.error('Aktif müşteri sayısı yüklenirken hata:', error);
      throw error;
    }
  }

  /**
   * Müşteri durumunu günceller
   * @param {number|string} id - Müşteri ID'si
   * @param {string} status - Yeni durum ('active', 'inactive', 'blocked')
   * @returns {Promise<Object|null>} - Güncellenmiş müşteri nesnesi veya null
   */
  async updateStatus(id, status) {
    try {
      return await this.update(id, { status });
    } catch (error) {
      console.error(`Müşteri ${id} durumu güncellenirken hata:`, error);
      throw error;
    }
  }
}

export default new CustomerService();