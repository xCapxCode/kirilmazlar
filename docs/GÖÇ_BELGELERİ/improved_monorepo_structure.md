# Kırılmazlar - İyileştirilmiş Monorepo Dosya Yapısı

## Önerilen Yeni Dosya Yapısı

```
kirilmazlar-monorepo/
├── .env.example
├── .env.local
├── .env.production
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── package.json
├── package-lock.json
├── tailwind.config.js
├── postcss.config.cjs
├── vite.config.mjs
├── vercel.json
├── jsconfig.json
├── README.md
│
├── docs/
│   ├── README.md
│   ├── DEPLOYMENT.md
│   ├── API_DOCUMENTATION.md
│   ├── USER_GUIDE.md
│   └── TROUBLESHOOTING.md
│
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   └── assets/
│       ├── images/
│       │   ├── logo/
│       │   │   ├── kirilmazlar-logo.png
│       │   │   ├── kirilmazlar-logo-white.png
│       │   │   └── ofisnet-logo.png
│       │   ├── placeholders/
│       │   │   ├── no-image.png
│       │   │   └── product-placeholder.png
│       │   └── landing/
│       │       ├── hero-bg.jpg
│       │       ├── about-us.png
│       │       └── features.png
│       ├── icons/
│       └── fonts/
│
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.test.jsx
│   │
│   ├── core/
│   │   ├── config/
│   │   │   ├── index.js
│   │   │   ├── supabase.js
│   │   │   ├── constants.js
│   │   │   └── env.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── BusinessContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   ├── useApi.js
│   │   │   ├── useLocalStorage.js
│   │   │   └── useResponsive.js
│   │   ├── services/
│   │   │   ├── api/
│   │   │   │   ├── index.js
│   │   │   │   ├── auth.js
│   │   │   │   ├── products.js
│   │   │   │   ├── orders.js
│   │   │   │   └── customers.js
│   │   │   ├── supabase/
│   │   │   │   ├── client.js
│   │   │   │   ├── auth.js
│   │   │   │   ├── database.js
│   │   │   │   └── realtime.js
│   │   │   └── storage/
│   │   │       ├── localStorage.js
│   │   │       └── sessionStorage.js
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   └── types/
│   │       ├── auth.js
│   │       ├── product.js
│   │       ├── order.js
│   │       └── customer.js
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Layout/
│   │   │   │   │   ├── Layout.jsx
│   │   │   │   │   ├── Header.jsx
│   │   │   │   │   ├── Footer.jsx
│   │   │   │   │   ├── Sidebar.jsx
│   │   │   │   │   └── MobileMenu.jsx
│   │   │   │   ├── Navigation/
│   │   │   │   │   ├── Navbar.jsx
│   │   │   │   │   ├── Breadcrumb.jsx
│   │   │   │   │   ├── TabNavigation.jsx
│   │   │   │   │   └── BottomNavigation.jsx
│   │   │   │   ├── Forms/
│   │   │   │   │   ├── Input.jsx
│   │   │   │   │   ├── Select.jsx
│   │   │   │   │   ├── Textarea.jsx
│   │   │   │   │   ├── Button.jsx
│   │   │   │   │   ├── Checkbox.jsx
│   │   │   │   │   └── RadioButton.jsx
│   │   │   │   ├── Feedback/
│   │   │   │   │   ├── Toast.jsx
│   │   │   │   │   ├── Modal.jsx
│   │   │   │   │   ├── Alert.jsx
│   │   │   │   │   ├── Loading.jsx
│   │   │   │   │   └── ErrorBoundary.jsx
│   │   │   │   ├── Display/
│   │   │   │   │   ├── Card.jsx
│   │   │   │   │   ├── Table.jsx
│   │   │   │   │   ├── Badge.jsx
│   │   │   │   │   ├── Avatar.jsx
│   │   │   │   │   └── EmptyState.jsx
│   │   │   │   └── Media/
│   │   │   │       ├── Image.jsx
│   │   │   │       ├── ImageGallery.jsx
│   │   │   │       └── Icon.jsx
│   │   │   ├── business/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── OrderCard.jsx
│   │   │   │   ├── CustomerCard.jsx
│   │   │   │   ├── CartItem.jsx
│   │   │   │   └── BusinessLogo.jsx
│   │   │   └── auth/
│   │   │       ├── LoginForm.jsx
│   │   │       ├── SignupForm.jsx
│   │   │       ├── ForgotPassword.jsx
│   │   │       └── ProtectedRoute.jsx
│   │   ├── layouts/
│   │   │   ├── BaseLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── ResponsiveLayout.jsx
│   │   └── styles/
│   │       ├── globals.css
│   │       ├── components.css
│   │       ├── utilities.css
│   │       └── responsive.css
│   │
│   ├── apps/
│   │   ├── landing/
│   │   │   ├── routes/
│   │   │   │   └── LandingRoutes.jsx
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── AboutPage.jsx
│   │   │   │   ├── ContactPage.jsx
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── components/
│   │   │   │   ├── Hero.jsx
│   │   │   │   ├── Features.jsx
│   │   │   │   ├── About.jsx
│   │   │   │   ├── Contact.jsx
│   │   │   │   └── Footer.jsx
│   │   │   └── styles/
│   │   │       └── landing.css
│   │   │
│   │   ├── customer/
│   │   │   ├── routes/
│   │   │   │   └── CustomerRoutes.jsx
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard/
│   │   │   │   │   ├── index.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── DashboardStats.jsx
│   │   │   │   │       ├── RecentOrders.jsx
│   │   │   │   │       └── QuickActions.jsx
│   │   │   │   ├── Catalog/
│   │   │   │   │   ├── index.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── ProductList.jsx
│   │   │   │   │       ├── ProductGrid.jsx
│   │   │   │   │       ├── ProductDetail.jsx
│   │   │   │   │       ├── CategoryFilter.jsx
│   │   │   │   │       └── SearchBar.jsx
│   │   │   │   ├── Cart/
│   │   │   │   │   ├── index.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── CartSummary.jsx
│   │   │   │   │       ├── CartItems.jsx
│   │   │   │   │       └── CheckoutForm.jsx
│   │   │   │   ├── Orders/
│   │   │   │   │   ├── index.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── OrderList.jsx
│   │   │   │   │       ├── OrderDetail.jsx
│   │   │   │   │       └── OrderStatus.jsx
│   │   │   │   └── Profile/
│   │   │   │       ├── index.jsx
│   │   │   │       └── components/
│   │   │   │           ├── PersonalInfo.jsx
│   │   │   │           ├── AddressManagement.jsx
│   │   │   │           └── PasswordChange.jsx
│   │   │   ├── components/
│   │   │   │   ├── CustomerLayout.jsx
│   │   │   │   ├── CustomerHeader.jsx
│   │   │   │   ├── CustomerSidebar.jsx
│   │   │   │   └── MobileBottomNav.jsx
│   │   │   └── styles/
│   │   │       └── customer.css
│   │   │
│   │   └── seller/
│   │       ├── routes/
│   │       │   └── SellerRoutes.jsx
│   │       ├── pages/
│   │       │   ├── Dashboard/
│   │       │   │   ├── index.jsx
│   │       │   │   └── components/
│   │       │   │       ├── SalesStats.jsx
│   │       │   │       ├── RecentOrders.jsx
│   │       │   │       └── InventoryAlerts.jsx
│   │       │   ├── Products/
│   │       │   │   ├── index.jsx
│   │       │   │   └── components/
│   │       │   │       ├── ProductList.jsx
│   │       │   │       ├── ProductForm.jsx
│   │       │   │       ├── ProductImport.jsx
│   │       │   │       └── CategoryManagement.jsx
│   │       │   ├── Orders/
│   │       │   │   ├── index.jsx
│   │       │   │   └── components/
│   │       │   │       ├── OrderQueue.jsx
│   │       │   │       ├── OrderDetail.jsx
│   │       │   │       ├── OrderTracking.jsx
│   │       │   │       └── BulkActions.jsx
│   │       │   ├── Customers/
│   │       │   │   ├── index.jsx
│   │       │   │   └── components/
│   │       │   │       ├── CustomerList.jsx
│   │       │   │       ├── CustomerDetail.jsx
│   │       │   │       └── CustomerAnalytics.jsx
│   │       │   ├── Reports/
│   │       │   │   ├── index.jsx
│   │       │   │   └── components/
│   │       │   │       ├── SalesReport.jsx
│   │       │   │       ├── InventoryReport.jsx
│   │       │   │       └── CustomerReport.jsx
│   │       │   └── Settings/
│   │       │       ├── index.jsx
│   │       │       └── components/
│   │       │           ├── BusinessSettings.jsx
│   │       │           ├── UserManagement.jsx
│   │       │           └── SystemSettings.jsx
│   │       ├── components/
│   │       │   ├── SellerLayout.jsx
│   │       │   ├── SellerHeader.jsx
│   │       │   ├── SellerSidebar.jsx
│   │       │   └── MobileSellerNav.jsx
│   │       └── styles/
│   │           └── seller.css
│   │
│   └── router/
│       ├── index.jsx
│       ├── routes.jsx
│       └── ProtectedRoute.jsx
│
├── supabase/
│   ├── README.md
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_auth_setup.sql
│   │   ├── 003_rls_policies.sql
│   │   ├── 004_functions.sql
│   │   └── 005_sample_data.sql
│   ├── functions/
│   │   ├── auth-helpers.sql
│   │   ├── business-logic.sql
│   │   └── utilities.sql
│   ├── seed/
│   │   ├── demo-users.sql
│   │   ├── demo-products.sql
│   │   └── demo-orders.sql
│   └── docs/
│       ├── SETUP.md
│       ├── DEPLOYMENT.md
│       └── API_REFERENCE.md
│
├── scripts/
│   ├── build.js
│   ├── deploy.js
│   ├── test.js
│   └── utils/
│       ├── cleanup.js
│       └── migration-helper.js
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
        └── cypress/
```

