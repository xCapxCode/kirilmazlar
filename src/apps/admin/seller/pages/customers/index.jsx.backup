import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@contexts/AuthContext';
import SaticiHeader from '@shared/components/ui/SaticiHeader';
import Icon from '@shared/components/AppIcon';
import MusteriGecmisiModali from './components/MusteriGecmisiModali';
import { 
  getAllRegisteredUsers, 
  createUserByAdmin, 
  updateUser, 
  deleteUser, 
  toggleUserStatus,
  getCurrentAuthUser
} from '@shared/utils/realAuthSystem';

const MusteriYonetimi = () => {
  const { user, isSellerLoggedIn, authLoading } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    city: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Gerçek kullanıcı sisteminden müşterileri yükle
  useEffect(() => {
    const loadCustomers = () => {
      try {
        const allUsers = getAllRegisteredUsers();
        const customerUsers = allUsers.filter(user => user.role === 'customer');
        
        // Müşteri formatına dönüştür
        const formattedCustomers = customerUsers.map(user => ({
          id: user.id,
          name: user.name,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          username: user.username,
          password: user.password, // Güvenlik için normal uygulamada gösterilmez
          status: user.isActive ? 'active' : 'inactive',
          registeredAt: user.createdAt,
          lastLoginAt: user.loginTime || user.createdAt,
          orderCount: 0, // Bu bilgiler siparişlerden hesaplanabilir
          totalSpent: 0,
          lastOrderDate: null,
          lastOrderStatus: 'Henüz sipariş yok',
          lastOrderAmount: 0,
          averageOrderValue: 0,
          companyName: user.customerInfo?.companyName || '',
          companyTitle: user.customerInfo?.companyTitle || '',
          taxOffice: user.customerInfo?.taxOffice || '',
          taxNumber: user.customerInfo?.taxNumber || '',
          address: user.customerInfo?.address || '',
          city: user.customerInfo?.city || '',
          district: user.customerInfo?.district || '',
          postalCode: user.customerInfo?.postalCode || '',
          notes: user.customerInfo?.notes || '',
          accountType: user.customerInfo?.companyName ? 'business' : 'personal',
          avatar: user.avatar,
          preferences: user.customerInfo?.preferences || {
            notifications: true,
            smsUpdates: true,
            emailUpdates: true
          }
        }));
        
        setCustomers(formattedCustomers);
        setLoading(false);
      } catch (error) {
        console.error('Müşteriler yüklenirken hata:', error);
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // Müşteri listesini yenileme fonksiyonu
  const refreshCustomers = () => {
    const allUsers = getAllRegisteredUsers();
    const customerUsers = allUsers.filter(user => user.role === 'customer');
    
    const formattedCustomers = customerUsers.map(user => ({
      id: user.id,
      name: user.name,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      username: user.username,
      password: user.password,
      status: user.isActive ? 'active' : 'inactive',
      registeredAt: user.createdAt,
      lastLoginAt: user.loginTime || user.createdAt,
      orderCount: 0,
      totalSpent: 0,
      lastOrderDate: null,
      lastOrderStatus: 'Henüz sipariş yok',
      lastOrderAmount: 0,
      averageOrderValue: 0,
      companyName: user.customerInfo?.companyName || '',
      companyTitle: user.customerInfo?.companyTitle || '',
      taxOffice: user.customerInfo?.taxOffice || '',
      taxNumber: user.customerInfo?.taxNumber || '',
      address: user.customerInfo?.address || '',
      city: user.customerInfo?.city || '',
      district: user.customerInfo?.district || '',
      postalCode: user.customerInfo?.postalCode || '',
      notes: user.customerInfo?.notes || '',
      accountType: user.customerInfo?.companyName ? 'business' : 'personal',
      avatar: user.avatar,
      preferences: user.customerInfo?.preferences || {
        notifications: true,
        smsUpdates: true,
        emailUpdates: true
      }
    }));
    
    setCustomers(formattedCustomers);
  };

  // Filtrelenmiş ve sıralanmış müşteriler
  const filteredCustomers = useMemo(() => {
    let filtered = [...customers];

    // Arama filtresi
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.phone.includes(filters.search) ||
        customer.email.toLowerCase().includes(searchLower) ||
        (customer.companyName && customer.companyName.toLowerCase().includes(searchLower))
      );
    }

    // Durum filtresi
    if (filters.status) {
      filtered = filtered.filter(customer => customer.status === filters.status);
    }

    // Şehir filtresi
    if (filters.city) {
      filtered = filtered.filter(customer => customer.city === filters.city);
    }

    // Sıralama
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (filters.sortBy === 'registeredAt' || filters.sortBy === 'lastOrderDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [customers, filters]);

  // Mevcut müşterilerdeki benzersiz şehirler
  const availableCities = useMemo(() => {
    const cities = customers
      .map(customer => customer.city)
      .filter(city => city && city.trim() !== '') // Boş şehirleri filtrele
      .filter((city, index, array) => array.indexOf(city) === index) // Benzersiz şehirler
      .sort(); // Alfabetik sıralama
    return cities;
  }, [customers]);

  // Sayfalama
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Şehir adını büyük harfe çeviren fonksiyon
  const capitalizeCity = (city) => {
    return city
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      city: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setCurrentPage(1);
  };

  const handleClearLocalStorage = () => {
    if (window.confirm('TÜM VERİLERİ TEMİZLEMEK İSTEDİĞİNİZDEN EMİN MİSİNİZ?\n\nBu işlem:\n- Tüm kullanıcı hesaplarını\n- Tüm sistem verilerini\n- Tüm cache\'i temizleyecek\n\nBu işlem GERİ ALINAMAZ!')) {
      // Tüm localStorage verilerini temizle
      localStorage.clear();
      
      // Toast bildirimi (eğer mevcut ise)
      try {
        const event = new CustomEvent('showToast', {
          detail: { 
            message: 'Tüm veriler temizlendi. Sayfa yenileniyor...', 
            type: 'warning' 
          }
        });
        window.dispatchEvent(event);
      } catch (e) {
        console.log('Toast bildirimi gösterilemedi');
      }
      
      // Sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleViewHistory = (customer) => {
    setSelectedCustomer(customer);
    setShowHistoryModal(true);
  };

  const handleNewCustomer = () => {
    setSelectedCustomer(null); // Yeni müşteri için null
    setShowDetailModal(true);
  };

  const handleDeleteCustomer = (customerId) => {
    if (window.confirm('Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        deleteUser(customerId);
        refreshCustomers();
        
        // Toast bildirimi (eğer mevcut ise)
        try {
          const event = new CustomEvent('showToast', {
            detail: { 
              message: 'Müşteri başarıyla silindi', 
              type: 'success' 
            }
          });
          window.dispatchEvent(event);
        } catch (e) {
          console.log('Toast bildirimi gösterilemedi');
        }
      } catch (error) {
        console.error('Müşteri silinirken hata:', error);
        alert(error.message || 'Müşteri silinirken hata oluştu');
      }
    }
  };

  const handleSaveCustomer = (customerData) => {
    try {
      if (customerData.id) {
        // Müşteri güncelle
        const updateData = {
          name: customerData.name,
          fullName: customerData.fullName || customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          username: customerData.username,
          isActive: customerData.status === 'active',
          customerInfo: {
            companyName: customerData.companyName || '',
            companyTitle: customerData.companyTitle || '',
            taxOffice: customerData.taxOffice || '',
            taxNumber: customerData.taxNumber || '',
            address: customerData.address || '',
            city: customerData.city || '',
            district: customerData.district || '',
            postalCode: customerData.postalCode || '',
            notes: customerData.notes || '',
            preferences: customerData.preferences || {
              notifications: true,
              smsUpdates: true,
              emailUpdates: true
            }
          }
        };
        
        // Şifre varsa ekle
        if (customerData.password) {
          updateData.password = customerData.password;
        }
        
        updateUser(customerData.id, updateData);
          // Toast bildirimi
        try {
          const event = new CustomEvent('showToast', {
            detail: {
              message: 'Müşteri bilgileri başarıyla güncellendi',
              type: 'success'
            }
          });
          window.dispatchEvent(event);
        } catch (e) {
          console.log('Toast bildirimi gösterilemedi');
        }
        
        // Trigger cross-tab communication
        window.dispatchEvent(new CustomEvent('customersUpdated'));
        
      } else {
        // Yeni müşteri oluştur
        const newUserData = {
          name: customerData.name,
          fullName: customerData.fullName || customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          username: customerData.username,
          password: customerData.password,
          role: 'customer',
          companyName: customerData.companyName || '',
          companyTitle: customerData.companyTitle || '',
          taxOffice: customerData.taxOffice || '',
          taxNumber: customerData.taxNumber || '',
          address: customerData.address || '',
          city: customerData.city || '',
          district: customerData.district || '',
          postalCode: customerData.postalCode || '',
          notes: customerData.notes || ''
        };
        
        createUserByAdmin(newUserData);
        
        // Toast bildirimi
        try {
          const event = new CustomEvent('showToast', {
            detail: { 
              message: 'Yeni müşteri başarıyla oluşturuldu', 
              type: 'success' 
            }
          });
          window.dispatchEvent(event);
        } catch (e) {
          console.log('Toast bildirimi gösterilemedi');
        }
        
        // Trigger cross-tab communication
        window.dispatchEvent(new CustomEvent('customersUpdated'));
      }
      
      // Müşteri listesini yenile
      refreshCustomers();
      setShowDetailModal(false);
      
    } catch (error) {
      console.error('Müşteri kaydedilirken hata:', error);
      alert(error.message || 'Müşteri kaydedilirken hata oluştu');
    }
  };

  // Cross-tab communication for customers
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'registeredUsers') {
        loadCustomers();
        console.log('🔄 Customers updated from another tab');
      }
    };

    const handleCustomersUpdated = () => {
      loadCustomers();
      console.log('🔄 Customers updated from same tab');
    };

    // Listen for storage events (cross-tab)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events (same-tab)
    window.addEventListener('customersUpdated', handleCustomersUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customersUpdated', handleCustomersUpdated);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Müşteriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <SaticiHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık Bandı - Standart Tasarım */}
        <div className="bg-slate-100 rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Icon name="Users" size={24} className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Müşteri Yönetimi</h1>
                <p className="text-gray-600 mt-1">Müşterilerinizi görüntüleyin ve yönetin</p>
              </div>
            </div>
            
            {/* Hızlı Eylemler */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleNewCustomer}
                className="flex items-center space-x-2 px-4 py-2 bg-transparent border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-600/10 transition-colors font-medium"
              >
                <Icon name="Plus" size={18} />
                <span>Yeni Müşteri</span>
              </button>
              
              <button 
                onClick={handleClearLocalStorage}
                className="flex items-center space-x-2 px-4 py-2 bg-transparent border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-600/10 transition-colors font-medium"
                title="Tüm verileri sil ve baştan başla"
              >
                <Icon name="RotateCcw" size={18} />
                <span>Sıfırla</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-transparent border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600/10 transition-colors font-medium">
                <Icon name="Download" size={18} />
                <span>Dışa Aktar</span>
              </button>
            </div>
          </div>
        </div>

        {/* İstatistikler - Modern Kartlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-slate-100 rounded-xl p-6 border border-gray-100 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Toplam Müşteri</p>
                <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <Icon name="TrendingUp" size={12} className="mr-1" />
                  Aktif sistem
                </p>
              </div>
              <div className="p-3">
                <Icon name="Users" size={28} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-xl p-6 border border-gray-100 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Aktif Müşteri</p>
                <p className="text-3xl font-bold text-green-600">{customers.filter(c => c.status === 'active').length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  %{Math.round((customers.filter(c => c.status === 'active').length / customers.length) * 100)} oranında
                </p>
              </div>
              <div className="p-3">
                <Icon name="CheckCircle" size={28} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-xl p-6 border border-gray-100 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">VIP Müşteri</p>
                <p className="text-3xl font-bold text-amber-600">{customers.filter(c => c.status === 'vip').length}</p>
                <p className="text-xs text-amber-600 mt-1 flex items-center">
                  <Icon name="Crown" size={12} className="mr-1" />
                  Özel statü
                </p>
              </div>
              <div className="p-3">
                <Icon name="Star" size={28} className="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-xl p-6 border border-gray-100 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Toplam Gelir</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}</p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center">
                  <Icon name="ArrowUp" size={12} className="mr-1" />
                  Büyüyen trend
                </p>
              </div>
              <div className="p-3">
                <Icon name="DollarSign" size={28} className="text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-xl p-6 border border-gray-100 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Ort. Sipariş</p>
                <p className="text-2xl font-bold text-purple-600">
                  {customers.length > 0 ? formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length) : formatCurrency(0)}
                </p>
                <p className="text-xs text-purple-600 mt-1 flex items-center">
                  <Icon name="BarChart3" size={12} className="mr-1" />
                  Ortalama değer
                </p>
              </div>
              <div className="p-3">
                <Icon name="ShoppingCart" size={28} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtreler - Geliştirilmiş Tasarım */}
        <div className="bg-slate-100 rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2">
                <Icon name="Filter" size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Filtreler & Arama</h3>
            </div>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {filteredCustomers.length} sonuç bulundu
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Arama */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Icon name="Search" size={16} className="inline mr-2 text-gray-500" />
                Genel Arama
              </label>
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                  placeholder="Ad, telefon, e-posta, şirket..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                />
                {filters.search && (
                  <button
                    onClick={() => handleFilterChange({ ...filters, search: '' })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="X" size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Durum */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Icon name="Users" size={16} className="inline mr-2 text-gray-500" />
                Müşteri Durumu
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange({ ...filters, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Tüm Durumlar</option>
                <option value="active">✅ Aktif</option>
                <option value="vip">⭐ VIP</option>
                <option value="inactive">⏸️ Pasif</option>
              </select>
            </div>

            {/* Şehir */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Icon name="MapPin" size={16} className="inline mr-2 text-gray-500" />
                Şehir
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange({ ...filters, city: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Tüm Şehirler</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>📍 {capitalizeCity(city)}</option>
                ))}
              </select>
            </div>

            {/* Sıralama */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Icon name="ArrowUpDown" size={16} className="inline mr-2 text-gray-500" />
                Sıralama
              </label>
              <div className="flex space-x-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="name">Ad Soyad</option>
                  <option value="orderCount">Sipariş Sayısı</option>
                  <option value="totalSpent">Toplam Harcama</option>
                  <option value="lastOrderDate">Son Sipariş</option>
                  <option value="registeredAt">Kayıt Tarihi</option>
                </select>
                <button
                  onClick={() => handleFilterChange({ 
                    ...filters, 
                    sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                  })}
                  className="px-3 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
                  title={filters.sortOrder === 'asc' ? 'Artan sıralama' : 'Azalan sıralama'}
                >
                  <Icon name={filters.sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'} size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Filtre Butonları */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-700">
                Toplam <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{filteredCustomers.length}</span> müşteri listelendi
              </div>
              {(filters.search || filters.status || filters.city) && (
                <div className="text-xs text-gray-500">
                  Aktif filtre var
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleResetFilters}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-300"
              >
                <Icon name="RotateCcw" size={16} />
                <span>Filtreleri Sıfırla</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 rounded-xl transition-all duration-200">
                <Icon name="Download" size={16} />
                <span>Listeyi İndir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Müşteri Listesi - Tek Sıra Kartlar */}
        <div className="space-y-4 mb-6">
          {paginatedCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
              onViewHistory={() => {
                setSelectedCustomer(customer);
                setShowHistoryModal(true);
              }}
            />
          ))}
        </div>

        {/* Sayfalama - Modern Tasarım */}
        {totalPages > 1 && (
          <div className="bg-slate-100 rounded-xl border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              {/* Sol taraf - Sayfa bilgisi */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Icon name="FileText" size={16} className="text-gray-400" />
                  <span>
                    Sayfa <span className="font-semibold text-gray-800">{currentPage}</span> / 
                    <span className="font-semibold text-gray-800">{totalPages}</span>
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <Icon name="Users" size={16} className="text-gray-400" />
                  <span>
                    Toplam <span className="font-semibold text-gray-800">{filteredCustomers.length}</span> müşteri
                  </span>
                </div>
              </div>

              {/* Orta - Sayfalama butonları */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  title="İlk sayfa"
                >
                  <Icon name="ChevronsLeft" size={16} />
                </button>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  title="Önceki sayfa"
                >
                  <Icon name="ChevronLeft" size={16} />
                </button>

                {/* Sayfa numaraları */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  title="Sonraki sayfa"
                >
                  <Icon name="ChevronRight" size={16} />
                </button>
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  title="Son sayfa"
                >
                  <Icon name="ChevronsRight" size={16} />
                </button>
              </div>

              {/* Sağ taraf - Sayfa başına öğe seçimi */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Sayfa başına:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    // Bu özellik şimdilik static, ileride geliştirilebir
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showDetailModal && (
        <CustomerDetailModal
          customer={selectedCustomer}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onSave={handleSaveCustomer}
          availableCities={availableCities}
        />
      )}

      {showHistoryModal && (
        <MusteriGecmisiModali
          customer={selectedCustomer}
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
};

// Müşteri Kartı Component - Modern ve İyileştirilmiş Tasarım
const CustomerCard = ({ customer, onEdit, onDelete, onViewHistory }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('tr-TR', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'active': 
        return { 
          color: 'text-green-700 bg-green-100 border-green-200', 
          text: 'Aktif',
          icon: 'CheckCircle'
        };
      case 'inactive': 
        return { 
          color: 'text-gray-700 bg-gray-100 border-gray-200', 
          text: 'Pasif',
          icon: 'XCircle'
        };
      case 'vip': 
        return { 
          color: 'text-amber-700 bg-amber-100 border-amber-200', 
          text: 'VIP',
          icon: 'Crown'
        };
      default: 
        return { 
          color: 'text-gray-700 bg-gray-100 border-gray-200', 
          text: 'Bilinmiyor',
          icon: 'AlertCircle'
        };
    }
  };

  const getAccountTypeConfig = (type) => {
    return type === 'business' 
      ? { text: 'Kurumsal', icon: 'Building2', color: 'text-blue-600' }
      : { text: 'Bireysel', icon: 'User', color: 'text-purple-600' };
  };

  const getOrderStatusConfig = (status) => {
    switch(status) {
      case 'Teslim Edildi': return 'bg-green-100 text-green-800 border-green-200';
      case 'Hazırlanıyor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Onaylandı': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'İptal Edildi': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const statusConfig = getStatusConfig(customer.status);
  const accountTypeConfig = getAccountTypeConfig(customer.accountType);

  return (
    <div className="bg-slate-100 rounded-xl border border-gray-200 p-6">
      {/* ÜST KISIM - Profil, Durum ve Hızlı Eylemler */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
              {getInitials(customer.name)}
            </div>
            {customer.status === 'vip' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                <Icon name="Crown" size={12} className="text-amber-800" />
              </div>
            )}
          </div>
          
          {/* İsim, Şirket ve Temel Bilgiler */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                {customer.name}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                <Icon name={statusConfig.icon} size={12} className="inline mr-1" />
                {statusConfig.text}
              </span>
            </div>
            
            {customer.companyName && (
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Icon name={accountTypeConfig.icon} size={14} className={`mr-2 ${accountTypeConfig.color}`} />
                <span className="font-medium">{customer.companyName}</span>
                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">{accountTypeConfig.text}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Icon name="Phone" size={12} className="mr-1" />
                <span>{customer.phone}</span>
              </div>
              {customer.city && (
                <div className="flex items-center">
                  <Icon name="MapPin" size={12} className="mr-1" />
                  <span>{customer.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Hızlı Eylem Butonları */}
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(customer)}
            className="p-2 text-blue-600 rounded-lg bg-transparent"
            title="Düzenle"
          >
            <Icon name="Edit2" size={18} />
          </button>
          
          <button 
            className="p-2 text-green-600 rounded-lg bg-transparent"
            title="Mesaj Gönder"
          >
            <Icon name="MessageCircle" size={18} />
          </button>
          
          <button 
            className="p-2 text-purple-600 rounded-lg bg-transparent"
            title="Arama Yap"
          >
            <Icon name="Phone" size={18} />
          </button>
        </div>
      </div>

      {/* ORTA KISIM - Gelişmiş İstatistik Kartları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        
        {/* Hesap Bilgileri Kartı */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-blue-800 flex items-center">
              <Icon name="User" size={16} className="mr-2" />
              Hesap Detayları
            </h4>
            <Icon name="Info" size={14} className="text-blue-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-600">Kullanıcı:</span>
              <span className="text-xs font-semibold text-blue-800 bg-blue-200 px-2 py-1 rounded">{customer.username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-600">Kayıt:</span>
              <span className="text-xs text-blue-700">{formatDateShort(customer.registeredAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-600">Son Giriş:</span>
              <span className="text-xs text-blue-700">{formatDateShort(customer.lastLoginAt)}</span>
            </div>
          </div>
        </div>

        {/* Sipariş İstatistikleri Kartı */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-green-800 flex items-center">
              <Icon name="ShoppingCart" size={16} className="mr-2" />
              Sipariş Özeti
            </h4>
            <Icon name="TrendingUp" size={14} className="text-green-600" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center bg-slate-100 rounded-lg p-2">
              <div className="text-lg font-bold text-green-700">{customer.orderCount}</div>
              <div className="text-xs text-green-600">Toplam Sipariş</div>
            </div>
            <div className="text-center bg-slate-100 rounded-lg p-2">
              <div className="text-lg font-bold text-green-700">{formatCurrency(customer.averageOrderValue)}</div>
              <div className="text-xs text-green-600">Ortalama</div>
            </div>
          </div>
        </div>


      </div>

      {/* SON SİPARİŞ BİLGİSİ - Gelişmiş */}
      {customer.lastOrderDate && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center">
              <Icon name="Package" size={16} className="mr-2 text-gray-600" />
              Son Sipariş Detayı
            </h4>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getOrderStatusConfig(customer.lastOrderStatus)}`}>
              {customer.lastOrderStatus}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{formatCurrency(customer.lastOrderAmount)}</div>
                <div className="text-xs text-gray-500">Sipariş Tutarı</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-700">{formatDateShort(customer.lastOrderDate)}</div>
                <div className="text-xs text-gray-500">Tarih</div>
              </div>
            </div>
            <button className="text-blue-600 text-sm font-medium bg-transparent">
              Detayları Gör
            </button>
          </div>
        </div>
      )}

      {/* ALT KISIM - Notlar ve Ana Eylemler */}
      <div className="flex items-center justify-between">
        {/* Sol taraf - Notlar */}
        <div className="flex-1 mr-4">
          {customer.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Icon name="StickyNote" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800 line-clamp-2 font-medium">{customer.notes}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Sağ taraf - Ana Eylem Butonları */}
        <div className="flex space-x-3 flex-shrink-0">
          <button
            onClick={() => onEdit(customer)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600/80 text-white rounded-lg border border-blue-600"
          >
            <Icon name="Edit2" size={16} />
            <span className="font-medium">Düzenle</span>
          </button>
          
          <button 
            onClick={() => onDelete(customer.id)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600/80 text-white rounded-lg border border-red-600"
          >
            <Icon name="Trash2" size={16} />
            <span className="font-medium">Sil</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600/80 text-white rounded-lg border border-green-600">
            <Icon name="MessageCircle" size={16} />
            <span className="font-medium">İletişim</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Müşteri Detay Modal Component
const CustomerDetailModal = ({ customer, isOpen, onClose, onSave, availableCities }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [changePasswordChecked, setChangePasswordChecked] = useState(false);
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    companyName: customer?.companyName || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    username: customer?.username || '',
    password: customer?.password || '',
    accountType: customer?.accountType || 'personal',
    status: customer?.status || 'active',
    address: customer?.address || '',
    city: customer?.city || '',
    district: customer?.district || '',
    postalCode: customer?.postalCode || '',
    taxOffice: customer?.taxOffice || '',
    taxNumber: customer?.taxNumber || '',
    companyTitle: customer?.companyTitle || '',
    notes: customer?.notes || ''
  });

  // Şehir adını büyük harfe çeviren fonksiyon
  const capitalizeCity = (city) => {
    return city
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Customer prop değiştiğinde formData'yı güncelle
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        companyName: customer.companyName || '',
        phone: customer.phone || '',
        email: customer.email || '',
        username: customer.username || '',
        password: customer.password || '',
        accountType: customer.accountType || 'personal',
        status: customer.status || 'active',
        address: customer.address || '',
        city: customer.city || '',
        district: customer.district || '',
        postalCode: customer.postalCode || '',
        taxOffice: customer.taxOffice || '',
        taxNumber: customer.taxNumber || '',
        companyTitle: customer.companyTitle || '',
        notes: customer.notes || ''
      });
    } else {
      // Yeni müşteri için boş form
      setFormData({
        name: '',
        companyName: '',
        phone: '',
        email: '',
        username: '',
        password: '',
        accountType: 'personal',
        status: 'active',
        address: '',
        city: '',
        district: '',
        postalCode: '',
        taxOffice: '',
        taxNumber: '',
        companyTitle: '',
        notes: ''
      });
    }
  }, [customer]);

  // Şehir değişikliğini handle eden fonksiyon
  const handleCityChange = (e) => {
    const cityValue = e.target.value;
    const capitalizedCity = capitalizeCity(cityValue);
    setFormData({ ...formData, city: capitalizedCity });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...customer, ...formData });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-slate-100 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-slate-100 z-10 flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {customer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <Icon name="X" size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Kişisel Bilgiler */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kişisel Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 bg-transparent"
                  >
                    <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
                  </button>
                </div>
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    id="changePassword"
                    checked={changePasswordChecked}
                    onChange={(e) => setChangePasswordChecked(e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="changePassword" className="ml-2 block text-sm text-gray-700">
                    Şifreyi değiştir
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Mevcut şifre: {customer?.password ? (showPassword ? customer.password : '••••••••') : 'Belirtilmemiş'}
                  {changePasswordChecked && ' (Şifre değiştirilecek)'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hesap Tipi
                </label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="personal">Bireysel</option>
                  <option value="business">Kurumsal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Firma Bilgileri */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Firma Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firma Adı
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firma Ünvanı
                </label>
                <input
                  type="text"
                  value={formData.companyTitle}
                  onChange={(e) => setFormData({ ...formData, companyTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vergi Dairesi
                </label>
                <input
                  type="text"
                  value={formData.taxOffice}
                  onChange={(e) => setFormData({ ...formData, taxOffice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vergi Numarası
                </label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Adres Bilgileri */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Adres Bilgileri</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İl
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={handleCityChange}
                    placeholder="Şehir adı yazın"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    list="cities"
                  />
                  <datalist id="cities">
                    {availableCities.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İlçe
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posta Kodu
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notlar */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notlar</h3>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Müşteri hakkında notlar..."
            />
          </div>

          <div className="sticky bottom-0 bg-slate-100 pt-6 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg bg-transparent"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600/80 text-white rounded-lg border border-green-600"
              >
                Kaydet
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MusteriYonetimi;
