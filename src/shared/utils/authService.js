const authService = {
  signIn: async (username, password) => {
    // Demo users
    const users = {
      'admin@test.com': {
        id: 'admin-user-id',
        email: 'admin@test.com',
        role: 'admin',
        fullName: 'Admin User',
        password: 'admin',
      },
      'musteri@test.com': {
        id: 'customer-user-id',
        email: 'musteri@test.com',
        role: 'customer',
        fullName: 'Müşteri User',
        password: 'musteri',
      },
    };

    const user = users[username];

    if (user && user.password === password) {
      const sessionData = {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem('currentUser', JSON.stringify(sessionData));
      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            created_at: new Date().toISOString(),
          },
          session: sessionData,
        },
      };
    }

    return { success: false, error: 'Geçersiz kullanıcı adı veya şifre' };
  },

  signUp: async (email, password, additionalData = {}) => {
    return { success: true, data: { user: { email } } };
  },

  signOut: async () => {
    localStorage.removeItem('currentUser');
    return { success: true };
  },

  getSession: async () => {
    return { success: true, data: { session: null } };
  },

  getUserProfile: async (userId) => {
    return { 
      success: true, 
      data: { 
        id: userId, 
        role: 'seller', 
        full_name: 'Demo User',
        email: 'demo@kirilmazlar.com'
      } 
    };
  },

  updateUserProfile: async (userId, updates) => {
    return { success: true };
  },

  resetPassword: async (email) => {
    return { success: true };
  },

  onAuthStateChange: (callback) => {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
};

export default authService;
