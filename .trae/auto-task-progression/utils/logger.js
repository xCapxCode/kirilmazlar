/**
 * 📝 UTILS LOGGER - Yardımcı Logger Fonksiyonları
 * Otonom sistem için logger utilities
 */

import { logger as coreLogger } from '../core/Logger.js';

// Re-export core logger for backward compatibility
export const logger = coreLogger;

// Utility functions for common logging patterns
export const logUtils = {
  // API call logging
  logApiCall: (endpoint, method, duration, cached = false) => {
    coreLogger.logApiCall(endpoint, method, duration, cached);
  },

  // Task execution logging
  logTaskExecution: (taskType, duration, processedLocally = false) => {
    coreLogger.logTaskExecution(taskType, duration, processedLocally);
  },

  // Decision logging
  logDecision: (category, action, result, confidence) => {
    coreLogger.logDecision(category, action, result, confidence);
  },

  // System event logging
  logSystemEvent: (event, details = {}) => {
    coreLogger.logSystemEvent(event, details);
  },

  // Performance logging
  logPerformance: (metric, value, unit = '') => {
    coreLogger.logPerformance(metric, value, unit);
  },

  // Error logging with context
  logError: (error, context = {}) => {
    coreLogger.logError(error, context);
  },

  // Batch logging for multiple events
  logBatch: (events) => {
    events.forEach(event => {
      const { type, ...data } = event;
      switch (type) {
        case 'api':
          logUtils.logApiCall(data.endpoint, data.method, data.duration, data.cached);
          break;
        case 'task':
          logUtils.logTaskExecution(data.taskType, data.duration, data.processedLocally);
          break;
        case 'decision':
          logUtils.logDecision(data.category, data.action, data.result, data.confidence);
          break;
        case 'system':
          logUtils.logSystemEvent(data.event, data.details);
          break;
        case 'performance':
          logUtils.logPerformance(data.metric, data.value, data.unit);
          break;
        case 'error':
          logUtils.logError(data.error, data.context);
          break;
        default:
          coreLogger.info('Unknown log event type:', event);
      }
    });
  },

  // Timing utilities
  startTimer: (label) => {
    return coreLogger.time(label);
  },

  // Memory usage logging
  logMemoryUsage: () => {
    const usage = coreLogger.getMemoryUsage();
    coreLogger.logPerformance('memory_logs_count', usage.logsCount);
    coreLogger.logPerformance('memory_estimated_size', usage.estimatedSize, 'bytes');
  },

  // Session logging
  logSessionStart: (sessionId) => {
    coreLogger.logSystemEvent('session_start', { sessionId, timestamp: new Date().toISOString() });
  },

  logSessionEnd: (sessionId, duration) => {
    coreLogger.logSystemEvent('session_end', { sessionId, duration, timestamp: new Date().toISOString() });
  },

  // Build logging
  logBuildStart: (buildId, command) => {
    coreLogger.logSystemEvent('build_start', { buildId, command, timestamp: new Date().toISOString() });
  },

  logBuildEnd: (buildId, success, duration, output) => {
    coreLogger.logSystemEvent('build_end', { 
      buildId, 
      success, 
      duration, 
      output: output?.substring(0, 200), // Truncate long output
      timestamp: new Date().toISOString() 
    });
  },

  // File operation logging
  logFileOperation: (operation, filePath, success, details = {}) => {
    coreLogger.logSystemEvent('file_operation', {
      operation,
      filePath,
      success,
      details,
      timestamp: new Date().toISOString()
    });
  },

  // Context logging for autonomous decisions
  logContextUpdate: (contextType, size, relevance) => {
    coreLogger.logSystemEvent('context_update', {
      contextType,
      size,
      relevance,
      timestamp: new Date().toISOString()
    });
  },

  // Cache logging
  logCacheOperation: (operation, key, hit, size) => {
    coreLogger.logSystemEvent('cache_operation', {
      operation,
      key,
      hit,
      size,
      timestamp: new Date().toISOString()
    });
  },

  // Optimization logging
  logOptimization: (type, before, after, savings) => {
    coreLogger.logSystemEvent('optimization', {
      type,
      before,
      after,
      savings,
      savingsPercent: ((before - after) / before * 100).toFixed(2) + '%',
      timestamp: new Date().toISOString()
    });
  }
};

// Convenience exports
export const {
  logApiCall,
  logTaskExecution,
  logDecision,
  logSystemEvent,
  logPerformance,
  logError,
  logBatch,
  startTimer,
  logMemoryUsage,
  logSessionStart,
  logSessionEnd,
  logBuildStart,
  logBuildEnd,
  logFileOperation,
  logContextUpdate,
  logCacheOperation,
  logOptimization
} = logUtils;

// Default export for backward compatibility
export default logger;