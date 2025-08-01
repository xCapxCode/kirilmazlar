import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import MobileBottomNavigation from "../../shared/components/mobile/MobileBottomNavigation";
import MobileHeader from "../../shared/components/mobile/MobileHeader";

// Mobile Pages - Lazy loaded
const MobileCatalog = lazy(() => import("./pages/catalog"));
const MobileCart = lazy(() => import("./pages/cart"));
const MobileOrders = lazy(() => import("./pages/orders"));
const MobileProfile = lazy(() => import("./pages/profile"));
const MobileLogin = lazy(() => import("./pages/login"));

// Mobile Loading component
const MobilePageLoader = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 text-sm">Yükleniyor...</p>
    </div>
  </div>
);

const MobileRoutes = () => {
  return (
    <div className="mobile-app min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Routes>
        {/* Mobile Login Route - No auth required */}
        <Route path="login" element={
          <Suspense fallback={<MobilePageLoader />}>
            <MobileLogin />
          </Suspense>
        } />

        {/* Authenticated Mobile Routes */}
        <Route path="*" element={
          <>
            {/* Mobile Header - Fixed Top */}
            <div className="flex-shrink-0 sticky top-0 z-50 bg-white shadow-sm">
              <MobileHeader
                title="Kırılmazlar Gıda"
                showBack={false}
                showCart={true}
                showNotifications={true}
                showSearch={false}
              />
            </div>

            {/* Mobile Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <Routes>
                <Route index element={<Navigate to="catalog" replace />} />
                <Route path="catalog" element={
                  <Suspense fallback={<MobilePageLoader />}>
                    <MobileCatalog />
                  </Suspense>
                } />
                <Route path="cart" element={
                  <Suspense fallback={<MobilePageLoader />}>
                    <MobileCart />
                  </Suspense>
                } />
                <Route path="orders" element={
                  <Suspense fallback={<MobilePageLoader />}>
                    <MobileOrders />
                  </Suspense>
                } />
                <Route path="profile" element={
                  <Suspense fallback={<MobilePageLoader />}>
                    <MobileProfile />
                  </Suspense>
                } />
              </Routes>
            </div>

            {/* Mobile Bottom Navigation - Fixed Bottom */}
            <div className="flex-shrink-0 sticky bottom-0 z-50">
              <MobileBottomNavigation />
            </div>
          </>
        } />
      </Routes>
    </div>
  );
};

export default MobileRoutes;
