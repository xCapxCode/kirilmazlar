/**
 * React Hooks for Auto Task Progression
 * @package @kirilmazlar/auto-task-progression
 * @description React integration hooks for autonomous task management
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_CONFIG } from '../config/defaultConfig.js';
import { AutoTaskProgressionService } from '../core/AutoTaskProgressionService.js';
import { ContinuousBuildService } from '../core/ContinuousBuildService.js';
import { TaskStatusUpdater } from '../utils/TaskStatusUpdater.js';

/**
 * Main hook for auto task progression
 */
export function useAutoTaskProgression(config = {}) {
  const [isActive, setIsActive] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);
  const [buildStatus, setBuildStatus] = useState('idle');
  const [progressStats, setProgressStats] = useState({});
  const configRef = useRef({ ...DEFAULT_CONFIG, ...config });

  // Initialize service
  useEffect(() => {
    AutoTaskProgressionService.initialize(configRef.current);
    ContinuousBuildService.initialize(configRef.current);

    return () => {
      // Cleanup if needed
    };
  }, []);

  /**
   * Start autonomous task progression
   */
  const startProgression = useCallback(async (initialTask = null) => {
    try {
      setIsActive(true);

      if (initialTask) {
        await AutoTaskProgressionService.initializeWithTask(initialTask);
        setCurrentTask(initialTask);
      } else {
        await AutoTaskProgressionService.initialize(configRef.current);
      }

      // Get initial stats
      const stats = AutoTaskProgressionService.getProgressionStats();
      setProgressStats(stats);

      return { success: true };
    } catch (error) {
      setIsActive(false);
      throw error;
    }
  }, []);

  /**
   * Complete current task and auto-progress
   */
  const completeTaskAndProgress = useCallback(async (completionNotes = '') => {
    if (!currentTask) {
      throw new Error('No active task to complete');
    }

    try {
      const result = await AutoTaskProgressionService.completeTaskAndProgress(
        currentTask.id,
        completionNotes
      );

      // Update state
      setTaskHistory(prev => [...prev, {
        ...currentTask,
        completedAt: Date.now(),
        notes: completionNotes
      }]);

      if (result.nextTask) {
        setCurrentTask(result.nextTask);
      } else {
        setCurrentTask(null);
        setIsActive(false);
      }

      // Update stats
      const stats = AutoTaskProgressionService.getProgressionStats();
      setProgressStats(stats);

      return result;
    } catch (error) {
      console.error('Task completion failed:', error);
      throw error;
    }
  }, [currentTask]);

  /**
   * Trigger automatic build
   */
  const triggerAutoBuild = useCallback(async (reason = 'manual') => {
    try {
      setBuildStatus('building');

      const buildResult = await ContinuousBuildService.executeAutoBuild(
        reason,
        { taskId: currentTask?.id }
      );

      setBuildStatus(buildResult.success ? 'success' : 'failed');

      // Auto-continue if successful and configured
      if (buildResult.success && configRef.current.AUTO_CONTINUE_ON_BUILD_SUCCESS) {
        // Could trigger next task or other actions
      }

      return buildResult;
    } catch (error) {
      setBuildStatus('failed');
      throw error;
    }
  }, [currentTask]);

  /**
   * Update task status
   */
  const updateTaskStatus = useCallback(async (taskId, status, filePath) => {
    try {
      const result = await TaskStatusUpdater.updateTaskStatus(taskId, status, filePath);

      // Update current task if it's the same
      if (currentTask?.id === taskId) {
        setCurrentTask(prev => ({
          ...prev,
          status,
          updatedAt: Date.now()
        }));
      }

      return result;
    } catch (error) {
      console.error('Status update failed:', error);
      throw error;
    }
  }, [currentTask]);

  /**
   * Force progress to next task
   */
  const forceProgressToNext = useCallback(async () => {
    try {
      const result = await AutoTaskProgressionService.forceProgressToNext();

      if (result.nextTask) {
        setCurrentTask(result.nextTask);
      }

      const stats = AutoTaskProgressionService.getProgressionStats();
      setProgressStats(stats);

      return result;
    } catch (error) {
      console.error('Force progress failed:', error);
      throw error;
    }
  }, []);

  /**
   * Stop autonomous progression
   */
  const stopProgression = useCallback(() => {
    setIsActive(false);
    setCurrentTask(null);
  }, []);

  return {
    // State
    isActive,
    currentTask,
    taskHistory,
    buildStatus,
    progressStats,

    // Actions
    startProgression,
    completeTaskAndProgress,
    triggerAutoBuild,
    updateTaskStatus,
    forceProgressToNext,
    stopProgression
  };
}

/**
 * Hook for build automation
 */
export function useBuildAutomation(config = {}) {
  const [buildHistory, setBuildHistory] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStats, setBuildStats] = useState({});
  const configRef = useRef({ ...DEFAULT_CONFIG, ...config });

  useEffect(() => {
    ContinuousBuildService.initialize(configRef.current);
  }, []);

  /**
   * Execute build without approval
   */
  const executeBuild = useCallback(async (reason = 'manual') => {
    try {
      setIsBuilding(true);

      const result = await ContinuousBuildService.executeAutoBuild(reason);

      setBuildHistory(prev => [...prev, {
        timestamp: Date.now(),
        reason,
        success: result.success,
        buildTime: result.buildTime
      }]);

      const stats = ContinuousBuildService.getBuildStats();
      setBuildStats(stats);

      return result;
    } catch (error) {
      setBuildHistory(prev => [...prev, {
        timestamp: Date.now(),
        reason,
        success: false,
        error: error.message
      }]);
      throw error;
    } finally {
      setIsBuilding(false);
    }
  }, []);

  /**
   * Get build statistics
   */
  const getBuildStats = useCallback(() => {
    return ContinuousBuildService.getBuildStats();
  }, []);

  return {
    buildHistory,
    isBuilding,
    buildStats,
    executeBuild,
    getBuildStats
  };
}

/**
 * Hook for task status management
 */
export function useTaskStatus(taskId, filePath) {
  const [status, setStatus] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Load current status
   */
  const loadStatus = useCallback(async () => {
    try {
      const currentStatus = await TaskStatusUpdater.getTaskStatus(taskId, filePath);
      setStatus(currentStatus);
      return currentStatus;
    } catch (error) {
      console.error('Failed to load task status:', error);
      return null;
    }
  }, [taskId, filePath]);

  /**
   * Update status
   */
  const updateStatus = useCallback(async (newStatus, options = {}) => {
    try {
      setIsUpdating(true);

      const result = await TaskStatusUpdater.updateTaskStatus(
        taskId,
        newStatus,
        filePath,
        options
      );

      setStatus({ status: newStatus, ...result });
      setLastUpdated(Date.now());

      return result;
    } catch (error) {
      console.error('Failed to update task status:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [taskId, filePath]);

  /**
   * Mark as completed
   */
  const markCompleted = useCallback(async (notes = '') => {
    return await updateStatus('✅ COMPLETED', {
      timestamp: true,
      completionNotes: notes
    });
  }, [updateStatus]);

  /**
   * Mark as in progress
   */
  const markInProgress = useCallback(async (notes = '') => {
    return await updateStatus('🔄 IN PROGRESS', {
      progressNotes: notes
    });
  }, [updateStatus]);

  // Load status on mount
  useEffect(() => {
    if (taskId && filePath) {
      loadStatus();
    }
  }, [taskId, filePath, loadStatus]);

  return {
    status,
    isUpdating,
    lastUpdated,
    updateStatus,
    markCompleted,
    markInProgress,
    reload: loadStatus
  };
}
