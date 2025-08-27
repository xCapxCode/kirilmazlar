#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceMonitor {
  constructor() {
    this.distPath = path.join(process.cwd(), 'dist');
    this.reportPath = path.join(process.cwd(), 'performance-report.json');
    this.thresholds = {
      bundleSize: 1000 * 1024, // 1MB
      chunkSize: 500 * 1024,   // 500KB
      assetSize: 100 * 1024,   // 100KB
      totalSize: 5000 * 1024   // 5MB
    };
  }

  // Analyze bundle sizes
  analyzeBundleSize() {
    console.log('📊 Analyzing bundle sizes...');
    
    if (!fs.existsSync(this.distPath)) {
      console.error('❌ Dist folder not found. Run npm run build first.');
      process.exit(1);
    }

    const analysis = {
      timestamp: new Date().toISOString(),
      files: [],
      summary: {
        totalSize: 0,
        jsSize: 0,
        cssSize: 0,
        assetSize: 0,
        chunkCount: 0
      },
      warnings: [],
      recommendations: []
    };

    // Recursively analyze files
    this.analyzeDirectory(this.distPath, analysis);
    
    // Generate recommendations
    this.generateRecommendations(analysis);
    
    // Save report
    fs.writeFileSync(this.reportPath, JSON.stringify(analysis, null, 2));
    
    // Display results
    this.displayResults(analysis);
    
    return analysis;
  }

  analyzeDirectory(dirPath, analysis, relativePath = '') {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const relativeFilePath = path.join(relativePath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        this.analyzeDirectory(fullPath, analysis, relativeFilePath);
      } else {
        const fileInfo = {
          path: relativeFilePath,
          size: stats.size,
          sizeFormatted: this.formatBytes(stats.size),
          type: this.getFileType(item),
          gzipSize: this.estimateGzipSize(stats.size)
        };
        
        analysis.files.push(fileInfo);
        analysis.summary.totalSize += stats.size;
        
        // Categorize by type
        if (fileInfo.type === 'js') {
          analysis.summary.jsSize += stats.size;
          analysis.summary.chunkCount++;
          
          // Check chunk size threshold
          if (stats.size > this.thresholds.chunkSize) {
            analysis.warnings.push({
              type: 'large-chunk',
              file: relativeFilePath,
              size: stats.size,
              threshold: this.thresholds.chunkSize,
              message: `Chunk ${relativeFilePath} is ${this.formatBytes(stats.size)} (threshold: ${this.formatBytes(this.thresholds.chunkSize)})`
            });
          }
        } else if (fileInfo.type === 'css') {
          analysis.summary.cssSize += stats.size;
        } else {
          analysis.summary.assetSize += stats.size;
          
          // Check asset size threshold
          if (stats.size > this.thresholds.assetSize) {
            analysis.warnings.push({
              type: 'large-asset',
              file: relativeFilePath,
              size: stats.size,
              threshold: this.thresholds.assetSize,
              message: `Asset ${relativeFilePath} is ${this.formatBytes(stats.size)} (threshold: ${this.formatBytes(this.thresholds.assetSize)})`
            });
          }
        }
      }
    });
  }

  generateRecommendations(analysis) {
    const { summary, warnings } = analysis;
    
    // Total size check
    if (summary.totalSize > this.thresholds.totalSize) {
      analysis.recommendations.push({
        type: 'bundle-size',
        priority: 'high',
        message: `Total bundle size (${this.formatBytes(summary.totalSize)}) exceeds recommended limit (${this.formatBytes(this.thresholds.totalSize)})`,
        actions: [
          'Enable code splitting',
          'Implement lazy loading',
          'Remove unused dependencies',
          'Use dynamic imports'
        ]
      });
    }
    
    // JS size recommendations
    if (summary.jsSize > summary.totalSize * 0.7) {
      analysis.recommendations.push({
        type: 'js-optimization',
        priority: 'medium',
        message: 'JavaScript takes up more than 70% of bundle size',
        actions: [
          'Split vendor chunks',
          'Implement tree shaking',
          'Use smaller alternatives for large libraries',
          'Enable minification'
        ]
      });
    }
    
    // Chunk count recommendations
    if (summary.chunkCount > 20) {
      analysis.recommendations.push({
        type: 'chunk-optimization',
        priority: 'low',
        message: `High number of chunks (${summary.chunkCount}) may impact loading performance`,
        actions: [
          'Consolidate small chunks',
          'Review chunk splitting strategy',
          'Use manual chunk configuration'
        ]
      });
    }
    
    // Asset optimization
    if (analysis.files.some(f => f.type === 'image' && f.size > 50 * 1024)) {
      analysis.recommendations.push({
        type: 'asset-optimization',
        priority: 'medium',
        message: 'Large image assets detected',
        actions: [
          'Compress images',
          'Use WebP format',
          'Implement lazy loading for images',
          'Use responsive images'
        ]
      });
    }
  }

  displayResults(analysis) {
    console.log('\n📈 Performance Analysis Results');
    console.log('================================');
    
    // Summary
    console.log('\n📊 Bundle Summary:');
    console.log(`Total Size: ${this.formatBytes(analysis.summary.totalSize)}`);
    console.log(`JavaScript: ${this.formatBytes(analysis.summary.jsSize)} (${Math.round(analysis.summary.jsSize / analysis.summary.totalSize * 100)}%)`);
    console.log(`CSS: ${this.formatBytes(analysis.summary.cssSize)} (${Math.round(analysis.summary.cssSize / analysis.summary.totalSize * 100)}%)`);
    console.log(`Assets: ${this.formatBytes(analysis.summary.assetSize)} (${Math.round(analysis.summary.assetSize / analysis.summary.totalSize * 100)}%)`);
    console.log(`Chunks: ${analysis.summary.chunkCount}`);
    
    // Largest files
    console.log('\n📋 Largest Files:');
    const largestFiles = analysis.files
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
    
    largestFiles.forEach((file, index) => {
      const icon = file.type === 'js' ? '📜' : file.type === 'css' ? '🎨' : '📄';
      console.log(`${index + 1}. ${icon} ${file.path} - ${file.sizeFormatted}`);
    });
    
    // Warnings
    if (analysis.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      analysis.warnings.forEach(warning => {
        console.log(`   ${warning.message}`);
      });
    }
    
    // Recommendations
    if (analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      analysis.recommendations.forEach(rec => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`\n${priority} ${rec.message}`);
        rec.actions.forEach(action => {
          console.log(`   • ${action}`);
        });
      });
    }
    
    // Performance score
    const score = this.calculatePerformanceScore(analysis);
    console.log(`\n🎯 Performance Score: ${score}/100`);
    
    if (score >= 90) {
      console.log('🎉 Excellent! Your bundle is well optimized.');
    } else if (score >= 70) {
      console.log('👍 Good! Some optimizations could improve performance.');
    } else if (score >= 50) {
      console.log('⚠️  Fair. Consider implementing the recommendations above.');
    } else {
      console.log('🚨 Poor. Significant optimizations needed.');
    }
    
    console.log(`\n📄 Detailed report saved to: ${this.reportPath}`);
  }

  calculatePerformanceScore(analysis) {
    let score = 100;
    
    // Deduct points for size issues
    if (analysis.summary.totalSize > this.thresholds.totalSize) {
      score -= 30;
    } else if (analysis.summary.totalSize > this.thresholds.totalSize * 0.8) {
      score -= 15;
    }
    
    // Deduct points for large chunks
    const largeChunks = analysis.warnings.filter(w => w.type === 'large-chunk').length;
    score -= largeChunks * 10;
    
    // Deduct points for large assets
    const largeAssets = analysis.warnings.filter(w => w.type === 'large-asset').length;
    score -= largeAssets * 5;
    
    // Deduct points for too many chunks
    if (analysis.summary.chunkCount > 20) {
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    if (['.js', '.mjs', '.jsx'].includes(ext)) return 'js';
    if (['.css', '.scss', '.sass', '.less'].includes(ext)) return 'css';
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) return 'image';
    if (['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) return 'font';
    
    return 'other';
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  estimateGzipSize(size) {
    // Rough estimation: gzip typically reduces size by 60-80%
    return Math.round(size * 0.3);
  }

  // Network performance simulation
  simulateNetworkPerformance() {
    console.log('\n🌐 Network Performance Simulation');
    console.log('==================================');
    
    const analysis = JSON.parse(fs.readFileSync(this.reportPath, 'utf8'));
    const connections = {
      'Fast 3G': { bandwidth: 1.6 * 1024 * 1024 / 8, latency: 150 }, // 1.6 Mbps
      '4G': { bandwidth: 10 * 1024 * 1024 / 8, latency: 50 },        // 10 Mbps
      'WiFi': { bandwidth: 50 * 1024 * 1024 / 8, latency: 20 }       // 50 Mbps
    };
    
    Object.entries(connections).forEach(([name, config]) => {
      const downloadTime = (analysis.summary.totalSize / config.bandwidth) + (config.latency / 1000);
      console.log(`${name}: ${downloadTime.toFixed(2)}s`);
    });
  }

  // Generate optimization suggestions
  generateOptimizationPlan() {
    console.log('\n🔧 Optimization Plan');
    console.log('====================');
    
    const plan = [
      '1. 📦 Bundle Analysis',
      '   • Run: npm run analyze',
      '   • Review bundle composition',
      '   • Identify large dependencies',
      '',
      '2. 🌳 Tree Shaking',
      '   • Remove unused code',
      '   • Use ES modules',
      '   • Configure sideEffects in package.json',
      '',
      '3. 📱 Code Splitting',
      '   • Implement route-based splitting',
      '   • Use dynamic imports',
      '   • Split vendor chunks',
      '',
      '4. 🖼️  Asset Optimization',
      '   • Compress images',
      '   • Use WebP format',
      '   • Implement lazy loading',
      '',
      '5. 📊 Performance Monitoring',
      '   • Set up Core Web Vitals tracking',
      '   • Monitor bundle size over time',
      '   • Use performance budgets'
    ];
    
    plan.forEach(line => console.log(line));
  }
}

// CLI Interface
function main() {
  const monitor = new PerformanceMonitor();
  const command = process.argv[2] || 'analyze';
  
  switch (command) {
    case 'analyze':
      monitor.analyzeBundleSize();
      break;
      
    case 'network':
      if (!fs.existsSync(monitor.reportPath)) {
        console.log('📊 Running analysis first...');
        monitor.analyzeBundleSize();
      }
      monitor.simulateNetworkPerformance();
      break;
      
    case 'plan':
      monitor.generateOptimizationPlan();
      break;
      
    case 'help':
      console.log('Performance Monitor Commands:');
      console.log('  analyze  - Analyze bundle sizes and generate report');
      console.log('  network  - Simulate network performance');
      console.log('  plan     - Generate optimization plan');
      console.log('  help     - Show this help message');
      break;
      
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Run "npm run perf:monitor help" for available commands.');
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PerformanceMonitor;