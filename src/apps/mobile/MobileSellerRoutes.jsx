import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import MobileSellerBottomNavigation from "./components/MobileSellerBottomNavigation";
import MobileSellerProtectedRoute from "./components/MobileSellerProtectedRoute";

// Mobile Seller Pages - Lazy loaded
const MobileSellerDashboard = lazy(() => import("./pages/seller/dashboard"));
const ModernSellerDashboard = lazy(() => import("./pages/seller/dashboard/ModernSellerDashboard"));
const MobileSellerProducts = lazy(() => import("./pages/seller/products"));
const MobileSellerOrders = lazy(() => import("./pages/seller/orders"));
const MobileSellerCustomers = lazy(() => import("./pages/seller/customers"));
const MobileSellerSettings = lazy(() => import("./pages/seller/settings"));

// Mobile Seller Loading component
const MobileSellerPageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center relative overflow-hidden">
    {/* Modern Background Pattern */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
      <div className="absolute top-20 right-10 w-32 h-32 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
    </div>

    <div className="relative z-10 flex flex-col items-center space-y-6">
      <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="text-center">
        <p className="text-gray-700 text-lg font-semibold">Yükleniyor...</p>
        <p className="text-gray-500 text-sm mt-1">Satıcı Paneli hazırlanıyor</p>
      </div>
    </div>
  </div>
);

const MobileSellerRoutes = () => {
  return (
    <div className="mobile-seller-app h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      <MobileSellerProtectedRoute>
        {/* Mobile Seller Content - Scrollable */}
        <div className="flex-1 overflow-y-auto pb-20">
          <Routes>
            <Route index element={
              <Suspense fallback={<MobileSellerPageLoader />}>
                <MobileSellerDashboard />
              </Suspense>
            } />
            <Route path="dashboard" element={
              <Suspense fallback={<MobileSellerPageLoader />}>
                <ModernSellerDashboard />
              </Suspense>
            } />
            <Route path="products" element={
              <Suspense fallback={<MobileSellerPageLoader />}>
                <MobileSellerProducts />
              </Suspense>
            } />
            <Route path="orders" element={
              <Suspense fallback={<MobileSellerPageLoader />}>
                <MobileSellerOrders />
              </Suspense>
            } />
            <Route path="customers" element={
              <Suspense fallback={<MobileSellerPageLoader />}>
                <MobileSellerCustomers />
              </Suspense>
            } />
            <Route path="settings" element={
              <Suspense fallback={<MobileSellerPageLoader />}>
                <MobileSellerSettings />
              </Suspense>
            } />
          </Routes>
        </div>

        {/* Mobile Seller Bottom Navigation - Fixed Bottom */}
        <MobileSellerBottomNavigation />
      </MobileSellerProtectedRoute>
    </div>
  );
};

export default MobileSellerRoutes;