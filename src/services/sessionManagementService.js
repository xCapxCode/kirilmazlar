/**
 * P1.3.1 & P1.3.2 & P1.3.3: Session timeout, concurrent session management and security monitoring
 * Oturum süresi yönetimi, eşzamanlı oturum tespiti ve güvenlik izleme servisi
 */

import storage from '@core/storage';
import securityMonitorService from './securityMonitorService';

class SessionManagementService {
  constructor() {
    this.debug = process.env.NODE_ENV === 'development';
    this.defaultTimeout = 30 * 60 * 1000; // 30 dakika
    this.warningTimeout = 5 * 60 * 1000; // 5 dakika önce uyar
    this.checkInterval = 60 * 1000; // Her dakika kontrol et
    this.sessionTimer = null;
    this.warningTimer = null;
    this.activityTimer = null;
    this.isActive = false;
    this.lastActivityTime = Date.now();
    this.sessionId = null;
    this.concurrentCheckInterval = 30 * 1000; // Her 30 saniyede concurrent session kontrolü
    this.concurrentTimer = null;

    // Do not auto-initialize session in constructor
    // Session will be initialized when user logs in
  }

  log(message, ...args) {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(message, ...args);
    }
  }

  warn(message, ...args) {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.warn(message, ...args);
    }
  }

  error(message, ...args) {
    // eslint-disable-next-line no-console
    console.error(message, ...args); // Always log errors
  }

  /**
   * Session'ı başlatır
   */
  async initializeSession(userId = null, sessionTimeout = null) {
    this.log('🚀 P1.3.1: Session Management başlatılıyor...');

    try {
      const timeout = sessionTimeout || this.defaultTimeout;
      this.sessionId = this.generateSessionId();

      const sessionData = {
        sessionId: this.sessionId,
        userId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        timeout,
        isActive: true,
        warningShown: false,
        tabId: this.generateTabId(),
        browserInfo: this.getBrowserInfo()
      };

      await storage.set('active_session', sessionData);
      this.lastActivityTime = Date.now();
      this.isActive = true;

      // P1.3.2: Register this session in concurrent sessions list
      await this.registerConcurrentSession(sessionData);

      // Activity tracking başlat - DISABLED TO PREVENT INFINITE LOOP
      // this.startActivityTracking();

      // Session timeout kontrolünü başlat - DISABLED TO PREVENT INFINITE LOOP  
      // this.startSessionMonitoring();

      // P1.3.3: Start security monitoring
      securityMonitorService.startMonitoring();
      securityMonitorService.onSecurityThreat(this.handleSecurityThreat.bind(this));

      // Listen for security-triggered session invalidations
      window.addEventListener('securitySessionInvalidation', this.handleSecurityInvalidation.bind(this));

      // P1.3.2: Concurrent session monitoring başlat - DISABLED TO PREVENT INFINITE LOOP
      // this.startConcurrentSessionMonitoring();

      this.log('✅ P1.3.1: Session initialized successfully');
      return sessionData;

    } catch (error) {
      this.error('❌ P1.3.1: Session initialization error:', error);
      throw error;
    }
  }

  /**
   * Activity tracking başlatır
   */
  startActivityTracking() {
    this.log('👤 Starting activity tracking...');

    // DOM event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Rate limiting for activity updates - prevent infinite loops
    let lastActivityUpdate = 0;
    const ACTIVITY_UPDATE_THROTTLE = 30000; // 30 seconds minimum between updates

    const activityHandler = () => {
      const now = Date.now();
      if (now - lastActivityUpdate > ACTIVITY_UPDATE_THROTTLE) {
        lastActivityUpdate = now;
        this.updateLastActivity();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    // Store event listeners for cleanup
    this.activityListeners = events.map(event => ({ event, handler: activityHandler }));
  }

  /**
   * P1.3.2: Unique session ID oluşturur
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * P1.3.2: Unique tab ID oluşturur
   */
  generateTabId() {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * P1.3.2: Browser bilgilerini toplar
   */
  getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      timestamp: Date.now()
    };
  }

  /**
   * P1.3.2: Concurrent session'ı kaydet
   */
  async registerConcurrentSession(sessionData) {
    this.log('📝 P1.3.2: Registering concurrent session...');

    try {
      const concurrentSessions = await storage.get('concurrent_sessions') || [];

      // Remove any existing sessions for this user (single session per user)
      const filteredSessions = concurrentSessions.filter(s =>
        s.userId !== sessionData.userId
      );

      // Add current session
      filteredSessions.push({
        sessionId: sessionData.sessionId,
        userId: sessionData.userId,
        tabId: sessionData.tabId,
        startTime: sessionData.startTime,
        lastActivity: sessionData.lastActivity,
        browserInfo: sessionData.browserInfo,
        isActive: true
      });

      await storage.set('concurrent_sessions', filteredSessions);
      this.log('✅ P1.3.2: Concurrent session registered');

    } catch (error) {
      this.error('❌ P1.3.2: Concurrent session registration error:', error);
    }
  }

  /**
   * P1.3.2: Concurrent session monitoring başlatır
   */
  startConcurrentSessionMonitoring() {
    this.log('🔍 P1.3.2: Starting concurrent session monitoring...');

    this.concurrentTimer = setInterval(() => {
      this.checkConcurrentSessions();
    }, this.concurrentCheckInterval);
  }

  /**
   * P1.3.2: Concurrent session'ları kontrol eder
   */
  async checkConcurrentSessions() {
    try {
      const sessionData = await storage.get('active_session');
      if (!sessionData || !sessionData.isActive) {
        return;
      }

      const concurrentSessions = await storage.get('concurrent_sessions') || [];
      const userSessions = concurrentSessions.filter(s =>
        s.userId === sessionData.userId && s.isActive
      );

      // Multiple sessions for same user detected
      if (userSessions.length > 1) {
        this.warn('🚨 P1.3.2: Multiple concurrent sessions detected!');

        // Find the newest session (this should be current)
        const newestSession = userSessions.reduce((newest, current) =>
          current.startTime > newest.startTime ? current : newest
        );

        // If current session is not the newest, terminate it
        if (newestSession.sessionId !== this.sessionId) {
          this.warn('⚠️ P1.3.2: Current session is not the newest, terminating...');
          await this.handleConcurrentSessionConflict(newestSession);
        }
      }

      // Clean up old inactive sessions
      await this.cleanupInactiveSessions();

    } catch (error) {
      this.error('❌ P1.3.2: Concurrent session check error:', error);
    }
  }

  /**
   * P1.3.2: Concurrent session conflict'ini handle eder
   */
  async handleConcurrentSessionConflict(newerSession) {
    this.warn('🚨 P1.3.2: Handling concurrent session conflict...');

    try {
      // Dispatch concurrent session detected event
      const conflictEvent = new CustomEvent('concurrentSessionDetected', {
        detail: {
          currentSessionId: this.sessionId,
          newerSessionId: newerSession.sessionId,
          newerSessionStart: newerSession.startTime,
          reason: 'multiple_sessions_same_user'
        }
      });
      window.dispatchEvent(conflictEvent);

      // Terminate current session
      await this.expireSession('concurrent_session_conflict');

    } catch (error) {
      this.error('❌ P1.3.2: Session conflict handling error:', error);
    }
  }

  /**
   * P1.3.2: Inactive session'ları temizler
   */
  async cleanupInactiveSessions() {
    try {
      const concurrentSessions = await storage.get('concurrent_sessions') || [];
      const now = Date.now();
      const sessionTimeout = this.defaultTimeout;

      const activeSessions = concurrentSessions.filter(s => {
        const timeSinceLastActivity = now - s.lastActivity;
        return timeSinceLastActivity < sessionTimeout;
      });

      if (activeSessions.length !== concurrentSessions.length) {
        await storage.set('concurrent_sessions', activeSessions);
        this.log(`🧹 P1.3.2: Cleaned up ${concurrentSessions.length - activeSessions.length} inactive sessions`);
      }

    } catch (error) {
      this.error('❌ P1.3.2: Session cleanup error:', error);
    }
  }

  /**
   * Son aktivite zamanını günceller
   */
  async updateLastActivity() {
    // COMPLETELY DISABLED TO PREVENT INFINITE LOOP
    // This function was causing storage events that triggered more storage events
    return;

    /* DISABLED CODE:
    // Rate limiting to prevent infinite loops
    const now = Date.now();
    if (this.lastUpdateTime && (now - this.lastUpdateTime) < 30000) {
      return; // Skip update if less than 30 seconds since last update
    }
    this.lastUpdateTime = now;

    this.lastActivityTime = Date.now();

    try {
      const sessionData = await storage.get('active_session');
      if (sessionData) {
        sessionData.lastActivity = this.lastActivityTime;
        sessionData.warningShown = false; // Reset warning flag
        await storage.set('active_session', sessionData);

        // P1.3.2: Update concurrent session activity too - DISABLED TO PREVENT INFINITE LOOP
        // await this.updateConcurrentSessionActivity();
      }
    } catch (error) {
      this.warn('Activity update warning:', error);
    }
    */
  }

  /**
   * P1.3.2: Concurrent session activity'sini günceller
   */
  async updateConcurrentSessionActivity() {
    // COMPLETELY DISABLED TO PREVENT INFINITE LOOP
    return;

    /* DISABLED CODE:
    try {
      const concurrentSessions = await storage.get('concurrent_sessions') || [];
      const updatedSessions = concurrentSessions.map(s => {
        if (s.sessionId === this.sessionId) {
          return { ...s, lastActivity: this.lastActivityTime };
        }
        return s;
      });

      await storage.set('concurrent_sessions', updatedSessions);

    } catch (error) {
      this.warn('Concurrent session activity update warning:', error);
    }
    */
  }

  /**
   * Session monitoring başlatır
   */
  startSessionMonitoring() {
    this.log('⏰ Starting session monitoring...');

    // Clear existing timers
    this.clearTimers();

    // Check session status every minute
    this.sessionTimer = setInterval(() => {
      this.checkSessionStatus();
    }, this.checkInterval);
  }

  /**
   * Session durumunu kontrol eder
   */
  async checkSessionStatus() {
    try {
      const sessionData = await storage.get('active_session');

      if (!sessionData || !sessionData.isActive) {
        this.log('No active session found');
        return;
      }

      const now = Date.now();
      const timeSinceLastActivity = now - sessionData.lastActivity;
      const timeUntilExpiry = sessionData.timeout - timeSinceLastActivity;

      // Session expired
      if (timeUntilExpiry <= 0) {
        this.warn('🚨 P1.3.1: Session expired!');
        await this.expireSession('timeout');
        return;
      }

      // Show warning if close to expiry
      if (timeUntilExpiry <= this.warningTimeout && !sessionData.warningShown) {
        this.showSessionWarning(Math.ceil(timeUntilExpiry / 60000)); // Minutes remaining
        sessionData.warningShown = true;
        await storage.set('active_session', sessionData);
      }

      this.log(`⏰ Session check: ${Math.ceil(timeUntilExpiry / 60000)} minutes remaining`);

    } catch (error) {
      this.error('❌ Session status check error:', error);
    }
  }

  /**
   * Session uyarısı gösterir
   */
  showSessionWarning(minutesRemaining) {
    this.warn(`⚠️ Session will expire in ${minutesRemaining} minutes!`);

    // Dispatch custom event for UI components
    const warningEvent = new CustomEvent('sessionWarning', {
      detail: {
        minutesRemaining,
        timestamp: Date.now(),
        canExtend: true
      }
    });
    window.dispatchEvent(warningEvent);
  }

  /**
   * Session'ı uzatır
   */
  async extendSession() {
    this.log('🔄 P1.3.1: Extending session...');

    try {
      const sessionData = await storage.get('active_session');

      if (!sessionData) {
        throw new Error('No active session to extend');
      }

      // Reset session timers
      sessionData.lastActivity = Date.now();
      sessionData.warningShown = false;

      await storage.set('active_session', sessionData);

      this.log('✅ Session extended successfully');

      // Dispatch extension event
      const extendEvent = new CustomEvent('sessionExtended', {
        detail: { timestamp: Date.now() }
      });
      window.dispatchEvent(extendEvent);

      return true;

    } catch (error) {
      this.error('❌ Session extension error:', error);
      return false;
    }
  }

  /**
   * Session'ı sonlandırır
   */
  async expireSession(reason = 'manual') {
    this.log(`🔚 P1.3.1: Expiring session (reason: ${reason})`);

    try {
      // P1.3.2: Remove from concurrent sessions
      await this.removeConcurrentSession();

      // Clear session data
      await storage.remove('active_session');

      // Clear timers
      this.clearTimers();

      // Clear activity listeners
      this.clearActivityListeners();

      this.isActive = false;
      this.sessionId = null;

      // Dispatch session expired event
      const expiredEvent = new CustomEvent('sessionExpired', {
        detail: {
          reason,
          timestamp: Date.now(),
          lastActivity: this.lastActivityTime
        }
      });
      window.dispatchEvent(expiredEvent);

      this.log('✅ Session expired successfully');
      return true;

    } catch (error) {
      this.error('❌ Session expiration error:', error);
      return false;
    }
  }

  /**
   * P1.3.2: Session'ı concurrent sessions listesinden kaldırır
   */
  async removeConcurrentSession() {
    try {
      const concurrentSessions = await storage.get('concurrent_sessions') || [];
      const filteredSessions = concurrentSessions.filter(s =>
        s.sessionId !== this.sessionId
      );

      await storage.set('concurrent_sessions', filteredSessions);
      this.log('✅ P1.3.2: Session removed from concurrent sessions');

    } catch (error) {
      this.error('❌ P1.3.2: Remove concurrent session error:', error);
    }
  }

  /**
   * Timer'ları temizler
   */
  clearTimers() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }

    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }

    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }

    // P1.3.2: Clear concurrent session timer
    if (this.concurrentTimer) {
      clearInterval(this.concurrentTimer);
      this.concurrentTimer = null;
    }
  }

  /**
   * Activity listener'ları temizler
   */
  clearActivityListeners() {
    if (this.activityListeners) {
      this.activityListeners.forEach(({ event, handler }) => {
        document.removeEventListener(event, handler, true);
      });
      this.activityListeners = null;
    }
  }

  /**
   * Session durumunu döndürür
   */
  async getSessionStatus() {
    try {
      const sessionData = await storage.get('active_session');

      if (!sessionData) {
        return { active: false, reason: 'no_session' };
      }

      const now = Date.now();
      const timeSinceLastActivity = now - sessionData.lastActivity;
      const timeUntilExpiry = sessionData.timeout - timeSinceLastActivity;

      // P1.3.2: Include concurrent session info
      const concurrentSessions = await storage.get('concurrent_sessions') || [];
      const userSessions = concurrentSessions.filter(s =>
        s.userId === sessionData.userId && s.isActive
      );

      return {
        active: sessionData.isActive && timeUntilExpiry > 0,
        sessionId: this.sessionId,
        userId: sessionData.userId,
        startTime: sessionData.startTime,
        lastActivity: sessionData.lastActivity,
        timeUntilExpiry: Math.max(0, timeUntilExpiry),
        timeUntilWarning: Math.max(0, timeUntilExpiry - this.warningTimeout),
        concurrentSessionsCount: userSessions.length,
        isNewestSession: userSessions.length <= 1 || userSessions.every(s => s.startTime <= sessionData.startTime)
      };

    } catch (error) {
      this.error('❌ Session status check error:', error);
      return { active: false, reason: 'error', error: error.message };
    }
  }

  /**
   * P1.3.2: Concurrent session bilgilerini döndürür
   */
  async getConcurrentSessionInfo() {
    try {
      const concurrentSessions = await storage.get('concurrent_sessions') || [];
      const sessionData = await storage.get('active_session');

      if (!sessionData) {
        return { sessions: [], userSessions: [] };
      }

      const userSessions = concurrentSessions.filter(s =>
        s.userId === sessionData.userId
      );

      return {
        sessions: concurrentSessions,
        userSessions,
        currentSessionId: this.sessionId,
        totalSessions: concurrentSessions.length,
        userSessionsCount: userSessions.length
      };

    } catch (error) {
      this.error('❌ Concurrent session info error:', error);
      return { sessions: [], userSessions: [], error: error.message };
    }
  }

  /**
   * Session'ı manuel olarak sonlandırır
   */
  async terminateSession() {
    this.log('🛑 P1.3.1: Terminating session manually...');
    return await this.expireSession('manual_termination');
  }

  /**
   * P1.3.3: Handle security threats
   * @param {Object} securityEvent - Security event details
   */
  handleSecurityThreat(securityEvent) {
    this.log('🚨 P1.3.3: Security threat detected:', securityEvent);

    // Record security event for session context
    const sessionData = storage.get('active_session');
    if (sessionData) {
      securityEvent.sessionId = sessionData.sessionId;
      securityEvent.userId = sessionData.userId;
    }

    // Auto-invalidate session for critical threats
    if (securityEvent.severity === 'CRITICAL') {
      this.log('🚨 P1.3.3: Critical threat - auto-invalidating session');
      this.expireSession('security_threat', {
        securityEvent,
        autoInvalidated: true
      });
    }
  }

  /**
   * P1.3.3: Handle security-triggered session invalidation
   * @param {CustomEvent} event - Security invalidation event
   */
  async handleSecurityInvalidation(event) {
    const { reason, metadata, threatLevel } = event.detail;

    this.log(`🚨 P1.3.3: Security invalidation triggered - ${reason}`, { metadata, threatLevel });

    // Immediately terminate session
    await this.expireSession('security_invalidation', {
      securityReason: reason,
      securityMetadata: metadata,
      threatLevel
    });

    // Dispatch invalidation event for UI components
    const sessionInvalidationEvent = new CustomEvent('sessionSecurityInvalidation', {
      detail: {
        reason,
        metadata,
        threatLevel,
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(sessionInvalidationEvent);
  }

  /**
   * P1.3.3: Check for and report suspicious activities
   * @param {string} activityType - Type of activity being monitored
   * @param {Object} activityData - Details of the activity
   */
  checkSuspiciousActivity(activityType, activityData = {}) {
    const sessionData = storage.get('active_session');
    if (!sessionData) return;

    // Check for rapid session activity (potential bot behavior)
    const currentTime = Date.now();
    const timeSinceLastActivity = currentTime - sessionData.lastActivity;

    if (timeSinceLastActivity < 100) { // Less than 100ms between activities
      securityMonitorService.recordRapidRequests(
        sessionData.userId,
        Math.floor(60000 / timeSinceLastActivity) // Requests per minute estimate
      );
    }

    // Check for unusual activity patterns
    if (activityType === 'storage_access' && activityData.suspicious) {
      securityMonitorService.recordProfileTampering(
        sessionData.userId,
        activityData
      );
    }

    // Check for invalid session token usage
    if (activityType === 'invalid_token') {
      securityMonitorService.recordInvalidTokenAttempt(
        sessionData.userId,
        activityData.tokenType || 'session'
      );
    }
  }

  /**
   * Service'i temizler
   */
  cleanup() {
    this.log('🧹 P1.3.1: Cleaning up SessionManagementService...');
    this.clearTimers();
    this.clearActivityListeners();

    // P1.3.3: Stop security monitoring and cleanup listeners
    securityMonitorService.stopMonitoring();
    securityMonitorService.offSecurityThreat(this.handleSecurityThreat.bind(this));
    window.removeEventListener('securitySessionInvalidation', this.handleSecurityInvalidation.bind(this));

    this.isActive = false;
  }
}

export default new SessionManagementService();
