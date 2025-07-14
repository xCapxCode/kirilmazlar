// Mevcut localStorage verilerini koruyarak kullanıcı hesapları oluşturma
export const preserveAndCreateUsers = () => {
  // Mevcut localStorage verilerini sakla
  const existingData = {
    products: localStorage.getItem('products'),
    businessInfo: localStorage.getItem('businessInfo'),
    priceSettings: localStorage.getItem('priceSettings'),
    cart: localStorage.getItem('cart'),
    customerOrders: localStorage.getItem('customerOrders'),
    sellerOrders: localStorage.getItem('sellerOrders'),
    deletedDemoOrders: localStorage.getItem('deletedDemoOrders')
  };

  console.log('Mevcut localStorage verileri korunuyor:', existingData);

  // Demo kullanıcılar (GELİŞTİRME AMAÇLI)
  const realUsers = [
    {
      id: 'user_admin',
      email: 'admin@test.com',
      username: 'admin',
      password: 'admin',
      name: 'Yönetici',
      fullName: 'Sistem Yöneticisi',
      phone: '+90 555 000 0000',
      role: 'admin',
      avatar: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      businessInfo: {
        name: existingData.businessInfo ? JSON.parse(existingData.businessInfo).name : 'Kırılmazlar Gıda',
        logo: existingData.businessInfo ? JSON.parse(existingData.businessInfo).logo : null,
        address: 'Demo Adres',
        workingHours: '08:00 - 22:00',
        slogan: 'Taze ve Kaliteli Ürünler'
      },
      permissions: ['all']
    },
    {
      id: 'user_admin_alt',
      email: 'admin@kirilmazlar.com',
      username: 'admin_alt',
      password: 'admin123',
      name: 'Ana Yönetici',
      fullName: 'Ana Yönetici',
      phone: '+90 555 000 0001',
      role: 'admin',
      avatar: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      businessInfo: {
        name: existingData.businessInfo ? JSON.parse(existingData.businessInfo).name : 'Kırılmazlar Gıda',
        logo: existingData.businessInfo ? JSON.parse(existingData.businessInfo).logo : null,
        address: 'Demo Adres',
        workingHours: '08:00 - 22:00',
        slogan: 'Taze ve Kaliteli Ürünler'
      },
      permissions: ['all']
    },
    {
      id: 'user_musteri',
      email: 'musteri@test.com',
      username: 'musteri',
      password: 'musteri',
      name: 'Müşteri',
      fullName: 'Test Müşteri',
      phone: '+90 555 123 4567',
      role: 'customer',
      avatar: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      customerInfo: {
        address: 'Atatürk Caddesi No: 123, Kadıköy, İstanbul',
        preferences: {
          notifications: true,
          smsUpdates: true,
          emailUpdates: true
        }
      },
      permissions: ['view_products', 'create_orders', 'view_orders']
    }
  ];

  // Kullanıcıları localStorage'a kaydet
  localStorage.setItem('registeredUsers', JSON.stringify(realUsers));
  
  // Mevcut verileri geri yükle (eğer varsa)
  Object.keys(existingData).forEach(key => {
    if (existingData[key]) {
      localStorage.setItem(key, existingData[key]);
    }
  });

  console.log('Gerçek kullanıcı hesapları oluşturuldu:', realUsers);
  
  return realUsers;
};

