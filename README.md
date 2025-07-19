# KIRILMAZLAR - Gıda Yönetim Sistemi

Bu proje, KIRILMAZLAR gıda yönetim sisteminin tüm uygulamalarını içeren monorepo yapısıdır.

## Özellikler

- 🏪 **Satıcı Paneli**: Ürün, sipariş ve müşteri yönetimi
- 🛒 **Müşteri Uygulaması**: Ürün katalog, sepet ve sipariş takibi
- 📱 **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- 💾 **Yerel Depolama**: LocalStorage tabanlı veri yönetimi
- 🔐 **Kimlik Doğrulama**: Rol tabanlı erişim kontrolü

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
