/**
 * KIRILMAZLAR v1.0 - GELİŞTİRİLMİŞ VERİ YEDEKLEME SİSTEMİ
 * localStorage verilerini güvenli şekilde yedekler ve PostgreSQL'e hazırlar
 */

import storage from '../core/storage/index.js';
import { logger } from '../utils/productionLogger.js';

class DataBackupService {
  constructor() {
    this.prefix = 'kirilmazlar_';
    this.version = '1.0.0';
  }

  /**
   * Tüm localStorage verilerini yedekle
   */
  async createFullBackup() {
    try {
      logger.info('🔄 Tam veri yedekleme başlatılıyor...');
      
      const backup = {
        timestamp: new Date().toISOString(),
        version: this.version,
        source: 'localStorage',
        environment: import.meta.env.MODE || 'development',
        data: {},
        metadata: {
          totalKeys: 0,
          dataSize: 0,
          hostname: window?.location?.hostname || 'unknown',
          userAgent: navigator?.userAgent || 'unknown'
        }
      };

      // Kritik veri türlerini yedekle
      const criticalKeys = [
        'users',
        'customer_orders', 
        'orders',
        'products',
        'customers',
        'categories',
        'business_info',
        'data_version',
        'device_id'
      ];

      for (const key of criticalKeys) {
        const data = storage.get(key);
        if (data !== null) {
          backup.data[key] = {
            value: data,
            type: typeof data,
            size: JSON.stringify(data).length,
            lastModified: new Date().toISOString()
          };
          backup.metadata.totalKeys++;
          backup.metadata.dataSize += backup.data[key].size;
        }
      }

      // Ek localStorage anahtarlarını kontrol et
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.keys(localStorage)
          .filter(key => key.startsWith(this.prefix))
          .forEach(fullKey => {
            const key = fullKey.replace(this.prefix, '');
            if (!backup.data[key]) {
              const rawValue = localStorage.getItem(fullKey);
              try {
                const parsedValue = JSON.parse(rawValue);
                backup.data[key] = {
                  value: parsedValue,
                  type: typeof parsedValue,
                  size: rawValue.length,
                  lastModified: new Date().toISOString()
                };
                backup.metadata.totalKeys++;
                backup.metadata.dataSize += rawValue.length;
              } catch (e) {
                backup.data[key] = {
                  value: rawValue,
                  type: 'string',
                  size: rawValue.length,
                  parseError: e.message,
                  lastModified: new Date().toISOString()
                };
              }
            }
          });
      }

      logger.info(`✅ Yedekleme tamamlandı: ${backup.metadata.totalKeys} anahtar, ${backup.metadata.dataSize} byte`);
      return backup;
    } catch (error) {
      logger.error('❌ Yedekleme hatası:', error);
      throw error;
    }
  }

  /**
   * Yedeklemeyi JSON dosyası olarak indir
   */
  async downloadBackup() {
    try {
      const backup = await this.createFullBackup();
      
      if (typeof window !== 'undefined') {
        const blob = new Blob([JSON.stringify(backup, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kirilmazlar-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        logger.info('📥 Yedekleme dosyası indirildi');
        return true;
      }
      
      return backup;
    } catch (error) {
      logger.error('❌ Yedekleme indirme hatası:', error);
      throw error;
    }
  }

  /**
   * PostgreSQL için veri formatını hazırla
   */
  async prepareForPostgreSQL() {
    try {
      const backup = await this.createFullBackup();
      const pgData = {
        timestamp: backup.timestamp,
        version: backup.version,
        tables: {}
      };

      // Users tablosu
      if (backup.data.users?.value) {
        pgData.tables.users = backup.data.users.value.map(user => ({
          id: user.id || this.generateId(),
          email: user.email,
          password_hash: user.password, // Bu hash'lenecek
          role: user.role || 'user',
          name: user.name || user.email.split('@')[0],
          created_at: user.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        }));
      }

      // Orders tablosu
      const allOrders = [];
      if (backup.data.customer_orders?.value) {
        allOrders.push(...backup.data.customer_orders.value);
      }
      if (backup.data.orders?.value) {
        allOrders.push(...backup.data.orders.value);
      }
      
      pgData.tables.orders = allOrders.map(order => ({
        id: order.id || this.generateId(),
        customer_id: order.customerId || order.customer_id,
        total_amount: parseFloat(order.total || order.totalAmount || 0),
        status: order.status || 'pending',
        items: JSON.stringify(order.items || []),
        notes: order.notes || '',
        created_at: order.createdAt || order.created_at || new Date().toISOString(),
        updated_at: order.updatedAt || order.updated_at || new Date().toISOString()
      }));

      // Products tablosu
      if (backup.data.products?.value) {
        pgData.tables.products = backup.data.products.value.map(product => ({
          id: product.id || this.generateId(),
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price || 0),
          category_id: product.categoryId || product.category_id,
          stock_quantity: parseInt(product.stock || product.stockQuantity || 0),
          is_active: product.isActive !== false,
          created_at: product.createdAt || new Date().toISOString(),
          updated_at: product.updatedAt || new Date().toISOString()
        }));
      }

      // Customers tablosu
      if (backup.data.customers?.value) {
        pgData.tables.customers = backup.data.customers.value.map(customer => ({
          id: customer.id || this.generateId(),
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          created_at: customer.createdAt || new Date().toISOString(),
          updated_at: customer.updatedAt || new Date().toISOString()
        }));
      }

      // Categories tablosu
      if (backup.data.categories?.value) {
        pgData.tables.categories = backup.data.categories.value.map(category => ({
          id: category.id || this.generateId(),
          name: category.name,
          description: category.description || '',
          is_active: category.isActive !== false,
          created_at: category.createdAt || new Date().toISOString(),
          updated_at: category.updatedAt || new Date().toISOString()
        }));
      }

      logger.info('✅ PostgreSQL formatı hazırlandı');
      return pgData;
    } catch (error) {
      logger.error('❌ PostgreSQL format hazırlama hatası:', error);
      throw error;
    }
  }

  /**
   * Veri doğrulama
   */
  async validateBackup(backup) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      stats: {
        totalRecords: 0,
        tables: {}
      }
    };

    try {
      // Temel yapı kontrolü
      if (!backup.data) {
        validation.errors.push('Backup data eksik');
        validation.isValid = false;
      }

      // Kritik tabloları kontrol et
      const requiredTables = ['users', 'products'];
      for (const table of requiredTables) {
        if (!backup.data[table]?.value) {
          validation.warnings.push(`${table} tablosu eksik`);
        } else {
          validation.stats.tables[table] = backup.data[table].value.length;
          validation.stats.totalRecords += backup.data[table].value.length;
        }
      }

      // Veri tutarlılığı kontrolü
      if (backup.data.users?.value) {
        const users = backup.data.users.value;
        const duplicateEmails = users
          .map(u => u.email)
          .filter((email, index, arr) => arr.indexOf(email) !== index);
        
        if (duplicateEmails.length > 0) {
          validation.warnings.push(`Duplicate emails: ${duplicateEmails.join(', ')}`);
        }
      }

      logger.info('✅ Backup doğrulaması tamamlandı');
      return validation;
    } catch (error) {
      validation.errors.push(`Doğrulama hatası: ${error.message}`);
      validation.isValid = false;
      return validation;
    }
  }

  /**
   * ID generator
   */
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Backup restore (geliştirme amaçlı)
   */
  async restoreFromBackup(backupData) {
    try {
      logger.info('🔄 Backup restore başlatılıyor...');
      
      if (!backupData.data) {
        throw new Error('Geçersiz backup formatı');
      }

      let restoredCount = 0;
      
      Object.entries(backupData.data).forEach(([key, data]) => {
        try {
          storage.set(key, data.value);
          restoredCount++;
          logger.debug(`✅ Restored: ${key}`);
        } catch (error) {
          logger.error(`❌ Restore failed for ${key}:`, error);
        }
      });

      logger.info(`✅ Restore tamamlandı: ${restoredCount} anahtar restore edildi`);
      return { success: true, restoredCount };
    } catch (error) {
      logger.error('❌ Restore hatası:', error);
      throw error;
    }
  }
}

export default DataBackupService;