#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates environment configuration for different deployment targets
 */

const fs = require('fs');
const path = require('path');

class EnvironmentValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.environments = ['development', 'staging', 'production'];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };

    const prefix = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];

    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  getRequiredVariables(environment) {
    const base = [
      'VITE_APP_NAME',
      'VITE_APP_VERSION',
      'VITE_APP_ENVIRONMENT'
    ];

    const development = [
      ...base,
      'VITE_API_BASE_URL',
      'VITE_ENABLE_CONSOLE_LOGS',
      'VITE_ENABLE_DEVELOPER_TOOLS',
      'VITE_ENABLE_MOCK_DATA',
      'VITE_DEV_SERVER_PORT'
    ];

    const production = [
      ...base,
      'PORT',
      'VITE_API_BASE_URL',
      'VITE_ENABLE_CSP',
      'VITE_ENABLE_HTTPS',
      'VITE_STORAGE_TYPE',
      'VITE_BUILD_SOURCEMAP',
      'VITE_BUILD_MINIFY'
    ];

    const staging = [...production];

    return {
      development,
      staging,
      production
    }[environment] || base;
  }

  parseEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const variables = {};

    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        variables[key.trim()] = value.trim();
      }
    });

    return variables;
  }

  validateEnvironment(environment) {
    this.log(`Validating ${environment} environment...`);

    const envFile = path.join(this.projectRoot, `.env.${environment}`);
    const variables = this.parseEnvFile(envFile);

    if (!variables) {
      this.log(`Environment file .env.${environment} not found`, 'error');
      return false;
    }

    const required = this.getRequiredVariables(environment);
    const missing = [];
    const invalid = [];

    required.forEach(varName => {
      if (!(varName in variables)) {
        missing.push(varName);
      } else if (!variables[varName] || variables[varName] === 'your-value-here') {
        invalid.push(varName);
      }
    });

    // Environment-specific validations
    if (environment === 'production') {
      this.validateProductionSpecific(variables, invalid);
    }

    if (missing.length > 0) {
      this.log(`Missing variables: ${missing.join(', ')}`, 'error');
    }

    if (invalid.length > 0) {
      this.log(`Invalid/placeholder values: ${invalid.join(', ')}`, 'warning');
    }

    if (missing.length === 0 && invalid.length === 0) {
      this.log(`${environment} environment validation passed`, 'success');
      return true;
    }

    return false;
  }

  validateProductionSpecific(variables, invalid) {
    // Check security settings
    if (variables.VITE_APP_DEBUG === 'true') {
      invalid.push('VITE_APP_DEBUG (should be false in production)');
    }

    if (variables.VITE_ENABLE_CONSOLE_LOGS === 'true') {
      invalid.push('VITE_ENABLE_CONSOLE_LOGS (should be false in production)');
    }

    if (variables.VITE_ENABLE_DEVELOPER_TOOLS === 'true') {
      invalid.push('VITE_ENABLE_DEVELOPER_TOOLS (should be false in production)');
    }

    if (variables.VITE_ENABLE_MOCK_DATA === 'true') {
      invalid.push('VITE_ENABLE_MOCK_DATA (should be false in production)');
    }

    // Check API URL
    if (variables.VITE_API_BASE_URL && variables.VITE_API_BASE_URL.includes('localhost')) {
      invalid.push('VITE_API_BASE_URL (should not use localhost in production)');
    }

    // Check port
    if (variables.PORT && (isNaN(variables.PORT) || variables.PORT < 1 || variables.PORT > 65535)) {
      invalid.push('PORT (invalid port number)');
    }
  }

  validateAllEnvironments() {
    console.log('🔍 Environment Configuration Validator\n');

    let allValid = true;

    this.environments.forEach(env => {
      const isValid = this.validateEnvironment(env);
      if (!isValid) {
        allValid = false;
      }
      console.log(''); // Empty line for readability
    });

    if (allValid) {
      this.log('All environment configurations are valid!', 'success');
    } else {
      this.log('Some environment configurations need attention', 'warning');
    }

    return allValid;
  }

  generateMissingEnvFiles() {
    this.log('Checking for missing environment files...');

    const exampleFile = path.join(this.projectRoot, '.env.example');
    if (!fs.existsSync(exampleFile)) {
      this.log('.env.example not found, cannot generate missing files', 'error');
      return;
    }

    this.environments.forEach(env => {
      const envFile = path.join(this.projectRoot, `.env.${env}`);
      if (!fs.existsSync(envFile)) {
        fs.copyFileSync(exampleFile, envFile);
        this.log(`Created .env.${env} from template`, 'success');
      }
    });
  }

  showEnvironmentSummary() {
    console.log('\n📊 Environment Summary:');
    console.log('========================');

    this.environments.forEach(env => {
      const envFile = path.join(this.projectRoot, `.env.${env}`);
      const exists = fs.existsSync(envFile);
      const status = exists ? '✅ Found' : '❌ Missing';
      console.log(`${env.padEnd(12)}: ${status}`);

      if (exists) {
        const variables = this.parseEnvFile(envFile);
        const count = Object.keys(variables).length;
        console.log(`${' '.repeat(14)}(${count} variables)`);
      }
    });
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const validator = new EnvironmentValidator();

  if (args.includes('--generate')) {
    validator.generateMissingEnvFiles();
  }

  if (args.includes('--summary')) {
    validator.showEnvironmentSummary();
  }

  const isValid = validator.validateAllEnvironments();

  if (!isValid) {
    process.exit(1);
  }
}

module.exports = EnvironmentValidator;