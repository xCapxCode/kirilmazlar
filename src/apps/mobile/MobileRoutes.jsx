import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import MobileBottomNavigation from "../../shared/components/mobile/MobileBottomNavigation";
import MobileProtectedRoute from "./components/MobileProtectedRoute";
const MobileLogin = lazy(() => import("./pages/login/index"));

// Mobile Pages - Lazy loaded
const MobileLanding = lazy(() => import("./pages/landing/index"));
const MobileCatalog = lazy(() => import("./pages/catalog/index"));
// Categories page removed - categories are shown in catalog page
const MobileFavorites = lazy(() => import("./pages/favorites/index"));
const MobileCart = lazy(() => import("./pages/cart/index"));
const MobileOrders = lazy(() => import("./pages/orders/index"));
const MobileProfile = lazy(() => import("./pages/profile/index"));

// Mobile Loading component
const MobilePageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center relative overflow-hidden">
    {/* Modern Background Pattern */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-20 left-10 w-32 h-32 bg-green-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
      <div className="absolute top-20 right-10 w-32 h-32 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
    </div>

    <div className="relative z-10 flex flex-col items-center space-y-6">
      <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl">
        <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="text-center">
        <p className="text-gray-700 text-lg font-semibold">Yükleniyor...</p>
        <p className="text-gray-500 text-sm mt-1">Kırılmazlar Gıda hazırlanıyor</p>
      </div>
    </div>
  </div>
);

const MobileRoutes = () => {
  return (
    <div className="mobile-app h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      <Routes>
        {/* Mobile Landing Route - No auth required */}
        <Route index element={
          <Suspense fallback={<MobilePageLoader />}>
            <MobileLanding />
          </Suspense>
        } />

        {/* Mobile Login Route - No auth required */}
        <Route path="login" element={
          <Suspense fallback={<MobilePageLoader />}>
            <MobileLogin />
          </Suspense>
        } />

        {/* Authenticated Mobile Routes */}
        <Route path="*" element={
          <>
            <MobileProtectedRoute>
              {/* Mobile Content - Scrollable */}
              <div className="flex-1 overflow-y-auto mobile-content-with-nav">
                <Routes>
                  <Route path="catalog" element={
                    <Suspense fallback={<MobilePageLoader />}>
                      <MobileCatalog />
                    </Suspense>
                  } />
                  {/* Categories route removed - categories are shown in catalog page */}
                  <Route path="favorites" element={
                    <Suspense fallback={<MobilePageLoader />}>
                      <MobileFavorites />
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
            </MobileProtectedRoute>

            {/* Mobile Bottom Navigation - Fixed Bottom */}
            <MobileBottomNavigation />
          </>
        } />
      </Routes>
    </div>
  );
};

export default MobileRoutes;
