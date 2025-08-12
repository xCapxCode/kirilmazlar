import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes as RouterRoutes, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useBreakpoint } from "./hooks/useBreakpoint";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import ScrollToTop from "./shared/components/ScrollToTop";
import { logger } from "./utils/productionLogger";

// Lazy loaded components
const LandingRoutes = lazy(() => import("./apps/web/landing/LandingRoutes"));
const SellerRoutes = lazy(() => import("./apps/admin/seller/SellerRoutes"));
const CustomerRoutes = lazy(() => import("./apps/customer/CustomerRoutes"));
const MobileRoutes = lazy(() => import("./apps/mobile/MobileRoutes"));
const MobileSellerRoutes = lazy(() => import("./apps/mobile/MobileSellerRoutes"));
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

    if (userProfile.role !== 'seller' && userProfile.role !== 'admin' && userProfile.role !== 'owner') {
      return <Navigate to="/customer/catalog" replace />;
    }

    return children;
  } catch (error) {
    logger.error('SellerProtectedRoute error:', error);
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
    logger.error('CustomerProtectedRoute error:', error);
    return <Navigate to="/login" replace />;
  }
};

// Device Detection and Auto-Redirect Component
const DeviceRedirect = ({ children }) => {
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Delay to prevent rapid redirects
    const timeoutId = setTimeout(() => {
      console.log('🔄 Processing redirect logic...', {
        isMobile,
        pathname: location.pathname,
        shouldRedirectToMobile: isMobile && !location.pathname.startsWith('/m') && !location.pathname.startsWith('/ms'),
        shouldRedirectToDesktop: !isMobile && (location.pathname.startsWith('/m') || location.pathname.startsWith('/ms'))
      });

      // Eğer mobil cihazda ve mobil route'da değilse
      if (isMobile && !location.pathname.startsWith('/m') && !location.pathname.startsWith('/ms')) {
        console.log('📱 Redirecting to mobile...');
        if (location.pathname === '/') {
          navigate('/m', { replace: true });
        }
        else if (location.pathname === '/login') {
          navigate('/m/login', { replace: true });
        }
        else if (location.pathname.startsWith('/customer/')) {
          const mobilePath = location.pathname.replace('/customer/', '/m/');
          navigate(mobilePath, { replace: true });
        }
        else if (location.pathname.startsWith('/seller/')) {
          const mobileSellerPath = location.pathname.replace('/seller/', '/ms/');
          navigate(mobileSellerPath, { replace: true });
        }
      }
      // Eğer desktop'ta ve mobil route'daysa
      else if (!isMobile && (location.pathname === '/m' || location.pathname.startsWith('/m/') || location.pathname.startsWith('/ms'))) {
        console.log('🖥️ Redirecting to desktop from:', location.pathname);

        if (location.pathname === '/m') {
          console.log('🖥️ Redirecting /m to /');
          navigate('/', { replace: true });
        }
        else if (location.pathname === '/m/login') {
          navigate('/login', { replace: true });
        }
        else if (location.pathname.startsWith('/m/') && location.pathname !== '/m') {
          const desktopPath = location.pathname.replace('/m/', '/customer/');
          navigate(desktopPath, { replace: true });
        }
        else if (location.pathname.startsWith('/ms/')) {
          const desktopPath = location.pathname.replace('/ms/', '/seller/');
          navigate(desktopPath, { replace: true });
        }
      }
    }, 200); // Increased delay

    return () => clearTimeout(timeoutId);
  }, [isMobile, location.pathname, navigate]);

  return children;
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
        <DeviceRedirect>
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

            {/* Mobile Customer App Routes */}
            <Route
              path="/m/*"
              element={
                <Suspense fallback={<LoadingComponent />}>
                  <MobileRoutes />
                </Suspense>
              }
            />

            {/* Mobile Seller App Routes */}
            <Route
              path="/ms/*"
              element={
                <GeneralProtectedRoute>
                  <Suspense fallback={<LoadingComponent />}>
                    <MobileSellerRoutes />
                  </Suspense>
                </GeneralProtectedRoute>
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
        </DeviceRedirect>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
