/**
 * Build Result Analyzer
 * @package @kirilmazlar/auto-task-progression
 * @description Analyze build results for quality and optimization
 */

import { DEFAULT_CONFIG } from '../config/defaultConfig.js';

/**
 * Build Result Analyzer for Cross-Project Compatibility
 */
export class BuildResultAnalyzer {
  static config = DEFAULT_CONFIG;

  /**
   * Analyze build result comprehensively
   */
  static analyze(buildResult) {
    const analysis = {
      timestamp: Date.now(),
      qualityScore: 0,
      performance: {},
      warnings: [],
      suggestions: [],
      breakdown: {}
    };

    // 1. Basic success analysis
    analysis.basicSuccess = buildResult.success;

    // 2. Performance analysis
    analysis.performance = this.analyzePerformance(buildResult);

    // 3. Output analysis
    analysis.output = this.analyzeOutput(buildResult);

    // 4. Warning detection
    analysis.warnings = this.detectWarnings(buildResult);

    // 5. Calculate quality score
    analysis.qualityScore = this.calculateQualityScore(analysis);

    // 6. Generate suggestions
    analysis.suggestions = this.generateSuggestions(analysis);

    return analysis;
  }

  /**
   * Analyze build performance
   */
  static analyzePerformance(buildResult) {
    const performance = {
      buildTime: buildResult.actualBuildTime || 0,
      rating: 'unknown',
      metrics: {}
    };

    // Time-based performance rating
    if (performance.buildTime > 0) {
      if (performance.buildTime < 5000) {
        performance.rating = 'excellent';
      } else if (performance.buildTime < 15000) {
        performance.rating = 'good';
      } else if (performance.buildTime < 30000) {
        performance.rating = 'acceptable';
      } else {
        performance.rating = 'slow';
      }
    }

    // Extract build metrics from stdout
    const stdout = buildResult.stdout || '';

    // Extract bundle size if available
    const bundleSizeMatch = stdout.match(/built in (\d+(?:\.\d+)?)\s*(ms|s)/);
    if (bundleSizeMatch) {
      const [, time, unit] = bundleSizeMatch;
      performance.metrics.officialBuildTime = `${time}${unit}`;
    }

    // Extract chunk information
    const chunkMatch = stdout.match(/(\d+)\s+modules?\s+transformed/);
    if (chunkMatch) {
      performance.metrics.modulesTransformed = parseInt(chunkMatch[1]);
    }

    return performance;
  }

  /**
   * Analyze build output
   */
  static analyzeOutput(buildResult) {
    const output = {
      hasOutput: false,
      outputSize: 0,
      lines: 0,
      contains: {}
    };

    const stdout = buildResult.stdout || '';
    const stderr = buildResult.stderr || '';

    if (stdout.length > 0) {
      output.hasOutput = true;
      output.outputSize += stdout.length;
      output.lines += stdout.split('\n').length;
    }

    if (stderr.length > 0) {
      output.hasOutput = true;
      output.outputSize += stderr.length;
      output.lines += stderr.split('\n').length;
    }

    // Analyze output content
    output.contains = {
      warnings: this.countOccurrences(stdout + stderr, /warning/gi),
      errors: this.countOccurrences(stdout + stderr, /error/gi),
      success: this.countOccurrences(stdout + stderr, /success|complete|built/gi),
      optimizations: this.countOccurrences(stdout + stderr, /optimiz|minif|compress/gi)
    };

    return output;
  }

  /**
   * Detect warnings in build output
   */
  static detectWarnings(buildResult) {
    const warnings = [];
    const stderr = buildResult.stderr || '';
    const stdout = buildResult.stdout || '';
    const allOutput = stdout + stderr;

    // Common warning patterns
    const warningPatterns = [
      {
        pattern: /warning/gi,
        type: 'general_warning',
        severity: 'medium'
      },
      {
        pattern: /deprecated/gi,
        type: 'deprecation',
        severity: 'medium'
      },
      {
        pattern: /peer dep.*not installed/gi,
        type: 'peer_dependency',
        severity: 'low'
      },
      {
        pattern: /cannot resolve/gi,
        type: 'resolution_error',
        severity: 'high'
      }
    ];

    warningPatterns.forEach(({ pattern, type, severity }) => {
      const matches = allOutput.match(pattern);
      if (matches) {
        warnings.push({
          type,
          severity,
          count: matches.length,
          detected: true
        });
      }
    });

    return warnings;
  }

