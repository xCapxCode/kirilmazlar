/**
 * Test Data Initialization
 * Development ortamında localStorage'a test kullanıcılarını yükler
 */

import { TEST_USERS } from '../data/testUsers.js';
import storage from '@core/storage';
import logger from './productionLogger.js';

/**
 * Test kullanıcılarını localStorage'a yükle
 */
export const initializeTestUsers = () => {
  try {
    // Mevcut kullanıcıları kontrol et
    const existingUsers = storage.get('users', []);
    
    if (existingUsers.length === 0) {
      // Test kullanıcılarını localStorage'a kaydet
      storage.set('users', TEST_USERS);
      storage.set('kirilmazlar_users', JSON.stringify(TEST_USERS));
      
      logger.info('✅ Test kullanıcıları localStorage\'a yüklendi:', TEST_USERS.length);
      console.log('🔐 Test Kullanıcıları:');
      console.log('👤 Admin: admin@kirilmazlar.com / admin123');
      console.log('👤 Test: test@example.com / admin123');
    } else {
      logger.debug('ℹ️ Kullanıcılar zaten mevcut:', existingUsers.length);
    }
  } catch (error) {
    logger.error('❌ Test kullanıcıları yüklenirken hata:', error);
  }
};

/**
 * Tüm test verilerini initialize et
 */
export const initializeAllTestData = () => {
  try {
    initializeTestUsers();
    logger.info('✅ Tüm test verileri initialize edildi');
  } catch (error) {
    logger.error('❌ Test verileri initialize edilirken hata:', error);
  }
};

export default {
  initializeTestUsers,
  initializeAllTestData
};