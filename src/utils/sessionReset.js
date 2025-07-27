/**
 * Session Reset Utility
 * Sonsuz döngüyü durdurmak ve session'ları temizlemek için
 */

import logger from '@utils/productionLogger';

// Global timer'ları temizle
if (window.sessionManagementService) {
  try {
    window.sessionManagementService.cleanup();
  } catch (e) {
    // Session cleanup error silently handled
  }
}

// Storage event listener'larını temizle
if (window.storageHealthMonitor) {
  try {
    window.storageHealthMonitor.stop();
  } catch (e) {
    // Storage monitor cleanup error silently handled
  }
}

// Tüm session related storage'ı temizle
try {
  localStorage.removeItem('kirilmazlar_active_session');
  localStorage.removeItem('kirilmazlar_concurrent_sessions');
  localStorage.removeItem('kirilmazlar_session_activity');
  // Session storage cleared
} catch (e) {
  // Storage clear error silently handled
}

// Tüm timer'ları temizle
const highestTimeoutId = setTimeout(';');
for (let i = 0; i < highestTimeoutId; i++) {
  clearTimeout(i);
}

const highestIntervalId = setInterval(';');
for (let i = 0; i < highestIntervalId; i++) {
  clearInterval(i);
}

// All timers cleared

// Manuel session reset function - SADECE İHTİYAÇ HALİNDE KULLAN
window.resetSession = () => {
  logger.info('Manuel session reset başlatılıyor...');
  window.location.reload();
};

// OTOMATIK RELOAD DEVREDİŞI - infinite loop'u önlemek için
// setTimeout(() => {
//   window.location.reload();
// }, 1000);
