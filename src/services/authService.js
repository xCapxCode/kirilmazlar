// Yerel Authentication Service
import storage from '@core/storage';
import logger from '@utils/productionLogger';
import { TEST_BUSINESS } from '../data/testUsers.js';
import customerUserMappingService from './customerUserMappingService.js';
import sessionManagementService from './sessionManagementService.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.sessionManager = sessionManagementService;
  }

  // Clear auth storage
  async clearAuthStorage() {
    try {
      // Clear session first
      if (this.sessionManager) {
        await this.sessionManager.terminateSession();
      }

      // Auth related storage items
      const authItems = [
        'currentUser',
        'isAuthenticated',
        'access_token',
        'refresh_token',
        'token_expiry',
        'auth_enhanced_metadata',
        'session_fingerprint',
        'token_blacklist',
        'kirilmazlar_active_session',
        'kirilmazlar_concurrent_sessions',
        'kirilmazlar_session_activity'
      ];

      // Clear all auth items
      authItems.forEach(item => storage.remove(item));

      // Reset current user
      this.currentUser = null;

      logger.info('🧹 Auth storage cleared successfully');
    } catch (error) {
      logger.error('❌ Error clearing auth storage:', error);
    }
  }

  // Login
  async login(emailOrUsername, password) {
    try {
      logger.debug('🔐 Login attempt started:', { emailOrUsername });

      // Storage'ı direkt kullan - DataService dependency'si yok
      logger.debug('🔐 Getting users from storage...');
      const users = storage.get('users', []);
      logger.debug('🔐 Users found:', users.length);

      // Find user by email or username
      const user = users.find(u =>
        (u.email === emailOrUsername || u.username === emailOrUsername) &&
        u.password === password
      );

      if (!user) {
        throw new Error('Invalid email/username or password');
      }

      if (!user.isActive) {
        throw new Error('Account is not active');
      }

      // Check and repair mappings
      const needsRepair = await customerUserMappingService.isRepairNeeded();
      if (needsRepair) {
        logger.debug('🔧 Repairing customer-user mappings...');
        await customerUserMappingService.repairAllMappings();
      }

      // Get full user profile
      let fullUserProfile = { ...user };

      // If customer role, get detailed info
      if (user.role === 'customer') {
        const customerDetail = await this._findCustomerForUser(user, await storage.get('customers', []));
        if (customerDetail) {
          // If found customer details but no customerId, repair mapping
          if (!user.customerId) {
            await this._repairCustomerIdMapping(user, customerDetail);
          }
          // Merge customer data
          fullUserProfile = await this._mergeCustomerUserData(user, customerDetail);
        }
      }

      // Remove password from response
      // eslint-disable-next-line no-unused-vars
      const { password: _, ...userWithoutPassword } = fullUserProfile;

      // Initialize session
      if (this.sessionManager) {
        await this.sessionManager.initializeSession(userWithoutPassword.id);
      }

      // Set current user and auth state
      this.currentUser = userWithoutPassword;
      await storage.set('currentUser', userWithoutPassword);
      await storage.set('isAuthenticated', true);

      logger.debug('✅ Login successful:', { userId: userWithoutPassword.id });

      return {
        success: true,
        user: userWithoutPassword
      };

    } catch (error) {
      logger.error('❌ Login error:', error);
      await this.clearAuthStorage(); // Clear on error
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Logout
  async logout() {
    try {
      await this.clearAuthStorage();
      logger.info('👋 Logout successful');
      return { success: true };
    } catch (error) {
      logger.error('❌ Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  getCurrentUser() {
    try {
      // Memory user
      if (this.currentUser) {
        return this.currentUser;
      }

      // Storage user
      const savedUser = storage.get('currentUser');
      const isAuthenticated = storage.get('isAuthenticated', false);

      // Session validation
      if (this.sessionManager && !this.sessionManager.isSessionValid()) {
        this.clearAuthStorage();
        return null;
      }

      if (savedUser && isAuthenticated) {
        this.currentUser = savedUser;
        return savedUser;
      }

      return null;
    } catch (error) {
      logger.error('❌ Get current user error:', error);
      return null;
    }
  }

  // Check authentication status
  isAuthenticated() {
    try {
      return storage.get('isAuthenticated', false) &&
        this.getCurrentUser() !== null &&
        (!this.sessionManager || this.sessionManager.isSessionValid());
    } catch (error) {
      logger.error('❌ Auth check error:', error);
      return false;
    }
  }

  // Check role
  hasRole(role) {
    try {
      const user = this.getCurrentUser();
      return user && user.role === role;
    } catch (error) {
      logger.error('❌ Role check error:', error);
      return false;
    }
  }

  // Find customer details for user
  async _findCustomerForUser(user, customers) {
    // First try by customerId
    if (user.customerId) {
      const customerById = customers.find(c => c.id === user.customerId);
      if (customerById) return customerById;
    }

    // Then try by email/username
    return customers.find(c =>
      c.email === user.email || c.username === user.username
    );
  }

  // Repair customer ID mapping
  async _repairCustomerIdMapping(user, customerDetail) {
    try {
      const users = await storage.get('users', []);
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].customerId = customerDetail.id;
        await storage.set('users', users);
        logger.debug('✅ Customer ID mapping repaired');
      }
    } catch (error) {
      logger.error('❌ Customer ID mapping repair failed:', error);
    }
  }

  // Merge customer and user data
  async _mergeCustomerUserData(user, customerDetail) {
    return {
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
  }

  // Get business info
  getBusinessInfo() {
    try {
      const business = storage.get('business');
      if (!business) {
        logger.warn('⚠️ Business info not found in storage, using default');
        return TEST_BUSINESS;
      }
      return business;
    } catch (error) {
      logger.error('❌ Get business info error:', error);
      return TEST_BUSINESS;
    }
  }

  // Update business info
  async updateBusinessInfo(updates) {
    try {
      const currentBusiness = this.getBusinessInfo();
      const updatedBusiness = { ...currentBusiness, ...updates };
      await storage.set('business', updatedBusiness);
      return { success: true, data: updatedBusiness };
    } catch (error) {
      logger.error('❌ Update business info error:', error);
      return { success: false, error: error.message };
    }
  }

  // KULLANICI KAYIT İŞLEMİ
  async signUp(email, password, additionalData = {}) {
    try {
      logger.info('👤 Yeni kullanıcı kaydı başlatılıyor:', { email });

      const users = await storage.get('users', []);

      // Email kontrolü
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        throw new Error('Bu email adresi zaten kullanılıyor');
      }

      // Yeni kullanıcı oluştur
      const newUser = {
        id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        email,
        password, // Production'da hash'lenecek
        username: additionalData.username || email.split('@')[0],
        name: additionalData.name || '',
        role: additionalData.role || 'customer',
        isActive: true,
        createdAt: new Date().toISOString(),
        registeredAt: new Date().toISOString()
      };

      // Kullanıcıyı ekle
      users.push(newUser);
      await storage.set('users', users);

      logger.info('✅ Yeni kullanıcı başarıyla kaydedildi:', {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
      });

      // Password'u response'dan çıkar
      // eslint-disable-next-line no-unused-vars
      const { password: _, ...userWithoutPassword } = newUser;

      return {
        success: true,
        user: userWithoutPassword,
        message: 'Kullanıcı başarıyla oluşturuldu'
      };

    } catch (error) {
      logger.error('❌ Sign up error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // KULLANICI PROFİL GÜNCELLEME
  async updateUserProfile(userId, updates) {
    try {
      logger.info('👤 Kullanıcı profili güncelleniyor:', { userId, updates });

      const users = await storage.get('users', []);
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        throw new Error('Kullanıcı bulunamadı');
      }

      // Güncelleme
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Storage'a kaydet
      await storage.set('users', users);

      // Current user storage'ını da güncelle
      await storage.set('currentUser', users[userIndex]);

      logger.info('✅ Kullanıcı profili başarıyla güncellendi:', {
        id: users[userIndex].id,
        email: users[userIndex].email,
        name: users[userIndex].name
      });

      return {
        success: true,
        data: users[userIndex],
        message: 'Profil başarıyla güncellendi'
      };

    } catch (error) {
      logger.error('❌ Update profile error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new AuthService();
