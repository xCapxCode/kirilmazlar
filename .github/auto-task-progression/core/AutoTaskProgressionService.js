/**
 * Autonomous Task Progression Service
 * Proje bağımsız görev otomasyonu
 */

import { createLogger } from '../utils/logger.js';
import { TaskStatusUpdater } from '../utils/TaskStatusUpdater.js';
import { MemoryManager } from './MemoryManager.js';

export class AutoTaskProgressionService {
  static config = {
    ENABLE_LOGGING: true,
    LOG_LEVEL: 'DEBUG',
    MEMORY_SYNC_INTERVAL: 5000,
    AUTO_SAVE_ENABLED: true,
    BACKUP_ON_CRASH: true,
    BUILD_AUTO_CONTINUE: true
  };

  static logger = null;
  static memoryManager = null;
  static statusUpdater = null;

  static initialize(customConfig = {}) {
    // Merge configs
    this.config = { ...this.config, ...customConfig };

    // Initialize core services
    this.logger = createLogger(this.config.LOG_LEVEL);
    this.memoryManager = new MemoryManager();
    this.statusUpdater = new TaskStatusUpdater();

    // Setup memory sync
    if (this.config.AUTO_SAVE_ENABLED) {
      setInterval(() => {
        this.memoryManager.syncMemory();
      }, this.config.MEMORY_SYNC_INTERVAL);
    }

    this.logger.info('🤖 Autonomous System initialized');
  }

  static async completeTaskAndProgress(taskId, details = {}) {
    try {
      // Update task status
      await this.statusUpdater.updateTask(taskId, 'completed', details);

      // Sync memory
      await this.memoryManager.syncMemory();

      // Log success
      this.logger.info(`✅ Task ${taskId} completed and synced`);

      return { success: true };
    } catch (error) {
      this.logger.error('❌ Task progression error:', error);
      return { success: false, error: error.message };
    }
  }
}
