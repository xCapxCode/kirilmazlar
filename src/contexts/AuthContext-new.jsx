const AuthContext = React.createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [userProfile, setUserProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [authError, setAuthError] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setAuthError(null);

        // Demo mode - check localStorage for demo user
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser && isMounted) {
          const parsedUser = JSON.parse(storedUser);
          setUser({
            id: parsedUser.id,
            email: parsedUser.email,
            created_at: parsedUser.created_at || parsedUser.loginTime
          });
          setUserProfile(parsedUser);
        }
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setAuthError("Kimlik doğrulama başlatılamadı");
          console.error("Auth initialization error:", error);
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

    // Demo mode - simulate sign in
    if (email && password) {
      setUser({
        id: 'demo-seller-id',
        email,
        created_at: new Date().toISOString()
      });
      setUserProfile({
        id: 'demo-seller-id',
        email,
        full_name: 'Demo User',
        role: 'seller'
      });
      setLoading(false);
      return { success: true };
    } else {
      setAuthError('E-posta ve şifre gerekli');
      setLoading(false);
      return { success: false, error: 'E-posta ve şifre gerekli' };
    }
  };

  // Sign up function
  const signUp = async (email, password, additionalData = {}) => {
    setLoading(true);
    setAuthError(null);

    // Demo mode - simulate sign up
    setLoading(false);
    return { success: true, data: { email } };
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    setAuthError(null);

    // Demo mode - simulate sign out
    localStorage.removeItem('currentUser');
    setUser(null);
    setUserProfile(null);
    setLoading(false);
    return { success: true };
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    setAuthError(null);

    if (!user?.id) {
      const errorMsg = "Kullanıcı oturumu bulunamadı";
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Demo mode - update localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const updatedUser = { ...parsedUser, ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUserProfile(updatedUser);
      return { success: true, data: updatedUser };
    }

    return { success: true };
  };

  // Reset password
  const resetPassword = async (email) => {
    setAuthError(null);
    // Demo mode - simulate reset password
    return { success: true };
  };

  // Clear error
  const clearAuthError = () => {
    setAuthError(null);
  };

  const value = {
    user,
    userProfile,
    loading,
    authError,
    isAuthenticated: !!user,
    isSellerLoggedIn: userProfile?.role === 'seller' || userProfile?.role === 'admin',
    isCustomerLoggedIn: userProfile?.role === 'customer',
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    resetPassword,
    clearAuthError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
