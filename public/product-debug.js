// Hızlı ürün debug script'i
console.log('🚀 ÜRÜN DEBUG BAŞLADI');

// 1. Storage kontrolü
const storage = localStorage;
console.log('📦 STORAGE CONTROL:');
const products = JSON.parse(storage.getItem('kirilmazlar_products') || '[]');
console.log('Mevcut ürün sayısı:', products.length);

// 2. Demo ürün yükleme
if (products.length === 0) {
  console.log('🆕 Demo ürünler ekleniyor...');
  
  const demoProducts = [
    {
      id: 'prod-1',
      name: 'Domates',
      description: 'Taze domates',
      category: 'Sebzeler',
      subcategory: 'Mevsim Sebzeleri',
      unit: 'kg',
      price: 18.00,
      stock: 25,
      minStock: 5,
      status: 'active',
      image: '/assets/images/products/Domates.png',
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: 'prod-2',
      name: 'Elma',
      description: 'Taze elma',
      category: 'Meyveler',
      subcategory: 'Yumuşak Meyveler',
      unit: 'kg',
      price: 15.00,
      stock: 40,
      minStock: 10,
      status: 'active',
      image: '/assets/images/products/Elma.png',
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: 'prod-3',
      name: 'Portakal',
      description: 'Taze portakal',
      category: 'Meyveler',
      subcategory: 'Turunçgiller',
      unit: 'kg',
      price: 20.00,
      stock: 28,
      minStock: 6,
      status: 'active',
      image: '/assets/images/products/Portakal.png',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ];
  
  storage.setItem('kirilmazlar_products', JSON.stringify(demoProducts));
  console.log('✅ 3 demo ürün eklendi!');
} else {
  console.log('✅ Ürünler zaten mevcut');
}

// 3. Sayfayı yenile
console.log('🔄 Sayfa yenileniyor...');
window.location.reload();
