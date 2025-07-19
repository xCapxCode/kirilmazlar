import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import Icon from '../AppIcon';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const { showSuccess } = useNotification();

  // Dropdown dışına tıklama kontrolü
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Demo bildirimleri yükle
  useEffect(() => {
    const demoNotifications = [
      {
        id: 1,
        title: 'Yeni Sipariş',
        message: 'Ahmet Yılmaz tarafından yeni bir sipariş verildi.',
        type: 'info',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 dakika önce
        read: false,
        icon: 'ShoppingCart'
      },
      {
        id: 2,
        title: 'Stok Uyarısı',
        message: 'Elma ürününün stoku azalıyor (3 adet kaldı).',
        type: 'warning',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 dakika önce
        read: false,
        icon: 'AlertTriangle'
      },
      {
        id: 3,
        title: 'Sipariş Tamamlandı',
        message: 'SIP-2024-001 numaralı sipariş teslim edildi.',
        type: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 saat önce
        read: true,
        icon: 'CheckCircle'
      },
      {
        id: 4,
        title: 'Yeni Müşteri',
        message: 'Fatma Demir sisteme yeni müşteri olarak kaydoldu.',
        type: 'info',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 saat önce
        read: true,
        icon: 'UserPlus'
      }
    ];

    setNotifications(demoNotifications);
    setUnreadCount(demoNotifications.filter(n => !n.read).length);
  }, []);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    return `${days} gün önce`;
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    showSuccess('Tüm bildirimler okundu olarak işaretlendi');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    showSuccess('Tüm bildirimler temizlendi');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bildirim Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bildirimler</h3>
            {notifications.length > 0 && (
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Tümünü Okundu İşaretle
                  </button>
                )}
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-red-600 hover:text-red-800 transition-colors"
                >
                  Temizle
                </button>
              </div>
            )}
          </div>

          {/* Bildirim Listesi */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Icon name="Bell" size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Henüz bildirim yok</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getTypeStyles(notification.type)}`}>
                      <Icon name={notification.icon} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
                Tüm Bildirimleri Görüntüle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;