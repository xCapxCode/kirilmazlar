import React, { createContext, useContext, useState, useEffect } from 'react';

const BusinessContext = createContext();

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export const BusinessProvider = ({ children }) => {
  const [businessInfo, setBusinessInfo] = useState({
    name: 'Meyve Sebze Marketi',
    logo: null,
    address: 'İşletme Adresi',
    phone: '+90 555 000 00 00',
    email: 'info@meyvemarket.com',
    workingHours: '08:00 - 22:00',
    slogan: 'Taze ve Kaliteli Ürünler'
  });

  useEffect(() => {
    // LocalStorage'dan iş yeri bilgilerini yükle
    const saved = localStorage.getItem('businessInfo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBusinessInfo(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Business info yüklenemedi:', error);
      }
    }
  }, []);

  const updateBusinessInfo = (newInfo) => {
    const updated = { ...businessInfo, ...newInfo };
    setBusinessInfo(updated);
    localStorage.setItem('businessInfo', JSON.stringify(updated));
  };

  const value = {
    businessInfo,
    updateBusinessInfo
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};
