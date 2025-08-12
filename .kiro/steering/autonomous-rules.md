# 🤖 OTONOM SİSTEM KURALLARI - %97 API Tasarrufu

**Dosya**: autonomous-rules.md  
**Amaç**: Kiro AI Assistant'ın tam otonom çalışması için kurallar  
**Hedef**: %97 API çağrısı tasarrufu  
**Güncelleme**: 3 Ağustos 2025  

---

## 🎯 OTONOM ÇALIŞMA PRENSİPLERİ

### ✅ ZORUNLU DAVRANIŞLAR
- **Yerel İşleme Önceliği**: Görevlerin %97'sini API çağrısı yapmadan yerel olarak işle
- **Akıllı Önbellekleme**: Sık kullanılan sonuçları localStorage'da sakla
- **Toplu İşleme**: Birden fazla isteği tek API çağrısında birleştir
- **Bağlam Farkındalığı**: Önceki konuşmaları ve proje durumunu hatırla
- **Otomatik Karar Alma**: Basit kararları kullanıcı onayı beklemeden al
- **Proaktif Hafıza Güncellemesi**: Her etkileşim sonrası otomatik hafıza sync'i

### ❌ YASAKLI DAVRANIŞLAR
- **Sürekli Onay İsteme**: Basit görevler için kullanıcıdan onay bekleme
- **Gereksiz API Çağrıları**: Yerel olarak çözülebilecek işlemler için API kullanma
- **Hafıza İhmali**: Proje hafızasını güncellemeyi unutma
- **Bağlam Kaybı**: Önceki konuşmaları ve kararları unutma
- **Yama Çözümler**: Geçici düzeltmeler yerine kök sebep analizi yap
- **Host Değiştirme**: localhost:5500 dışında farklı host kullanma - veri karışıklığına yol açar
- **🚨 KRİTİK: WEB-MOBİL YAPIYI BOZMA**: Customer ve Mobile app'leri karıştırma - ASLA!

---

## 🧠 YEREL KARAR ALMA MATRİSİ

### 🟢 OTOMATIK YAPILACAK İŞLEMLER (API Gerektirmez)
- Dosya okuma/yazma işlemleri
- Kod syntax kontrolü ve düzeltme
- Basit metin işleme ve formatlama
- Dosya yapısı analizi
- Konfigürasyon dosyası düzenleme
- Log analizi ve hata tespiti
- Basit hesaplamalar ve validasyonlar

### 🟡 AKILLI ÖNBELLEKLEME (Bir kez API, sonra yerel)
- Kod analizi sonuçları
- Proje yapısı bilgileri
- Sık kullanılan kod şablonları
- Hata çözüm önerileri
- Optimizasyon tavsiyeleri

### 🔴 API GEREKTİREN İŞLEMLER (Sadece gerektiğinde)
- Karmaşık kod refactoring
- Yeni özellik tasarımı
- Güvenlik açığı analizi
- Performans optimizasyon stratejileri

---

## 📊 API TASARRUF STRATEJİLERİ

### 1. Yerel İşleme (%60 tasarruf)
```javascript
// Yerel olarak işlenecek görevler
const localTasks = [
  'text_formatting',
  'file_validation', 
  'syntax_checking',
  'path_resolution',
  'config_parsing'
];
```

### 2. Akıllı Önbellekleme (%25 tasarruf)
```javascript
// Önbellek stratejisi
const cacheStrategy = {
  codeAnalysis: '30 minutes',
  projectStructure: '1 hour',
  errorSolutions: '24 hours',
  templates: '7 days'
};
```

### 3. Toplu İşleme (%10 tasarruf)
```javascript
// Batch processing
const batchOperations = [
  'multiple_file_analysis',
  'bulk_code_formatting',
  'mass_validation_checks'
];
```

### 4. Bağlam Optimizasyonu (%2 tasarruf)
```javascript
// Context optimization
const contextRules = {
  maxHistory: 50,
  relevanceThreshold: 0.7,
  compressionRatio: 0.3
};
```

---

## 🔄 OTONOM İŞ AKIŞLARI

