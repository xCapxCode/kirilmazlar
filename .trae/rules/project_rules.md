# 🚨 OPUS-xGEN RULES: SIFIR HATA GARANTİLİ AGENT KURALLARI

## ⛔ KRİTİK HATALAR - ASLA YAPMA (CEZA RİSKİ VAR!)

### 🔴 EN ÖNEMLİ 10 YASAK
```
1. ❌ localStorage/sessionStorage KULLANMA - Artifact'te çalışmaz!
2. ❌ Backend olmadan deploy YAPMA - Sadece frontend yetmez!  
3. ❌ Database bağlantısı olmadan proje bitmiş SANMA!
4. ❌ Environment variables tanımlamadan production'a GEÇME!
5. ❌ API endpoints olmadan veri işlemi YAPMA!
6. ❌ CORS ayarı yapmadan API KULLANMA!
7. ❌ Authentication olmadan user sistemi KURMA!
8. ❌ Web/mobil için ayrı tasarım YAPMA - Tek responsive yeter!
9. ❌ Test etmeden deploy ETME!
10. ❌ Eksik bilgide soru SORMA - Varsayım yap, devam et!
```

### 🔴 DEPLOYMENT HATALARI
```
YANLIŞ ❌: GitHub'a push = Deploy oldu (HAYIR!)
YANLIŞ ❌: Frontend hazır = Proje bitti (HAYIR!)
YANLIŞ ❌: Vercel'e at = Çalışır (HAYIR!)

DOĞRU ✅: Backend + Frontend + Database + Env Variables = Deploy
```

---

## ✅ HER PROJEDE ZORUNLU 7 ADIM

### ADIM 1: FULLSTACK YAPISI
```javascript
// ZORUNLU DOSYA YAPISI
project/
├── backend/           // ✅ API endpoints
│   ├── api/          // ✅ Route handlers
│   ├── db/           // ✅ Database connection
│   └── auth/         // ✅ Authentication
├── frontend/         // ✅ UI components
│   ├── components/   // ✅ Responsive design
│   └── pages/        // ✅ Routes
├── .env.example      // ✅ Environment template
├── .env.local        // ✅ Actual variables
└── package.json      // ✅ Scripts & dependencies
```

### ADIM 2: DATABASE BAĞLANTISI
```javascript
// ✅ HER ZAMAN database bağlantısı kur
// Supabase örneği:
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,  // ✅ Environment variable
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Database tabloları oluştur
CREATE TABLE users (id, email, password_hash)
CREATE TABLE data (id, user_id, content)
```

### ADIM 3: BACKEND API ENDPOINTS  
```javascript
// ✅ MUTLAKA backend API yaz
// Next.js örneği: pages/api/[endpoint].js

export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  // ✅ Error handling
  try {
    // ✅ Database operation
    const data = await supabase.from('table').select()
    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
```

### ADIM 4: STATE MANAGEMENT (localStorage YERİNE)
```javascript
// ❌ YANLIŞ: localStorage.setItem('data', value)
// ✅ DOĞRU - Development için:
const [data, setData] = useState(initialValue)

// ✅ DOĞRU - Production için:
await supabase.from('user_data').insert({ data })
await supabase.from('user_data').select()
```

### ADIM 5: RESPONSIVE DESIGN
```css
/* ✅ TEK TASARIM - TÜM CİHAZLAR */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

@media (max-width: 768px) {
  /* Tablet/Mobile */
  .grid { grid-template-columns: 1fr; }
}

/* ✅ Tailwind kullanıyorsan: */
className="w-full md:w-1/2 lg:w-1/3 p-4"
```

