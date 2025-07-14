import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./shared/components/ScrollToTop";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import { useAuth } from "./contexts/AuthContext";

// App Routes
import LandingRoutes from "./apps/web/landing/LandingRoutes";
import SellerRoutes from "./apps/admin/seller/SellerRoutes";
import CustomerRoutes from "./apps/customer/CustomerRoutes";

// Shared Components
import Login from "./shared/components/auth/Login";

// General Protected Route Component (both seller and customer)
const GeneralProtectedRoute = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (!user || !userProfile) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Protected Route Component for Sellers (Safe Version)
const SellerProtectedRoute = ({ children }) => {
  try {
    const { user, userProfile, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      );
    }
    
    if (!user || !userProfile) {
      return <Navigate to="/login" replace />;
    }
    
    if (userProfile.role !== 'seller' && userProfile.role !== 'admin') {
      return <Navigate to="/customer/catalog" replace />;
    }
    
    return children;
  } catch (error) {
    console.error('SellerProtectedRoute error:', error);
    return <Navigate to="/login" replace />;
  }
};

// Protected Route Component for Customers (Safe Version)
const CustomerProtectedRoute = ({ children }) => {
  try {
    const { user, userProfile, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      );
    }
    
    if (!user || !userProfile) {
      return <Navigate to="/login" replace />;
    }
    
    if (userProfile.role !== 'customer') {
      return <Navigate to="/seller/dashboard" replace />;
    }
    
    return children;
  } catch (error) {
    console.error('CustomerProtectedRoute error:', error);
    return <Navigate to="/login" replace />;
  }
};

const Routes = () => {
  return (
    <BrowserRouter 
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ScrollToTop />
      <ErrorBoundary>
        <RouterRoutes>
          {/* Landing Page */}
          <Route path="/*" element={<LandingRoutes />} />
          
          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          
          {/* Seller App Routes */}
          <Route 
            path="/seller/*" 
            element={
              <SellerProtectedRoute>
                <SellerRoutes />
              </SellerProtectedRoute>
            } 
          />
          
          {/* Customer App Routes */}
          <Route 
            path="/customer/*" 
            element={
              <CustomerProtectedRoute>
                <CustomerRoutes />
              </CustomerProtectedRoute>
            } 
          />
          
          {/* Development/Testing Routes */}
          {/* <Route 
            path="/test/localstorage" 
            element={
              <GeneralProtectedRoute>
                <LocalStorageTest />
              </GeneralProtectedRoute>
            } 
          /> */}
          
          {/* Catch All - 404 */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
