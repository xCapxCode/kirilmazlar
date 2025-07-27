/**
 * Logger Utility
 * @package @kirilmazlar/auto-task-progression
 * @description Cross-project logging system
 */


/**
 * Logger levels
 */
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SYSTEM: 4,
  SUCCESS: 5
};

/**
 * Create logger instance
 */
export function createLogger(level = 'INFO') {
  const currentLevel = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;

  const logger = {
    debug: (message, data = null) => {
      if (currentLevel <= LOG_LEVELS.DEBUG) {
        console.log(`🔍 [DEBUG] ${message}`, data || '');
      }
    },

    info: (message, data = null) => {
      if (currentLevel <= LOG_LEVELS.INFO) {
        console.log(`📋 [INFO] ${message}`, data || '');
      }
    },

    warn: (message, data = null) => {
      if (currentLevel <= LOG_LEVELS.WARN) {
        console.warn(`⚠️ [WARN] ${message}`, data || '');
      }
    },

    error: (message, data = null) => {
      if (currentLevel <= LOG_LEVELS.ERROR) {
        console.error(`❌ [ERROR] ${message}`, data || '');
      }
    },

    system: (message, data = null) => {
      if (currentLevel <= LOG_LEVELS.SYSTEM) {
        console.log(`🤖 [SYSTEM] ${message}`, data || '');
      }
    },

    success: (message, data = null) => {
      if (currentLevel <= LOG_LEVELS.SUCCESS) {
        console.log(`✅ [SUCCESS] ${message}`, data || '');
      }
    }
  };

  return logger;
}
