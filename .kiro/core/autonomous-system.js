/**
 * 🤖 KIRO AUTONOMOUS SYSTEM - Ana Otonom Sistem
 * %97 API tasarrufu hedefli merkezi otonom sistem
 */

import { apiOptimizer } from './api-optimization-engine.js';
import { decisionEngine } from './local-decision-engine.js';
import { memoryManager } from './memory-manager.js';
import { steeringParser } from './steering-parser.js';

class KiroAutonomousSystem {
  constructor() {
    this.isInitialized = false;
    this.components = {
      apiOptimizer,
      decisionEngine,
      steeringParser,
      memoryManager
    };

    this.metrics = {
      totalTasks: 0,
      automatedTasks: 0,
      apiCallsSaved: 0,
      decisionsAutomated: 0,
      startTime: Date.now()
    };

    this.initialize();
  }

  async initialize() {
    console.log('🚀 Initializing Kiro Autonomous System...');

    try {
      // Bileşenleri başlat
      await this.initializeComponents();

      // Sistem durumunu kontrol et
      await this.performHealthCheck();

      this.isInitialized = true;
      console.log('✅ Kiro Autonomous System initialized successfully');

      // Performans izlemeyi başlat
      this.startPerformanceMonitoring();

    } catch (error) {
      console.error('❌ Failed to initialize Kiro Autonomous System:', error);
      throw error;
    }
  }

  async initializeComponents() {
    console.log('🔧 Initializing system components...');

    // API Optimizer zaten constructor'da başlatıldı
    console.log('✅ API Optimizer ready');

    // Decision Engine zaten constructor'da başlatıldı  
    console.log('✅ Decision Engine ready');

    console.log('🎯 Target: 97% API savings through autonomous processing');
  }

  async performHealthCheck() {
    console.log('🏥 Performing system health check...');

    const health = {
      apiOptimizer: this.components.apiOptimizer ? 'healthy' : 'failed',
      decisionEngine: this.components.decisionEngine ? 'healthy' : 'failed',
      localStorage: typeof localStorage !== 'undefined' ? 'healthy' : 'failed'
    };

    const failedComponents = Object.entries(health)
      .filter(([_, status]) => status === 'failed')
      .map(([component, _]) => component);

    if (failedComponents.length > 0) {
      throw new Error(`Health check failed for: ${failedComponents.join(', ')}`);
    }

    console.log('✅ All components healthy');
    return health;
  }

