import storage from '../core/storage/index.js';

/**
 * Kategori yönetimi için servis sınıfı
 * Kategori CRUD işlemleri ve senkronizasyon için kullanılır
 */
class CategoryService {
  /**
   * Tüm kategorileri getirir
   * @returns {Promise<Array>} - Kategori listesi
   */
  async getAll() {
    try {
      const categories = await storage.get('categories', []);
      
      // Eğer kategori yoksa varsayılan kategorileri oluştur
      if (categories.length === 0) {
        const defaultCategories = this.getDefaultCategories();
        await storage.set('categories', defaultCategories);
        return defaultCategories;
      }
      
      return categories;
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      throw error;
    }
  }

  /**
   * ID'ye göre kategori getirir
   * @param {number|string} id - Kategori ID'si
   * @returns {Promise<Object|null>} - Kategori nesnesi veya null
   */
  async getById(id) {
    try {
      const categories = await storage.get('categories', []);
      return categories.find(category => category.id === id) || null;
    } catch (error) {
      console.error(`ID'si ${id} olan kategori yüklenirken hata:`, error);
      throw error;
    }
  }

  /**
   * Yeni kategori oluşturur
   * @param {Object} categoryData - Kategori verileri
   * @returns {Promise<Object>} - Oluşturulan kategori
   */
  async create(categoryData) {
    try {
      const categories = await storage.get('categories', []);
      
      // Yeni ID oluştur
      const newId = categories.length > 0 
        ? Math.max(...categories.map(c => typeof c.id === 'number' ? c.id : 0)) + 1 
        : 1;
      
      // Kategori nesnesini oluştur
      const newCategory = {
        ...categoryData,
        id: newId,
        subcategories: categoryData.subcategories || ['Genel'],
        icon: categoryData.icon || 'Package',
        color: categoryData.color || 'blue'
      };
      
      // Storage'a kaydet
      const updatedCategories = [...categories, newCategory];
      await storage.set('categories', updatedCategories);
      
      return newCategory;
    } catch (error) {
      console.error('Kategori oluşturulurken hata:', error);
      throw error;
    }
  }

  /**
   * Kategori günceller
   * @param {number|string} id - Kategori ID'si
   * @param {Object} categoryData - Güncellenecek kategori verileri
   * @returns {Promise<Object|null>} - Güncellenen kategori veya null
   */
  async update(id, categoryData) {
    try {
      const categories = await storage.get('categories', []);
      const index = categories.findIndex(category => category.id === id);
      
      if (index === -1) {
        return null;
      }
      
      // Kategoriyi güncelle
      const updatedCategory = {
        ...categories[index],
        ...categoryData
      };
      
      const updatedCategories = [
        ...categories.slice(0, index),
        updatedCategory,
        ...categories.slice(index + 1)
      ];
      
      await storage.set('categories', updatedCategories);
      
      return updatedCategory;
    } catch (error) {
      console.error(`ID'si ${id} olan kategori güncellenirken hata:`, error);
      throw error;
    }
  }

  /**
   * Kategori siler
   * @param {number|string} id - Kategori ID'si
   * @returns {Promise<boolean>} - Başarılı ise true, değilse false
   */
  async delete(id) {
    try {
      const categories = await storage.get('categories', []);
      
      // "Tüm Ürünler" kategorisini silmeye izin verme
      const categoryToDelete = categories.find(category => category.id === id);
      if (categoryToDelete && categoryToDelete.name === 'Tüm Ürünler') {
        return false;
      }
      
      const updatedCategories = categories.filter(category => category.id !== id);
      
      if (updatedCategories.length === categories.length) {
        return false; // Kategori bulunamadı
      }
      
      await storage.set('categories', updatedCategories);
      return true;
    } catch (error) {
      console.error(`ID'si ${id} olan kategori silinirken hata:`, error);
      throw error;
    }
  }

  /**
   * Alt kategori ekler
   * @param {number|string} categoryId - Kategori ID'si
   * @param {string} subcategory - Alt kategori adı
   * @returns {Promise<Object|null>} - Güncellenen kategori veya null
   */
  async addSubcategory(categoryId, subcategory) {
    try {
      const categories = await storage.get('categories', []);
      const index = categories.findIndex(category => category.id === categoryId);
      
      if (index === -1) {
        return null;
      }
      
      const category = categories[index];
      
      // Alt kategori zaten varsa ekleme
      if (category.subcategories.includes(subcategory)) {
        return category;
      }
      
      // Alt kategoriyi ekle
      const updatedCategory = {
        ...category,
        subcategories: [...category.subcategories, subcategory]
      };
      
      const updatedCategories = [
        ...categories.slice(0, index),
        updatedCategory,
        ...categories.slice(index + 1)
      ];
      
      await storage.set('categories', updatedCategories);
      
      return updatedCategory;
    } catch (error) {
      console.error(`ID'si ${categoryId} olan kategoriye alt kategori eklenirken hata:`, error);
      throw error;
    }
  }

  /**
   * Alt kategori siler
   * @param {number|string} categoryId - Kategori ID'si
   * @param {string} subcategory - Alt kategori adı
   * @returns {Promise<Object|null>} - Güncellenen kategori veya null
   */
  async removeSubcategory(categoryId, subcategory) {
    try {
      const categories = await storage.get('categories', []);
      const index = categories.findIndex(category => category.id === categoryId);
      
      if (index === -1) {
        return null;
      }
      
      const category = categories[index];
      
      // En az bir alt kategori kalmalı
      if (category.subcategories.length <= 1) {
        return category;
      }
      
      // Alt kategoriyi sil
      const updatedCategory = {
        ...category,
        subcategories: category.subcategories.filter(sc => sc !== subcategory)
      };
      
      const updatedCategories = [
        ...categories.slice(0, index),
        updatedCategory,
        ...categories.slice(index + 1)
      ];
      
      await storage.set('categories', updatedCategories);
      
      return updatedCategory;
    } catch (error) {
      console.error(`ID'si ${categoryId} olan kategoriden alt kategori silinirken hata:`, error);
      throw error;
    }
  }

  /**
   * Varsayılan kategorileri döndürür
   * @returns {Array} - Varsayılan kategori listesi
   */
  getDefaultCategories() {
    return [
      {
        id: 1,
        name: 'Tüm Ürünler',
        icon: 'Package',
        color: 'gray',
        subcategories: []
      },
      {
        id: 2,
        name: 'Sebzeler',
        icon: 'Leaf',
        color: 'green',
        subcategories: ['Yeşil Yapraklılar', 'Kök Sebzeler', 'Mevsim Sebzeleri']
      },
      {
        id: 3,
        name: 'Meyveler',
        icon: 'Apple',
        color: 'red',
        subcategories: ['Turunçgiller', 'Tropik Meyveler', 'Yumuşak Meyveler']
      },
      {
        id: 4,
        name: 'Kuru Yemiş',
        icon: 'Nut',
        color: 'amber',
        subcategories: ['Çiğ Kuruyemiş', 'Kurutulmuş Meyve']
      }
    ];
  }
}

export default new CategoryService();