/**
 * 📋 TASK STATUS UPDATER - Görev Durumu Güncelleyici
 * Otonom sistem için görev durumu yönetimi
 */

import { logger } from './logger.js';

export class TaskStatusUpdater {
  constructor(options = {}) {
    this.taskListPath = options.taskListPath || '.trae/instructions/sistem-gorev-listesi.md';
    this.memoryPath = options.memoryPath || '.trae/instructions/proje-memories.md';
    this.autoSave = options.autoSave !== false;
    this.backupEnabled = options.backupEnabled !== false;
    
    this.tasks = new Map();
    this.taskHistory = [];
    this.currentSession = {
      id: `session_${Date.now()}`,
      startTime: new Date().toISOString(),
      tasksCompleted: 0,
      tasksTotal: 0
    };
    
    this.initializeUpdater();
  }

  async initializeUpdater() {
    logger.info('📋 Initializing Task Status Updater');
    
    // Load existing tasks and history
    await this.loadTasksFromStorage();
    await this.loadTaskHistory();
    
    // Setup auto-save if enabled
    if (this.autoSave) {
      this.setupAutoSave();
    }
    
    logger.info('✅ Task Status Updater initialized');
  }

  // Task management methods
  addTask(taskData) {
    const task = {
      id: taskData.id || `task_${Date.now()}`,
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      category: taskData.category || 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDuration: taskData.estimatedDuration || null,
      actualDuration: null,
      dependencies: taskData.dependencies || [],
      tags: taskData.tags || [],
      assignedTo: taskData.assignedTo || 'autonomous_system',
      progress: 0,
      notes: [],
      ...taskData
    };
    
    this.tasks.set(task.id, task);
    this.currentSession.tasksTotal++;
    
    logger.logSystemEvent('task_added', {
      taskId: task.id,
      title: task.title,
      priority: task.priority
    });
    
    if (this.autoSave) {
      this.saveTasksToStorage();
    }
    
    return task;
  }

  updateTaskStatus(taskId, newStatus, details = {}) {
    const task = this.tasks.get(taskId);
    if (!task) {
      logger.warn(`Task not found: ${taskId}`);
      return null;
    }
    
    const oldStatus = task.status;
    task.status = newStatus;
    task.updatedAt = new Date().toISOString();
    
    // Update progress based on status
    if (newStatus === 'completed') {
      task.progress = 100;
      task.completedAt = new Date().toISOString();
      this.currentSession.tasksCompleted++;
      
      if (task.createdAt) {
        task.actualDuration = new Date().getTime() - new Date(task.createdAt).getTime();
      }
    } else if (newStatus === 'in_progress') {
      task.startedAt = task.startedAt || new Date().toISOString();
      task.progress = Math.max(task.progress, 10); // Minimum 10% when started
    } else if (newStatus === 'failed') {
      task.failedAt = new Date().toISOString();
      task.failureReason = details.reason || 'Unknown error';
    }
    
    // Add details to task notes
    if (details.note) {
      task.notes.push({
        timestamp: new Date().toISOString(),
        note: details.note,
        statusChange: `${oldStatus} → ${newStatus}`
      });
    }
    
    // Update additional fields from details
    Object.keys(details).forEach(key => {
      if (key !== 'note' && key !== 'reason') {
        task[key] = details[key];
      }
    });
    
    // Record in history
    this.recordTaskStatusChange(taskId, oldStatus, newStatus, details);
    
    logger.logSystemEvent('task_status_updated', {
      taskId,
      oldStatus,
      newStatus,
      progress: task.progress,
      details
    });
    
    if (this.autoSave) {
      this.saveTasksToStorage();
    }
    
    return task;
  }

  updateTaskProgress(taskId, progress, note = '') {
    const task = this.tasks.get(taskId);
    if (!task) {
      logger.warn(`Task not found: ${taskId}`);
      return null;
    }
    
    const oldProgress = task.progress;
    task.progress = Math.max(0, Math.min(100, progress));
    task.updatedAt = new Date().toISOString();
    
    if (note) {
      task.notes.push({
        timestamp: new Date().toISOString(),
        note,
        progressChange: `${oldProgress}% → ${task.progress}%`
      });
    }
    
    // Auto-update status based on progress
    if (task.progress === 100 && task.status !== 'completed') {
      this.updateTaskStatus(taskId, 'completed', { note: 'Auto-completed based on 100% progress' });
    } else if (task.progress > 0 && task.status === 'pending') {
      this.updateTaskStatus(taskId, 'in_progress', { note: 'Auto-started based on progress update' });
    }
    
    logger.logSystemEvent('task_progress_updated', {
      taskId,
      oldProgress,
      newProgress: task.progress,
      note
    });
    
    if (this.autoSave) {
      this.saveTasksToStorage();
    }
    
    return task;
  }

