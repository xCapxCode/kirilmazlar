/**
 * 🧠 LOCAL DECISION ENGINE - Yerel Karar Motoru
 * .trae sisteminden .kiro'ya entegre edilmiş akıllı karar alma sistemi
 */

class LocalDecisionEngine {
  constructor() {
    this.decisionRules = new Map();
    this.decisionHistory = [];
    this.patterns = new Map();
    this.confidence = new Map();
    this.metrics = {
      totalDecisions: 0,
      automatedDecisions: 0,
      correctDecisions: 0,
      patternMatches: 0,
      startTime: Date.now()
    };

    this.initializeEngine();
    this.loadDecisionRules();
    this.loadPatterns();
  }

  initializeEngine() {
    console.log('🧠 Local Decision Engine initialized');

    // Pattern'leri her 5 dakikada bir kaydet
    setInterval(() => this.savePatterns(), 300000);

    // Expired decision history'yi temizle
    setInterval(() => this.cleanupHistory(), 600000);
  }

  /**
   * 📋 KARAR KURALLARI - Otomatik karar alma kuralları
   */
  loadDecisionRules() {
    // Dosya işlem kararları
    this.decisionRules.set('file_operation', {
      canDelete: (context) => this.canDeleteFile(context),
      canModify: (context) => this.canModifyFile(context),
      canCreate: (context) => this.canCreateFile(context),
      shouldBackup: (context) => this.shouldBackupFile(context)
    });

    // Kod kalitesi kararları
    this.decisionRules.set('code_quality', {
      needsRefactoring: (context) => this.needsRefactoring(context),
      isProductionReady: (context) => this.isProductionReady(context),
      hasSecurityIssues: (context) => this.hasSecurityIssues(context),
      performanceImpact: (context) => this.assessPerformanceImpact(context)
    });

    // Görev öncelik kararları
    this.decisionRules.set('task_priority', {
      isUrgent: (context) => this.isTaskUrgent(context),
      canAutomate: (context) => this.canAutomateTask(context),
      requiresApproval: (context) => this.requiresApproval(context),
      estimateComplexity: (context) => this.estimateComplexity(context)
    });

    // Sistem işlem kararları
    this.decisionRules.set('system_operation', {
      canRestart: (context) => this.canRestartService(context),
      shouldCache: (context) => this.shouldCacheResult(context),
      needsOptimization: (context) => this.needsOptimization(context),
      isSecure: (context) => this.isOperationSecure(context)
    });

    console.log(`📋 ${this.decisionRules.size} decision rule categories loaded`);
  }

  /**
   * 🎯 ANA KARAR ALMA METODu
   */
  async makeDecision(category, action, context) {
    this.metrics.totalDecisions++;

    const startTime = Date.now();

    // 1. Pattern matching kontrolü
    const patternResult = this.checkPatterns(category, action, context);
    if (patternResult) {
      this.metrics.patternMatches++;
      this.metrics.automatedDecisions++;

      console.log(`🎯 Pattern match: ${category}.${action} - Decision automated`);
      return this.recordDecision(category, action, context, patternResult, 'pattern', startTime);
    }

    // 2. Kural tabanlı karar alma
    const ruleResult = this.applyRules(category, action, context);
    if (ruleResult !== null) {
      this.metrics.automatedDecisions++;

      console.log(`📋 Rule applied: ${category}.${action} - Decision automated`);
      return this.recordDecision(category, action, context, ruleResult, 'rule', startTime);
    }

    // 3. Güven seviyesi kontrolü
    const confidence = this.calculateConfidence(category, action, context);
    if (confidence > 0.8) {
      const decision = this.makeConfidentDecision(category, action, context);
      this.metrics.automatedDecisions++;

      console.log(`🎯 Confident decision: ${category}.${action} (${(confidence * 100).toFixed(1)}%)`);
      return this.recordDecision(category, action, context, decision, 'confident', startTime);
    }

    // 4. Kullanıcı onayı gerekli
    console.log(`❓ User approval required: ${category}.${action} (confidence: ${(confidence * 100).toFixed(1)}%)`);
    return {
      decision: null,
      requiresApproval: true,
      confidence,
      category,
      action,
      context,
      reason: 'Low confidence, user approval required'
    };
  }

