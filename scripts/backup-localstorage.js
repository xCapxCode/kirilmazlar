/**
 * KIRILMAZLAR v1.0 - ACİL VERİ YEDEKLEME SİSTEMİ
 * localStorage verilerini güvenli JSON formatında export eder
 * Kritik veri kaybını önlemek için tasarlanmıştır
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LocalStorageBackup {
  constructor() {
    this.prefix = 'kirilmazlar_';
    this.backupDir = path.join(__dirname, '../backups');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Backup klasörünü oluştur
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Browser localStorage'dan veri çekme simülasyonu
  // Gerçek kullanımda browser console'dan çalıştırılacak
  generateBrowserScript() {
    return `
// BROWSER CONSOLE'DA ÇALIŞTIR - localStorage Yedekleme
(function() {
  const prefix = 'kirilmazlar_';
  const backup = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    source: 'localStorage',
    data: {},
    metadata: {
      totalKeys: 0,
      dataSize: 0,
      hostname: window.location.hostname,
      userAgent: navigator.userAgent
    }
  };

  // Tüm kirilmazlar verilerini topla
  Object.keys(localStorage)
    .filter(key => key.startsWith(prefix))
    .forEach(fullKey => {
      const key = fullKey.replace(prefix, '');
      const rawValue = localStorage.getItem(fullKey);
      
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

  // Backup'ı JSON olarak indir
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`kirilmazlar-backup-\${new Date().toISOString().replace(/[:.]/g, '-')}.json\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('✅ Backup oluşturuldu:', backup.metadata);
  return backup;
})();
`;
  }

  // Yedekleme scriptini dosyaya yaz
  createBackupScript() {
    const scriptContent = this.generateBrowserScript();
    const scriptPath = path.join(this.backupDir, `backup-script-${this.timestamp}.js`);
    
    fs.writeFileSync(scriptPath, scriptContent, 'utf8');
    
    return {
      scriptPath,
      instructions: [
        '1. Tarayıcıda uygulamayı aç (localhost:5173)',
        '2. F12 ile Developer Tools aç',
        '3. Console sekmesine git',
        '4. Aşağıdaki scripti kopyala ve yapıştır:',
        '',
        scriptContent,
        '',
        '5. Enter tuşuna bas',
        '6. Otomatik olarak backup dosyası indirilecek'
      ]
    };
  }

  // Restore scripti oluştur
  createRestoreScript() {
    const restoreScript = `
// BROWSER CONSOLE'DA ÇALIŞTIR - localStorage Restore
// Önce backup JSON dosyasını yükle
function restoreFromBackup(backupData) {
  const prefix = 'kirilmazlar_';
  let restoredCount = 0;
  
  console.log('🔄 Restore başlatılıyor...');
  
  // Mevcut verileri temizle (isteğe bağlı)
  const confirmClear = confirm('Mevcut localStorage verilerini temizlemek istiyor musunuz?');
  if (confirmClear) {
    Object.keys(localStorage)
      .filter(key => key.startsWith(prefix))
      .forEach(key => localStorage.removeItem(key));
    console.log('🧹 Mevcut veriler temizlendi');
  }
  
  // Backup verilerini restore et
  Object.entries(backupData.data).forEach(([key, value]) => {
    try {
      localStorage.setItem(prefix + key, value.raw);
      restoredCount++;
      console.log(\`✅ Restored: \${key}\`);
    } catch (error) {
      console.error(\`❌ Restore failed for \${key}:\`, error);
    }
  });
  
  console.log(\`✅ Restore tamamlandı: \${restoredCount} anahtar restore edildi\`);
  
  // Sayfayı yenile
  if (confirm('Değişikliklerin etkili olması için sayfayı yenilemek istiyor musunuz?')) {
    window.location.reload();
  }
}

// Kullanım:
// 1. Backup JSON dosyasını aç
// 2. İçeriği kopyala
// 3. const backupData = {BURAYA_YAPISTIR};
// 4. restoreFromBackup(backupData);
`;

    const restorePath = path.join(this.backupDir, `restore-script-${this.timestamp}.js`);
    fs.writeFileSync(restorePath, restoreScript, 'utf8');
    
    return restorePath;
  }

  // Ana yedekleme işlemi
  execute() {
    console.log('🚨 ACİL VERİ YEDEKLEME SİSTEMİ BAŞLATILIYOR...');
    
    const backup = this.createBackupScript();
    const restore = this.createRestoreScript();
    
    // README dosyası oluştur
    const readmePath = path.join(this.backupDir, `README-${this.timestamp}.md`);
    const readmeContent = `
# KIRILMAZLAR v1.0 - ACİL VERİ YEDEKLEME

## 📅 Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}

## 🎯 Amaç
PostgreSQL geçişi öncesi localStorage verilerinin güvenli yedeklenmesi

## 📁 Dosyalar
- \`backup-script-${this.timestamp}.js\` - Yedekleme scripti
- \`restore-script-${this.timestamp}.js\` - Geri yükleme scripti
- \`README-${this.timestamp}.md\` - Bu dosya

## 🚀 Yedekleme Adımları

### 1. Tarayıcıda Yedekleme
${backup.instructions.map(line => line ? `   ${line}` : '').join('\n')}

### 2. Yedekleme Doğrulama
- İndirilen JSON dosyasını aç
- \`metadata.totalKeys\` sayısını kontrol et
- \`data\` objesinde tüm anahtarların olduğunu doğrula

## 🔄 Geri Yükleme
1. \`restore-script-${this.timestamp}.js\` dosyasını aç
2. İçindeki talimatları takip et
3. Backup JSON dosyasını kullan

## ⚠️ Önemli Notlar
- Bu yedekleme localStorage tabanlı sistemin son durumunu saklar
- PostgreSQL geçişi sonrası bu veriler referans olarak kullanılacak
- Yedekleme dosyalarını güvenli bir yerde sakla
- Restore işlemi mevcut verileri siler!

## 📊 Beklenen Veri Türleri
- \`products\` - Ürün verileri
- \`orders\` - Sipariş verileri  
- \`users\` - Kullanıcı verileri
- \`customers\` - Müşteri verileri
- \`categories\` - Kategori verileri
- \`business_info\` - İşletme bilgileri
- \`data_version\` - Veri versiyonu
- \`device_id\` - Cihaz kimliği
`;
    
    fs.writeFileSync(readmePath, readmeContent, 'utf8');
    
    return {
      success: true,
      backupDir: this.backupDir,
      files: {
        backupScript: backup.scriptPath,
        restoreScript: restore,
        readme: readmePath
      },
      instructions: backup.instructions
    };
  }
}

// Script çalıştır
if (import.meta.url === `file://${process.argv[1]}`) {
  const backup = new LocalStorageBackup();
  const result = backup.execute();
  
  console.log('✅ Yedekleme sistemi hazırlandı:');
  console.log('📁 Backup klasörü:', result.backupDir);
  console.log('📄 Dosyalar:', Object.values(result.files));
  console.log('');
  console.log('🚀 ŞİMDİ YAPILACAKLAR:');
  console.log('1. Tarayıcıda localhost:5173 aç');
  console.log('2. F12 > Console');
  console.log('3. Backup scriptini çalıştır');
  console.log('4. JSON dosyasını indir ve sakla');
}

export default LocalStorageBackup;