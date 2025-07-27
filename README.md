# KIRILMAZLAR - Gıda Yönetim Sistemi

Bu proje, KIRILMAZLAR gıda yönetim sisteminin tüm uygulamalarını içeren monorepo yapısıdır.

## Özellikler

- 🏪 **Satıcı Paneli**: Ürün, sipariş ve müşteri yönetimi
- 🛒 **Müşteri Uygulaması**: Ürün katalog, sepet ve sipariş takibi
- 📱 **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- 💾 **Yerel Depolama**: LocalStorage tabanlı veri yönetimi
- 🔐 **Kimlik Doğrulama**: Rol tabanlı erişim kontrolü

## Son Güncellemeler

### 📅 24 Temmuz 2025 - Customer UI Enhancement
- ✅ **Icon System Fix**: Artı-eksi butonları ve yıldız rating'leri düzeltildi
- ✅ **Image Path Fix**: URL encoding sorunları çözüldü
- ✅ **Performance**: Icon render efficiency artışı
- 📊 **Details**: `docs/CUSTOMER_UI_ENHANCEMENT_RAPORU.md`

### 📅 23 Temmuz 2025 - System Stability
- ✅ **Storage Layer**: Unified storage architecture aktif
- ✅ **Console Cleanup**: ProductionLogger servisi implementasyonu  
- ✅ **Performance**: Bundle size optimization (830kB → 14.6kB icons)
- 📊 **Progress**: P1 Critical Issues %100 completed

## Test Hesapları

- **Satıcı**: `satici@test.com` / `1234`
- **Müşteri**: `musteri@test.com` / `1234`

## Kurulum

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

3. Tarayıcınızda `http://localhost:5500` adresini açın

## Teknolojiler

- **Frontend**: React 18, Vite, TailwindCSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Storage**: LocalStorage API
- **Build**: Vite