  /**
   * 🔍 PATTERN MATCHING - Geçmiş kararlardan öğrenme
   */
  checkPatterns(category, action, context) {
    const patternKey = `${category}.${action}`;
    const patterns = this.patterns.get(patternKey);

    if (!patterns || patterns.length === 0) {
      return null;
    }

    // En yakın pattern'i bul
    let bestMatch = null;
    let bestScore = 0;

    for (const pattern of patterns) {
      const score = this.calculateSimilarity(context, pattern.context);
      if (score > bestScore && score > 0.7) {
        bestScore = score;
        bestMatch = pattern;
      }
    }

    if (bestMatch && bestScore > 0.8) {
      // Pattern kullanım sayısını artır
      bestMatch.usageCount++;
      bestMatch.lastUsed = Date.now();

      return {
        decision: bestMatch.result,
        confidence: bestScore,
        source: 'pattern',
        patternId: bestMatch.id
      };
    }

    return null;
  }

  /**
   * 📋 KURAL TABANLI KARAR ALMA
   */
  applyRules(category, action, context) {
    const categoryRules = this.decisionRules.get(category);
    if (!categoryRules || !categoryRules[action]) {
      return null;
    }

    try {
      const result = categoryRules[action](context);
      return {
        decision: result,
        confidence: 0.9,
        source: 'rule'
      };
    } catch (error) {
      console.error(`❌ Rule application failed: ${category}.${action}`, error);
      return null;
    }
  }

  /**
   * 🎯 DOSYA İŞLEM KURALLARI
   */
  canDeleteFile(context) {
    const { filePath, dependencies = [] } = context;

    // Kritik dosyalar silinemez
    const criticalFiles = ['.env', 'package.json', 'vite.config.js', 'index.html'];
    if (criticalFiles.some(file => filePath.includes(file))) {
      return false;
    }

    // Bağımlılığı olan dosyalar silinemez
    if (dependencies.length > 0) {
      return false;
    }

    // Temp ve cache dosyaları silinebilir
    if (filePath.includes('temp') || filePath.includes('cache') || filePath.includes('.log')) {
      return true;
    }

    // Diğer durumlar için onay gerekli
    return null;
  }

  canModifyFile(context) {
    const { filePath, changeType = 'unknown' } = context;

    // node_modules ve .git dosyaları değiştirilemez
    if (filePath.includes('node_modules') || filePath.includes('.git')) {
      return false;
    }

    // Basit değişiklikler otomatik onaylanır
    const safeChanges = ['format', 'lint', 'comment', 'import_order'];
    if (safeChanges.includes(changeType)) {
      return true;
    }

    // Kritik dosyalar için dikkatli ol
    const criticalFiles = ['.env', 'package.json'];
    if (criticalFiles.some(file => filePath.includes(file))) {
      return changeType === 'format' || changeType === 'comment';
    }

    return true;
  }

  canCreateFile(context) {
    const { filePath, fileType = 'unknown' } = context;

    // Güvenli dosya tipleri otomatik oluşturulabilir
    const safeTypes = ['component', 'utility', 'test', 'documentation', 'config'];
    if (safeTypes.includes(fileType)) {
      return true;
    }

    // Temp dosyalar her zaman oluşturulabilir
    if (filePath.includes('temp') || filePath.includes('cache')) {
      return true;
    }

    return null;
  }

  shouldBackupFile(context) {
    const { filePath, changeType = 'unknown', importance = 'medium' } = context;

    // Kritik dosyalar her zaman yedeklenir
    const criticalFiles = ['.env', 'package.json', 'vite.config.js'];
    if (criticalFiles.some(file => filePath.includes(file))) {
      return true;
    }

    // Büyük değişiklikler yedeklenir
    const majorChanges = ['refactor', 'restructure', 'delete', 'major_update'];
    if (majorChanges.includes(changeType)) {
      return true;
    }

    // Önemli dosyalar yedeklenir
    if (importance === 'high' || importance === 'critical') {
      return true;
    }

    return false;
  }