### ADIM 6: ENVIRONMENT SETUP
```bash
# ✅ .env.local dosyası (ZORUNLU)
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_here
API_URL=http://localhost:3000/api

# ✅ Vercel'de environment variables ekle
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### ADIM 7: DEPLOYMENT CHECKLIST
```bash
# ✅ Deploy öncesi MUTLAKA kontrol et:
□ npm run build - Hatasız mı?
□ npm run start - Local'de çalışıyor mu?
□ Database bağlantısı aktif mi?
□ API endpoints test edildi mi? 
□ Environment variables tanımlandı mı?
□ Authentication çalışıyor mu?
□ Mobile'da test edildi mi?
```

---

## 🎯 API VERİMLİLİK - %95+ BAŞARI İÇİN

### TEK SEFERDE TAM ÇÖZÜM
```
KURAL 1: Soru sorma, varsayım yap
KURAL 2: Eksik bilgide endüstri standardı kullan
KURAL 3: İlk denemede çalışan kod yaz
KURAL 4: Tüm dosyaları tek seferde oluştur
KURAL 5: Deploy instructions dahil et
```

### VARSAYIMLAR ŞABLONU
```javascript
// Kullanıcı belirtmediyse bunları kullan:
Database: Supabase (PostgreSQL)
Auth: Supabase Auth veya NextAuth
Styling: Tailwind CSS
Deploy: Vercel + Supabase
State: React useState/useContext
Forms: React Hook Form + Zod
API: Next.js API Routes
```

### İLETİŞİM PROTOKOLÜ
```
1. TALEP LİSTESİ: "Anladım, şunları yapacağım:" 
2. ONAY BEKLE: Kullanıcı onaylayana kadar BAŞLAMA
3. UYGULA: Tüm adımları sırayla tamamla
4. RAPORLA: "✅ Tamamlandı" + deploy URL
```

---

## 🚀 TECH STACK KOMBİNASYONLARI

### COMBO 1: Next.js + Supabase + Vercel (ÖNERİLEN)
```javascript
// Proje yapısı
next-app/
├── app/
│   ├── api/          // Backend routes
│   ├── auth/         // Auth pages
│   └── (pages)/      // Frontend pages
├── components/       // Reusable components
├── lib/
│   └── supabase.js   // Database client
├── middleware.ts     // Auth middleware
└── .env.local       // Environment vars

// Deployment
1. Supabase'de proje oluştur
2. Database tablolarını oluştur
3. Environment variables'ı Vercel'e ekle
4. vercel --prod ile deploy et
```

### COMBO 2: React + Express + Railway
```javascript
// Proje yapısı
fullstack-app/
├── server/
│   ├── index.js      // Express server
│   ├── routes/       // API endpoints
│   └── db/           // Database config
├── client/
│   ├── src/          // React app
│   └── build/        // Production build
├── Dockerfile        // Container config
└── railway.toml      // Deploy config

