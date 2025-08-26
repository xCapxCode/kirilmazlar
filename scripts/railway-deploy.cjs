#!/usr/bin/env node

/**
 * Railway Deployment Script
 * Automated deployment helper for Kırılmazlar Panel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class RailwayDeployer {
  constructor() {
    this.projectRoot = process.cwd();
    this.envFile = path.join(this.projectRoot, '.env.production');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🚀',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  checkPrerequisites() {
    this.log('Checking deployment prerequisites...');

    // Check if Railway CLI is installed
    try {
      execSync('railway --version', { stdio: 'pipe' });
      this.log('Railway CLI found', 'success');
    } catch (error) {
      this.log('Railway CLI not found. Please install: npm install -g @railway/cli', 'error');
      process.exit(1);
    }

    // Check if logged in to Railway
    try {
      execSync('railway whoami', { stdio: 'pipe' });
      this.log('Railway authentication verified', 'success');
    } catch (error) {
      this.log('Not logged in to Railway. Please run: railway login', 'error');
      process.exit(1);
    }

    // Check if production environment file exists
    if (!fs.existsSync(this.envFile)) {
      this.log('Production environment file not found', 'warning');
      this.log('Creating .env.production from template...');
      this.createProductionEnv();
    }
  }

  createProductionEnv() {
    const exampleEnv = path.join(this.projectRoot, '.env.example');
    if (fs.existsSync(exampleEnv)) {
      fs.copyFileSync(exampleEnv, this.envFile);
      this.log('Production environment file created', 'success');
    }
  }

  validateEnvironment() {
    this.log('Validating environment configuration...');

    const requiredVars = [
      'VITE_APP_NAME',
      'VITE_APP_VERSION',
      'VITE_APP_ENVIRONMENT',
      'PORT'
    ];

    const envContent = fs.readFileSync(this.envFile, 'utf8');
    const missingVars = [];

    requiredVars.forEach(varName => {
      if (!envContent.includes(varName)) {
        missingVars.push(varName);
      }
    });

    if (missingVars.length > 0) {
      this.log(`Missing required environment variables: ${missingVars.join(', ')}`, 'error');
      process.exit(1);
    }

    this.log('Environment validation passed', 'success');
  }

  buildProject() {
    this.log('Building project for production...');

    try {
      execSync('npm run build', { stdio: 'inherit' });
      this.log('Build completed successfully', 'success');
    } catch (error) {
      this.log('Build failed', 'error');
      process.exit(1);
    }
  }

  deployToRailway() {
    this.log('Deploying to Railway...');

    try {
      // Deploy using Railway CLI
      execSync('railway up', { stdio: 'inherit' });
      this.log('Deployment completed successfully', 'success');
    } catch (error) {
      this.log('Deployment failed', 'error');
      process.exit(1);
    }
  }

  setEnvironmentVariables() {
    this.log('Setting environment variables on Railway...');

    const envContent = fs.readFileSync(this.envFile, 'utf8');
    const envLines = envContent.split('\n').filter(line =>
      line.trim() && !line.startsWith('#') && line.includes('=')
    );

    envLines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/"/g, '');

      if (key && value) {
        try {
          execSync(`railway variables set ${key}="${value}"`, { stdio: 'pipe' });
          this.log(`Set ${key}`, 'success');
        } catch (error) {
          this.log(`Failed to set ${key}`, 'warning');
        }
      }
    });
  }

  showDeploymentInfo() {
    this.log('Getting deployment information...');

    try {
      const projectInfo = execSync('railway status', { encoding: 'utf8' });
      console.log('\n' + projectInfo);

      const domainInfo = execSync('railway domain', { encoding: 'utf8' });
      console.log(domainInfo);
    } catch (error) {
      this.log('Could not retrieve deployment info', 'warning');
    }
  }

  async deploy() {
    console.log('🚀 Kırılmazlar Panel - Railway Deployment\n');

    this.checkPrerequisites();
    this.validateEnvironment();
    this.buildProject();
    this.setEnvironmentVariables();
    this.deployToRailway();
    this.showDeploymentInfo();

    this.log('Deployment process completed!', 'success');
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployer = new RailwayDeployer();
  deployer.deploy().catch(error => {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  });
}

module.exports = RailwayDeployer;