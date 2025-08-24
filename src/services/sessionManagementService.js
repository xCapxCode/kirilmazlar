import storage from '@core/storage';
import logger from '@utils/productionLogger';

class SessionManagementService {
  constructor() {
    // Session configuration
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.warningTimeout = 5 * 60 * 1000;  // 5 minutes warning
    this.checkInterval = 60 * 1000;       // Check every minute

    // Session state
    this.sessionId = null;
    this.sessionTimer = null;
    this.warningShown = false;
  }

  // Log wrapper methods
  log(...args) { logger.info(...args); }
  warn(...args) { logger.warn(...args); }
  error(...args) { logger.error(...args); }

  // Initialize session
  async initializeSession(userId) {
    try {
      // Derive effective timeout from rememberMe/sessionExpiry settings
      let effectiveTimeout = this.sessionTimeout;
      try {
        const [rememberMe, sessionExpiry] = await Promise.all([
          storage.get('rememberMe'),
          storage.get('sessionExpiry')
        ]);

        if (typeof sessionExpiry === 'number') {
          const remaining = sessionExpiry - Date.now();
          if (remaining > 0) {
            effectiveTimeout = remaining;
          }
        } else if (rememberMe === true) {
          // Fallback for rememberMe without explicit expiry
          effectiveTimeout = 30 * 24 * 60 * 60 * 1000; // 30 days
        } else if (rememberMe === false) {
          effectiveTimeout = 24 * 60 * 60 * 1000; // 24 hours
        }
      } catch (e) {
        // keep defaults on any error
        logger.warn('Session timeout derivation warning:', e);
      }

      // Align instance timeout for cleanup and other checks
      this.sessionTimeout = effectiveTimeout;

      // Generate new session
      this.sessionId = this.generateSessionId();

      const sessionData = {
        sessionId: this.sessionId,
        userId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        timeout: effectiveTimeout,
        isActive: true,
        warningShown: false,
        tabId: this.generateTabId(),
        browserInfo: this.getBrowserInfo()
      };

      // Store session
      await storage.set('kirilmazlar_active_session', sessionData);

      // Register concurrent session
      await this.registerConcurrentSession(sessionData);

      // Start monitoring
      this.startSessionMonitoring();

      this.log('✅ Session initialized:', { sessionId: this.sessionId });

      return { success: true, sessionId: this.sessionId };
    } catch (error) {
      this.error('❌ Session initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate unique session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate unique tab ID
  generateTabId() {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get browser info
  getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      timestamp: Date.now()
    };
  }

  // Register concurrent session
  async registerConcurrentSession(sessionData) {
    this.log('📝 Registering concurrent session...');
    try {
      const concurrentSessions = await storage.get('kirilmazlar_concurrent_sessions') || [];

      // Remove existing sessions for this user
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
        browserInfo: sessionData.browserInfo
      });

      await storage.set('kirilmazlar_concurrent_sessions', filteredSessions);
      this.log('✅ Concurrent session registered');
    } catch (error) {
      this.error('❌ Failed to register concurrent session:', error);
    }
  }

  // Start session monitoring
  startSessionMonitoring() {
    this.log('⏰ Starting session monitoring...');

    // Clear existing timers
    this.clearTimers();

    // Check session status every minute
    this.sessionTimer = setInterval(() => {
      this.checkSessionStatus();
    }, this.checkInterval);
  }

  // Check session status
  async checkSessionStatus() {
    try {
      const sessionData = await storage.get('kirilmazlar_active_session');
      if (!sessionData || !sessionData.isActive) {
        this.log('No active session found');
        return;
      }

      const now = Date.now();
      const timeSinceLastActivity = now - sessionData.lastActivity;
      const timeUntilExpiry = sessionData.timeout - timeSinceLastActivity;

      // Session expired
      if (timeUntilExpiry <= 0) {
        this.warn('🚨 Session expired!');
        await this.expireSession('timeout');
        return;
      }

      // Show warning if close to expiry
      if (timeUntilExpiry <= this.warningTimeout && !sessionData.warningShown) {
        this.showSessionWarning(Math.ceil(timeUntilExpiry / 60000));
        sessionData.warningShown = true;
        await storage.set('kirilmazlar_active_session', sessionData);
      }

      // Check concurrent sessions
      await this.checkConcurrentSessions();
    } catch (error) {
      this.error('❌ Session status check error:', error);
    }
  }

  // Show session warning
  showSessionWarning(minutesRemaining) {
    this.warn(`⚠️ Session will expire in ${minutesRemaining} minutes!`);

    // Dispatch custom event for UI
    const warningEvent = new CustomEvent('sessionWarning', {
      detail: {
        minutesRemaining,
        timestamp: Date.now(),
        canExtend: true
      }
    });
    window.dispatchEvent(warningEvent);
  }

