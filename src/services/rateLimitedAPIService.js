/**
 * API Rate Limiting Integration Service
 * P2.4.5: Enhanced rate limiting integration with existing services  
 * 
 * @description Integrates advanced rate limiting with API service layer
 * @author KırılmazlarPanel Development Team
 * @date July 25, 2025 - Rate Limiting Integration
 */

import { useCallback, useEffect, useState } from 'react';
import { AdaptiveRateLimiter, RateLimitingMiddleware } from '../components/security/APIRateLimiting';
import logger from '../utils/productionLogger';
import { SecurityMonitorService } from './securityService';

/**
 * Enhanced API Service with Integrated Rate Limiting
 */
export class RateLimitedAPIService {
  static isInitialized = false;
  static middleware = null;
  static rateLimitQueue = new Map();
  static retryDelays = [1000, 2000, 4000, 8000]; // Progressive retry delays

  /**
   * Initialize the rate-limited API service
   */
  static initialize() {
    if (this.isInitialized) return;

    // Create rate limiting middleware
    this.middleware = RateLimitingMiddleware.create({
      getUserIdentifier: (request) => this.getUserIdentifier(request),
      getUserRole: (request) => this.getUserRole(request),
      onRateLimited: (rateLimitResult, request) => this.handleRateLimited(rateLimitResult, request),
      enableLogging: true
    });

    this.isInitialized = true;

    logger.info('🛡️ Rate Limited API Service initialized', {
      timestamp: new Date().toISOString()
    });

    SecurityMonitorService.logSecurityEvent('rate_limiting_service_initialized', {
      initTime: Date.now()
    });
  }

  /**
   * Get user identifier from request context
   */
  static getUserIdentifier(request) {  // eslint-disable-line no-unused-vars
    // Try to get from user session
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (userSession.userId) {
      return `user_${userSession.userId}`;
    }

    // Try to get from browser fingerprint  
    const fingerprint = this.getBrowserFingerprint();
    if (fingerprint) {
      return `fp_${fingerprint}`;
    }

    // Fallback to IP-based (simulated)
    return `ip_${this.getClientIP()}`;
  }

  /**
   * Get user role from request context
   */
  static getUserRole(request) {  // eslint-disable-line no-unused-vars
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    return userSession.role || 'anonymous';
  }

  /**
   * Handle rate limited requests
   */
  static handleRateLimited(rateLimitResult, request) {
    const identifier = this.getUserIdentifier(request);

    logger.warn('🚫 Request rate limited - queuing for retry:', {
      identifier: identifier.substring(0, 10) + '...',
      reason: rateLimitResult.reason,
      retryAfter: rateLimitResult.retryAfter,
      url: request.url
    });

    // Add to retry queue if not banned
    if (rateLimitResult.reason !== 'banned') {
      return this.queueForRetry(request, rateLimitResult);
    }

    // Return error for banned requests
    return {
      error: true,
      status: 429,
      message: 'Request temporarily banned due to excessive activity',
      retryAfter: rateLimitResult.retryAfter,
      details: rateLimitResult
    };
  }

