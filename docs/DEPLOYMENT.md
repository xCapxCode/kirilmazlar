# KIRILMAZLAR Panel - Deployment Kılavuzu

Bu belge, KIRILMAZLAR Panel uygulamasının production ortamına deploy edilmesi için gerekli adımları içerir.

## Ön Koşullar

- Node.js (v16 veya üzeri)
- npm (v7 veya üzeri)
- Git

## Kurulum Adımları

### 1. Kaynak Kodunu İndirme

```bash
git clone https://github.com/kirilmazlar/panel.git
cd panel
```

### 2. Bağımlılıkları Yükleme

```bash
npm install
```

### 3. Ortam Değişkenlerini Yapılandırma

`.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değişkenleri ayarlayın:

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```
NODE_ENV=production
API_URL=https://api.kirilmazlar.com
```

### 4. Production Build Oluşturma

```bash
npm run build
```

Bu komut, `dist` klasöründe optimize edilmiş bir build oluşturacaktır.

### 5. Uygulamayı Çalıştırma

#### Statik Hosting (Önerilen)

Build edilen dosyaları bir statik hosting hizmetine (Netlify, Vercel, GitHub Pages vb.) yükleyebilirsiniz.

#### Yerel Sunucu

Yerel bir sunucu kullanmak için:

```bash
npm install -g serve
serve -s dist
```

## Veri Yönetimi

### Veri Migrasyonu

Uygulama ilk çalıştırıldığında otomatik olarak veri migrasyonu gerçekleştirir. Ancak manuel olarak migrasyon yapmak için:

```javascript
import { migrationManager } from './src/core/migration';
await migrationManager.migrateAll();
```

### Veri Yedekleme ve Geri Yükleme

Veri yedekleme ve geri yükleme işlemleri için uygulama içindeki "Ayarlar > Veri Yönetimi" bölümünü kullanabilirsiniz.

Manuel olarak yedekleme yapmak için:

```javascript
import { backupManager } from './src/core/backup';
await backupManager.createBackup();
```

## Güvenlik Önlemleri

1. **HTTPS Kullanımı**: Uygulamayı her zaman HTTPS üzerinden sunun.
2. **Çerez Güvenliği**: Çerezleri HttpOnly ve Secure olarak ayarlayın.
3. **Content Security Policy**: CSP başlıklarını yapılandırın.
4. **Güncel Bağımlılıklar**: Bağımlılıkları düzenli olarak güncelleyin.

## Performans Optimizasyonu

1. **Lazy Loading**: Büyük bileşenler için lazy loading kullanılmıştır.
2. **Code Splitting**: Bundle boyutunu küçültmek için code splitting uygulanmıştır.
3. **Memoization**: Gereksiz yeniden render'ları önlemek için memoization kullanılmıştır.
4. **Image Optimization**: Görüntüler optimize edilmiştir.

## Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

1. **Beyaz Ekran Hatası**:
   - Konsol hatalarını kontrol edin
   - `.env` dosyasının doğru yapılandırıldığından emin olun

2. **API Bağlantı Hataları**:
   - API URL'sinin doğru olduğunu kontrol edin
   - CORS ayarlarını kontrol edin

3. **Veri Senkronizasyon Sorunları**:
   - Tarayıcı önbelleğini temizleyin
   - Uygulamayı yeniden başlatın

### Destek

Sorunlarınız için destek almak için:

- E-posta: support@kirilmazlar.com
- Telefon: +90 555 123 4567

## Güncelleme Prosedürü

1. Kaynak kodunu güncelleyin:
   ```bash
   git pull origin main
   ```

2. Bağımlılıkları güncelleyin:
   ```bash
   npm install
   ```

3. Yeni bir build oluşturun:
   ```bash
   npm run build
   ```

4. Uygulamayı yeniden başlatın.

## Rollback Prosedürü

Bir sorun olması durumunda önceki sürüme geri dönmek için:

1. Git ile önceki sürüme dönün:
   ```bash
   git checkout [önceki_sürüm_etiketi]
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Yeni bir build oluşturun:
   ```bash
   npm run build
   ```

4. Uygulamayı yeniden başlatın.

5. Veri yedeklerinden geri yükleme yapın.