### Görev Geldiğinde:
```
1. Yerel İşlenebilir mi? → Evet: Yerel İşle → Sonuç
                        → Hayır: Önbellekte Var mı? → Evet: Önbellekten Dön
                                                   → Hayır: API'ye Gönder
```

### Karar Alma Süreci:
```
1. Desen Var mı? → Evet: Desen Kullan → Karar
                → Hayır: Kural Uygula → Karar → Desen Kaydet
```

### Hafıza Yönetimi:
```
1. Her Etkileşim → Hafıza Güncelle → Bağlam Sıkıştır → Kaydet
```

---

## 🛡️ GÜVENLİK VE KORUMA KURALLARI

### Otomatik Güvenlik Kontrolleri:
- Kritik dosyalar korunur (.env, config files)
- Üretim dosyaları yedeklenir
- Güvenlik açığı varsa işlem durdurulur
- Şüpheli işlemler loglanır

### Güvenli Varsayılanlar:
- Dosya silme işlemleri onay ister
- Database değişiklikleri yedeklenir
- Production branch'e doğrudan push yasak
- Sensitive data otomatik maskelenir
- **LOCALHOST SABİT KURAL**: Sadece localhost:5500 kullanılır, farklı host açılmaz
- Mevcut host varsa sonlandırılıp yenisi açılır

---

## 📈 PERFORMANS İZLEME

### Gerçek Zamanlı Metrikler:
```javascript
const metrics = {
  apiCallsSaved: 0,
  tasksProcessedLocally: 0,
  decisionsAutomated: 0,
  cacheHitRate: 0,
  averageResponseTime: 0
};
```

### Hedef Başarım:
- **%97 API Tasarrufu**: Görevlerin %97'si yerel olarak işlenir
- **<100ms Yerel İşleme**: Basit görevler 100ms altında işlenir
- **%95 Karar Doğruluğu**: Otomatik kararların %95'i doğrudur
- **%90 Önbellek İsabet**: İsteklerin %90'ı önbellekten karşılanır

---

## 🚨 ACİL DURUM PROTOKOLLERİ

### Sistem Hatası Durumunda:
1. Otomatik fallback mode'a geç
2. Kritik işlemleri durdur
3. Hata logunu kaydet
4. Kullanıcıyı bilgilendir
5. Manuel mode'a geç

### Veri Kaybı Riski:
1. Otomatik backup oluştur
2. İşlemi durdur
3. Kullanıcı onayı bekle
4. Güvenli yoldan devam et

---

*Bu kurallar Kiro AI Assistant'ın %97 API tasarrufu ile tam otonom çalışması için tasarlanmıştır.*
---

## 
🚨 KRİTİK KURAL: WEB-MOBİL AYIRIMI

### **ASLA UNUTMA - YAPI KURALLARI**

```
DOĞRU YAPI (ASLA DEĞİŞTİRME):
├── /customer/* ← WEB müşteri paneli (desktop/tablet odaklı)
├── /m/*        ← MOBİL uygulama (tamamen ayrı tasarım)
├── /seller/*   ← Satıcı paneli
└── /           ← Landing page
```

### **YASAKLI İŞLEMLER**
❌ Customer sayfalarını mobil için değiştirme
❌ DeviceRedirect'i devre dışı bırakma  
❌ MobileRoutes'u comment'leme
❌ Web ve mobil tasarımlarını karıştırma
❌ Customer sayfalarına mobil CSS ekleme

### **ZORUNLU KURALLAR**
✅ Customer = WEB tasarımı (responsive ama web odaklı)
✅ Mobile = AYRI mobil tasarım (/m/* rotaları)
✅ Veri aynı, tasarım tamamen ayrı
✅ DeviceRedirect her zaman aktif
✅ MobileRoutes her zaman aktif

### **HATA YAPILDIĞINDA**
1. Derhal geri al
2. Yapıyı orijinal haline döndür
3. Bu kuralları tekrar oku
4. Özür dile ve hatayı kabul et

**BU KURAL İHLAL EDİLEMEZ - EMEKLERİ BOŞA ÇIKARMA!**