  /**
   * Calculate overall quality score
   */
  static calculateQualityScore(analysis) {
    let score = 100;

    // Deduct for build failure
    if (!analysis.basicSuccess) {
      score -= 50;
    }

    // Deduct for performance issues
    switch (analysis.performance.rating) {
      case 'slow':
        score -= 20;
        break;
      case 'acceptable':
        score -= 10;
        break;
      case 'good':
        score -= 5;
        break;
      // excellent: no deduction
    }

    // Deduct for warnings
    analysis.warnings.forEach(warning => {
      switch (warning.severity) {
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
      }
    });

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generate improvement suggestions
   */
  static generateSuggestions(analysis) {
    const suggestions = [];

    // Performance suggestions
    if (analysis.performance.rating === 'slow') {
      suggestions.push({
        type: 'performance',
        priority: 'high',
        message: 'Consider optimizing build time with incremental builds or caching'
      });
    }

    // Warning-based suggestions
    const highSeverityWarnings = analysis.warnings.filter(w => w.severity === 'high');
    if (highSeverityWarnings.length > 0) {
      suggestions.push({
        type: 'warnings',
        priority: 'high',
        message: 'Resolve high-severity warnings to improve build stability'
      });
    }

    // Success enhancement suggestions
    if (analysis.qualityScore < 80) {
      suggestions.push({
        type: 'quality',
        priority: 'medium',
        message: 'Overall build quality could be improved'
      });
    }

    return suggestions;
  }

  /**
   * Analyze build errors for troubleshooting
   */
  static analyzeErrors(buildResult) {
    const errorAnalysis = {
      hasErrors: false,
      errorTypes: [],
      commonIssues: [],
      quickFixes: []
    };

    const stderr = buildResult.stderr || '';
    const allOutput = buildResult.stdout + stderr;

    if (buildResult.exitCode !== 0 || stderr.length > 0) {
      errorAnalysis.hasErrors = true;
    }

    // Common error patterns
    const errorPatterns = [
      {
        pattern: /module not found/gi,
        type: 'missing_module',
        quickFix: 'Run npm install to install missing dependencies'
      },
      {
        pattern: /syntax error/gi,
        type: 'syntax_error',
        quickFix: 'Check recent code changes for syntax issues'
      },
      {
        pattern: /out of memory/gi,
        type: 'memory_error',
        quickFix: 'Increase Node.js memory limit or optimize build process'
      },
      {
        pattern: /permission denied/gi,
        type: 'permission_error',
        quickFix: 'Check file permissions or run with appropriate privileges'
      }
    ];

    errorPatterns.forEach(({ pattern, type, quickFix }) => {
      if (pattern.test(allOutput)) {
        errorAnalysis.errorTypes.push(type);
        errorAnalysis.quickFixes.push(quickFix);
      }
    });

    return errorAnalysis;
  }

  /**
   * Utility: Count pattern occurrences
   */
  static countOccurrences(text, pattern) {
    const matches = text.match(pattern);
    return matches ? matches.length : 0;
  }

  /**
   * Generate build report
   */
  static generateReport(buildResult, analysis) {
    const report = {
      timestamp: new Date().toISOString(),
      buildStatus: buildResult.success ? 'SUCCESS' : 'FAILED',
      buildTime: buildResult.buildTime || 'unknown',
      qualityScore: `${analysis.qualityScore}%`,
      performance: analysis.performance.rating,
      warningCount: analysis.warnings.length,
      suggestionCount: analysis.suggestions.length,
      summary: this.generateSummary(analysis)
    };

    return report;
  }

  /**
   * Generate build summary
   */
  static generateSummary(analysis) {
    if (analysis.qualityScore >= 90) {
      return 'Excellent build quality - no issues detected';
    } else if (analysis.qualityScore >= 75) {
      return 'Good build quality - minor optimizations possible';
    } else if (analysis.qualityScore >= 60) {
      return 'Acceptable build quality - some improvements recommended';
    } else {
      return 'Build quality needs attention - multiple issues detected';
    }
  }
}
