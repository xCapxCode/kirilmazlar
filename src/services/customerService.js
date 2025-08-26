import storage from '@core/storage';
import logger from '../utils/productionLogger.js';
import { generateId } from '../utils/helpers.js';
import dataValidator from '../utils/dataValidator.js';
import apiService from './apiService.js';
// Removed orderService import to avoid circular dependency

/**
 * Müşteri yönetimi için servis sınıfı
 * Müşteri CRUD işlemleri için kullanılır
 */
class CustomerService {
  /**
   * Tüm müşterileri getirir
   * @returns {Promise<Array>} - Müşteri listesi
   */
  async getAll(filters = {}) {
    try {
      // FIXED: Always use localStorage - unified storage approach
      let customers = await storage.get('customers', []);
      
      // Sipariş verilerini al ve müşteri-sipariş ilişkisini kur
      const orders = await storage.get('customer_orders', []);
      
      // Her müşteri için sipariş istatistiklerini hesapla
      customers = customers.map(customer => {
        const customerOrders = orders.filter(order => order.customerId === customer.id);
        
        const orderCount = customerOrders.length;
        const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const lastOrderDate = customerOrders.length > 0 
          ? customerOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))[0].orderDate
          : null;
        
        return {
          ...customer,
          orderCount,
          totalSpent,
          lastOrderDate,
          // Eski verilerle uyumluluk için
          city: customer.city || customer.address?.split('/')[1]?.split('/')[0] || 'Belirtilmemiş'
        };
      });
      
      logger.info(`👤 Müşteri-sipariş ilişkisi kuruldu: ${customers.length} müşteri, ${orders.length} sipariş`);
      
