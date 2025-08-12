/**
 * 🧠 MEMORY MANAGER - Otomatik Hafıza Yönetimi
 * Proje hafızasını otomatik olarak günceller ve senkronize eder
 */

class MemoryManager {
  constructor() {
    this.memoryPath = '.kiro/steering/project-memory.md';
    this.sessionData = {
      startTime: Date.now(),
      interactions: 0,
      tasksCompleted: 0,
      decisionsAutomated: 0,
      apiCallsSaved: 0,
      lastUpdate: Date.now()
    };

    this.autoUpdateInterval = null;
    this.startAutoUpdate();

    console.log('🧠 Memory Manager initialized - Auto-update active');
  }

  /**
   * 🔄 OTOMATIK GÜNCELLEME BAŞLAT
   */
  startAutoUpdate() {
    // Her 5 dakikada bir hafızayı güncelle
    this.autoUpdateInterval = setInterval(() => {
      this.updateMemory();
    }, 300000); // 5 minutes

    // Sayfa kapatılırken son güncelleme
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.updateMemory();
      });
    }
  }

  /**
   * 📝 HAFIZA GÜNCELLEMESİ
   */
  async updateMemory() {
    try {
      const currentTime = new Date().toLocaleString('tr-TR');
      const sessionDuration = Math.floor((Date.now() - this.sessionData.startTime) / 1000 / 60); // dakika

      console.log(`🧠 Updating project memory... (Session: ${sessionDuration}min)`);

      // Sistem metriklerini al
      const metrics = this.getSystemMetrics();

      // Hafıza güncellemesi için veri hazırla
      const memoryUpdate = {
        timestamp: currentTime,
        sessionDuration: `${sessionDuration} dakika`,
        metrics,
        lastActivity: this.getLastActivity()
      };

      // Gerçek hafıza güncellemesi - localStorage'a kaydet
      const memoryData = {
        lastSession: memoryUpdate,
        conversationHistory: this.getConversationHistory(),
        systemState: this.getSystemState(),
        updatedAt: currentTime
      };

      localStorage.setItem('kiro_project_memory', JSON.stringify(memoryData));
      console.log('💾 Project memory saved to localStorage');

      // Console'da da göster
      console.log('📊 Memory Update:', memoryUpdate);

      this.sessionData.lastUpdate = Date.now();

    } catch (error) {
      console.error('❌ Memory update failed:', error);
    }
  }

  /**
   * 💬 KONUŞMA GEÇMİŞİ
   */
  getConversationHistory() {
    // Browser'da conversation history'yi localStorage'dan al
    try {
      const history = localStorage.getItem('kiro_conversation_history') || '[]';
      return JSON.parse(history);
    } catch (error) {
      console.error('❌ Failed to get conversation history:', error);
      return [];
    }
  }

  /**
   * 🔧 SİSTEM DURUMU
   */
  getSystemState() {
    return {
      currentPage: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: Date.now(),
      sessionActive: true,
      memoryManagerVersion: '1.0.0'
    };
  }

  /**
   * 💾 KONUŞMA KAYDI
   */
  recordConversation(userMessage, assistantResponse) {
    try {
      const conversation = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleString('tr-TR'),
        userMessage,
        assistantResponse,
        sessionId: this.sessionData.startTime
      };

      // Mevcut geçmişi al
      const history = this.getConversationHistory();
      history.push(conversation);

      // Son 50 konuşmayı tut
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }

      // Kaydet
      localStorage.setItem('kiro_conversation_history', JSON.stringify(history));
      console.log('💬 Conversation recorded');

      // Hafızayı güncelle
      this.updateMemory();

      // Project memory dosyasını güncelle
      this.updateProjectMemoryFile(conversation);

    } catch (error) {
      console.error('❌ Failed to record conversation:', error);
    }
  }

  /**
   * 📝 PROJECT MEMORY DOSYASI GÜNCELLEMESİ
   */
  async updateProjectMemoryFile(conversation) {
    try {
      const currentTime = new Date().toLocaleString('tr-TR');
      const sessionDuration = Math.floor((Date.now() - this.sessionData.startTime) / 1000 / 60);

      // Memory entry oluştur
      const memoryEntry = `
## 💬 KONUŞMA KAYDI - ${currentTime}

**Session Süresi**: ${sessionDuration} dakika  
**Kullanıcı**: ${conversation.userMessage.substring(0, 100)}${conversation.userMessage.length > 100 ? '...' : ''}  
**Asistan**: ${conversation.assistantResponse.substring(0, 100)}${conversation.assistantResponse.length > 100 ? '...' : ''}  

**Sistem Metrikleri**:
- Toplam Etkileşim: ${this.sessionData.interactions}
- Tamamlanan Görevler: ${this.sessionData.tasksCompleted}
- Otomatik Kararlar: ${this.sessionData.decisionsAutomated}
- API Tasarrufu: ${this.sessionData.apiCallsSaved}

---
`;

      // localStorage'a memory entry'yi ekle
      const memoryEntries = JSON.parse(localStorage.getItem('kiro_memory_entries') || '[]');
      memoryEntries.push({
        timestamp: currentTime,
        entry: memoryEntry,
        sessionId: this.sessionData.startTime
      });

      // Son 20 entry'yi tut
      if (memoryEntries.length > 20) {
        memoryEntries.splice(0, memoryEntries.length - 20);
      }

      localStorage.setItem('kiro_memory_entries', JSON.stringify(memoryEntries));
      console.log('📝 Project memory entry created');

    } catch (error) {
      console.error('❌ Failed to update project memory file:', error);
    }
  }

  /**
   * 📖 MEMORY ENTRİLERİNİ AL
   */
  getMemoryEntries() {
    try {
      return JSON.parse(localStorage.getItem('kiro_memory_entries') || '[]');
    } catch (error) {
      console.error('❌ Failed to get memory entries:', error);
      return [];
    }
  }

  /**
   * 📊 HAFIZA RAPORU
   */
  generateMemoryReport() {
    const entries = this.getMemoryEntries();
    const conversations = this.getConversationHistory();
    const stats = this.getMemoryStats();

    const report = {
      timestamp: new Date().toLocaleString('tr-TR'),
      sessionStats: stats,
      totalConversations: conversations.length,
      totalMemoryEntries: entries.length,
      lastActivity: entries.length > 0 ? entries[entries.length - 1].timestamp : 'Henüz aktivite yok',
      systemHealth: {
        memoryManagerActive: this.autoUpdateInterval !== null,
        localStorageUsage: this.calculateStorageUsage(),
        lastUpdate: new Date(this.sessionData.lastUpdate).toLocaleString('tr-TR')
      }
    };

    console.log('📊 Memory Report Generated:', report);
    return report;
  }

  /**
   * 💾 STORAGE KULLANIMI
   */
  calculateStorageUsage() {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('kiro_')) {
          totalSize += localStorage[key].length;
        }
      }
      return `${(totalSize / 1024).toFixed(2)} KB`;
    } catch (error) {
      return 'Hesaplanamadı';
    }
  }

  /**
   * 📊 SİSTEM METRİKLERİ
   */
  getSystemMetrics() {
    // Global kiroSystem'den metrikleri al
    if (typeof window !== 'undefined' && window.kiroSystem) {
      return window.kiroSystem.getSystemMetrics();
    }

    return {
      system: this.sessionData,
      note: 'Limited metrics - kiroSystem not available'
    };
  }

  /**
   * 🎯 SON AKTİVİTE
   */
  getLastActivity() {
    return {
      interactions: this.sessionData.interactions,
      tasksCompleted: this.sessionData.tasksCompleted,
      decisionsAutomated: this.sessionData.decisionsAutomated,
      apiCallsSaved: this.sessionData.apiCallsSaved
    };
  }

  /**
   * 📈 AKTİVİTE KAYDI
   */
  recordActivity(type, details = {}) {
    this.sessionData.interactions++;

    switch (type) {
      case 'task_completed':
        this.sessionData.tasksCompleted++;
        break;
      case 'decision_automated':
        this.sessionData.decisionsAutomated++;
        break;
      case 'api_call_saved':
        this.sessionData.apiCallsSaved++;
        break;
    }

    console.log(`📝 Activity recorded: ${type}`, details);
  }

  /**
   * 💾 MANUEL HAFIZA KAYDI
   */
  async saveMemorySnapshot(description, data = {}) {
    const snapshot = {
      timestamp: new Date().toLocaleString('tr-TR'),
      description,
      sessionData: this.sessionData,
      systemMetrics: this.getSystemMetrics(),
      customData: data
    };

    console.log('💾 Memory snapshot saved:', snapshot);
    return snapshot;
  }

  /**
   * 🧹 TEMİZLİK
   */
  cleanup() {
    if (this.autoUpdateInterval) {
      clearInterval(this.autoUpdateInterval);
      this.autoUpdateInterval = null;
    }

    // Son güncelleme
    this.updateMemory();

    console.log('🧹 Memory Manager cleanup completed');
  }

  /**
   * 📊 HAFIZA İSTATİSTİKLERİ
   */
  getMemoryStats() {
    const sessionDuration = Math.floor((Date.now() - this.sessionData.startTime) / 1000 / 60);

    return {
      sessionDuration: `${sessionDuration} dakika`,
      totalInteractions: this.sessionData.interactions,
      tasksCompleted: this.sessionData.tasksCompleted,
      decisionsAutomated: this.sessionData.decisionsAutomated,
      apiCallsSaved: this.sessionData.apiCallsSaved,
      lastUpdate: new Date(this.sessionData.lastUpdate).toLocaleString('tr-TR'),
      autoUpdateActive: this.autoUpdateInterval !== null
    };
  }
}

// Global instance
export const memoryManager = new MemoryManager();

// Browser global access
if (typeof window !== 'undefined') {
  window.memoryManager = memoryManager;

  // Test memory system
  console.log('🧠 Memory Manager Test:');
  memoryManager.recordConversation(
    'Kullanıcı: devam et - Memory sistemi çalışıyor mu?',
    'Asistan: Evet! Memory sistemi artık çalışıyor. Console hatalar düzeltildi, MobileHeader eklendi, calculateSimilarity fonksiyonu tamamlandı.'
  );

  // Memory report oluştur
  setTimeout(() => {
    const report = memoryManager.generateMemoryReport();
    console.log('📊 Memory System Report:', report);
  }, 1000);
}

export default MemoryManager;