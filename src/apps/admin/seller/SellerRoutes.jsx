import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import BottomTabNavigation from "../../../shared/components/ui/BottomTabNavigation";

// Seller Pages - Lazy loaded for code splitting
const SellerDashboard = lazy(() => import("./pages/dashboard"));
const ProductManagement = lazy(() => import("./pages/products"));
const OrderManagement = lazy(() => import("./pages/orders"));
const CustomerManagement = lazy(() => import("./pages/customers"));
const GeneralSettings = lazy(() => import("./pages/settings"));

// Loading component for seller routes
const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-gray-600 text-sm">Sayfa yükleniyor...</p>
    </div>
  </div>
);

const SellerRoutes = () => {
  return (
    <>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={
          <Suspense fallback={<PageLoader />}>
            <SellerDashboard />
          </Suspense>
        } />
        <Route path="products" element={
          <Suspense fallback={<PageLoader />}>
            <ProductManagement />
          </Suspense>
        } />
        <Route path="orders" element={
          <Suspense fallback={<PageLoader />}>
            <OrderManagement />
          </Suspense>
        } />
        <Route path="customers" element={
          <Suspense fallback={<PageLoader />}>
            <CustomerManagement />
          </Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<PageLoader />}>
            <GeneralSettings />
          </Suspense>
        } />
      </Routes>
      <BottomTabNavigation />
    </>
  );
};

export default SellerRoutes;
