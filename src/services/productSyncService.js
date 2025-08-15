/**
 * ÜRÜN SENKRONİZASYON SERVİSİ
 * Satıcı-Müşteri arası ürün verisi köprüsü
 * Kasalı ürünler için özel entegrasyon
 */

import logger from '@utils/productionLogger';

class ProductSyncService {
  constructor() {
    this.KASALI_UNITS = ['kasa', 'çuval', 'sandık', 'torba'];
    this.KASALI_CATEGORY_PREFIX = 'Kasalı';
  }

  /**
   * Satıcı panelinden ürün kaydederken kasalı ürün standardizasyonu
   */
  standardizeProductForSeller(productData) {
    const standardized = { ...productData };

    // Kasalı ürün kontrolü
    if (this.isKasaliUnit(productData.unit)) {
      standardized.category = this.createKasaliCategory(productData.category);
      standardized.originalCategory = this.extractOriginalCategory(productData.category);
      standardized.isKasali = true;

      logger.info('🗃️ KASALI ÜRÜN STANDARDİZE:', {
        original: productData.category,
        standardized: standardized.category,
        unit: productData.unit
      });
    }

    return standardized;
  }

  /**
   * Müşteri paneli için ürün filtreleme
   */
  filterProductsForCustomer(products) {
    return products
      .filter(product => this.isActiveProduct(product))
      .map(product => this.enrichProductForCustomer(product));
  }

  /**
   * Kasalı kategori oluştur (duplikasyon önleme)
   */
  createKasaliCategory(originalCategory) {
    if (!originalCategory) return 'Kasalı Ürünler';

    // Zaten kasalı ise duplike etme
    if (originalCategory.startsWith(this.KASALI_CATEGORY_PREFIX)) {
      return originalCategory;
    }

    return `${this.KASALI_CATEGORY_PREFIX} ${originalCategory}`;
  }

  /**
   * Orijinal kategoriyi çıkar
   */
  extractOriginalCategory(category) {
    if (!category) return 'Genel';

    if (category.startsWith(this.KASALI_CATEGORY_PREFIX)) {
      return category.replace(`${this.KASALI_CATEGORY_PREFIX} `, '').trim();
    }

    return category;
  }

  /**
   * Kasalı birim kontrolü
   */
  isKasaliUnit(unit) {
    return this.KASALI_UNITS.includes(unit?.toLowerCase());
  }

  /**
   * Kasalı ürün kontrolü (kapsamlı)
   */
  isKasaliProduct(product) {
    return (
      this.isKasaliUnit(product.unit) ||
      product.category?.startsWith(this.KASALI_CATEGORY_PREFIX) ||
      product.isKasali === true ||
      product.originalCategory
    );
  }

  /**
   * Aktif ürün kontrolü
   */
  isActiveProduct(product) {
    return (
      product.isActive !== false &&
      product.status !== 'inactive' &&
      product.status !== 'disabled'
      // Stok kontrolü kaldırıldı - ProductCard'da yapılacak
    );
  }

  /**
   * Müşteri için ürün zenginleştirme
   */
  enrichProductForCustomer(product) {
    return {
      ...product,
      isKasali: this.isKasaliProduct(product),
      displayCategory: this.isKasaliProduct(product) ? 'Kasalı Ürünler' : product.category,
      isAvailable: product.stock > 0, // Stok durumu ProductCard için
      stock: parseInt(product.stock) || 0, // Stok sayısını garanti et
      rating: product.rating || 4.5, // Rating ekle (varsayılan 4.5)
      discount: product.discount || 0, // İndirim bilgisi
      gallery: product.gallery || [product.image] // Gallery için fallback
    };
  }

  /**
   * Kasalı ürünler için kategori haritası oluştur
   */
  createCategoryMap(products) {
    const categoryMap = new Map();

    // Tüm ürünler kategorisi
    categoryMap.set('all', {
      id: 'all',
      name: 'Tüm Ürünler',
      icon: 'Grid3X3',
      count: products.length
    });

    products.forEach(product => {
      let categoryId, categoryName;

      if (this.isKasaliProduct(product)) {
        categoryId = 'kasali-urunler';
        categoryName = 'Kasalı Ürünler';
      } else {
        categoryId = product.category?.toLowerCase().replace(/\s+/g, '-') || 'genel';
        categoryName = product.category || 'Genel';
      }

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          icon: this.getCategoryIcon(categoryName),
          count: 0
        });
      }

      categoryMap.get(categoryId).count++;
    });

    return Array.from(categoryMap.values()).filter(cat => cat.count > 0);
  }

  /**
   * Kategori ikonu belirle
   */
  getCategoryIcon(categoryName) {
    const iconMap = {
      'Kasalı Ürünler': 'Package',
      'Sebzeler': 'Leaf',
      'Meyveler': 'Apple',
      'Genel': 'Package2'
    };

    return iconMap[categoryName] || 'Package2';
  }

  /**
   * Real-time senkronizasyon tetikle
   */
  triggerSync(products) {
    // Storage event
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'kirilmazlar_products',
      newValue: JSON.stringify(products),
      storageArea: localStorage
    }));

    // Custom event
    window.dispatchEvent(new CustomEvent('productsUpdated', {
      detail: { products, timestamp: Date.now() }
    }));

    // BroadcastChannel
    if (window.BroadcastChannel) {
      const channel = new BroadcastChannel('products-sync');
      channel.postMessage({
        type: 'PRODUCTS_UPDATED',
        products,
        timestamp: Date.now()
      });
      channel.close();
    }

    logger.info('📢 Ürün senkronizasyonu tetiklendi:', products.length, 'ürün');
  }
}

// Singleton instance
const productSyncService = new ProductSyncService();
export default productSyncService;