import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import authorizationService from '../services/authorizationService';

const AuthorizationContext = createContext();

export function AuthorizationProvider({ children }) {
  const { user, userProfile } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    if (userProfile) {
      const role = authorizationService.getUserRole(userProfile);
      const permissions = authorizationService.getUserPermissions(userProfile);
      
      setUserRole(role);
      setUserPermissions(permissions);
    } else {
      setUserRole(null);
      setUserPermissions([]);
    }
  }, [userProfile]);

  const hasPermission = (permission) => {
    return authorizationService.hasPermission(userProfile, permission);
  };

  const hasRole = (roleId) => {
    return authorizationService.hasRole(userProfile, roleId);
  };

  const isAdmin = () => {
    return authorizationService.isAdmin(userProfile);
  };

  const isSeller = () => {
    return authorizationService.isSeller(userProfile);
  };

  const isCustomer = () => {
    return authorizationService.isCustomer(userProfile);
  };

  const isDemo = () => {
    return authorizationService.isDemo(userProfile);
  };

  const value = {
    userRole,
    userPermissions,
    hasPermission,
    hasRole,
    isAdmin,
    isSeller,
    isCustomer,
    isDemo
  };

  return (
    <AuthorizationContext.Provider value={value}>
      {children}
    </AuthorizationContext.Provider>
  );
}

export function useAuthorization() {
  const context = useContext(AuthorizationContext);
  if (context === undefined) {
    throw new Error('useAuthorization must be used within an AuthorizationProvider');
  }
  return context;
}

// Yetki gerektiren bileşen için HOC
export function withAuthorization(Component, requiredPermission) {
  return function AuthorizedComponent(props) {
    const { hasPermission } = useAuthorization();
    
    if (!hasPermission(requiredPermission)) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Erişim Reddedildi</h3>
          <p className="mt-2 text-sm text-red-700">
            Bu sayfayı görüntülemek için gerekli yetkiye sahip değilsiniz.
          </p>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

// Rol gerektiren bileşen için HOC
export function withRole(Component, requiredRole) {
  return function RoleBasedComponent(props) {
    const { hasRole } = useAuthorization();
    
    if (!hasRole(requiredRole)) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Erişim Reddedildi</h3>
          <p className="mt-2 text-sm text-red-700">
            Bu sayfayı görüntülemek için gerekli role sahip değilsiniz.
          </p>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}
