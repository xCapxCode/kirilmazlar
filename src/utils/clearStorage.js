// Clear all authentication related storage
if (typeof window !== 'undefined') {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expiry');
  localStorage.removeItem('auth_enhanced_metadata');
  localStorage.removeItem('concurrent_sessions');
  localStorage.removeItem('active_session');
  localStorage.removeItem('csrf_session_id');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userSession');
  localStorage.removeItem('session_fingerprint');
  localStorage.removeItem('token_blacklist');
  localStorage.removeItem('kirilmazlar_active_session');
  localStorage.removeItem('kirilmazlar_concurrent_sessions');
  localStorage.removeItem('kirilmazlar_session_activity');

  // Clear all timers
  const highestTimeoutId = setTimeout(';');
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
  }
  const highestIntervalId = setInterval(';');
  for (let i = 0; i < highestIntervalId; i++) {
    clearInterval(i);
  }

  // Storage and timers cleared successfully
}
