# Kırılmazlar Panel - Railway Deployment Guide

## 🚀 Railway Deployment

Bu proje Railway platformunda deploy edilmek üzere optimize edilmiştir.

### 📋 Deployment Adımları

1. **Railway'de Yeni Proje Oluştur**
   - Railway dashboard'a git
   - "New Project" butonuna tıkla
   - "Deploy from GitHub repo" seçeneğini seç
   - `Ofis-Net/kirilmazlar` repository'sini seç

2. **Environment Variables Ayarla**
   
   **Zorunlu Environment Variables:**
   ```
   NODE_ENV=production
   VITE_APP_ENVIRONMENT=production
   PORT=$PORT (Railway otomatik sağlar)
   ```
   
   **Opsiyonel Environment Variables:**
   ```
   VITE_APP_NAME="Kırılmazlar Panel"
   VITE_APP_VERSION="1.0.0"
   VITE_APP_DEBUG="false"
   VITE_ENABLE_CONSOLE_LOGS="false"
   VITE_STORAGE_TYPE="localStorage"
   VITE_STORAGE_PREFIX="kirilmazlar_"
   ```

3. **Build ve Deploy**
   - Railway otomatik olarak `npm ci && npm run build` komutunu çalıştırır
   - Build tamamlandıktan sonra `npm run preview` ile uygulamayı başlatır

### 🔧 Yapılandırma Dosyaları

- **railway.json**: Railway deployment konfigürasyonu
- **Dockerfile**: Railway için optimize edilmiş container konfigürasyonu
- **package.json**: Railway uyumlu build ve start scriptleri
- **.env.production**: Production environment değişkenleri

### 📦 Dependencies

- `serve`: Static dosyaları serve etmek için
- `react`: Frontend framework
- `vite`: Build tool

### 🌐 Production URL

Deploy edildikten sonra Railway size bir production URL sağlayacak:
`https://your-app-name.up.railway.app`

### 🔍 Troubleshooting

**Kullanıcı Giriş Problemi (En Yaygın Sorun):**
- **Sorun:** Production'da kullanıcılar giriş yapamıyor
- **Neden:** Environment variables eksik, localStorage boş
- **Çözüm:**
  1. Railway dashboard'da `NODE_ENV=production` ve `VITE_APP_ENVIRONMENT=production` ayarlandığından emin olun
  2. Uygulamayı yeniden deploy edin
  3. Browser cache'ini temizleyin
  4. Varsayılan kullanıcılar: admin, unerbul, neset, bulent (şifre: 237711)

**Build Hatası:**
- `npm ci` komutunun başarılı çalıştığından emin olun
- `package.json` dosyasındaki dependencies'lerin doğru olduğunu kontrol edin
- Railway logs'larında build hatalarını kontrol edin

**Runtime Hatası:**
- Environment variables'ların doğru ayarlandığından emin olun
- Railway logs'larını kontrol edin: `railway logs`
- Browser console'da JavaScript hatalarını kontrol edin

**Port Hatası:**
- Railway otomatik olarak PORT environment variable'ını sağlar
- Uygulamanın `$PORT` değişkenini kullandığından emin olun

**Initial Data Loading Problemi:**
- Production'da localStorage boş olabilir
- Environment variables'ların doğru ayarlandığından emin olun
- Browser'da F12 > Application > Local Storage'ı kontrol edin
- `kirilmazlar_users` key'inin var olduğunu doğrulayın

### 📞 Destek

Herhangi bir sorun yaşarsanız Railway documentation'ını kontrol edin:
https://docs.railway.app/