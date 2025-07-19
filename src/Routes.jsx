import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./shared/components/ScrollToTop";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import { useAuth } from "./contexts/AuthContext";

// Lazy loaded components
const LandingRoutes = lazy(() => import("./apps/web/landing/LandingRoutes"));
const SellerRoutes = lazy(() => import("./apps/admin/seller/SellerRoutes"));
const CustomerRoutes = lazy(() => import("./apps/customer/CustomerRoutes"));
const Login = lazy(() => import("./shared/components/auth/Login"));

// Loading component
const LoadingComponent = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Yükleniyor...</p>
    </div>
  </div>
);

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
          {/* Authentication */}
          <Route path="/login" element={
            <Suspense fallback={<LoadingComponent />}>
              <Login />
            </Suspense>
          } />
          
          {/* Seller App Routes - Production */}
          <Route 
            path="/seller/*" 
            element={
              <SellerProtectedRoute>
                <Suspense fallback={<LoadingComponent />}>
                  <SellerRoutes />
                </Suspense>
              </SellerProtectedRoute>
            } 
          />
          
          {/* Customer App Routes */}
          <Route 
            path="/customer/*" 
            element={
              <CustomerProtectedRoute>
                <Suspense fallback={<LoadingComponent />}>
                  <CustomerRoutes />
                </Suspense>
              </CustomerProtectedRoute>
            } 
          />
          
          {/* Landing Page */}
          <Route path="/*" element={
            <Suspense fallback={<LoadingComponent />}>
              <LandingRoutes />
            </Suspense>
          } />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
