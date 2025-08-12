/**
 * 🧠 INTELLIGENT CONTEXT MANAGER - Akıllı Bağlam Yöneticisi
 * Konuşma bağlamını yerel olarak yönetir, API çağrılarını minimize eder
 */

export class IntelligentContextManager {
  constructor() {
    this.conversationHistory = [];
    this.projectContext = new Map();
    this.codeContext = new Map();
    this.taskContext = new Map();
    this.userPreferences = new Map();
    
    // Context compression strategies
    this.compressionThreshold = 50; // Max conversation items
    this.contextTypes = {
      CONVERSATION: 'conversation',
      PROJECT: 'project',
      CODE: 'code',
      TASK: 'task',
      USER: 'user'
    };
    
    this.initializeContext();
  }

  initializeContext() {
    console.log('🧠 Intelligent Context Manager initialized');
    this.loadPersistedContext();
    
    // Auto-save context every 30 seconds
    setInterval(() => this.persistContext(), 30000);
    
    // Compress context every 5 minutes
    setInterval(() => this.compressContext(), 300000);
  }

  /**
   * 💬 CONVERSATION CONTEXT - Konuşma bağlamı
   */
  addConversationTurn(userInput, assistantResponse, metadata = {}) {
    const turn = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      userInput,
      assistantResponse,
      metadata,
      importance: this.calculateImportance(userInput, assistantResponse)
    };
    
    this.conversationHistory.push(turn);
    console.log(`💬 Added conversation turn: ${turn.id}`);
    
    // Auto-compress if needed
    if (this.conversationHistory.length > this.compressionThreshold) {
      this.compressConversationHistory();
    }
    
