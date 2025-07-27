import { createContext, useContext, useEffect, useState } from "react";
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
              console.log('🔒 P1.2.4: Profile isolation activated for existing user:', currentUser.id);
            } catch (error) {
              console.warn('⚠️ P1.2.4: Profile activation warning:', error);
            }

            // P1.3.1: Initialize session management for authenticated user
            try {
              await sessionManagementService.initializeSession(currentUser.id);
              console.log('🔒 P1.3.1: Session management initialized for existing user');
            } catch (error) {
              console.warn('⚠️ P1.3.1: Session management init warning:', error);
            }
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setAuthError("Kimlik doğrulama başlatılamadı");
          console.error("Auth initialization error:", error);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // P1.3.1: Session event listeners
    const handleSessionWarning = (event) => {
      console.warn('⚠️ P1.3.1: Session warning received:', event.detail);
      // UI component'lari session warning'i dinleyebilir
    };

    const handleSessionExpired = async (event) => {
      console.warn('🚨 P1.3.1: Session expired:', event.detail);
      // Auto logout when session expires
      try {
        setLoading(true);
        setAuthError(null);

        const result = await authService.logout();
        if (result.success) {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
        console.log('🔒 P1.3.1: Auto logout completed due to session expiry');
      } catch (error) {
        console.error('❌ P1.3.1: Auto logout error:', error);
        setLoading(false);
      }
    };

    const handleSessionExtended = (event) => {
      console.log('✅ P1.3.1: Session extended:', event.detail);
    };

    // P1.3.3: Handle security-triggered session invalidation
    const handleSecurityInvalidation = (event) => {
      console.warn('🚨 P1.3.3: Security invalidation detected:', event.detail);
      // Auto logout when session is invalidated due to security issues
      try {
        setLoading(true);
        setAuthError(`Güvenlik nedeniyle oturum sonlandırıldı: ${event.detail.reason}`);

        // Clear user state immediately
        setUser(null);
        setUserProfile(null);
        setLoading(false);

        console.log('🔒 P1.3.3: Auto logout completed due to security invalidation');
      } catch (error) {
        console.error('❌ P1.3.3: Security invalidation logout error:', error);
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
  const signIn = async (email, password) => {
    console.log('🔐 AuthContext signIn çağrıldı:', { email, password });
    setLoading(true);
    setAuthError(null);

    // P1.2.4: Previous user için profile isolation
    const previousUserId = user?.id;

    console.log('📞 authService.login çağrılıyor...');
    const result = await authService.login(email, password);
    console.log('📋 authService.login sonucu:', result);

    if (result.success) {
      const userData = result.user;
      console.log('✅ Giriş başarılı, kullanıcı verisi:', userData);

      // P1.2.4: Cross-profile data bleeding prevention
      if (previousUserId && previousUserId !== userData.id) {
        try {
          // Clear previous user's profile data
          const currentProfile = profileIsolationService.getActiveProfile();
          if (currentProfile === previousUserId) {
            profileIsolationService.clearCurrentProfile();
          }
          console.log('🔒 P1.2.4: Previous profile cleared for user switch');
        } catch (error) {
          console.warn('⚠️ P1.2.4: Profile isolation warning:', error);
        }
      }

      // P1.2.4: Set active profile for new user
      try {
        profileIsolationService.setActiveProfile(userData.id);
        console.log('🔒 P1.2.4: Profile isolation activated for user:', userData.id);
      } catch (error) {
        console.warn('⚠️ P1.2.4: Profile activation warning:', error);
      }

      // P1.3.1: Initialize session management for new user
      try {
        await sessionManagementService.initializeSession(userData.id);
        console.log('🔒 P1.3.1: Session management initialized for new login');
      } catch (error) {
        console.warn('⚠️ P1.3.1: Session management init warning:', error);
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
      console.log('❌ Giriş başarısız:', result.error);

      // P1.3.3: Record failed login attempt for security monitoring
      try {
        securityMonitorService.recordFailedLogin(email, 'unknown');
        console.log('🔒 P1.3.3: Failed login attempt recorded for security monitoring');
      } catch (error) {
        console.warn('⚠️ P1.3.3: Failed login recording warning:', error);
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
      console.log('🔒 P1.3.1: Session terminated before logout');
    } catch (error) {
      console.warn('⚠️ P1.3.1: Session termination warning:', error);
    }

    const result = await authService.logout();

    if (result.success) {
      // P1.2.4: Clear current profile after logout
      if (user?.id) {
        try {
          profileIsolationService.clearCurrentProfile();
          console.log('🔒 P1.2.4: Profile cleared for logout');
        } catch (error) {
          console.warn('⚠️ P1.2.4: Profile clear warning during logout:', error);
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
        console.log('✅ P1.3.1: Session extended successfully');
        return { success: true };
      } else {
        console.warn('⚠️ P1.3.1: Session extension failed');
        return { success: false, error: 'Session extension failed' };
      }
    } catch (error) {
      console.error('❌ P1.3.1: Session extension error:', error);
      return { success: false, error: error.message };
    }
  };

  const getSessionStatus = async () => {
    try {
      return await sessionManagementService.getSessionStatus();
    } catch (error) {
      console.error('❌ P1.3.1: Session status error:', error);
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
