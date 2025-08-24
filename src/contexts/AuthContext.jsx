import { createContext, useContext, useEffect, useState } from "react";
import storage from "../core/storage";
import authService from "../services/authService";
import profileIsolationService from "../services/profileIsolationService";
import securityMonitorService from "../services/securityMonitorService";
import sessionManagementService from "../services/sessionManagementService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setAuthError(null);

        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          if (currentUser && isMounted) {
            setUser({
              id: currentUser.id,
              email: currentUser.email,
              created_at: currentUser.createdAt
            });
            setUserProfile(currentUser);

            // P1.2.4: Set active profile for existing user
            try {
              profileIsolationService.setActiveProfile(currentUser.id);
              logger.info('🔒 P1.2.4: Profile isolation activated for existing user:', currentUser.id);
            } catch (error) {
              logger.warn('⚠️ P1.2.4: Profile activation warning:', error);
            }

            // P1.3.1: Initialize session management for authenticated user
            try {
              await sessionManagementService.initializeSession(currentUser.id);
              logger.info('🔒 P1.3.1: Session management initialized for existing user');
            } catch (error) {
              logger.warn('⚠️ P1.3.1: Session management init warning:', error);
            }
          }
        }

        // Listen for real-time user updates
        const unsubscribeUser = storage.subscribe('currentUser', (newUserData) => {
          if (newUserData && isMounted) {
            setUser({
              id: newUserData.id,
              email: newUserData.email,
              created_at: newUserData.createdAt
            });
            setUserProfile(newUserData);
          }
        });

        if (isMounted) {
          setLoading(false);
        }

        return () => {
          unsubscribeUser();
        };
      } catch (error) {
        if (isMounted) {
          setAuthError("Kimlik doğrulama başlatılamadı");
          logger.error("Auth initialization error:", error);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // P1.3.1: Session event listeners
    const handleSessionWarning = (event) => {
      logger.warn('⚠️ P1.3.1: Session warning received:', event.detail);
      // UI component'lari session warning'i dinleyebilir
    };

    const handleSessionExpired = async (event) => {
      logger.warn('🚨 P1.3.1: Session expired:', event.detail);

      // Skip auto logout for manual termination to prevent infinite loop
      if (event.detail.reason === 'manual_termination') {
        logger.debug('🔄 Skipping auto logout for manual termination');
        return;
      }

      // Auto logout when session expires (not manual)
      try {
        setLoading(true);
        setAuthError(null);

        const result = await authService.logout();
        if (result.success) {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
        logger.info('🔒 P1.3.1: Auto logout completed due to session expiry');
      } catch (error) {
        logger.error('❌ P1.3.1: Auto logout error:', error);
        setLoading(false);
      }
    };

    const handleSessionExtended = (event) => {
      logger.info('✅ P1.3.1: Session extended:', event.detail);
    };

    // P1.3.3: Handle security-triggered session invalidation
    const handleSecurityInvalidation = (event) => {
      logger.warn('🚨 P1.3.3: Security invalidation detected:', event.detail);
      // Auto logout when session is invalidated due to security issues
      try {
        setLoading(true);
        setAuthError(`Güvenlik nedeniyle oturum sonlandırıldı: ${event.detail.reason}`);

        // Clear user state immediately
        setUser(null);
        setUserProfile(null);
        setLoading(false);

        logger.info('🔒 P1.3.3: Auto logout completed due to security invalidation');
      } catch (error) {
        logger.error('❌ P1.3.3: Security invalidation logout error:', error);
        setLoading(false);
      }
    };

    // Listen for storage changes (demo mode için)
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser') {
        if (e.newValue) {
          const parsedUser = JSON.parse(e.newValue);
          setUser({
            id: parsedUser.id,
            email: parsedUser.email,
            created_at: parsedUser.created_at || parsedUser.loginTime
          });
          setUserProfile(parsedUser);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      }
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sessionWarning', handleSessionWarning);
    window.addEventListener('sessionExpired', handleSessionExpired);
    window.addEventListener('sessionExtended', handleSessionExtended);
    window.addEventListener('sessionSecurityInvalidation', handleSecurityInvalidation);

    // Cleanup function
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sessionWarning', handleSessionWarning);
      window.removeEventListener('sessionExpired', handleSessionExpired);
      window.removeEventListener('sessionExtended', handleSessionExtended);
      window.removeEventListener('sessionSecurityInvalidation', handleSecurityInvalidation);
    };
  }, []);

  // Sign in function
  const signIn = async (email, password, rememberMe = false) => {
    logger.info('🔐 AuthContext signIn çağrıldı:', { email, password });
    setLoading(true);
    setAuthError(null);

    // P1.2.4: Previous user için profile isolation
    const previousUserId = user?.id;

    logger.info('📞 authService.login çağrılıyor...');
    const result = await authService.login(email, password, rememberMe);
    logger.info('📋 authService.login sonucu:', result);

    if (result.success) {
      const userData = result.user;
      logger.info('✅ Giriş başarılı, kullanıcı verisi:', userData);

      // P1.2.4: Cross-profile data bleeding prevention
      if (previousUserId && previousUserId !== userData.id) {
        try {
          // Clear previous user's profile data
          const currentProfile = profileIsolationService.getActiveProfile();
          if (currentProfile === previousUserId) {
            profileIsolationService.clearCurrentProfile();
          }
          logger.info('🔒 P1.2.4: Previous profile cleared for user switch');
        } catch (error) {
          logger.warn('⚠️ P1.2.4: Profile isolation warning:', error);
        }
      }

      // P1.2.4: Set active profile for new user
      try {
        profileIsolationService.setActiveProfile(userData.id);
        logger.info('🔒 P1.2.4: Profile isolation activated for user:', userData.id);
      } catch (error) {
        logger.warn('⚠️ P1.2.4: Profile activation warning:', error);
      }

      // P1.3.1: Initialize session management for new user
      try {
        await sessionManagementService.initializeSession(userData.id);
        logger.info('🔒 P1.3.1: Session management initialized for new login');
      } catch (error) {
        logger.warn('⚠️ P1.3.1: Session management init warning:', error);
      }

      setUser({
        id: userData.id,
        email: userData.email,
        created_at: userData.createdAt,
      });
      setUserProfile(userData);
      setLoading(false);
      return { success: true, data: { user: userData } };
    } else {
      logger.info('❌ Giriş başarısız:', result.error);

      // P1.3.3: Record failed login attempt for security monitoring
      try {
        securityMonitorService.recordFailedLogin(email, 'unknown');
        logger.info('🔒 P1.3.3: Failed login attempt recorded for security monitoring');
      } catch (error) {
        logger.warn('⚠️ P1.3.3: Failed login recording warning:', error);
      }

      setAuthError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }
  };

  // Sign up function
  const signUp = async (email, password, additionalData = {}) => {
    setLoading(true);
    setAuthError(null);

    const result = await authService.signUp(email, password, additionalData);

    if (result.success) {
      setLoading(false);
      return { success: true, data: result.data };
    } else {
      setAuthError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    setAuthError(null);

    // P1.3.1: Terminate session before logout
    try {
      await sessionManagementService.terminateSession();
      logger.info('🔒 P1.3.1: Session terminated before logout');
    } catch (error) {
      logger.warn('⚠️ P1.3.1: Session termination warning:', error);
    }

    const result = await authService.logout();

    if (result.success) {
      // P1.2.4: Clear current profile after logout
      if (user?.id) {
        try {
          profileIsolationService.clearCurrentProfile();
          logger.info('🔒 P1.2.4: Profile cleared for logout');
        } catch (error) {
          logger.warn('⚠️ P1.2.4: Profile clear warning during logout:', error);
        }
      }

      setUser(null);
      setUserProfile(null);
      setLoading(false);
      return { success: true };
    } else {
      setAuthError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    setAuthError(null);

    if (!user?.id) {
      return { success: false, error: "Kullanıcı oturumu bulunamadı" };
    }

    const result = await authService.updateUserProfile(user.id, updates);

    if (result.success) {
      setUserProfile(prev => ({ ...prev, ...updates }));
      return { success: true, data: result.data };
    } else {
      setAuthError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setAuthError(null);
    return await authService.resetPassword(email);
  };

  // P1.3.1: Session management functions
  const extendSession = async () => {
    try {
      const result = await sessionManagementService.extendSession();
      if (result) {
        logger.info('✅ P1.3.1: Session extended successfully');
        return { success: true };
      } else {
        logger.warn('⚠️ P1.3.1: Session extension failed');
        return { success: false, error: 'Session extension failed' };
      }
    } catch (error) {
      logger.error('❌ P1.3.1: Session extension error:', error);
      return { success: false, error: error.message };
    }
  };

  const getSessionStatus = async () => {
    try {
      return await sessionManagementService.getSessionStatus();
    } catch (error) {
      logger.error('❌ P1.3.1: Session status error:', error);
      return { active: false, reason: 'error', error: error.message };
    }
  };

  // Computed values
  const isAuthenticated = !!user;
  const isSellerLoggedIn = isAuthenticated && (userProfile?.role === 'seller' || userProfile?.role === 'admin');
  const isCustomerLoggedIn = isAuthenticated && userProfile?.role === 'customer';

  const value = {
    user,
    userProfile,
    loading,
    authError,
    isAuthenticated,
    isSellerLoggedIn,
    isCustomerLoggedIn,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    resetPassword,
    extendSession,
    getSessionStatus,
    clearAuthError: () => setAuthError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
