/**
 * Portable Auto Task Progression Service
 * @package @kirilmazlar/auto-task-progression
 * @description Cross-project compatible task progression system
 */

import { DEFAULT_CONFIG } from '../config/defaultConfig.js';
import { TaskStatusUpdater } from '../utils/TaskStatusUpdater.js';
import { createLogger } from '../utils/logger.js';

/**
 * Portable Auto Task Progression Service
 */
export class AutoTaskProgressionService {
  static config = DEFAULT_CONFIG;
  static logger = null;
  static currentTask = null;
  static taskQueue = [];
  static isProgressing = false;
  static progressionHistory = [];
  static isInitialized = false;

  /**
   * Initialize the service with custom config
   */
  static initialize(customConfig = {}) {
    if (this.isInitialized) return;

    // Merge configuration
    this.config = { ...DEFAULT_CONFIG, ...customConfig };

    // Setup logger
    this.logger = createLogger(this.config.LOG_LEVEL);

    // Load current task status
    this.loadCurrentTaskStatus();

    this.isInitialized = true;

    if (this.config.ENABLE_LOGGING) {
      this.logger.system('🚀 Auto Task Progression Service initialized');
      this.logger.system('📋 NO APPROVAL WAITING mode enabled');
    }
  }

  /**
   * Complete task and auto-progress to next
   */
  static async completeTaskAndProgress(completedTaskId, completionDetails = {}) {
    if (!this.isInitialized) {
      this.initialize();
    }

    if (this.isProgressing) {
      this.logger.warn('⚠️ Task progression already in progress, queuing request');
      return;
    }

    this.isProgressing = true;

    try {
      // 1. Mark current task as completed
      await this.markTaskCompleted(completedTaskId, completionDetails);

      // 2. Log completion
      this.logTaskCompletion(completedTaskId, completionDetails);

      // 3. Identify next task automatically
      const nextTask = await this.identifyNextTask(completedTaskId);

      if (nextTask) {
        // 4. Brief transition delay for system stability
        await this.transitionDelay();

        // 5. Auto-start next task (NO APPROVAL WAITING)
        await this.autoStartNextTask(nextTask);

        this.logger.success(`🎯 Auto-progressed: ${completedTaskId} → ${nextTask.id}`);
      } else {
        this.logger.info('📋 All tasks in current phase completed - awaiting next phase');
      }

    } catch (error) {
      this.logger.error('❌ Auto progression error:', error);
    } finally {
      this.isProgressing = false;
    }
  }

  /**
   * Auto-start next task without approval waiting
   */
  static async autoStartNextTask(nextTask) {
    this.logger.system(`🚀 AUTO-STARTING: ${nextTask.id} - ${nextTask.title}`);
    this.logger.system('📋 NO APPROVAL WAITING - As per instruction protocol');

    // Update task status
    if (this.config.AUTO_UPDATE_TASK_STATUS) {
      await TaskStatusUpdater.updateTaskStatus(
        nextTask.id,
        this.config.STATUS_MARKERS.IN_PROGRESS,
        this.config.TASK_LIST_PATH
      );
    }

    // Set as current task
    this.currentTask = nextTask;

    // Log auto-start
    this.progressionHistory.push({
      timestamp: Date.now(),
      action: 'auto_start',
      taskId: nextTask.id,
      title: nextTask.title
    });

    // Execute task initialization
    await this.executeTaskInitialization(nextTask);

    this.logger.success(`✅ AUTO-STARTED: ${nextTask.title} - Proceeding without approval`);
  }

  /**
   * Execute task initialization based on task type
   */
  static async executeTaskInitialization(task) {
    this.logger.info(`🔧 Initializing task: ${task.id}`);

    switch (task.type) {
      case 'testing':
        await this.initializeTestingTask(task);
        break;
      case 'documentation':
        await this.initializeDocumentationTask(task);
        break;
      case 'security':
        await this.initializeSecurityTask(task);
        break;
      case 'performance':
        await this.initializePerformanceTask(task);
        break;
      default:
        await this.initializeGenericTask(task);
    }
  }

  /**
   * Initialize testing task
   */
  static async initializeTestingTask(task) {
    this.logger.system('🧪 Initializing Testing Task - Unit Tests for Critical Services');

    const testingActions = [
      'Audit critical services that need unit tests',
      'Setup Jest testing framework if not exists',
      'Create test utilities and helpers',
      'Write tests for storage services',
      'Write tests for authentication services',
      'Verify test coverage metrics'
    ];

    task.actionItems = testingActions;
    task.status = 'initialized';

    this.logger.success('✅ Testing task initialized - Ready for execution');
  }

