# 🤖 AUTONOMOUS SYSTEM CORE FILES

## 📁 Klasör Yapısı
```
.autonomous/
├── core/                  # Çekirdek servisler
├── memory/               # Hafıza ve log dosyaları
├── rules/                # Kurallar ve talimatlar
└── tasks/                # Görev yönetimi
```

## 📋 Dosya Açıklamaları

### 1️⃣ Memory (Hafıza)
- `project-memory.md`: Proje hafızası ve logları
- `session-history.md`: Oturum geçmişi
- `conversation-logs.md`: Konuşma kayıtları

### 2️⃣ Rules (Kurallar)
- `copilot-instructions.md`: GitHub Copilot talimatları
- `system-rules.md`: Sistem kuralları
- `workflow-guidelines.md`: İş akışı kuralları

### 3️⃣ Tasks (Görevler)
- `task-list.md`: Aktif görev listesi
- `task-history.md`: Tamamlanan görevler
- `task-templates.md`: Görev şablonları

## 🔄 Otomatik Senkronizasyon
- Her 5 saniyede bir hafıza sync
- Oturum sonlarında tam backup
- Crash durumunda otomatik kurtarma
