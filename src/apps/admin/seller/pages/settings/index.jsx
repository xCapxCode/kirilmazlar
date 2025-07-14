import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@contexts/AuthContext';
import SaticiHeader from '@shared/components/ui/SaticiHeader';
import Icon from '@shared/components/AppIcon';

// Global variables are now defined in ESLint config

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, color = 'green' }) => {
  const baseClasses = "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all";
  const colorClasses = {
    green: "peer-focus:ring-green-300 peer-checked:bg-green-600",
    blue: "peer-focus:ring-blue-300 peer-checked:bg-blue-600"
  };
  
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className={`${baseClasses} ${colorClasses[color]}`}></div>
    </label>
  );
};

// Password Input Component with toggle
const PasswordInput = ({ value, onChange, placeholder = "Şifre", className = "" }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={`pr-10 ${className}`}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
      </button>
    </div>
  );
};

// Admin Account Card Component
const AdminAccountCard = ({ account, onUpdate, onDelete, type = 'admin' }) => {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState(account.password || '');
  const [passwordSaved, setPasswordSaved] = useState(false);
  
  const isOwner = account.role === 'owner';
  const cardColors = {
    admin: "bg-slate-100 border-gray-200",
    demo: "bg-slate-100 border-gray-200"
  };
  
  const iconColors = {
    admin: "text-green-600",
    demo: "text-blue-600"
  };

  const handlePasswordSave = () => {
    onUpdate('password', tempPassword);
    setIsEditingPassword(false);
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2000);
  };

  const handlePasswordCancel = () => {
    setTempPassword(account.password || '');
    setIsEditingPassword(false);
  };
  
  return (
    <div className={`${cardColors[type]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="flex-shrink-0">
            <div className={`h-10 w-10 flex items-center justify-center ${iconColors[type]}`}>
              <Icon 
                name={type === 'admin' ? 'Shield' : account.role === 'customer' ? 'User' : 'Store'} 
                size={16} 
              />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">{account.name}</h3>
              {isOwner && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Ana Yönetici
                </span>
              )}
              {type === 'demo' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-600">
                {account.role === 'customer' ? 'Demo Müşteri' : account.role === 'seller' ? 'Demo Satıcı' : 'Demo'}
              </span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
              <span>@{account.username}</span>
              <span>{account.email}</span>
            </div>
            
            {/* Inline Password Edit */}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-gray-500">Şifre:</span>
              {isEditingPassword ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs w-24"
                    placeholder="Yeni şifre"
                    autoFocus
                  />
                  <button
                    onClick={handlePasswordSave}
                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Kaydet"
                  >
                    <Icon name="Check" size={14} />
                  </button>
                  <button
                    onClick={handlePasswordCancel}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="İptal"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {'•'.repeat(account.password?.length || 4)}
                  </span>
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Şifreyi Düzenle"
                  >
                    <Icon name="Edit2" size={12} />
                  </button>
                  {passwordSaved && (
                    <span className="flex items-center text-green-600 text-xs">
                      <Icon name="Check" size={12} className="mr-1" />
                      Kaydedildi
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ToggleSwitch
            checked={account.active}
            onChange={(value) => onUpdate('active', value)}
            color="green"
          />
          {!isOwner && (
            <button
              onClick={onDelete}
              className="p-1.5 text-red-600 rounded-lg bg-transparent"
              title="Hesabı Sil"
            >
              <Icon name="Trash2" size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Admin Account Form Component
const AdminAccountForm = ({ formData, onFieldChange, onSubmit, submitText, type = 'admin' }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.username.trim() || !formData.password.trim()) {
      alert('Lütfen tüm gerekli alanları doldurun.');
      return;
    }
    onSubmit();
  };
  
  const buttonColors = {
    admin: "bg-green-600 hover:bg-green-700",
    demo: "bg-blue-600 hover:bg-blue-700"
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ad Soyad *
          </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => onFieldChange('newAdminName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ad Soyad"
                    required
                  />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-posta *
          </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => onFieldChange('newAdminEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="ornek@email.com"
                    required
                  />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kullanıcı Adı *
          </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => onFieldChange('newAdminUsername', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="kullanici_adi"
                    required
                  />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Şifre *
          </label>
          <PasswordInput
            value={formData.password}
            onChange={(e) => onFieldChange('newAdminPassword', e.target.value)}
            placeholder="Şifre"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className={`px-6 py-2 text-white rounded-lg transition-colors ${buttonColors[type]}`}
        >
          {submitText}
        </button>
      </div>
    </form>
  );
};

const GenelAyarlar = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('business');
  // const [showSuccess, setShowSuccess] = useState(false);
  
  // Form states
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    companyTitle: '',
    phone: '',
    email: '',
    address: '',
    description: '',
    logo: null,
    slogan: ''
  });

  const [priceSettings, setPriceSettings] = useState({
    showPrices: true,
    showPricesOnlyToMembers: false,
    minOrderAmount: 50,
    currency: 'TRY'
  });

  const [orderSettings, setOrderSettings] = useState({
    autoConfirmOrders: false,
    orderPrefix: 'SIP',
    orderNumberStart: 1,
    enableOrderNotes: true,
    maxOrderItems: 50
  });

  const [notificationSettings, setNotificationSettings] = useState({
    orderStatusUpdates: true,
    lowStockAlerts: true,
    newCustomerAlerts: true,
    systemAlerts: true,
    paymentAlerts: true
  });

  const [adminSettings, setAdminSettings] = useState({
    admins: [
      { 
        id: 1, 
        name: 'Ana Yönetici', 
        email: 'admin@kirilmazlar.com', 
        role: 'owner', 
        active: true, 
        username: 'admin', 
        password: 'admin123',
        type: 'real',
        createdAt: new Date().toISOString()
      },
      { 
        id: 2, 
        name: 'Sistem Yöneticisi', 
        email: 'admin@test.com', 
        role: 'admin', 
        active: true, 
        username: 'admin', 
        password: 'admin',
        type: 'real',
        createdAt: new Date().toISOString()
      }
    ],
    demoAccounts: [
      {
        id: 'demo_customer_1',
        name: 'Demo Müşteri',
        email: 'demo.musteri@example.com',
        role: 'customer',
        username: 'demo_musteri',
        password: 'demo123',
        type: 'demo',
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_seller_1',
        name: 'Demo Satıcı',
        email: 'demo.satici@example.com',
        role: 'seller',
        username: 'demo_satici',
        password: 'demo123',
        type: 'demo',
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user_musteri',
        name: 'Test Müşteri',
        email: 'musteri@test.com',
        role: 'customer',
        username: 'musteri',
        password: 'musteri',
        type: 'demo',
        active: true,
        createdAt: new Date().toISOString()
      }
    ],
    newAdminName: '',
    newAdminEmail: '',
    newAdminUsername: '',
    newAdminPassword: '',
    newAdminType: 'real'
  });

  const [customUnits, setCustomUnits] = useState([
    { id: 1, name: 'kg', display: 'Kilogram', active: true },
    { id: 2, name: 'adet', display: 'Adet', active: true },
    { id: 3, name: 'kasa', display: 'Kasa', active: true },
    { id: 4, name: 'çuval', display: 'Çuval', active: true },
    { id: 5, name: 'demet', display: 'Demet', active: true }
  ]);

  // useEffect'i fonksiyonlardan sonra taşıyacağız

  const loadSettings = useCallback(async () => {
    // Demo modda da ayarları yükleyebilmek için user kontrolünü esnetelim
    const userId = user?.id || 'demo_user';
    
    try {
      const dataService = await import('@shared/utils/dataService');
      const { settingsService, unitsService } = dataService.default;
      
      // Önce localStorage'dan işletme ayarlarını yükle (hem demo hem gerçek mod için)
      const localBusinessInfo = localStorage.getItem('businessInfo');
      if (localBusinessInfo) {
        try {
          const parsed = JSON.parse(localBusinessInfo);
          setBusinessInfo({
            name: parsed.name || '',
            companyTitle: parsed.companyTitle || '',
            phone: parsed.phone || '',
            email: parsed.email || '',
            address: parsed.address || '',
            description: parsed.description || '',
            logo: parsed.logo || null,
            slogan: parsed.slogan || ''
          });
          console.log('İşletme ayarları localStorage\'dan yüklendi');
        } catch (e) {
          console.error('localStorage parse hatası:', e);
        }
      }
      
      // İşletme ayarlarını database'den yükle (üzerine yaz)
      const businessResult = await settingsService.get(userId, 'business_info');
      if (businessResult.success && businessResult.data) {
        setBusinessInfo(businessResult.data);
        // Database'den gelen veriyi localStorage'a da kaydet
        localStorage.setItem('businessInfo', JSON.stringify(businessResult.data));
      }
      
      // Fiyat ayarlarını yükle
      const priceResult = await settingsService.get(userId, 'price_settings');
      if (priceResult.success && priceResult.data) {
        setPriceSettings(priceResult.data);
      }
      
      // Sipariş ayarlarını yükle
      const orderResult = await settingsService.get(userId, 'order_settings');
      if (orderResult.success && orderResult.data) {
        setOrderSettings(orderResult.data);
      }
      
      // Bildirim ayarlarını yükle
      const notificationResult = await settingsService.get(userId, 'notification_settings');
      if (notificationResult.success && notificationResult.data) {
        setNotificationSettings(notificationResult.data);
      }
      
      // Yönetici ayarlarını yükle
      const adminResult = await settingsService.get(userId, 'admin_settings');
      if (adminResult.success && adminResult.data) {
        setAdminSettings(adminResult.data);
      } else {
        // localStorage'dan yükle (demo mod için)
        const localAdminSettings = localStorage.getItem('admin_settings');
        const localDemoAccounts = localStorage.getItem('demo_accounts');
        
        if (localAdminSettings || localDemoAccounts) {
          try {
            const savedAdminSettings = localAdminSettings ? JSON.parse(localAdminSettings) : adminSettings;
            const savedDemoAccounts = localDemoAccounts ? JSON.parse(localDemoAccounts) : adminSettings.demoAccounts;
            
            setAdminSettings({
              ...savedAdminSettings,
              demoAccounts: savedDemoAccounts
            });
            console.log('Admin ayarları localStorage\'dan yüklendi');
          } catch (e) {
            console.error('Admin ayarları localStorage parse hatası:', e);
          }
        } else {
          // İlk kez çalışıyorsa default hesapları oluştur
          console.log('🆕 İlk kez çalışıyor, default hesaplar oluşturuluyor...');
          
          // Default accounts from realAuthSystem'i kontrol et
          const existingUsers = localStorage.getItem('registeredUsers');
          if (!existingUsers) {
            console.log('🔧 Hiç kullanıcı yok, realAuthSystem\'dan import ediliyor...');
            try {
              // realAuthSystem'dan default kullanıcıları çek
              const { preserveAndCreateUsers } = await import('@shared/utils/realAuthSystem');
              const defaultUsers = preserveAndCreateUsers();
              console.log('✅ Default kullanıcılar oluşturuldu:', defaultUsers.length);
            } catch (error) {
              console.warn('⚠️ realAuthSystem import başarısız:', error);
            }
          }
        }
      }
      
      // Birimler listesini yükle
      const unitsResult = await unitsService.getAll();
      if (unitsResult.success && unitsResult.data) {
        const mappedUnits = unitsResult.data.map(unit => ({
          id: unit.id,
          name: unit.name,
          display: unit.display_name,
          active: unit.is_active
        }));
        setCustomUnits(mappedUnits);
      }
      
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
      // Demo modda varsayılan ayarları kullan
      console.log('Demo modda çalışıyor, varsayılan ayarlar yüklendi');
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Sadece user.id'ye bağımlı olmalı

  const syncWithAuthSystem = () => {
    try {
      // Get all real users and demo accounts from admin settings
      const allRealUsers = (adminSettings.admins || []).map(admin => ({
        id: admin.id === 1 ? 'user_admin_owner' : `user_admin_${admin.id}`,
        email: admin.email,
        username: admin.username,
        password: admin.password,
        name: admin.name,
        fullName: admin.name,
        phone: '+90 555 000 0000',
        role: admin.role === 'owner' ? 'admin' : 'admin',
        avatar: null,
        isActive: admin.active,
        createdAt: admin.createdAt,
        businessInfo: {
          name: businessInfo.name || 'KIRILMAZLAR',
          logo: businessInfo.logo,
          address: businessInfo.address || 'Demo Adres',
          workingHours: '08:00 - 22:00',
          slogan: businessInfo.slogan || 'Taze ve Kaliteli Ürünler'
        },
        permissions: ['all']
      }));

      const allDemoUsers = (adminSettings.demoAccounts || []).map(account => ({
        id: account.id,
        email: account.email,
        username: account.username,
        password: account.password,
        name: account.name,
        fullName: account.name,
        phone: '+90 555 123 4567',
        role: account.role,
        avatar: null,
        isActive: account.active,
        createdAt: account.createdAt,
        customerInfo: account.role === 'customer' ? {
          address: 'Demo Müşteri Adresi',
          preferences: {
            notifications: true,
            smsUpdates: true,
            emailUpdates: true
          }
        } : undefined,
        permissions: account.role === 'customer' 
          ? ['view_products', 'create_orders', 'view_orders']
          : account.role === 'seller' 
          ? ['manage_products', 'view_orders', 'manage_orders']
          : ['all']
      }));

      // Combine all users
      const allUsers = [...allRealUsers, ...allDemoUsers];

      // Update localStorage
      localStorage.setItem('registeredUsers', JSON.stringify(allUsers));
      localStorage.setItem('admin_settings', JSON.stringify(adminSettings));

      console.log('🔄 Authentication system synced with admin settings');
      console.log('📊 Total users:', allUsers.length);
      console.log('👥 Real admins:', allRealUsers.length);
      console.log('🧪 Demo accounts:', allDemoUsers.length);

      return { success: true, users: allUsers };
    } catch (error) {
      console.error('❌ Failed to sync auth system:', error);
      return { success: false, error: error.message };
    }
  };

  // Ana useEffect - fonksiyonlardan sonra tanımlandı
  useEffect(() => {
    loadSettings();
    
    // Import existing accounts and then auto-sync with authentication system on load
    setTimeout(() => {
      // const importResult = importExistingAccounts();
      // console.log('📥 Import result:', importResult);
      const syncResult = syncWithAuthSystem();
      if (syncResult.success) {
        console.log('✅ Authentication system auto-synced on load');
      } else {
        console.warn('⚠️ Auto-sync failed on load:', syncResult.error);
      }
    }, 1000);
  }, []); // Dependency array'i temizle - fonksiyonlar bir kez çalışsın

  // Satıcı değilse yönlendir
  useEffect(() => {
    if (!authLoading && userProfile && userProfile.role !== 'seller' && userProfile.role !== 'admin') {
      window.location.href = '/customer/catalog';
    }
  }, [authLoading, userProfile]);

  const tabs = [
    { id: 'business', label: 'İşletme Bilgileri', icon: 'Building' },
    { id: 'admins', label: 'Yönetici Hesapları', icon: 'Users' },
    { id: 'pricing', label: 'Fiyat Ayarları', icon: 'DollarSign' },
    { id: 'orders', label: 'Sipariş Ayarları', icon: 'ShoppingCart' },
    { id: 'units', label: 'Birim Yönetimi', icon: 'Package' },
    { id: 'notifications', label: 'Bildirimler', icon: 'Bell' }
  ];

  const handleSave = async (section) => {
    const userId = user?.id || 'demo_user';

    try {
      const dataService = await import('@shared/utils/dataService');
      const { settingsService, unitsService } = dataService.default;

      let result;

      // Hangi bölüm kaydediliyorsa ona göre işlem yap
      if (section === 'business') {
        result = await settingsService.set(userId, 'business_info', businessInfo);

        // İşletme bilgileri kaydedildiğinde localStorage'ı güncelle ve event dispatch et
        if (result?.success || !user?.id) { // Demo modda da çalışsın
          localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
          console.log("BusinessInfo localStorage'a kaydedildi:", businessInfo);
          // Custom event dispatch et (header'ın güncellenebilmesi için)
          window.dispatchEvent(new CustomEvent('businessInfoUpdated'));
        }
      } else if (section === 'pricing') {
        result = await settingsService.set(userId, 'price_settings', priceSettings);
      } else if (section === 'orders') {
        result = await settingsService.set(userId, 'order_settings', orderSettings);
      } else if (section === 'notifications') {
        result = await settingsService.set(userId, 'notification_settings', notificationSettings);
      } else if (section === 'admins') {
        // Hem gerçek hem demo hesapları kaydet
        result = await settingsService.set(userId, 'admin_settings', adminSettings);

        // Sync with authentication system
        const syncResult = syncWithAuthSystem();
        if (!syncResult.success) {
          console.warn('Auth system sync failed:', syncResult.error);
        }

        // Demo modda localStorage'a da kaydet
        if (!user?.id) {
          localStorage.setItem('admin_settings', JSON.stringify(adminSettings));
          localStorage.setItem('demo_accounts', JSON.stringify(adminSettings.demoAccounts));
          console.log('Admin ayarları localStorage\'a kaydedildi');
        }

        console.log('🔄 Hesap yönetimi sistemi güncellendi');
        console.log('👥 Toplam gerçek yönetici:', (adminSettings.admins || []).length);
        console.log('🧪 Toplam demo hesap:', (adminSettings.demoAccounts || []).length);
      } else if (section === 'units') {
        // Birimler için özel işlem - güncellenen birimleri kaydet
        const updatePromises = customUnits.map(unit => 
          unitsService.update(unit.id, { 
            display_name: unit.display, 
            is_active: unit.active 
          })
        );
        await Promise.all(updatePromises);
        result = { success: true };
      }

      if (result?.success || !user?.id) { // Demo modda da başarılı sayalım
        // setShowSuccess(true);
        // setTimeout(() => setShowSuccess(false), 3000);
        console.log(`${section} ayarları başarıyla kaydedildi`);
      } else {
        console.error('Ayarlar kaydedilirken hata:', result?.error);
      }

    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      // Demo modda da başarılı sayalım
      if (!user?.id) {
        // setShowSuccess(true);
        // setTimeout(() => setShowSuccess(false), 3000);
        console.log(`${section} ayarları demo modda başarıyla kaydedildi`);
      }
    }
  };

  // const addCustomUnit = async () => {
  //   try {
  //     const { unitsService } = await import('@shared/utils/dataService');

  //     const newUnitData = {
  //       name: 'yeni_birim',
  //       display_name: 'Yeni Birim',
  //       is_active: true
  //     };

  //     const result = await unitsService.create(newUnitData);

  //     if (result.success) {
  //       const newUnit = {
  //         id: result.data.id,
  //         name: result.data.name,
  //         display: result.data.display_name,
  //         active: result.data.is_active
  //       };
  //       setCustomUnits([...customUnits, newUnit]);
  //     }
  //   } catch (error) {
  //     console.error('Birim eklenirken hata:', error);
  //     // Fallback - geçici local ekleme
  //     const newUnit = {
  //       id: Math.max(...customUnits.map(u => u.id)) + 1,
  //       name: '',
  //       display: '',
  //       active: true
  //     };
  //     setCustomUnits([...customUnits, newUnit]);
  //   }
  // };

  const updateCustomUnit = async (id, field, value) => {
    // Önce local state'i güncelle (anlık feedback için)
    setCustomUnits(customUnits.map(unit =>
      unit.id === id ? { ...unit, [field]: value } : unit
    ));

    // Ardından veritabanını güncelle (debounce edilebilir)
    try {
      const dataService = await import('@shared/utils/dataService');
      const { unitsService } = dataService.default;
      const unitData = { [field === 'display' ? 'display_name' : field]: value };
      await unitsService.update(id, unitData);
    } catch (error) {
      console.error('Birim güncellenirken hata:', error);
    }
  };

  const deleteCustomUnit = async (id) => {
    const unit = customUnits.find(unit => unit.id === id);
    const confirmed = window.confirm(
      `"${unit?.display_name || unit?.name}" birimini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
      const dataService = await import('@shared/utils/dataService');
      const { unitsService } = dataService.default;

      const result = await unitsService.delete(id);

      if (result.success) {
        setCustomUnits(customUnits.filter(unit => unit.id !== id));
        window.showToast && window.showToast('Birim başarıyla silindi', 'success');
      } else {
        window.showToast && window.showToast('Birim silinirken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Birim silinirken hata:', error);
      // Fallback - geçici local silme
      setCustomUnits(customUnits.filter(unit => unit.id !== id));
      window.showToast && window.showToast('Birim silinirken hata oluştu', 'error');
    }
  };

  const addAdmin = async () => {
    console.log('🔧 addAdmin called, adminSettings:', adminSettings);

    if (!adminSettings.newAdminName.trim() || !adminSettings.newAdminEmail.trim() || 
        !adminSettings.newAdminUsername.trim() || !adminSettings.newAdminPassword.trim()) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminSettings.newAdminEmail.trim())) {
      alert('Geçerli bir email adresi girin');
      return;
    }

    // Ensure arrays exist
    const currentAdmins = Array.isArray(adminSettings.admins) ? adminSettings.admins : [];
    const currentDemoAccounts = Array.isArray(adminSettings.demoAccounts) ? adminSettings.demoAccounts : [];

    console.log('🔧 Current admins:', currentAdmins);
    console.log('🔧 Current demo accounts:', currentDemoAccounts);

    // Username benzersizlik kontrolü (hem admin hem demo hesaplarda)
    const allAccounts = [...currentAdmins, ...currentDemoAccounts];
    const existingAccount = allAccounts.find(account => 
      account.username?.toLowerCase() === adminSettings.newAdminUsername.trim().toLowerCase()
    );
    if (existingAccount) {
      alert('Bu kullanıcı adı zaten kullanılıyor');
      return;
    }

    // Safe ID generation
    const generateId = () => {
      if (adminSettings.newAdminType === 'demo') {
        return `demo_${Date.now()}`;
      } else {
        const maxId = currentAdmins.length > 0 ? Math.max(...currentAdmins.map(a => a.id || 0)) : 0;
        return maxId + 1;
      }
    };

    const newAccount = {
      id: generateId(),
      name: adminSettings.newAdminName.trim(),
      email: adminSettings.newAdminEmail.trim(),
      username: adminSettings.newAdminUsername.trim(),
      password: adminSettings.newAdminPassword.trim(),
      role: adminSettings.newAdminType === 'demo' ? 'demo_admin' : 'admin',
      type: adminSettings.newAdminType,
      active: true,
      createdAt: new Date().toISOString()
    };

    console.log('🔧 New account to add:', newAccount);

    try {
      if (adminSettings.newAdminType === 'demo') {
        const updatedSettings = {
          ...adminSettings,
          demoAccounts: [...currentDemoAccounts, newAccount],
          newAdminName: '',
          newAdminEmail: '',
          newAdminUsername: '',
          newAdminPassword: '',
          newAdminType: 'real'
        };
        console.log('🔧 Updating demo accounts:', updatedSettings);
        setAdminSettings(updatedSettings);
      } else {
        const updatedSettings = {
          ...adminSettings,
          admins: [...currentAdmins, newAccount],
          newAdminName: '',
          newAdminEmail: '',
          newAdminUsername: '',
          newAdminPassword: '',
          newAdminType: 'real'
        };
        console.log('🔧 Updating real admins:', updatedSettings);
        setAdminSettings(updatedSettings);
      }

      // Sync with authentication system
      await syncWithAuthSystem();

      console.log('✅ Account added successfully');
      alert('Hesap başarıyla eklendi');
    } catch (error) {
      console.error('❌ Error adding account:', error);
      alert('Hesap eklenirken hata oluştu: ' + error.message);
    }
  };

  // BusinessInfo güncelleme helper fonksiyonu
  const updateBusinessInfo = (updates) => {
    const updatedInfo = { ...businessInfo, ...updates };
    setBusinessInfo(updatedInfo);

    // localStorage'a hemen kaydet
    localStorage.setItem('businessInfo', JSON.stringify(updatedInfo));

    // Header'ı güncelle
    window.dispatchEvent(new CustomEvent('businessInfoUpdated'));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya tipi kontrolü
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Sadece PNG, JPG veya JPEG formatında dosya yükleyebilirsiniz');
      return;
    }

    // Dosya boyutu kontrolü (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Dosya boyutu 2MB\'dan küçük olmalıdır');
      e.target.value = ''; // Input'u temizle
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64String = event.target.result;

        // State ve localStorage'ı güncelle
        updateBusinessInfo({ logo: base64String });

        // Database'e de kaydet (demo modda da çalışsın)
        const userId = user?.id || 'demo_user';
        try {
          const dataService = await import('@shared/utils/dataService');
          const { settingsService } = dataService.default;
          await settingsService.set(userId, 'business_info', { ...businessInfo, logo: base64String });
          console.log("Logo database'e de kaydedildi");
        } catch (error) {
          console.log('Demo modda - database kaydı atlandı');
        }

        console.log("Logo başarıyla yüklendi ve localStorage'a kaydedildi");

        // Input'u temizle
        e.target.value = '';

      } catch (error) {
        console.error('Logo yükleme hatası:', error);
        alert('Logo yüklenirken bir hata oluştu');
      }
    };

    reader.onerror = () => {
      alert('Dosya okuma hatası');
      e.target.value = ''; // Input'u temizle
    };

    reader.readAsDataURL(file);
  };

  const updateAdmin = (id, field, value) => {
    // Ana yöneticiyi devre dışı bırakma kontrolü
    const admin = (adminSettings.admins || []).find(a => a.id === id);
    if (admin?.role === 'owner' && field === 'active' && !value) {
      alert('Ana yönetici hesabı devre dışı bırakılamaz!');
      return;
    }

    // Ana yönetici temel bilgilerini değiştirme kontrolü
    if (admin?.role === 'owner' && ['name', 'email', 'username'].includes(field)) {
      if (!confirm('Ana yönetici bilgilerini değiştirmek istediğinizden emin misiniz?')) {
        return;
      }
    }

    setAdminSettings({
      ...adminSettings,
      admins: (adminSettings.admins || []).map(admin =>
        admin.id === id ? { ...admin, [field]: value } : admin
      )
    });
  };

  const deleteAccountSafely = (id, type) => {
    // Show confirmation dialog
    const accountName = type === 'admin' 
      ? (adminSettings.admins || []).find(acc => acc.id === id)?.name
      : (adminSettings.demoAccounts || []).find(acc => acc.id === id)?.name;
    
    const confirmed = window.confirm(
      `"${accountName}" ${type === 'admin' ? 'admin' : 'demo'} hesabını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
      if (type === 'admin') {
        setAdminSettings({
          ...adminSettings,
          admins: (adminSettings.admins || []).filter(admin => admin.id !== id)
        });
        window.showToast && window.showToast('Admin hesabı başarıyla silindi', 'success');
      } else if (type === 'demo') {
        setAdminSettings({
          ...adminSettings,
          demoAccounts: (adminSettings.demoAccounts || []).filter(account => account.id !== id)
        });
        window.showToast && window.showToast('Demo hesabı başarıyla silindi', 'success');
      }
      
      // Sync with auth system
      syncWithAuthSystem();
      
      console.log(`✅ ${type} account deleted successfully`);
    } catch (error) {
      console.error(`❌ Failed to delete ${type} account:`, error);
      window.showToast && window.showToast(`${type} hesabı silinirken hata oluştu`, 'error');
    }
  };

  const deleteAdmin = (id) => {
    return deleteAccountSafely(id, 'admin');
  };

  const deleteDemoAccount = (id) => {
    return deleteAccountSafely(id, 'demo');
  };

  const updateDemoAccount = (id, field, value) => {
    setAdminSettings({
      ...adminSettings,
      demoAccounts: (adminSettings.demoAccounts || []).map(account =>
        account.id === id ? { ...account, [field]: value } : account
      )
    });
  };

  // Eski syncWithAuthSystem fonksiyonu kaldırıldı - yukarıda yenisi var

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ayarlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <SaticiHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık */}
        <div className="bg-slate-100 rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <Icon name="Settings" size={24} className="text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Genel Ayarlar</h1>
              <p className="text-gray-600 mt-1">İşletme ve sistem ayarlarını yönetin</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200 bg-slate-200 rounded-t-lg">
            <nav className="flex space-x-8 px-6 bg-slate-200">
              {[
                { id: 'business', label: 'İşletme Bilgileri', icon: 'Building' },
                { id: 'pricing', label: 'Fiyat Ayarları', icon: 'DollarSign' },
                { id: 'orders', label: 'Sipariş Ayarları', icon: 'ShoppingCart' },
                { id: 'notifications', label: 'Bildirimler', icon: 'Bell' },
                { id: 'accounts', label: 'Hesap Yönetimi', icon: 'Users' },
                { id: 'units', label: 'Birim Yönetimi', icon: 'Ruler' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'business' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">İşletme Bilgileri</h3>
                
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İşletme Logosu
                  </label>
                  <div className="flex items-center space-x-4">
                    {businessInfo.logo && (
                      <img 
                        src={businessInfo.logo} 
                        alt="Logo" 
                        className="h-16 w-16 object-contain border border-gray-300 rounded-lg"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Business Info Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İşletme Adı *
                    </label>
                    <input
                      type="text"
                      value={businessInfo.name}
                      onChange={(e) => updateBusinessInfo({ name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="İşletme adınız"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şirket Ünvanı
                    </label>
                    <input
                      type="text"
                      value={businessInfo.companyTitle}
                      onChange={(e) => updateBusinessInfo({ companyTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Şirket ünvanı"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={businessInfo.phone}
                      onChange={(e) => updateBusinessInfo({ phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+90 555 123 45 67"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={businessInfo.email}
                      onChange={(e) => updateBusinessInfo({ email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="info@isletme.com"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres
                    </label>
                    <textarea
                      value={businessInfo.address}
                      onChange={(e) => updateBusinessInfo({ address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="İşletme adresi"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slogan
                    </label>
                    <input
                      type="text"
                      value={businessInfo.slogan}
                      onChange={(e) => updateBusinessInfo({ slogan: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="İşletme sloganı"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSave('business')}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'accounts' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Hesap Yönetimi</h3>
                
                {/* Real Admins */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4">Yönetici Hesapları</h4>
                  <div className="space-y-3">
                    {(adminSettings.admins || []).map((admin) => (
                      <AdminAccountCard
                        key={admin.id}
                        account={admin}
                        onUpdate={(field, value) => updateAdmin(admin.id, field, value)}
                        onDelete={() => deleteAdmin(admin.id)}
                        type="admin"
                      />
                    ))}
                  </div>
                </div>

                {/* Demo Accounts */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4">Demo Hesaplar</h4>
                  <div className="space-y-3">
                    {(adminSettings.demoAccounts || []).map((account) => (
                      <AdminAccountCard
                        key={account.id}
                        account={account}
                        onUpdate={(field, value) => updateDemoAccount(account.id, field, value)}
                        onDelete={() => deleteDemoAccount(account.id)}
                        type="demo"
                      />
                    ))}
                  </div>
                </div>

                {/* Add New Account Form */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Yeni Hesap Ekle</h4>
                  <AdminAccountForm
                    formData={{
                      name: adminSettings.newAdminName,
                      email: adminSettings.newAdminEmail,
                      username: adminSettings.newAdminUsername,
                      password: adminSettings.newAdminPassword,
                      type: adminSettings.newAdminType
                    }}
                    onFieldChange={(field, value) => 
                      setAdminSettings(prev => ({ ...prev, [field]: value }))
                    }
                    onSubmit={addAdmin}
                    submitText="Hesap Ekle"
                    type={adminSettings.newAdminType}
                  />
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Fiyat Ayarları</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Fiyatları Göster</h4>
                      <p className="text-sm text-gray-500">Müşterilere ürün fiyatlarını göster</p>
                    </div>
                    <ToggleSwitch
                      checked={priceSettings.showPrices}
                      onChange={(checked) => setPriceSettings(prev => ({ ...prev, showPrices: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Sadece Üyelere Fiyat Göster</h4>
                      <p className="text-sm text-gray-500">Fiyatları sadece kayıtlı müşterilere göster</p>
                    </div>
                    <ToggleSwitch
                      checked={priceSettings.showPricesOnlyToMembers}
                      onChange={(checked) => setPriceSettings(prev => ({ ...prev, showPricesOnlyToMembers: checked }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Sipariş Tutarı (₺)
                    </label>
                    <input
                      type="number"
                      value={priceSettings.minOrderAmount}
                      onChange={(e) => setPriceSettings(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSave('pricing')}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'units' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Birim Yönetimi</h3>
                
                <div className="space-y-4">
                  {customUnits.map((unit) => (
                    <div key={unit.id} className="flex items-center justify-between p-4 bg-slate-100 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">{unit.display}</h4>
                        <p className="text-sm text-gray-500">Kod: {unit.name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ToggleSwitch
                          checked={unit.active}
                          onChange={(checked) => updateCustomUnit(unit.id, 'active', checked)}
                        />
                        <button
                          onClick={() => deleteCustomUnit(unit.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setCustomUnits(prev => [...prev, { 
                      id: Date.now(), 
                      name: 'yeni_birim', 
                      display: 'Yeni Birim', 
                      active: true 
                    }])}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Yeni Birim Ekle
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenelAyarlar;
