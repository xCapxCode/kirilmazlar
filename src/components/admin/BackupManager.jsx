import React, { useState } from 'react';
import { Download, Upload, Shield, AlertTriangle } from 'lucide-react';
import storageInstance from '@core/storage';

const BackupManager = () => {
  const [backupStatus, setBackupStatus] = useState(null);
  const [restoreFile, setRestoreFile] = useState(null);

  // localStorage'dan backup oluştur
  const createBackup = () => {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        source: 'localStorage',
        data: {},
        metadata: {
          totalKeys: 0,
          dataSize: 0,
          hostname: window.location.hostname
        }
      };

      // Tüm storage verilerini topla
      const keys = storageInstance.getAllKeys();
      keys.forEach(key => {
        const rawValue = storageInstance.getRaw(key);
        backup.data[key] = {
          raw: rawValue,
          size: rawValue ? rawValue.length : 0
        };

        // JSON parse etmeye çalış
        try {
          if (key !== 'data_version' && key !== 'device_id') {
            backup.data[key].parsed = JSON.parse(rawValue);
          }
        } catch (e) {
          backup.data[key].parseError = e.message;
        }

        backup.metadata.totalKeys++;
        backup.metadata.dataSize += rawValue ? rawValue.length : 0;
      });

      // JSON dosyası olarak indir
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kirilmazlar-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupStatus({
        success: true,
        message: `Backup oluşturuldu: ${backup.metadata.totalKeys} anahtar, ${(backup.metadata.dataSize / 1024).toFixed(2)} KB`
      });
    } catch (error) {
      setBackupStatus({
        success: false,
        message: `Backup hatası: ${error.message}`
      });
    }
  };

  // Backup dosyasından restore et
  const restoreBackup = (backupData) => {
    try {
      let restoredCount = 0;

      // Mevcut verileri temizle
      if (window.confirm('Mevcut localStorage verilerini temizlemek istiyor musunuz?')) {
        storageInstance.clear();
      }

      // Backup verilerini restore et
      Object.entries(backupData.data).forEach(([key, value]) => {
        try {
          storageInstance.setRaw(key, value.raw);
          restoredCount++;
        } catch (error) {
          console.error(`Restore failed for ${key}:`, error);
        }
      });

      setBackupStatus({
        success: true,
        message: `Restore tamamlandı: ${restoredCount} anahtar restore edildi`
      });

      // Sayfayı yenile
      if (window.confirm('Değişikliklerin etkili olması için sayfayı yenilemek istiyor musunuz?')) {
        window.location.reload();
      }
    } catch (error) {
      setBackupStatus({
        success: false,
        message: `Restore hatası: ${error.message}`
      });
    }
  };

  // Dosya yükleme
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          setRestoreFile(backupData);
        } catch (error) {
          setBackupStatus({
            success: false,
            message: 'Geçersiz JSON dosyası'
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Veri Yedekleme Yöneticisi</h3>
      </div>

      {/* Uyarı */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Kritik Uyarı</h4>
            <p className="text-sm text-yellow-700 mt-1">
              PostgreSQL geçişi öncesi tüm localStorage verilerinizi yedekleyin!
              Bu işlem veri kaybını önlemek için kritik öneme sahiptir.
            </p>
          </div>
        </div>
      </div>

      {/* Backup Oluştur */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Download className="w-4 h-4" />
            Yedek Oluştur
          </h4>
          <p className="text-sm text-gray-600">
            Mevcut localStorage verilerini JSON formatında indir
          </p>
          <button
            onClick={createBackup}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Backup İndir
          </button>
        </div>

        {/* Restore */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Yedek Geri Yükle
          </h4>
          <p className="text-sm text-gray-600">
            Backup JSON dosyasından verileri geri yükle
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {restoreFile && (
            <button
              onClick={() => restoreBackup(restoreFile)}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Restore Et
            </button>
          )}
        </div>
      </div>

      {/* Status */}
      {backupStatus && (
        <div className={`mt-4 p-3 rounded-lg ${
          backupStatus.success 
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {backupStatus.message}
        </div>
      )}

      {/* Storage Info */}
      <div className="mt-6 pt-4 border-t">
        <h4 className="font-medium mb-2">Mevcut Storage Durumu</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Toplam Anahtar: {storageInstance.getAllKeys().length}</div>
          <div>Kullanılan Alan: {(storageInstance.getStorageUsage() / 1024).toFixed(2)} KB</div>
          <div>Prefix: {storageInstance.prefix}</div>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;