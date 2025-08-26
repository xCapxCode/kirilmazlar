/**
 * Cache temizleme utility'si
 * Veri tutarsızlığı sorunlarını çözmek için localStorage'ı temizler
 */

// localStorage'ı tamamen temizle
export const clearAllCache = () => {
    try {
        // Tüm localStorage'ı temizle
        localStorage.clear();
        
        // SessionStorage'ı da temizle
        sessionStorage.clear();
        
        console.log('🧹 Cache tamamen temizlendi');
        
        // Sayfayı yenile
        window.location.reload();
    } catch (error) {
        console.error('❌ Cache temizleme hatası:', error);
    }
};

// Sadece sipariş cache'ini temizle
export const clearOrderCache = () => {
    try {
        localStorage.removeItem('customer_orders');
        localStorage.removeItem('orders');
        localStorage.removeItem('cart');
        
        console.log('🧹 Sipariş cache temizlendi');
        
        // Sayfayı yenile
        window.location.reload();
    } catch (error) {
        console.error('❌ Sipariş cache temizleme hatası:', error);
    }
};

// Veri tutarlılığını kontrol et
export const checkDataConsistency = () => {
    try {
        const customerOrders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        
        console.log('📊 Veri Durumu:');
        console.log('- Customer Orders:', customerOrders.length);
        console.log('- Orders:', orders.length);
        console.log('- Customers:', customers.length);
        
        // Müşteri sipariş sayıları
        const customerOrderCounts = {};
        customerOrders.forEach(order => {
            const customerId = order.customerId;
            customerOrderCounts[customerId] = (customerOrderCounts[customerId] || 0) + 1;
        });
        
        console.log('👤 Müşteri Sipariş Sayıları:', customerOrderCounts);
        
        return {
            customerOrders: customerOrders.length,
            orders: orders.length,
            customers: customers.length,
            customerOrderCounts
        };
    } catch (error) {
        console.error('❌ Veri kontrol hatası:', error);
        return null;
    }
};

// Global window'a ekle (console'dan erişim için)
if (typeof window !== 'undefined') {
    window.clearAllCache = clearAllCache;
    window.clearOrderCache = clearOrderCache;
    window.checkDataConsistency = checkDataConsistency;
    
    console.log('🔧 Cache utilities yüklendi:');
    console.log('- window.clearAllCache() - Tüm cache temizle');
    console.log('- window.clearOrderCache() - Sipariş cache temizle');
    console.log('- window.checkDataConsistency() - Veri durumunu kontrol et');
}