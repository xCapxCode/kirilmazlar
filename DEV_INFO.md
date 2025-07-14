# Kırılmazlar - Geliştirme Bilgileri

## 🚀 Uygulama Çalıştırma

### Development (Geliştirme)
```bash
npm run dev
```
**Port:** http://localhost:5173/

### Production Preview
```bash
npm run serve
```
**Port:** http://localhost:4173/

## 📝 Önemli Notlar

- **Geliştirme portu her zaman 5173'tür** - Bu port sabit olarak ayarlanmıştır
- Eğer port 5173 kullanımda ise uygulama başlamaz (strictPort: true)
- Bu durumda önce mevcut 5173 portunu kullanan uygulamayı kapatmanız gerekir

## 🔧 Port Ayarları

Portlar aşağıdaki dosyalarda tanımlanmıştır:
- `vite.config.mjs` - Development port (5173)
- `package.json` - Script komutları

## 🌐 Network Erişimi

Uygulama aynı ağdaki diğer cihazlardan da erişilebilir:
- Local: http://localhost:5173/
- Network: http://[IP-adresiniz]:5173/

## 🛠️ Sorun Giderme

Eğer uygulama açılmıyorsa:
1. Port 5173'ün başka bir uygulama tarafından kullanılıp kullanılmadığını kontrol edin
2. Terminal'de `netstat -ano | findstr :5173` komutu ile kontrol edebilirsiniz
3. Gerekirse o uygulamayı kapatın veya bilgisayarı yeniden başlatın