  /**
   * Queue request for retry after rate limit
   */
  static async queueForRetry(request, rateLimitResult) {
    const requestId = this.generateRequestId(request);
    const retryAfter = (rateLimitResult.retryAfter || 1) * 1000; // Convert to ms

    // Store in queue
    this.rateLimitQueue.set(requestId, {
      request,
      rateLimitResult,
      queuedAt: Date.now(),
      retryAfter,
      attempts: 0
    });

    logger.info('⏳ Request queued for retry:', {
      requestId,
      retryAfter: retryAfter / 1000 + 's',
      queueSize: this.rateLimitQueue.size
    });

    // Schedule retry
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await this.processQueuedRequest(requestId);
        resolve(result);
      }, retryAfter);
    });
  }

  /**
   * Process queued request with retry logic
   */
  static async processQueuedRequest(requestId) {
    const queueItem = this.rateLimitQueue.get(requestId);
    if (!queueItem) {
      return { error: true, message: 'Request not found in queue' };
    }

    const { request, attempts } = queueItem;
    const identifier = this.getUserIdentifier(request);
    const userRole = this.getUserRole(request);
    const endpoint = RateLimitingMiddleware.extractEndpoint(request.url);

    try {
      // Check rate limit again
      const rateLimitResult = await AdaptiveRateLimiter.checkRateLimit(
        identifier,
        endpoint,
        userRole
      );

      if (rateLimitResult.allowed) {
        // Remove from queue and proceed
        this.rateLimitQueue.delete(requestId);

        logger.info('✅ Queued request proceeding:', {
          requestId,
          attempts: attempts + 1,
          delay: rateLimitResult.delay || 0
        });

        // Apply progressive delay if needed
        if (rateLimitResult.delay) {
          await new Promise(resolve => setTimeout(resolve, rateLimitResult.delay));
        }

        return await this.executeRequest(request);
      } else {
        // Still rate limited - retry with exponential backoff
        const newAttempts = attempts + 1;
        const maxAttempts = this.retryDelays.length;

        if (newAttempts >= maxAttempts) {
          this.rateLimitQueue.delete(requestId);

          logger.error('❌ Request retry limit exceeded:', {
            requestId,
            attempts: newAttempts,
            finalReason: rateLimitResult.reason
          });

          return {
            error: true,
            status: 429,
            message: 'Rate limit retry attempts exceeded',
            attempts: newAttempts,
            details: rateLimitResult
          };
        }

        // Update queue item
        queueItem.attempts = newAttempts;
        const retryDelay = this.retryDelays[newAttempts - 1] * (rateLimitResult.retryAfter || 1);

        logger.warn('⏳ Request still rate limited - scheduling retry:', {
          requestId,
          attempt: newAttempts,
          maxAttempts,
          retryDelay: retryDelay / 1000 + 's'
        });

        // Schedule next retry
        return new Promise((resolve) => {
          setTimeout(async () => {
            const result = await this.processQueuedRequest(requestId);
            resolve(result);
          }, retryDelay);
        });
      }
    } catch (error) {
      this.rateLimitQueue.delete(requestId);

      logger.error('❌ Error processing queued request:', {
        requestId,
        error: error.message
      });

      return {
        error: true,
        status: 500,
        message: 'Error processing queued request',
        details: error.message
      };
    }
  }

  /**
   * Execute the actual request
   */
  static async executeRequest(request) {
    try {
      const response = await fetch(request.url, request.options || {});

      logger.debug('🌐 Rate-limited request executed:', {
        url: request.url.substring(0, 50) + (request.url.length > 50 ? '...' : ''),
        status: response.status,
        queueSize: this.rateLimitQueue.size
      });

      return response;
    } catch (error) {
      logger.error('❌ Request execution failed:', {
        url: request.url,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Rate-limited fetch wrapper
   */
  static async rateLimitedFetch(url, options = {}) {
    this.initialize();

    const request = { url, options };

    try {
      // Apply rate limiting middleware
      const result = await this.middleware(request, async (req) => {
        return await this.executeRequest(req);
      });

      return result;
    } catch (error) {
      if (error.rateLimitStatus) {
        // Handle rate limit errors
        return this.handleRateLimited(error.rateLimitStatus, request);
      }
      throw error;
    }
  }

  /**
   * Batch API requests with rate limiting
   */
  static async batchRequests(requests, options = {}) {
    const {
      maxConcurrent = 3,
      batchDelay = 100,
      retryFailures = true
    } = options;

    this.initialize();

    logger.info('📦 Processing batch requests:', {
      totalRequests: requests.length,
      maxConcurrent,
      batchDelay
    });

    const results = [];
    const batches = [];

    // Split into batches
    for (let i = 0; i < requests.length; i += maxConcurrent) {
      batches.push(requests.slice(i, i + maxConcurrent));
    }

    for (const [batchIndex, batch] of batches.entries()) {
      logger.debug(`🔄 Processing batch ${batchIndex + 1}/${batches.length}:`, {
        batchSize: batch.length
      });

      // Process batch concurrently
      const batchPromises = batch.map(async (request, index) => {
        try {
          const result = await this.rateLimitedFetch(request.url, request.options);
          return { success: true, result, request, index: batchIndex * maxConcurrent + index };
        } catch (error) {
          logger.warn(`⚠️ Batch request failed:`, {
            url: request.url,
            error: error.message
          });
          return { success: false, error, request, index: batchIndex * maxConcurrent + index };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      // Process results
      for (const promiseResult of batchResults) {
        if (promiseResult.status === 'fulfilled') {
          results[promiseResult.value.index] = promiseResult.value;
        } else {
          results.push({
            success: false,
            error: promiseResult.reason,
            request: null,
            index: results.length
          });
        }
      }

      // Add delay between batches (except last)
      if (batchIndex < batches.length - 1 && batchDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
    }

    // Retry failed requests if enabled
    if (retryFailures) {
      const failedRequests = results.filter(r => !r.success && r.request);
      if (failedRequests.length > 0) {
        logger.info(`🔄 Retrying ${failedRequests.length} failed requests`);

        const retryResults = await Promise.allSettled(
          failedRequests.map(async (failedResult) => {
            try {
              const result = await this.rateLimitedFetch(
                failedResult.request.url,
                failedResult.request.options
              );
              return { ...failedResult, success: true, result, error: null };
            } catch (error) {
              return { ...failedResult, error };
            }
          })
        );

        // Update results with retry outcomes
        retryResults.forEach((retryResult, index) => {
          if (retryResult.status === 'fulfilled') {
            const failedIndex = failedRequests[index].index;
            results[failedIndex] = retryResult.value;
          }
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    logger.info('📦 Batch request completed:', {
      total: results.length,
      successful,
      failed,
      successRate: ((successful / results.length) * 100).toFixed(1) + '%'
    });

    SecurityMonitorService.logSecurityEvent('batch_api_requests_completed', {
      totalRequests: results.length,
      successful,
      failed,
      successRate: successful / results.length
    });

    return results;
  }

  /**
   * Get current rate limiting statistics
   */
  static getStatistics() {
    return {
      ...AdaptiveRateLimiter.getStatistics(),
      queueSize: this.rateLimitQueue.size,
      queuedRequests: Array.from(this.rateLimitQueue.entries()).map(([id, item]) => ({
        id,
        url: item.request.url,
        queuedAt: item.queuedAt,
        attempts: item.attempts,
        retryAfter: item.retryAfter
      }))
    };
  }

  /**
   * Clear rate limiting queue (admin function)
   */
  static clearQueue() {
    const queueSize = this.rateLimitQueue.size;
    this.rateLimitQueue.clear();

    logger.info('🧹 Rate limiting queue cleared:', {
      clearedRequests: queueSize
    });

    SecurityMonitorService.logSecurityEvent('rate_limit_queue_cleared', {
      clearedRequests: queueSize
    });
  }

  /**
   * Generate unique request ID
   */
  static generateRequestId(request) {
    const timestamp = Date.now();
    const url = request.url || '';
    const hash = this.simpleHash(url + timestamp);
    return `req_${timestamp}_${hash}`;
  }

  /**
   * Get browser fingerprint for identification
   */
  static getBrowserFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser fingerprint', 2, 2);

      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL()
      ].join('|');

      return this.simpleHash(fingerprint).substring(0, 16);
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Simulate client IP detection
   */
  static getClientIP() {
    // In a real application, this would be determined by the server
    // For client-side, we simulate with a session-based identifier
    let clientId = localStorage.getItem('client_identifier');
    if (!clientId) {
      clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2);
      localStorage.setItem('client_identifier', clientId);
    }
    return clientId;
  }

  /**
   * Simple hash function for generating IDs
   */
  static simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString(36);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

/**
 * React Hook for Rate-Limited API Calls
 */
export const useRateLimitedAPI = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize service
  useEffect(() => {
    RateLimitedAPIService.initialize();
    updateStatistics();
  }, []);

  const updateStatistics = useCallback(() => {
    const stats = RateLimitedAPIService.getStatistics();
    setStatistics(stats);
  }, []);

  // Rate-limited fetch function
  const rateLimitedFetch = useCallback(async (url, options = {}) => {
    setLoading(true);
    try {
      const result = await RateLimitedAPIService.rateLimitedFetch(url, options);
      updateStatistics();
      return result;
    } catch (error) {
      logger.error('Rate-limited fetch error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateStatistics]);

  // Batch requests function
  const batchRequests = useCallback(async (requests, options = {}) => {
    setLoading(true);
    try {
      const results = await RateLimitedAPIService.batchRequests(requests, options);
      updateStatistics();
      return results;
    } catch (error) {
      logger.error('Batch requests error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateStatistics]);

  // Admin functions
  const resetLimits = useCallback((identifier) => {
    AdaptiveRateLimiter.resetLimits(identifier, 'admin_reset');
    updateStatistics();
  }, [updateStatistics]);

  const banIdentifier = useCallback((identifier, reason = 'manual_ban', duration) => {
    AdaptiveRateLimiter.banIdentifier(identifier, reason, duration);
    updateStatistics();
  }, [updateStatistics]);

  const clearQueue = useCallback(() => {
    RateLimitedAPIService.clearQueue();
    updateStatistics();
  }, [updateStatistics]);

  return {
    // Core functions
    rateLimitedFetch,
    batchRequests,

    // Statistics and monitoring
    statistics,
    loading,
    updateStatistics,

    // Admin functions
    resetLimits,
    banIdentifier,
    clearQueue,

    // Status checks
    isRateLimited: statistics?.activeBans > 0 || statistics?.queueSize > 0,
    queueSize: statistics?.queueSize || 0,
    activeBans: statistics?.activeBans || 0
  };
};

export default RateLimitedAPIService;
