// Merkezi Veri Yönetim Servisi
import storage from '@core/storage';
import { TEST_BUSINESS } from '../data/testUsers.js';
import dataValidator from '../utils/dataValidator.js';
import { logger } from '../utils/productionLogger.js';

class DataService {
    constructor() {
        this.isInitialized = false;
        this.initializeData();
    }

    // Veri başlatma - Sadece bir kez çalışır
    initializeData() {
        if (this.isInitialized) return;

        try {
            // Veri versiyonu kontrolü
            const currentVersion = '1.0.0';
            const savedVersion = storage.get('dataVersion');

            if (savedVersion !== currentVersion) {
                logger.info('🔄 Veri versiyonu güncelleniyor:', savedVersion, '→', currentVersion);
                this.resetAllData();
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
        // Kullanıcılar - Ana yönetici hesabı otomatik oluştur
        let users = storage.get('users', []);
        logger.debug('🔍 Mevcut users tablosu:', users);
        logger.debug('🔍 Users tablosu uzunluğu:', users?.length);

        if (!users || users.length === 0) {
            // Ana yönetici hesabı oluştur
            const defaultOwner = {
                id: 'owner-' + Date.now(),
                username: 'admin',
                email: 'admin@kirilmazlar.com',
                password: 'admin123', // İlk kurulumda, değiştirilebilir
                name: 'Ana Yönetici',
                role: 'owner',
                businessId: 'business-1',
                createdAt: new Date().toISOString(),
                isActive: true,
                isDefaultAccount: true // Varsayılan hesap işareti
            };

            users = [defaultOwner];
            storage.set('users', users);
            logger.info('� Ana yönetici hesabı oluşturuldu - Kullanıcı Adı: admin, Şifre: admin123');
        }

        // İşletme bilgileri
        if (!storage.get('business')) {
            storage.set('business', TEST_BUSINESS);
            logger.info('🏢 İşletme bilgileri yüklendi');
        }

        // Kategoriler
        if (!storage.get('categories') || storage.get('categories').length === 0) {
            storage.set('categories', []);
            logger.info('📂 Kategoriler başlatıldı');
        }

        // Ürünler
        if (!storage.get('products') || storage.get('products').length === 0) {
            storage.set('products', []);
            logger.info('📦 Ürünler başlatıldı');
        }

        // Siparişler
        if (!storage.get('orders')) {
            storage.set('orders', []);
            logger.info('📋 Siparişler başlatıldı');
        }

        // Sepet
        if (!storage.get('cart')) {
            storage.set('cart', []);
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
