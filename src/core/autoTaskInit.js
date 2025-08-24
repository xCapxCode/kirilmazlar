// Auto task services - import required services
import { AutoTaskProgressionService } from '../services/autoTaskProgressionService.js';

// Initialize logger
const logger = {
  info: (msg) => { /* INFO: ${msg} */ },
  debug: (msg) => { /* DEBUG: ${msg} */ },
  error: (msg) => console.error(`[ERROR] ${msg}`)
};

// Initialize services with enhanced memory sync
AutoTaskProgressionService.initialize({
  ENABLE_LOGGING: true,
  LOG_LEVEL: 'DEBUG',
  MEMORY_SYNC_INTERVAL: 5000, // Her 5 saniyede bir hafıza sync
  AUTO_SAVE_ENABLED: true,
  BACKUP_ON_CRASH: true,
  BUILD_AUTO_CONTINUE: true
});

// ContinuousBuildService removed - not implemented yet

// Export initialized services
export const autoTaskService = AutoTaskProgressionService;
export const systemLogger = logger;

// Test the system
// Testing Autonomous System
autoTaskService.completeTask('TEST-001', { message: 'System test successful' });
// System Status: autoTaskService.getStatus()
