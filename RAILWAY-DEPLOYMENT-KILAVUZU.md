# 🚂 RAILWAY DEPLOYMENT - KAPSAMLI KILAVUZ VE UYGULAMA REHBERİ

**Versiyon:** 2.0.0  
**Tarih:** 27 Ocak 2025  
**Platform:** Railway.app  
**Proje:** Kırılmazlar Panel v1.0

---

## 📚 İÇİNDEKİLER

1. [Railway Nedir ve Neden Kullanmalıyız?](#railway-nedir)
2. [Ön Hazırlık ve Gereksinimler](#on-hazirlik)
3. [Railway Hesap Kurulumu](#hesap-kurulumu)
4. [Proje Yapılandırması](#proje-yapilandirmasi)
5. [Database Kurulumu (PostgreSQL)](#database-kurulumu)
6. [Environment Variables](#environment-variables)
7. [Deployment Süreci](#deployment-sureci)
8. [Domain Bağlama](#domain-baglama)
9. [Monitoring ve Logging](#monitoring)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)
12. [Maliyet Optimizasyonu](#maliyet)

---

## 🎯 RAILWAY NEDİR? {#railway-nedir}

Railway, modern web uygulamalarını hızlıca deploy etmek için tasarlanmış bir **Platform-as-a-Service (PaaS)** çözümüdür. Heroku'nun alternatifi olarak görülür.

### Neden Railway?
- **Kolay Deployment:** Git push ile otomatik deploy
- **Built-in Database:** PostgreSQL, MySQL, Redis desteği
- **Auto-scaling:** Otomatik ölçeklendirme
- **SSL Sertifikası:** Ücretsiz HTTPS
- **WebSocket Desteği:** Real-time uygulamalar için
- **Docker Support:** Container tabanlı deployment
- **CI/CD Pipeline:** GitHub entegrasyonu

### Railway vs Diğer Platformlar
| Özellik | Railway | Heroku | Vercel | Netlify |
|---------|---------|--------|--------|---------|
| Backend Support | ✅ | ✅ | ❌ | ❌ |
| Database | ✅ | ✅ | ❌ | ❌ |
| WebSocket | ✅ | ✅ | ❌ | ❌ |
| Free Tier | ✅ | ❌ | ✅ | ✅ |
| Auto Deploy | ✅ | ✅ | ✅ | ✅ |

---

## 🔧 ÖN HAZIRLIK VE GEREKSİNİMLER {#on-hazirlik}

### Sistem Gereksinimleri
```bash
# Node.js versiyonu
node --version  # v18.0.0 veya üzeri

# npm versiyonu  
npm --version   # v8.0.0 veya üzeri

# Git versiyonu
git --version   # v2.0.0 veya üzeri
```

### Proje Dosya Yapısı
```
kirilmazlar-v1.0/
├── package.json          # [ZORUNLU] Dependencies ve scripts
├── package-lock.json     # [ZORUNLU] Dependency lock file
├── railway.json          # [ZORUNLU] Railway config
├── .env.production       # [ZORUNLU] Production environment
├── server.js            # [ZORUNLU] Express server
├── vite.config.mjs      # [ZORUNLU] Vite configuration
├── src/                 # [ZORUNLU] Source code
├── public/              # [ZORUNLU] Static files
├── database/            # [ÖNEMLİ] Database schemas
│   └── schema.sql       # PostgreSQL schema
├── routes/              # [ÖNEMLİ] API routes
├── middleware/          # [ÖNEMLİ] Express middleware
└── dist/               # [OTOMATİK] Build output
```

### package.json Scripts (ZORUNLU)
```json
{
  "scripts": {
    "dev": "vite --mode development",
    "build": "vite build --mode production",
    "start": "node server.js",
    "preview": "vite preview"
  }
}
```

---

## 👤 RAILWAY HESAP KURULUMU {#hesap-kurulumu}

### 1. Hesap Oluşturma
```
1. https://railway.app adresine git
2. "Start a New Project" butonuna tıkla
3. GitHub ile giriş yap (ÖNERİLEN)
4. GitHub authorization'ı onayla
5. Email doğrulaması yap
```

### 2. CLI Kurulumu (Terminal)
```bash
# Railway CLI kurulumu (Windows)
npm install -g @railway/cli

# Railway CLI kurulumu (Mac/Linux)
curl -fsSL https://railway.app/install.sh | sh

# CLI versiyonu kontrol
railway --version

# Railway'e login ol
railway login
# Browser açılacak, GitHub ile giriş yap
```

### 3. Billing Ayarları (ÖNEMLİ)
```
Dashboard → Settings → Billing
- Kredi kartı ekle (Free tier için gerekli değil)
- Usage alerts kur ($5, $10, $20)
- Spending limit belirle
```

---

## 🏗️ PROJE YAPILANDIRMASI {#proje-yapilandirmasi}

### railway.json Dosyası (KÖK DİZİN)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build",
    "watchPatterns": [
      "src/**",
      "public/**",
      "package.json",
      "vite.config.mjs"
    ]
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3,
    "numReplicas": 1,
    "sleepApplication": false
  }
}
```

### nixpacks.toml (Opsiyonel - Gelişmiş Konfigürasyon)
```toml
# Build aşaması
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-8_x"]

[phases.install]
cmds = ["npm ci --production=false"]

[phases.build]
cmds = ["npm run build"]

# Deploy aşaması
[start]
cmd = "node server.js"
```

### Dockerfile (Alternatif - Docker Deployment)
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 🗄️ DATABASE KURULUMU (PostgreSQL) {#database-kurulumu}

### 1. Railway Dashboard'dan Database Ekleme
```
1. Railway Dashboard → New Service
2. Database → PostgreSQL seç
3. "Add PostgreSQL" tıkla
4. Database otomatik provision edilecek
5. Connection string otomatik oluşacak
```

### 2. Database Environment Variables
```bash
# Railway otomatik sağlar:
DATABASE_URL=postgresql://user:pass@host:5432/railway
PGDATABASE=railway
PGHOST=containers-us-west-123.railway.app
PGPASSWORD=xxxxxxxxxxxxx
PGPORT=5432
PGUSER=postgres
```

### 3. Database Schema Yükleme
```bash
# Railway CLI ile
railway run psql $DATABASE_URL < database/schema.sql

# Veya Railway Shell
railway shell
psql $DATABASE_URL
\i database/schema.sql
\q
```

### 4. Database Bağlantı Kodu (server.js)
```javascript
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Bağlantı testi
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected:', res.rows[0]);
  }
});
```

---

## 🔐 ENVIRONMENT VARIABLES {#environment-variables}

### Railway Dashboard'da Variable Ekleme
```
1. Project → Service → Variables tab
2. "Add Variable" butonuna tıkla
3. Key-Value çiftlerini gir
4. "Add" ile kaydet
```

### Zorunlu Production Variables
```bash
# Application
NODE_ENV=production
PORT=${{PORT}}  # Railway otomatik sağlar

# Database (Railway otomatik sağlar)
DATABASE_URL=${{DATABASE_URL}}

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SESSION_SECRET=your-session-secret-min-32-chars
ENCRYPTION_KEY=your-encryption-key-32-chars

# API Configuration
API_BASE_URL=https://your-app.up.railway.app
FRONTEND_URL=https://your-app.up.railway.app

# Optional
REDIS_URL=${{REDIS_URL}}  # Redis eklediyseniz
SENTRY_DSN=your-sentry-dsn  # Error tracking
```

### .env.production Dosyası
```env
# Bu dosya build time'da kullanılır
VITE_APP_NAME="Kırılmazlar Panel"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENVIRONMENT="production"
VITE_API_BASE_URL="https://kirilmazlar.up.railway.app/api"
VITE_ENABLE_CONSOLE_LOGS="false"
VITE_STORAGE_TYPE="api"  # localStorage değil!
```

---

## 🚀 DEPLOYMENT SÜRECİ {#deployment-sureci}

### Yöntem 1: GitHub Integration (ÖNERİLEN)
```bash
# 1. GitHub repo oluştur
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/kirilmazlar.git
git push -u origin main

# 2. Railway'de GitHub bağlantısı
Railway Dashboard → New Project → Deploy from GitHub repo
→ Repository seç → Deploy
```

### Yöntem 2: Railway CLI
```bash
# Proje dizininde
cd /path/to/kirilmazlar-v1.0

# Railway projesi oluştur
railway init

# Proje adı gir
? Enter project name: kirilmazlar-panel

# Environment seç
railway environment production

# Deploy et
railway up

# Deployment durumunu kontrol et
railway status

# Logs kontrol
railway logs
```

### Yöntem 3: Docker Deployment
```bash
# Docker image build
docker build -t kirilmazlar:latest .

# Railway'e push
railway up --docker
```

### Deployment Verification Checklist
```bash
✅ Build başarılı mı?
   railway logs --build

✅ Server ayakta mı?
   curl https://your-app.up.railway.app/health

✅ Database bağlantısı var mı?
   railway run psql $DATABASE_URL -c "SELECT 1"

✅ Environment variables set mi?
   railway variables

✅ Domain çalışıyor mu?
   nslookup your-app.up.railway.app
```

---

## 🌐 DOMAIN BAĞLAMA {#domain-baglama}

### 1. Railway Subdomain (Otomatik)
```
your-app.up.railway.app
# Otomatik sağlanır, SSL dahil
```

### 2. Custom Domain Bağlama
```
1. Dashboard → Settings → Domains
2. "Add Domain" tıkla
3. Domain adını gir: kirilmazlar.com
4. DNS kayıtlarını kopyala

DNS Provider'da (Cloudflare, Namecheap vs):
- CNAME kaydı ekle:
  Name: @ veya www
  Target: your-app.up.railway.app
  
- Veya A kaydı:
  Name: @
  IP: Railway'in verdiği IP

5. Railway'de "Check Status" ile doğrula
6. SSL otomatik provision edilecek (Let's Encrypt)
```

### 3. Cloudflare Integration (Önerilen)
```
Cloudflare Dashboard:
1. DNS → Add Record
2. Type: CNAME
3. Name: @ 
4. Target: your-app.up.railway.app
5. Proxy: ON (Orange cloud)
6. SSL/TLS → Full (strict)
```

---

## 📊 MONITORING VE LOGGING {#monitoring}

### Railway Metrics Dashboard
```
Dashboard → Project → Metrics
- CPU Usage
- Memory Usage
- Network I/O
- Disk Usage
- Request count
- Response times
```

### Logging Best Practices
```javascript
// server.js - Structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Request logging
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  next();
});
```

### Health Check Endpoint
```javascript
// server.js
app.get('/health', async (req, res) => {
  try {
    // Database check
    await pool.query('SELECT 1');
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### External Monitoring (Sentry)
```javascript
// Error tracking with Sentry
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

---

## 🔧 TROUBLESHOOTING {#troubleshooting}

### Problem 1: Build Hatası
```bash
# Hata: "npm ERR! code ELIFECYCLE"
Çözüm:
1. package-lock.json sil
2. node_modules sil
3. npm cache clean --force
4. npm install
5. railway up
```

### Problem 2: Database Bağlantı Hatası
```bash
# Hata: "ECONNREFUSED" veya "ETIMEDOUT"
Çözüm:
1. DATABASE_URL doğru mu kontrol et:
   railway variables
   
2. SSL ayarını kontrol et:
   ssl: { rejectUnauthorized: false }
   
3. Connection pool ayarları:
   max: 20  # Azalt
   connectionTimeoutMillis: 5000  # Artır
```

### Problem 3: Port Hatası
```bash
# Hata: "Error: listen EADDRINUSE"
Çözüm:
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0');  # Bind to all interfaces
```

### Problem 4: Memory Limit
```bash
# Hata: "JavaScript heap out of memory"
Çözüm:
# railway.json'a ekle:
"deploy": {
  "startCommand": "node --max-old-space-size=2048 server.js"
}
```

### Problem 5: Build Cache Sorunu
```bash
# Railway CLI ile cache temizle
railway up --no-cache

# Veya Dashboard'dan
Settings → Build → Clear Cache
```

### Problem 6: Environment Variable Görünmüyor
```javascript
// Debugging için
console.log('All ENV:', process.env);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

// Railway'de variable scope kontrol et
// Service variables vs Shared variables
```

---

## ✅ BEST PRACTICES {#best-practices}

### 1. Security Best Practices
```javascript
// Helmet.js kullan
import helmet from 'helmet';
app.use(helmet());

// Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// CORS configuration
import cors from 'cors';
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### 2. Performance Optimization
```javascript
// Compression
import compression from 'compression';
app.use(compression());

// Static file caching
app.use(express.static('dist', {
  maxAge: '1y',
  etag: false
}));

// Database connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. Zero-Downtime Deployment
```json
// railway.json
{
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ROLLING",
    "numReplicas": 2
  }
}
```

### 4. Environment-Specific Config
```javascript
// config/index.js
const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    debug: true
  },
  production: {
    apiUrl: process.env.API_URL,
    debug: false
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

### 5. Graceful Shutdown
```javascript
// server.js
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    pool.end(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
```

---

## 💰 MALİYET OPTİMİZASYONU {#maliyet}

### Railway Pricing (2025)
```
Hobby Plan: $5/month
- 8 GB RAM
- 8 vCPU
- $0.000463/GB-hour memory
- $0.000463/vCPU-hour

Pro Plan: $20/month
- Unlimited resources
- Team collaboration
- Priority support
```

### Maliyet Azaltma Taktikleri

#### 1. Sleep Mode Kullan
```json
// railway.json - Gece saatlerinde uyut
{
  "deploy": {
    "sleepApplication": true,
    "minInstances": 0,
    "maxInstances": 1
  }
}
```

#### 2. Resource Limits
```json
{
  "deploy": {
    "memoryLimit": "512Mi",
    "cpuLimit": "0.5"
  }
}
```

#### 3. Build Optimization
```javascript
// Sadece production dependencies
npm ci --production

// Tree shaking ve minification
vite build --mode production
```

#### 4. Database Optimization
```sql
-- Unused data temizleme
DELETE FROM logs WHERE created_at < NOW() - INTERVAL '30 days';

-- Index optimization
CREATE INDEX idx_orders_created ON orders(created_at);

-- Connection pooling
-- Max connection sayısını azalt
```

#### 5. CDN Kullanımı
```javascript
// Static assets için Cloudflare CDN
app.use('/static', express.static('public', {
  maxAge: '1y',
  immutable: true
}));
```

---

## 📝 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Git repository hazır
- [ ] package.json scripts doğru
- [ ] railway.json mevcut
- [ ] .env.production hazır
- [ ] Database schema hazır
- [ ] Build locally test edildi

### Deployment
- [ ] Railway hesabı açıldı
- [ ] GitHub bağlantısı yapıldı
- [ ] PostgreSQL eklendi
- [ ] Environment variables set edildi
- [ ] Deploy triggered
- [ ] Build başarılı

### Post-Deployment
- [ ] Health check çalışıyor
- [ ] Database bağlantısı OK
- [ ] API endpoints çalışıyor
- [ ] Frontend erişilebilir
- [ ] SSL sertifikası aktif
- [ ] Monitoring kuruldu

---

## 🆘 ACİL DURUM PROSEDÜRÜ

### Sistem Çöktüğünde
```bash
# 1. Logs kontrol
railway logs --lines=100

# 2. Rollback yap
railway rollback

# 3. Database backup
railway run pg_dump $DATABASE_URL > backup.sql

# 4. Emergency maintenance mode
railway variables set MAINTENANCE_MODE=true
```

### Data Recovery
```bash
# Backup restore
railway run psql $DATABASE_URL < backup.sql

# Data integrity check
railway run psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

---

## 📚 KAYNAKLAR VE DÖKÜMANTASYON

### Official Documentation
- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Nixpacks](https://nixpacks.com/docs)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)

### Community Resources
- [Railway Discord](https://discord.gg/railway)
- [Railway Blog](https://blog.railway.app)
- [Railway Templates](https://railway.app/templates)

### Useful Commands Cheat Sheet
```bash
# Railway CLI Commands
railway login          # Login
railway init          # Initialize project
railway up            # Deploy
railway logs          # View logs
railway status        # Deployment status
railway variables     # List env vars
railway shell         # Open shell
railway run [cmd]     # Run command
railway rollback      # Rollback deployment
railway down          # Stop service

# Database Commands
railway run psql $DATABASE_URL              # Connect to DB
railway run pg_dump $DATABASE_URL > backup.sql  # Backup
railway run psql $DATABASE_URL < schema.sql     # Import
```

---

## 🎯 SONUÇ

Bu kılavuz, Railway'de başarılı bir deployment için gereken tüm adımları içermektedir. Önemli noktalar:

1. **LocalStorage'dan kurtul** - Gerçek database kullan
2. **Environment variables** - Hassas bilgileri kod içinde tutma
3. **Health checks** - Sistem durumunu sürekli kontrol et
4. **Monitoring** - Hataları erken yakala
5. **Backup stratejisi** - Veri kaybına karşı hazırlıklı ol

**ÖNEMLİ:** Bu deployment yapılmadan önce **localStorage bağımlılığı mutlaka kaldırılmalı** ve tüm servisler **API endpoint'lerini kullanacak şekilde güncellenmeli**.

---

**Son Güncelleme:** 27 Ocak 2025  
**Hazırlayan:** Opus AI Architecture Team  
**Proje:** Kırılmazlar Panel v1.0