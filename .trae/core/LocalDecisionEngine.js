/**
 * 🧠 LOCAL DECISION ENGINE - Yerel Karar Motoru
 * API çağrısı yapmadan yerel kararlar alır
 */

import { contextManager } from './IntelligentContextManager.js';
import { apiOptimizer } from './ApiOptimizationEngine.js';

export class LocalDecisionEngine {
  constructor() {
    this.decisionRules = new Map();
    this.decisionHistory = [];
    this.patterns = new Map();
    this.confidence = new Map();
    
    this.initializeEngine();
    this.loadDecisionRules();
  }

  initializeEngine() {
    console.log('🧠 Local Decision Engine initialized');
    
    // Load patterns from localStorage
    this.loadPatterns();
    
    // Save patterns every 5 minutes
    setInterval(() => this.savePatterns(), 300000);
  }

  /**
   * 📋 DECISION RULES - Karar kuralları
   */
  loadDecisionRules() {
    // File operation decisions
    this.decisionRules.set('file_operation', {
      canDelete: (context) => this.canDeleteFile(context),
      canModify: (context) => this.canModifyFile(context),
      canCreate: (context) => this.canCreateFile(context),
      shouldBackup: (context) => this.shouldBackupFile(context)
    });
    
    // Code quality decisions
    this.decisionRules.set('code_quality', {
      needsRefactoring: (context) => this.needsRefactoring(context),
      isProduction: (context) => this.isProductionReady(context),
      hasSecurityIssues: (context) => this.hasSecurityIssues(context),
      performanceImpact: (context) => this.assessPerformanceImpact(context)
    });
    
    // Task priority decisions
    this.decisionRules.set('task_priority', {
      isUrgent: (context) => this.isUrgentTask(context),
      canWait: (context) => this.canTaskWait(context),
      needsApproval: (context) => this.needsApproval(context),
      canAutomate: (context) => this.canAutomate(context)
    });
    
    // API optimization decisions
    this.decisionRules.set('api_optimization', {
      useCache: (context) => this.shouldUseCache(context),
      batchRequest: (context) => this.shouldBatchRequest(context),
      processLocally: (context) => this.shouldProcessLocally(context),
      skipRequest: (context) => this.shouldSkipRequest(context)
    });
    
    // System health decisions
    this.decisionRules.set('system_health', {
      isStable: (context) => this.isSystemStable(context),
      needsMaintenance: (context) => this.needsMaintenance(context),
      canContinue: (context) => this.canContinueOperation(context),
      shouldRestart: (context) => this.shouldRestart(context)
    });
    
    console.log(`📋 Loaded ${this.decisionRules.size} decision rule categories`);
  }

