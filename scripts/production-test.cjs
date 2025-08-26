#!/usr/bin/env node

/**
 * Production Testing & Optimization Script
 * Comprehensive testing suite for production readiness
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

class ProductionTester {
  constructor() {
    this.projectRoot = process.cwd();
    this.testResults = {
      build: false,
      security: false,
      performance: false,
      deployment: false,
      accessibility: false
    };
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    
    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  async testBuild() {
    this.log('Testing production build...');
    
    try {
      // Clean previous build
      const distPath = path.join(this.projectRoot, 'dist');
      if (fs.existsSync(distPath)) {
        execSync('powershell -Command "Remove-Item -Recurse -Force dist"', { stdio: 'pipe' });
      }
      
      // Run production build
      execSync('npm run build', { stdio: 'pipe' });
      
      // Check if dist folder exists
      if (!fs.existsSync(distPath)) {
        throw new Error('Build output directory not found');
      }
      
      // Check essential files
      const essentialFiles = ['index.html', 'assets'];
      for (const file of essentialFiles) {
        if (!fs.existsSync(path.join(distPath, file))) {
          throw new Error(`Essential file/directory missing: ${file}`);
        }
      }
      
      // Check bundle size
      const stats = this.analyzeBundleSize();
      if (stats.totalSize > 5 * 1024 * 1024) { // 5MB limit
        this.warnings.push(`Bundle size is large: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`);
      }
      
      this.testResults.build = true;
      this.log('Build test passed', 'success');
      
    } catch (error) {
      this.errors.push(`Build test failed: ${error.message}`);
      this.log(`Build test failed: ${error.message}`, 'error');
    }
  }

  analyzeBundleSize() {
    const distPath = path.join(this.projectRoot, 'dist');
    let totalSize = 0;
    const files = [];
    
    function getSize(dirPath) {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          getSize(itemPath);
        } else {
          totalSize += stat.size;
          files.push({
            name: path.relative(distPath, itemPath),
            size: stat.size
          });
        }
      }
    }
    
    getSize(distPath);
    
    return {
      totalSize,
      files: files.sort((a, b) => b.size - a.size)
    };
  }

  testSecurity() {
    this.log('Testing security configuration...');
    
    try {
      // Check environment variables
      const prodEnv = path.join(this.projectRoot, '.env.production');
      if (fs.existsSync(prodEnv)) {
        const content = fs.readFileSync(prodEnv, 'utf8');
        
        // Check for debug flags
        if (content.includes('VITE_APP_DEBUG="true"')) {
          this.errors.push('Debug mode is enabled in production');
        }
        
        if (content.includes('VITE_ENABLE_CONSOLE_LOGS="true"')) {
          this.warnings.push('Console logs are enabled in production');
        }
        
        if (content.includes('VITE_ENABLE_DEVELOPER_TOOLS="true"')) {
          this.errors.push('Developer tools are enabled in production');
        }
        
        // Check for localhost URLs
        if (content.includes('localhost')) {
          this.errors.push('Localhost URLs found in production config');
        }
        
        // Check for placeholder values
        if (content.includes('your-') || content.includes('change-this')) {
          this.errors.push('Placeholder values found in production config');
        }
      }
      
      // Check for sensitive files
      const sensitiveFiles = ['.env', '.env.local', 'secrets.json'];
      for (const file of sensitiveFiles) {
        if (fs.existsSync(path.join(this.projectRoot, file))) {
          this.warnings.push(`Sensitive file found: ${file}`);
        }
      }
      
      // Check package.json for security
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
      if (packageJson.scripts && packageJson.scripts.start && packageJson.scripts.start.includes('--inspect')) {
        this.warnings.push('Debug inspector found in start script');
      }
      
      this.testResults.security = this.errors.length === 0;
      this.log('Security test completed', this.testResults.security ? 'success' : 'warning');
      
    } catch (error) {
      this.errors.push(`Security test failed: ${error.message}`);
      this.log(`Security test failed: ${error.message}`, 'error');
    }
  }

  testPerformance() {
    this.log('Testing performance optimizations...');
    
    try {
      const distPath = path.join(this.projectRoot, 'dist');
      
      // Check for gzip compression
      const indexHtml = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        const content = fs.readFileSync(indexHtml, 'utf8');
        
        // Check for minification
        if (content.includes('\n\n') || content.includes('  ')) {
          this.warnings.push('HTML may not be properly minified');
        }
        
        // Check for preload/prefetch
        if (!content.includes('rel="preload"') && !content.includes('rel="prefetch"')) {
          this.warnings.push('No resource preloading detected');
        }
      }
      
      // Check CSS and JS files
      const assetsPath = path.join(distPath, 'assets');
      if (fs.existsSync(assetsPath)) {
        // Check JS files in assets/js
        const jsPath = path.join(assetsPath, 'js');
        let jsFiles = [];
        if (fs.existsSync(jsPath)) {
          jsFiles = fs.readdirSync(jsPath).filter(f => f.endsWith('.js'));
        }
        
        // Check CSS files in assets/css
        const cssPath = path.join(assetsPath, 'css');
        let cssFiles = [];
        if (fs.existsSync(cssPath)) {
          cssFiles = fs.readdirSync(cssPath).filter(f => f.endsWith('.css'));
        }
        
        if (jsFiles.length === 0) {
          this.errors.push('No JavaScript files found in build');
        }
        
        if (cssFiles.length === 0) {
          this.warnings.push('No CSS files found in build');
        }
        
        // Check for source maps in production
        const allFiles = [...jsFiles, ...cssFiles];
        const sourceMaps = allFiles.filter(f => f.endsWith('.map'));
        if (sourceMaps.length > 0) {
          this.warnings.push('Source maps found in production build');
        }
      }
      
      this.testResults.performance = true;
      this.log('Performance test completed', 'success');
      
    } catch (error) {
      this.errors.push(`Performance test failed: ${error.message}`);
      this.log(`Performance test failed: ${error.message}`, 'error');
    }
  }

  testDeploymentReadiness() {
    this.log('Testing deployment readiness...');
    
    try {
      // Check Dockerfile
      const dockerfile = path.join(this.projectRoot, 'Dockerfile');
      if (!fs.existsSync(dockerfile)) {
        this.errors.push('Dockerfile not found');
      } else {
        const content = fs.readFileSync(dockerfile, 'utf8');
        if (!content.includes('EXPOSE')) {
          this.warnings.push('No EXPOSE instruction in Dockerfile');
        }
        if (!content.includes('HEALTHCHECK')) {
          this.warnings.push('No HEALTHCHECK in Dockerfile');
        }
      }
      
      // Check railway.json
      const railwayConfig = path.join(this.projectRoot, 'railway.json');
      if (!fs.existsSync(railwayConfig)) {
        this.warnings.push('railway.json not found');
      }
      
      // Check package.json scripts
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
      const requiredScripts = ['build', 'start'];
      
      for (const script of requiredScripts) {
        if (!packageJson.scripts || !packageJson.scripts[script]) {
          this.errors.push(`Required script missing: ${script}`);
        }
      }
      
      this.testResults.deployment = this.errors.filter(e => e.includes('Dockerfile') || e.includes('script')).length === 0;
      this.log('Deployment readiness test completed', this.testResults.deployment ? 'success' : 'warning');
      
    } catch (error) {
      this.errors.push(`Deployment test failed: ${error.message}`);
      this.log(`Deployment test failed: ${error.message}`, 'error');
    }
  }

  testAccessibility() {
    this.log('Testing accessibility features...');
    
    try {
      const distPath = path.join(this.projectRoot, 'dist');
      const indexHtml = path.join(distPath, 'index.html');
      
      if (fs.existsSync(indexHtml)) {
        const content = fs.readFileSync(indexHtml, 'utf8');
        
        // Check for lang attribute
        if (!content.includes('lang=')) {
          this.warnings.push('No lang attribute found in HTML');
        }
        
        // Check for viewport meta tag
        if (!content.includes('name="viewport"')) {
          this.errors.push('Viewport meta tag missing');
        }
        
        // Check for title
        if (!content.includes('<title>') || content.includes('<title></title>')) {
          this.warnings.push('Page title missing or empty');
        }
        
        // Check for meta description
        if (!content.includes('name="description"')) {
          this.warnings.push('Meta description missing');
        }
      }
      
      this.testResults.accessibility = true;
      this.log('Accessibility test completed', 'success');
      
    } catch (error) {
      this.errors.push(`Accessibility test failed: ${error.message}`);
      this.log(`Accessibility test failed: ${error.message}`, 'error');
    }
  }

  generateReport() {
    console.log('\n📊 Production Test Report');
    console.log('==========================\n');
    
    // Test results summary
    Object.entries(this.testResults).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${test.toUpperCase().padEnd(15)}: ${status}`);
    });
    
    console.log('\n');
    
    // Errors
    if (this.errors.length > 0) {
      console.log('❌ Errors:');
      this.errors.forEach(error => console.log(`   • ${error}`));
      console.log('');
    }
    
    // Warnings
    if (this.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
      console.log('');
    }
    
    // Overall status
    const allPassed = Object.values(this.testResults).every(result => result);
    const hasErrors = this.errors.length > 0;
    
    if (allPassed && !hasErrors) {
      this.log('All tests passed! Ready for production deployment.', 'success');
    } else if (!hasErrors) {
      this.log('Tests passed with warnings. Review warnings before deployment.', 'warning');
    } else {
      this.log('Tests failed. Fix errors before deployment.', 'error');
    }
    
    return allPassed && !hasErrors;
  }

  async runAllTests() {
    console.log('🧪 Production Testing Suite\n');
    
    await this.testBuild();
    this.testSecurity();
    this.testPerformance();
    this.testDeploymentReadiness();
    this.testAccessibility();
    
    return this.generateReport();
  }
}

// CLI interface
if (require.main === module) {
  const tester = new ProductionTester();
  
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = ProductionTester;