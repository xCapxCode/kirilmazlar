# Uygulama Proje Geliştirirken Nelere Dikkat Edilmeli

**Tarih:** 30.07.2025  
**Kaynak:** Kırılmazlar Projesi Analiz Sonuçları  
**Amaç:** Yeni projeler için güvenli, stabil ve sürdürülebilir yapı rehberi

## 🎯 PROJE BAŞLANGIÇ CHECKLİSTİ

### 1. PROJE ADI VE YAPILANDIRMA

**✅ DOĞRU ADLANDIRMA:**
```json
{
  "name": "proje-ismi-gercek", // Gerçek işlevi yansıtsın
  "description": "Açık ve net tanım", // Ne yaptığını belirt
  "version": "1.0.0", // Semantic versioning
  "private": true // Internal projeler için
}
```

**❌ YANLIŞ ADLANDIRMA:**
```json
{
  "name": "proje-monorepo", // Monorepo değilse kullanma
  "description": "Proje", // Belirsiz tanımlar
}
```

### 2. GÜVENLİK ÖNCE - KRİTİK AYARLAR

**🚨 VİTE GÜVENLİK AÇIKLARI:**
```javascript
// vite.config.mjs - TEHLİKELİ AYARLAR
export default defineConfig({
  server: {
    fs: {
      allow: ['..'] // ❌ ASLA KULLANMA! Directory Traversal riski
    }
  }
})

// ✅ GÜVENLİ AYAR
export default defineConfig({
  server: {
    fs: {
      strict: true // Güvenli dosya erişimi
    }
  }
})
```

**🔐 GENEL GÜVENLİK PRENSİPLERİ:**
- Üst dizinlere erişim verme
- .env dosyalarını git'e koyma
- API anahtarlarını kod içine yazma
- Production'da debug modunu açık bırakma

### 3. BAĞIMLILIK YÖNETİMİ

**📦 STABLE SÜRÜMLER KULLAN:**
```json
{
  "dependencies": {
    "express": "^4.19.2", // ✅ Stable LTS sürüm
    "react": "^18.3.1",   // ✅ Güncel stable
    "vue": "^3.3.0"       // ✅ Production ready
  },
  "devDependencies": {
    "vite": "^4.4.5",     // ✅ Stable sürüm
    "eslint": "^8.45.0"   // ✅ Yaygın kullanılan
  }
}
```

**❌ BETA/ALPHA SÜRÜMLER:**
```json
{
  "dependencies": {
    "express": "^5.1.0",     // ❌ Beta sürüm - production riski
    "react": "19.0.0-beta",  // ❌ Beta - beklenmedik hatalar
    "some-lib": "1.0.0-rc.1" // ❌ Release candidate - kararsız
  }
}
```

**🔍 BAĞIMLILIK KONTROL KOMUTLARI:**
```bash
npm outdated              # Güncel olmayan paketleri listele
npm audit                 # Güvenlik açıklarını tara
npm audit fix             # Otomatik güvenlik güncellemeleri
npm ls                    # Bağımlılık ağacını görüntüle
```

### 4. KOD KALİTESİ VE LİNTİNG

**🎯 ESLINT YAPILANDIRMA:**
```javascript
// eslint.config.js
export default [
  {
    ignores: [
      "dist/",
      "node_modules/",
      // "packages/", // ❌ Packages'ı ignore etme!
      ".github/",
      "public/"
    ]
  },
  {
    rules: {
      "react/prop-types": "error", // ✅ Sıkı kontrol
      "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
      "no-unused-vars": "error", // ✅ Kullanılmayan değişkenler hata
      "prefer-const": "error"    // ✅ Modern JS practices
    }
  }
]
```

**📏 KOD KALİTESİ PRENSİPLERİ:**
- Her yeni component için PropTypes tanımla
- TypeScript kullanıyorsan interface'leri sıkı tut
- ESLint kurallarını "warn" değil "error" yap
- Prettier ile kod formatını otomatikleştir
- Husky ile commit öncesi kontroller

### 5. PROJE YAPISI VE MİMARİ

**🏗️ MONOREPO vs SINGLE REPO:**

**Gerçek Monorepo (Büyük projeler için):**
```json
{
  "name": "company-monorepo",
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```
```
project/
├── packages/
│   ├── ui-components/
│   ├── shared-utils/
│   └── api-client/
├── apps/
│   ├── admin-panel/
│   ├── customer-app/
│   └── mobile-app/
```

**Single Repo (Çoğu proje için):**
```json
{
  "name": "proje-ismi",
  // workspaces yok
}
```
```
project/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── services/
```

**🤔 KARAR VERME KRİTERLERİ:**
- **Monorepo:** 3+ ayrı uygulama, paylaşılan kütüphaneler, büyük ekip
- **Single Repo:** Tek uygulama, küçük/orta ekip, basit yapı

### 6. TEST VE QA YAPILANDIRMA

