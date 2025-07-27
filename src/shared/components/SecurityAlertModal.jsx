import { AlertTriangle, Info, Shield, X } from '@utils/selectiveIcons';
import { useEffect, useState } from 'react';
import securityMonitorService from '../../services/securityMonitorService';

const SecurityAlertModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const [securityStats, setSecurityStats] = useState(null);

  useEffect(() => {
    // Listen for security threats
    const handleSecurityThreat = (securityEvent) => {
      // Show modal for high and critical threats
      if (securityEvent.severity === 'HIGH' || securityEvent.severity === 'CRITICAL') {
        setAlertData(securityEvent);
        setIsVisible(true);

        // Update security stats
        const stats = securityMonitorService.getSecurityStatistics();
        setSecurityStats(stats);
      }
    };

    // Listen for session invalidation
    const handleSessionInvalidation = (event) => {
      setAlertData({
        type: 'SESSION_INVALIDATION',
        description: `Güvenlik nedeniyle oturum sonlandırıldı: ${event.detail.reason}`,
        severity: 'CRITICAL',
        metadata: event.detail
      });
      setIsVisible(true);
    };

    // Add security callback
    securityMonitorService.onSecurityThreat(handleSecurityThreat);
    window.addEventListener('sessionSecurityInvalidation', handleSessionInvalidation);

    return () => {
      securityMonitorService.offSecurityThreat(handleSecurityThreat);
      window.removeEventListener('sessionSecurityInvalidation', handleSessionInvalidation);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setAlertData(null);
  };

  const handleViewDetails = () => {
    // Show detailed security information
    const recentEvents = securityMonitorService.getRecentSecurityEvents(10);
    console.log('🔒 Recent Security Events:', recentEvents);

    const stats = securityMonitorService.getSecurityStatistics();
    console.log('🔒 Security Statistics:', stats);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  const formatSecurityMessage = (alertData) => {
    if (!alertData) return '';

    switch (alertData.type) {
      case 'FAILED_LOGIN':
        return `Çok sayıda başarısız giriş denemesi tespit edildi. Hesabınızın güvenliği için ek önlemler alınıyor.`;
      case 'SUSPICIOUS_IP_CHANGE':
        return `Farklı IP adreslerinden erişim tespit edildi. Hesabınız izleniyor.`;
      case 'RAPID_REQUESTS':
        return `Olağandışı hızlı istek trafiği tespit edildi. Bot aktivitesi şüphesi.`;
      case 'INVALID_TOKEN_ATTEMPT':
        return `Geçersiz token kullanım denemeleri tespit edildi. Hesap güvenliği tehlike altında olabilir.`;
      case 'PROFILE_TAMPERING':
        return `Profil verilerinizde yetkisiz değişiklik denemeleri tespit edildi.`;
      case 'STORAGE_TAMPERING':
        return `Tarayıcı veri depolamanızda şüpheli değişiklikler tespit edildi.`;
      case 'SESSION_INVALIDATION':
        return alertData.description;
      default:
        return alertData.description || 'Güvenlik tehdidi tespit edildi.';
    }
  };

  if (!isVisible || !alertData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-2 rounded-t-lg ${getSeverityColor(alertData.severity)}`}>
          <div className="flex items-center space-x-3">
            {getSeverityIcon(alertData.severity)}
            <div>
              <h3 className="font-semibold text-lg">
                Güvenlik Uyarısı
              </h3>
              <p className="text-sm opacity-75">
                Tehdit Seviyesi: {alertData.severity}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">
              {formatSecurityMessage(alertData)}
            </p>
          </div>

          {/* Security Stats */}
          {securityStats && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Güvenlik Durumu
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Son 24 Saat:</span>
                  <span className="ml-2 font-medium">{securityStats.last24Hours} olay</span>
                </div>
                <div>
                  <span className="text-gray-600">Son 1 Saat:</span>
                  <span className="ml-2 font-medium">{securityStats.lastHour} olay</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Mevcut Tehdit Seviyesi:</span>
                  <span className={`ml-2 font-medium ${securityStats.currentThreatLevel === 'CRITICAL' ? 'text-red-600' :
                    securityStats.currentThreatLevel === 'HIGH' ? 'text-orange-600' :
                      securityStats.currentThreatLevel === 'MEDIUM' ? 'text-yellow-600' :
                        'text-green-600'
                    }`}>
                    {securityStats.currentThreatLevel}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-800 mb-2">Önerilen İşlemler:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {alertData.severity === 'CRITICAL' && (
                <>
                  <li>• Şifrenizi değiştirin</li>
                  <li>• Tüm cihazlardan çıkış yapın</li>
                  <li>• İki faktörlü doğrulamayı etkinleştirin</li>
                </>
              )}
              {(alertData.severity === 'HIGH' || alertData.severity === 'CRITICAL') && (
                <>
                  <li>• Hesap aktivitelerinizi kontrol edin</li>
                  <li>• Şüpheli giriş denemelerini bildirin</li>
                </>
              )}
              <li>• Güvenli bir ağ kullandığınızdan emin olun</li>
              <li>• Tarayıcınızı güncel tutun</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-4 border-t">
          <button
            onClick={handleViewDetails}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Detayları Gör
          </button>
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlertModal;
