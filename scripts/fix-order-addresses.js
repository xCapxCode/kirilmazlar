// Browser console'da çalıştırın - Sipariş adreslerini düzelt

console.log('=== SİPARİŞ ADRESLERİNİ DÜZELT ===');

// Mevcut siparişleri al
const orders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
console.log('Toplam sipariş:', orders.length);

// Müşterileri al
const customers = JSON.parse(localStorage.getItem('customers') || '[]');
const users = JSON.parse(localStorage.getItem('users') || '[]');

// Bülent müşterisini bul
const bulentCustomer = customers.find(c =>
  c.name?.toLowerCase().includes('bülent') ||
  c.username === 'bulent' ||
  c.phone === '5323418409'
);

console.log('Bülent Customer:', bulentCustomer);

if (bulentCustomer && bulentCustomer.address) {
  // Bülent'in siparişlerini güncelle
  let updatedCount = 0;

  orders.forEach(order => {
    if (order.customerId === bulentCustomer.id ||
      order.customerName === bulentCustomer.name ||
      order.customerPhone === bulentCustomer.phone) {

      // Eski default adresi gerçek adresle değiştir
      const newAddress = `${bulentCustomer.address}${bulentCustomer.city ? ', ' + bulentCustomer.city : ''}${bulentCustomer.district ? ', ' + bulentCustomer.district : ''}`;

      order.deliveryAddress = newAddress;
      updatedCount++;

      console.log(`Sipariş ${order.id} adresi güncellendi:`, newAddress);
    }
  });

  if (updatedCount > 0) {
    localStorage.setItem('customer_orders', JSON.stringify(orders));
    console.log(`✅ ${updatedCount} sipariş adresi güncellendi`);
  } else {
    console.log('❌ Güncellenecek sipariş bulunamadı');
  }
} else {
  console.log('❌ Bülent müşterisi veya adresi bulunamadı');
}

console.log('=== İŞLEM TAMAMLANDI ===');