**🧪 TEST SETUP:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "vitest": "^0.33.0",
    "@testing-library/react": "^16.3.0",
    "playwright": "^1.40.0"
  }
}
```

**📋 TEST STRATEJİSİ:**
- Unit testler: Component'lar ve utility fonksiyonlar
- Integration testler: Sayfa akışları
- E2E testler: Kritik kullanıcı senaryoları
- %80+ kod coverage hedefle

### 7. DEVELOPMeNT vs PRODUCTION

**🔧 DEVELOPMENT AYARLARI:**
```javascript
// vite.config.mjs
export default defineConfig({
  server: {
    port: 5500,
    host: 'localhost',
    strictPort: true
  },
  define: {
    __DEV__: true
  }
})
```

**🚀 PRODUCTION AYARLARI:**
```javascript
export default defineConfig({
  build: {
    minify: true,
    sourcemap: false, // Güvenlik için
    outDir: 'dist'
  },
  define: {
    __DEV__: false
  }
})
```

### 8. DOCKER VE DEPLOYMENT

**🐳 DOCKER YAPILANDIRMA:**
```dockerfile
# Dockerfile - Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**📋 DEPLOYMENT CHECKLİST:**
- Environment variables güvenli mi?
- Health check endpoint'i var mı?
- Error logging aktif mi?
- Backup stratejisi hazır mı?

### 9. GİT VE VERSION CONTROL

**📝 GIT YAPILANDIRMA:**
```bash
# .gitignore essentials
node_modules/
dist/
.env
.env.local
*.log
coverage/
.DS_Store
```

**🏷️ COMMIT CONVENTIONS:**
```
feat: yeni özellik eklendi
fix: hata düzeltildi
docs: dokümantasyon güncellendi
style: kod formatı düzeltildi
refactor: kod iyileştirildi
test: test eklendi/güncellendi
chore: yapılandırma değişiklikleri
```

### 10. PERFORMANS VE ÖPTİMİZASYON

**⚡ PERFORMANS PRENSİPLERİ:**
- Bundle size'ı düzenli kontrol et
- Lazy loading kullan
- Image optimization yap
- Tree shaking etkin mi kontrol et
- Core Web Vitals'ı takip et

**📊 MONITORING ARAÇLARI:**
```json
{
  "scripts": {
    "analyze": "npm run build && npx vite-bundle-analyzer",
    "lighthouse": "lighthouse http://localhost:3000",
    "size-check": "bundlesize"
  }
}
```

## 🚨 KRİTİK HATALAR VE ÇÖZÜMLER

### HATA 1: Directory Traversal Güvenlik Açığı
**Problem:** `fs: { allow: ['..'] }`
**Çözüm:** `fs: { strict: true }` kullan

### HATA 2: Beta Sürüm Kullanımı
**Problem:** `express@^5.1.0`
**Çözüm:** `express@^4.19.2` stable sürüm

### HATA 3: Yanlış Monorepo İddiası
**Problem:** İsimde "monorepo" ama workspaces yok
**Çözüm:** Gerçek ismi kullan veya gerçek monorepo yap

### HATA 4: Zayıf Lint Kontrolleri
**Problem:** `"react/prop-types": "warn"`
**Çözüm:** `"react/prop-types": "error"`

### HATA 5: Packages Ignore
**Problem:** ESLint packages dizinini ignore ediyor
**Çözüm:** packages/ ignore listesinden çıkar

## 💡 PROAKTİF ÖNLeMLeR

### PROJE BAŞINDA YAP:
1. `npm audit` çalıştır
2. `.env.example` oluştur
3. README.md düzenle
4. ESLint + Prettier kur
5. Git hooks ekle (Husky)
6. CI/CD pipeline'ı hazırla

### HER COMMIT ÖNCESİ:
1. `npm run lint` geçiyor mu?
2. `npm test` başarılı mı?
3. Build alınıyor mu?
4. Security check yapıldı mı?

### HAFTALIK KONTROLLER:
1. `npm outdated` kontrol et
2. `npm audit` güvenlik tarama
3. Bundle size büyümüş mü?
4. Performance metrics kontrol

## 🎯 SONUÇ VE TAVSİYELER

**EN ÖNEMLİ PRENSİPLER:**
1. **Güvenlik önce** - Hiçbir convenience güvenlikten önemli değil
2. **Stable sürümler** - Production'da beta kullanma
3. **Doğru adlandırma** - İsim işlevi yansıtsın
4. **Sıkı kontroller** - Lint ve test katı olsun
5. **Sürekli izleme** - Dependencies, security, performance

**PROJE BAŞINDA KENDIN ŞUNU SOR:**
- Bu gerçekten monorepo mu?
- Tüm dependencies production-ready mi?
- Güvenlik açıklarını kontrol ettim mi?
- Kod kalitesi kontrolleri yeterli mi?
- İleriki scaling planım ne?

Bu rehberi takip ederek hem başından sonu planlanmış hem de güvenli projeler geliştirebilirsin. Unutma: "Hızlı çıkmak için yavaş git" - Başında doğru yapılan proje sonradan sorun çıkarmaz.

---

**Bu dokümantasyonu düzenli güncelle** - Yeni projelerden öğrendiklerini ekle, best practice'leri geliştir.
