// Merkezi Veri Yönetim Servisi
import storage from '@core/storage';
import { ALL_USERS, INITIAL_CUSTOMERS } from '../data/initialData.js';
import { DEMO_CUSTOMERS, DEMO_ORDERS } from '../data/demoData.js';
import dataValidator from '../utils/dataValidator.js';
import logger from '../utils/productionLogger.js';
import apiService from './apiService.js';

class DataService {
    constructor() {
        this.isInitialized = false;
        // Constructor'da initializeData çağıralım
        this.initializeData();
    }

    // Veri yükleme ve başlatma
    async initializeData() {
        if (this.isInitialized) {
            logger.debug('DataService zaten initialize edilmiş, atlanıyor');
            return;
        }

        try {
            logger.info('🔄 DataService başlatılıyor...');
            
            const storageType = import.meta.env.VITE_STORAGE_TYPE || 'localStorage';
            logger.info(`📦 Storage type: ${storageType}`);
            
            if (storageType === 'api') {
                // API mode - test connection and sync initial data
                try {
                    await apiService.healthCheck();
                    logger.info('🌐 API connection successful');
                    
                    // Load initial data from API if needed
                    await this.syncFromAPI();
                } catch (apiError) {
                    logger.warn('🌐 API connection failed, using localStorage fallback:', apiError.message);
                    await this.initializeLocalStorage();
                }
            } else {
                // localStorage mode
                await this.initializeLocalStorage();
            }
            
            this.isInitialized = true;
            logger.info('✅ DataService başarıyla başlatıldı');
            return true;
        } catch (error) {
            logger.error('❌ DataService başlatma hatası:', error);
            return false;
        }
    }
    
