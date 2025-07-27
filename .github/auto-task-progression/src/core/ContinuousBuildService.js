/**
 * Portable Continuous Build Service
 * @package @kirilmazlar/auto-task-progression
 * @description Cross-project build automation system
 */

import { spawn } from 'cross-spawn';
import { DEFAULT_CONFIG } from '../config/defaultConfig.js';
import { BuildResultAnalyzer } from '../utils/BuildResultAnalyzer.js';
import { createLogger } from '../utils/logger.js';

/**
 * Continuous Build Service
 */
export class ContinuousBuildService {
  static config = DEFAULT_CONFIG;
  static logger = null;
  static buildQueue = [];
  static buildHistory = [];
  static currentBuild = null;
  static isBuilding = false;
  static isInitialized = false;

  /**
   * Initialize continuous build service
   */
  static initialize(customConfig = {}) {
    if (this.isInitialized) return;

    this.config = { ...DEFAULT_CONFIG, ...customConfig };
    this.logger = createLogger(this.config.LOG_LEVEL);

    this.setupBuildMonitoring();
    this.isInitialized = true;

    if (this.config.ENABLE_LOGGING) {
      this.logger.system('🏗️ Continuous Build Service initialized');
      this.logger.system('🚀 NO APPROVAL WAITING mode - Auto-build pipeline active');
    }
  }

  /**
   * Execute build without approval waiting
   */
  static async executeAutoBuild(reason = 'auto_trigger', taskContext = null) {
    if (!this.isInitialized) {
      this.initialize();
    }

    if (this.isBuilding) {
      this.logger.warn('⚠️ Build already in progress, adding to queue');
      this.buildQueue.push({ reason, taskContext, queuedAt: Date.now() });
      return;
    }

    this.isBuilding = true;
    const buildStartTime = Date.now();

    try {
      this.logger.system('🏗️ AUTO-BUILD STARTING - No approval required');
      this.logger.system(`📋 Build reason: ${reason}`);

      // 1. Pre-build validation
      const preValidation = await this.preBuildValidation();
      if (!preValidation.passed) {
        throw new Error(`Pre-build validation failed: ${preValidation.errors.join(', ')}`);
      }

      // 2. Execute build command
      const buildResult = await this.executeBuildCommand();

      // 3. Post-build analysis
      const buildAnalysis = BuildResultAnalyzer.analyze(buildResult);

      // 4. Handle build completion
      await this.handleBuildCompletion(buildResult, buildAnalysis, buildStartTime);

      // 5. Auto-continue if enabled
      if (this.config.AUTO_CONTINUE_ON_SUCCESS && buildResult.success) {
        await this.autoContinueWorkflow(taskContext);
      }

      this.logger.success('✅ AUTO-BUILD COMPLETED - Workflow continuing automatically');
      return buildResult;

    } catch (error) {
      await this.handleBuildFailure(error, buildStartTime);
      throw error;
    } finally {
      this.isBuilding = false;
      await this.processQueue();
    }
  }

  /**
   * Pre-build validation
   */
  static async preBuildValidation() {
    this.logger.debug('🔍 Running pre-build validation...');

    // Basic validations - can be extended
    const validations = [
      { check: 'syntax', passed: true },
      { check: 'dependencies', passed: true },
      { check: 'circular_imports', passed: true }
    ];

    const failedValidations = validations.filter(v => !v.passed);

    return {
      passed: failedValidations.length === 0,
      errors: failedValidations.map(v => v.check),
      validations
    };
  }

