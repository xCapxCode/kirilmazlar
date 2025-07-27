/**
 * Ürünler klasöründeki tüm ürünleri sisteme yükleyen utility
 * Browser'dan çalışır ve unified storage kullanır
 */

import storage from '@core/storage';
import logger from '@utils/productionLogger';

// Kategori ID mapping
const CATEGORY_IDS = {
  'Meyveler': 3,
  'Sebzeler': 2,
  'Kasalı Ürünler': 4,
  'Genel': 1
};

// Tüm ürün verileri
export const ALL_PRODUCTS_DATA = [
  {
    id: 'prod-1',
    name: 'Ananas',
    description: 'Taze ananas',
    category: 'Meyveler',
    categoryId: 3,
    subcategory: 'Tropik Meyveler',
    unit: 'kg',
    price: 35.00,
    stock: 25,
    minStock: 5,
    status: 'active',
    image: '/assets/images/products/Ananas.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-2',
    name: 'Armut',
    description: 'Taze armut',
    category: 'Meyveler',
    categoryId: 3,
    subcategory: 'Yumuşak Meyveler',
    unit: 'kg',
    price: 16.00,
    stock: 30,
    minStock: 6,
    status: 'active',
    image: '/assets/images/products/Armut.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-3',
    name: 'Avakado',
    description: 'Taze avakado',
    category: 'Meyveler',
    categoryId: 3,
    subcategory: 'Tropik Meyveler',
    unit: 'kg',
    price: 40.00,
    stock: 15,
    minStock: 3,
    status: 'active',
    image: '/assets/images/products/Avakado.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-4',
    name: 'Ayva',
    description: 'Taze ayva',
    category: 'Meyveler',
    subcategory: 'Yumuşak Meyveler',
    unit: 'kg',
    price: 14.00,
    stock: 20,
    minStock: 4,
    status: 'active',
    image: '/assets/images/products/Ayva.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-5',
    name: 'Darı Mısır',
    description: 'Taze darı mısır',
    category: 'Sebzeler',
    subcategory: 'Mevsim Sebzeleri',
    unit: 'kg',
    price: 4.00,
    stock: 40,
    minStock: 8,
    status: 'active',
    image: '/assets/images/products/DarıMısır.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-6',
    name: 'Domates',
    description: 'Taze domates',
    category: 'Sebzeler',
    subcategory: 'Mevsim Sebzeleri',
    unit: 'kg',
    price: 18.00,
    stock: 35,
    minStock: 7,
    status: 'active',
    image: '/assets/images/products/Domates.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-7',
    name: 'Elma',
    description: 'Taze kırmızı elma',
    category: 'Meyveler',
    subcategory: 'Yumuşak Meyveler',
    unit: 'kg',
    price: 15.00,
    stock: 45,
    minStock: 10,
    status: 'active',
    image: '/assets/images/products/Elma.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-8',
    name: 'Greyfurt',
    description: 'Taze greyfurt',
    category: 'Meyveler',
    subcategory: 'Turunçgiller',
    unit: 'kg',
    price: 22.00,
    stock: 28,
    minStock: 5,
    status: 'active',
    image: '/assets/images/products/Greyfurt.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-9',
    name: 'Kabak',
    description: 'Taze kabak',
    category: 'Sebzeler',
    subcategory: 'Mevsim Sebzeleri',
    unit: 'kg',
    price: 6.00,
    stock: 30,
    minStock: 6,
    status: 'active',
    image: '/assets/images/products/kabak.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-10',
    name: 'Kavun',
    description: 'Taze kavun',
    category: 'Meyveler',
    subcategory: 'Yumuşak Meyveler',
    unit: 'kg',
    price: 8.00,
    stock: 25,
    minStock: 5,
    status: 'active',
    image: '/assets/images/products/Kavun.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-11',
    name: 'Kayısı',
    description: 'Taze kayısı',
    category: 'Meyveler',
    subcategory: 'Yumuşak Meyveler',
    unit: 'kg',
    price: 35.00,
    stock: 18,
    minStock: 4,
    status: 'active',
    image: '/assets/images/products/Kayısı.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-12',
    name: 'Kereviz',
    description: 'Taze kereviz',
    category: 'Sebzeler',
    subcategory: 'Kök Sebzeler',
    unit: 'kg',
    price: 18.00,
    stock: 22,
    minStock: 4,
    status: 'active',
    image: '/assets/images/products/Kereviz.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-13',
    name: 'Kiraz',
    description: 'Taze kiraz',
    category: 'Meyveler',
    subcategory: 'Yumuşak Meyveler',
    unit: 'kg',
    price: 60.00,
    stock: 12,
    minStock: 2,
    status: 'active',
    image: '/assets/images/products/Kiraz.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-14',
    name: 'Kivi',
    description: 'Taze kivi',
    category: 'Meyveler',
    subcategory: 'Tropik Meyveler',
    unit: 'kg',
    price: 25.00,
    stock: 20,
    minStock: 4,
    status: 'active',
    image: '/assets/images/products/Kivi.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-15',
    name: 'Kırmızı Biber',
    description: 'Taze kırmızı biber',
    category: 'Sebzeler',
    subcategory: 'Mevsim Sebzeleri',
    unit: 'kg',
    price: 25.00,
    stock: 24,
    minStock: 5,
    status: 'active',
    image: '/assets/images/products/Kırmızı Biber.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-16',
    name: 'Kıvırcık',
    description: 'Taze kıvırcık',
    category: 'Sebzeler',
    subcategory: 'Yeşil Yapraklılar',
    unit: 'kg',
    price: 12.00,
    stock: 28,
    minStock: 6,
    status: 'active',
    image: '/assets/images/products/Kıvırcık.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-17',
    name: 'Lahana',
    description: 'Taze lahana',
    category: 'Sebzeler',
    subcategory: 'Yeşil Yapraklılar',
    unit: 'kg',
    price: 5.00,
    stock: 35,
    minStock: 8,
    status: 'active',
    image: '/assets/images/products/lahana.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-18',
    name: 'Lime',
    description: 'Taze lime',
    category: 'Meyveler',
    subcategory: 'Turunçgiller',
    unit: 'kg',
    price: 30.00,
    stock: 15,
    minStock: 3,
    status: 'active',
    image: '/assets/images/products/Lime.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-19',
    name: 'Limon',
    description: 'Taze limon',
    category: 'Meyveler',
    subcategory: 'Turunçgiller',
    unit: 'kg',
    price: 25.00,
    stock: 22,
    minStock: 5,
    status: 'active',
    image: '/assets/images/products/Limon.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-20',
    name: 'Mandalina',
    description: 'Taze mandalina',
    category: 'Meyveler',
    subcategory: 'Turunçgiller',
    unit: 'kg',
    price: 18.00,
    stock: 32,
    minStock: 6,
    status: 'active',
    image: '/assets/images/products/Mandalina.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-21',
    name: 'Mantar',
    description: 'Taze mantar',
    category: 'Sebzeler',
    subcategory: 'Özel Sebzeler',
    unit: 'kg',
    price: 35.00,
    stock: 16,
    minStock: 3,
    status: 'active',
    image: '/assets/images/products/Mantar.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-22',
    name: 'Muz',
    description: 'Taze muz',
    category: 'Meyveler',
    subcategory: 'Tropik Meyveler',
    unit: 'kg',
    price: 12.00,
    stock: 40,
    minStock: 8,
    status: 'active',
    image: '/assets/images/products/Muz.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-23',
    name: 'Nar',
    description: 'Taze nar',
    category: 'Meyveler',
    subcategory: 'Yumuşak Meyveler',
    unit: 'kg',
    price: 24.00,
    stock: 20,
    minStock: 4,
    status: 'active',
    image: '/assets/images/products/Nar.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-24',
    name: 'Nektarin',
    description: 'Taze nektarin',
    category: 'Meyveler',
    subcategory: 'Yumuşak Meyveler',
    unit: 'kg',
    price: 32.00,
    stock: 18,
    minStock: 4,
    status: 'active',
    image: '/assets/images/products/nectarine.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-25',
    name: 'Patates',
    description: 'Taze patates',
    category: 'Sebzeler',
    subcategory: 'Kök Sebzeler',
    unit: 'kg',
    price: 7.00,
    stock: 50,
    minStock: 10,
    status: 'active',
    image: '/assets/images/products/patates.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-26',
    name: 'Portakal',
    description: 'Taze portakal',
    category: 'Meyveler',
    subcategory: 'Turunçgiller',
    unit: 'kg',
    price: 20.00,
    stock: 35,
    minStock: 7,
    status: 'active',
    image: '/assets/images/products/Portakal.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-27',
    name: 'Roka',
    description: 'Taze roka',
    category: 'Sebzeler',
    subcategory: 'Yeşil Yapraklılar',
    unit: 'kg',
    price: 15.00,
    stock: 22,
    minStock: 5,
    status: 'active',
    image: '/assets/images/products/Roka.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-28',
    name: 'Salatalık',
    description: 'Taze salatalık',
    category: 'Sebzeler',
    subcategory: 'Mevsim Sebzeleri',
    unit: 'kg',
    price: 8.00,
    stock: 38,
    minStock: 8,
    status: 'active',
    image: '/assets/images/products/Salatalık.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-29',
    name: 'Sarımsak',
    description: 'Taze sarımsak',
    category: 'Sebzeler',
    subcategory: 'Kök Sebzeler',
    unit: 'kg',
    price: 45.00,
    stock: 12,
    minStock: 3,
    status: 'active',
    image: '/assets/images/products/Sarımsak.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-30',
    name: 'Soğan (Çuval)',
    description: 'Taze soğan çuval',
    category: 'Kasalı Ürünler',
    subcategory: 'Kasalı Sebzeler',
    unit: 'çuval',
    price: 15.00,
    stock: 8,
    minStock: 2,
    status: 'active',
    image: '/assets/images/products/sogan-cuval.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-31',
    name: 'Tere Otu',
    description: 'Taze tere otu',
    category: 'Sebzeler',
    subcategory: 'Yeşil Yapraklılar',
    unit: 'kg',
    price: 8.00,
    stock: 25,
    minStock: 5,
    status: 'active',
    image: '/assets/images/products/TereOtu.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-32',
    name: 'Yeşil Elma',
    description: 'Taze yeşil elma',
    category: 'Meyveler',
    subcategory: 'Yumuşak Meyveler',
    unit: 'kg',
    price: 17.00,
    stock: 30,
    minStock: 6,
    status: 'active',
    image: '/assets/images/products/Yeşil Elma.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-33',
    name: 'Çilek',
    description: 'Taze çilek',
    category: 'Meyveler',
    subcategory: 'Yumuşak Meyveler',
    unit: 'kg',
    price: 45.00,
    stock: 15,
    minStock: 3,
    status: 'active',
    image: '/assets/images/products/Çilek.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-34',
    name: 'Üzüm',
    description: 'Taze üzüm',
    category: 'Meyveler',
    subcategory: 'Yumuşak Meyveler',
    unit: 'kg',
    price: 22.00,
    stock: 28,
    minStock: 6,
    status: 'active',
    image: '/assets/images/products/Üzüm.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-35',
    name: 'İncir',
    description: 'Taze incir',
    category: 'Meyveler',
    subcategory: 'Yumuşak Meyveler',
    unit: 'kg',
    price: 38.00,
    stock: 14,
    minStock: 3,
    status: 'active',
    image: '/assets/images/products/İncir.png',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'prod-36',
    name: 'Şeftali',
    description: 'Taze şeftali',
    category: 'Meyveler',
    subcategory: 'Yumuşak Meyveler',
    unit: 'kg',
    price: 28.00,
    stock: 20,
    minStock: 4,
    status: 'active',
    image: '/assets/images/products/Şeftali.png',
    createdAt: new Date().toISOString(),
    isActive: true
  }
];

