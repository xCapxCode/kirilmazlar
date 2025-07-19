import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import SaticiHeader from '../../../../../shared/components/ui/SaticiHeader';
import Icon from '../../../../../shared/components/AppIcon';
import storage from '../../../../../core/storage/index.js';

const MusteriYonetimi = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'name'
  });

  // Veri yükleme
  useEffect(() => {
    loadData();
    
    // Real-time subscriptions
    const unsubscribeCustomers = storage.subscribe('customers', (newCustomers) => {
      setCustomers(newCustomers || []);
    });
    
    const unsubscribeOrders = storage.subscribe('customer_orders', (newOrders) => {
      setOrders(newOrders || []);
    });

    return () => {
      unsubscribeCustomers();
      unsubscribeOrders();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Müşterileri yükle
      let storedCustomers = await storage.get('customers', []);
      if (storedCustomers.length === 0) {
        console.log('🆕 Demo müşteriler oluşturuluyor...');
        storedCustomers = createDemoCustomers();
        await storage.set('customers', storedCustomers);
      }
      
      // Siparişleri yükle
      const storedOrders = await storage.get('customer_orders', []);
      
      setCustomers(storedCustomers);
      setOrders(storedOrders);
      console.log('✅ Müşteri yönetimi verileri yüklendi');
      
    } catch (error) {
      console.error('❌ Müşteri yönetimi veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Demo müşteriler oluştur
  const createDemoCustomers = () => {
    const demoCustomers = [
      {
        id: 1,
        name: 'Ahmet Yılmaz',
        email: 'ahmet@email.com',
        phone: '0532 123 4567',
        username: 'ahmet123',
        status: 'active',
        registeredAt: '2024-01-15T10:30:00Z',
        lastLoginAt: '2025-07-15T14:20:00Z',
        companyName: 'Yılmaz Market',
        companyTitle: 'Müdür',
        address: 'Atatürk Cad. No:45',
        city: 'İstanbul',
        district: 'Kadıköy',
        postalCode: '34710',
        accountType: 'business',
        avatar: null,
        notes: 'Düzenli müşteri, hızlı ödeme yapar'
      },
      {
        id: 2,
        name: 'Fatma Demir',
        email: 'fatma@email.com',
        phone: '0545 987 6543',
        username: 'fatma456',
        status: 'active',
        registeredAt: '2024-02-20T09:15:00Z',
        lastLoginAt: '2025-07-14T11:45:00Z',
        companyName: '',
        companyTitle: '',
        address: 'Cumhuriyet Mah. 123. Sk. No:78',
        city: 'Ankara',
        district: 'Çankaya',
        postalCode: '06690',
        accountType: 'personal',
        avatar: null,
        notes: 'Organik ürünleri tercih ediyor'
      },
      {
        id: 3,
        name: 'Mehmet Kaya',
        email: 'mehmet@email.com',
        phone: '0533 456 7890',
        username: 'mehmet789',
        status: 'active',
        registeredAt: '2024-03-10T16:45:00Z',
        lastLoginAt: '2025-07-16T08:30:00Z',
        companyName: 'Kaya Gıda Ltd.',
        companyTitle: 'Satın Alma Müdürü',
        address: 'Sanayi Sitesi 4. Blok No:12',
        city: 'İzmir',
        district: 'Bornova',
        postalCode: '35040',
        accountType: 'business',
        avatar: null,
        notes: 'Toplu sipariş veriyor, indirim bekliyor'
      },
      {
        id: 4,
        name: 'Ayşe Özkan',
        email: 'ayse@email.com',
        phone: '0542 111 2233',
        username: 'ayse321',
        status: 'active',
        registeredAt: '2024-04-05T12:20:00Z',
        lastLoginAt: '2025-07-13T19:15:00Z',
        companyName: '',
        companyTitle: '',
        address: 'Yeni Mah. 567. Cd. No:89',
        city: 'Bursa',
        district: 'Nilüfer',
        postalCode: '16110',
        accountType: 'personal',
        avatar: null,
        notes: 'Hafta sonları sipariş veriyor'
      },
      {
        id: 5,
        name: 'Emre Şahin',
        email: 'emre@email.com',
        phone: '0534 444 5566',
        username: 'emre555',
        status: 'inactive',
        registeredAt: '2024-05-12T14:10:00Z',
        lastLoginAt: '2025-06-20T10:00:00Z',
        companyName: 'Şahin Restaurant',
        companyTitle: 'Chef',
        address: 'Merkez Mah. Restaurant Sok. No:34',
        city: 'Antalya',
        district: 'Muratpaşa',
        postalCode: '07100',
        accountType: 'business',
        avatar: null,
        notes: 'Uzun süredir pasif'
      }
    ];

    // 100+ müşteri için daha fazla demo veri
    for (let i = 6; i <= 120; i++) {
      const isActive = Math.random() > 0.2; // %80 aktif
      const isBusiness = Math.random() > 0.6; // %40 kurumsal
      const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Gaziantep', 'Konya', 'Kayseri', 'Trabzon'];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      demoCustomers.push({
        id: i,
        name: `Müşteri ${i}`,
        email: `musteri${i}@email.com`,
        phone: `05${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
        username: `musteri${i}`,
        status: isActive ? 'active' : 'inactive',
        registeredAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        lastLoginAt: new Date(2025, 6, Math.floor(Math.random() * 16) + 1).toISOString(),
        companyName: isBusiness ? `${i}. Şirket Ltd.` : '',
        companyTitle: isBusiness ? ['Müdür', 'Satın Alma Uzmanı', 'CEO', 'Muhasebeci'][Math.floor(Math.random() * 4)] : '',
        address: `Adres ${i} Mah. ${Math.floor(Math.random() * 500) + 1}. Sk. No:${Math.floor(Math.random() * 100) + 1}`,
        city: city,
        district: `${city} Merkez`,
        postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        accountType: isBusiness ? 'business' : 'personal',
        avatar: null,
        notes: `Demo müşteri ${i}`
      });
    }

    return demoCustomers;
  };

  // Müşteri istatistikleri
  const customerStats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active').length;
    const inactive = customers.filter(c => c.status === 'inactive').length;
    const business = customers.filter(c => c.accountType === 'business').length;
    const personal = customers.filter(c => c.accountType === 'personal').length;

    return { total, active, inactive, business, personal };
  }, [customers]);

  // Müşteri sipariş istatistikleri
  const enhancedCustomers = useMemo(() => {
    return customers.map(customer => {
      const customerOrders = orders.filter(order => order.customerId === customer.id);
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const lastOrder = customerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      return {
        ...customer,
        orderCount: customerOrders.length,
        totalSpent,
        lastOrderDate: lastOrder?.createdAt || null,
        lastOrderStatus: lastOrder?.status || 'Henüz sipariş yok',
        lastOrderAmount: lastOrder?.total || 0,
        averageOrderValue: customerOrders.length > 0 ? totalSpent / customerOrders.length : 0
      };
    });
  }, [customers, orders]);

  // Filtreleme
  const filteredCustomers = useMemo(() => {
    let filtered = enhancedCustomers;

    // Arama filtresi
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(filters.search) ||
        customer.username.toLowerCase().includes(searchLower) ||
        customer.companyName.toLowerCase().includes(searchLower) ||
        customer.city.toLowerCase().includes(searchLower)
      );
    }

    // Durum filtresi
    if (filters.status) {
      filtered = filtered.filter(customer => customer.status === filters.status);
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'tr');
        case 'orders':
          return b.orderCount - a.orderCount;
        case 'spent':
          return b.totalSpent - a.totalSpent;
        case 'date':
          return new Date(b.registeredAt) - new Date(a.registeredAt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [enhancedCustomers, filters]);

  // Sayfalama
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Para formatı
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  // Tarih formatı
  const formatDate = (dateString) => {
    if (!dateString) return 'Bilinmiyor';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Excel export
  const handleExportToExcel = () => {
    const data = filteredCustomers.map(customer => ({
      'Müşteri Adı': customer.name,
      'E-posta': customer.email,
      'Telefon': customer.phone,
      'Şehir': customer.city,
      'Hesap Türü': customer.accountType === 'business' ? 'Kurumsal' : 'Bireysel',
      'Durum': customer.status === 'active' ? 'Aktif' : 'Pasif',
      'Kayıt Tarihi': formatDate(customer.registeredAt),
      'Sipariş Sayısı': customer.orderCount,
      'Toplam Harcama': customer.totalSpent,
      'Son Sipariş': formatDate(customer.lastOrderDate)
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `musteriler_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Müşteri yönetimi yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile || (userProfile.role !== 'seller' && userProfile.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600">Bu panele erişmek için satıcı yetkilerine sahip olmanız gerekir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <SaticiHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık ve Eylemler */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Icon name="Users" size={24} className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Müşteri Yönetimi</h1>
                <p className="text-gray-600 mt-1">
                  Toplam {customerStats.total} müşteri • {currentCustomers.length} görüntüleniyor
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportToExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Icon name="Download" size={18} />
                <span>Excel İndir</span>
              </button>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="Users" size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Müşteri</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="CheckCircle" size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aktif Müşteri</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="XCircle" size={24} className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pasif Müşteri</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.inactive}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="Building" size={24} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Kurumsal</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.business}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="User" size={24} className="text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Bireysel</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.personal}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Müşteri ara (ad, email, telefon, şehir...)"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>

            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">İsme Göre</option>
                <option value="orders">Sipariş Sayısına Göre</option>
                <option value="spent">Harcamaya Göre</option>
                <option value="date">Kayıt Tarihine Göre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Müşteri Kartları */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {currentCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Users" size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Müşteri bulunamadı</h3>
              <p className="text-gray-600">Arama kriterlerinizi değiştirmeyi deneyin.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {currentCustomers.map(customer => (
                  <div key={customer.id} className="bg-slate-100 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{customer.name}</h3>
                        <p className="text-xs text-gray-600 truncate">{customer.email}</p>
                        <p className="text-xs text-gray-600">{customer.phone}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.status === 'active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Hesap:</span>
                        <span className={`px-2 py-1 rounded-full ${
                          customer.accountType === 'business' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {customer.accountType === 'business' ? 'Kurumsal' : 'Bireysel'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Sipariş:</span>
                        <span className="font-medium">{customer.orderCount} adet</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Harcama:</span>
                        <span className="font-medium text-green-600">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Şehir:</span>
                        <span className="font-medium">{customer.city}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowDetailModal(true);
                        }}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-transparent border border-blue-600 text-blue-600 text-xs rounded hover:bg-blue-600/10 transition-colors font-medium"
                      >
                        <Icon name="Eye" size={12} />
                        <span>Detay</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          // Sipariş geçmişi modal'ı burada açılacak
                        }}
                        className="flex items-center justify-center px-3 py-2 bg-transparent border border-green-600 text-green-600 text-xs rounded hover:bg-green-600/10 transition-colors font-medium"
                      >
                        <Icon name="ShoppingBag" size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Sayfa {currentPage} / {totalPages} ({filteredCustomers.length} müşteri)
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm bg-white/80 border border-gray-300 rounded hover:bg-gray-50/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Önceki
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm bg-white/80 border border-gray-300 rounded hover:bg-gray-50/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sonraki
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Müşteri Detay Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-slate-100 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Müşteri Detayları</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temel Bilgiler */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Temel Bilgiler</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Ad Soyad:</span> <span className="font-medium">{selectedCustomer.name}</span></div>
                  <div><span className="text-gray-600">E-posta:</span> <span className="font-medium">{selectedCustomer.email}</span></div>
                  <div><span className="text-gray-600">Telefon:</span> <span className="font-medium">{selectedCustomer.phone}</span></div>
                  <div><span className="text-gray-600">Kullanıcı Adı:</span> <span className="font-medium">{selectedCustomer.username}</span></div>
                  <div><span className="text-gray-600">Hesap Türü:</span> <span className="font-medium">{selectedCustomer.accountType === 'business' ? 'Kurumsal' : 'Bireysel'}</span></div>
                  <div><span className="text-gray-600">Durum:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      selectedCustomer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedCustomer.status === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Adres Bilgileri */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Adres Bilgileri</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Adres:</span> <span className="font-medium">{selectedCustomer.address}</span></div>
                  <div><span className="text-gray-600">Şehir:</span> <span className="font-medium">{selectedCustomer.city}</span></div>
                  <div><span className="text-gray-600">İlçe:</span> <span className="font-medium">{selectedCustomer.district}</span></div>
                  <div><span className="text-gray-600">Posta Kodu:</span> <span className="font-medium">{selectedCustomer.postalCode}</span></div>
                </div>
              </div>

              {/* Sipariş İstatistikleri */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Sipariş İstatistikleri</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Toplam Sipariş:</span> <span className="font-medium">{selectedCustomer.orderCount} adet</span></div>
                  <div><span className="text-gray-600">Toplam Harcama:</span> <span className="font-medium text-green-600">{formatCurrency(selectedCustomer.totalSpent)}</span></div>
                  <div><span className="text-gray-600">Ortalama Sipariş:</span> <span className="font-medium">{formatCurrency(selectedCustomer.averageOrderValue)}</span></div>
                  <div><span className="text-gray-600">Son Sipariş:</span> <span className="font-medium">{formatDate(selectedCustomer.lastOrderDate)}</span></div>
                </div>
              </div>

              {/* Diğer Bilgiler */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Diğer Bilgiler</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Kayıt Tarihi:</span> <span className="font-medium">{formatDate(selectedCustomer.registeredAt)}</span></div>
                  <div><span className="text-gray-600">Son Giriş:</span> <span className="font-medium">{formatDate(selectedCustomer.lastLoginAt)}</span></div>
                  {selectedCustomer.companyName && (
                    <>
                      <div><span className="text-gray-600">Şirket:</span> <span className="font-medium">{selectedCustomer.companyName}</span></div>
                      <div><span className="text-gray-600">Ünvan:</span> <span className="font-medium">{selectedCustomer.companyTitle}</span></div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {selectedCustomer.notes && (
              <div className="mt-6 space-y-2">
                <h4 className="font-medium text-gray-900 border-b pb-2">Notlar</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedCustomer.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusteriYonetimi;