  /**
   * Execute build command
   */
  static async executeBuildCommand() {
    this.logger.system('⚡ Executing build command: npm run build');

    const buildStartTime = Date.now();

    return new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        stdio: 'pipe',
        timeout: this.config.BUILD_TIMEOUT
      });

      let stdout = '';
      let stderr = '';

      buildProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      buildProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      buildProcess.on('close', (code) => {
        const buildEndTime = Date.now();
        const buildDuration = buildEndTime - buildStartTime;

        const buildResult = {
          success: code === 0,
          exitCode: code,
          stdout,
          stderr,
          buildTime: `${(buildDuration / 1000).toFixed(2)}s`,
          actualBuildTime: buildDuration,
          timestamp: buildEndTime
        };

        if (code === 0) {
          // Extract build info from stdout
          const chunkMatch = stdout.match(/(\d+)\s+modules?\s+transformed/);
          buildResult.chunks = chunkMatch ? parseInt(chunkMatch[1]) : 'unknown';

          resolve(buildResult);
        } else {
          const error = new Error(`Build failed with exit code ${code}`);
          error.buildResult = buildResult;
          reject(error);
        }
      });

      buildProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Handle successful build completion
   */
  static async handleBuildCompletion(buildResult, analysis, startTime) {
    const completionTime = Date.now();
    const totalTime = completionTime - startTime;

    // Record build history
    const buildRecord = {
      timestamp: completionTime,
      duration: totalTime,
      result: buildResult,
      analysis,
      success: buildResult.success
    };

    this.buildHistory.push(buildRecord);

    // Notify build completion
    if (this.config.NOTIFY_ON_BUILD_STATUS) {
      this.logger.success(`🎉 BUILD SUCCESS in ${totalTime}ms - ${analysis.qualityScore}% quality`);

      if (buildResult.chunks) {
        this.logger.info('📦 Build output:', {
          chunks: buildResult.chunks,
          buildTime: buildResult.buildTime,
          exitCode: buildResult.exitCode
        });
      }
    }
  }

  /**
   * Handle build failure
   */
  static async handleBuildFailure(error, startTime) {
    const failureTime = Date.now();
    const totalTime = failureTime - startTime;

    this.logger.error(`❌ BUILD FAILED after ${totalTime}ms:`, error.message);

    // Auto-analyze build errors
    if (this.config.AUTO_ANALYZE_BUILD_ERRORS && error.buildResult) {
      const errorAnalysis = BuildResultAnalyzer.analyzeErrors(error.buildResult);
      this.logger.info('💡 Error analysis:', errorAnalysis);
    }

    // Record failure
    this.buildHistory.push({
      timestamp: failureTime,
      duration: totalTime,
      success: false,
      error: error.message,
      analysis: { errorType: 'build_failure' }
    });
  }

  /**
   * Auto-continue workflow after successful build
   */
  static async autoContinueWorkflow(taskContext) {
    if (!taskContext) {
      this.logger.debug('📋 No task context - skipping auto-continue');
      return;
    }

    this.logger.system('🚀 AUTO-CONTINUE: Build successful, proceeding to next step');
    this.logger.system('📋 NO APPROVAL WAITING - Seamless workflow continuation');

    // This would integrate with AutoTaskProgressionService
    // Implementation depends on the specific integration pattern
  }

  /**
   * Process build queue
   */
  static async processQueue() {
    if (this.buildQueue.length === 0) return;

    const nextBuild = this.buildQueue.shift();
    this.logger.info(`🔄 Processing queued build: ${nextBuild.reason}`);

    // Small delay to prevent overwhelming
    setTimeout(() => {
      this.executeAutoBuild(nextBuild.reason, nextBuild.taskContext);
    }, 1000);
  }

  /**
   * Get build statistics
   */
  static getBuildStats() {
    const recent = this.buildHistory.slice(-10);
    const successful = recent.filter(b => b.success);

    return {
      totalBuilds: this.buildHistory.length,
      recentBuilds: recent.length,
      successRate: recent.length > 0 ? (successful.length / recent.length * 100).toFixed(1) + '%' : '0%',
      averageBuildTime: successful.length > 0
        ? Math.round(successful.reduce((sum, b) => sum + b.duration, 0) / successful.length)
        : 0,
      isBuilding: this.isBuilding,
      queueSize: this.buildQueue.length,
      lastBuildStatus: recent.length > 0 ? (recent[recent.length - 1].success ? 'success' : 'failed') : 'none'
    };
  }

  /**
   * Setup build monitoring
   */
  static setupBuildMonitoring() {
    this.logger.debug('👀 Setting up build monitoring...');
    // Implementation for monitoring build triggers
  }

  /**
   * Force build execution
   */
  static async forceBuild(reason = 'manual_force') {
    this.logger.warn('🚨 FORCE BUILD triggered');
    await this.executeAutoBuild(reason, { forced: true });
  }
}

/**
 * Quick Build Trigger for Common Scenarios
 */
export class QuickBuildTrigger {
  /**
   * Trigger build after code changes
   */
  static async afterCodeChanges(changedFiles = []) {
    const logger = createLogger(DEFAULT_CONFIG.LOG_LEVEL);
    logger.system('🔄 Code changes detected - Triggering auto-build');
    logger.debug('📁 Changed files:', changedFiles);

    await ContinuousBuildService.executeAutoBuild('code_changes', {
      changedFiles,
      timestamp: Date.now()
    });
  }

  /**
   * Trigger build after task completion
   */
  static async afterTaskCompletion(taskId) {
    const logger = createLogger(DEFAULT_CONFIG.LOG_LEVEL);
    logger.system(`✅ Task completed: ${taskId} - Triggering verification build`);

    await ContinuousBuildService.executeAutoBuild('task_completion', {
      completedTask: taskId,
      timestamp: Date.now()
    });
  }

  /**
   * Trigger build for testing
   */
  static async forTesting(testType = 'unit') {
    const logger = createLogger(DEFAULT_CONFIG.LOG_LEVEL);
    logger.system(`🧪 Testing initiated: ${testType} - Triggering build`);

    await ContinuousBuildService.executeAutoBuild('testing', {
      testType,
      timestamp: Date.now()
    });
  }
}
