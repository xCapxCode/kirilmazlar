// Yerel Authentication Service
import storage from '@core/storage';
import logger from '@utils/productionLogger';
import { TEST_BUSINESS } from '../data/testUsers.js';
import customerUserMappingService from './customerUserMappingService.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    // DataService veri başlatmayı hallediyor, burada sadece auth işlemleri
  }

  // Giriş yap
  async login(emailOrUsername, password) {
    try {
      logger.debug('🔐 Login denemesi:', { emailOrUsername, password });
      const users = await storage.get('users', []);
      logger.debug('👥 Mevcut kullanıcılar:', users);

      // Email veya username ile giriş desteği
      const user = users.find(u =>
        (u.email === emailOrUsername || u.username === emailOrUsername) &&
        u.password === password
      );

      logger.debug('🔍 Bulunan kullanıcı:', user);

      if (!user) {
        logger.debug('❌ Kullanıcı bulunamadı');
        throw new Error('Geçersiz kullanıcı adı/email veya şifre');
      }

      if (!user.isActive) {
        throw new Error('Hesabınız aktif değil');
      }

      // P1.2.2 FIX: Auto-repair mapping issues on login
      const needsRepair = await customerUserMappingService.isRepairNeeded();
      if (needsRepair) {
        logger.debug('🔧 P1.2.2: Auto-repairing customer-user mappings...');
        await customerUserMappingService.repairAllMappings();
      }

      // Eğer customer rolü ise, customers tablosundan detaylı bilgileri al
      let fullUserProfile = { ...user };

      if (user.role === 'customer') {
        logger.debug('👤 Customer rolü tespit edildi, detaylı bilgiler getiriliyor...');
        const customers = await storage.get('customers', []);

        // customerId ile arama, yoksa email/username ile arama
        let customerDetail = null;
        if (user.customerId) {
          customerDetail = customers.find(c => c.id === user.customerId);
        }

        // customerId ile bulunamadıysa email ile ara
        if (!customerDetail) {
          customerDetail = customers.find(c =>
            c.email === user.email || c.username === user.username
          );

          // Eğer email ile bulunduysa customerId'yi güncelle
          if (customerDetail && !user.customerId) {
            logger.debug('� customerId eksik, güncelleniyor...');
            const users = await storage.get('users', []);
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
              users[userIndex].customerId = customerDetail.id;
              await storage.set('users', users);
            }
          }
        }

        if (customerDetail) {
          logger.debug('�📋 Customer detayları bulundu:', customerDetail);
          // Customer tablosundaki detaylı bilgileri user profile'a ekle
          fullUserProfile = {
            ...user,
            name: customerDetail.name || user.name,
            phone: customerDetail.phone || user.phone,
            address: customerDetail.address,
            city: customerDetail.city,
            district: customerDetail.district,
            postalCode: customerDetail.postalCode,
            companyName: customerDetail.companyName,
            companyTitle: customerDetail.companyTitle,
            accountType: customerDetail.accountType,
            registeredAt: customerDetail.registeredAt || customerDetail.createdAt,
            customerId: customerDetail.id
          };
          logger.debug('✅ Birleştirilmiş kullanıcı profili:', fullUserProfile);
        } else {
          logger.debug('⚠️ Customer detayları bulunamadı - email:', user.email, 'username:', user.username);
        }
      }

      // Şifreyi response'dan çıkar
      const { password: userPassword, ...userWithoutPassword } = fullUserProfile;

      this.currentUser = userWithoutPassword;
      await storage.set('currentUser', userWithoutPassword);
      await storage.set('isAuthenticated', true);

      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      logger.error('❌ Login hatası:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Çıkış yap
  async logout() {
    this.currentUser = null;
    storage.remove('currentUser');
    storage.set('isAuthenticated', false);
    return { success: true };
  }

  // Mevcut kullanıcıyı getir
  getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }

    const savedUser = storage.get('currentUser');
    const isAuthenticated = storage.get('isAuthenticated', false);

    if (savedUser && isAuthenticated) {
      this.currentUser = savedUser;
      return savedUser;
    }

    return null;
  }

  // Kimlik doğrulama durumunu kontrol et
  isAuthenticated() {
    return storage.get('isAuthenticated', false) && this.getCurrentUser() !== null;
  }

  // Kullanıcı rolünü kontrol et
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  // Kullanıcı kaydı (şimdilik basit implementasyon)
  async signUp(email, password, additionalData = {}) {
    try {
      const users = storage.get('users', []);

      // Email kontrolü
      if (users.find(u => u.email === email)) {
        throw new Error('Bu email adresi zaten kullanılıyor');
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password,
        name: additionalData.name || 'Yeni Kullanıcı',
        role: additionalData.role || 'customer',
        createdAt: new Date().toISOString(),
        isActive: true,
        ...additionalData
      };

      users.push(newUser);
      storage.set('users', users);

      return { success: true, data: { user: newUser } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Kullanıcı profili güncelleme
  async updateUserProfile(userId, updates) {
    try {
      const users = storage.get('users', []);
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        throw new Error('Kullanıcı bulunamadı');
      }

      users[userIndex] = { ...users[userIndex], ...updates };
      storage.set('users', users);

      // Mevcut kullanıcı güncellenmişse currentUser'ı da güncelle
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = { ...this.currentUser, ...updates };
        storage.set('currentUser', this.currentUser);
      }

      return { success: true, data: users[userIndex] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Şifre sıfırlama (şimdilik basit implementasyon)
  async resetPassword(email) {
    try {
      const users = storage.get('users', []);
      const user = users.find(u => u.email === email);

      if (!user) {
        throw new Error('Bu email adresi ile kayıtlı kullanıcı bulunamadı');
      }

      // Gerçek uygulamada email gönderilir, şimdilik sadece success döndürüyoruz
      return {
        success: true,
        message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // İşletme bilgilerini getir
  getBusinessInfo() {
    return storage.get('business', TEST_BUSINESS);
  }

  // İşletme bilgilerini güncelle
  updateBusinessInfo(updates) {
    try {
      const currentBusiness = this.getBusinessInfo();
      const updatedBusiness = { ...currentBusiness, ...updates };
      storage.set('business', updatedBusiness);
      return { success: true, data: updatedBusiness };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // P1.2.1 FIX: Helper methods for robust customer-user matching

  /**
   * Robust customer finding algorithm with multiple fallback strategies
   */
  async _findCustomerForUser(user, customers) {
    logger.debug('🔍 P1.2.1: Robust customer search for user:', user.email);

    let customerDetail = null;

    // Strategy 1: Direct customerId mapping
    if (user.customerId) {
      customerDetail = customers.find(c => c.id === user.customerId);
      if (customerDetail) {
        logger.debug('✅ Found via customerId:', user.customerId);
        return customerDetail;
      } else {
        logger.debug('⚠️ CustomerId mismatch detected:', user.customerId);
      }
    }

    // Strategy 2: Exact email match
    customerDetail = customers.find(c => c.email === user.email);
    if (customerDetail) {
      logger.debug('✅ Found via email match:', user.email);
      return customerDetail;
    }

    // Strategy 3: Username match
    if (user.username) {
      customerDetail = customers.find(c => c.username === user.username);
      if (customerDetail) {
        logger.debug('✅ Found via username match:', user.username);
        return customerDetail;
      }
    }

    // Strategy 4: Name-based fuzzy matching (fallback)
    if (user.name) {
      customerDetail = customers.find(c =>
        c.name && c.name.toLowerCase().trim() === user.name.toLowerCase().trim()
      );
      if (customerDetail) {
        logger.debug('✅ Found via name match:', user.name);
        return customerDetail;
      }
    }

    logger.debug('❌ No customer found for user:', user.email);
    return null;
  }

  /**
   * Auto-repair missing or incorrect customerId mapping
   */
  async _repairCustomerIdMapping(user, customerDetail) {
    logger.debug('🔧 P1.2.1: Repairing customerId mapping');

    try {
      const users = await storage.get('users', []);
      const userIndex = users.findIndex(u => u.id === user.id);

      if (userIndex !== -1) {
        users[userIndex].customerId = customerDetail.id;
        await storage.set('users', users);
        logger.debug('✅ CustomerId updated:', customerDetail.id);
      }
    } catch (error) {
      logger.error('❌ CustomerId repair failed:', error);
    }
  }

  /**
   * Enhanced data merging with consistency checks
   */
  async _mergeCustomerUserData(user, customerDetail) {
    logger.debug('🔄 P1.2.1: Enhanced data merging');

    // Priority: Customer data > User data > Defaults
    const mergedProfile = {
      ...user,
      // Core identity fields
      name: customerDetail.name || user.name || 'Unnamed Customer',
      email: user.email, // Always use user's email for consistency
      username: user.username || customerDetail.username,

      // Contact information with consistency checks
      phone: this._resolvePhoneNumber(customerDetail.phone, user.phone),

      // Address information (customer has priority)
      address: customerDetail.address || user.address || null,
      city: customerDetail.city || user.city || null,
      district: customerDetail.district || user.district || null,
      postalCode: customerDetail.postalCode || user.postalCode || null,

      // Business information
      companyName: customerDetail.companyName || user.companyName || null,
      companyTitle: customerDetail.companyTitle || user.companyTitle || null,
      accountType: customerDetail.accountType || user.accountType || 'personal',

      // Timestamps
      registeredAt: customerDetail.registeredAt || customerDetail.createdAt || user.createdAt,

      // Essential linking
      customerId: customerDetail.id,
      role: user.role
    };

    // P1.2.1: Data consistency logging
    this._logDataConsistency(user, customerDetail, mergedProfile);

    return mergedProfile;
  }

  /**
   * Phone number resolution with consistency checks
   */
  _resolvePhoneNumber(customerPhone, userPhone) {
    if (customerPhone && userPhone && customerPhone !== userPhone) {
      logger.debug('📞 Phone number inconsistency detected:', { customerPhone, userPhone });
      // Prefer customer data but log inconsistency
      return customerPhone;
    }

    return customerPhone || userPhone || null;
  }

  /**
   * Log data consistency issues for debugging
   */
  _logDataConsistency(user, customerDetail, mergedProfile) {
    const inconsistencies = [];

    if (user.phone !== customerDetail.phone && user.phone && customerDetail.phone) {
      inconsistencies.push(`Phone: User(${user.phone}) vs Customer(${customerDetail.phone})`);
    }

    if (user.name !== customerDetail.name && user.name && customerDetail.name) {
      inconsistencies.push(`Name: User(${user.name}) vs Customer(${customerDetail.name})`);
    }

    if (inconsistencies.length > 0) {
      logger.debug('⚠️ P1.2.1: Data inconsistencies detected:', inconsistencies);
    } else {
      logger.debug('✅ P1.2.1: Data consistency verified');
    }
  }

  /**
   * Fallback profile creation for users without customer details
   */
  _createFallbackProfile(user) {
    logger.debug('🆘 P1.2.1: Creating fallback profile');

    return {
      ...user,
      name: user.name || 'Customer',
      phone: user.phone || null,
      address: user.address || null,
      city: user.city || null,
      accountType: 'personal',
      customerId: null, // Will be created later if needed
      _isFallbackProfile: true // Flag for debugging
    };
  }
}

export default new AuthService();
