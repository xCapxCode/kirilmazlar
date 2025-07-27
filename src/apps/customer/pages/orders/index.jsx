import storage from '@core/storage';
import Icon from '@shared/components/AppIcon';
import Header from '@shared/components/ui/Header';
import { useCallback, useEffect, useState } from 'react';
import { PageLoading } from '../../../../components/ui/LoadingSystem';
import { useAuth } from '../../../../contexts/AuthContext';
import { useModal } from '../../../../contexts/ModalContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import orderService from '../../../../services/orderService';
import orderCleanupUtil from '../../../../utils/orderCleanupUtil';
import ArsivlenmisModali from './components/ArsivlenmisModali';
import SiparisGecmisi from './components/SiparisGecmisi';
import SiparisIptalModali from './components/SiparisIptalModali';

const CustomerOrders = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { showConfirm } = useModal();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalSpent: 0
  });

  const calculateStats = useCallback((orders) => {
    const activeOrders = orders.filter(order =>
      !['Teslim Edildi', 'İptal Edildi'].includes(order.status)
    ).length;

    const completedOrders = orders.filter(order =>
      order.status === 'Teslim Edildi'
    ).length;

    const cancelledOrders = orders.filter(order =>
      order.status === 'İptal Edildi'
    ).length;

    const totalSpent = orders
      .filter(order => order.status === 'Teslim Edildi')
      .reduce((sum, order) => sum + (order.total || 0), 0);

    setStats({
      totalOrders: orders.length,
      activeOrders,
      completedOrders,
      cancelledOrders,
      totalSpent
    });
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      if (!userProfile?.id) {
        console.log('⚠️  User profile veya ID yok, siparişler yüklenemez');
        setOrders([]);
        return;
      }

      // Tüm siparişleri al ve debug et
      const allOrders = await storage.get('customer_orders', []);
      console.log('🔍 DEBUG - Tüm customer_orders:', allOrders);
      console.log('🔍 DEBUG - Current user ID:', userProfile.id);

      // OrderService kullanarak müşteriye özel siparişleri yükle
      const loadedOrders = await orderService.getByCustomerId(userProfile.id);
      console.log('🔍 DEBUG - Filtered orders for user:', loadedOrders);

      setOrders(loadedOrders);

      // İstatistikleri hesapla
      calculateStats(loadedOrders);

      console.log(`✅ Customer ${userProfile.id} için ${loadedOrders.length} sipariş yüklendi`);
    } catch (error) {
      console.error('❌ Sipariş yükleme hatası:', error);
      showError('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id, showError, calculateStats]);

  useEffect(() => {
    if (user && userProfile) {
      loadOrders();

      // Sadece customer_orders storage'ını dinle
      const unsubscribeCustomerOrders = storage.subscribe('customer_orders', loadOrders);

      return () => {
        unsubscribeCustomerOrders();
      };
    }
  }, [user, userProfile, loadOrders]);

  const handleCancelOrder = async (orderId, reason) => {
    try {
      const updatedOrder = await orderService.cancel(orderId, reason);

      if (!updatedOrder) {
        throw new Error('Sipariş bulunamadı');
      }

      // Siparişleri yeniden yükle
      await loadOrders();

      showSuccess('Sipariş başarıyla iptal edildi');
      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      showError('Sipariş iptal edilirken bir hata oluştu');
      return false;
    }
  };

  const handleCleanupOldOrders = async () => {
    const confirmed = await showConfirm(
      'Eski siparişleri temizlemek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.',
      {
        title: 'Eski Siparişleri Temizle',
        confirmText: 'Temizle',
        cancelText: 'İptal',
        type: 'warning'
      }
    );

    if (confirmed) {
      try {
        const cleanedCount = await orderCleanupUtil.cleanupOldOrders(30);

        // Siparişleri yeniden yükle
        await loadOrders();

        showSuccess(`${cleanedCount} eski sipariş başarıyla temizlendi`);
      } catch (error) {
        console.error('Error cleaning up old orders:', error);
        showError('Eski siparişler temizlenirken bir hata oluştu');
      }
    }
  };

  const handleArchiveCompletedOrders = async () => {
    const confirmed = await showConfirm(
      'Tamamlanan siparişleri arşivlemek istediğinizden emin misiniz?',
      {
        title: 'Tamamlanan Siparişleri Arşivle',
        confirmText: 'Arşivle',
        cancelText: 'İptal',
        type: 'info'
      }
    );

    if (confirmed) {
      try {
        const archivedCount = await orderCleanupUtil.archiveCompletedOrders();

        // Siparişleri yeniden yükle
        await loadOrders();

        showSuccess(`${archivedCount} tamamlanan sipariş başarıyla arşivlendi`);
      } catch (error) {
        console.error('Error archiving completed orders:', error);
        showError('Tamamlanan siparişler arşivlenirken bir hata oluştu');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount || 0);
  };

  if (authLoading || loading) {
    return <PageLoading isLoading={true} loadingText="Siparişleriniz yükleniyor..." />;
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600">Bu sayfayı görüntülemek için giriş yapmanız gerekir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık Bandı */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Icon name="ShoppingBag" size={24} className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Siparişlerim</h1>
                <p className="text-gray-600 mt-1">
                  Toplam {stats.totalOrders} sipariş • {stats.activeOrders} aktif
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleArchiveCompletedOrders}
                className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600/10 transition-colors flex items-center space-x-2"
              >
                <Icon name="Archive" size={18} />
                <span>Tamamlananları Arşivle</span>
              </button>

              <button
                onClick={() => setShowArchivedModal(true)}
                className="border-2 border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-600/10 transition-colors flex items-center space-x-2"
              >
                <Icon name="Inbox" size={18} />
                <span>Arşivi Görüntüle</span>
              </button>

              <button
                onClick={handleCleanupOldOrders}
                className="border-2 border-orange-600 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-600/10 transition-colors flex items-center space-x-2"
              >
                <Icon name="Trash2" size={18} />
                <span>Eski Siparişleri Temizle</span>
              </button>

              <button
                onClick={loadOrders}
                className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600/10 transition-colors flex items-center space-x-2"
              >
                <Icon name="RefreshCw" size={18} />
                <span>Yenile</span>
              </button>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam Sipariş</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Icon name="ShoppingBag" size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aktif Sipariş</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeOrders}</h3>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Icon name="Clock" size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tamamlanan</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.completedOrders}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Icon name="CheckCircle" size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam Harcama</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalSpent)}</h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Icon name="CreditCard" size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sipariş Geçmişi */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6">
          <SiparisGecmisi customerId={userProfile?.id} />
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedOrder && (
        <SiparisIptalModali
          order={selectedOrder}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedOrder(null);
          }}
          onCancel={handleCancelOrder}
        />
      )}

      {/* Archived Orders Modal */}
      {showArchivedModal && (
        <ArsivlenmisModali
          onClose={() => setShowArchivedModal(false)}
        />
      )}
    </div>
  );
};

export default CustomerOrders;