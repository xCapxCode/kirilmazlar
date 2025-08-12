import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { logger } from '../../../utils/productionLogger';

const MobileSellerProtectedRoute = ({ children }) => {
  try {
    const { user, userProfile, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Satıcı paneli yükleniyor...</p>
          </div>
        </div>
      );
    }

    if (!user || !userProfile) {
      return <Navigate to="/login" replace />;
    }

    // Sadece seller, admin ve owner rolleri erişebilir
    if (!['seller', 'admin', 'owner'].includes(userProfile.role)) {
      logger.warn(`Unauthorized mobile seller access attempt: ${userProfile.role}`);
      return <Navigate to="/m/catalog" replace />;
    }

    return children;
  } catch (error) {
    logger.error('MobileSellerProtectedRoute error:', error);
    return <Navigate to="/login" replace />;
  }
};

export default MobileSellerProtectedRoute;