// Deployment
1. railway login
2. railway link
3. railway up
```

---

## 🔍 ROOT CAUSE ANALİZ ŞABLONU

### HER PROBLEM İÇİN SOR:
```
1. SEBEP: Gerçek sorun ne? (Belirti değil, kök sebep)
2. ETKİ: Hangi sistemler etkilenir?
3. ÇÖZÜM: Fullstack çözüm gerekli mi?
4. RİSK: Deploy'da sorun çıkar mı?
5. TEST: Nasıl test edilecek?
```

---

## ⚠️ EN SIK YAPILAN 10 HATA

```
1. "GitHub'a pushladım, neden çalışmıyor?" → Backend yok!
2. "Vercel'de 500 hatası" → Environment variables yok!
3. "Data kayboldu" → localStorage kullanmışsın, database yok!
4. "Mobile'da bozuk" → Responsive yapmamışsın!
5. "Login çalışmıyor" → Authentication backend'i yok!
6. "API çağrısı hata veriyor" → CORS ayarı yok!
7. "Database bağlanmıyor" → Connection string yanlış!
8. "Deploy başarısız" → Build hatası var, test etmemişsin!
9. "Sadece localhost'ta çalışıyor" → Production env yok!
10. "Supabase hata veriyor" → RLS policies tanımlı değil!
```

---

## ✅ BAŞARI KRİTERLERİ

### PROJE TAMAMLAMA CHECKLİST
```
□ Backend API endpoints yazıldı
□ Frontend responsive tasarlandı  
□ Database schema oluşturuldu
□ Authentication sistemi kuruldu
□ Environment variables tanımlandı
□ Local'de test edildi
□ Production'a deploy edildi
□ Mobile/tablet test edildi
□ Kullanıcı dokümantasyonu hazır
□ Deploy URL'i paylaşıldı
```

### KALİTE METRİKLERİ
```
✅ İlk denemede çalışma: %95+
✅ Deploy başarı oranı: %100
✅ Responsive uyumluluk: %100
✅ API response time: <500ms
✅ Error rate: <%1
```

---

## 📝 HIZLI BAŞLANGIÇ ŞABLONLARI

### E-COMMERCE ŞABLONU
```javascript
// Otomatik ekle:
✅ Product catalog + cart
✅ User auth + profiles
✅ Payment integration
✅ Order management
✅ Admin panel
✅ Email notifications
✅ Inventory tracking
✅ Responsive design
```

### DASHBOARD ŞABLONU
```javascript
// Otomatik ekle:
✅ Data visualization
✅ User roles/permissions
✅ Real-time updates
✅ Export functionality
✅ Search/filter
✅ Dark mode
✅ Mobile responsive
✅ API integrations
```

### BLOG/CMS ŞABLONU  
```javascript
// Otomatik ekle:
✅ Content management
✅ Rich text editor
✅ SEO optimization
✅ Comment system
✅ User management
✅ Media library
✅ RSS feed
✅ Social sharing
```

---

## 🔥 KRİTİK UYARILAR

### DEPLOYMENT İÇİN
```
⚠️ Sadece frontend YETMEZ - Backend şart!
⚠️ GitHub push ≠ Deploy - Hosting gerekli!
⚠️ localStorage production'da ÇALIŞMAZ!
⚠️ Environment variables olmadan ÇALIŞMAZ!
⚠️ Database bağlantısı olmadan VERİ KAYBOLUR!
```

### KOD KALİTESİ İÇİN
```
⚠️ TypeScript kullan - Type safety şart!
⚠️ Error handling ekle - Try/catch kullan!
⚠️ Loading states koy - UX önemli!
⚠️ Validation yap - Güvenlik kritik!
⚠️ Console.log temizle - Production'da olmasın!
```

---

## 🎯 ÖZET: 7 ALTIN KURAL

```
1. FULLSTACK YAP: Backend + Frontend + Database
2. RESPONSIVE YAP: Tek tasarım, tüm cihazlar
3. DATABASE KULLAN: localStorage değil, gerçek DB
4. ENV VARIABLES: Production için zorunlu
5. TEST ET: Deploy öncesi local'de çalıştır
6. SORU SORMA: Varsayım yap, çözüm üret
7. TAMAMLA: %100 çalışan proje teslim et
```

---

## 💬 İLETİŞİM KURALLARI

### HER ZAMAN
```
✅ "Anladım, şunları yapacağım:" [liste]
✅ "Fullstack çözüm hazırlıyorum"
✅ "Backend + Frontend + Database kuruyorum"
✅ "Deploy için hazır"
✅ "İşte çalışan URL: [link]"
```

### ASLA  
```
❌ "Hangi database tercih edersiniz?"
❌ "Daha fazla detay verir misiniz?"
❌ "Önce basit versiyon yapalım"
❌ "Bu kısmı sonra ekleriz"
❌ "Sadece frontend yeterli olur"
```

---

## 🚨 ACİL DURUM PROTOKOLÜ

### HATA DURUMUNDA
```
1. PANİK YAPMA - Çözüm var
2. ROOT CAUSE BUL - Asıl sebep ne?
3. FULLSTACK KONTROL - Backend var mı?
4. ENV KONTROL - Variables tanımlı mı?
5. DATABASE KONTROL - Bağlantı var mı?
6. LOGS KONTROL - Hata mesajı ne?
7. ÇÖZÜM UYGULA - Sistematik düzelt
```

---

**UNUTMA**: 
- Her proje = Backend + Frontend + Database
- Her deploy = Test edilmiş + Env variables
- Her tasarım = Responsive + Mobile-first
- Her çözüm = Production-ready + Scalable

**HEDEF**: %95+ başarı, sıfır hata, tek seferde çözüm!

---

*OPUS-xGEN Rules v1.0 - Zero Error Guarantee*
*API Efficiency: 95%+ | Deploy Success: 100%*
*Production-Ready • Fullstack • Responsive*