#!/usr/bin/env node
/**
 * Docker Management Scripts for Kırılmazlar Panel
 * Build, run, and manage Docker containers
 * 
 * Usage: node scripts/docker-manager.js [command]
 * 
 * @author GeniusCoder (Gen)
 */

/* eslint-disable no-console */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class DockerManager {
  constructor() {
    this.imageName = 'kirilmazlar-panel';
    this.containerName = 'kirilmazlar-app';
    this.devImageName = 'kirilmazlar-panel-dev';
    this.devContainerName = 'kirilmazlar-dev';
  }

  /**
   * Execute shell command with live output
   */
  async executeCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        ...options
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Build production Docker image
   */
  async buildProduction() {
    console.log('🐳 Building production Docker image...');

    try {
      await this.executeCommand('docker', [
        'build',
        '-t', this.imageName,
        '--target', 'production',
        '.'
      ]);

      console.log('✅ Production image built successfully!');
    } catch (error) {
      console.error('❌ Failed to build production image:', error.message);
      throw error;
    }
  }

  /**
   * Build development Docker image
   */
  async buildDevelopment() {
    console.log('🐳 Building development Docker image...');

    try {
      await this.executeCommand('docker', [
        'build',
        '-f', 'Dockerfile.dev.backup',
        '-t', this.devImageName,
        '.'
      ]);

      console.log('✅ Development image built successfully!');
    } catch (error) {
      console.error('❌ Failed to build development image:', error.message);
      throw error;
    }
  }

  /**
   * Run production container
   */
  async runProduction(port = 80) {
    console.log('🚀 Starting production container...');

    try {
      // Stop existing container if running
      await this.stopContainer(this.containerName);
      await this.removeContainer(this.containerName);

      await this.executeCommand('docker', [
        'run',
        '-d',
        '--name', this.containerName,
        '-p', `${port}:80`,
        '--restart', 'unless-stopped',
        this.imageName
      ]);

      console.log(`✅ Production container started on port ${port}!`);
      console.log(`🌐 Access at: http://localhost:${port}`);
    } catch (error) {
      console.error('❌ Failed to run production container:', error.message);
      throw error;
    }
  }

  /**
   * Run development container
   */
  async runDevelopment(port = 5000) {
    console.log('🚀 Starting development container...');

    try {
      // Stop existing container if running
      await this.stopContainer(this.devContainerName);
      await this.removeContainer(this.devContainerName);

      await this.executeCommand('docker', [
        'run',
        '-d',
        '--name', this.devContainerName,
        '-p', `${port}:5000`,
        '-v', `${process.cwd()}:/app`,
        '-v', '/app/node_modules',
        '--env', 'CHOKIDAR_USEPOLLING=true',
        this.devImageName
      ]);

      console.log(`✅ Development container started on port ${port}!`);
      console.log(`🌐 Access at: http://localhost:${port}`);
    } catch (error) {
      console.error('❌ Failed to run development container:', error.message);
      throw error;
    }
  }

  /**
   * Stop container
   */
  async stopContainer(containerName) {
    try {
      await execAsync(`docker stop ${containerName}`);
      console.log(`⏹️  Stopped container: ${containerName}`);
    } catch (error) {
      // Container might not be running, ignore error
    }
  }

  /**
   * Remove container
   */
  async removeContainer(containerName) {
    try {
      await execAsync(`docker rm ${containerName}`);
      console.log(`🗑️  Removed container: ${containerName}`);
    } catch (error) {
      // Container might not exist, ignore error
    }
  }

  /**
   * Show container logs
   */
  async logs(containerName, follow = false) {
    console.log(`📋 Showing logs for: ${containerName}`);

    const args = ['logs'];
    if (follow) args.push('-f');
    args.push(containerName);

    try {
      await this.executeCommand('docker', args);
    } catch (error) {
      console.error('❌ Failed to show logs:', error.message);
    }
  }

  /**
   * Container status
   */
  async status() {
    console.log('📊 Docker Container Status:');

    try {
      await this.executeCommand('docker', ['ps', '-a', '--filter', `name=${this.imageName}`]);
    } catch (error) {
      console.error('❌ Failed to get status:', error.message);
    }
  }

  /**
   * Clean up Docker resources
   */
  async cleanup() {
    console.log('🧹 Cleaning up Docker resources...');

    try {
      // Stop and remove containers
      await this.stopContainer(this.containerName);
      await this.removeContainer(this.containerName);
      await this.stopContainer(this.devContainerName);
      await this.removeContainer(this.devContainerName);

      // Remove images
      await execAsync(`docker rmi ${this.imageName} || true`);
      await execAsync(`docker rmi ${this.devImageName} || true`);

      // Clean up unused resources
      await execAsync('docker system prune -f');

      console.log('✅ Cleanup completed!');
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }

  /**
   * Docker Compose operations
   */
  async composeUp(profile = 'production') {
    console.log(`🐳 Starting services with profile: ${profile}`);

    try {
      const args = ['compose'];
      if (profile !== 'production') {
        args.push('--profile', profile);
      }
      args.push('up', '-d');

      await this.executeCommand('docker', args);
      console.log('✅ Services started successfully!');
    } catch (error) {
      console.error('❌ Failed to start services:', error.message);
      throw error;
    }
  }

  async composeDown() {
    console.log('⏹️  Stopping all services...');

    try {
      await this.executeCommand('docker', ['compose', 'down']);
      console.log('✅ Services stopped successfully!');
    } catch (error) {
      console.error('❌ Failed to stop services:', error.message);
      throw error;
    }
  }
}

// Command line interface
async function main() {
  const manager = new DockerManager();
  const command = process.argv[2];

  try {
    switch (command) {
      case 'build':
        await manager.buildProduction();
        break;
      case 'build:dev':
        await manager.buildDevelopment();
        break;
      case 'run':
        await manager.runProduction();
        break;
      case 'run:dev':
        await manager.runDevelopment();
        break;
      case 'logs':
        await manager.logs(manager.containerName);
        break;
      case 'logs:dev':
        await manager.logs(manager.devContainerName);
        break;
      case 'logs:follow':
        await manager.logs(manager.containerName, true);
        break;
      case 'status':
        await manager.status();
        break;
      case 'cleanup':
        await manager.cleanup();
        break;
      case 'up':
        await manager.composeUp();
        break;
      case 'up:dev':
        await manager.composeUp('development');
        break;
      case 'down':
        await manager.composeDown();
        break;
      default:
        console.log(`
🐳 Kırılmazlar Panel Docker Manager

Usage: node scripts/docker-manager.js [command]

Commands:
  build         Build production Docker image
  build:dev     Build development Docker image
  run           Run production container
  run:dev       Run development container
  logs          Show production container logs
  logs:dev      Show development container logs
  logs:follow   Follow production container logs
  status        Show container status
  cleanup       Clean up all Docker resources
  up            Start services with docker-compose
  up:dev        Start development services
  down          Stop all services

Examples:
  npm run docker:build
  npm run docker:run
  npm run docker:up
        `);
    }
  } catch (error) {
    console.error('💥 Operation failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
