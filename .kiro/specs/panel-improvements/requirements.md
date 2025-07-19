# KIRILMAZLAR Panel İyileştirmeleri - Gereksinimler

## Giriş

Bu spec, KIRILMAZLAR gıda yönetim sisteminin satıcı ve müşteri panellerindeki kritik sorunları çözmek ve kullanıcı deneyimini iyileştirmek için tasarlanmıştır. Sistem şu anda temel işlevselliğe sahip ancak senkronizasyon, tasarım tutarlılığı ve kullanıcı etkileşimi açısından iyileştirmelere ihtiyaç duymaktadır.

## Gereksinimler

### Gereksinim 1: Satıcı Dashboard Senkronizasyonu

**Kullanıcı Hikayesi:** Satıcı olarak, dashboard'da güncel ve doğru bilgileri görmek istiyorum ki işletmemin durumunu hızlıca anlayabileyim.

#### Kabul Kriterleri
1. Dashboard'daki tüm veriler gerçek zamanlı olarak güncellenmelidir
2. Ürün sayısı, sipariş durumları ve stok uyarıları anlık olarak yansımalıdır
3. Veri tutarsızlığı durumunda otomatik düzeltme mekanizması çalışmalıdır
4. Dashboard yüklenme süresi 2 saniyeyi geçmemelidir

### Gereksinim 2: Ürün Yönetimi Tam İşlevsellik

**Kullanıcı Hikayesi:** Satıcı olarak, ürünlerimi kolayca yönetmek ve müşterilerin bunları görebileceğinden emin olmak istiyorum.

#### Kabul Kriterleri
1. Satıcı panelinde eklenen/düzenlenen ürünler anında müşteri kataloğunda görünmelidir
2. Ürün resim yükleme/değiştirme işlemi sorunsuz çalışmalıdır
3. Ürün durumu (aktif/pasif) değişiklikleri anında yansımalıdır
4. Ürün CRUD işlemleri hata vermeden tamamlanmalıdır
5. Ürün kategorileri doğru şekilde filtrelenmelidir

### Gereksinim 3: Sipariş Yönetimi İyileştirmesi

**Kullanıcı Hikayesi:** Satıcı olarak, siparişleri görüntüleyip yönetmek ve durumlarının müşteriye yansıdığından emin olmak istiyorum.

#### Kabul Kriterleri
1. Sipariş detay görüntüleme sayfası boş sayfa yerine sipariş bilgilerini göstermelidir
2. Sipariş onaylandığında listeden kaybolmamalı, durumu güncellenmelidir
3. Sipariş durumu değişiklikleri müşteri paneline anında yansımalıdır
4. Sayfa yenileme sonrası sipariş durumları korunmalıdır
5. Sipariş silme işlemi hem satıcı hem müşteri panelinde senkronize çalışmalıdır

### Gereksinim 4: Müşteri Yönetimi Sistemi

**Kullanıcı Hikayesi:** Satıcı olarak, müşterilerimi yönetmek ve onların sipariş geçmişlerini görmek istiyorum.

#### Kabul Kriterleri
1. Müşteri kartları sipariş bilgileriyle bağlantılı olmalıdır
2. Müşteri şifre ve kullanıcı ataması yapılabilmelidir
3. Müşteri bilgi değişiklikleri çift yönlü senkronize olmalıdır
4. Müşteri detay sayfası tüm siparişleri liste halinde göstermelidir
5. Müşteri oluşturma/silme işlemleri tam işlevsel olmalıdır

### Gereksinim 5: Genel Ayarlar Tasarım Tutarlılığı

**Kullanıcı Hikayesi:** Satıcı olarak, tutarlı bir arayüz deneyimi yaşamak istiyorum.

#### Kabul Kriterleri
1. Genel ayarlar sayfası diğer sayfalarla aynı arkaplan rengine sahip olmalıdır
2. Kart renkleri panel genelinde tutarlı olmalıdır
3. İşletme bilgilerinden slogan alanı kaldırılmalıdır
4. Fiyat ayarları doğru çalışmalıdır
5. Sipariş numarası formatı tutarlı olmalıdır
6. Bildirim sistemi çakışma olmadan çalışmalıdır

