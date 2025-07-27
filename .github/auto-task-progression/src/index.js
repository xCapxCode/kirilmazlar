/**
 * Auto Task Progression Package - Main Entry Point
 * @package @kirilmazlar/auto-task-progression
 * @description Portable cross-project autonomous task progression system
 */

// Core Services
export { AutoTaskProgressionService } from './core/AutoTaskProgressionService.js';
export { ContinuousBuildService, QuickBuildTrigger } from './core/ContinuousBuildService.js';

// Utilities
export { BuildResultAnalyzer } from './utils/BuildResultAnalyzer.js';
export { createLogger } from './utils/logger.js';
export { TaskStatusUpdater } from './utils/TaskStatusUpdater.js';

// Configuration
export { DEFAULT_CONFIG } from './config/defaultConfig.js';

// React Hooks (conditional export)
export {
  useAutoTaskProgression,
  useBuildAutomation,
  useTaskStatus
} from './hooks/useAutoTaskProgression.js';

