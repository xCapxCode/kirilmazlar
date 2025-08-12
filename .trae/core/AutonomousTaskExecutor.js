/**
 * 🤖 AUTONOMOUS TASK EXECUTOR - Otonom Görev Yürütücüsü
 * Görevleri yerel olarak işler, API çağrılarını minimize eder
 */

import { apiOptimizer } from './ApiOptimizationEngine.js';
import { contextManager } from './IntelligentContextManager.js';

export class AutonomousTaskExecutor {
  constructor() {
    this.taskQueue = [];
    this.runningTasks = new Map();
    this.completedTasks = [];
    this.taskTemplates = new Map();
    this.localProcessors = new Map();
    
    this.initializeExecutor();
    this.registerLocalProcessors();
  }

  initializeExecutor() {
    console.log('🤖 Autonomous Task Executor initialized');
    
    // Process task queue every 2 seconds
    setInterval(() => this.processTaskQueue(), 2000);
    
    // Cleanup completed tasks every 10 minutes
    setInterval(() => this.cleanupCompletedTasks(), 600000);
  }

  /**
   * 🏭 LOCAL PROCESSORS - Yerel işlemciler
   */
  registerLocalProcessors() {
    // File analysis processor
    this.localProcessors.set('analyze_file', async (task) => {
      return this.analyzeFileLocally(task.filePath, task.content);
    });
    
    // Code validation processor
    this.localProcessors.set('validate_code', async (task) => {
      return this.validateCodeLocally(task.code, task.language);
    });
    
    // Text processing processor
    this.localProcessors.set('process_text', async (task) => {
      return this.processTextLocally(task.text, task.operation);
    });
    
    // Context search processor
    this.localProcessors.set('search_context', async (task) => {
      return this.searchContextLocally(task.query, task.scope);
    });
    
    // Task planning processor
    this.localProcessors.set('plan_tasks', async (task) => {
      return this.planTasksLocally(task.requirements, task.constraints);
    });
    
    // Memory management processor
    this.localProcessors.set('manage_memory', async (task) => {
      return this.manageMemoryLocally(task.operation, task.data);
    });
    
    console.log(`🏭 Registered ${this.localProcessors.size} local processors`);
  }

