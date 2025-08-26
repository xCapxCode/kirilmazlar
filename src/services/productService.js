import storage from '@core/storage';
import logger from '../utils/productionLogger.js';
import { generateId } from '../utils/helpers.js';
import dataValidator from '../utils/dataValidator.js';
import apiService from './apiService.js';
/**
 * Ürün yönetimi için servis sınıfı
 * Ürün CRUD işlemleri ve senkronizasyon için kullanılır
 */
class ProductService {
  /**
   * Tüm ürünleri getirir
   * @param {Object} filters - Filtreleme seçenekleri
   * @returns {Promise<Object>} - Ürün listesi ve sonuç bilgisi
   */
  async getAll(filters = {}) {
    try {
      const storageType = import.meta.env.VITE_STORAGE_TYPE || 'localStorage';
      
      if (storageType === 'api') {
        try {
          const result = await apiService.getProducts(filters);
          if (result.success) {
            // Cache the data locally
            await storage.set('products', result.products || []);
            return result;
          }
          throw new Error(result.error || 'API call failed');
        } catch (apiError) {
          logger.warn('API call failed, using localStorage fallback:', apiError.message);
          // Fall back to localStorage
        }
      }
      
      // localStorage implementation
      let products = await storage.get('products', []);
      
      // Filtreleme
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        products = products.filter(product => 
          product.name?.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.sku?.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.category) {
        products = products.filter(product => product.category === filters.category);
      }
      
      if (filters.status) {
        products = products.filter(product => product.status === filters.status);
      }
      
      if (filters.activeOnly) {
        products = products.filter(product =>
          product.isActive === true ||
          product.status === 'active' ||
          product.status === 'available'
        );
      }
      
      if (filters.minPrice || filters.maxPrice) {
        products = products.filter(product => {
          const price = parseFloat(product.price);
          if (filters.minPrice && price < parseFloat(filters.minPrice)) return false;
          if (filters.maxPrice && price > parseFloat(filters.maxPrice)) return false;
          return true;
        });
      }
      
      // Sıralama
      if (filters.sortBy) {
        products.sort((a, b) => {
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
        products = products.slice(start, end);
      }
      
      return {
        success: true,
        products,
        total: products.length
      };
    } catch (error) {
      logger.error('Ürünler yüklenirken hata:', error);
      return {
        success: false,
        error: error.message,
        products: []
      };
    }
  }

  /**
   * ID'ye göre ürün getirir
   * @param {number|string} id - Ürün ID'si
   * @returns {Promise<Object>} - Ürün nesnesi ve sonuç bilgisi
   */
  async getById(id) {
    try {
      const storageType = import.meta.env.VITE_STORAGE_TYPE || 'localStorage';
      
      if (storageType === 'api') {
        try {
          const result = await apiService.getProduct(id);
          if (result.success) {
            return result;
          }
          throw new Error(result.error || 'API call failed');
        } catch (apiError) {
          logger.warn('API call failed, using localStorage fallback:', apiError.message);
          // Fall back to localStorage
        }
      }
      
      // localStorage implementation
      const products = await storage.get('products', []);
      const product = products.find(p => p.id === id);
      
      if (!product) {
        return {
          success: false,
          error: 'Ürün bulunamadı'
        };
      }
      
      return {
        success: true,
        product
      };
    } catch (error) {
      logger.error(`ID'si ${id} olan ürün yüklenirken hata:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Yeni ürün oluşturur
   * @param {Object} productData - Ürün verileri
   * @returns {Promise<Object>} - Oluşturulan ürün
   */
  async create(productData) {
    try {
      // Veri doğrulama
      const validation = dataValidator.validateProduct(productData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Geçersiz ürün verisi',
          details: validation.errors
        };
      }
      
      const storageType = import.meta.env.VITE_STORAGE_TYPE || 'localStorage';
      
      if (storageType === 'api') {
        try {
          const result = await apiService.createProduct(productData);
          if (result.success) {
            // Update local cache
            const products = await storage.get('products', []);
            products.push(result.product);
            await storage.set('products', products);
            return result;
          }
          throw new Error(result.error || 'API call failed');
        } catch (apiError) {
          logger.warn('API call failed, using localStorage fallback:', apiError.message);
          // Fall back to localStorage
        }
      }
      
      // localStorage implementation
      const products = await storage.get('products', []);
      
      // SKU kontrolü
      if (products.some(p => p.sku === productData.sku)) {
        return {
          success: false,
          error: 'Bu SKU zaten kullanılıyor'
        };
      }

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

      logger.info(`✅ Yeni ürün oluşturuldu: ${newId} -> ${newProduct.name}`);

      return {
        success: true,
        product: newProduct
      };
    } catch (error) {
      logger.error('Ürün oluşturulurken hata:', error);
      return {
        success: false,
        error: error.message
      };
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
      const storageType = import.meta.env.VITE_STORAGE_TYPE || 'localStorage';
      
      if (storageType === 'api') {
        try {
          const result = await apiService.updateProduct(id, productData);
          if (result.success) {
            // Update local cache
            const products = await storage.get('products', []);
            const productIndex = products.findIndex(p => p.id === id);
            if (productIndex !== -1) {
              products[productIndex] = result.product;
              await storage.set('products', products);
            }
            return result;
          }
          throw new Error(result.error || 'API call failed');
        } catch (apiError) {
          logger.warn('API call failed, using localStorage fallback:', apiError.message);
          // Fall back to localStorage
        }
      }
      
      // localStorage implementation
      const products = await storage.get('products', []);
      const index = products.findIndex(product => product.id === id);

      if (index === -1) {
        return {
          success: false,
          error: 'Ürün bulunamadı'
        };
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

      logger.info(`✅ Ürün güncellendi: ${id} -> ${updatedProduct.name}`);

      return {
        success: true,
        product: updatedProduct
      };
    } catch (error) {
      logger.error(`ID'si ${id} olan ürün güncellenirken hata:`, error);
      return {
        success: false,
        error: error.message
      };
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

      logger.info(`✅ Ürün durumu güncellendi: ${id} -> ${status} (isActive: ${isActive})`);

      return updatedProduct;
    } catch (error) {
      logger.error(`ID'si ${id} olan ürün durumu güncellenirken hata:`, error);
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
      const storageType = import.meta.env.VITE_STORAGE_TYPE || 'localStorage';
      
      if (storageType === 'api') {
        try {
          const result = await apiService.deleteProduct(id);
          if (result.success) {
            // Update local cache
            const products = await storage.get('products', []);
            const filteredProducts = products.filter(p => p.id !== id);
            await storage.set('products', filteredProducts);
            return result;
          }
          throw new Error(result.error || 'API call failed');
        } catch (apiError) {
          logger.warn('API call failed, using localStorage fallback:', apiError.message);
          // Fall back to localStorage
        }
      }
      
      // localStorage implementation
      const products = await storage.get('products', []);
      const updatedProducts = products.filter(product => product.id !== id);

      if (updatedProducts.length === products.length) {
        return {
          success: false,
          error: 'Ürün bulunamadı'
        };
      }

      await storage.set('products', updatedProducts);

      // Gerçek zamanlı senkronizasyon için storage event'i tetikle
      storage.notify('products', updatedProducts);

      logger.info(`✅ Ürün silindi: ${id}`);

      return {
        success: true,
        message: 'Ürün başarıyla silindi'
      };
    } catch (error) {
      logger.error(`ID'si ${id} olan ürün silinirken hata:`, error);
      return {
        success: false,
        error: error.message
      };
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
      logger.error(`Kategori ${categoryName} için ürünler yüklenirken hata:`, error);
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
      logger.error('Düşük stoklu ürünler yüklenirken hata:', error);
      throw error;
    }
  }
}

export default new ProductService();
