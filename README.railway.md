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
   ```
   NODE_ENV=production
   PORT=$PORT (Railway otomatik sağlar)
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

**Build Hatası:**
- `npm ci` komutunun başarılı çalıştığından emin olun
- `package.json` dosyasındaki dependencies'lerin doğru olduğunu kontrol edin

**Runtime Hatası:**
- Environment variables'ların doğru ayarlandığından emin olun
- Railway logs'larını kontrol edin

**Port Hatası:**
- Railway otomatik olarak PORT environment variable'ını sağlar
- Uygulamanın `$PORT` değişkenini kullandığından emin olun

### 📞 Destek

Herhangi bir sorun yaşarsanız Railway documentation'ını kontrol edin:
https://docs.railway.app/