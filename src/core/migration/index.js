/**
 * KIRILMAZLAR Panel - Veri Migrasyonu Yardımcı Sınıfı
 * 
 * Bu dosya, veri yapısı değişikliklerinde verilerin yeni yapıya geçişini sağlar.
 * Veri şeması değiştiğinde bu dosya güncellenmeli ve migration stratejisi uygulanmalıdır.
 */

import storage from '../storage';
import { schemaVersions } from '../schema';

class MigrationManager {
  constructor() {
    this.migrations = {
      product: this.productMigrations,
      order: this.orderMigrations,
      customer: this.customerMigrations,
      user: this.userMigrations,
      business: this.businessMigrations
    };
  }

  /**
   * Tüm veri tiplerinin migrasyonunu gerçekleştirir
   */
  async migrateAll() {
    console.log('🔄 Veri migrasyonu başlatılıyor...');
    
    try {
      // Mevcut versiyon bilgilerini al
      const currentVersions = storage.get('schema_versions', {});
      console.log('📊 Mevcut şema versiyonları:', currentVersions);
      
      // Her veri tipi için migrasyon yap
      for (const [dataType, latestVersion] of Object.entries(schemaVersions)) {
        const currentVersion = currentVersions[dataType] || '0.0';
        
        if (currentVersion !== latestVersion) {
          console.log(`🔄 ${dataType} verisi için migrasyon yapılıyor: ${currentVersion} -> ${latestVersion}`);
          await this.migrateDataType(dataType, currentVersion, latestVersion);
          
          // Versiyon bilgisini güncelle
          currentVersions[dataType] = latestVersion;
        }
      }
      
      // Güncellenmiş versiyon bilgilerini kaydet
      storage.set('schema_versions', currentVersions);
      console.log('✅ Veri migrasyonu tamamlandı');
      
      return true;
    } catch (error) {
      console.error('❌ Veri migrasyonu sırasında hata:', error);
      return false;
    }
  }

  /**
   * Belirli bir veri tipi için migrasyon yapar
   */
  async migrateDataType(dataType, fromVersion, toVersion) {
    if (!this.migrations[dataType]) {
      console.warn(`⚠️ ${dataType} için migrasyon stratejisi bulunamadı`);
      return false;
    }
    
    try {
      // Veriyi al
      const data = storage.get(dataType, []);
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.log(`ℹ️ ${dataType} için veri bulunamadı, migrasyon gerekmiyor`);
        return true;
      }
      
      // Migrasyon yap
      const migratedData = await this.migrations[dataType](data, fromVersion, toVersion);
      
      // Güncellenmiş veriyi kaydet
      storage.set(dataType, migratedData);
      
      console.log(`✅ ${dataType} verisi başarıyla migrate edildi`);
      return true;
    } catch (error) {
      console.error(`❌ ${dataType} verisi migrate edilirken hata:`, error);
      return false;
    }
  }

  /**
   * Ürün verisi için migrasyon stratejileri
   */
  async productMigrations(data, fromVersion, toVersion) {
    // Versiyon kontrolü
    if (fromVersion === '0.0' && toVersion === '1.0') {
      // İlk versiyon, temel alanları ekle
      return data.map(product => ({
        ...product,
        id: product.id || `product_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        isActive: product.isActive !== undefined ? product.isActive : true,
        isAvailable: product.isAvailable !== undefined ? product.isAvailable : (product.stock > 0),
        status: product.status || 'active',
        category: product.category || 'Genel',
        subcategory: product.subcategory || '',
        description: product.description || `${product.name} - Taze ve kaliteli`,
        discount: product.discount || 0,
        rating: product.rating || 5,
        gallery: product.gallery || [product.image],
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
    
    // Diğer versiyon geçişleri buraya eklenecek
    
    return data;
  }

  /**
   * Sipariş verisi için migrasyon stratejileri
   */
  async orderMigrations(data, fromVersion, toVersion) {
    // Versiyon kontrolü
    if (fromVersion === '0.0' && toVersion === '1.0') {
      // İlk versiyon, temel alanları ekle
      return data.map(order => ({
        ...order,
        id: order.id || `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        date: order.date || new Date().toISOString(),
        status: order.status || 'pending',
        total: order.total || order.items.reduce((sum, item) => sum + (item.total || 0), 0),
        itemCount: order.itemCount || order.items.length,
        timeline: order.timeline || [
          { status: "confirmed", time: null, completed: false },
          { status: "preparing", time: null, completed: false },
          { status: "out_for_delivery", time: null, completed: false },
          { status: "delivered", time: null, completed: false }
        ],
        canCancel: order.canCancel !== undefined ? order.canCancel : true,
        canReorder: order.canReorder !== undefined ? order.canReorder : true,
        notes: order.notes || '',
        isDemo: order.isDemo || false,
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
    
    // Diğer versiyon geçişleri buraya eklenecek
    
    return data;
  }

  /**
   * Müşteri verisi için migrasyon stratejileri
   */
  async customerMigrations(data, fromVersion, toVersion) {
    // Versiyon kontrolü
    if (fromVersion === '0.0' && toVersion === '1.0') {
      // İlk versiyon, temel alanları ekle
      return data.map(customer => ({
        ...customer,
        id: customer.id || `customer_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        role: customer.role || 'customer',
        status: customer.status || 'active',
        createdAt: customer.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
    
    // Diğer versiyon geçişleri buraya eklenecek
    
    return data;
  }

  /**
   * Kullanıcı verisi için migrasyon stratejileri
   */
  async userMigrations(data, fromVersion, toVersion) {
    // Versiyon kontrolü
    if (fromVersion === '0.0' && toVersion === '1.0') {
      // İlk versiyon, temel alanları ekle
      return data.map(user => ({
        ...user,
        id: user.id || `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        role: user.role || 'customer',
        permissions: user.permissions || [],
        active: user.active !== undefined ? user.active : true,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
    
    // Diğer versiyon geçişleri buraya eklenecek
    
    return data;
  }

  /**
   * İşletme bilgileri için migrasyon stratejileri
   */
  async businessMigrations(data, fromVersion, toVersion) {
    // Versiyon kontrolü
    if (fromVersion === '0.0' && toVersion === '1.0') {
      // İlk versiyon, temel alanları ekle
      return {
        ...data,
        companyName: data.companyName || 'KIRILMAZLAR Gıda',
        companyTitle: data.companyTitle || 'Gıda Tedarik ve Dağıtım',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        logo: data.logo || ''
      };
    }
    
    // Diğer versiyon geçişleri buraya eklenecek
    
    return data;
  }
}

export const migrationManager = new MigrationManager();
export default migrationManager;