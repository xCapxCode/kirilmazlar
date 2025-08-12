/**
 * 🏗️ CONTINUOUS BUILD SERVICE - Sürekli Build Sistemi
 * Otonom sistem için optimize edilmiş build yönetimi
 */

import { logger } from './Logger.js';

export class ContinuousBuildService {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.buildCommand = options.buildCommand || 'npm run build';
    this.devCommand = options.devCommand || 'npm run dev';
    this.testCommand = options.testCommand || 'npm test';
    this.lintCommand = options.lintCommand || 'npm run lint';
    
    this.buildInterval = options.buildInterval || 300000; // 5 minutes
    this.autoWatch = options.autoWatch !== false;
    this.enableOptimization = options.enableOptimization !== false;
    
    this.buildHistory = [];
    this.isBuilding = false;
    this.lastBuildTime = null;
    this.buildStats = {
      total: 0,
      successful: 0,
      failed: 0,
      avgDuration: 0
    };
    
    this.watchers = new Map();
    this.buildQueue = [];
    
    this.initializeService();
  }

  async initializeService() {
    logger.info('🏗️ Initializing Continuous Build Service');
    
    // Load build history from storage
    this.loadBuildHistory();
    
    // Setup file watchers if enabled
    if (this.autoWatch) {
      await this.setupFileWatchers();
    }
    
    // Start periodic health checks
    this.startHealthChecks();
    
    logger.info('✅ Continuous Build Service initialized');
  }

  async setupFileWatchers() {
    try {
      // Watch for file changes in key directories
      const watchPaths = [
        'src',
        'components',
        'pages',
        'styles',
        'public',
        'package.json',
        'vite.config.js',
        'tailwind.config.js'
      ];
      
      for (const path of watchPaths) {
        await this.watchPath(path);
      }
      
      logger.info(`👀 Watching ${this.watchers.size} paths for changes`);
    } catch (error) {
      logger.error('Failed to setup file watchers:', error);
    }
  }

  async watchPath(path) {
    try {
      // Simulated file watcher (in real implementation, use fs.watch or chokidar)
      const watcherId = `watcher_${path}`;
      this.watchers.set(watcherId, {
        path,
        active: true,
        lastChange: Date.now()
      });
      
      logger.debug(`👀 Watching: ${path}`);
    } catch (error) {
      logger.warn(`Failed to watch path ${path}:`, error);
    }
  }

  async triggerBuild(options = {}) {
    if (this.isBuilding && !options.force) {
      logger.warn('🏗️ Build already in progress, queuing request');
      return this.queueBuild(options);
    }
    
    const buildId = `build_${Date.now()}`;
    const startTime = Date.now();
    
    try {
      this.isBuilding = true;
      logger.info(`🏗️ Starting build: ${buildId}`);
      
      // Pre-build checks
      const preCheckResult = await this.runPreBuildChecks();
      if (!preCheckResult.success) {
        throw new Error(`Pre-build checks failed: ${preCheckResult.error}`);
      }
      
      // Run the actual build
      const buildResult = await this.executeBuild(options);
      
      // Post-build validation
      const postCheckResult = await this.runPostBuildChecks();
      
      const duration = Date.now() - startTime;
      const success = buildResult.success && postCheckResult.success;
      
      // Record build result
      const buildRecord = {
        id: buildId,
        timestamp: new Date().toISOString(),
        duration,
        success,
        command: options.command || this.buildCommand,
        output: buildResult.output,
        error: buildResult.error || postCheckResult.error,
        stats: buildResult.stats
      };
      
      this.recordBuild(buildRecord);
      
      if (success) {
        logger.info(`✅ Build completed successfully: ${buildId} (${duration}ms)`);
        this.onBuildSuccess(buildRecord);
      } else {
        logger.error(`❌ Build failed: ${buildId} (${duration}ms)`);
        this.onBuildFailure(buildRecord);
      }
      
      return buildRecord;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`💥 Build error: ${buildId}`, error);
      
      const buildRecord = {
        id: buildId,
        timestamp: new Date().toISOString(),
        duration,
        success: false,
        command: options.command || this.buildCommand,
        error: error.message,
        output: null
      };
      
      this.recordBuild(buildRecord);
      this.onBuildFailure(buildRecord);
      
      return buildRecord;
      
    } finally {
      this.isBuilding = false;
      this.lastBuildTime = Date.now();
      
      // Process queued builds
      if (this.buildQueue.length > 0) {
        const nextBuild = this.buildQueue.shift();
        setTimeout(() => this.triggerBuild(nextBuild), 1000);
      }
    }
  }

  async executeBuild(options = {}) {
    const command = options.command || this.buildCommand;
    const startTime = Date.now();
    
    try {
      // Simulated build execution
      logger.info(`⚙️ Executing: ${command}`);
      
      // In real implementation, use child_process.exec or spawn
      await this.simulateBuildProcess(command);
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        output: `Build completed successfully in ${duration}ms`,
        duration,
        stats: {
          filesProcessed: Math.floor(Math.random() * 100) + 50,
          bundleSize: Math.floor(Math.random() * 1000) + 500,
          warnings: Math.floor(Math.random() * 5)
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  async simulateBuildProcess(command) {
    // Simulate build time based on command type
    let buildTime = 2000; // Default 2 seconds
    
    if (command.includes('dev')) {
      buildTime = 1000; // Dev builds are faster
    } else if (command.includes('test')) {
      buildTime = 3000; // Tests take longer
    } else if (command.includes('lint')) {
      buildTime = 500; // Linting is quick
    }
    
    // Add some randomness
    buildTime += Math.random() * 1000;
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate occasional failures (5% chance)
        if (Math.random() < 0.05) {
          reject(new Error('Simulated build failure'));
        } else {
          resolve();
        }
      }, buildTime);
    });
  }

  async runPreBuildChecks() {
    try {
      logger.debug('🔍 Running pre-build checks');
      
      // Check if package.json exists
      // Check if node_modules exists
      // Check for syntax errors
      // Validate configuration files
      
      // Simulated checks
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async runPostBuildChecks() {
    try {
      logger.debug('🔍 Running post-build checks');
      
      // Check if build output exists
      // Validate bundle integrity
      // Check for critical warnings
      // Verify asset generation
      
      // Simulated checks
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  queueBuild(options) {
    const queueId = `queue_${Date.now()}`;
    this.buildQueue.push({ ...options, queueId });
    
    logger.info(`📋 Build queued: ${queueId} (queue length: ${this.buildQueue.length})`);
    
    return { queued: true, queueId };
  }

  recordBuild(buildRecord) {
    this.buildHistory.push(buildRecord);
    
    // Update statistics
    this.buildStats.total++;
    if (buildRecord.success) {
      this.buildStats.successful++;
    } else {
      this.buildStats.failed++;
    }
    
    // Calculate average duration
    const totalDuration = this.buildHistory.reduce((sum, build) => sum + build.duration, 0);
    this.buildStats.avgDuration = Math.round(totalDuration / this.buildHistory.length);
    
    // Keep only recent builds (last 100)
    if (this.buildHistory.length > 100) {
      this.buildHistory = this.buildHistory.slice(-100);
    }
    
    // Save to storage
    this.saveBuildHistory();
    
    logger.debug(`📊 Build recorded: ${buildRecord.id}`);
  }

  onBuildSuccess(buildRecord) {
    // Trigger success hooks
    logger.logSystemEvent('build_success', {
      buildId: buildRecord.id,
      duration: buildRecord.duration,
      stats: buildRecord.stats
    });
    
    // Update project memory
    this.updateProjectMemory('last_successful_build', buildRecord);
  }

  onBuildFailure(buildRecord) {
    // Trigger failure hooks
    logger.logSystemEvent('build_failure', {
      buildId: buildRecord.id,
      duration: buildRecord.duration,
      error: buildRecord.error
    });
    
    // Auto-retry logic for transient failures
    if (this.shouldRetryBuild(buildRecord)) {
      logger.info('🔄 Scheduling build retry');
      setTimeout(() => {
        this.triggerBuild({ retry: true, originalBuildId: buildRecord.id });
      }, 5000);
    }
  }

  shouldRetryBuild(buildRecord) {
    // Don't retry if it's already a retry
    if (buildRecord.retry) return false;
    
    // Don't retry syntax errors
    if (buildRecord.error && buildRecord.error.includes('syntax')) return false;
    
    // Retry network or temporary failures
    const retryableErrors = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];
    return retryableErrors.some(error => 
      buildRecord.error && buildRecord.error.includes(error)
    );
  }

  // Development server management
  async startDevServer(options = {}) {
    try {
      logger.info('🚀 Starting development server');
      
      const command = options.command || this.devCommand;
      
      // In real implementation, spawn dev server process
      const devProcess = await this.simulateDevServer(command);
      
      logger.info('✅ Development server started');
      return devProcess;
      
    } catch (error) {
      logger.error('Failed to start development server:', error);
      throw error;
    }
  }

  async simulateDevServer(command) {
    // Simulate dev server startup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      pid: Math.floor(Math.random() * 10000),
      port: 3000,
      url: 'http://localhost:3000',
      status: 'running'
    };
  }

  async stopDevServer() {
    logger.info('🛑 Stopping development server');
    // Implementation for stopping dev server
  }

  // Testing integration
  async runTests(options = {}) {
    try {
      logger.info('🧪 Running tests');
      
      const command = options.command || this.testCommand;
      const result = await this.executeBuild({ command });
      
      logger.info(`🧪 Tests ${result.success ? 'passed' : 'failed'}`);
      return result;
      
    } catch (error) {
      logger.error('Test execution failed:', error);
      throw error;
    }
  }

  async runLinting(options = {}) {
    try {
      logger.info('🔍 Running linting');
      
      const command = options.command || this.lintCommand;
      const result = await this.executeBuild({ command });
      
      logger.info(`🔍 Linting ${result.success ? 'passed' : 'failed'}`);
      return result;
      
    } catch (error) {
      logger.error('Linting failed:', error);
      throw error;
    }
  }

  // Health monitoring
  startHealthChecks() {
    setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Every minute
  }

  performHealthCheck() {
    const health = {
      timestamp: new Date().toISOString(),
      isBuilding: this.isBuilding,
      queueLength: this.buildQueue.length,
      lastBuildTime: this.lastBuildTime,
      watchersActive: this.watchers.size,
      buildStats: { ...this.buildStats }
    };
    
    logger.debug('💓 Health check:', health);
    
    // Check for issues
    if (this.buildQueue.length > 10) {
      logger.warn('⚠️ Build queue is getting long');
    }
    
    if (this.lastBuildTime && Date.now() - this.lastBuildTime > 3600000) {
      logger.warn('⚠️ No builds in the last hour');
    }
    
    return health;
  }

  // Storage methods
  saveBuildHistory() {
    try {
      const data = {
        history: this.buildHistory.slice(-50), // Save last 50 builds
        stats: this.buildStats,
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem('trae_build_history', JSON.stringify(data));
    } catch (error) {
      logger.error('Failed to save build history:', error);
    }
  }

  loadBuildHistory() {
    try {
      const saved = localStorage.getItem('trae_build_history');
      if (saved) {
        const data = JSON.parse(saved);
        this.buildHistory = data.history || [];
        this.buildStats = data.stats || this.buildStats;
        
        logger.debug(`📚 Loaded ${this.buildHistory.length} build records`);
      }
    } catch (error) {
      logger.error('Failed to load build history:', error);
    }
  }

  updateProjectMemory(key, value) {
    try {
      const memory = JSON.parse(localStorage.getItem('trae_project_memory') || '{}');
      memory[key] = value;
      localStorage.setItem('trae_project_memory', JSON.stringify(memory));
    } catch (error) {
      logger.error('Failed to update project memory:', error);
    }
  }

  // Query methods
  getBuildHistory(options = {}) {
    let history = [...this.buildHistory];
    
    if (options.successful !== undefined) {
      history = history.filter(build => build.success === options.successful);
    }
    
    if (options.since) {
      const sinceTime = new Date(options.since).getTime();
      history = history.filter(build => 
        new Date(build.timestamp).getTime() >= sinceTime
      );
    }
    
    if (options.limit) {
      history = history.slice(-options.limit);
    }
    
    return history;
  }

  getBuildStats() {
    return {
      ...this.buildStats,
      successRate: this.buildStats.total > 0 
        ? (this.buildStats.successful / this.buildStats.total * 100).toFixed(2) + '%'
        : '0%',
      recentBuilds: this.buildHistory.slice(-10)
    };
  }

  getSystemStatus() {
    return {
      isBuilding: this.isBuilding,
      queueLength: this.buildQueue.length,
      lastBuildTime: this.lastBuildTime,
      watchersActive: this.watchers.size,
      buildStats: this.getBuildStats(),
      health: this.performHealthCheck()
    };
  }

  // Cleanup methods
  clearBuildHistory() {
    this.buildHistory = [];
    this.buildStats = {
      total: 0,
      successful: 0,
      failed: 0,
      avgDuration: 0
    };
    
    localStorage.removeItem('trae_build_history');
    logger.info('🧹 Build history cleared');
  }

  stopWatchers() {
    this.watchers.clear();
    logger.info('👀 File watchers stopped');
  }

  shutdown() {
    this.stopWatchers();
    this.buildQueue = [];
    this.saveBuildHistory();
    
    logger.info('🛑 Continuous Build Service shutdown');
  }
}

// Export default instance
export const continuousBuildService = new ContinuousBuildService();

export default ContinuousBuildService;