/**
 * Tüm ürünleri sisteme yükler
 */
export const loadAllProductsToSystem = async () => {
  try {
    logger.system('product', 'Tüm ürünler sisteme yükleniyor...');

    // Mevcut ürünleri kontrol et
    const existingProducts = await storage.get('products', []);
    logger.info('📊 Mevcut ürün sayısı:', existingProducts.length);

    if (existingProducts.length >= 30) {
      logger.success('Sistem zaten yeterli ürünle dolu');
      return existingProducts;
    }

    // Tüm ürünleri yükle
    await storage.set('products', ALL_PRODUCTS_DATA);
    logger.success('36 ürün başarıyla sisteme yüklendi!');

    // Storage değişikliğini bildir
    storage.notify('products', ALL_PRODUCTS_DATA);

    return ALL_PRODUCTS_DATA;

  } catch (error) {
    logger.error('Ürünler yüklenirken hata:', error);
    throw error;
  }
};

/**
 * Sadece eksik ürünleri ekler
 */
export const syncMissingProducts = async () => {
  try {
    logger.system('product', 'Eksik ürünler kontrol ediliyor...');

    const existingProducts = await storage.get('products', []);
    const existingNames = existingProducts.map(p => p.name);

    const missingProducts = ALL_PRODUCTS_DATA.filter(product =>
      !existingNames.includes(product.name)
    );

    if (missingProducts.length === 0) {
      logger.success('Eksik ürün yok');
      return existingProducts;
    }

    logger.info(`📦 ${missingProducts.length} eksik ürün bulundu, ekleniyor...`);

    // ID'leri yeniden düzenle ve categoryId ekle
    const maxId = existingProducts.length > 0
      ? Math.max(...existingProducts.map(p => parseInt(p.id.replace('prod-', '')) || 0))
      : 0;

    const updatedMissingProducts = missingProducts.map((product, index) => ({
      ...product,
      id: `prod-${maxId + index + 1}`,
      categoryId: CATEGORY_IDS[product.category] || 1 // Default: Tüm Ürünler
    }));

    const allProducts = [...existingProducts, ...updatedMissingProducts];
    await storage.set('products', allProducts);

    logger.success(`${missingProducts.length} yeni ürün eklendi!`);

    // Storage değişikliğini bildir
    storage.notify('products', allProducts);

    return allProducts;

  } catch (error) {
    logger.error('Eksik ürünler eklenirken hata:', error);
    throw error;
  }
};

/**
 * Mevcut ürünlere categoryId ekleyen migration function
 */
export const migrateCategoryIds = async () => {
  try {
    logger.system('product', 'CategoryId migration başlatılıyor...');

    const existingProducts = await storage.get('products', []);

    // CategoryId eksik ürünleri bul ve güncelle
    const updatedProducts = existingProducts.map(product => {
      if (!product.categoryId) {
        return {
          ...product,
          categoryId: CATEGORY_IDS[product.category] || 1
        };
      }
      return product;
    });

    // Güncelleme varsa kaydet
    const needsUpdate = updatedProducts.some((product, index) =>
      product.categoryId !== existingProducts[index]?.categoryId
    );

    if (needsUpdate) {
      await storage.set('products', updatedProducts);
      logger.success('CategoryId migration tamamlandı!');
      storage.notify('products', updatedProducts);
    } else {
      logger.info('CategoryId migration gerekmiyor, tüm ürünler güncel');
    }

    return updatedProducts;

  } catch (error) {
    logger.error('CategoryId migration hatası:', error);
    throw error;
  }
};

export default {
  ALL_PRODUCTS_DATA,
  loadAllProductsToSystem,
  syncMissingProducts,
  migrateCategoryIds
};
