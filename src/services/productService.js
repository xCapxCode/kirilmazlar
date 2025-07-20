import storage from '@core/storage';

/**
 * Ürün yönetimi için servis sınıfı
 * Ürün CRUD işlemleri ve senkronizasyon için kullanılır
 */
class ProductService {
  /**
   * Tüm ürünleri getirir
   * @param {Object} options - Filtreleme seçenekleri
   * @returns {Promise<Array>} - Ürün listesi
   */
  async getAll(options = {}) {
    try {
      const products = await storage.get('products', []);
      
      if (options.activeOnly) {
        return products.filter(product => 
          product.isActive === true || 
          product.status === 'active' || 
          product.status === 'available'
        );
      }
      
      return products;
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      throw error;
    }
  }

  /**
   * ID'ye göre ürün getirir
   * @param {number|string} id - Ürün ID'si
   * @returns {Promise<Object|null>} - Ürün nesnesi veya null
   */
  async getById(id) {
    try {
      const products = await storage.get('products', []);
      return products.find(product => product.id === id) || null;
    } catch (error) {
      console.error(`ID'si ${id} olan ürün yüklenirken hata:`, error);
      throw error;
    }
  }

  /**
   * Yeni ürün oluşturur
   * @param {Object} productData - Ürün verileri
   * @returns {Promise<Object>} - Oluşturulan ürün
   */
  async create(productData) {
    try {
      const products = await storage.get('products', []);
      
      // Yeni ID oluştur
      const newId = products.length > 0 
        ? Math.max(...products.map(p => typeof p.id === 'number' ? p.id : 0)) + 1 
        : 1;
      
      // Ürün nesnesini oluştur
      const newProduct = {
        ...productData,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Status ve isActive alanlarını senkronize et
      if (productData.status === 'active' || productData.status === 'available') {
        newProduct.isActive = true;
      } else if (productData.status === 'inactive' || productData.status === 'unavailable') {
        newProduct.isActive = false;
      } else {
        // Varsayılan olarak aktif
        newProduct.isActive = true;
        newProduct.status = 'active';
      }
      
      // Storage'a kaydet
      const updatedProducts = [...products, newProduct];
      await storage.set('products', updatedProducts);
      
      // Gerçek zamanlı senkronizasyon için storage event'i tetikle
      storage.notify('products', updatedProducts);
      
      console.log(`✅ Yeni ürün oluşturuldu: ${newId} -> ${newProduct.name}`);
      
      return newProduct;
    } catch (error) {
      console.error('Ürün oluşturulurken hata:', error);
      throw error;
    }
  }

  /**
   * Ürün günceller
   * @param {number|string} id - Ürün ID'si
   * @param {Object} productData - Güncellenecek ürün verileri
   * @returns {Promise<Object|null>} - Güncellenen ürün veya null
   */
  async update(id, productData) {
    try {
      const products = await storage.get('products', []);
      const index = products.findIndex(product => product.id === id);
      
      if (index === -1) {
        return null;
      }
      
      // Status ve isActive alanlarını senkronize et
      if (productData.status === 'active' || productData.status === 'available') {
        productData.isActive = true;
      } else if (productData.status === 'inactive' || productData.status === 'unavailable') {
        productData.isActive = false;
      }
      
      // Ürünü güncelle
      const updatedProduct = {
        ...products[index],
        ...productData,
        updatedAt: new Date().toISOString()
      };
      
      const updatedProducts = [
        ...products.slice(0, index),
        updatedProduct,
        ...products.slice(index + 1)
      ];
      
      await storage.set('products', updatedProducts);
      
      // Gerçek zamanlı senkronizasyon için storage event'i tetikle
      storage.notify('products', updatedProducts);
      
      console.log(`✅ Ürün güncellendi: ${id} -> ${updatedProduct.name}`);
      
      return updatedProduct;
    } catch (error) {
      console.error(`ID'si ${id} olan ürün güncellenirken hata:`, error);
      throw error;
    }
  }

  /**
   * Ürün durumunu günceller
   * @param {number|string} id - Ürün ID'si
   * @param {string} status - Yeni durum ('active' veya 'inactive')
   * @returns {Promise<Object|null>} - Güncellenen ürün veya null
   */
  async updateStatus(id, status) {
    try {
      const products = await storage.get('products', []);
      const index = products.findIndex(product => product.id === id);
      
      if (index === -1) {
        return null;
      }
      
      // Status ve isActive alanlarını senkronize et
      const isActive = status === 'active' || status === 'available';
      
      // Ürünü güncelle
      const updatedProduct = {
        ...products[index],
        status,
        isActive,
        updatedAt: new Date().toISOString()
      };
      
      const updatedProducts = [
        ...products.slice(0, index),
        updatedProduct,
        ...products.slice(index + 1)
      ];
      
      await storage.set('products', updatedProducts);
      
      // Gerçek zamanlı senkronizasyon için storage event'i tetikle
      storage.notify('products', updatedProducts);
      
      console.log(`✅ Ürün durumu güncellendi: ${id} -> ${status} (isActive: ${isActive})`);
      
      return updatedProduct;
    } catch (error) {
      console.error(`ID'si ${id} olan ürün durumu güncellenirken hata:`, error);
      throw error;
    }
  }

  /**
   * Ürün siler
   * @param {number|string} id - Ürün ID'si
   * @returns {Promise<boolean>} - Başarılı ise true, değilse false
   */
  async delete(id) {
    try {
      const products = await storage.get('products', []);
      const updatedProducts = products.filter(product => product.id !== id);
      
      if (updatedProducts.length === products.length) {
        return false; // Ürün bulunamadı
      }
      
      await storage.set('products', updatedProducts);
      
      // Gerçek zamanlı senkronizasyon için storage event'i tetikle
      storage.notify('products', updatedProducts);
      
      console.log(`✅ Ürün silindi: ${id}`);
      
      return true;
    } catch (error) {
      console.error(`ID'si ${id} olan ürün silinirken hata:`, error);
      throw error;
    }
  }

  /**
   * Kategori bazında ürünleri getirir
   * @param {string} categoryName - Kategori adı
   * @returns {Promise<Array>} - Ürün listesi
   */
  async getByCategory(categoryName) {
    try {
      const products = await storage.get('products', []);
      return products.filter(product => product.category === categoryName);
    } catch (error) {
      console.error(`Kategori ${categoryName} için ürünler yüklenirken hata:`, error);
      throw error;
    }
  }

  /**
   * Düşük stoklu ürünleri getirir
   * @returns {Promise<Array>} - Düşük stoklu ürün listesi
   */
  async getLowStockProducts() {
    try {
      const products = await storage.get('products', []);
      return products.filter(product => 
        product.stock <= (product.minStock || 5)
      );
    } catch (error) {
      console.error('Düşük stoklu ürünler yüklenirken hata:', error);
      throw error;
    }
  }
}

export default new ProductService();
