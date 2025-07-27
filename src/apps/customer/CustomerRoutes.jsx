import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import BottomTabNavigation from "../../shared/components/ui/BottomTabNavigation";

// Customer Pages - Lazy loaded for code splitting
const ProductCatalog = lazy(() => import("./pages/catalog"));
const Cart = lazy(() => import("./pages/cart"));
const OrderHistory = lazy(() => import("./pages/orders"));
const CustomerProfile = lazy(() => import("./pages/profile"));

// Loading component for customer routes
const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-gray-600 text-sm">Sayfa yükleniyor...</p>
    </div>
  </div>
);

const CustomerRoutes = () => {
  return (
    <>
      <Routes>
        <Route index element={<Navigate to="catalog" replace />} />
        <Route path="catalog" element={
          <Suspense fallback={<PageLoader />}>
            <ProductCatalog />
          </Suspense>
        } />
        <Route path="cart" element={
          <Suspense fallback={<PageLoader />}>
            <Cart />
          </Suspense>
        } />
        <Route path="orders" element={
          <Suspense fallback={<PageLoader />}>
            <OrderHistory />
          </Suspense>
        } />
        <Route path="profile" element={
          <Suspense fallback={<PageLoader />}>
            <CustomerProfile />
          </Suspense>
        } />
      </Routes>
      <BottomTabNavigation />
    </>
  );
};

export default CustomerRoutes;
