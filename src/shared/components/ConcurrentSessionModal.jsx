/**
 * P1.3.2: Concurrent Session Detection Modal Component
 * Eşzamanlı oturum tespiti ve uyarı komponenti
 */

import { AlertTriangle, LogOut, RefreshCw, Users } from '@utils/selectiveIcons';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ConcurrentSessionModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { signOut } = useAuth();

  useEffect(() => {
    const handleConcurrentSessionDetected = (event) => {
      const { currentSessionId, newerSessionId, newerSessionStart, reason } = event.detail;
      setSessionInfo({
        currentSessionId,
        newerSessionId,
        newerSessionStart,
        reason,
        detectedAt: Date.now()
      });
      setIsVisible(true);
    };

    // Listen for concurrent session events
    window.addEventListener('concurrentSessionDetected', handleConcurrentSessionDetected);

    return () => {
      window.removeEventListener('concurrentSessionDetected', handleConcurrentSessionDetected);
    };
  }, []);

  const handleForceLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setIsVisible(false);
    } catch (error) {
      logger.error('Force logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR');
  };

  if (!isVisible || !sessionInfo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-red-500 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Çoklu Oturum Tespiti</h2>
              <p className="text-red-100">Hesabınızda başka bir oturum açıldı</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start space-x-3 mb-6">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" size={20} />
            <div className="text-gray-700">
              <p className="font-medium mb-2">Güvenlik Uyarısı!</p>
              <p className="text-sm text-gray-600 mb-4">
                Hesabınız başka bir cihaz veya tarayıcı sekmesinde açıldı.
                Güvenliğiniz için sadece bir oturum aktif kalabilir.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Yeni Oturum:</span>
                  <span className="text-gray-600 ml-2">
                    {formatTime(sessionInfo.newerSessionStart)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Tespit Zamanı:</span>
                  <span className="text-gray-600 ml-2">
                    {formatTime(sessionInfo.detectedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleForceLogout}
              disabled={isLoggingOut}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              {isLoggingOut ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  <span>Çıkış yapılıyor...</span>
                </>
              ) : (
                <>
                  <LogOut size={18} />
                  <span>Güvenli Çıkış Yap</span>
                </>
              )}
            </button>
          </div>

          {/* Security Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 flex-shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 12H7V7h2v5zm0-6H7V4h2v2z" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Güvenlik Bilgisi</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Hesabınızın güvenliği için tek oturum politikası uygulanır</li>
                  <li>Başka bir cihazdan giriş yapıldığında diğer oturumlar sonlandırılır</li>
                  <li>Şüpheli aktivite tespit edilirse hesabınızı güvende tutmak için otomatik koruma devreye girer</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Technical Info (Development mode) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Teknik Bilgi (Dev Mode)</p>
                <p><span className="font-medium">Reason:</span> {sessionInfo.reason}</p>
                <p><span className="font-medium">Current Session:</span> {sessionInfo.currentSessionId}</p>
                <p><span className="font-medium">Newer Session:</span> {sessionInfo.newerSessionId}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConcurrentSessionModal;
