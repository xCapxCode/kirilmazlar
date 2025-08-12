// Auto task services removed - using simplified approach

// Initialize logger
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  debug: (msg) => console.log(`[DEBUG] ${msg}`),
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

// Initialize continuous build service
ContinuousBuildService.initialize({
  AUTO_BUILD: true,
  SKIP_CONFIRMATION: true,
  LOG_BUILDS: true
});

// Export initialized services
export const autoTaskService = AutoTaskProgressionService;
export const buildService = ContinuousBuildService;
export const systemLogger = logger;

// Test the system
console.log('🚀 Testing Autonomous System...');
autoTaskService.completeTask('TEST-001', { message: 'System test successful' });
console.log('📊 System Status:', autoTaskService.getStatus());
