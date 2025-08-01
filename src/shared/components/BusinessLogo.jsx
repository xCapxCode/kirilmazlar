import React, { useState, useEffect } from 'react';

const BusinessLogo = ({ size = 'md', showName = false, className = '' }) => {
  const [logo, setLogo] = useState(null);
  const [businessName, setBusinessName] = useState('İşletme');

  // LocalStorage'dan işletme bilgilerini yükle
  useEffect(() => {
    const loadBusinessInfo = () => {
      try {
        const savedBusinessInfo = localStorage.getItem('businessInfo');
        
        if (savedBusinessInfo) {
          const parsed = JSON.parse(savedBusinessInfo);
          
          if (parsed.logo) {
            setLogo(parsed.logo);
          } else {
            setLogo(null);
          }
          setBusinessName(parsed.name || 'İşletme');
        } else {
          setLogo(null);
          setBusinessName('İşletme');
        }
      } catch (error) {
        logger.error('BusinessLogo - Loading error:', error);
        setLogo(null);
        setBusinessName('İşletme');
      }
    };

    loadBusinessInfo();

    // localStorage değişikliklerini dinle
    const handleStorageChange = (e) => {
      if (e.key === 'businessInfo') {
        loadBusinessInfo();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener ekle (aynı tab içinde değişiklikleri dinlemek için)
    const handleBusinessInfoUpdate = () => {
      loadBusinessInfo();
    };
    
    window.addEventListener('businessInfoUpdated', handleBusinessInfoUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('businessInfoUpdated', handleBusinessInfoUpdate);
    };
  }, []);

  // Boyut sınıfları
  const logoSizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-3xl'
  };
  
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo */}
      <div className="flex items-center justify-center">
        {logo ? (
          <img 
            src={logo} 
            alt={businessName}
            className={`${logoSizeClasses[size]} object-contain rounded-lg shadow-sm`}
            onError={(e) => {
              logger.error('BusinessLogo - Image load error:', e);
              setLogo(null);
            }}
          />
        ) : (
          <div className={`${logoSizeClasses[size]} bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg`}>
            <span className="text-white text-2xl font-bold">
              {businessName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      {/* İş yeri adı - sadece istenirse göster */}
      {showName && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
            {businessName}
          </h1>
        </div>
      )}
    </div>
  );
};

export default BusinessLogo;