    // Initialize localStorage data
    async initializeLocalStorage() {
        // Production environment kontrolü
        const isProduction = import.meta.env.PROD || import.meta.env.VITE_APP_ENVIRONMENT === 'production';
        logger.info('🌍 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
        
        // Veri versiyonu kontrolü
        const currentVersion = '1.0.0';
        const savedVersion = storage.get('dataVersion');

        if (savedVersion !== currentVersion) {
            logger.info('🔄 Veri versiyonu güncelleniyor:', savedVersion, '→', currentVersion);
            // Production'da veri sıfırlama yapmayalım
            if (!isProduction) {
                logger.info('🧹 Development ortamında veri sıfırlanıyor');
                // this.resetAllData(); // Gerekirse aktif et
            }
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
    }
    
    // Sync data from API
    async syncFromAPI() {
        try {
            logger.info('🔄 Syncing data from API...');
            
            // Check if we have any local data
            const hasLocalData = storage.get('dataVersion');
            
            if (!hasLocalData) {
                // First time setup - load initial data locally as fallback
                this.ensureBaseData();
                logger.info('📦 Initial data loaded as fallback');
            }
            
            // Try to sync with API (non-blocking)
            this.backgroundSync();
            
        } catch (error) {
            logger.error('❌ API sync error:', error);
            throw error;
        }
    }
    
    // Background sync with API
    async backgroundSync() {
        try {
            // This runs in background and doesn't block initialization
            setTimeout(async () => {
                try {
                    const [users, customers, products, orders] = await Promise.allSettled([
                        apiService.getUsers(),
                        apiService.getCustomers(),
                        apiService.getProducts(),
                        apiService.getOrders()
                    ]);
                    
                    // Update local cache with API data
                    if (users.status === 'fulfilled' && users.value.success) {
                        await storage.set('users', users.value.users || []);
                        logger.debug('📥 Users synced from API');
                    }
                    
                    if (customers.status === 'fulfilled' && customers.value.success) {
                        await storage.set('customers', customers.value.customers || []);
                        logger.debug('📥 Customers synced from API');
                    }
                    
                    if (products.status === 'fulfilled' && products.value.success) {
                        await storage.set('products', products.value.products || []);
                        logger.debug('📥 Products synced from API');
                    }
                    
                    if (orders.status === 'fulfilled' && orders.value.success) {
                        await storage.set('orders', orders.value.orders || []);
                        logger.debug('📥 Orders synced from API');
                    }
                    
                    logger.info('✅ Background sync completed');
                } catch (syncError) {
                    logger.warn('⚠️ Background sync failed:', syncError.message);
                }
            }, 1000); // 1 second delay
        } catch (error) {
            logger.error('❌ Background sync setup error:', error);
        }
    }

    // Temel verilerin varlığını kontrol et
    ensureBaseData() {
        // Temel verilerin varlığını kontrol et ve eksikleri tamamla

        // KULLANICI YÜKLEME - FORCE APPROACH
        const existingUsers = storage.get('users');
        const isProduction = import.meta.env.PROD || import.meta.env.VITE_APP_ENVIRONMENT === 'production';
        
        logger.info('🔍 FORCE USER LOADING - Existing users check:', { 
            existingUsers: existingUsers?.length || 0, 
            hasUsers: !!existingUsers,
            isProduction 
        });
        
        // Raw localStorage kontrolü
        const rawUsers = localStorage.getItem('kirilmazlar_users');
        logger.info('🔍 Raw localStorage users:', rawUsers ? 'EXISTS' : 'NULL');
        
        // FORCE: Her durumda kullanıcıları yükle ve kontrol et
        logger.info('🚀 FORCE LOADING ALL_USERS:', ALL_USERS.length);
        
        // Önce mevcut kullanıcıları logla
        if (existingUsers && existingUsers.length > 0) {
            logger.info('📋 Mevcut kullanıcılar:', existingUsers.map(u => `${u.username}:${u.password}`));
        }
        
        // ALL_USERS'ı logla
        logger.info('📋 ALL_USERS içeriği:', ALL_USERS.map(u => `${u.username}:${u.password}`));
        
        // FORCE: Kullanıcıları her zaman yükle
        storage.set('users', ALL_USERS);
        logger.info('✅ FORCE: Kullanıcılar yüklendi:', ALL_USERS.length);
        
        // Verify storage after setting
        const verifyUsers = storage.get('users');
        logger.info('✅ VERIFICATION - users in storage:', verifyUsers?.length || 0);
        
        // Kullanıcı detaylarını logla
        if (verifyUsers && verifyUsers.length > 0) {
            logger.info('🔐 VERIFIED Users loaded:', verifyUsers.map(u => `${u.username}:${u.password}`));
            
            // Özel kullanıcıları kontrol et
            const unerbul = verifyUsers.find(u => u.username === 'unerbul');
            const bulent = verifyUsers.find(u => u.username === 'bulent');
            const neset = verifyUsers.find(u => u.username === 'neset');
            
            logger.info('👤 Unerbul user:', unerbul ? `${unerbul.username}:${unerbul.password}` : 'NOT FOUND');
            logger.info('👤 Bulent user:', bulent ? `${bulent.username}:${bulent.password}` : 'NOT FOUND');
            logger.info('👤 Neset user:', neset ? `${neset.username}:${neset.password}` : 'NOT FOUND');
        } else {
            logger.error('❌ VERIFICATION FAILED - No users in storage after force loading!');
        }

        // Müşteriler - Demo müşteri verilerini yükle
        const existingCustomers = storage.get('customers');
        if (!existingCustomers || existingCustomers.length === 0) {
            storage.set('customers', DEMO_CUSTOMERS);
            logger.info('👤 Demo müşteri verileri yüklendi:', DEMO_CUSTOMERS.length);
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

        // Siparişler - Demo sipariş verilerini yükle
        const existingOrders = storage.get('orders');
        const existingCustomerOrders = storage.get('customer_orders');
        
        if (!existingOrders || existingOrders.length === 0) {
            storage.set('orders', []);
            logger.info('📋 Seller Orders storage başlatıldı');
        }
        
        if (!existingCustomerOrders || existingCustomerOrders.length === 0) {
            storage.set('customer_orders', DEMO_ORDERS);
            logger.info('📦 Demo sipariş verileri yüklendi:', DEMO_ORDERS.length);
            
            // Her müşteri için sipariş sayısını logla
            const customerOrderCounts = {};
            DEMO_ORDERS.forEach(order => {
                const customerId = order.customerId;
                customerOrderCounts[customerId] = (customerOrderCounts[customerId] || 0) + 1;
            });
            logger.info('👤 Müşteri sipariş sayıları:', customerOrderCounts);
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
