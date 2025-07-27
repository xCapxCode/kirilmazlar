/**
 * Task Status Updater
 * @package @kirilmazlar/auto-task-progression
 * @description Cross-project task status management and file operations
 */

import fs from 'fs-extra';
import path from 'path';
import { DEFAULT_CONFIG } from '../config/defaultConfig.js';
import { createLogger } from './logger.js';

/**
 * Task Status Updater for Cross-Project Compatibility
 */
export class TaskStatusUpdater {
  static config = DEFAULT_CONFIG;
  static logger = null;
  static statusCache = new Map();
  static isInitialized = false;

  /**
   * Initialize status updater
   */
  static initialize(customConfig = {}) {
    if (this.isInitialized) return;

    this.config = { ...DEFAULT_CONFIG, ...customConfig };
    this.logger = createLogger(this.config.LOG_LEVEL);

    this.isInitialized = true;

    if (this.config.ENABLE_LOGGING) {
      this.logger.system('📋 Task Status Updater initialized');
      this.logger.system('🔄 Cross-project status management active');
    }
  }

  /**
   * Update task status in markdown file
   */
  static async updateTaskStatus(taskId, newStatus, filePath, options = {}) {
    if (!this.isInitialized) {
      this.initialize();
    }

    try {
      const {
        timestamp = true,
        preserveContent = true,
        createBackup = this.config.CREATE_BACKUPS,
        autoCommit = false
      } = options;

      this.logger.debug(`📝 Updating task status: ${taskId} → ${newStatus}`);

      // 1. Validate file exists
      const resolvedPath = await this.resolveFilePath(filePath);
      if (!await fs.pathExists(resolvedPath)) {
        throw new Error(`Task file not found: ${resolvedPath}`);
      }

      // 2. Create backup if enabled
      if (createBackup) {
        await this.createBackup(resolvedPath);
      }

      // 3. Read current content
      const currentContent = await fs.readFile(resolvedPath, 'utf8');

      // 4. Update task status
      const updatedContent = await this.updateTaskInContent(
        currentContent,
        taskId,
        newStatus,
        { timestamp, preserveContent }
      );

      // 5. Write updated content
      await fs.writeFile(resolvedPath, updatedContent, 'utf8');

      // 6. Update cache
      this.statusCache.set(`${taskId}@${resolvedPath}`, {
        status: newStatus,
        updatedAt: Date.now(),
        filePath: resolvedPath
      });

      // 7. Log success
      this.logger.success(`✅ Task status updated: ${taskId} → ${newStatus}`);

      // 8. Auto-commit if enabled
      if (autoCommit) {
        await this.autoCommitChanges(resolvedPath, taskId, newStatus);
      }

      return {
        success: true,
        taskId,
        newStatus,
        filePath: resolvedPath,
        timestamp: Date.now()
      };

    } catch (error) {
      this.logger.error(`❌ Failed to update task status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update task content in markdown
   */
  static async updateTaskInContent(content, taskId, newStatus, options = {}) {
    const { timestamp, preserveContent } = options;

    // Common task status patterns
    const patterns = [
      // Pattern 1: - [ ] Task Name (ID: taskId) - Status
      new RegExp(`(- \\[[ x]\\] .+\\(ID: ${taskId}\\))( - .*)?$`, 'gm'),
      // Pattern 2: ## Task Name (taskId) - Status
      new RegExp(`(## .+\\(${taskId}\\))( - .*)?$`, 'gm'),
      // Pattern 3: ### taskId - Task Name - Status
      new RegExp(`(### ${taskId} - .+?)( - .*)?$`, 'gm'),
      // Pattern 4: taskId: Status
      new RegExp(`(${taskId}:)( .+)?$`, 'gm')
    ];

    let updatedContent = content;
    let patternMatched = false;

    // Try each pattern
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        const statusSuffix = timestamp
          ? ` - ${newStatus} (${new Date().toISOString().split('T')[0]})`
          : ` - ${newStatus}`;

        updatedContent = content.replace(pattern, `$1${statusSuffix}`);
        patternMatched = true;
        break;
      }
    }

    // If no pattern matched, append new task entry
    if (!patternMatched) {
      this.logger.warn(`⚠️ No existing pattern found for task ${taskId}, appending new entry`);

      const newTaskEntry = timestamp
        ? `- [ ] ${taskId} - ${newStatus} (${new Date().toISOString().split('T')[0]})\n`
        : `- [ ] ${taskId} - ${newStatus}\n`;

      updatedContent += '\n' + newTaskEntry;
    }

    return updatedContent;
  }

  /**
   * Mark task as completed
   */
  static async markTaskCompleted(taskId, filePath, completionNotes = '') {
    const completionStatus = completionNotes
      ? `✅ COMPLETED (${completionNotes})`
      : '✅ COMPLETED';

    return await this.updateTaskStatus(taskId, completionStatus, filePath, {
      timestamp: true,
      autoCommit: this.config.AUTO_COMMIT_COMPLETIONS
    });
  }

