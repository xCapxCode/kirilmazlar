// Merkezi Veri Yönetim Servisi
import storage from '@core/storage';
import { ALL_USERS, INITIAL_CUSTOMERS } from '../data/initialData.js';
import dataValidator from '../utils/dataValidator.js';
import logger from '../utils/logger.js';

class DataService {
    constructor() {
        this.isInitialized = false;
        // Constructor'da initializeData çağıralım
        this.initializeData();
    }

    // Veri başlatma - Sadece bir kez çalışır
    initializeData() {
        if (this.isInitialized) {
            logger.debug('DataService zaten initialize edilmiş, atlanıyor');
            return;
        }

        try {
            logger.info('🚀 DataService initialization başlıyor...');
            this.isInitialized = true; // Hemen başlangıçta true yapalım
            // Veri versiyonu kontrolü
            const currentVersion = '1.0.0';
            const savedVersion = storage.get('dataVersion');

            if (savedVersion !== currentVersion) {
                logger.info('🔄 Veri versiyonu güncelleniyor:', savedVersion, '→', currentVersion);
                // VERSİYON GÜNCELLEMEDE KULLANICI VERİLERİNİ SİLME
                // this.resetAllData(); // KALDIRILDI - Kullanıcı verilerini koruyalım
                storage.set('dataVersion', currentVersion);
            }

            // Temel verileri kontrol et ve eksikleri tamamla
            this.ensureBaseData();

            // Veri doğrulaması yap
            const validation = dataValidator.validateAll();
            if (!validation.isValid) {
                logger.warn('⚠️ Veri doğrulama sorunları tespit edildi');
                // Otomatik düzeltme dene
                const fixes = dataValidator.autoFix();
                if (fixes.length > 0) {
                    logger.info('🔧 Otomatik düzeltmeler uygulandı:', fixes);
                }
            }

            // Periyodik doğrulama başlat (sadece development'da)
            if (import.meta.env.DEV) {
                dataValidator.startPeriodicValidation(10); // 10 dakikada bir
            }

            this.isInitialized = true;
            logger.info('✅ Veri servisi başlatıldı');
        } catch (error) {
            logger.error('❌ Veri servisi başlatma hatası:', error);
        }
    }

    // Temel verilerin varlığını kontrol et
    ensureBaseData() {
        // Temel verilerin varlığını kontrol et ve eksikleri tamamla

        // Kullanıcılar - İlk kez yükleniyorsa gerçek verileri yükle
        const existingUsers = storage.get('users');
        if (!existingUsers || existingUsers.length === 0) {
            // İlk veri yükleme
            storage.set('users', ALL_USERS);
            logger.info('👥 İlk kullanıcı verileri yüklendi:', ALL_USERS.length);
        }

        // Müşteriler - İlk kez yükleniyorsa gerçek verileri yükle
        const existingCustomers = storage.get('customers');
        if (!existingCustomers || existingCustomers.length === 0) {
            storage.set('customers', INITIAL_CUSTOMERS);
            logger.info('👤 İlk müşteri verileri yüklendi:', INITIAL_CUSTOMERS.length);
        }

        // Kategoriler - Temel kategoriler oluştur
        const existingCategories = storage.get('categories');
        if (!existingCategories || existingCategories.length === 0) {
            const basicCategories = [
                {
                    id: 'cat-1',
                    name: 'Meyve',
                    description: 'Taze meyveler',
                    image: null,
                    isActive: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'cat-2',
                    name: 'Sebze',
                    description: 'Taze sebzeler',
                    image: null,
                    isActive: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'cat-3',
                    name: 'Kasalı Ürünler',
                    description: 'Taze sebzeler',
                    image: null,
                    isActive: true,
                    createdAt: new Date().toISOString()
                }
            ];
            storage.set('categories', basicCategories);
            logger.info('📂 Temel kategori verileri oluşturuldu:', basicCategories.length);
        }

        // Ürünler - Demo ürünleri yükle (sadece ilk kez)
        const existingProducts = storage.get('products');
        if (!existingProducts || existingProducts.length === 0) {
            // Demo ürünleri import et
            import('../data/demoData.js').then(({ DEMO_PRODUCTS }) => {
                // Kasalı ürünler dahil tüm demo ürünleri yükle
                storage.set('products', DEMO_PRODUCTS);
                logger.info('📦 Demo ürünler yüklendi (kasalı ürünler dahil):', DEMO_PRODUCTS.length);
                
                // Kasalı ürün sayısını logla
                const kasaliCount = DEMO_PRODUCTS.filter(p => 
                    p.unit === 'kasa' || p.unit === 'çuval' || 
                    p.category?.startsWith('Kasalı ') ||
                    p.originalCategory
                ).length;
                logger.info('🗃️ Kasalı ürün sayısı:', kasaliCount);
            }).catch(error => {
                logger.error('❌ Demo ürün yükleme hatası:', error);
            });
        }

        // Siparişler
        if (!storage.get('orders')) {
            storage.set('orders', []);
            logger.info('� Sipariş storage başlatıldı');
        }

        // Sepet
        if (!storage.get('cart')) {
            storage.set('cart', []);
        }

        // Kullanıcı sayısını logla
        const users = storage.get('users', []);
        logger.info(`👥 Toplam kullanıcı sayısı: ${users.length}`);
        if (users.length > 0) {
            logger.info(`📋 Kullanıcılar: ${users.map(u => `${u.username}(${u.role})`).join(', ')}`);
        }
    }