## Anahtar İyileştirmeler

### 1. **Temiz Modüler Yapı**
- **Core**: Merkezi yapılandırmalar, servisler, hooks
- **Shared**: Ortak componentler ve layoutlar
- **Apps**: Bağımsız uygulama modülleri

### 2. **Responsive Design Yaklaşımı**
- `useResponsive` hook ile ekran boyutu yönetimi
- Responsive layout componentleri
- Mobile, tablet, desktop için optimize edilmiş componentler

### 3. **Component Organizasyonu**
- **UI Components**: Temel UI elementleri
- **Business Components**: İşe özel componentler
- **Layout Components**: Sayfa yapıları

### 4. **Servis Katmanı**
- API servisleri ayrı modüller
- Supabase entegrasyonu merkezi
- Auth yönetimi tek yerden

### 5. **Routing Yapısı**
- Her app için ayrı routing
- Protected route yönetimi
- Nested routing desteği

### 6. **Stil Yönetimi**
- Global stiller
- Component-specific stiller
- Utility classlar
- Responsive breakpoints

### 7. **Database & Backend**
- Düzenli migration sistemi
- Temiz SQL yapısı
- Dokümentasyon

### 8. **Geliştirme Araçları**
- Build scripts
- Deploy automation
- Test yapısı
- Cleanup utilities

## Göç Planı

### Faz 1: Temel Yapı
1. Yeni klasör yapısını oluştur
2. Core konfigürasyonları taşı
3. Shared componentleri yeniden organize et

### Faz 2: App Modülleri
1. Landing app'i yeniden yapılandır
2. Customer app'i modülerize et
3. Seller app'i düzenle

### Faz 3: Entegrasyonlar
1. Supabase konfigürasyonunu temizle
2. Responsive design implementasyonu
3. State yönetimini merkezi hale getir

### Faz 4: Test & Deploy
1. Test yapısını kur
2. Vercel deployment'ı optimize et
3. Monitoring ve logging ekle

## Avantajlar

- **Maintainability**: Kod bakımı kolay
- **Scalability**: Yeni özellikler eklemek basit
- **Performance**: Optimized bundling
- **Developer Experience**: Geliştirici deneyimi gelişmiş
- **Responsive**: Tüm cihazlarda mükemmel görünüm
- **Modular**: Bağımsız geliştirme mümkün