import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const BusinessContext = createContext();

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export const BusinessProvider = ({ children }) => {
  const [businessInfo, setBusinessInfo] = useState(null);

  useEffect(() => {
    // AuthService'den iş yeri bilgilerini yükle
    const businessData = authService.getBusinessInfo();
    setBusinessInfo(businessData);
  }, []);

  const updateBusinessInfo = (newInfo) => {
    const result = authService.updateBusinessInfo(newInfo);
    if (result.success) {
      setBusinessInfo(result.data);
    }
    return result;
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
