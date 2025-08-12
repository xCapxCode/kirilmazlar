/**
 * 🎯 STEERING RULES PARSER - Kural Sistemi Entegratörü
 * Markdown steering dosyalarını JavaScript kurallarına çevirir
 */

class SteeringRulesParser {
  constructor() {
    this.rules = {
      autonomous: new Map(),
      forbidden: new Map(),
      localTasks: new Set(),
      apiTasks: new Set(),
      cacheableTasks: new Set()
    };

    this.loadRules();
  }

  /**
   * 📋 KURALLARI YÜKLEMEk
   */
  async loadRules() {
    try {
      // Autonomous rules'u parse et
      await this.parseAutonomousRules();

      console.log('✅ Steering rules loaded successfully');
      console.log(`📊 Rules loaded: ${this.rules.autonomous.size} autonomous, ${this.rules.forbidden.size} forbidden`);

    } catch (error) {
      console.error('❌ Failed to load steering rules:', error);
    }
  }

  /**
   * 🤖 AUTONOMOUS RULES PARSER
   */
  async parseAutonomousRules() {
    // Temel kuralları hardcode olarak ekle (markdown parse etmek yerine)

    // Zorunlu davranışlar
    this.rules.autonomous.set('local_processing_priority', {
      description: 'Görevlerin %97\'sini API çağrısı yapmadan yerel olarak işle',
      priority: 'critical',
      action: 'prefer_local'
    });

    this.rules.autonomous.set('smart_caching', {
      description: 'Sık kullanılan sonuçları localStorage\'da sakla',
      priority: 'high',
      action: 'cache_results'
    });

    this.rules.autonomous.set('batch_processing', {
      description: 'Birden fazla isteği tek API çağrısında birleştir',
      priority: 'high',
      action: 'batch_requests'
    });

    this.rules.autonomous.set('auto_decision_making', {
      description: 'Basit kararları kullanıcı onayı beklemeden al',
      priority: 'high',
      action: 'auto_decide'
    });

    // Yasaklı davranışlar
    this.rules.forbidden.set('continuous_approval_requests', {
      description: 'Basit görevler için kullanıcıdan onay bekleme',
      severity: 'critical',
      action: 'block'
    });

    this.rules.forbidden.set('unnecessary_api_calls', {
      description: 'Yerel olarak çözülebilecek işlemler için API kullanma',
      severity: 'critical',
      action: 'block'
    });

    this.rules.forbidden.set('memory_neglect', {
      description: 'Proje hafızasını güncellemeyi unutma',
      severity: 'high',
      action: 'warn'
    });

    // Yerel görevler
    this.rules.localTasks.add('file_operations');
    this.rules.localTasks.add('syntax_checking');
    this.rules.localTasks.add('text_processing');
    this.rules.localTasks.add('path_resolution');
    this.rules.localTasks.add('config_parsing');
    this.rules.localTasks.add('log_analysis');
    this.rules.localTasks.add('calculations');

    // Önbelleğe alınabilir görevler
    this.rules.cacheableTasks.add('code_analysis');
    this.rules.cacheableTasks.add('project_structure');
    this.rules.cacheableTasks.add('error_solutions');
    this.rules.cacheableTasks.add('optimization_suggestions');

    // API gerektiren görevler
    this.rules.apiTasks.add('complex_refactoring');
    this.rules.apiTasks.add('new_feature_design');
    this.rules.apiTasks.add('security_analysis');
    this.rules.apiTasks.add('performance_optimization');
  }

  /**
   * 🔍 KURAL KONTROLÜ
   */
  checkRule(category, action, context = {}) {
    // Yasaklı davranış kontrolü
    const forbiddenRule = this.rules.forbidden.get(action);
    if (forbiddenRule) {
      return {
        allowed: false,
        severity: forbiddenRule.severity,
        reason: forbiddenRule.description,
        action: forbiddenRule.action
      };
    }

    // Otonom davranış kontrolü
    const autonomousRule = this.rules.autonomous.get(action);
    if (autonomousRule) {
      return {
        allowed: true,
        priority: autonomousRule.priority,
        description: autonomousRule.description,
        action: autonomousRule.action
      };
    }

    // Görev tipi kontrolü
    if (this.rules.localTasks.has(category)) {
      return {
        allowed: true,
        processing: 'local',
        reason: 'Task can be processed locally'
      };
    }

    if (this.rules.cacheableTasks.has(category)) {
      return {
        allowed: true,
        processing: 'cacheable',
        reason: 'Task results can be cached'
      };
    }

    if (this.rules.apiTasks.has(category)) {
      return {
        allowed: true,
        processing: 'api',
        reason: 'Task requires API processing'
      };
    }

    // Varsayılan: izin ver ama uyar
    return {
      allowed: true,
      processing: 'unknown',
      reason: 'No specific rule found, proceeding with caution'
    };
  }

  /**
   * 📊 KURAL İSTATİSTİKLERİ
   */
  getRuleStats() {
    return {
      autonomous: this.rules.autonomous.size,
      forbidden: this.rules.forbidden.size,
      localTasks: this.rules.localTasks.size,
      cacheableTasks: this.rules.cacheableTasks.size,
      apiTasks: this.rules.apiTasks.size,
      totalRules: this.rules.autonomous.size + this.rules.forbidden.size
    };
  }

  /**
   * 🎯 API TASARRUF KONTROLÜ
   */
  shouldUseAPI(taskType, context = {}) {
    const rule = this.checkRule(taskType, 'process', context);

    // Yerel işleme önceliği
    if (rule.processing === 'local') {
      return {
        useAPI: false,
        reason: 'Task can be processed locally',
        savingsContribution: 'high'
      };
    }

    // Önbellek kontrolü
    if (rule.processing === 'cacheable') {
      return {
        useAPI: false,
        reason: 'Task result may be cached',
        savingsContribution: 'medium',
        checkCache: true
      };
    }

    // API gerekli
    if (rule.processing === 'api') {
      return {
        useAPI: true,
        reason: 'Task requires API processing',
        savingsContribution: 'none'
      };
    }

    // Varsayılan: yerel işleme dene
    return {
      useAPI: false,
      reason: 'Default to local processing for 97% savings target',
      savingsContribution: 'medium'
    };
  }
}

// Global instance
export const steeringParser = new SteeringRulesParser();

// Browser global access
if (typeof window !== 'undefined') {
  window.steeringParser = steeringParser;
}

export default SteeringRulesParser;