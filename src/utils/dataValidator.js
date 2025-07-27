// Veri Doğrulama ve Tutarlılık Kontrolü
import storage from '@core/storage';
import logger from './logger.js';

class DataValidator {
  constructor() {
    this.validationRules = {
      users: this.validateUsers,
      products: this.validateProducts,
      categories: this.validateCategories,
      orders: this.validateOrders,
      business: this.validateBusiness
    };
  }

  // Ana doğrulama fonksiyonu
  validateAll() {
    const results = {};
    let hasErrors = false;

    Object.keys(this.validationRules).forEach(key => {
      const data = storage.get(key);
      const validation = this.validationRules[key](data);
      results[key] = validation;

      if (!validation.isValid) {
        hasErrors = true;
        logger.warn(`❌ ${key} doğrulama hatası:`, validation.errors);
      }
    });

    // İlişkisel doğrulamalar
    const relationalValidation = this.validateRelations();
    results.relations = relationalValidation;

    if (!relationalValidation.isValid) {
      hasErrors = true;
      logger.warn('❌ İlişkisel doğrulama hatası:', relationalValidation.errors);
    }

    return {
      isValid: !hasErrors,
      results,
      timestamp: new Date().toISOString()
    };
  }

  // Kullanıcı doğrulama
  validateUsers(users) {
    if (!Array.isArray(users)) {
      return { isValid: false, errors: ['Users must be an array'] };
    }

    const errors = [];
    const emails = new Set();

    users.forEach((user, index) => {
      // Gerekli alanlar
      if (!user.id) errors.push(`User ${index}: Missing id`);
      if (!user.email) errors.push(`User ${index}: Missing email`);
      if (!user.role) errors.push(`User ${index}: Missing role`);

      // Email benzersizliği
      if (user.email) {
        if (emails.has(user.email)) {
          errors.push(`User ${index}: Duplicate email ${user.email}`);
        }
        emails.add(user.email);
      }

      // Rol kontrolü
      if (user.role && !['admin', 'seller', 'customer', 'owner'].includes(user.role)) {
        errors.push(`User ${index}: Invalid role ${user.role}`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  // Ürün doğrulama
  validateProducts(products) {
    if (!Array.isArray(products)) {
      return { isValid: false, errors: ['Products must be an array'] };
    }

    const errors = [];
    const ids = new Set();

    products.forEach((product, index) => {
      // Gerekli alanlar
      if (!product.id) errors.push(`Product ${index}: Missing id`);
      if (!product.name) errors.push(`Product ${index}: Missing name`);
      if (typeof product.price !== 'number') errors.push(`Product ${index}: Invalid price`);
      if (!product.categoryId) errors.push(`Product ${index}: Missing categoryId`);

      // ID benzersizliği
      if (product.id) {
        if (ids.has(product.id)) {
          errors.push(`Product ${index}: Duplicate id ${product.id}`);
        }
        ids.add(product.id);
      }

      // Fiyat kontrolü
      if (typeof product.price === 'number' && product.price < 0) {
        errors.push(`Product ${index}: Negative price`);
      }

      // Stok kontrolü
      if (typeof product.stock === 'number' && product.stock < 0) {
        errors.push(`Product ${index}: Negative stock`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  // Kategori doğrulama
  validateCategories(categories) {
    if (!Array.isArray(categories)) {
      return { isValid: false, errors: ['Categories must be an array'] };
    }

    const errors = [];
    const ids = new Set();
    const names = new Set();

    categories.forEach((category, index) => {
      // Gerekli alanlar
      if (!category.id) errors.push(`Category ${index}: Missing id`);
      if (!category.name) errors.push(`Category ${index}: Missing name`);

      // ID benzersizliği
      if (category.id) {
        if (ids.has(category.id)) {
          errors.push(`Category ${index}: Duplicate id ${category.id}`);
        }
        ids.add(category.id);
      }

      // İsim benzersizliği
      if (category.name) {
        if (names.has(category.name)) {
          errors.push(`Category ${index}: Duplicate name ${category.name}`);
        }
        names.add(category.name);
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  // Sipariş doğrulama
  validateOrders(orders) {
    if (!Array.isArray(orders)) {
      return { isValid: false, errors: ['Orders must be an array'] };
    }

    const errors = [];
    const ids = new Set();

    orders.forEach((order, index) => {
      // Gerekli alanlar
      if (!order.id) errors.push(`Order ${index}: Missing id`);
      if (!order.customerId) errors.push(`Order ${index}: Missing customerId`);
      if (!Array.isArray(order.items)) errors.push(`Order ${index}: Items must be an array`);
      if (typeof order.total !== 'number') errors.push(`Order ${index}: Invalid total`);

      // ID benzersizliği
      if (order.id) {
        if (ids.has(order.id)) {
          errors.push(`Order ${index}: Duplicate id ${order.id}`);
        }
        ids.add(order.id);
      }

      // Sipariş kalemleri kontrolü
      if (Array.isArray(order.items)) {
        order.items.forEach((item, itemIndex) => {
          if (!item.id) errors.push(`Order ${index}, Item ${itemIndex}: Missing product id`);
          if (typeof item.quantity !== 'number' || item.quantity <= 0) {
            errors.push(`Order ${index}, Item ${itemIndex}: Invalid quantity`);
          }
          if (typeof item.price !== 'number' || item.price < 0) {
            errors.push(`Order ${index}, Item ${itemIndex}: Invalid price`);
          }
        });
      }

      // Durum kontrolü
      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
      if (order.status && !validStatuses.includes(order.status)) {
        errors.push(`Order ${index}: Invalid status ${order.status}`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  // İşletme bilgisi doğrulama
  validateBusiness(business) {
    if (!business || typeof business !== 'object') {
      return { isValid: false, errors: ['Business must be an object'] };
    }

    const errors = [];

    // Gerekli alanlar
    if (!business.id) errors.push('Business: Missing id');
    if (!business.name) errors.push('Business: Missing name');

    return { isValid: errors.length === 0, errors };
  }

  // İlişkisel doğrulamalar
  validateRelations() {
    const errors = [];

    const products = storage.get('products', []);
    const categories = storage.get('categories', []);
    const orders = storage.get('orders', []);
    const users = storage.get('users', []);

    // Kategori ID'lerini topla
    const categoryIds = new Set(categories.map(c => c.id));

    // Ürün-kategori ilişkisi
    products.forEach(product => {
      if (product.categoryId && !categoryIds.has(product.categoryId)) {
        errors.push(`Product "${product.name}" has invalid categoryId: ${product.categoryId}`);
      }
    });

    // Kullanıcı ID'lerini topla
    const userIds = new Set(users.map(u => u.id));

    // Sipariş-kullanıcı ilişkisi
    orders.forEach(order => {
      if (order.customerId && !userIds.has(order.customerId)) {
        errors.push(`Order "${order.id}" has invalid customerId: ${order.customerId}`);
      }
    });

    // Ürün ID'lerini topla
    const productIds = new Set(products.map(p => p.id));

    // Sipariş-ürün ilişkisi
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.id && !productIds.has(item.id)) {
            errors.push(`Order "${order.id}" contains invalid product id: ${item.id}`);
          }
        });
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  // Otomatik düzeltme (mümkün olan hatalar için)
  autoFix() {
    const fixes = [];

    // Eksik ID'leri otomatik oluştur
    const products = storage.get('products', []);
    let productsChanged = false;

    products.forEach(product => {
      if (!product.id) {
        product.id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        productsChanged = true;
        fixes.push(`Generated ID for product: ${product.name}`);
      }
    });

    if (productsChanged) {
      storage.set('products', products);
    }

    // Benzer düzeltmeler diğer veri türleri için de yapılabilir

    return fixes;
  }

  // Periyodik doğrulama başlat
  startPeriodicValidation(intervalMinutes = 5) {
    const interval = intervalMinutes * 60 * 1000;

    setInterval(() => {
      const validation = this.validateAll();
      if (!validation.isValid) {
        logger.warn('⚠️ Periyodik veri doğrulama hatası tespit edildi');

        // Otomatik düzeltme dene
        const fixes = this.autoFix();
        if (fixes.length > 0) {
          logger.log('🔧 Otomatik düzeltmeler uygulandı:', fixes);
        }
      }
    }, interval);

    logger.info(`✅ Periyodik veri doğrulama başlatıldı (${intervalMinutes} dakika)`);
  }
}

export default new DataValidator();