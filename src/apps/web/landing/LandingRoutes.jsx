import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

// Landing Pages - Lazy loaded for code splitting
const LandingPage = lazy(() => import("./pages/LandingPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));

// Loading component for landing routes
const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-gray-600 text-sm">Yükleniyor...</p>
    </div>
  </div>
);

const LandingRoutes = () => {
  return (
    <Routes>
      <Route index element={
        <Suspense fallback={<PageLoader />}>
          <LandingPage />
        </Suspense>
      } />
      <Route path="privacy-policy" element={
        <Suspense fallback={<PageLoader />}>
          <PrivacyPolicyPage />
        </Suspense>
      } />
      <Route path="terms-of-service" element={
        <Suspense fallback={<PageLoader />}>
          <TermsOfServicePage />
        </Suspense>
      } />
      <Route path="cookie-policy" element={
        <Suspense fallback={<PageLoader />}>
          <CookiePolicyPage />
        </Suspense>
      } />
    </Routes>
  );
};

export default LandingRoutes;