  /**
   * 🎯 ANA GÖREV İŞLEME METODu - %97 tasarruf hedefi
   */
  async processTask(taskType, data, options = {}) {
    this.metrics.totalTasks++;
    const startTime = Date.now();

    console.log(`📋 Processing task: ${taskType}`);

    try {
      // 1. Steering Rules kontrolü - %97 API tasarrufu için
      const steeringDecision = this.components.steeringParser.shouldUseAPI(taskType, { data, ...options });

      if (!steeringDecision.useAPI) {
        console.log(`🎯 Steering: ${steeringDecision.reason} (${steeringDecision.savingsContribution} savings)`);
      }

      // 2. Karar alma gerekli mi?
      if (options.requiresDecision) {
        const decision = await this.components.decisionEngine.makeDecision(
          options.decisionCategory || 'general',
          options.decisionAction || 'process',
          { taskType, data, steeringDecision, ...options.context }
        );

        if (decision.requiresApproval) {
          return {
            success: false,
            requiresApproval: true,
            decision,
            message: 'User approval required for this task'
          };
        }

        this.metrics.decisionsAutomated++;
        this.components.memoryManager.recordActivity('decision_automated', {
          category: options.decisionCategory,
          action: options.decisionAction
        });
      }

      // 3. API Optimizer ile görevi işle (steering rules dikkate alınarak)
      const result = await this.components.apiOptimizer.processTask(taskType, data, {
        preferLocal: !steeringDecision.useAPI,
        checkCache: steeringDecision.checkCache
      });

      // 3. Metrikleri güncelle
      if (result.source === 'local' || result.source === 'cache') {
        this.metrics.apiCallsSaved++;
      }

      if (result.source !== 'api') {
        this.metrics.automatedTasks++;
      }

      const processingTime = Date.now() - startTime;

      console.log(`✅ Task completed: ${taskType} (${result.source}, ${processingTime}ms)`);

      // Memory Manager'a aktivite kaydet
      this.components.memoryManager.recordActivity('task_completed', {
        taskType,
        source: result.source,
        processingTime,
        apiCallSaved: result.source !== 'api'
      });

      if (result.source !== 'api') {
        this.components.memoryManager.recordActivity('api_call_saved', { taskType });
      }

      return {
        success: true,
        result: result.result,
        source: result.source,
        cached: result.cached,
        processingTime,
        apiCallSaved: result.source !== 'api'
      };

    } catch (error) {
      console.error(`❌ Task failed: ${taskType}`, error);
      return {
        success: false,
        error: error.message,
        taskType,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * 🧠 AKILLI KARAR ALMA
   */
  async makeDecision(category, action, context) {
    return await this.components.decisionEngine.makeDecision(category, action, context);
  }

  /**
   * 📊 SİSTEM METRİKLERİ
   */
  getSystemMetrics() {
    const apiMetrics = this.components.apiOptimizer.getMetrics();
    const decisionMetrics = this.components.decisionEngine.getMetrics();
    const steeringStats = this.components.steeringParser.getRuleStats();

    const runtime = Date.now() - this.metrics.startTime;
    const automationRate = this.metrics.totalTasks > 0
      ? ((this.metrics.automatedTasks / this.metrics.totalTasks) * 100).toFixed(1)
      : 0;

    const overallSavings = this.metrics.totalTasks > 0
      ? ((this.metrics.apiCallsSaved / this.metrics.totalTasks) * 100).toFixed(1)
      : 0;

    return {
      system: {
        ...this.metrics,
        runtime,
        automationRate: `${automationRate}%`,
        overallSavings: `${overallSavings}%`,
        isInitialized: this.isInitialized
      },
      apiOptimizer: apiMetrics,
      decisionEngine: decisionMetrics,
      steeringRules: steeringStats,
      targetPerformance: {
        apiSavingsTarget: '97%',
        currentSavings: `${overallSavings}%`,
        targetMet: parseFloat(overallSavings) >= 97,
        automationTarget: '95%',
        currentAutomation: `${automationRate}%`,
        automationTargetMet: parseFloat(automationRate) >= 95
      }
    };
  }

  /**
   * 📈 PERFORMANS İZLEME
   */
  startPerformanceMonitoring() {
    // Her 30 saniyede bir performans raporu
    setInterval(() => {
      const metrics = this.getSystemMetrics();

      if (metrics.system.runtime > 60000) { // 1 dakika sonra
        console.log('📊 Performance Report:', {
          'API Savings': metrics.targetPerformance.currentSavings,
          'Automation Rate': metrics.targetPerformance.currentAutomation,
          'Total Tasks': metrics.system.totalTasks,
          'Runtime': `${(metrics.system.runtime / 1000).toFixed(1)}s`
        });
      }
    }, 30000);
  }

  /**
   * 🎯 HEDEF PERFORMANS KONTROLÜ
   */
  checkTargetPerformance() {
    const metrics = this.getSystemMetrics();
    const apiTarget = metrics.targetPerformance;

    const status = {
      overall: apiTarget.targetMet && apiTarget.automationTargetMet ? 'SUCCESS' : 'NEEDS_IMPROVEMENT',
      apiSavings: {
        current: apiTarget.currentSavings,
        target: apiTarget.apiSavingsTarget,
        met: apiTarget.targetMet
      },
      automation: {
        current: apiTarget.currentAutomation,
        target: apiTarget.automationTarget,
        met: apiTarget.automationTargetMet
      },
      recommendations: []
    };

    if (!apiTarget.targetMet) {
      status.recommendations.push('Increase local processing and caching');
    }

    if (!apiTarget.automationTargetMet) {
      status.recommendations.push('Improve decision automation rules');
    }

    return status;
  }

  /**
   * 🧹 SİSTEM TEMİZLİK VE BAKIM
   */
  performMaintenance() {
    console.log('🧹 Performing system maintenance...');

    // Cache temizliği
    this.components.apiOptimizer.clearExpiredCache();

    // Decision history temizliği
    this.components.decisionEngine.cleanupHistory();

    console.log('✅ System maintenance completed');
  }

  /**
   * 🔄 SİSTEM YENİDEN BAŞLATMA
   */
  async restart() {
    console.log('🔄 Restarting Kiro Autonomous System...');

    this.isInitialized = false;

    // Metrikleri sıfırla
    this.metrics = {
      totalTasks: 0,
      automatedTasks: 0,
      apiCallsSaved: 0,
      decisionsAutomated: 0,
      startTime: Date.now()
    };

    await this.initialize();
  }
}

// Global instance
export const kiroSystem = new KiroAutonomousSystem();

// Browser global access
if (typeof window !== 'undefined') {
  window.kiroSystem = kiroSystem;
}

export default KiroAutonomousSystem;