  /**
   * 🎯 MAIN DECISION INTERFACE - Ana karar arayüzü
   */
  async makeDecision(category, action, context = {}) {
    console.log(`🎯 Making decision: ${category}.${action}`);
    
    const startTime = Date.now();
    
    try {
      // Check if we have a rule for this decision
      if (!this.decisionRules.has(category)) {
        throw new Error(`Unknown decision category: ${category}`);
      }
      
      const rules = this.decisionRules.get(category);
      if (!rules[action]) {
        throw new Error(`Unknown action: ${action} in category: ${category}`);
      }
      
      // Enhance context with relevant information
      const enhancedContext = await this.enhanceContext(context, category, action);
      
      // Check patterns first
      const patternResult = this.checkPatterns(category, action, enhancedContext);
      if (patternResult) {
        console.log(`🔄 Using pattern-based decision for ${category}.${action}`);
        this.recordDecision(category, action, enhancedContext, patternResult, 'pattern');
        return patternResult;
      }
      
      // Apply the rule
      const result = rules[action](enhancedContext);
      
      // Calculate confidence
      const confidence = this.calculateConfidence(category, action, enhancedContext, result);
      
      // Record the decision
      this.recordDecision(category, action, enhancedContext, result, 'rule', confidence);
      
      // Update patterns
      this.updatePatterns(category, action, enhancedContext, result);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Decision made in ${duration}ms: ${category}.${action} = ${result}`);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Decision failed: ${category}.${action}`, error);
      
      // Return safe default
      const safeDefault = this.getSafeDefault(category, action);
      this.recordDecision(category, action, context, safeDefault, 'default');
      
      return safeDefault;
    }
  }

  async enhanceContext(context, category, action) {
    const enhanced = { ...context };
    
    // Add relevant context from contextManager
    const relevantContext = contextManager.getRelevantContext(`${category} ${action}`);
    enhanced.relevantContext = relevantContext;
    
    // Add system state
    enhanced.systemState = {
      timestamp: new Date().toISOString(),
      memoryUsage: this.getMemoryUsage(),
      taskQueue: this.getTaskQueueStatus(),
      apiUsage: apiOptimizer.getUsageStats()
    };
    
    // Add decision history for this category/action
    enhanced.decisionHistory = this.getRecentDecisions(category, action, 10);
    
    return enhanced;
  }

  /**
   * 📁 FILE OPERATION DECISIONS - Dosya işlem kararları
   */
  canDeleteFile(context) {
    const { filePath, fileContent, dependencies } = context;
    
    // Never delete critical files
    const criticalFiles = [
      'package.json',
      'package-lock.json',
      'yarn.lock',
      '.gitignore',
      'README.md',
      'index.html'
    ];
    
    const fileName = filePath?.split('/').pop() || '';
    if (criticalFiles.includes(fileName)) {
      return false;
    }
    
    // Don't delete if file has dependencies
    if (dependencies && dependencies.length > 0) {
      return false;
    }
    
    // Don't delete if file is large and might contain important data
    if (fileContent && fileContent.length > 10000) {
      return false;
    }
    
    return true;
  }

  canModifyFile(context) {
    const { filePath, isProduction, hasBackup } = context;
    
    // Always allow modification if we have backup
    if (hasBackup) {
      return true;
    }
    
    // Be careful with production files
    if (isProduction) {
      return false;
    }
    
    // Check if file is in critical directory
    const criticalDirs = ['node_modules', '.git', 'dist', 'build'];
    const isInCriticalDir = criticalDirs.some(dir => filePath?.includes(dir));
    
    return !isInCriticalDir;
  }

  canCreateFile(context) {
    const { filePath, directory, diskSpace } = context;
    
    // Check disk space
    if (diskSpace && diskSpace < 100 * 1024 * 1024) { // 100MB
      return false;
    }
    
    // Don't create in protected directories
    const protectedDirs = ['node_modules', '.git'];
    const isInProtectedDir = protectedDirs.some(dir => 
      filePath?.includes(dir) || directory?.includes(dir)
    );
    
    return !isInProtectedDir;
  }

  shouldBackupFile(context) {
    const { filePath, fileSize, isImportant, hasChanges } = context;
    
    // Always backup important files
    if (isImportant) {
      return true;
    }
    
    // Backup if file has unsaved changes
    if (hasChanges) {
      return true;
    }
    
    // Backup large files
    if (fileSize && fileSize > 50000) { // 50KB
      return true;
    }
    
    // Backup configuration files
    const configFiles = ['.env', 'config.js', 'settings.json'];
    const fileName = filePath?.split('/').pop() || '';
    
    return configFiles.some(config => fileName.includes(config));
  }

  /**
   * 🔧 CODE QUALITY DECISIONS - Kod kalitesi kararları
   */
  needsRefactoring(context) {
    const { complexity, codeLines, functions, duplicateCode } = context;
    
    // High complexity indicates need for refactoring
    if (complexity && complexity.score > 7) {
      return true;
    }
    
    // Too many lines in a single file
    if (codeLines > 500) {
      return true;
    }
    
    // Too many functions in a single file
    if (functions > 20) {
      return true;
    }
    
    // High duplicate code percentage
    if (duplicateCode && duplicateCode > 30) {
      return true;
    }
    
    return false;
  }

  isProductionReady(context) {
    const { hasTests, hasDocumentation, codeQuality, securityIssues } = context;
    
    // Must have tests
    if (!hasTests) {
      return false;
    }
    
    // Must have documentation
    if (!hasDocumentation) {
      return false;
    }
    
    // Must have good code quality
    if (codeQuality && codeQuality.score < 7) {
      return false;
    }
    
    // Must not have security issues
    if (securityIssues && securityIssues.length > 0) {
      return false;
    }
    
    return true;
  }

  hasSecurityIssues(context) {
    const { code, dependencies, userInput } = context;
    
    if (!code) return false;
    
    // Check for common security issues
    const securityPatterns = [
      /eval\s*\(/,
      /innerHTML\s*=/,
      /document\.write/,
      /localStorage\.setItem.*password/i,
      /sessionStorage\.setItem.*password/i,
      /console\.log.*password/i,
      /alert.*password/i
    ];
    
    const hasIssue = securityPatterns.some(pattern => pattern.test(code));
    
    // Check for vulnerable dependencies
    if (dependencies) {
      const vulnerableDeps = ['lodash@4.17.15', 'moment@2.24.0'];
      const hasVulnerableDep = dependencies.some(dep => 
        vulnerableDeps.some(vuln => dep.includes(vuln))
      );
      
      if (hasVulnerableDep) return true;
    }
    
    return hasIssue;
  }

  /**
   * 📊 API OPTIMIZATION DECISIONS - API optimizasyon kararları
   */
  shouldUseCache(context) {
    const { requestType, dataAge, frequency } = context;
    
    // Always cache static data
    if (requestType === 'static') {
      return true;
    }
    
    // Cache if data is not too old
    if (dataAge && dataAge < 300000) { // 5 minutes
      return true;
    }
    
    // Cache frequently requested data
    if (frequency && frequency > 3) {
      return true;
    }
    
    return false;
  }

  shouldProcessLocally(context) {
    const { taskType, dataSize, complexity, hasLocalProcessor } = context;
    
    // Process locally if we have a local processor
    if (hasLocalProcessor) {
      return true;
    }
    
    // Process small data locally
    if (dataSize && dataSize < 10000) { // 10KB
      return true;
    }
    
    // Process simple tasks locally
    const simpleTasks = [
      'format_text',
      'validate_input',
      'sort_data',
      'filter_data',
      'calculate_basic'
    ];
    
    if (simpleTasks.includes(taskType)) {
      return true;
    }
    
    // Don't process complex tasks locally
    if (complexity && complexity > 5) {
      return false;
    }
    
    return true;
  }

  /**
   * 🔄 PATTERN MANAGEMENT - Desen yönetimi
   */
  checkPatterns(category, action, context) {
    const patternKey = `${category}.${action}`;
    
    if (!this.patterns.has(patternKey)) {
      return null;
    }
    
    const patterns = this.patterns.get(patternKey);
    
    // Find matching pattern
    for (const pattern of patterns) {
      if (this.matchesPattern(context, pattern.context)) {
        // Increase pattern confidence
        pattern.confidence = Math.min(1.0, pattern.confidence + 0.1);
        pattern.usageCount++;
        pattern.lastUsed = new Date().toISOString();
        
        return pattern.result;
      }
    }
    
    return null;
  }

  matchesPattern(context, patternContext) {
    // Simple pattern matching based on key properties
    const keyProps = ['filePath', 'taskType', 'category', 'action'];
    
    let matches = 0;
    let total = 0;
    
    for (const prop of keyProps) {
      if (patternContext[prop] !== undefined) {
        total++;
        if (context[prop] === patternContext[prop]) {
          matches++;
        }
      }
    }
    
    // Require at least 70% match
    return total > 0 && (matches / total) >= 0.7;
  }

  updatePatterns(category, action, context, result) {
    const patternKey = `${category}.${action}`;
    
    if (!this.patterns.has(patternKey)) {
      this.patterns.set(patternKey, []);
    }
    
    const patterns = this.patterns.get(patternKey);
    
    // Create new pattern
    const newPattern = {
      context: this.extractPatternContext(context),
      result,
      confidence: 0.5,
      usageCount: 1,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    patterns.push(newPattern);
    
    // Keep only the most recent 50 patterns per category.action
    if (patterns.length > 50) {
      patterns.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
      patterns.splice(50);
    }
  }

  extractPatternContext(context) {
    // Extract only relevant properties for pattern matching
    const relevant = {};
    const keyProps = [
      'filePath', 'taskType', 'category', 'action',
      'fileSize', 'complexity', 'isProduction'
    ];
    
    for (const prop of keyProps) {
      if (context[prop] !== undefined) {
        relevant[prop] = context[prop];
      }
    }
    
    return relevant;
  }

  /**
   * 📈 CONFIDENCE & ANALYTICS - Güven ve analitik
   */
  calculateConfidence(category, action, context, result) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on decision history
    const recentDecisions = this.getRecentDecisions(category, action, 10);
    const successRate = this.calculateSuccessRate(recentDecisions);
    confidence += successRate * 0.3;
    
    // Increase confidence if context is complete
    const contextCompleteness = this.assessContextCompleteness(context);
    confidence += contextCompleteness * 0.2;
    
    return Math.min(1.0, confidence);
  }

  calculateSuccessRate(decisions) {
    if (decisions.length === 0) return 0;
    
    const successful = decisions.filter(d => d.success !== false).length;
    return successful / decisions.length;
  }

  assessContextCompleteness(context) {
    const requiredProps = ['filePath', 'taskType', 'systemState'];
    const presentProps = requiredProps.filter(prop => context[prop] !== undefined);
    
    return presentProps.length / requiredProps.length;
  }

  /**
   * 📝 DECISION RECORDING - Karar kaydetme
   */
  recordDecision(category, action, context, result, method, confidence = 0.5) {
    const decision = {
      id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category,
      action,
      context: this.extractPatternContext(context),
      result,
      method, // 'rule', 'pattern', 'default'
      confidence,
      timestamp: new Date().toISOString()
    };
    
    this.decisionHistory.push(decision);
    
    // Keep only recent 1000 decisions
    if (this.decisionHistory.length > 1000) {
      this.decisionHistory.splice(0, this.decisionHistory.length - 1000);
    }
    
    // Save to localStorage periodically
    if (this.decisionHistory.length % 10 === 0) {
      this.saveDecisionHistory();
    }
  }

  getRecentDecisions(category, action, limit = 10) {
    return this.decisionHistory
      .filter(d => d.category === category && d.action === action)
      .slice(-limit);
  }

  /**
   * 💾 PERSISTENCE - Kalıcılık
   */
  savePatterns() {
    try {
      const patternsData = {};
      this.patterns.forEach((value, key) => {
        patternsData[key] = value;
      });
      
      localStorage.setItem('trae_decision_patterns', JSON.stringify(patternsData));
      console.log('💾 Decision patterns saved');
    } catch (error) {
      console.error('❌ Failed to save patterns:', error);
    }
  }

  loadPatterns() {
    try {
      const saved = localStorage.getItem('trae_decision_patterns');
      if (saved) {
        const patternsData = JSON.parse(saved);
        Object.entries(patternsData).forEach(([key, value]) => {
          this.patterns.set(key, value);
        });
        console.log(`💾 Loaded ${this.patterns.size} decision patterns`);
      }
    } catch (error) {
      console.error('❌ Failed to load patterns:', error);
    }
  }

  saveDecisionHistory() {
    try {
      const recentHistory = this.decisionHistory.slice(-100); // Save only recent 100
      localStorage.setItem('trae_decision_history', JSON.stringify(recentHistory));
    } catch (error) {
      console.error('❌ Failed to save decision history:', error);
    }
  }

  /**
   * 🛡️ SAFE DEFAULTS - Güvenli varsayılanlar
   */
  getSafeDefault(category, action) {
    const safeDefaults = {
      'file_operation': {
        canDelete: false,
        canModify: false,
        canCreate: true,
        shouldBackup: true
      },
      'code_quality': {
        needsRefactoring: true,
        isProduction: false,
        hasSecurityIssues: true,
        performanceImpact: 'medium'
      },
      'task_priority': {
        isUrgent: false,
        canWait: true,
        needsApproval: true,
        canAutomate: false
      },
      'api_optimization': {
        useCache: true,
        batchRequest: true,
        processLocally: true,
        skipRequest: false
      },
      'system_health': {
        isStable: true,
        needsMaintenance: false,
        canContinue: true,
        shouldRestart: false
      }
    };
    
    return safeDefaults[category]?.[action] || false;
  }

  /**
   * 📊 UTILITY METHODS - Yardımcı metodlar
   */
  getMemoryUsage() {
    // Simple memory usage estimation
    return {
      patterns: this.patterns.size,
      decisions: this.decisionHistory.length,
      rules: this.decisionRules.size
    };
  }

  getTaskQueueStatus() {
    // This would integrate with task executor
    return {
      queued: 0,
      running: 0,
      completed: 0
    };
  }

  getDecisionStats() {
    const stats = {
      totalDecisions: this.decisionHistory.length,
      categories: {},
      methods: {},
      averageConfidence: 0
    };
    
    this.decisionHistory.forEach(decision => {
      // Count by category
      if (!stats.categories[decision.category]) {
        stats.categories[decision.category] = 0;
      }
      stats.categories[decision.category]++;
      
      // Count by method
      if (!stats.methods[decision.method]) {
        stats.methods[decision.method] = 0;
      }
      stats.methods[decision.method]++;
    });
    
    // Calculate average confidence
    if (this.decisionHistory.length > 0) {
      const totalConfidence = this.decisionHistory.reduce((sum, d) => sum + d.confidence, 0);
      stats.averageConfidence = totalConfidence / this.decisionHistory.length;
    }
    
    return stats;
  }
}

// Global instance
export const decisionEngine = new LocalDecisionEngine();