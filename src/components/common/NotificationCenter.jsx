import React, { useState, useEffect, useRef } from 'react';
import { socketService } from '../../services/socketService.js';
import authService from '../../services/authService.js';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const notificationRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    initializeSocket();

    // Load persisted notifications
    loadPersistedNotifications();

    // Cleanup on unmount
    return () => {
      socketService.off('notification:received', handleNotificationReceived);
      socketService.off('connection:established', handleConnectionEstablished);
      socketService.off('connection:lost', handleConnectionLost);
    };
  }, []);

  const initializeSocket = async () => {
    try {
      if (authService.isAuthenticated()) {
        await socketService.connect();
        
        // Set up event listeners
        socketService.on('notification:received', handleNotificationReceived);
        socketService.on('connection:established', handleConnectionEstablished);
        socketService.on('connection:lost', handleConnectionLost);
        socketService.on('connection:restored', handleConnectionRestored);
        
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setConnectionStatus('error');
    }
  };

  const handleConnectionEstablished = () => {
    setConnectionStatus('connected');
  };

  const handleConnectionLost = () => {
    setConnectionStatus('disconnected');
  };

  const handleConnectionRestored = () => {
    setConnectionStatus('connected');
  };

  const handleNotificationReceived = (notification) => {
    const newNotification = {
      ...notification,
      id: notification.id || Date.now(),
      read: false,
      receivedAt: new Date()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep max 50 notifications
    setUnreadCount(prev => prev + 1);
    
    // Play notification sound
    playNotificationSound();
    
    // Show browser notification if permission granted
    showBrowserNotification(newNotification);
    
    // Persist notification
    persistNotification(newNotification);
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const persistNotification = (notification) => {
    try {
      const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updated = [notification, ...stored.slice(0, 49)];
      localStorage.setItem('notifications', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to persist notification:', error);
    }
  };

  const loadPersistedNotifications = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
      setNotifications(stored);
      setUnreadCount(stored.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to load persisted notifications:', error);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Update persisted notifications
    updatePersistedNotifications();
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    updatePersistedNotifications();
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
    updatePersistedNotifications();
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('notifications');
  };

  const updatePersistedNotifications = () => {
    setTimeout(() => {
      try {
        localStorage.setItem('notifications', JSON.stringify(notifications));
      } catch (error) {
        console.error('Failed to update persisted notifications:', error);
      }
    }, 100);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      case 'system': return '🔧';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'system': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes}dk önce`;
    if (hours < 24) return `${hours}sa önce`;
    return `${days}g önce`;
  };

  return (
    <>
      {/* Notification Sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/sounds/notification.wav" type="audio/wav" />
      </audio>

      {/* Notification Button */}
      <div className="relative">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) requestNotificationPermission();
          }}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Bildirimler"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v3.5" />
          </svg>
          
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          
          {/* Connection Status Indicator */}
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'disconnected' ? 'bg-red-500' :
            'bg-yellow-500'
          }`} />
        </button>

        {/* Notification Panel */}
        {isOpen && (
          <div 
            ref={notificationRef}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Bildirimler</h3>
                <div className="flex items-center space-x-2">
                  {/* Connection Status */}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                    connectionStatus === 'disconnected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {connectionStatus === 'connected' ? 'Bağlı' :
                     connectionStatus === 'disconnected' ? 'Bağlantı Yok' :
                     'Bağlanıyor'}
                  </span>
                  
                  {/* Actions */}
                  {notifications.length > 0 && (
                    <div className="flex space-x-1">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                          title="Tümünü okundu işaretle"
                        >
                          Tümünü Oku
                        </button>
                      )}
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-red-600 hover:text-red-800"
                        title="Tümünü temizle"
                      >
                        Temizle
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v3.5" />
                  </svg>
                  <p>Henüz bildirim yok</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTime(notification.timestamp || notification.receivedAt)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-800 text-xs"
                                title="Okundu işaretle"
                              >
                                ✓
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                              title="Sil"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default NotificationCenter;