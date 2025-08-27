# Kirilmazlar v1.0 - Veri Yedekleme

## Oluşturulan Dosyalar

### 1. kirilmazlar-backup-2025-08-27T12-40-05-452Z.json
Tam localStorage yedekleme dosyası. Orijinal veri formatında tüm veriler.

### 2. kirilmazlar-postgresql-2025-08-27T12-40-05-452Z.json
PostgreSQL formatına dönüştürülmüş veriler.

### 3. migration.sql
PostgreSQL veritabanına veri aktarımı için SQL script.

## Kullanım

### PostgreSQL'e Veri Aktarımı
```bash
psql -h hostname -U username -d database_name -f migration.sql
```

### Veri İstatistikleri
- Toplam anahtar: 8
- Toplam boyut: 1425 byte
- Oluşturma tarihi: 2025-08-27T12:40:05.450Z

### Tablolar
- Users: 2 kayıt
- Products: 2 kayıt
- Categories: 2 kayıt
- Customers: 1 kayıt
- Orders: 1 kayıt

## Güvenlik Notları
- Password hash'leri güncellenmeli
- Production'da gerçek şifreler kullanılmalı
- Environment variables kontrol edilmeli