    // Tüm verileri sıfırla
    resetAllData() {
        const keysToReset = [
            'users', 'business', 'categories', 'products',
            'orders', 'cart', 'currentUser', 'isAuthenticated'
        ];

        keysToReset.forEach(key => {
            storage.remove(key);
        });

        logger.info('🧹 Tüm veriler sıfırlandı');
    }

    // Veri tutarlılığını kontrol et
    validateDataIntegrity() {
        const issues = [];

        // Kullanıcı kontrolü
        const users = storage.get('users', []);
        if (users.length === 0) {
            issues.push('Kullanıcı verisi eksik');
        }

        // Ürün-kategori ilişkisi kontrolü
        const products = storage.get('products', []);
        const categories = storage.get('categories', []);
        const categoryIds = categories.map(c => c.id);

        products.forEach(product => {
            if (!categoryIds.includes(product.categoryId)) {
                issues.push(`Ürün "${product.name}" geçersiz kategori ID'sine sahip: ${product.categoryId}`);
            }
        });

        if (issues.length > 0) {
            logger.warn('⚠️ Veri tutarlılık sorunları:', issues);
            return false;
        }

        return true;
    }

    // Veri export/import (tarayıcılar arası senkronizasyon için)
    exportData() {
        const data = {
            version: storage.get('dataVersion'),
            timestamp: new Date().toISOString(),
            users: storage.get('users', []),
            business: storage.get('business'),
            categories: storage.get('categories', []),
            products: storage.get('products', []),
            orders: storage.get('orders', [])
        };

        return JSON.stringify(data, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            // Versiyon kontrolü
            if (data.version && data.version !== storage.get('dataVersion')) {
                logger.warn('⚠️ Farklı veri versiyonu import ediliyor');
            }

            // Verileri import et
            if (data.users) storage.set('users', data.users);
            if (data.business) storage.set('business', data.business);
            if (data.categories) storage.set('categories', data.categories);
            if (data.products) storage.set('products', data.products);
            if (data.orders) storage.set('orders', data.orders);

            logger.info('✅ Veri import işlemi tamamlandı');
            return { success: true };
        } catch (error) {
            logger.error('❌ Veri import hatası:', error);
            return { success: false, error: error.message };
        }
    }

    // Sistem durumu raporu
    getSystemStatus() {
        return {
            isInitialized: this.isInitialized,
            dataVersion: storage.get('dataVersion'),
            userCount: storage.get('users', []).length,
            productCount: storage.get('products', []).length,
            categoryCount: storage.get('categories', []).length,
            orderCount: storage.get('orders', []).length,
            isAuthenticated: storage.get('isAuthenticated', false),
            currentUser: storage.get('currentUser')?.email || null,
            lastUpdate: new Date().toISOString()
        };
    }
}

export default new DataService();