  recordTaskStatusChange(taskId, oldStatus, newStatus, details) {
    const record = {
      timestamp: new Date().toISOString(),
      taskId,
      oldStatus,
      newStatus,
      details,
      sessionId: this.currentSession.id
    };
    
    this.taskHistory.push(record);
    
    // Keep history manageable (last 1000 records)
    if (this.taskHistory.length > 1000) {
      this.taskHistory = this.taskHistory.slice(-1000);
    }
  }

  // Task querying methods
  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  getTasksByStatus(status) {
    return this.getAllTasks().filter(task => task.status === status);
  }

  getTasksByPriority(priority) {
    return this.getAllTasks().filter(task => task.priority === priority);
  }

  getTasksByCategory(category) {
    return this.getAllTasks().filter(task => task.category === category);
  }

  getPendingTasks() {
    return this.getTasksByStatus('pending');
  }

  getInProgressTasks() {
    return this.getTasksByStatus('in_progress');
  }

  getCompletedTasks() {
    return this.getTasksByStatus('completed');
  }

  getFailedTasks() {
    return this.getTasksByStatus('failed');
  }

  // Task filtering and sorting
  filterTasks(criteria) {
    let tasks = this.getAllTasks();
    
    if (criteria.status) {
      tasks = tasks.filter(task => task.status === criteria.status);
    }
    
    if (criteria.priority) {
      tasks = tasks.filter(task => task.priority === criteria.priority);
    }
    
    if (criteria.category) {
      tasks = tasks.filter(task => task.category === criteria.category);
    }
    
    if (criteria.assignedTo) {
      tasks = tasks.filter(task => task.assignedTo === criteria.assignedTo);
    }
    
    if (criteria.tags && criteria.tags.length > 0) {
      tasks = tasks.filter(task => 
        criteria.tags.some(tag => task.tags.includes(tag))
      );
    }
    
    if (criteria.search) {
      const searchTerm = criteria.search.toLowerCase();
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort tasks
    if (criteria.sortBy) {
      tasks.sort((a, b) => {
        const aVal = a[criteria.sortBy];
        const bVal = b[criteria.sortBy];
        
        if (criteria.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
    }
    
    return tasks;
  }

  // Next task recommendation
  getNextRecommendedTask() {
    const availableTasks = this.getAllTasks().filter(task => {
      // Task must be pending
      if (task.status !== 'pending') return false;
      
      // Check dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        const dependenciesMet = task.dependencies.every(depId => {
          const depTask = this.getTask(depId);
          return depTask && depTask.status === 'completed';
        });
        if (!dependenciesMet) return false;
      }
      
      return true;
    });
    
    if (availableTasks.length === 0) return null;
    
    // Sort by priority and creation time
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    
    availableTasks.sort((a, b) => {
      // First by priority
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by creation time (older first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    
    return availableTasks[0];
  }

  // Batch operations
  batchUpdateTasks(updates) {
    const results = [];
    
    updates.forEach(update => {
      try {
        let result;
        
        if (update.type === 'status') {
          result = this.updateTaskStatus(update.taskId, update.status, update.details);
        } else if (update.type === 'progress') {
          result = this.updateTaskProgress(update.taskId, update.progress, update.note);
        } else if (update.type === 'add') {
          result = this.addTask(update.taskData);
        }
        
        results.push({ success: true, taskId: update.taskId, result });
      } catch (error) {
        results.push({ success: false, taskId: update.taskId, error: error.message });
        logger.error(`Batch update failed for task ${update.taskId}:`, error);
      }
    });
    
    if (this.autoSave) {
      this.saveTasksToStorage();
    }
    
    return results;
  }

  // Statistics and reporting
  getTaskStatistics() {
    const tasks = this.getAllTasks();
    const stats = {
      total: tasks.length,
      byStatus: {},
      byPriority: {},
      byCategory: {},
      averageProgress: 0,
      completionRate: 0,
      sessionStats: { ...this.currentSession }
    };
    
    // Count by status
    ['pending', 'in_progress', 'completed', 'failed', 'blocked'].forEach(status => {
      stats.byStatus[status] = tasks.filter(task => task.status === status).length;
    });
    
    // Count by priority
    ['high', 'medium', 'low'].forEach(priority => {
      stats.byPriority[priority] = tasks.filter(task => task.priority === priority).length;
    });
    
    // Count by category
    const categories = [...new Set(tasks.map(task => task.category))];
    categories.forEach(category => {
      stats.byCategory[category] = tasks.filter(task => task.category === category).length;
    });
    
    // Calculate averages
    if (tasks.length > 0) {
      stats.averageProgress = tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length;
      stats.completionRate = (stats.byStatus.completed / tasks.length) * 100;
    }
    
    return stats;
  }

  generateTaskReport() {
    const stats = this.getTaskStatistics();
    const recentHistory = this.taskHistory.slice(-20);
    
    const report = {
      timestamp: new Date().toISOString(),
      statistics: stats,
      recentActivity: recentHistory,
      nextRecommendedTask: this.getNextRecommendedTask(),
      blockedTasks: this.getTasksByStatus('blocked'),
      overdueTasks: this.getOverdueTasks(),
      sessionSummary: this.getSessionSummary()
    };
    
    return report;
  }

  getOverdueTasks() {
    const now = new Date().getTime();
    return this.getAllTasks().filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      return new Date(task.dueDate).getTime() < now;
    });
  }

  getSessionSummary() {
    const sessionDuration = new Date().getTime() - new Date(this.currentSession.startTime).getTime();
    
    return {
      ...this.currentSession,
      duration: sessionDuration,
      durationFormatted: this.formatDuration(sessionDuration),
      completionRate: this.currentSession.tasksTotal > 0 
        ? (this.currentSession.tasksCompleted / this.currentSession.tasksTotal * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Storage methods
  async saveTasksToStorage() {
    try {
      const data = {
        tasks: Object.fromEntries(this.tasks),
        session: this.currentSession,
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem('trae_task_status', JSON.stringify(data));
      
      // Also save to file system if possible
      await this.saveTasksToFile();
      
    } catch (error) {
      logger.error('Failed to save tasks to storage:', error);
    }
  }

  async loadTasksFromStorage() {
    try {
      const saved = localStorage.getItem('trae_task_status');
      if (saved) {
        const data = JSON.parse(saved);
        
        // Restore tasks
        if (data.tasks) {
          this.tasks = new Map(Object.entries(data.tasks));
        }
        
        // Restore session if recent (within 24 hours)
        if (data.session) {
          const sessionAge = new Date().getTime() - new Date(data.session.startTime).getTime();
          if (sessionAge < 24 * 60 * 60 * 1000) {
            this.currentSession = data.session;
          }
        }
        
        logger.debug(`📚 Loaded ${this.tasks.size} tasks from storage`);
      }
    } catch (error) {
      logger.error('Failed to load tasks from storage:', error);
    }
  }

  async saveTasksToFile() {
    // This would save to the actual task list file
    // Implementation depends on file system access
    logger.debug('📁 Task file save requested (implementation needed)');
  }

  async loadTaskHistory() {
    try {
      const saved = localStorage.getItem('trae_task_history');
      if (saved) {
        this.taskHistory = JSON.parse(saved);
        logger.debug(`📚 Loaded ${this.taskHistory.length} history records`);
      }
    } catch (error) {
      logger.error('Failed to load task history:', error);
    }
  }

  setupAutoSave() {
    // Save every 5 minutes
    setInterval(() => {
      this.saveTasksToStorage();
      
      // Save history separately
      try {
        localStorage.setItem('trae_task_history', JSON.stringify(this.taskHistory.slice(-500)));
      } catch (error) {
        logger.error('Failed to auto-save task history:', error);
      }
    }, 300000);
  }

  // Cleanup methods
  clearCompletedTasks() {
    const completedTasks = this.getCompletedTasks();
    completedTasks.forEach(task => {
      this.tasks.delete(task.id);
    });
    
    logger.info(`🧹 Cleared ${completedTasks.length} completed tasks`);
    
    if (this.autoSave) {
      this.saveTasksToStorage();
    }
    
    return completedTasks.length;
  }

  clearAllTasks() {
    const count = this.tasks.size;
    this.tasks.clear();
    this.taskHistory = [];
    
    localStorage.removeItem('trae_task_status');
    localStorage.removeItem('trae_task_history');
    
    logger.info(`🧹 Cleared all ${count} tasks`);
    
    return count;
  }

  // Export methods
  exportTasks(format = 'json') {
    const tasks = this.getAllTasks();
    
    switch (format) {
      case 'json':
        return JSON.stringify(tasks, null, 2);
      
      case 'csv':
        const headers = 'id,title,status,priority,category,progress,createdAt,updatedAt\n';
        const rows = tasks.map(task => 
          `"${task.id}","${task.title}","${task.status}","${task.priority}","${task.category}",${task.progress},"${task.createdAt}","${task.updatedAt}"`
        ).join('\n');
        return headers + rows;
      
      case 'markdown':
        let md = '# Task List\n\n';
        ['pending', 'in_progress', 'completed', 'failed'].forEach(status => {
          const statusTasks = this.getTasksByStatus(status);
          if (statusTasks.length > 0) {
            md += `## ${status.toUpperCase()}\n\n`;
            statusTasks.forEach(task => {
              md += `- [${task.status === 'completed' ? 'x' : ' '}] **${task.title}** (${task.priority})\n`;
              if (task.description) {
                md += `  ${task.description}\n`;
              }
              md += `  Progress: ${task.progress}% | Updated: ${new Date(task.updatedAt).toLocaleString()}\n\n`;
            });
          }
        });
        return md;
      
      default:
        return tasks;
    }
  }
}

// Export default instance
export const taskStatusUpdater = new TaskStatusUpdater();

export default TaskStatusUpdater;