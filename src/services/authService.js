// Yerel Authentication Service
import { TEST_BUSINESS } from '../data/testUsers.js';
import storage from '@core/storage';
import logger from '../utils/logger.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    // DataService veri başlatmayı hallediyor, burada sadece auth işlemleri
  }

  // Giriş yap
  async login(email, password) {
    try {
      const users = storage.get('users', []);
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Geçersiz email veya şifre');
      }

      if (!user.isActive) {
        throw new Error('Hesabınız aktif değil');
      }

      // Şifreyi response'dan çıkar
      const { password: _, ...userWithoutPassword } = user;
      
      this.currentUser = userWithoutPassword;
      storage.set('currentUser', userWithoutPassword);
      storage.set('isAuthenticated', true);

      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
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
}

export default new AuthService();
