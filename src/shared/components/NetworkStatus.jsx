import React, { useState, useEffect } from 'react';
import Icon from '@shared/components/AppIcon';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      window.showToast && window.showToast('İnternet bağlantısı geri yüklendi', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      window.showToast && window.showToast('İnternet bağlantısı kesildi', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineMessage && isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center">
      <div className="flex items-center justify-center space-x-2">
        <Icon name="WifiOff" size={16} />
        <span className="text-sm font-medium">
          İnternet bağlantısı yok - Bazı özellikler çalışmayabilir
        </span>
      </div>
    </div>
  );
};

export default NetworkStatus;