  /**
   * 📋 TASK MANAGEMENT - Görev yönetimi
   */
  async executeTask(taskDefinition) {
    const task = {
      id: this.generateTaskId(),
      ...taskDefinition,
      status: 'queued',
      createdAt: new Date().toISOString(),
      priority: taskDefinition.priority || 1
    };
    
    console.log(`📋 Task queued: ${task.type} (${task.id})`);
    
    // Check if can be processed locally
    if (this.canProcessLocally(task)) {
      return this.processTaskLocally(task);
    }
    
    // Add to queue for batch processing
    this.taskQueue.push(task);
    return task.id;
  }

  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  formatText(text, options = {}) {
    if (!text || typeof text !== 'string') return '';
    
    const {
      maxLength = 100,
      truncate = true,
      capitalize = false,
      removeExtraSpaces = true
    } = options;

    let formatted = text;

    // Remove extra spaces
    if (removeExtraSpaces) {
      formatted = formatted.replace(/\s+/g, ' ').trim();
    }

    // Capitalize
    if (capitalize) {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    // Truncate
    if (truncate && formatted.length > maxLength) {
      formatted = formatted.substring(0, maxLength - 3) + '...';
    }

    return formatted;
  }

  validateInput(input, rules = {}) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const {
      required = false,
      minLength = 0,
      maxLength = Infinity,
      pattern = null,
      type = 'string'
    } = rules;

    // Required check
    if (required && (!input || input.toString().trim() === '')) {
      validation.errors.push('Input is required');
      validation.isValid = false;
    }

    if (input) {
      const inputStr = input.toString();
      
      // Length checks
      if (inputStr.length < minLength) {
        validation.errors.push(`Input must be at least ${minLength} characters`);
        validation.isValid = false;
      }
      
      if (inputStr.length > maxLength) {
        validation.errors.push(`Input must not exceed ${maxLength} characters`);
        validation.isValid = false;
      }
      
      // Pattern check
      if (pattern && !pattern.test(inputStr)) {
        validation.errors.push('Input does not match required pattern');
        validation.isValid = false;
      }
      
      // Type check
      if (type === 'email' && !this.isValidEmail(inputStr)) {
        validation.errors.push('Invalid email format');
        validation.isValid = false;
      }
    }

    return validation;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  calculateMetrics(data, metrics = []) {
    if (!Array.isArray(data) || data.length === 0) {
      return { error: 'Invalid or empty data array' };
    }

    const results = {};
    
    metrics.forEach(metric => {
      switch (metric) {
        case 'count':
          results.count = data.length;
          break;
        case 'sum':
          results.sum = data.reduce((acc, val) => acc + (Number(val) || 0), 0);
          break;
        case 'average':
          const sum = data.reduce((acc, val) => acc + (Number(val) || 0), 0);
          results.average = sum / data.length;
          break;
        case 'min':
          results.min = Math.min(...data.map(val => Number(val) || 0));
          break;
        case 'max':
          results.max = Math.max(...data.map(val => Number(val) || 0));
          break;
        case 'unique':
          results.unique = [...new Set(data)].length;
          break;
      }
    });

    return results;
  }

  sortData(data, sortBy = {}) {
    if (!Array.isArray(data)) {
      return { error: 'Data must be an array' };
    }

    const { field, order = 'asc' } = sortBy;
    
    return [...data].sort((a, b) => {
      let aVal = field ? a[field] : a;
      let bVal = field ? b[field] : b;
      
      // Handle different data types
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (order === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    });
  }

  filterData(data, filters = {}) {
    if (!Array.isArray(data)) {
      return { error: 'Data must be an array' };
    }

    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (typeof value === 'function') {
          return value(item[key]);
        }
        if (typeof value === 'object' && value.operator) {
          const itemValue = item[key];
          switch (value.operator) {
            case 'gt': return itemValue > value.value;
            case 'lt': return itemValue < value.value;
            case 'gte': return itemValue >= value.value;
            case 'lte': return itemValue <= value.value;
            case 'contains': return String(itemValue).includes(value.value);
            case 'startsWith': return String(itemValue).startsWith(value.value);
            case 'endsWith': return String(itemValue).endsWith(value.value);
            default: return itemValue === value.value;
          }
        }
        return item[key] === value;
      });
    });
  }

  transformData(data, transformation = {}) {
    if (!Array.isArray(data)) {
      return { error: 'Data must be an array' };
    }

    const { type, mapping, aggregation } = transformation;
    
    switch (type) {
      case 'map':
        return data.map(item => {
          const transformed = {};
          Object.entries(mapping || {}).forEach(([newKey, oldKey]) => {
            transformed[newKey] = typeof oldKey === 'function' ? oldKey(item) : item[oldKey];
          });
          return transformed;
        });
        
      case 'group':
        const grouped = {};
        data.forEach(item => {
          const key = item[aggregation.groupBy];
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        });
        return grouped;
        
      case 'flatten':
        return data.flat(transformation.depth || 1);
        
      default:
        return data;
    }
  }

  canProcessLocally(task) {
    return this.localProcessors.has(task.type) || 
           this.isSimpleTask(task) ||
           this.hasCachedResult(task);
  }

  isSimpleTask(task) {
    const simpleTasks = [
      'format_text',
      'validate_input',
      'calculate_metrics',
      'sort_data',
      'filter_data',
      'transform_data'
    ];
    
    return simpleTasks.includes(task.type);
  }

  hasCachedResult(task) {
    const cacheKey = this.generateCacheKey(task);
    return apiOptimizer.getCachedResult(cacheKey, task.type) !== null;
  }

  generateCacheKey(task) {
    return `${task.type}_${JSON.stringify(task.parameters || {})}`;
  }

  /**
   * 🔄 LOCAL PROCESSING - Yerel işleme
   */
  async processTaskLocally(task) {
    console.log(`🏠 Processing task locally: ${task.type}`);
    
    task.status = 'running';
    task.startedAt = new Date().toISOString();
    this.runningTasks.set(task.id, task);
    
    try {
      let result;
      
      // Check cache first
      const cacheKey = this.generateCacheKey(task);
      const cached = apiOptimizer.getCachedResult(cacheKey, task.type);
      
      if (cached) {
        result = cached;
        console.log(`💾 Using cached result for task: ${task.type}`);
      } else {
        // Process with local processor
        if (this.localProcessors.has(task.type)) {
          result = await this.localProcessors.get(task.type)(task);
        } else {
          result = await this.processSimpleTask(task);
        }
        
        // Cache the result
        apiOptimizer.setCachedResult(cacheKey, result, task.type);
      }
      
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      task.result = result;
      
      this.runningTasks.delete(task.id);
      this.completedTasks.push(task);
      
      console.log(`✅ Task completed locally: ${task.type}`);
      return result;
      
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      task.completedAt = new Date().toISOString();
      
      this.runningTasks.delete(task.id);
      
      console.error(`❌ Task failed: ${task.type}`, error);
      throw error;
    }
  }

  async processSimpleTask(task) {
    switch (task.type) {
      case 'format_text':
        return this.formatText(task.text, task.format);
      case 'validate_input':
        return this.validateInput(task.input, task.rules);
      case 'calculate_metrics':
        return this.calculateMetrics(task.data, task.metrics);
      case 'sort_data':
        return this.sortData(task.data, task.sortBy);
      case 'filter_data':
        return this.filterData(task.data, task.filters);
      case 'transform_data':
        return this.transformData(task.data, task.transformation);
      default:
        throw new Error(`Unknown simple task type: ${task.type}`);
    }
  }

  /**
   * 🔍 SPECIFIC LOCAL PROCESSORS - Özel yerel işlemciler
   */
  async analyzeFileLocally(filePath, content) {
    const analysis = {
      filePath,
      size: content.length,
      lines: content.split('\n').length,
      language: this.detectLanguage(filePath),
      complexity: this.calculateComplexity(content),
      dependencies: this.extractDependencies(content),
      exports: this.extractExports(content),
      functions: this.extractFunctions(content),
      timestamp: new Date().toISOString()
    };
    
    // Update code context
    contextManager.updateCodeContext(filePath, {
      analysis,
      lastAnalyzed: analysis.timestamp
    });
    
    return analysis;
  }

  detectLanguage(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'css': 'css',
      'html': 'html',
      'md': 'markdown',
      'json': 'json'
    };
    
    return languageMap[extension] || 'unknown';
  }

  calculateComplexity(content) {
    // Simple complexity calculation
    const lines = content.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const functions = (content.match(/function\s+\w+|=>\s*{|class\s+\w+/g) || []).length;
    const conditionals = (content.match(/if\s*\(|switch\s*\(|for\s*\(|while\s*\(/g) || []).length;
    
    return {
      totalLines: lines.length,
      codeLines: nonEmptyLines.length,
      functions,
      conditionals,
      score: Math.min(10, Math.floor((functions + conditionals) / nonEmptyLines.length * 100))
    };
  }

  extractDependencies(content) {
    const imports = [];
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return [...new Set(imports)];
  }

  extractExports(content) {
    const exports = [];
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g;
    
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    return exports;
  }

  extractFunctions(content) {
    const functions = [];
    const functionRegex = /(?:function\s+(\w+)|(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g;
    
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push(match[1] || match[2]);
    }
    
    return functions;
  }

  async validateCodeLocally(code, language) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };
    
    // Basic syntax validation
    if (language === 'javascript' || language === 'typescript') {
      validation.errors.push(...this.validateJavaScript(code));
    }
    
    // Common code quality checks
    validation.warnings.push(...this.checkCodeQuality(code));
    
    return validation;
  }

  validateJavaScript(code) {
    const errors = [];
    
    // Check for common syntax errors
    const brackets = { '(': 0, '[': 0, '{': 0 };
    for (const char of code) {
      if (char === '(' || char === '[' || char === '{') brackets[char]++;
      if (char === ')') brackets['(']--;
      if (char === ']') brackets['[']--;
      if (char === '}') brackets['{']--;
    }
    
    Object.entries(brackets).forEach(([bracket, count]) => {
      if (count !== 0) {
        errors.push(`Unmatched ${bracket} bracket`);
      }
    });
    
    return errors;
  }

  checkCodeQuality(code) {
    const warnings = [];
    
    // Check for console.log statements
    if (code.includes('console.log')) {
      warnings.push('Console.log statements found - consider using a logger');
    }
    
    // Check for TODO comments
    if (code.includes('TODO') || code.includes('FIXME')) {
      warnings.push('TODO/FIXME comments found');
    }
    
    // Check for long lines
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (line.length > 120) {
        warnings.push(`Line ${index + 1} is too long (${line.length} characters)`);
      }
    });
    
    return warnings;
  }

  async searchContextLocally(query, scope) {
    console.log(`🔍 Searching context locally: ${query}`);
    
    const results = contextManager.getRelevantContext(query);
    
    // Filter by scope if specified
    if (scope && scope !== 'all') {
      const filteredResults = {};
      if (scope === 'conversation' && results.conversation) {
        filteredResults.conversation = results.conversation;
      }
      if (scope === 'code' && results.code) {
        filteredResults.code = results.code;
      }
      if (scope === 'tasks' && results.tasks) {
        filteredResults.tasks = results.tasks;
      }
      if (scope === 'project' && results.project) {
        filteredResults.project = results.project;
      }
      
      return filteredResults;
    }
    
    return results;
  }

  /**
   * 📊 TASK ANALYTICS - Görev analitikleri
   */
  getTaskStats() {
    const stats = {
      queued: this.taskQueue.length,
      running: this.runningTasks.size,
      completed: this.completedTasks.length,
      localProcessingRate: 0,
      averageProcessingTime: 0
    };
    
    if (this.completedTasks.length > 0) {
      const localTasks = this.completedTasks.filter(task => 
        task.processedLocally !== false
      );
      
      stats.localProcessingRate = (localTasks.length / this.completedTasks.length) * 100;
      
      const processingTimes = this.completedTasks
        .filter(task => task.startedAt && task.completedAt)
        .map(task => 
          new Date(task.completedAt) - new Date(task.startedAt)
        );
      
      if (processingTimes.length > 0) {
        stats.averageProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
      }
    }
    
    return stats;
  }

  /**
   * 🧹 CLEANUP - Temizlik
   */
  cleanupCompletedTasks() {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    const before = this.completedTasks.length;
    this.completedTasks = this.completedTasks.filter(task => 
      new Date(task.completedAt) > cutoffDate
    );
    
    const cleaned = before - this.completedTasks.length;
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old completed tasks`);
    }
  }

  async processTaskQueue() {
    if (this.taskQueue.length === 0) return;
    
    // Sort by priority
    this.taskQueue.sort((a, b) => b.priority - a.priority);
    
    // Process up to 3 tasks simultaneously
    const tasksToProcess = this.taskQueue.splice(0, 3);
    
    const promises = tasksToProcess.map(task => this.processTaskLocally(task));
    
    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('❌ Error processing task queue:', error);
    }
  }
}

// Global instance
export const taskExecutor = new AutonomousTaskExecutor();