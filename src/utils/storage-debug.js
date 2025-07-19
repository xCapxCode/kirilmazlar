// Storage Debug Tool - Browser verilerini analiz eder
// Hiçbir veri silmez, sadece mevcut durumu gösterir

window.storageDebug = {
  // Tüm storage verilerini göster
  showAllData() {
    console.log('🔍 STORAGE DEBUG - MEVCUT VERİLER:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // localStorage verilerini göster
    const localStorageData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const value = JSON.parse(localStorage.getItem(key));
        localStorageData[key] = value;
        console.log(`📦 ${key}:`, value);
      } catch (e) {
        localStorageData[key] = localStorage.getItem(key);
        console.log(`📦 ${key}:`, localStorage.getItem(key));
      }
    }
    
    return localStorageData;
  },

  // Ürün verilerini analiz et
  analyzeProducts() {
    console.log('🔍 ÜRÜN ANALİZİ:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    
    console.log(`📊 Toplam Ürün: ${products.length}`);
    console.log(`📊 Toplam Kategori: ${categories.length}`);
    
    if (categories.length > 0) {
      console.log('📂 Kategoriler:');
      categories.forEach(cat => {
        const categoryProducts = products.filter(p => p.category === cat.name);
        console.log(`  - ${cat.name}: ${categoryProducts.length} ürün`);
      });
    }
    
    if (products.length > 0) {
      console.log('🏷️ Ürün Kategorileri:');
      const uniqueCategories = [...new Set(products.map(p => p.category))];
      uniqueCategories.forEach(cat => {
        const count = products.filter(p => p.category === cat).length;
        console.log(`  - ${cat}: ${count} ürün`);
      });
    }
    
    return { products, categories };
  },

  // Demo veri durumunu kontrol et
  checkDemoData() {
    console.log('🔍 DEMO VERİ KONTROLÜ:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const demoDataCreated = localStorage.getItem('demoDataCreated');
    const hasProducts = JSON.parse(localStorage.getItem('products') || '[]').length > 0;
    const hasCategories = JSON.parse(localStorage.getItem('categories') || '[]').length > 0;
    
    console.log(`📊 Demo Data Created: ${demoDataCreated}`);
    console.log(`📊 Has Products: ${hasProducts}`);
    console.log(`📊 Has Categories: ${hasCategories}`);
    
    return {
      demoDataCreated: !!demoDataCreated,
      hasProducts,
      hasCategories
    };
  },

  // Browser bilgilerini göster
  showBrowserInfo() {
    console.log('🔍 BROWSER BİLGİLERİ:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 User Agent: ${navigator.userAgent}`);
    console.log(`🌐 URL: ${window.location.href}`);
    console.log(`🌐 Origin: ${window.location.origin}`);
    console.log(`🌐 LocalStorage Support: ${typeof(Storage) !== "undefined"}`);
    
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      origin: window.location.origin,
      localStorageSupport: typeof(Storage) !== "undefined"
    };
  },

  // Tüm analizi çalıştır
  fullAnalysis() {
    console.clear();
    console.log('🔍 KAPSAMLI STORAGE ANALİZİ');
    console.log('════════════════════════════════════════');
    
    const browserInfo = this.showBrowserInfo();
    console.log('');
    
    const demoStatus = this.checkDemoData();
    console.log('');
    
    const productAnalysis = this.analyzeProducts();
    console.log('');
    
    const allData = this.showAllData();
    
    return {
      browserInfo,
      demoStatus,
      productAnalysis,
      allData
    };
  },

  // Sadece ürün ve kategori sayılarını hızlı göster
  quickCheck() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    console.log('⚡ HIZLI KONTROL:');
    console.log(`📦 Ürünler: ${products.length}`);
    console.log(`📂 Kategoriler: ${categories.length}`);
    console.log(`👥 Müşteriler: ${customers.length}`);
    
    return { products: products.length, categories: categories.length, customers: customers.length };
  },

  // Veriyi export et (kopyalama için)
  exportData() {
    console.log('📤 VERİ EXPORT EDILIYOR:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const exportData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        exportData[key] = JSON.parse(localStorage.getItem(key));
      } catch (e) {
        exportData[key] = localStorage.getItem(key);
      }
    }
    
    console.log('📋 Export Data (JSON format):');
    console.log(JSON.stringify(exportData, null, 2));
    
    // Clipboard'a kopyala (eğer destekleniyorsa)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
        .then(() => console.log('✅ Veri clipboard\'a kopyalandı!'))
        .catch(() => console.log('❌ Clipboard kopyalama hatası'));
    }
    
    return exportData;
  },

  // Browser URL farkını göster
  detectUrlDifference() {
    const currentUrl = window.location.href;
    const isLocalhost = currentUrl.includes('localhost');
    const is127 = currentUrl.includes('127.0.0.1');
    
    console.log('🔍 URL ANALİZİ:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Mevcut URL: ${currentUrl}`);
    console.log(`🏠 Localhost kullanımı: ${isLocalhost}`);
    console.log(`🔢 127.0.0.1 kullanımı: ${is127}`);
    
    if (isLocalhost) {
      console.log('💡 Bu localhost storage alanı - VS Code içi');
      console.log('💡 127.0.0.1 farklı bir storage alanı olabilir');
    } else if (is127) {
      console.log('💡 Bu 127.0.0.1 storage alanı - Opera browser');
      console.log('💡 localhost farklı bir storage alanı olabilir');
    }
    
    return { currentUrl, isLocalhost, is127 };
  },

  // Detaylı ürün kategorisi analizi
  detailedProductAnalysis() {
    console.log('🔍 DETAYLI ÜRÜN ANALİZİ:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    
    console.log(`📊 Toplam Ürün: ${products.length}`);
    console.log(`📊 Toplam Kategori: ${categories.length}`);
    
    // Kategorileri detaylı göster
    if (categories.length > 0) {
      console.log('\n📂 KAYITLI KATEGORİLER:');
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} (ID: ${cat.id})`);
      });
    }
    
    // Ürün kategorilerini göster
    if (products.length > 0) {
      console.log('\n🏷️ ÜRÜN KATEGORİ DAĞILIMI:');
      const categoryStats = {};
      products.forEach(product => {
        const cat = product.category || 'Kategorisiz';
        categoryStats[cat] = (categoryStats[cat] || 0) + 1;
      });
      
      Object.entries(categoryStats).forEach(([category, count]) => {
        console.log(`  - ${category}: ${count} ürün`);
      });
      
      // Kuruyemiş kontrolü
      const kuruyemisProducts = products.filter(p => 
        p.category && p.category.toLowerCase().includes('kuruyemiş')
      );
      
      if (kuruyemisProducts.length > 0) {
        console.log(`\n🥜 KURUYEMIŞ KATEGORİSİ: ${kuruyemisProducts.length} ürün bulundu`);
        kuruyemisProducts.forEach(product => {
          console.log(`  - ${product.name} (₺${product.price})`);
        });
      } else {
        console.log('\n🥜 KURUYEMIŞ KATEGORİSİ: Ürün bulunamadı');
      }
    }
    
    return { products, categories, productCount: products.length, categoryCount: categories.length };
  }
};

// Otomatik olarak bir hızlı kontrol yap
console.log('🔧 Storage Debug Tool yüklendi! Kullanım:');
console.log('• storageDebug.quickCheck() - Hızlı kontrol');
console.log('• storageDebug.fullAnalysis() - Detaylı analiz'); 
console.log('• storageDebug.analyzeProducts() - Ürün analizi');

// İlk kontrol
window.storageDebug.quickCheck();
