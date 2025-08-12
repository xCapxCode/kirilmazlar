/**
 * KIRILMAZLAR Panel - Veri Yedekleme ve Geri Yükleme Yardımcı Sınıfı
 * 
 * Bu dosya, verilerin yedeklenmesi ve geri yüklenmesi için gerekli fonksiyonları içerir.
 */

import storage from '@core/storage';
import logger from '@utils/productionLogger';
import { schemaVersions } from '../schema';

class BackupManager {
  constructor() {
    this.dataTypes = [
      'products',
      'orders',
      'customerOrders',
      'sellerOrders',
      'customers',
      'users',
      'business_info',
      'units',
      'price_settings',
      'order_settings',
      'notification_settings',
      'accounts',
      'roles'
    ];
  }

  /**
   * Tüm verileri yedekler ve indirilebilir bir JSON dosyası oluşturur
   */
  async createBackup() {
    try {
      logger.info('🔄 Veri yedekleme başlatılıyor...');

      // Tüm verileri topla
      const backupData = {
        metadata: {
          timestamp: new Date().toISOString(),
          schemaVersions: { ...schemaVersions },
          appVersion: '1.0.0'
        },
        data: {}
      };

      // Her veri tipini yedekle
      for (const dataType of this.dataTypes) {
        const data = storage.get(dataType, null);
        if (data !== null) {
          backupData.data[dataType] = data;
        }
      }

      // JSON dosyası oluştur
      const backupJson = JSON.stringify(backupData, null, 2);
      const blob = new Blob([backupJson], { type: 'application/json' });

      // Dosya adı oluştur
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `kirilmazlar_backup_${timestamp}.json`;

      // Dosyayı indir
      this.downloadBlob(blob, fileName);

      logger.info('✅ Veri yedekleme tamamlandı');
      return true;
    } catch (error) {
      logger.error('❌ Veri yedekleme sırasında hata:', error);
      return false;
    }
  }

  /**
   * Yedek dosyasından verileri geri yükler
   */
  async restoreBackup(backupFile) {
    try {
      logger.info('🔄 Veri geri yükleme başlatılıyor...');

      // Dosyayı oku
      const backupData = await this.readBackupFile(backupFile);

      if (!backupData || !backupData.metadata || !backupData.data) {
        throw new Error('Geçersiz yedek dosyası formatı');
      }

      // Şema versiyonlarını kontrol et
      const backupSchemaVersions = backupData.metadata.schemaVersions || {};
      for (const [dataType, version] of Object.entries(schemaVersions)) {
        if (backupSchemaVersions[dataType] !== version) {
          logger.warn(`⚠️ ${dataType} için şema versiyonu uyumsuz: ${backupSchemaVersions[dataType]} -> ${version}`);
        }
      }

      // Verileri geri yükle
      for (const [dataType, data] of Object.entries(backupData.data)) {
        if (this.dataTypes.includes(dataType)) {
          storage.set(dataType, data);
          logger.info(`✅ ${dataType} verisi geri yüklendi`);
        }
      }

      // Şema versiyonlarını güncelle
      storage.set('schema_versions', schemaVersions);

      logger.info('✅ Veri geri yükleme tamamlandı');
      return true;
    } catch (error) {
      logger.error('❌ Veri geri yükleme sırasında hata:', error);
      return false;
    }
  }

  /**
   * Blob'u indirilebilir dosya olarak sunar
   */
  downloadBlob(blob, fileName) {
    // Tarayıcı ortamında çalışıyorsa
    if (typeof window !== 'undefined' && window.document) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      logger.warn('⚠️ Tarayıcı ortamı dışında indirme işlemi yapılamaz');
    }
  }

  /**
   * Yedek dosyasını okur ve JSON olarak parse eder
   */
  async readBackupFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('Dosya JSON formatında değil'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Dosya okunamadı'));
      };

      reader.readAsText(file);
    });
  }
}

export const backupManager = new BackupManager();
export default backupManager;