### Gereksinim 6: Modal Sistemi İyileştirmesi

**Kullanıcı Hikayesi:** Kullanıcı olarak, tüm etkileşimlerimin uygulama içinde gerçekleşmesini istiyorum.

#### Kabul Kriterleri
1. Tarayıcı popup'ları yerine uygulama içi modal'lar kullanılmalıdır
2. Şifre değiştirme işlemi özel modal ile yapılmalıdır
3. Hesap düzenleme tam modal sistemi ile çalışmalıdır
4. Bildirimler uygulama içi toast sistemi ile gösterilmelidir
5. Onay işlemleri uygulama içi dialog'lar ile yapılmalıdır

### Gereksinim 7: Hesap Yönetimi Sistemi

**Kullanıcı Hikayesi:** Yönetici olarak, kullanıcı hesaplarını tam kontrol ile yönetmek istiyorum.

#### Kabul Kriterleri
1. Yeni hesap oluşturma tam modal ile yapılabilmelidir
2. Hesap düzenleme tüm alanları içermelidir
3. Hesap silme işlevi güvenli şekilde çalışmalıdır
4. Tam yetkili yönetici oluşturma/silme yapılabilmelidir
5. Veri yapısı kalıcı olmalı (yayın sonrası korunmalı)

### Gereksinim 8: Header Kullanıcı Menüsü

**Kullanıcı Hikayesi:** Kullanıcı olarak, profil işlemlerime kolay erişmek istiyorum.

#### Kabul Kriterleri
1. Kullanıcı adı header'da görünmelidir
2. Profil sayfası linki çalışmalıdır
3. Çıkış yap işlevi doğru çalışmalıdır
4. Sistem ayarları menüden kaldırılmalıdır
5. Hem satıcı hem müşteri panelinde tutarlı olmalıdır

### Gereksinim 9: Müşteri Ürün Kataloğu Responsive Tasarım

**Kullanıcı Hikayesi:** Müşteri olarak, ürünleri hem web hem mobilde rahatça görüntülemek istiyorum.

#### Kabul Kriterleri
1. Web'de bir satırda 3 ürün görünmelidir
2. Mobilde responsive tasarım uygulanmalıdır
3. Ürün kartları içeriği korunmalıdır
4. Sepet ikonu varsayılan olarak yeşil olmalıdır
5. Sepet işlevselliği tam çalışmalıdır

### Gereksinim 10: Müşteri Sipariş Yönetimi

**Kullanıcı Hikayesi:** Müşteri olarak, siparişlerimi görüntülemek ve iptal etmek istiyorum.

#### Kabul Kriterleri
1. Eski siparişler temizlenmelidir
2. Müşteri sipariş iptal edebilmeli (silme değil)
3. İptal edilen siparişler satıcı tarafında görünmelidir
4. Sipariş durumu değişiklikleri senkronize olmalıdır
5. Müşteri-satıcı sipariş entegrasyonu sorunsuz çalışmalıdır

### Gereksinim 11: Müşteri Profil Yönetimi

**Kullanıcı Hikayesi:** Müşteri olarak, profil bilgilerimi yönetmek ve sipariş geçmişimi görmek istiyorum.

#### Kabul Kriterleri
1. Müşteri bilgileri profil sayfasında görünmelidir
2. Şifre değiştirme işlevi çalışmalıdır
3. Kullanıcı adı ve diğer bilgiler güncellenebilmelidir
4. Son siparişler görüntülenmelidir
5. Sipariş istatistikleri (toplam, miktar) gösterilmelidir
6. İşletme bilgileri yerine müşteri kartı bilgileri görünmelidir

## Başarı Kriterleri

- Tüm panel işlevleri hatasız çalışmalıdır
- Satıcı-müşteri veri senkronizasyonu gerçek zamanlı olmalıdır
- Tasarım tutarlılığı sağlanmalıdır
- Kullanıcı deneyimi iyileştirilmelidir
- Sistem performansı korunmalıdır
- Veri bütünlüğü garanti altına alınmalıdır