  /**
   * Mark task as in progress
   */
  static async markTaskInProgress(taskId, filePath, progressNotes = '') {
    const progressStatus = progressNotes
      ? `🔄 IN PROGRESS (${progressNotes})`
      : '🔄 IN PROGRESS';

    return await this.updateTaskStatus(taskId, progressStatus, filePath);
  }

  /**
   * Mark task as blocked
   */
  static async markTaskBlocked(taskId, filePath, blockReason = '') {
    const blockedStatus = blockReason
      ? `🚫 BLOCKED (${blockReason})`
      : '🚫 BLOCKED';

    return await this.updateTaskStatus(taskId, blockedStatus, filePath, {
      timestamp: true
    });
  }

  /**
   * Get task status from cache or file
   */
  static async getTaskStatus(taskId, filePath) {
    const resolvedPath = await this.resolveFilePath(filePath);
    const cacheKey = `${taskId}@${resolvedPath}`;

    // Check cache first
    if (this.statusCache.has(cacheKey)) {
      return this.statusCache.get(cacheKey);
    }

    // Read from file
    try {
      const content = await fs.readFile(resolvedPath, 'utf8');
      const status = this.extractTaskStatus(content, taskId);

      if (status) {
        this.statusCache.set(cacheKey, status);
      }

      return status;
    } catch (error) {
      this.logger.error(`Failed to read task status: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract task status from content
   */
  static extractTaskStatus(content, taskId) {
    const patterns = [
      new RegExp(`- \\[[ x]\\] .+\\(ID: ${taskId}\\) - (.+)$`, 'm'),
      new RegExp(`## .+\\(${taskId}\\) - (.+)$`, 'm'),
      new RegExp(`### ${taskId} - .+ - (.+)$`, 'm'),
      new RegExp(`${taskId}: (.+)$`, 'm')
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return {
          status: match[1].trim(),
          taskId,
          extracted: true,
          timestamp: Date.now()
        };
      }
    }

    return null;
  }

  /**
   * Create backup of file
   */
  static async createBackup(filePath) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    await fs.copy(filePath, backupPath);
    this.logger.debug(`💾 Backup created: ${backupPath}`);
    return backupPath;
  }

  /**
   * Resolve file path (handle relative/absolute paths)
   */
  static async resolveFilePath(filePath) {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }

    // Try common project locations
    const possiblePaths = [
      path.resolve(process.cwd(), filePath),
      path.resolve(process.cwd(), '.github', 'instructions', filePath),
      path.resolve(process.cwd(), 'docs', filePath),
      path.resolve(process.cwd(), filePath)
    ];

    for (const possiblePath of possiblePaths) {
      if (await fs.pathExists(possiblePath)) {
        return possiblePath;
      }
    }

    // If not found, return original path (will cause error in caller)
    return path.resolve(process.cwd(), filePath);
  }

  /**
   * Auto-commit changes to git
   */
  static async autoCommitChanges(filePath, taskId, status) {
    if (!this.config.AUTO_COMMIT_ENABLED) return;

    try {
      const { spawn } = await import('cross-spawn');
      const commitMessage = `Auto-update: ${taskId} → ${status}`;

      // Git add
      await new Promise((resolve, reject) => {
        const addProcess = spawn('git', ['add', filePath]);
        addProcess.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Git add failed with code ${code}`));
        });
      });

      // Git commit
      await new Promise((resolve, reject) => {
        const commitProcess = spawn('git', ['commit', '-m', commitMessage]);
        commitProcess.on('close', (code) => {
          if (code === 0) {
            this.logger.success(`📝 Auto-committed: ${commitMessage}`);
            resolve();
          } else {
            // Code 1 usually means "nothing to commit"
            resolve();
          }
        });
      });

    } catch (error) {
      this.logger.warn(`⚠️ Auto-commit failed: ${error.message}`);
    }
  }

  /**
   * Get all task statuses from file
   */
  static async getAllTaskStatuses(filePath) {
    const resolvedPath = await this.resolveFilePath(filePath);

    try {
      const content = await fs.readFile(resolvedPath, 'utf8');
      const tasks = [];

      // Extract all tasks using various patterns
      const patterns = [
        /- \[[ x]\] (.+)\(ID: (.+?)\) - (.+)$/gm,
        /## (.+)\((.+?)\) - (.+)$/gm,
        /### (.+?) - (.+) - (.+)$/gm,
        /(.+?): (.+)$/gm
      ];

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          tasks.push({
            name: match[1].trim(),
            id: match[2].trim(),
            status: match[3].trim(),
            filePath: resolvedPath
          });
        }
      });

      return tasks;
    } catch (error) {
      this.logger.error(`Failed to read all task statuses: ${error.message}`);
      return [];
    }
  }

  /**
   * Clear status cache
   */
  static clearCache() {
    this.statusCache.clear();
    this.logger.debug('🗑️ Status cache cleared');
  }
}