  // Check concurrent sessions
  async checkConcurrentSessions() {
    try {
      const sessionData = await storage.get('kirilmazlar_active_session');
      if (!sessionData) return;

      const concurrentSessions = await storage.get('kirilmazlar_concurrent_sessions') || [];

      // Find active sessions for current user
      const userSessions = concurrentSessions.filter(s =>
        s.userId === sessionData.userId && s.isActive
      );

      // Multiple sessions detected
      if (userSessions.length > 1) {
        this.warn('🚨 Multiple concurrent sessions detected!');

        // Find newest session
        const newestSession = userSessions.reduce((newest, current) =>
          current.startTime > newest.startTime ? current : newest
        );

        // If current session is not newest, terminate it
        if (newestSession.sessionId !== this.sessionId) {
          this.warn('⚠️ Current session is not newest, terminating...');
          await this.handleConcurrentSessionConflict(newestSession);
        }
      }

      // Clean inactive sessions
      await this.cleanupInactiveSessions();
    } catch (error) {
      this.error('❌ Concurrent session check error:', error);
    }
  }

  // Handle concurrent session conflict
  async handleConcurrentSessionConflict(newerSession) {
    this.warn('🚨 Handling concurrent session conflict...');
    try {
      // Dispatch conflict event
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
      this.error('❌ Session conflict handling error:', error);
    }
  }

  // Clean inactive sessions
  async cleanupInactiveSessions() {
    try {
      const concurrentSessions = await storage.get('kirilmazlar_concurrent_sessions') || [];
      const now = Date.now();

      // Keep only active sessions
      const activeSessions = concurrentSessions.filter(s => {
        const timeSinceLastActivity = now - s.lastActivity;
        return timeSinceLastActivity < this.sessionTimeout;
      });

      if (activeSessions.length !== concurrentSessions.length) {
        await storage.set('kirilmazlar_concurrent_sessions', activeSessions);
        this.log('🧹 Cleaned inactive sessions');
      }
    } catch (error) {
      this.error('❌ Session cleanup error:', error);
    }
  }

  // Expire session
  async expireSession(reason = 'manual') {
    this.warn(`🚫 Expiring session: ${reason}`);
    try {
      // Update session data
      const sessionData = await storage.get('kirilmazlar_active_session');
      if (sessionData) {
        sessionData.isActive = false;
        await storage.set('kirilmazlar_active_session', sessionData);
      }

      // Clear timers
      this.clearTimers();

      // Dispatch expiry event
      const expiryEvent = new CustomEvent('sessionExpired', {
        detail: {
          sessionId: this.sessionId,
          reason,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(expiryEvent);

      this.log('✅ Session expired:', { reason });
      return { success: true };
    } catch (error) {
      this.error('❌ Session expiry error:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear timers
  clearTimers() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  // Terminate session
  async terminateSession() {
    this.log('🛑 Terminating session manually...');
    return await this.expireSession('manual_termination');
  }

  // Check if session is valid
  isSessionValid() {
    try {
      const sessionData = storage.get('kirilmazlar_active_session');
      if (!sessionData || !sessionData.isActive) return false;

      const now = Date.now();
      const timeSinceLastActivity = now - sessionData.lastActivity;
      return timeSinceLastActivity < sessionData.timeout;
    } catch (error) {
      this.error('❌ Session validation error:', error);
      return false;
    }
  }

  // Get session status
  async getSessionStatus() {
    try {
      const sessionData = await storage.get('kirilmazlar_active_session');
      if (!sessionData) {
        return { active: false, reason: 'no_session' };
      }

      const now = Date.now();
      const timeSinceLastActivity = now - sessionData.lastActivity;
      const timeUntilExpiry = sessionData.timeout - timeSinceLastActivity;

      // Get concurrent sessions
      const concurrentSessions = await storage.get('kirilmazlar_concurrent_sessions') || [];
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
        isNewestSession: userSessions.length <= 1 ||
          userSessions.every(s => s.startTime <= sessionData.startTime)
      };
    } catch (error) {
      this.error('❌ Session status check error:', error);
      return { active: false, reason: 'error', error: error.message };
    }
  }

  // Extend session
  async extendSession() {
    try {
      const sessionData = await storage.get('kirilmazlar_active_session');
      if (!sessionData) {
        throw new Error('No active session to extend');
      }

      // Reset timers
      sessionData.lastActivity = Date.now();
      sessionData.warningShown = false;
      await storage.set('kirilmazlar_active_session', sessionData);

      // Update concurrent sessions
      const concurrentSessions = await storage.get('kirilmazlar_concurrent_sessions') || [];
      const sessionIndex = concurrentSessions.findIndex(s => s.sessionId === this.sessionId);
      if (sessionIndex !== -1) {
        concurrentSessions[sessionIndex].lastActivity = Date.now();
        await storage.set('kirilmazlar_concurrent_sessions', concurrentSessions);
      }

      this.log('⏰ Session extended');
      return { success: true };
    } catch (error) {
      this.error('❌ Session extension error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SessionManagementService();
