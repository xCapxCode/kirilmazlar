/**
 * 🚀 KIRO AUTONOMOUS SYSTEM - Main Entry Point
 * %97 API tasarrufu hedefli tam otonom sistem
 */

import { apiOptimizer } from './core/api-optimization-engine.js';
import { kiroSystem } from './core/autonomous-system.js';
import { decisionEngine } from './core/local-decision-engine.js';
import { memoryManager } from './core/memory-manager.js';
import { steeringParser } from './core/steering-parser.js';

// Ana sistem başlatma
async function initializeKiroSystem() {
  try {
    console.log('🚀 Starting Kiro Autonomous System...');

    // Sistem zaten constructor'da başlatılıyor
    await kiroSystem.initialize();

    // Test görevleri ile sistemi doğrula
    await runSystemValidation();

    console.log('✅ Kiro Autonomous System ready - Target: 97% API savings');

    return kiroSystem;

  } catch (error) {
    console.error('❌ Failed to initialize Kiro System:', error);
    throw error;
  }
}

// Sistem doğrulama testleri
async function runSystemValidation() {
  console.log('🧪 Running system validation tests...');

  const tests = [
    // Test 1: Yerel metin işleme
    {
      name: 'Local Text Processing',
      task: () => kiroSystem.processTask('text_format', { text: 'hello world', format: 'uppercase' })
    },

    // Test 2: Dosya yolu çözümleme
    {
      name: 'Path Resolution',
      task: () => kiroSystem.processTask('path_resolve', { basePath: '/src', relativePath: 'components/App.jsx' })
    },

    // Test 3: JSON validasyonu
    {
      name: 'JSON Validation',
      task: () => kiroSystem.processTask('json_validate', { jsonString: '{"test": true}' })
    },

    // Test 4: Karar alma
    {
      name: 'Decision Making',
      task: () => kiroSystem.makeDecision('file_operation', 'canDelete', { filePath: 'temp/cache.log', dependencies: [] })
    }
  ];

  let passedTests = 0;

  for (const test of tests) {
    try {
      const result = await test.task();

      if (result.success !== false) {
        console.log(`✅ ${test.name}: PASSED`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }

  const successRate = (passedTests / tests.length * 100).toFixed(1);
  console.log(`🎯 Validation Results: ${passedTests}/${tests.length} tests passed (${successRate}%)`);

  if (passedTests === tests.length) {
    console.log('✅ All validation tests passed - System ready for autonomous operation');
  } else {
    console.warn('⚠️ Some validation tests failed - System may have limited functionality');
  }
}

// Performans dashboard
function showPerformanceDashboard() {
  const metrics = kiroSystem.getSystemMetrics();

  console.log('\n📊 KIRO AUTONOMOUS SYSTEM DASHBOARD');
  console.log('=====================================');
  console.log(`🎯 API Savings: ${metrics.targetPerformance.currentSavings} (Target: ${metrics.targetPerformance.apiSavingsTarget})`);
  console.log(`🤖 Automation Rate: ${metrics.targetPerformance.currentAutomation} (Target: ${metrics.targetPerformance.automationTarget})`);
  console.log(`📋 Total Tasks: ${metrics.system.totalTasks}`);
  console.log(`⚡ Automated Tasks: ${metrics.system.automatedTasks}`);
  console.log(`💾 Cache Hit Rate: ${metrics.apiOptimizer.cacheHitRate}`);
  console.log(`🧠 Decision Automation: ${metrics.decisionEngine.automationRate}`);
  console.log(`⏱️ Runtime: ${(metrics.system.runtime / 1000).toFixed(1)}s`);
  console.log('=====================================\n');

  // Hedef performans kontrolü
  const performance = kiroSystem.checkTargetPerformance();

  if (performance.overall === 'SUCCESS') {
    console.log('🎉 TARGET ACHIEVED: 97% API savings goal met!');
  } else {
    console.log('⚠️ TARGET NOT MET - Recommendations:');
    performance.recommendations.forEach(rec => console.log(`   • ${rec}`));
  }
}

// Otomatik performans raporlama
function startAutomaticReporting() {
  // Her 2 dakikada bir dashboard göster
  setInterval(() => {
    const metrics = kiroSystem.getSystemMetrics();

    if (metrics.system.totalTasks > 0) {
      showPerformanceDashboard();
    }
  }, 120000);
}

// Global API - Dış kullanım için
export const KiroAPI = {
  // Ana sistem
  system: kiroSystem,

  // Bileşenler
  apiOptimizer,
  decisionEngine,
  steeringParser,
  memoryManager,

  // Yardımcı fonksiyonlar
  processTask: (taskType, data, options) => kiroSystem.processTask(taskType, data, options),
  makeDecision: (category, action, context) => kiroSystem.makeDecision(category, action, context),
  getMetrics: () => kiroSystem.getSystemMetrics(),
  showDashboard: showPerformanceDashboard,

  // Sistem yönetimi
  restart: () => kiroSystem.restart(),
  maintenance: () => kiroSystem.performMaintenance(),
  healthCheck: () => kiroSystem.performHealthCheck()
};

// Browser global access
if (typeof window !== 'undefined') {
  window.KiroAPI = KiroAPI;
  window.kiroSystem = kiroSystem;

  // Otomatik başlatma
  initializeKiroSystem().then(() => {
    startAutomaticReporting();

    // 5 saniye sonra ilk dashboard
    setTimeout(showPerformanceDashboard, 5000);
  });
}

// Node.js export
export { apiOptimizer, decisionEngine, kiroSystem, memoryManager, steeringParser };
export default KiroAPI;

// Otomatik başlatma (Node.js)
if (typeof window === 'undefined') {
  initializeKiroSystem().catch(console.error);
}