      // Filtreleme
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        customers = customers.filter(customer => 
          customer.name?.toLowerCase().includes(searchTerm) ||
          customer.email?.toLowerCase().includes(searchTerm) ||
          customer.phone?.includes(searchTerm)
        );
      }
      
      if (filters.city) {
        customers = customers.filter(customer => 
          customer.city?.toLowerCase() === filters.city.toLowerCase()
        );
      }
      
      if (filters.status) {
        customers = customers.filter(customer => customer.status === filters.status);
      }
      
      // Sıralama
      if (filters.sortBy) {
        customers.sort((a, b) => {
          const aVal = a[filters.sortBy];
          const bVal = b[filters.sortBy];
          
          if (filters.sortOrder === 'desc') {
            return bVal > aVal ? 1 : -1;
          }
          return aVal > bVal ? 1 : -1;
        });
      }
      
      // Sayfalama
      if (filters.page && filters.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        customers = customers.slice(start, end);
      }
      
      return {
        success: true,
        customers,
        total: customers.length
      };
    } catch (error) {
      logger.error('Müşteri listesi getirme hatası:', error);
      return {
        success: false,
        error: error.message,
        customers: []
      };
    }
  }

  /**
   * ID'ye göre müşteri getirir
   * @param {number|string} id - Müşteri ID'si
   * @returns {Promise<Object|null>} - Müşteri nesnesi veya null
   */
  async getById(id) {
    try {
      // FIXED: Always use localStorage - unified storage approach
      const customers = await storage.get('customers', []);
      const customer = customers.find(customer => customer.id === id);
      
      if (!customer) {
        return {
          success: false,
          error: 'Müşteri bulunamadı'
        };
      }
      
      return {
        success: true,
        customer
      };
    } catch (error) {
      logger.error('Müşteri getirme hatası:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Yeni müşteri oluşturur
   * @param {Object} customerData - Müşteri verileri
   * @returns {Promise<Object>} - Oluşturulan müşteri nesnesi
   */
  async create(customerData) {
    try {
      // Veri doğrulama
      const validation = dataValidator.validateCustomer(customerData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Geçersiz müşteri verisi',
          details: validation.errors
        };
      }
      
      // FIXED: Always use localStorage - unified storage approach
      
      console.log('🔄 CustomerService.create başlatılıyor:', customerData);

      const customers = await storage.get('customers', []);
      console.log('📋 Mevcut müşteriler:', customers.length);
      
      // Email kontrolü
      if (customers.some(c => c.email === customerData.email)) {
        return {
          success: false,
          error: 'Bu email adresi zaten kullanılıyor'
        };
      }

      const newCustomer = {
        id: generateId(),
        ...customerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        loyaltyPoints: 0,
        totalSpent: 0,
        orderCount: 0
      };

      console.log('📝 Oluşturulan müşteri objesi:', newCustomer);

      const updatedCustomers = [...customers, newCustomer];
      console.log('💾 Storage\'a kaydedilecek müşteri listesi:', updatedCustomers.length);

      await storage.set('customers', updatedCustomers);
      console.log('✅ Müşteri storage\'a kaydedildi');

      // Müşteri hesabını users tablosuna da ekle (giriş yapabilmesi için)
      if (customerData.username && customerData.password) {
        const users = await storage.get('users', []);
        console.log('👥 Mevcut users:', users.length);

        // Aynı email/username kontrolü
        const existingUser = users.find(u =>
          u.email === customerData.email || u.username === customerData.username
        );

        if (!existingUser) {
          const newUser = {
            id: newCustomer.id,
            username: customerData.username,
            email: customerData.email,
            password: customerData.password, // Gerçek uygulamada hash'lenecek
            name: customerData.name,
            role: 'customer',
            customerId: newCustomer.id,
            createdAt: new Date().toISOString(),
            isActive: true
          };

          users.push(newUser);
          await storage.set('users', users);
          console.log('✅ Müşteri user hesabı oluşturuldu:', customerData.email);
        }
      }
      
      logger.info('Yeni müşteri oluşturuldu:', newCustomer.id);
      
      return {
        success: true,
        customer: newCustomer
      };
    } catch (error) {
      logger.error('Müşteri oluşturma hatası:', error);
      return {
        success: false,
        error: error.message
      };
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
      // FIXED: Always use localStorage - unified storage approach
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

      // İlgili user hesabını da güncelle
      if (updateData.username || updateData.password || updateData.email || updateData.name) {
        const users = await storage.get('users', []);
        const userIndex = users.findIndex(user => user.customerId === id);

        if (userIndex !== -1) {
          const updatedUser = {
            ...users[userIndex],
            ...(updateData.username && { username: updateData.username }),
            ...(updateData.password && { password: updateData.password }),
            ...(updateData.email && { email: updateData.email }),
            ...(updateData.name && { name: updateData.name })
          };

          users[userIndex] = updatedUser;
          await storage.set('users', users);
          console.log('✅ Müşteri user hesabı da güncellendi:', updateData.email || updatedUser.email);
        }
      }

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
      // FIXED: Always use localStorage - unified storage approach
      const customers = await storage.get('customers', []);
      const customerToDelete = customers.find(customer => customer.id === id);
      const filteredCustomers = customers.filter(customer => customer.id !== id);

      if (filteredCustomers.length === customers.length) {
        return false; // Müşteri bulunamadı
      }

      await storage.set('customers', filteredCustomers);

      // İlgili user hesabını da sil
      if (customerToDelete && customerToDelete.email) {
        const users = await storage.get('users', []);
        const filteredUsers = users.filter(user =>
          user.email !== customerToDelete.email && user.customerId !== id
        );

        if (filteredUsers.length !== users.length) {
          await storage.set('users', filteredUsers);
          console.log('✅ Müşteri user hesabı da silindi:', customerToDelete.email);
        }
      }

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
   * Müşterinin sipariş geçmişini getirir - CROSS-CONTAMINATION SAFE
   * @param {number|string} customerId - Müşteri ID'si
   * @returns {Promise<Array>} - Müşterinin sipariş listesi
   */
  async getCustomerOrders(customerId) {
    try {
      // Import orderService dinamik olarak circular dependency'yi önlemek için
      const { default: orderService } = await import('./orderService.js');

      // CRITICAL: Use the improved getByCustomerId method
      return await orderService.getByCustomerId(customerId);
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
