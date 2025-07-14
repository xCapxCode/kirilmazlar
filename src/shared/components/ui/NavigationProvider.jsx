import React, { createContext, useContext, useState, useEffect } from 'react';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [userRole, setUserRole] = useState('customer'); // 'customer' | 'seller'
  const [activeTab, setActiveTab] = useState('/customer-product-catalog');
  const [activeSidebarSection, setActiveSidebarSection] = useState('Products');
  const [cartItemCount, setCartItemCount] = useState(3);
  const [pendingOrderCount, setPendingOrderCount] = useState(2);
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: null
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate cart updates
      if (Math.random() > 0.9) {
        setCartItemCount(prev => Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1)));
      }
      
      // Simulate order updates
      if (Math.random() > 0.95) {
        setPendingOrderCount(prev => Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1)));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update active states based on current path
  useEffect(() => {
    const path = window.location.pathname;
    setActiveTab(path);
    
    // Determine sidebar section based on path
    if (path.includes('product')) {
      setActiveSidebarSection('Products');
    } else if (path.includes('order')) {
      setActiveSidebarSection('Orders');
    } else if (path.includes('profile') || path.includes('settings')) {
      setActiveSidebarSection('Account');
    }
  }, []);

  const updateCartCount = (count) => {
    setCartItemCount(count);
  };

  const updateOrderCount = (count) => {
    setPendingOrderCount(count);
  };

  const switchRole = (role) => {
    setUserRole(role);
    // Reset navigation state when switching roles
    if (role === 'customer') {
      setActiveTab('/customer-product-catalog');
    } else {
      setActiveTab('/product-management');
      setActiveSidebarSection('Products');
    }
  };

  const navigateTo = (path, analytics = {}) => {
    setActiveTab(path);
    
    // Analytics tracking
    if (analytics.event) {
      console.log('Navigation Analytics:', {
        event: analytics.event,
        path,
        userRole,
        timestamp: new Date().toISOString()
      });
    }
  };

  const value = {
    // State
    userRole,
    activeTab,
    activeSidebarSection,
    cartItemCount,
    pendingOrderCount,
    user,
    
    // Actions
    setUserRole: switchRole,
    setActiveTab,
    setActiveSidebarSection,
    updateCartCount,
    updateOrderCount,
    setUser,
    navigateTo,
    
    // Computed values
    isCustomer: userRole === 'customer',
    isSeller: userRole === 'seller',
    hasCartItems: cartItemCount > 0,
    hasPendingOrders: pendingOrderCount > 0
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;