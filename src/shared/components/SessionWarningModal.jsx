/**
 * P1.3.1: Session Warning Modal Component
 * Oturum süresi uyarısı ve uzatma komponenti
 */

import { AlertTriangle, Clock, LogOut, RefreshCw } from '@utils/selectiveIcons';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SessionWarningModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(0);
  const [isExtending, setIsExtending] = useState(false);
  const { extendSession, signOut } = useAuth();

  useEffect(() => {
    const handleSessionWarning = (event) => {
      const { minutesRemaining } = event.detail;
      setMinutesRemaining(minutesRemaining);
      setIsVisible(true);
    };

    const handleSessionExtended = () => {
      setIsVisible(false);
      setIsExtending(false);
    };

    const handleSessionExpired = () => {
      setIsVisible(false);
    };

    // Listen for session events
    window.addEventListener('sessionWarning', handleSessionWarning);
    window.addEventListener('sessionExtended', handleSessionExtended);
    window.addEventListener('sessionExpired', handleSessionExpired);

    return () => {
      window.removeEventListener('sessionWarning', handleSessionWarning);
      window.removeEventListener('sessionExtended', handleSessionExtended);
      window.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, []);

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      const result = await extendSession();
      if (result.success) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Session extension failed:', error);
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsVisible(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-orange-500 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Session Uyarısı</h2>
              <p className="text-orange-100">Oturumunuz yakında sona erecek</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start space-x-3 mb-6">
            <AlertTriangle className="text-orange-500 flex-shrink-0 mt-1" size={20} />
            <div className="text-gray-700">
              <p className="font-medium mb-2">
                Oturumunuz {minutesRemaining} dakika içinde sona erecek!
              </p>
              <p className="text-sm text-gray-600">
                Oturumunuzu uzatmak için "Oturumu Uzat" butonuna tıklayın
                veya güvenli bir şekilde çıkış yapın.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleExtendSession}
              disabled={isExtending}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              {isExtending ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  <span>Uzatılıyor...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  <span>Oturumu Uzat</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <LogOut size={18} />
              <span>Güvenli Çıkış</span>
            </button>
          </div>

          {/* Info */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 flex-shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 12H7V7h2v5zm0-6H7V4h2v2z" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Güvenlik Bilgisi</p>
                <p>Oturum süresi güvenliğiniz için otomatik olarak yönetilir. Uzun süre inaktif kalınması durumunda oturum otomatik olarak sonlandırılır.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;