  /**
   * 🔧 KOD KALİTESİ KURALLARI
   */
  needsRefactoring(context) {
    const { complexity = {}, codeLines = 0, duplicateLines = 0 } = context;

    // Yüksek karmaşıklık
    if (complexity.score > 10) {
      return true;
    }

    // Çok uzun dosyalar
    if (codeLines > 500) {
      return true;
    }

    // Çok fazla duplicate kod
    if (duplicateLines > codeLines * 0.3) {
      return true;
    }

    return false;
  }

  isProductionReady(context) {
    const { testCoverage = 0, lintErrors = 0, securityIssues = 0 } = context;

    // Minimum gereksinimler
    if (testCoverage < 70) return false;
    if (lintErrors > 0) return false;
    if (securityIssues > 0) return false;

    return true;
  }

  hasSecurityIssues(context) {
    const { code = '', dependencies = [] } = context;

    // Basit güvenlik kontrolleri
    const securityRisks = [
      'eval(',
      'innerHTML =',
      'document.write(',
      'dangerouslySetInnerHTML'
    ];

    for (const risk of securityRisks) {
      if (code.includes(risk)) {
        return true;
      }
    }

    // Güvenlik açığı olan bağımlılıklar
    const vulnerableDeps = ['lodash@4.17.20', 'axios@0.21.0'];
    for (const dep of dependencies) {
      if (vulnerableDeps.includes(dep)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 📊 GÜVEN SEVİYESİ HESAPLAMA
   */
  calculateConfidence(category, action, context) {
    let confidence = 0.5; // Base confidence

    // Geçmiş başarı oranı
    const historyScore = this.getHistoryScore(category, action);
    confidence += historyScore * 0.3;

    // Context completeness
    const contextScore = this.getContextScore(context);
    confidence += contextScore * 0.2;

    // Pattern similarity
    const patternScore = this.getPatternScore(category, action, context);
    confidence += patternScore * 0.3;

    return Math.min(confidence, 1.0);
  }

  getHistoryScore(category, action) {
    const key = `${category}.${action}`;
    const history = this.decisionHistory.filter(d =>
      d.category === category && d.action === action
    );

    if (history.length === 0) return 0;

    const successRate = history.filter(d => d.wasCorrect).length / history.length;
    return successRate;
  }

  getContextScore(context) {
    const requiredFields = ['filePath', 'changeType', 'importance'];
    const providedFields = Object.keys(context);

    const completeness = providedFields.filter(field =>
      requiredFields.includes(field)
    ).length / requiredFields.length;

    return completeness;
  }

  getPatternScore(category, action, context) {
    const patternKey = `${category}.${action}`;
    const patterns = this.patterns.get(patternKey);

    if (!patterns || patterns.length === 0) {
      return 0;
    }

    let maxSimilarity = 0;
    for (const pattern of patterns) {
      const similarity = this.calculateSimilarity(context, pattern.context);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }

    return maxSimilarity;
  }

  /**
   * 🔍 BENZERLIK HESAPLAMA
   */
  calculateSimilarity(context1, context2) {
    if (!context1 || !context2) return 0;

    const keys1 = Object.keys(context1);
    const keys2 = Object.keys(context2);
    const allKeys = [...new Set([...keys1, ...keys2])];

    if (allKeys.length === 0) return 1;

    let matches = 0;
    let total = 0;

    for (const key of allKeys) {
      total++;
      const val1 = context1[key];
      const val2 = context2[key];

      if (val1 === val2) {
        matches++;
      } else if (typeof val1 === 'string' && typeof val2 === 'string') {
        // String similarity için basit kontrol
        const similarity = this.stringSimilarity(val1, val2);
        matches += similarity;
      } else if (typeof val1 === 'number' && typeof val2 === 'number') {
        // Numeric similarity
        const diff = Math.abs(val1 - val2);
        const max = Math.max(Math.abs(val1), Math.abs(val2));
        if (max === 0) {
          matches++;
        } else {
          matches += Math.max(0, 1 - (diff / max));
        }
      }
    }

    return matches / total;
  }

  stringSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 💾 PATTERN YÖNETİMİ
   */
  savePatterns() {
    try {
      const patternsData = {};
      for (const [key, patterns] of this.patterns.entries()) {
        patternsData[key] = patterns.map(p => ({
          ...p,
          context: JSON.stringify(p.context)
        }));
      }

      localStorage.setItem('kiro_decision_patterns', JSON.stringify(patternsData));
      console.log('💾 Decision patterns saved');
    } catch (error) {
      console.error('❌ Failed to save patterns:', error);
    }
  }

  loadPatterns() {
    try {
      const saved = localStorage.getItem('kiro_decision_patterns');
      if (saved) {
        const patternsData = JSON.parse(saved);

        for (const [key, patterns] of Object.entries(patternsData)) {
          this.patterns.set(key, patterns.map(p => ({
            ...p,
            context: JSON.parse(p.context)
          })));
        }

        console.log(`💾 Loaded ${Object.keys(patternsData).length} pattern categories`);
      }
    } catch (error) {
      console.error('❌ Failed to load patterns:', error);
    }
  }

  /**
   * 📝 KARAR KAYDI VE ÖĞRENME
   */
  recordDecision(category, action, context, result, source, startTime) {
    const decision = {
      id: Date.now() + Math.random(),
      category,
      action,
      context,
      result: result.decision,
      confidence: result.confidence,
      source,
      timestamp: Date.now(),
      processingTime: Date.now() - startTime,
      wasCorrect: null // Sonradan feedback ile güncellenecek
    };

    this.decisionHistory.push(decision);

    // Pattern olarak kaydet (yüksek güven seviyesinde)
    if (result.confidence > 0.8 && source !== 'pattern') {
      this.saveAsPattern(category, action, context, result);
    }

    return {
      ...result,
      decisionId: decision.id,
      processingTime: decision.processingTime
    };
  }

  saveAsPattern(category, action, context, result) {
    const patternKey = `${category}.${action}`;

    if (!this.patterns.has(patternKey)) {
      this.patterns.set(patternKey, []);
    }

    const patterns = this.patterns.get(patternKey);
    patterns.push({
      id: Date.now() + Math.random(),
      context,
      result: result.decision,
      confidence: result.confidence,
      usageCount: 1,
      createdAt: Date.now(),
      lastUsed: Date.now()
    });

    // Pattern sayısını sınırla
    if (patterns.length > 50) {
      patterns.sort((a, b) => b.usageCount - a.usageCount);
      patterns.splice(30); // En iyi 30'u tut
    }
  }

  /**
   * 📊 METRİK VE PERFORMANS
   */
  getMetrics() {
    const runtime = Date.now() - this.metrics.startTime;
    const automationRate = this.metrics.totalDecisions > 0
      ? ((this.metrics.automatedDecisions / this.metrics.totalDecisions) * 100).toFixed(1)
      : 0;

    return {
      ...this.metrics,
      runtime,
      automationRate: `${automationRate}%`,
      averageProcessingTime: this.decisionHistory.length > 0
        ? (this.decisionHistory.reduce((sum, d) => sum + d.processingTime, 0) / this.decisionHistory.length).toFixed(2) + 'ms'
        : '0ms',
      patternCount: Array.from(this.patterns.values()).reduce((sum, patterns) => sum + patterns.length, 0)
    };
  }

  /**
   * 🧹 TEMİZLİK VE BAKIM
   */
  cleanupHistory() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const initialLength = this.decisionHistory.length;

    this.decisionHistory = this.decisionHistory.filter(d => d.timestamp > oneWeekAgo);

    const cleaned = initialLength - this.decisionHistory.length;
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} old decision records`);
    }
  }

  /**
   * 🎯 HEDEF PERFORMANS KONTROLÜ
   */
  checkTargetPerformance() {
    const metrics = this.getMetrics();
    const automationNum = parseFloat(metrics.automationRate);

    return {
      targetMet: automationNum >= 95,
      currentAutomation: metrics.automationRate,
      target: '95%',
      recommendations: automationNum < 95 ? [
        'Add more decision rules',
        'Improve pattern recognition',
        'Increase confidence thresholds'
      ] : []
    };
  }
}

// Global instance
export const decisionEngine = new LocalDecisionEngine();

// Browser global access
if (typeof window !== 'undefined') {
  window.kiroDecisionEngine = decisionEngine;
}

export default LocalDecisionEngine;