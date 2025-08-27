// Production Authentication Service - API Based
import storage from '@core/storage';
import logger from '@utils/productionLogger';
import { TEST_BUSINESS } from '../data/testUsers.js';
import sessionManagementService from './sessionManagementService.js';
import APIService from './apiService.js';
import AuthUtils from '../utils/auth.js';

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
        'kirilmazlar_session_activity',
        'rememberMe',
        'sessionExpiry',
        'auth_token',
        'kirilmazlar_auth_token'
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
  async login(emailOrUsername, password, rememberMe = false) {
    try {
      const isProduction = import.meta.env.PROD || import.meta.env.VITE_APP_ENVIRONMENT === 'production';

      logger.debug('🔐 Login attempt started:', {
        emailOrUsername,
        rememberMe,
        environment: isProduction ? 'PRODUCTION' : 'DEVELOPMENT'
      });

      // Use API authentication in production, fallback to localStorage in development
      if (isProduction || import.meta.env.VITE_USE_API === 'true') {
        logger.debug('🌐 Using API authentication...');
        return await this._loginWithAPI(emailOrUsername, password, rememberMe);
      } else {
        logger.debug('💾 Using localStorage authentication (development mode)...');
        return await this._loginWithLocalStorage(emailOrUsername, password, rememberMe);
      }
    } catch (error) {
      logger.error('❌ Login error:', error);
      await this.clearAuthStorage();
      return {
        success: false,
        error: error.message
      };
    }
  }

  // API-based login
  async _loginWithAPI(emailOrUsername, password, rememberMe = false) {
    try {
      const response = await APIService.login(emailOrUsername, password, rememberMe);

      if (response.success && response.user) {
        // Set current user and auth state
        this.currentUser = response.user;
        await storage.set('currentUser', response.user);
        await storage.set('isAuthenticated', true);

        // Set session expiry based on remember me
        if (rememberMe) {
          const rememberExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
          await storage.set('rememberMe', true);
          await storage.set('sessionExpiry', rememberExpiry);
        } else {
          const standardExpiry = Date.now() + (24 * 60 * 60 * 1000);
          await storage.set('rememberMe', false);
          await storage.set('sessionExpiry', standardExpiry);
        }

        // Initialize session
        if (this.sessionManager) {
          await this.sessionManager.initializeSession(response.user.id);
        }

        logger.info('✅ API login successful:', { userId: response.user.id, rememberMe });

        return {
          success: true,
          user: response.user
        };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      logger.error('❌ API login error:', error);
      throw error;
    }
  }

  // LocalStorage-based login (development fallback)
  async _loginWithLocalStorage(emailOrUsername, password, rememberMe = false) {
    try {

      // Storage'dan kullanıcıları al
      let users = storage.get('users', []);

      // Eğer storage'dan kullanıcı gelmiyorsa, direkt localStorage'dan dene
      if (!users || users.length === 0) {
        const rawUsers = localStorage.getItem('kirilmazlar_users');
        if (rawUsers) {
          try {
            users = JSON.parse(rawUsers);
            logger.debug('✅ localStorage\'dan kullanıcılar alındı:', users.length);
          } catch (parseError) {
            logger.error('❌ localStorage parse hatası:', parseError);
            users = [];
          }
        }
      }

      logger.debug('🔐 Users found:', users.length);

      // Find user by email or username
      const user = users.find(u =>
        u.email === emailOrUsername || u.username === emailOrUsername
      );

      if (!user) {
        logger.warn('❌ User not found:', emailOrUsername);
        throw new Error('Invalid email/username or password');
      }

      // Verify password using secure hash comparison
      const isPasswordValid = AuthUtils.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        logger.warn('❌ Invalid password for user:', emailOrUsername);
        throw new Error('Invalid email/username or password');
      }

      if (!user.isActive) {
        throw new Error('Account is not active');
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

      // Generate secure JWT token for API authentication
      const tokenPayload = {
        userId: userWithoutPassword.id,
        username: userWithoutPassword.username,
        email: userWithoutPassword.email,
        role: userWithoutPassword.role,
        name: userWithoutPassword.name
      };

      // Create secure JWT token
      const token = AuthUtils.createSessionToken(tokenPayload);
      const refreshToken = AuthUtils.createRefreshToken(tokenPayload);

      // Set token in API service
      APIService.setToken(token);
      logger.debug('🔑 API token set for authentication');

      // Set current user and auth state with remember me logic
      this.currentUser = userWithoutPassword;
      await storage.set('currentUser', userWithoutPassword);
      await storage.set('isAuthenticated', true);
      await storage.set('auth_token', token);
      await storage.set('refresh_token', refreshToken);

      // Remember me functionality
      if (rememberMe) {
        // Set longer session duration (30 days)
        const rememberExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
        await storage.set('rememberMe', true);
        await storage.set('sessionExpiry', rememberExpiry);
        logger.debug('🔐 Remember me enabled - session extended to 30 days');
      } else {
        // Standard session duration (24 hours)
        const standardExpiry = Date.now() + (24 * 60 * 60 * 1000);
        await storage.set('rememberMe', false);
        await storage.set('sessionExpiry', standardExpiry);
        logger.debug('🔐 Standard session - 24 hours');
      }

      logger.debug('✅ LocalStorage login successful:', { userId: userWithoutPassword.id, rememberMe });

      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      logger.error('❌ LocalStorage login error:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      // Use API logout in production
      const isProduction = import.meta.env.PROD || import.meta.env.VITE_APP_ENVIRONMENT === 'production';

      if (isProduction || import.meta.env.VITE_USE_API === 'true') {
        try {
          await APIService.logout();
          logger.debug('🌐 API logout successful');
        } catch (error) {
          logger.warn('⚠️ API logout failed, continuing with local cleanup:', error);
        }
      }

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
        // Check session expiry even for memory user
        if (!this.isSessionValid()) {
          this.clearAuthStorage();
          return null;
        }
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

      // Check custom session expiry
      if (!this.isSessionValid()) {
        this.clearAuthStorage();
        return null;
      }

      if (savedUser && isAuthenticated) {
        this.currentUser = savedUser;

        // Restore API token if available
        const savedToken = storage.get('auth_token');
        if (savedToken) {
          APIService.setToken(savedToken);
          logger.debug('🔑 API token restored from storage');
        }

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
        this.isSessionValid() &&
        (!this.sessionManager || this.sessionManager.isSessionValid());
    } catch (error) {
      logger.error('❌ Auth check error:', error);
      return false;
    }
  }

  // Check if session is still valid
  isSessionValid() {
    try {
      // Local session validation
      const sessionExpiry = storage.get('sessionExpiry');
      if (!sessionExpiry) {
        return true; // No expiry set, assume valid
      }

      const isValid = Date.now() < sessionExpiry;
      if (!isValid) {
        logger.debug('🔐 Session expired');
      }
      return isValid;
    } catch (error) {
      logger.error('❌ Session validation error:', error);
      return false;
    }
  }

  // Get current authentication token
  getToken() {
    try {
      const token = storage.get('auth_token');

      // Validate token before returning
      if (token && AuthUtils.isTokenValid(token)) {
        return token;
      }

      // Try to refresh token if main token is invalid
      return this._refreshTokenIfNeeded();
    } catch (error) {
      logger.error('❌ Get token error:', error);
      return null;
    }
  }

  // Refresh token if needed
  async _refreshTokenIfNeeded() {
    try {
      const refreshToken = storage.get('refresh_token');

      if (!refreshToken || !AuthUtils.isTokenValid(refreshToken)) {
        logger.warn('🔄 Refresh token invalid, logout required');
        await this.logout();
        return null;
      }

      // Get user info from refresh token
      const userInfo = AuthUtils.getUserFromToken(refreshToken);
      if (!userInfo) {
        await this.logout();
        return null;
      }

      // Create new tokens
      const newToken = AuthUtils.createSessionToken(userInfo);
      const newRefreshToken = AuthUtils.createRefreshToken(userInfo);

      // Save new tokens
      await storage.set('auth_token', newToken);
      await storage.set('refresh_token', newRefreshToken);

      // Update API service token
      APIService.setToken(newToken);

      logger.info('🔄 Token refreshed successfully');
      return newToken;
    } catch (error) {
      logger.error('❌ Token refresh error:', error);
      await this.logout();
      return null;
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

      // Import FormValidationService for validation
      const { FormValidationService } = await import('./securityService.js');

      // Comprehensive validation
      const validationData = {
        name: additionalData.name || '',
        email,
        password,
        phone: additionalData.phone || ''
      };

      const validation = FormValidationService.validateUserRegistration(validationData);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors).join(', ');
        throw new Error(errorMessage);
      }

      const users = await storage.get('users', []);

      // Email kontrolü
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        throw new Error('Bu email adresi zaten kullanılıyor');
      }

      // Username kontrolü (eğer verilmişse)
      if (additionalData.username) {
        const existingUsername = users.find(u => u.username === additionalData.username);
        if (existingUsername) {
          throw new Error('Bu kullanıcı adı zaten kullanılıyor');
        }
      }

      // Hash password securely
      const hashedPassword = AuthUtils.hashPassword(password);

      // Yeni kullanıcı oluştur
      const newUser = {
        id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        email,
        password: hashedPassword, // Secure password hash
        username: additionalData.username || email.split('@')[0],
        name: additionalData.name || '',
        phone: additionalData.phone || '',
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
