# 🚀 Railway Deployment Guide - Kırılmazlar Panel

Bu rehber, Kırılmazlar Panel uygulamasının Railway platformuna deployment sürecini detaylandırır.

## 📋 Ön Gereksinimler

### 1. Railway CLI Kurulumu
```bash
npm install -g @railway/cli
```

### 2. Railway Hesabı
- [Railway.app](https://railway.app) üzerinden hesap oluşturun
- GitHub hesabınızla bağlantı kurun

### 3. Proje Hazırlığı
```bash
# Environment dosyalarını kontrol edin
npm run env:validate

# Eksik environment dosyalarını oluşturun
npm run env:generate

# Environment özeti görüntüleyin
npm run env:summary
```

## 🔧 Deployment Süreci

### Otomatik Deployment (Önerilen)
```bash
# Tek komutla deployment
npm run railway:deploy
```

Bu komut şunları yapar:
- ✅ Railway CLI kontrolü
- ✅ Authentication doğrulaması
- ✅ Environment validation
- ✅ Production build
- ✅ Environment variables ayarlama
- ✅ Railway'e deployment
- ✅ Deployment bilgilerini gösterme

### Manuel Deployment

#### 1. Railway'e Giriş
```bash
npm run railway:login
# veya
railway login
```

#### 2. Proje Oluşturma
```bash
railway init
```

#### 3. Environment Variables Ayarlama
```bash
# Production environment variables'ları Railway'e yükle
railway variables set NODE_ENV=production
railway variables set VITE_APP_ENVIRONMENT=production
railway variables set VITE_APP_DEBUG=false
# ... diğer variables
```

#### 4. Deployment
```bash
railway up
```

## 🔍 Deployment Sonrası Kontroller

### Status Kontrolü
```bash
npm run railway:status
```

### Log İnceleme
```bash
npm run railway:logs
```

### Domain Bilgisi
```bash
npm run railway:domain
```

### Environment Variables Kontrolü
```bash
npm run railway:variables
```

## 📁 Dosya Yapısı

```
├── railway.json              # Railway konfigürasyonu
├── Dockerfile               # Container konfigürasyonu
├── .env.production          # Production environment variables
├── scripts/
│   ├── railway-deploy.js    # Otomatik deployment script
│   └── validate-environment.js # Environment validation
└── RAILWAY_DEPLOYMENT.md    # Bu dosya
```

## ⚙️ Railway Konfigürasyonu

### railway.json Özellikleri

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "buildCommand": "npm ci --production=false && npm run build",
    "watchPatterns": ["src/**", "public/**"]
  },
  "deploy": {
    "healthcheckPath": "/",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "numReplicas": 1
  }
}
```

### Environment Variables

#### Zorunlu Variables
- `NODE_ENV=production`
- `VITE_APP_ENVIRONMENT=production`
- `VITE_APP_NAME="Kırılmazlar Panel"`
- `VITE_APP_VERSION="1.0.0"`
- `PORT=3000`

#### Güvenlik Variables
- `VITE_APP_DEBUG=false`
- `VITE_ENABLE_CONSOLE_LOGS=false`
- `VITE_ENABLE_DEVELOPER_TOOLS=false`
- `VITE_ENABLE_CSP=true`
- `VITE_ENABLE_HTTPS=true`

#### Performance Variables
- `VITE_BUILD_SOURCEMAP=false`
- `VITE_BUILD_MINIFY=true`
- `VITE_ENABLE_SERVICE_WORKER=true`

## 🐳 Docker Konfigürasyonu

### Multi-stage Build
1. **Builder Stage**: Ubuntu tabanlı Node.js environment
2. **Production Stage**: Optimized runtime environment

### Özellikler
- ✅ Ubuntu 22.04 tabanlı (Alpine eliminasyonu)
- ✅ Node.js 20 LTS
- ✅ Non-root user (güvenlik)
- ✅ Health check
- ✅ Serve ile static hosting

## 🔒 Güvenlik Önlemleri

### Production Hardening
- Debug modları kapatılmış
- Console logları devre dışı
- Developer tools kapatılmış
- CSP (Content Security Policy) aktif
- HTTPS zorunlu
- Source map'ler gizli

### Container Security
- Non-root user kullanımı
- Minimal attack surface
- Health check monitoring

## 📊 Monitoring ve Maintenance

### Log Monitoring
```bash
# Real-time logs
railway logs --follow

# Son 100 log
railway logs --tail 100
```

### Performance Monitoring
- Railway dashboard üzerinden metrics
- Health check status
- Resource usage tracking

### Backup Strategy
- Environment variables backup
- Database backup (eğer kullanılıyorsa)
- Code repository backup

## 🚨 Troubleshooting

### Yaygın Sorunlar

#### Build Hatası
```bash
# Local build test
npm run build

# Dependencies kontrolü
npm audit
npm audit fix
```

#### Environment Variable Hatası
```bash
# Validation çalıştır
npm run env:validate

# Variables kontrol et
railway variables
```

#### Deployment Hatası
```bash
# Status kontrol et
railway status

# Logs incele
railway logs

# Redeploy
railway up --detach
```

### Debug Komutları
```bash
# Railway project info
railway status

# Service details
railway service

# Environment info
railway variables

# Recent deployments
railway deployments
```

## 🔄 CI/CD Integration

### GitHub Actions (Opsiyonel)
```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 📞 Destek

### Railway Destek
- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway GitHub](https://github.com/railwayapp)

### Proje Destek
- GitHub Issues
- Development team iletişim

---

**Not**: Bu deployment guide, Kırılmazlar Panel v1.0 için optimize edilmiştir. Güncellemeler için repository'yi takip edin.