import storage from '@core/storage';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useModal } from '../../../../../contexts/ModalContext';
import { useNotification } from '../../../../../contexts/NotificationContext';
import customerService from '../../../../../services/customerService';
import Icon from '../../../../../shared/components/AppIcon';
import SaticiHeader from '../../../../../shared/components/ui/SaticiHeader';
import CustomerDetailModal from './components/CustomerDetailModal';
import CustomerStatusModal from './components/CustomerStatusModal';

// Basit Müşteri Ekleme Formu
const NewCustomerForm = ({ onSave, onCancel, showWarning }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    companyName: '',
    companyTitle: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    accountType: 'personal',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basit validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showWarning('Ad, email ve telefon alanları zorunludur!');
      return;
    }

    if (!formData.username.trim() || !formData.password.trim()) {
      showWarning('Kullanıcı adı ve şifre alanları zorunludur!');
      return;
    }

    // Form verilerini parent'a gönder
    onSave(formData);

    // Form verilerini temizle
    setFormData({
      name: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      companyName: '',
      companyTitle: '',
      address: '',
      city: '',
      district: '',
      postalCode: '',
      accountType: 'personal',
      notes: ''
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Temel Bilgiler */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Temel Bilgiler</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örn: Ahmet Yılmaz"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örn: ahmet@email.com"
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örn: 0532 123 4567"
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örn: ahmet123"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Müşteri şifresi"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Türü</label>
            <select
              value={formData.accountType}
              onChange={(e) => handleChange('accountType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="personal">Bireysel</option>
              <option value="business">Kurumsal</option>
            </select>
          </div>
        </div>

        {/* Adres ve Şirket Bilgileri */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Adres & Şirket Bilgileri</h4>

          {formData.accountType === 'business' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: ABC Ltd. Şti."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ünvan</label>
                <input
                  type="text"
                  value={formData.companyTitle}
                  onChange={(e) => handleChange('companyTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: Müdür, CEO"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              placeholder="Örn: Atatürk Cad. No:123"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="İstanbul"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Kadıköy"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="34000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Müşteri hakkında notlar..."
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Müşteri Ekle
        </button>
      </div>
    </form>
  );
};

// Müşteri düzenleme formu component'i
const EditCustomerForm = ({ customer, onSave, onCancel }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    username: customer.username || '',
    password: '', // Yeni şifre için boş başla
    companyName: customer.companyName || '',
    companyTitle: customer.companyTitle || '',
    address: customer.address || '',
    city: customer.city || '',
    district: customer.district || '',
    postalCode: customer.postalCode || '',
    accountType: customer.accountType || 'personal'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Sadece dolu olan alanları gönder
      const updateData = { ...formData };

      // Şifre boşsa update data'dan çıkar
      if (!updateData.password || updateData.password.trim() === '') {
        delete updateData.password;
      }

      await onSave({
        ...customer,
        ...updateData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Müşteri güncellenirken hata:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ad Soyad *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kullanıcı Adı *
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Şifre
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Boş bırakılırsa değişmez"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Şifreyi değiştirmek için yeni şifreyi girin</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-posta
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hesap Türü
          </label>
          <select
            value={formData.accountType}
            onChange={(e) => handleChange('accountType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="personal">Bireysel</option>
            <option value="business">Kurumsal</option>
          </select>
        </div>

        {formData.accountType === 'business' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şirket Adı
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ünvan
              </label>
              <input
                type="text"
                value={formData.companyTitle}
                onChange={(e) => handleChange('companyTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adres
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Şehir
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            İlçe
          </label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) => handleChange('district', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
        </button>
      </div>
    </form>
  );
};

const MusteriYonetimi = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { showConfirm } = useModal();
  const { showSuccess, showError, showWarning } = useNotification();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'name'
  });

  const [showPasswords, setShowPasswords] = useState({});

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
      console.log('🔄 loadData başlatılıyor...');

      // Müşterileri yükle
      const storedCustomers = await customerService.getAll();
      console.log('📋 customerService.getAll() sonucu:', storedCustomers.length, 'müşteri');

      // İlk 3 müşteriyi detaylı logla
      storedCustomers.slice(0, 3).forEach((customer, index) => {
        console.log(`🔍 Müşteri ${index + 1}:`, {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          username: customer.username
        });
      });

      // Siparişleri yükle
      const storedOrders = await storage.get('customer_orders', []);
      console.log('📋 storage.get customer_orders sonucu:', storedOrders.length, 'sipariş');

      console.log('📝 setCustomers çağrılıyor:', storedCustomers.length, 'müşteri');
      setCustomers(storedCustomers);
      setOrders(storedOrders);
      console.log('✅ Müşteri yönetimi verileri yüklendi');

    } catch (error) {
      console.error('❌ Müşteri yönetimi veri yükleme hatası:', error);
      showError('Müşteri verileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  // Müşteri durumu güncelleme
  const handleUpdateCustomerStatus = async (customerId, status, reason = '') => {
    try {
      const updatedCustomer = await customerService.updateStatus(customerId, status);

      if (!updatedCustomer) {
        throw new Error('Müşteri bulunamadı');
      }

      // Eğer engelleme nedeni varsa, müşteri notlarına ekle
      if (status === 'blocked' && reason) {
        await customerService.update(customerId, {
          notes: `${updatedCustomer.notes ? updatedCustomer.notes + '\n\n' : ''}Engelleme Nedeni (${new Date().toLocaleDateString('tr-TR')}): ${reason}`
        });
      }

      // Müşterileri yeniden yükle
      await loadData();

      showSuccess(`Müşteri durumu başarıyla güncellendi: ${getStatusLabel(status)}`);
      return true;
    } catch (error) {
      console.error('Müşteri durumu güncellenirken hata:', error);
      showError('Müşteri durumu güncellenirken bir hata oluştu');
      return false;
    }
  };

  // Durum etiketi getir
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Pasif';
      case 'blocked':
        return 'Engelli';
      case 'pending':
        return 'Onay Bekliyor';
      default:
        return 'Bilinmiyor';
    }
  };

  // Müşteri istatistikleri
  const customerStats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active').length;
    const inactive = customers.filter(c => c.status === 'inactive').length;
    const business = customers.filter(c => c.accountType === 'business').length;
    const personal = customers.filter(c => c.accountType === 'personal').length;
    const blocked = customers.filter(c => c.status === 'blocked').length;
    const pending = customers.filter(c => c.status === 'pending').length;

    return { total, active, inactive, business, personal, blocked, pending };
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
        (customer.name || '').toLowerCase().includes(searchLower) ||
        (customer.email || '').toLowerCase().includes(searchLower) ||
        (customer.phone || '').includes(filters.search) ||
        (customer.username || '').toLowerCase().includes(searchLower) ||
        (customer.companyName || '').toLowerCase().includes(searchLower) ||
        (customer.city || '').toLowerCase().includes(searchLower)
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
          return (a.name || '').localeCompare((b.name || ''), 'tr');
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

  // Yeni müşteri ekleme
  const handleAddCustomer = async (customerData) => {
    try {
      console.log('🔄 Müşteri ekleme başlatılıyor:');
      console.log('📝 Form datası:', customerData);
      console.log('📞 Telefon:', customerData.phone);
      console.log('📧 Email:', customerData.email);
      console.log('🏠 Adres:', customerData.address);
      console.log('🏙️ Şehir:', customerData.city);

      const newCustomer = await customerService.create({
        ...customerData,
        status: 'active',
        registeredAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        avatar: null
      });

      console.log('✅ CustomerService.create sonucu:');
      console.log('📝 Yeni müşteri objesi:', newCustomer);
      console.log('📞 Kaydedilen telefon:', newCustomer.phone);
      console.log('📧 Kaydedilen email:', newCustomer.email);
      console.log('🏠 Kaydedilen adres:', newCustomer.address);
      console.log('🏙️ Kaydedilen şehir:', newCustomer.city);

      // Storage'dan müşterileri kontrol et
      const allCustomers = await storage.get('customers', []);
      console.log('📋 Storage\'daki tüm müşteriler sayısı:', allCustomers.length);

      // Son eklenen müşteriyi kontrol et
      const lastCustomer = allCustomers[allCustomers.length - 1];
      console.log('🔍 Son eklenen müşteri:', lastCustomer);
      if (lastCustomer) {
        console.log('📞 Son müşteri telefon:', lastCustomer.phone);
        console.log('📧 Son müşteri email:', lastCustomer.email);
        console.log('🏠 Son müşteri adres:', lastCustomer.address);
        console.log('🏙️ Son müşteri şehir:', lastCustomer.city);
      }

      // Müşterileri yeniden yükle
      await loadData();
      setShowNewCustomerModal(false);

      console.log('✅ Yeni müşteri eklendi:', newCustomer.name);
      showSuccess(`${newCustomer.name} başarıyla eklendi!`);
    } catch (error) {
      console.error('❌ Müşteri ekleme hatası:', error);
      showError('Müşteri eklenirken bir hata oluştu');
    }
  };

  // Müşteri düzenleme
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowEditCustomerModal(true);
  };

  // Müşteri silme
  const handleDeleteCustomer = async (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    const customerName = customer ? customer.name : 'Bu müşteri';

    const confirmed = await showConfirm(
      `${customerName} adlı müşteriyi silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`,
      {
        title: 'Müşteri Silme',
        confirmText: 'Evet, Sil',
        cancelText: 'İptal',
        type: 'danger'
      }
    );

    if (confirmed) {
      try {
        const deleted = await customerService.delete(customerId);

        if (!deleted) {
          throw new Error('Müşteri bulunamadı');
        }

        // Müşterileri yeniden yükle
        await loadData();

        console.log('✅ Müşteri silindi:', customerName);

        // Notification debounce - aynı mesajı tekrar gösterme
        const now = Date.now();
        if (!window.lastDeleteNotification || now - window.lastDeleteNotification > 2000) {
          showSuccess(`${customerName} başarıyla silindi.`);
          window.lastDeleteNotification = now;
        }
      } catch (error) {
        console.error('❌ Müşteri silme hatası:', error);
        showError('Müşteri silinirken bir hata oluştu');
      }
    }
  };

  // Müşteri güncelleme
  const handleUpdateCustomer = async (customerData) => {
    try {
      const updatedCustomer = await customerService.update(editingCustomer.id, customerData);

      if (!updatedCustomer) {
        throw new Error('Müşteri bulunamadı');
      }

      // Müşterileri yeniden yükle
      await loadData();
      setShowEditCustomerModal(false);
      setEditingCustomer(null);

      console.log('✅ Müşteri güncellendi:', customerData.name);
      showSuccess(`${customerData.name} bilgileri başarıyla güncellendi!`);
    } catch (error) {
      console.error('❌ Müşteri güncelleme hatası:', error);
      showError('Müşteri güncellenirken bir hata oluştu');
    }
  };

  // Müşteri sipariş detay takibi
  const handleViewOrders = async (customer) => {
    try {
      // Müşterinin siparişlerini servis üzerinden al
      const customerOrders = await customerService.getCustomerOrders(customer.id);

      if (customerOrders.length === 0) {
        showWarning(`${customer.name} adlı müşterinin henüz siparişi bulunmuyor.`);
        return;
      }

      // Müşteri detay modalını aç
      setSelectedCustomer(customer);
      setShowDetailModal(true);

      console.log('Müşteri siparişleri:', customerOrders);
      showSuccess(`${customer.name} - ${customerOrders.length} sipariş bulundu.`);
    } catch (error) {
      console.error('Müşteri siparişleri yüklenirken hata:', error);
      showError('Müşteri siparişleri yüklenirken bir hata oluştu');
    }
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

  if (!user || !userProfile || (userProfile.role !== 'seller' && userProfile.role !== 'admin' && userProfile.role !== 'owner')) {
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
                onClick={() => setShowNewCustomerModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Icon name="Plus" size={18} />
                <span>Yeni Müşteri</span>
              </button>
              <button
                onClick={async () => {
                  // Test customers for quick testing
                  console.log('🔄 Test verileri ekleniyor...');

                  // Önce mevcut müşterileri kontrol et
                  const existingCustomers = await customerService.getAll();
                  console.log('📋 Mevcut müşteri sayısı:', existingCustomers.length);

                  // Test müşterilerinden sadece mevcut olmayanları ekle
                  const testCustomers = [
                    {
                      name: 'Ahmet Yılmaz',
                      email: 'ahmet@example.com',
                      phone: '0532 123 4567',
                      username: 'ahmet123',
                      password: 'test123',
                      address: 'Atatürk Caddesi No:123',
                      city: 'İstanbul',
                      district: 'Kadıköy',
                      accountType: 'personal'
                    },
                    {
                      name: 'Mehmet Öz',
                      email: 'mehmet@example.com',
                      phone: '0533 987 6543',
                      username: 'mehmet456',
                      password: 'test456',
                      address: 'İstiklal Caddesi No:456',
                      city: 'Ankara',
                      district: 'Çankaya',
                      accountType: 'personal'
                    },
                    {
                      name: 'ABC Şirketi',
                      email: 'info@abc.com',
                      phone: '0212 555 1234',
                      username: 'abc_company',
                      password: 'company123',
                      address: 'İş Merkezi No:789',
                      city: 'İzmir',
                      district: 'Konak',
                      accountType: 'business',
                      companyName: 'ABC Ltd. Şti.',
                      companyTitle: 'Müdür'
                    }
                  ];

                  let addedCount = 0;
                  for (const testCustomer of testCustomers) {
                    // Aynı email varsa ekleme
                    const exists = existingCustomers.find(c => c.email === testCustomer.email);
                    if (!exists) {
                      await handleAddCustomer(testCustomer);
                      addedCount++;
                    } else {
                      console.log(`⚠️ ${testCustomer.name} zaten mevcut, atlanıyor`);
                    }
                  }

                  console.log(`✅ ${addedCount} test müşterisi eklendi`);

                  // Veri yüklemeyi tekrar çalıştır
                  await loadData();
                }}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Icon name="Database" size={18} />
                <span>Test Verileri Ekle</span>
              </button>
              <button
                onClick={() => {
                  console.log('🔍 Debug Bilgileri:');
                  console.log('customers state:', customers);
                  console.log('filteredCustomers:', filteredCustomers);
                  console.log('currentCustomers:', currentCustomers);
                  console.log('customerStats:', customerStats);

                  // LocalStorage kontrolü
                  const stored = localStorage.getItem('customers');
                  console.log('localStorage customers:', stored ? JSON.parse(stored) : 'YOK');

                  // Unified storage kontrolü
                  const unified = localStorage.getItem('unified_storage');
                  if (unified) {
                    const unifiedData = JSON.parse(unified);
                    console.log('unified_storage customers:', unifiedData.customers || 'YOK');
                  }

                  // Gerçek müşteri arama
                  console.log('🔍 GERÇEK MÜŞTERİ ARAMA:');
                  const bulentUner = customers.find(c =>
                    c.name && (
                      c.name.toLowerCase().includes('bülent') ||
                      c.name.toLowerCase().includes('üner') ||
                      c.name.toLowerCase().includes('bulent')
                    )
                  );

                  const nesetAvvuran = customers.find(c =>
                    c.name && (
                      c.name.toLowerCase().includes('neset') ||
                      c.name.toLowerCase().includes('avvuran')
                    )
                  );

                  console.log('👤 Bülent Üner:', bulentUner ? '✅ BULUNDU' : '❌ BULUNAMADI');
                  console.log('👤 Neset Avvuran:', nesetAvvuran ? '✅ BULUNDU' : '❌ BULUNAMADI');

                  if (bulentUner) console.log('📋 Bülent Üner detayları:', bulentUner);
                  if (nesetAvvuran) console.log('📋 Neset Avvuran detayları:', nesetAvvuran);

                  // Tüm müşteri isimlerini listele
                  console.log('📋 TÜM MÜŞTERİ İSİMLERİ:');
                  customers.forEach((customer, index) => {
                    console.log(`${index + 1}. ${customer.name} (${customer.email})`);
                  });

                  // CustomerService test
                  customerService.getAll().then(result => {
                    console.log('customerService.getAll() sonucu:', result);
                  });
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Icon name="Bug" size={18} />
                <span>Debug</span>
              </button>
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
            <div className="text-center py-16">
              <Icon name="Users" size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz müşteri bulunmuyor</h3>
              <p className="text-gray-600 mb-6">İlk müşterinizi eklemek için aşağıdaki butonu kullanabilirsiniz.</p>
              <button
                onClick={() => setShowNewCustomerModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Icon name="Plus" size={18} />
                <span>İlk Müşteriyi Ekle</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {currentCustomers.map((customer, index) => {
                  // Debug: Her müşteri için log
                  console.log(`🔍 Render edilen müşteri ${index + 1}:`, {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    city: customer.city,
                    address: customer.address
                  });

                  return (
                    <div key={customer.id} className="bg-white/70 backdrop-blur-sm border border-gray-300 rounded-lg p-4 hover:shadow-lg transition-shadow shadow-sm hover:bg-white/80">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{customer.name}</h3>
                          <p className="text-xs text-gray-600 truncate">{customer.email}</p>
                          <p className="text-xs text-gray-600">{customer.phone}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${customer.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {customer.status === 'active' ? 'Aktif' : 'Pasif'}
                          </span>
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Müşteriyi düzenle"
                          >
                            <Icon name="Edit" size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Müşteriyi sil"
                          >
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Hesap:</span>
                          <span className={`px-2 py-1 rounded-full ${customer.accountType === 'business'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-orange-100 text-orange-800'
                            }`}>
                            {customer.accountType === 'business' ? 'Kurumsal' : 'Bireysel'}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Şifre:</span>
                          <div className="flex items-center space-x-1">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                              {showPasswords[customer.id] ? customer.password : '•'.repeat(customer.password?.length || 8)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, [customer.id]: !prev[customer.id] }))}
                              className="text-gray-400 hover:text-gray-600 p-1"
                              title={showPasswords[customer.id] ? "Şifreyi Gizle" : "Şifreyi Göster"}
                            >
                              <Icon name={showPasswords[customer.id] ? "EyeOff" : "Eye"} size={12} />
                            </button>
                          </div>
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
                          <Icon name="User" size={12} />
                          <span>Detay</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowStatusModal(true);
                          }}
                          className="flex items-center justify-center px-3 py-2 bg-transparent border border-purple-600 text-purple-600 text-xs rounded hover:bg-purple-600/10 transition-colors font-medium"
                          title="Müşteri durumunu güncelle"
                        >
                          <Icon name="UserCheck" size={12} />
                          <span>Durum</span>
                        </button>
                        <button
                          onClick={() => handleViewOrders(customer)}
                          className="flex items-center justify-center px-3 py-2 bg-transparent border border-green-600 text-green-600 text-xs rounded hover:bg-green-600/10 transition-colors font-medium"
                          title="Sipariş geçmişini görüntüle"
                        >
                          <Icon name="ShoppingBag" size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
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

      {/* Yeni Müşteri Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-slate-100 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Yeni Müşteri Ekle</h3>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            <NewCustomerForm
              key={`new-customer-${Date.now()}`}
              onSave={handleAddCustomer}
              onCancel={() => setShowNewCustomerModal(false)}
              showWarning={showWarning}
            />
          </div>
        </div>
      )}

      {/* Müşteri Detay Modal - CustomerDetailModal kullanıyor */}

      {/* Müşteri Düzenleme Modal */}
      {showEditCustomerModal && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-slate-100 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Müşteri Düzenle</h3>
              <button
                onClick={() => {
                  setShowEditCustomerModal(false);
                  setEditingCustomer(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            <EditCustomerForm
              customer={editingCustomer}
              onSave={handleUpdateCustomer}
              onCancel={() => {
                setShowEditCustomerModal(false);
                setEditingCustomer(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Müşteri Detay Modal */}
      {showDetailModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      {/* Müşteri Durum Güncelleme Modal */}
      {showStatusModal && selectedCustomer && (
        <CustomerStatusModal
          customer={selectedCustomer}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedCustomer(null);
          }}
          onUpdateStatus={handleUpdateCustomerStatus}
        />
      )}
    </div>
  );
};

export default MusteriYonetimi;
