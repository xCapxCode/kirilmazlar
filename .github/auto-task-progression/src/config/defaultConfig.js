/**
 * Default Configuration for Auto Task Progression
 * @package @kirilmazlar/auto-task-progression
 */

export const DEFAULT_CONFIG = {
  // Auto progression settings
  AUTO_PROGRESSION_ENABLED: true,
  TASK_TRANSITION_DELAY: 500,
  TRACK_COMPLETION_METRICS: true,
  
  // Build automation  
  AUTO_BUILD_ENABLED: true,
  AUTO_TEST_AFTER_BUILD: true,
  AUTO_CONTINUE_ON_SUCCESS: true,
  AUTO_ANALYZE_BUILD_ERRORS: true,
  
  // Performance settings
  BUILD_PERFORMANCE_TRACKING: true,
  BUILD_TIMEOUT: 120000, // 2 minutes
  
  // File paths
  TASK_LIST_PATH: '.github/instructions/sistem-gorev-listesi.md',
  
  // Status markers
  STATUS_MARKERS: {
    COMPLETED: '✅ TAMAMLANDI',
    IN_PROGRESS: '🔄 BAŞLATILIYOR', 
    PLANNED: '❌ PLANLANDI',
    BLOCKED: '⏸️ BEKLEMEDE'
  },
  
  // GitHub Copilot integration
  ENFORCE_NO_APPROVAL_WAITING: true,
  AUTO_UPDATE_TASK_STATUS: true,
  
  // Logging
  ENABLE_LOGGING: true,
  LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
  
  // Notification settings
  NOTIFY_ON_BUILD_STATUS: true,
  NOTIFY_ON_TASK_COMPLETION: true
};
