import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const MobileProtectedRoute = ({ children }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return <Navigate to="/m/login" replace />;
  }

  if (userProfile.role !== 'customer') {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return children;
};

export default MobileProtectedRoute;
