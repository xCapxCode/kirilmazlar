/**
 * 📝 LOGGER - Gelişmiş Loglama Sistemi
 * Otonom sistem için optimize edilmiş logger
 */

export class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.prefix = options.prefix || '🤖 TRAE';
    this.enableConsole = options.enableConsole !== false;
    this.enableStorage = options.enableStorage !== false;
    this.maxStorageEntries = options.maxStorageEntries || 1000;
    
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };
    
    this.logs = [];
    this.initializeLogger();
  }

  initializeLogger() {
    // Load existing logs from localStorage
    if (this.enableStorage) {
      this.loadLogsFromStorage();
    }
    
    // Setup periodic cleanup
    setInterval(() => this.cleanupOldLogs(), 300000); // Every 5 minutes
  }

  log(level, message, ...args) {
    const levelNum = this.levels[level] || this.levels.info;
    const currentLevelNum = this.levels[this.level] || this.levels.info;
    
    // Check if we should log this level
    if (levelNum > currentLevelNum) {
      return;
    }
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      args: args.length > 0 ? args : undefined,
      prefix: this.prefix
    };
    
    // Add to internal logs
    this.logs.push(logEntry);
    
    // Console output
    if (this.enableConsole) {
      this.outputToConsole(logEntry);
    }
    
    // Storage
    if (this.enableStorage) {
      this.saveToStorage();
    }
    
    // Cleanup if too many logs
    if (this.logs.length > this.maxStorageEntries) {
      this.logs = this.logs.slice(-this.maxStorageEntries);
    }
  }

  outputToConsole(logEntry) {
    const { timestamp, level, message, args, prefix } = logEntry;
    const timeStr = new Date(timestamp).toLocaleTimeString();
    const levelEmoji = this.getLevelEmoji(level);
    
    const fullMessage = `${levelEmoji} ${prefix} [${timeStr}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(fullMessage, ...(args || []));
        break;
      case 'warn':
        console.warn(fullMessage, ...(args || []));
        break;
      case 'debug':
        console.debug(fullMessage, ...(args || []));
        break;
      case 'trace':
        console.trace(fullMessage, ...(args || []));
        break;
      default:
        console.log(fullMessage, ...(args || []));
    }
  }

  getLevelEmoji(level) {
    const emojis = {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      debug: '🔍',
      trace: '🔬'
    };
    return emojis[level] || 'ℹ️';
  }

  // Convenience methods
  error(message, ...args) {
    this.log('error', message, ...args);
  }

  warn(message, ...args) {
    this.log('warn', message, ...args);
  }

  info(message, ...args) {
    this.log('info', message, ...args);
  }

  debug(message, ...args) {
    this.log('debug', message, ...args);
  }

  trace(message, ...args) {
    this.log('trace', message, ...args);
  }

  // System-specific logging methods
  logApiCall(endpoint, method, duration, cached = false) {
    const cacheStatus = cached ? '💾 CACHED' : '☁️ API';
    this.info(`${cacheStatus} ${method} ${endpoint} (${duration}ms)`);
  }

  logTaskExecution(taskType, duration, processedLocally = false) {
    const location = processedLocally ? '🏠 LOCAL' : '☁️ REMOTE';
    this.info(`${location} Task: ${taskType} (${duration}ms)`);
  }

  logDecision(category, action, result, confidence) {
    this.debug(`🧠 Decision: ${category}.${action} = ${result} (confidence: ${confidence.toFixed(2)})`);
  }

  logSystemEvent(event, details = {}) {
    this.info(`🔄 System: ${event}`, details);
  }

  logPerformance(metric, value, unit = '') {
    this.info(`📊 Performance: ${metric} = ${value}${unit}`);
  }

  logError(error, context = {}) {
    this.error(`💥 Error: ${error.message}`, {
      stack: error.stack,
      context
    });
  }

  // Storage methods
  saveToStorage() {
    if (!this.enableStorage) return;
    
    try {
      const recentLogs = this.logs.slice(-100); // Save only recent 100 logs
      localStorage.setItem('trae_logger_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to save logs to storage:', error);
    }
  }

  loadLogsFromStorage() {
    if (!this.enableStorage) return;
    
    try {
      const saved = localStorage.getItem('trae_logger_logs');
      if (saved) {
        const savedLogs = JSON.parse(saved);
        this.logs = Array.isArray(savedLogs) ? savedLogs : [];
      }
    } catch (error) {
      console.error('Failed to load logs from storage:', error);
      this.logs = [];
    }
  }

  cleanupOldLogs() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    const before = this.logs.length;
    
    this.logs = this.logs.filter(log => 
      new Date(log.timestamp).getTime() > cutoffTime
    );
    
    const cleaned = before - this.logs.length;
    if (cleaned > 0) {
      this.debug(`🧹 Cleaned up ${cleaned} old log entries`);
    }
  }

  // Query methods
  getLogs(options = {}) {
    let filteredLogs = [...this.logs];
    
    // Filter by level
    if (options.level) {
      const levelNum = this.levels[options.level];
      filteredLogs = filteredLogs.filter(log => 
        this.levels[log.level] <= levelNum
      );
    }
    
    // Filter by time range
    if (options.since) {
      const sinceTime = new Date(options.since).getTime();
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp).getTime() >= sinceTime
      );
    }
    
    // Filter by message content
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchTerm)
      );
    }
    
    // Limit results
    if (options.limit) {
      filteredLogs = filteredLogs.slice(-options.limit);
    }
    
    return filteredLogs;
  }

  getStats() {
    const stats = {
      totalLogs: this.logs.length,
      byLevel: {},
      oldestLog: null,
      newestLog: null
    };
    
    // Count by level
    Object.keys(this.levels).forEach(level => {
      stats.byLevel[level] = this.logs.filter(log => log.level === level).length;
    });
    
    // Get oldest and newest
    if (this.logs.length > 0) {
      stats.oldestLog = this.logs[0].timestamp;
      stats.newestLog = this.logs[this.logs.length - 1].timestamp;
    }
    
    return stats;
  }

  // Export methods
  exportLogs(format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(this.logs, null, 2);
      
      case 'csv':
        const headers = 'timestamp,level,message,args\n';
        const rows = this.logs.map(log => 
          `"${log.timestamp}","${log.level}","${log.message}","${JSON.stringify(log.args || '')}"`
        ).join('\n');
        return headers + rows;
      
      case 'text':
        return this.logs.map(log => {
          const time = new Date(log.timestamp).toLocaleString();
          const emoji = this.getLevelEmoji(log.level);
          return `${emoji} [${time}] ${log.level.toUpperCase()}: ${log.message}`;
        }).join('\n');
      
      default:
        return this.logs;
    }
  }

  // Clear methods
  clear() {
    this.logs = [];
    if (this.enableStorage) {
      localStorage.removeItem('trae_logger_logs');
    }
    this.info('🧹 Logger cleared');
  }

  // Configuration methods
  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.level = level;
      this.info(`📝 Log level set to: ${level}`);
    } else {
      this.warn(`❌ Invalid log level: ${level}`);
    }
  }

  setPrefix(prefix) {
    this.prefix = prefix;
    this.info(`📝 Log prefix set to: ${prefix}`);
  }

  // Performance monitoring
  time(label) {
    const startTime = Date.now();
    return {
      end: () => {
        const duration = Date.now() - startTime;
        this.logPerformance(label, duration, 'ms');
        return duration;
      }
    };
  }

  // Memory usage
  getMemoryUsage() {
    const usage = {
      logsCount: this.logs.length,
      estimatedSize: JSON.stringify(this.logs).length,
      maxEntries: this.maxStorageEntries
    };
    
    return usage;
  }
}

// Create default logger instance
export const logger = new Logger({
  level: 'info',
  prefix: '🤖 TRAE-AUTO'
});

// Export for backward compatibility
export default Logger;