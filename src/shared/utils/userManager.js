/* global localStorage, window */
// Kullanıcı yönetimi utility'si
export const createDemoUser = (userInfo) => {
  const user = {
    id: `user_${Date.now()}`,
    email: userInfo.email,
    name: userInfo.name,
    phone: userInfo.phone,
    role: userInfo.role, // 'admin', 'seller', 'customer'
    avatar: userInfo.avatar || null,
    isActive: true,
    createdAt: new Date().toISOString(),
    loginTime: new Date().toISOString(),
    ...userInfo
  };

  // localStorage'a kaydet
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  // Kullanıcı listesine de ekle
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const existingIndex = users.findIndex(u => u.email === user.email);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem('users', JSON.stringify(users));
  
  // Storage event tetikle
  window.dispatchEvent(new Event('storage'));
  
  return user;
};

export const switchUserRole = (newRole) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  if (currentUser.id) {
    const updatedUser = {
      ...currentUser,
      role: newRole,
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Users listesini de güncelle
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(user => 
      user.id === currentUser.id ? updatedUser : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Storage event tetikle
    window.dispatchEvent(new Event('storage'));
    
    return updatedUser;
  }
  
  return null;
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
};

export const getAllUsers = () => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const loginAsUser = (userId) => {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  
  if (user) {
    const loginUser = {
      ...user,
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(loginUser));
    window.dispatchEvent(new Event('storage'));
    
    return loginUser;
  }
  
  return null;
};

// Bülent Üner kullanıcısını oluştur
export const createBulentUnerUser = () => {
  return createDemoUser({
    email: 'admin@demo.com',
    name: 'Bülent Üner',
    phone: '+90 555 123 4567',
    role: 'admin', // Admin olarak başlasın, sonra değiştirebiliriz
    avatar: null,
    businessInfo: {
      name: 'Fresh Market Pro',
      logo: null,
      address: 'Atatürk Caddesi No: 123, Kadıköy, İstanbul',
      workingHours: '08:00 - 22:00'
    }
  });
};
