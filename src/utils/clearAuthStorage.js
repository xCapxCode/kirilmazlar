/**
 * Storage temizleme yardımcı scripti
 * Tüm oturum ve auth verilerini temizler
 */
export const clearAuthStorage = () => {
  if (typeof window === 'undefined') return;

  // Auth related items
  const authItems = [
    'currentUser',
    'isAuthenticated',
    'access_token',
    'refresh_token',
    'token_expiry',
    'auth_enhanced_metadata',
    'session_fingerprint',
    'token_blacklist',
    'csrf_session_id',
    'csrf_tokens',
    'csrf_double_submit',
    'kirilmazlar_active_session',
    'kirilmazlar_concurrent_sessions',
    'kirilmazlar_session_activity'
  ];

  // Clear all auth items
  authItems.forEach(item => {
    try {
      localStorage.removeItem(item);
      sessionStorage.removeItem(item);
    } catch (e) {
      // Silently handle storage errors
    }
  });

  // Clear timers
  try {
    const highestTimeoutId = setTimeout(';');
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }

    const highestIntervalId = setInterval(';');
    for (let i = 0; i < highestIntervalId; i++) {
      clearInterval(i);
    }
  } catch (e) {
    // Silently handle timer errors
  }

  // Clear BroadcastChannel if exists
  try {
    if (window.authChannel) {
      window.authChannel.close();
      window.authChannel = null;
    }
  } catch (e) {
    // Silently handle channel errors
  }
};

export default clearAuthStorage;
