#!/usr/bin/env node

/**
 * 🚀 KIRO AUTONOMOUS SYSTEM - Setup Script
 * Universal installer for any project/IDE
 */

const fs = require('fs');
const path = require('path');

class KiroSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.kiroPath = path.join(this.projectRoot, '.kiro');
    this.packageJsonPath = path.join(this.projectRoot, 'package.json');
  }

  async setup() {
    console.log('🚀 Setting up Kiro Autonomous System...\n');

    try {
      // 1. Verify .kiro folder exists
      await this.verifyKiroFolder();

      // 2. Check environment compatibility
      await this.checkEnvironment();

      // 3. Setup package.json scripts (if exists)
      await this.setupPackageScripts();

      // 4. Create environment config
      await this.createEnvironmentConfig();

      // 5. Run initial validation
      await this.runValidation();

      console.log('\n✅ Kiro Autonomous System setup completed!');
      console.log('\n📊 Usage:');
      console.log('   import { KiroAPI } from "./.kiro/index.js";');
      console.log('   await KiroAPI.processTask("text_format", { text: "hello", format: "uppercase" });');
      console.log('\n🎯 Target: 97% API savings through autonomous processing');

    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  async verifyKiroFolder() {
    console.log('📁 Verifying .kiro folder structure...');

    const requiredFiles = [
      'index.js',
      'README.md',
      'core/autonomous-system.js',
      'core/api-optimization-engine.js',
      'core/local-decision-engine.js',
      'steering/autonomous-rules.md',
      'steering/project-memory.md',
      'steering/task-management.md'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.kiroPath, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing required file: .kiro/${file}`);
      }
    }

    console.log('✅ All required files present');
  }

  async checkEnvironment() {
    console.log('🔍 Checking environment compatibility...');

    const checks = {
      'Node.js': process.version,
      'ES6 Modules': this.checkES6Support(),
      'localStorage': this.checkLocalStorageSupport(),
      'File System': fs.existsSync(this.projectRoot) ? 'Available' : 'Not Available'
    };

    console.log('Environment Check Results:');
    for (const [check, result] of Object.entries(checks)) {
      console.log(`   ${check}: ${result}`);
    }

    // Warnings
    if (!this.checkES6Support()) {
      console.warn('⚠️  ES6 modules not fully supported. Consider updating Node.js or using a bundler.');
    }
  }

  checkES6Support() {
    try {
      // Check if ES6 import/export is supported
      const nodeVersion = process.version.slice(1).split('.').map(Number);
      return nodeVersion[0] >= 14; // Node 14+ has good ES6 support
    } catch {
      return false;
    }
  }

  checkLocalStorageSupport() {
    // In Node.js, we use polyfill
    return typeof window !== 'undefined' ? 'Native' : 'Polyfill (Node.js)';
  }

  async setupPackageScripts() {
    console.log('📦 Setting up package.json scripts...');

    if (!fs.existsSync(this.packageJsonPath)) {
      console.log('   No package.json found, skipping script setup');
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));

      // Add Kiro scripts
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      const kiroScripts = {
        'kiro:start': 'node .kiro/index.js',
        'kiro:test': 'node -e "import(\'./.kiro/index.js\').then(k => k.KiroAPI.showDashboard())"',
        'kiro:dashboard': 'node -e "import(\'./.kiro/index.js\').then(k => k.KiroAPI.showDashboard())"',
        'kiro:maintenance': 'node -e "import(\'./.kiro/index.js\').then(k => k.KiroAPI.system.performMaintenance())"'
      };

      let scriptsAdded = 0;
      for (const [script, command] of Object.entries(kiroScripts)) {
        if (!packageJson.scripts[script]) {
          packageJson.scripts[script] = command;
          scriptsAdded++;
        }
      }

      if (scriptsAdded > 0) {
        fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(`✅ Added ${scriptsAdded} Kiro scripts to package.json`);
      } else {
        console.log('   Kiro scripts already exist');
      }

    } catch (error) {
      console.warn(`⚠️  Could not update package.json: ${error.message}`);
    }
  }

  async createEnvironmentConfig() {
    console.log('⚙️  Creating environment configuration...');

    const envConfigPath = path.join(this.kiroPath, 'config.json');

    if (fs.existsSync(envConfigPath)) {
      console.log('   Configuration already exists');
      return;
    }

    const defaultConfig = {
      version: '1.0.0',
      target: {
        apiSavings: 97,
        automationRate: 95,
        responseTime: 100,
        cacheHitRate: 90
      },
      cache: {
        ttl: 300000,
        maxSize: 1000,
        cleanupInterval: 600000
      },
      batch: {
        timeout: 2000,
        maxSize: 10
      },
      decisions: {
        confidenceThreshold: 0.8,
        patternMatchThreshold: 0.7
      },
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        setupDate: new Date().toISOString()
      }
    };

    fs.writeFileSync(envConfigPath, JSON.stringify(defaultConfig, null, 2));
    console.log('✅ Configuration file created');
  }

  async runValidation() {
    console.log('🧪 Running system validation...');

    try {
      // Dynamic import for ES6 modules
      const { KiroAPI } = await import(path.join(this.kiroPath, 'index.js'));

      // Wait for system initialization
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Run basic tests
      const tests = [
        {
          name: 'Text Processing',
          test: () => KiroAPI.processTask('text_format', { text: 'test', format: 'uppercase' })
        },
        {
          name: 'Path Resolution',
          test: () => KiroAPI.processTask('path_resolve', { basePath: '/test', relativePath: 'file.js' })
        },
        {
          name: 'Decision Making',
          test: () => KiroAPI.makeDecision('file_operation', 'canDelete', { filePath: 'temp/test.log', dependencies: [] })
        }
      ];

      let passed = 0;
      for (const test of tests) {
        try {
          const result = await test.test();
          if (result.success !== false) {
            console.log(`   ✅ ${test.name}: PASSED`);
            passed++;
          } else {
            console.log(`   ❌ ${test.name}: FAILED`);
          }
        } catch (error) {
          console.log(`   ❌ ${test.name}: ERROR - ${error.message}`);
        }
      }

      const successRate = (passed / tests.length * 100).toFixed(1);
      console.log(`\n🎯 Validation Results: ${passed}/${tests.length} tests passed (${successRate}%)`);

      if (passed === tests.length) {
        console.log('✅ All validation tests passed - System ready!');
      } else {
        console.warn('⚠️  Some tests failed - System may have limited functionality');
      }

    } catch (error) {
      console.error(`❌ Validation failed: ${error.message}`);
      console.log('   System may still work, but validation could not complete');
    }
  }
}

// CLI Usage
if (require.main === module) {
  const setup = new KiroSetup();
  setup.setup().catch(console.error);
}

module.exports = KiroSetup;