  /**
   * Initialize documentation task
   */
  static async initializeDocumentationTask(task) {
    this.logger.system('📚 Initializing Documentation Task');

    const docActions = [
      'Audit existing documentation gaps',
      'Update API documentation',
      'Create user guide sections',
      'Document new security features',
      'Verify documentation accuracy'
    ];

    task.actionItems = docActions;
    task.status = 'initialized';

    this.logger.success('✅ Documentation task initialized');
  }

  /**
   * Initialize generic task
   */
  static async initializeGenericTask(task) {
    this.logger.system(`🔧 Initializing Generic Task: ${task.title}`);

    task.status = 'initialized';
    task.actionItems = ['Analyze task requirements', 'Execute implementation', 'Verify completion'];

    this.logger.success('✅ Generic task initialized');
  }

  /**
   * Identify next task from task list
   */
  static async identifyNextTask(completedTaskId) {
    // This would analyze the task list and identify the next task
    // For now, return a mock next task based on completed task

    if (completedTaskId === 'P2.4.5') {
      return {
        id: 'P2.5.1',
        title: 'Unit tests for critical services',
        type: 'testing',
        phase: 'P2.5',
        priority: 'high',
        description: 'Create comprehensive unit tests for critical services',
        dependencies: ['P2.4.5']
      };
    }

    if (completedTaskId === 'P2.5.1') {
      return {
        id: 'P2.5.2',
        title: 'Integration tests for workflows',
        type: 'testing',
        phase: 'P2.5',
        priority: 'high',
        description: 'Create integration tests for key workflows'
      };
    }

    return null; // No next task found
  }

  /**
   * Mark task as completed
   */
  static async markTaskCompleted(taskId, details) {  // eslint-disable-line no-unused-vars
    this.logger.system(`✅ Marking task completed: ${taskId}`);

    if (this.config.AUTO_UPDATE_TASK_STATUS) {
      await TaskStatusUpdater.updateTaskStatus(
        taskId,
        this.config.STATUS_MARKERS.COMPLETED,
        this.config.TASK_LIST_PATH
      );
    }

    this.logger.success(`✅ Task marked as completed: ${taskId}`);
  }

  /**
   * Log task completion with metrics
   */
  static logTaskCompletion(taskId, details) {
    const completionRecord = {
      taskId,
      completedAt: Date.now(),
      details,
      metrics: {
        buildTime: details.buildTime || 'N/A',
        buildStatus: details.buildStatus || 'unknown',
        errors: details.errors || 0
      }
    };

    this.progressionHistory.push(completionRecord);

    if (this.config.NOTIFY_ON_TASK_COMPLETION) {
      this.logger.success('📊 Task completion logged:', completionRecord);
    }
  }

  /**
   * Transition delay for system stability
   */
  static async transitionDelay() {
    const delay = this.config.TASK_TRANSITION_DELAY;
    this.logger.debug(`⏳ Task transition delay: ${delay}ms`);

    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Load current task status
   */
  static loadCurrentTaskStatus() {
    // Implementation would read from task list file
    this.logger.debug('📚 Loading current task status from system files');
  }

  /**
   * Get progression statistics
   */
  static getProgressionStats() {
    return {
      currentTask: this.currentTask,
      progressionHistory: this.progressionHistory,
      isProgressing: this.isProgressing,
      totalCompletedTasks: this.progressionHistory.filter(h => h.action !== 'auto_start').length,
      config: this.config,
      isInitialized: this.isInitialized
    };
  }

  /**
   * Force progression to next task
   */
  static async forceProgressToNext() {
    this.logger.warn('🚨 FORCE PROGRESSION triggered');

    if (this.currentTask) {
      await this.completeTaskAndProgress(this.currentTask.id, {
        forced: true,
        reason: 'Manual force progression'
      });
    }
  }

  /**
   * Initialize security task (placeholder)
   */
  static async initializeSecurityTask(task) {
    task.status = 'initialized';
    task.actionItems = ['Security audit', 'Vulnerability assessment', 'Security fixes'];
  }

  /**
   * Initialize performance task (placeholder)
   */
  static async initializePerformanceTask(task) {
    task.status = 'initialized';
    task.actionItems = ['Performance analysis', 'Optimization', 'Performance verification'];
  }
}