    this.extractContextFromTurn(turn);
  }

  updateConversationContext(userInput, assistantResponse, metadata = {}) {
    // Handle array input for test compatibility
    if (Array.isArray(userInput)) {
      userInput.forEach((message, index) => {
        const turn = {
          userInput: message,
          assistantResponse: assistantResponse?.[index] || '',
          timestamp: new Date().toISOString(),
          importance: this.calculateImportance(message, assistantResponse?.[index] || ''),
          ...metadata
        };
        this.conversationHistory.push(turn);
      });
    } else {
      const turn = {
        userInput,
        assistantResponse,
        timestamp: new Date().toISOString(),
        importance: this.calculateImportance(userInput, assistantResponse),
        ...metadata
      };
      
      this.conversationHistory.push(turn);
    }
    
    // Keep only recent conversations to manage memory
    if (this.conversationHistory.length > this.compressionThreshold) {
      this.conversationHistory = this.conversationHistory.slice(-this.compressionThreshold);
    }
    
    console.log(`💬 Conversation context updated (${this.conversationHistory.length} turns)`);
  }

  calculateImportance(userInput, assistantResponse) {
    let importance = 1;
    
    // High importance keywords
    const highImportanceKeywords = [
      'error', 'bug', 'fix', 'critical', 'urgent', 'problem',
      'implement', 'create', 'build', 'deploy', 'production'
    ];
    
    // Medium importance keywords
    const mediumImportanceKeywords = [
      'update', 'modify', 'change', 'improve', 'optimize',
      'test', 'debug', 'review', 'analyze'
    ];
    
    const text = (userInput + ' ' + assistantResponse).toLowerCase();
    
    if (highImportanceKeywords.some(keyword => text.includes(keyword))) {
      importance = 3;
    } else if (mediumImportanceKeywords.some(keyword => text.includes(keyword))) {
      importance = 2;
    }
    
    return importance;
  }

  extractContextFromTurn(turn) {
    const text = turn.userInput + ' ' + turn.assistantResponse;
    
    // Extract file mentions
    const fileMatches = text.match(/[\w\/\\]+\.(js|jsx|ts|tsx|md|json|css|html)/g);
    if (fileMatches) {
      fileMatches.forEach(file => {
        this.updateCodeContext(file, {
          lastMentioned: turn.timestamp,
          turnId: turn.id,
          context: 'mentioned in conversation'
        });
      });
    }
    
    // Extract task mentions
    const taskMatches = text.match(/(?:task|görev|todo|implement|create|fix|build)\s+([^\n.!?]+)/gi);
    if (taskMatches) {
      taskMatches.forEach(task => {
        this.updateTaskContext(task.trim(), {
          status: 'mentioned',
          turnId: turn.id,
          timestamp: turn.timestamp
        });
      });
    }
  }

  /**
   * 📁 PROJECT CONTEXT - Proje bağlamı
   */
  updateProjectContext(key, value, metadata = {}) {
    if (typeof key === 'object' && value === undefined) {
      // Handle object input for test compatibility
      Object.entries(key).forEach(([k, v]) => {
        this.projectContext.set(k, {
          value: v,
          metadata,
          lastUpdated: new Date().toISOString(),
          updateCount: (this.projectContext.get(k)?.updateCount || 0) + 1
        });
      });
    } else {
      this.projectContext.set(key, {
        value,
        metadata,
        lastUpdated: new Date().toISOString(),
        updateCount: (this.projectContext.get(key)?.updateCount || 0) + 1
      });
    }
    
    console.log(`📁 Project context updated: ${key}`);
  }

  getProjectContext(key) {
    const context = this.projectContext.get(key);
    return context ? context.value : null;
  }

  /**
   * 💻 CODE CONTEXT - Kod bağlamı
   */
  updateCodeContext(filePath, metadata = {}) {
    const existing = this.codeContext.get(filePath) || {};
    
    this.codeContext.set(filePath, {
      ...existing,
      ...metadata,
      lastAccessed: new Date().toISOString(),
      accessCount: (existing.accessCount || 0) + 1
    });
    
    console.log(`💻 Code context updated: ${filePath}`);
  }

  getCodeContext(filePath) {
    return this.codeContext.get(filePath);
  }

  getRecentlyAccessedFiles(limit = 10) {
    return Array.from(this.codeContext.entries())
      .sort((a, b) => new Date(b[1].lastAccessed) - new Date(a[1].lastAccessed))
      .slice(0, limit)
      .map(([path, context]) => ({ path, ...context }));
  }

  /**
   * ✅ TASK CONTEXT - Görev bağlamı
   */
  updateTaskContext(taskDescription, metadata = {}) {
    const taskId = this.generateTaskId(taskDescription);
    
    this.taskContext.set(taskId, {
      description: taskDescription,
      ...metadata,
      lastUpdated: new Date().toISOString()
    });
    
    console.log(`✅ Task context updated: ${taskId}`);
    return taskId;
  }

  generateTaskId(description) {
    return description.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  getActiveTasksContext() {
    return Array.from(this.taskContext.entries())
      .filter(([_, task]) => task.status !== 'completed')
      .map(([id, task]) => ({ id, ...task }));
  }

  /**
   * 🎯 SMART CONTEXT RETRIEVAL - Akıllı bağlam getirme
   */
  getRelevantContext(query = '', maxItems = 10) {
    const relevantContext = {
      conversation: this.getRelevantConversation(query, 5),
      project: this.getRelevantProjectContext(query),
      code: this.getRelevantCodeContext(query, 5),
      tasks: this.getRelevantTasks(query, 3)
    };
    
    console.log(`🎯 Retrieved relevant context for: ${query.substring(0, 50)}...`);
    return relevantContext;
  }

  getRelevantConversation(query, limit) {
    const queryLower = query.toLowerCase();
    
    return this.conversationHistory
      .filter(turn => {
        const text = (turn.userInput + ' ' + turn.assistantResponse).toLowerCase();
        return text.includes(queryLower) || 
               queryLower.split(' ').some(word => text.includes(word));
      })
      .sort((a, b) => b.importance - a.importance || new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  getRelevantProjectContext(query) {
    const relevant = {};
    const queryLower = query.toLowerCase();
    
    for (const [key, context] of this.projectContext.entries()) {
      const keyStr = String(key);
      const contextValue = context?.value || context;
      
      if (keyStr.toLowerCase().includes(queryLower) || 
          JSON.stringify(contextValue).toLowerCase().includes(queryLower)) {
        relevant[key] = contextValue;
      }
    }
    
    return relevant;
  }

  getRelevantCodeContext(query, limit) {
    const queryLower = query.toLowerCase();
    
    return Array.from(this.codeContext.entries())
      .filter(([path, context]) => 
        path.toLowerCase().includes(queryLower) ||
        (context.context && context.context.toLowerCase().includes(queryLower))
      )
      .sort((a, b) => b[1].accessCount - a[1].accessCount)
      .slice(0, limit)
      .map(([path, context]) => ({ path, ...context }));
  }

  getRelevantTasks(query, limit) {
    const queryLower = query.toLowerCase();
    
    return Array.from(this.taskContext.entries())
      .filter(([_, task]) => 
        task.description.toLowerCase().includes(queryLower)
      )
      .sort((a, b) => new Date(b[1].lastUpdated) - new Date(a[1].lastUpdated))
      .slice(0, limit)
      .map(([id, task]) => ({ id, ...task }));
  }

  /**
   * 🗜️ CONTEXT COMPRESSION - Bağlam sıkıştırma
   */
  compressContext() {
    this.compressConversationHistory();
    this.compressCodeContext();
    this.compressTaskContext();
    
    console.log('🗜️ Context compression completed');
  }

  compressConversationHistory() {
    if (this.conversationHistory.length <= this.compressionThreshold) return;
    
    // Keep high importance conversations and recent ones
    const important = this.conversationHistory.filter(turn => turn.importance >= 3);
    const recent = this.conversationHistory
      .slice(-20) // Last 20 turns
      .filter(turn => turn.importance < 3);
    
    this.conversationHistory = [...important, ...recent];
    console.log(`🗜️ Compressed conversation history to ${this.conversationHistory.length} turns`);
  }

  compressCodeContext() {
    // Remove old, rarely accessed files
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    for (const [path, context] of this.codeContext.entries()) {
      if (new Date(context.lastAccessed) < cutoffDate && context.accessCount < 3) {
        this.codeContext.delete(path);
      }
    }
  }

  compressTaskContext() {
    // Remove completed tasks older than 3 days
    const cutoffDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    for (const [id, task] of this.taskContext.entries()) {
      if (task.status === 'completed' && new Date(task.lastUpdated) < cutoffDate) {
        this.taskContext.delete(id);
      }
    }
  }

  /**
   * 💾 PERSISTENCE - Kalıcılık
   */
  persistContext() {
    const contextData = {
      conversation: this.conversationHistory.slice(-50), // Last 50 turns
      project: Object.fromEntries(this.projectContext),
      code: Object.fromEntries(this.codeContext),
      tasks: Object.fromEntries(this.taskContext),
      userPreferences: Object.fromEntries(this.userPreferences),
      lastPersisted: new Date().toISOString()
    };
    
    localStorage.setItem('trae_intelligent_context', JSON.stringify(contextData));
    console.log('💾 Context persisted to localStorage');
  }

  loadPersistedContext() {
    try {
      const stored = localStorage.getItem('trae_intelligent_context');
      if (!stored) return;
      
      const contextData = JSON.parse(stored);
      
      this.conversationHistory = contextData.conversation || [];
      this.projectContext = new Map(Object.entries(contextData.project || {}));
      this.codeContext = new Map(Object.entries(contextData.code || {}));
      this.taskContext = new Map(Object.entries(contextData.tasks || {}));
      this.userPreferences = new Map(Object.entries(contextData.userPreferences || {}));
      
      console.log('💾 Context loaded from localStorage');
    } catch (error) {
      console.error('❌ Failed to load persisted context:', error);
    }
  }

  /**
   * 📊 CONTEXT ANALYTICS - Bağlam analitikleri
   */
  getContextStats() {
    return {
      conversationTurns: this.conversationHistory.length,
      projectContextItems: this.projectContext.size,
      codeContextItems: this.codeContext.size,
      taskContextItems: this.taskContext.size,
      userPreferences: this.userPreferences.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  getContextSize() {
    return this.conversationHistory.length + this.projectContext.size + this.codeContext.size + this.taskContext.size;
  }

  scheduleContextPersistence() {
    // Debounce persistence to avoid too frequent saves
    if (this.persistenceTimeout) {
      clearTimeout(this.persistenceTimeout);
    }
    this.persistenceTimeout = setTimeout(() => {
      this.persistContext();
    }, 1000);
  }

  estimateMemoryUsage() {
    const data = {
      conversation: this.conversationHistory,
      project: Object.fromEntries(this.projectContext),
      code: Object.fromEntries(this.codeContext),
      tasks: Object.fromEntries(this.taskContext)
    };
    
    return JSON.stringify(data).length;
  }

  /**
   * Cleanup old context data
   */
  cleanup() {
    try {
      console.log('🧹 Cleaning up old context data...');
      
      // Get all localStorage keys
      const keys = Object.keys(localStorage);
      const contextKeys = keys.filter(key => key.startsWith('trae_context_'));
      
      let cleanedCount = 0;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      const now = Date.now();
      
      contextKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.timestamp && (now - data.timestamp) > maxAge) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        } catch (error) {
          // Remove corrupted entries
          localStorage.removeItem(key);
          cleanedCount++;
        }
      });
      
      console.log(`✅ Cleaned up ${cleanedCount} old context entries`);
      return cleanedCount;
      
    } catch (error) {
      console.error('❌ Context cleanup failed:', error);
      return 0;
    }
  }

  /**
   * Reset all context data
   */
  reset() {
    try {
      console.log('🔄 Resetting all context data...');
      
      this.conversationHistory = [];
      this.codeContext = new Map();
      this.taskContext = new Map();
      this.projectContext = new Map();
      this.userPreferences = new Map();
      
      // Clear from localStorage
      const keys = Object.keys(localStorage);
      const contextKeys = keys.filter(key => key.startsWith('trae_'));
      
      contextKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('✅ All context data reset');
      
    } catch (error) {
      console.error('❌ Context reset failed:', error);
    }
  }
}

// Global instance
export const contextManager = new IntelligentContextManager();