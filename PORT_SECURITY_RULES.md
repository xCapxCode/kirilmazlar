# 🔒 PORT GÜVENLİK KURALLARI

## 🚨 KRİTİK KURAL: SADECE PORT 5000 İZİNLİ

### ✅ İZİNLİ PORT
- **5000**: Development server için tek izinli port

### ❌ YASAK PORTLAR
- **3000**: YASAK - Kapatılmalı
- **4173**: YASAK - Kapatılmalı  
- **8080**: YASAK - Kapatılmalı
- **3001**: YASAK - Kapatılmalı
- **Diğer tüm portlar**: YASAK

## 🛡️ GÜVENLİK POLİTİKASI

### 1. Otomatik Port Kontrolü
```powershell
# Çalışan servisleri kontrol et
netstat -ano | findstr LISTENING

# 5000 dışındaki Node.js servislerini kapat
Get-Process | Where-Object {$_.ProcessName -like '*node*'} | ForEach-Object {
    $connections = netstat -ano | findstr $_.Id
    if ($connections -match ':(?!5000)\d+') {
        Write-Host "YASAK PORT TESPİT EDİLDİ - PID: $($_.Id) kapatılıyor"
        Stop-Process -Id $_.Id -Force
    }
}
```

### 2. Vite Yapılandırması
```javascript
// vite.config.mjs - SADECE PORT 5000
export default defineConfig({
  server: {
    port: 5000,
    strictPort: true, // Başka port kullanmaya izin verme
    host: 'localhost'
  },
  preview: {
    port: 5000,
    strictPort: true
  }
})
```

### 3. Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite --port 5000 --strictPort",
    "serve": "vite preview --port 5000 --strictPort",
    "preview": "serve -s dist -l 5000"
  }
}
```

## 🚨 ACİL DURUM PROTOKOLÜ

### Yasak Port Tespit Edildiğinde:
1. **Derhal Kapat**: `taskkill /PID [PID] /F`
2. **Logla**: Hangi servis, ne zaman
3. **Rapor Et**: Güvenlik ihlali olarak kaydet

### Günlük Kontrol:
```powershell
# Her gün çalıştır
$forbiddenPorts = @(3000, 4173, 8080, 3001, 8000, 9000)
foreach ($port in $forbiddenPorts) {
    $process = netstat -ano | findstr ":$port"
    if ($process) {
        Write-Warning "YASAK PORT $port AKTİF!"
        # Servisi kapat
    }
}
```

## 📋 KONTROL LİSTESİ

- [ ] Port 5000 dışında hiçbir servis çalışmıyor
- [ ] Vite config sadece 5000 kullanıyor
- [ ] Package.json scripts 5000'e sabitlenmiş
- [ ] Docker yapılandırması 5000 kullanıyor
- [ ] Nginx config 5000'e proxy yapıyor

## 🔧 YAPILANDIRMA DÜZELTMELERİ

### Environment Service
```javascript
// src/core/environment/environmentService.js
dev: {
  port: 5000, // SABİT - DEĞİŞTİRİLEMEZ
  host: 'localhost',
  strictPort: true
}
```

### Docker
```dockerfile
# Dockerfile.dev
EXPOSE 5000
# docker-compose.yml
ports:
  - "5000:5000"
```

---

**⚠️ UYARI: Bu kurallar GeniusCoder (Gen) tarafından oluşturulmuş olup, güvenlik için kritiktir. İhlal edilmemelidir.**

**📅 Oluşturulma: 2024**  
**🔄 Son Güncelleme: Her deployment öncesi kontrol edilmelidir**