// Kullanıcı girişi (e-posta veya kullanıcı adı ile)
export const authenticateUser = (emailOrUsername, password) => {
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  
  // E-posta veya kullanıcı adı ile giriş kontrolü
  const user = users.find(u => 
    (u.email === emailOrUsername || u.username === emailOrUsername) && 
    u.password === password
  );
  
  if (user) {
    const loginUser = {
      ...user,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    // Giriş yapan kullanıcıyı aktif kullanıcı olarak kaydet
    localStorage.setItem('currentUser', JSON.stringify(loginUser));
    
    // Kullanıcı giriş geçmişi
    const loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
    loginHistory.unshift({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      loginTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      loginMethod: emailOrUsername.includes('@') ? 'email' : 'username'
    });
    
    // Son 50 giriş kayıt et
    if (loginHistory.length > 50) {
      loginHistory.length = 50;
    }
    
    localStorage.setItem('loginHistory', JSON.stringify(loginHistory));
    
    console.log('Kullanıcı girişi başarılı:', loginUser);
    return loginUser;
  }
  
  return null;
};

// Kullanıcı çıkışı
export const logoutUser = () => {
  localStorage.removeItem('currentUser');
  console.log('Kullanıcı çıkış yaptı');
};

// Mevcut kullanıcıyı getir
export const getCurrentAuthUser = () => {
  const currentUser = localStorage.getItem('currentUser');
  return currentUser ? JSON.parse(currentUser) : null;
};

// Tüm kayıtlı kullanıcıları getir
export const getAllRegisteredUsers = () => {
  return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
};

// Yeni kullanıcı oluştur (admin tarafından)
export const createUserByAdmin = (userData) => {
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  
  // E-posta veya kullanıcı adı kontrolü
  const emailExists = users.find(u => u.email === userData.email);
  const usernameExists = users.find(u => u.username === userData.username);
  
  if (emailExists) {
    throw new Error('Bu e-posta adresi zaten kullanılıyor');
  }
  
  if (usernameExists) {
    throw new Error('Bu kullanıcı adı zaten kullanılıyor');
  }
  
  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: userData.email,
    username: userData.username,
    password: userData.password,
    name: userData.name,
    fullName: userData.fullName || userData.name,
    phone: userData.phone || '',
    role: userData.role || 'customer',
    avatar: userData.avatar || null,
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: getCurrentAuthUser()?.id || 'system'
  };
  
  // Rol bazlı ek bilgiler
  if (newUser.role === 'customer') {
    newUser.customerInfo = {
      companyName: userData.companyName || '',
      companyTitle: userData.companyTitle || '',
      taxOffice: userData.taxOffice || '',
      taxNumber: userData.taxNumber || '',
      address: userData.address || '',
      city: userData.city || '',
      district: userData.district || '',
      postalCode: userData.postalCode || '',
      notes: userData.notes || '',
      preferences: {
        notifications: true,
        smsUpdates: true,
        emailUpdates: true
      }
    };
  } else if (newUser.role === 'admin') {
    newUser.businessInfo = {
      name: userData.businessName || 'Fresh Market Pro',
      logo: null,
      address: userData.businessAddress || '',
      workingHours: '08:00 - 22:00',
      slogan: 'Taze ve Kaliteli Ürünler'
    };
  }
  
  users.push(newUser);
  localStorage.setItem('registeredUsers', JSON.stringify(users));
  
  console.log('Yeni kullanıcı oluşturuldu:', newUser);
  return newUser;
};

// Kullanıcı güncelle
export const updateUser = (userId, updateData) => {
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Kullanıcı bulunamadı');
  }
  
  // E-posta veya kullanıcı adı değiştiriliyorsa, çakışma kontrolü
  if (updateData.email && updateData.email !== users[userIndex].email) {
    const emailExists = users.find(u => u.email === updateData.email && u.id !== userId);
    if (emailExists) {
      throw new Error('Bu e-posta adresi zaten kullanılıyor');
    }
  }
  
  if (updateData.username && updateData.username !== users[userIndex].username) {
    const usernameExists = users.find(u => u.username === updateData.username && u.id !== userId);
    if (usernameExists) {
      throw new Error('Bu kullanıcı adı zaten kullanılıyor');
    }
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...updateData,
    updatedAt: new Date().toISOString(),
    updatedBy: getCurrentAuthUser()?.id || 'system'
  };
  
  localStorage.setItem('registeredUsers', JSON.stringify(users));
  
  // Eğer güncellenilen kullanıcı aktif kullanıcıysa, aktif kullanıcı bilgilerini de güncelle
  const currentUser = getCurrentAuthUser();
  if (currentUser && currentUser.id === userId) {
    localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
  }
  
  console.log('Kullanıcı güncellendi:', users[userIndex]);
  return users[userIndex];
};

// Kullanıcı sil
export const deleteUser = (userId) => {
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Kullanıcı bulunamadı');
  }
  
  const currentUser = getCurrentAuthUser();
  if (currentUser && currentUser.id === userId) {
    throw new Error('Aktif kullanıcı kendini silemez');
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  localStorage.setItem('registeredUsers', JSON.stringify(users));
  
  console.log('Kullanıcı silindi:', deletedUser);
  return deletedUser;
};

// Kullanıcı durum değiştir (aktif/pasif)
export const toggleUserStatus = (userId) => {
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Kullanıcı bulunamadı');
  }
  
  users[userIndex].isActive = !users[userIndex].isActive;
  users[userIndex].updatedAt = new Date().toISOString();
  users[userIndex].updatedBy = getCurrentAuthUser()?.id || 'system';
  
  localStorage.setItem('registeredUsers', JSON.stringify(users));
  
  console.log('Kullanıcı durumu değiştirildi:', users[userIndex]);
  return users[userIndex];
};
