import React, { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";

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

    window.addEventListener('storage', handleStorageChange);

    // Cleanup function
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Sign in function
  const signIn = async (email, password) => {
    setLoading(true);
    setAuthError(null);

    const result = await authService.login(email, password);

    if (result.success) {
      const userData = result.user;
      setUser({
        id: userData.id,
        email: userData.email,
        created_at: userData.createdAt,
      });
      setUserProfile(userData);
      setLoading(false);
      return { success: true, data: { user: userData } };
    } else {
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

    const result = await authService.logout();

    if (result.success) {
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
