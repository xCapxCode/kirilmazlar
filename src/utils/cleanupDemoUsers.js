// Demo kullanıcı verilerini temizleme yardımcı fonksiyonu
const cleanupDemoUsers = () => {
  try {
    // localStorage'dan tüm Bülent Üner ile ilgili verileri temizle
    const keysToClean = [
      'currentUser',
      'freshmarket_users', 
      'freshmarket_customers',
      'freshmarket_products',
      'freshmarket_orders'
    ];

    keysToClean.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          let parsedData = JSON.parse(data);
          
          if (key === 'currentUser') {
            // Mevcut kullanıcı Bülent Üner ise temizle
            if (parsedData && (parsedData.email?.includes('bulentuner') || 
                parsedData.name?.toLowerCase().includes('bülent üner'))) {
              localStorage.removeItem(key);
              console.log('Demo currentUser temizlendi');
            }
          } else if (Array.isArray(parsedData)) {
            // Array ise Bülent Üner entrilerini filtrele
            const filteredData = parsedData.filter(item => {
              const itemStr = JSON.stringify(item).toLowerCase();
              return !itemStr.includes('bülent üner') && 
                     !itemStr.includes('bulentuner') &&
                     !itemStr.includes('bülen');
            });
            
            if (filteredData.length !== parsedData.length) {
              localStorage.setItem(key, JSON.stringify(filteredData));
              console.log(`Demo veriler temizlendi: ${key}`);
            }
          }
        } catch (e) {
          console.warn(`${key} parse edilemedi:`, e);
        }
      }
    });

    console.log('Demo kullanıcı temizleme işlemi tamamlandı');
  } catch (error) {
    console.error('Demo kullanıcı temizleme hatası:', error);
  }
};

// Temizleme işlemini hemen çalıştır
cleanupDemoUsers();

export default cleanupDemoUsers;
