// Ürünlerdeki eksik categoryId'leri düzelt
const fs = require('fs');
const path = require('path');

// LocalStorage'dan veri okuma simülasyonu
const fixProductCategoryIds = () => {
  console.log('🔧 Ürün categoryId\'leri düzeltiliyor...');

  // Bu script browser console'da çalıştırılacak
  const script = `
// Ürünlerdeki eksik categoryId'leri düzelt
(async function fixCategoryIds() {
  const storage = window.localStorage;
  const productsKey = 'kirilmazlar_products';
  const categoriesKey = 'kirilmazlar_categories';
  
  try {
    // Mevcut ürünleri al
    const productsData = storage.getItem(productsKey);
    const categoriesData = storage.getItem(categoriesKey);
    
    if (!productsData || !categoriesData) {
      console.log('❌ Ürün veya kategori verisi bulunamadı');
      return;
    }
    
    const products = JSON.parse(productsData);
    const categories = JSON.parse(categoriesData);
    
    console.log('📊 Mevcut ürün sayısı:', products.length);
    console.log('📊 Mevcut kategori sayısı:', categories.length);
    
    // Kategori mapping'i oluştur
    const categoryMapping = {
      'Meyveler': 'cat-1',
      'Sebzeler': 'cat-2', 
      'İçecekler': 'cat-3',
      'Kasalı Ürünler': 'cat-4'
    };
    
    // Ürünleri güncelle
    let updatedCount = 0;
    const updatedProducts = products.map(product => {
      if (!product.categoryId && product.category) {
        const categoryId = categoryMapping[product.category];
        if (categoryId) {
          updatedCount++;
          return {
            ...product,
            categoryId: categoryId
          };
        }
      }
      return product;
    });
    
    // Güncellenmiş ürünleri kaydet
    storage.setItem(productsKey, JSON.stringify(updatedProducts));
    
    console.log('✅ ' + updatedCount + ' ürünün categoryId\'si güncellendi');
    console.log('✅ Ürünler başarıyla güncellendi');
    
    // Business objesi de düzeltelim
    const businessKey = 'kirilmazlar_business';
    const defaultBusiness = {
      id: 'business-1',
      name: 'Kırılmazlar Gıda',
      description: 'Taze gıda ürünleri',
      address: 'İstanbul, Türkiye',
      phone: '+90 555 123 4567',
      email: 'info@kirilmazlar.com',
      website: 'https://kirilmazlar.com',
      logo: '/assets/images/logo.png',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    storage.setItem(businessKey, JSON.stringify(defaultBusiness));
    console.log('✅ Business objesi oluşturuldu');
    
    // Sayfayı yenile
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
})();
`;

  return script;
};

console.log('Browser console\'da çalıştırılacak script:');
console.log('=====================================');
console.log(fixProductCategoryIds());
console.log('=====================================');