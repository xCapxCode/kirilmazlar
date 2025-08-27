#!/usr/bin/env node

// Data Migration CLI Tool
// Usage: node scripts/migrate.js [command] [options]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class MigrationCLI {
  constructor() {
    this.commands = {
      'migrate': this.runMigration.bind(this),
      'backup': this.createBackup.bind(this),
      'restore': this.restoreBackup.bind(this),
      'verify': this.verifyMigration.bind(this),
      'status': this.showStatus.bind(this),
      'clean': this.cleanLocalStorage.bind(this),
      'help': this.showHelp.bind(this)
    };
  }

  /**
   * Main CLI entry point
   */
  async run() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    const options = this.parseOptions(args.slice(1));

    this.printHeader();

    if (!this.commands[command]) {
      this.error(`Unknown command: ${command}`);
      this.showHelp();
      process.exit(1);
    }

    try {
      await this.commands[command](options);
    } catch (error) {
      this.error(`Command failed: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Parse command line options
   */
  parseOptions(args) {
    const options = {};
    for (let i = 0; i < args.length; i += 2) {
      if (args[i].startsWith('--')) {
        const key = args[i].substring(2);
        const value = args[i + 1] || true;
        options[key] = value;
      }
    }
    return options;
  }

  /**
   * Print CLI header
   */
  printHeader() {
    console.log(`${colors.cyan}${colors.bright}`);
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    KIRILMAZLAR DATA MIGRATION                ║');
    console.log('║                  localStorage → PostgreSQL                   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`${colors.reset}\n`);
  }

  /**
   * Run full migration
   */
  async runMigration(options) {
    this.info('🚀 Starting data migration process...');

    // Confirm before proceeding
    if (!options.force) {
      const confirmed = await this.confirm(
        'This will migrate all data from localStorage to PostgreSQL. Continue?'
      );
      if (!confirmed) {
        this.warn('Migration cancelled by user.');
        return;
      }
    }

    try {
      // Dynamic import to avoid issues in CLI context
      const { default: DataMigrationService } = await import('../src/utils/dataMigration.js');
      
      this.info('📊 Starting migration...');
      const result = await DataMigrationService.migrateAllData();

      if (result.success) {
        this.success('✅ Migration completed successfully!');
        this.printMigrationSummary(result.summary);
        
        // Auto-verify if requested
        if (options.verify) {
          this.info('🔍 Running verification...');
          await this.verifyMigration({});
        }
      } else {
        this.error('❌ Migration failed!');
        this.error(`Error: ${result.error}`);
        if (result.summary) {
          this.printMigrationSummary(result.summary);
        }
      }
    } catch (error) {
      this.error(`Migration error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create backup
   */
  async createBackup(options) {
    this.info('💾 Creating backup of localStorage data...');

    try {
      // For CLI context, we need to simulate localStorage
      const backupData = await this.getLocalStorageData();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = options.file || `backup_${timestamp}.json`;
      const backupPath = path.resolve(process.cwd(), backupFile);

      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      
      this.success(`✅ Backup created: ${backupPath}`);
      this.info(`📊 Backup contains:`);
      this.info(`   - Users: ${backupData.users?.length || 0}`);
      this.info(`   - Customers: ${backupData.customers?.length || 0}`);
      this.info(`   - Products: ${backupData.products?.length || 0}`);
      this.info(`   - Orders: ${backupData.orders?.length || 0}`);
    } catch (error) {
      this.error(`Backup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(options) {
    const backupFile = options.file;
    if (!backupFile) {
      this.error('Please specify backup file with --file option');
      return;
    }

    const backupPath = path.resolve(process.cwd(), backupFile);
    if (!fs.existsSync(backupPath)) {
      this.error(`Backup file not found: ${backupPath}`);
      return;
    }

    this.info(`🔄 Restoring from backup: ${backupPath}`);

    const confirmed = await this.confirm(
      'This will overwrite current localStorage data. Continue?'
    );
    if (!confirmed) {
      this.warn('Restore cancelled by user.');
      return;
    }

    try {
      const { default: DataMigrationService } = await import('../src/utils/dataMigration.js');
      
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      
      // Restore data (this would need to be implemented in the service)
      const result = await DataMigrationService.restoreFromBackup(backupData);
      
      if (result.success) {
        this.success('✅ Data restored successfully!');
      } else {
        this.error(`❌ Restore failed: ${result.error}`);
      }
    } catch (error) {
      this.error(`Restore failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify migration
   */
  async verifyMigration(options) {
    this.info('🔍 Verifying migration integrity...');

    try {
      const { default: DataMigrationService } = await import('../src/utils/dataMigration.js');
      
      const result = await DataMigrationService.verifyMigration();
      
      if (result.success) {
        this.success('✅ Migration verification passed!');
        this.printVerificationResults(result.verification);
      } else {
        this.error('❌ Migration verification failed!');
        this.error(`Error: ${result.error}`);
        if (result.verification) {
          this.printVerificationResults(result.verification);
        }
      }
    } catch (error) {
      this.error(`Verification failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Show migration status
   */
  async showStatus(options) {
    this.info('📊 Checking migration status...');

    try {
      const { default: DataMigrationService } = await import('../src/utils/dataMigration.js');
      
      const status = DataMigrationService.getMigrationStatus();
      this.printMigrationSummary(status);
      
      // Also show localStorage data counts
      const localData = await this.getLocalStorageData();
      this.info('\n📱 Current localStorage data:');
      this.info(`   - Users: ${localData.users?.length || 0}`);
      this.info(`   - Customers: ${localData.customers?.length || 0}`);
      this.info(`   - Products: ${localData.products?.length || 0}`);
      this.info(`   - Orders: ${localData.orders?.length || 0}`);
    } catch (error) {
      this.error(`Status check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean localStorage
   */
  async cleanLocalStorage(options) {
    this.warn('🧹 This will clean all localStorage data!');
    
    const confirmed = await this.confirm(
      'Are you sure you want to clean localStorage? This cannot be undone!'
    );
    if (!confirmed) {
      this.warn('Clean cancelled by user.');
      return;
    }

    try {
      // Create backup before cleaning
      if (!options['no-backup']) {
        this.info('💾 Creating backup before cleaning...');
        await this.createBackup({ file: `pre_clean_backup_${Date.now()}.json` });
      }

      // Clean localStorage (this would need browser context)
      this.info('🧹 Cleaning localStorage...');
      
      // In CLI context, we can't actually clean localStorage
      // This would need to be done in browser context
      this.warn('⚠️ localStorage cleaning must be done in browser context');
      this.info('Run this in browser console:');
      this.info('localStorage.clear(); sessionStorage.clear();');
      
    } catch (error) {
      this.error(`Clean failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Show help
   */
  showHelp() {
    console.log(`${colors.bright}USAGE:${colors.reset}`);
    console.log('  node scripts/migrate.js <command> [options]\n');
    
    console.log(`${colors.bright}COMMANDS:${colors.reset}`);
    console.log('  migrate    Run full data migration from localStorage to PostgreSQL');
    console.log('  backup     Create backup of localStorage data');
    console.log('  restore    Restore data from backup file');
    console.log('  verify     Verify migration integrity');
    console.log('  status     Show current migration status');
    console.log('  clean      Clean localStorage data (with backup)');
    console.log('  help       Show this help message\n');
    
    console.log(`${colors.bright}OPTIONS:${colors.reset}`);
    console.log('  --force           Skip confirmation prompts');
    console.log('  --verify          Auto-verify after migration');
    console.log('  --file <path>     Specify backup file path');
    console.log('  --no-backup       Skip backup creation\n');
    
    console.log(`${colors.bright}EXAMPLES:${colors.reset}`);
    console.log('  node scripts/migrate.js migrate --verify');
    console.log('  node scripts/migrate.js backup --file my_backup.json');
    console.log('  node scripts/migrate.js restore --file my_backup.json');
    console.log('  node scripts/migrate.js verify');
    console.log('  node scripts/migrate.js clean --no-backup\n');
  }

  /**
   * Get localStorage data (simulated for CLI)
   */
  async getLocalStorageData() {
    // In CLI context, we need to read from a file or simulate
    // This is a placeholder - in real usage, this would read from browser storage
    return {
      users: [],
      customers: [],
      products: [],
      orders: [],
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Print migration summary
   */
  printMigrationSummary(summary) {
    if (!summary) return;
    
    console.log(`\n${colors.bright}📊 MIGRATION SUMMARY:${colors.reset}`);
    console.log('┌─────────────┬───────┬──────────┬────────┐');
    console.log('│ Data Type   │ Total │ Migrated │ Errors │');
    console.log('├─────────────┼───────┼──────────┼────────┤');
    console.log(`│ Users       │ ${this.pad(summary.users?.total || 0, 5)} │ ${this.pad(summary.users?.migrated || 0, 8)} │ ${this.pad(summary.users?.errors || 0, 6)} │`);
    console.log(`│ Customers   │ ${this.pad(summary.customers?.total || 0, 5)} │ ${this.pad(summary.customers?.migrated || 0, 8)} │ ${this.pad(summary.customers?.errors || 0, 6)} │`);
    console.log(`│ Products    │ ${this.pad(summary.products?.total || 0, 5)} │ ${this.pad(summary.products?.migrated || 0, 8)} │ ${this.pad(summary.products?.errors || 0, 6)} │`);
    console.log(`│ Orders      │ ${this.pad(summary.orders?.total || 0, 5)} │ ${this.pad(summary.orders?.migrated || 0, 8)} │ ${this.pad(summary.orders?.errors || 0, 6)} │`);
    console.log('└─────────────┴───────┴──────────┴────────┘');
    
    if (summary.totalErrors && summary.totalErrors.length > 0) {
      console.log(`\n${colors.red}❌ ERRORS:${colors.reset}`);
      summary.totalErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (summary.startTime && summary.endTime) {
      const duration = new Date(summary.endTime) - new Date(summary.startTime);
      console.log(`\n⏱️ Duration: ${Math.round(duration / 1000)}s`);
    }
  }

  /**
   * Print verification results
   */
  printVerificationResults(verification) {
    if (!verification) return;
    
    console.log(`\n${colors.bright}🔍 VERIFICATION RESULTS:${colors.reset}`);
    console.log('┌─────────────┬───────┬─────┬───────┐');
    console.log('│ Data Type   │ Local │ API │ Match │');
    console.log('├─────────────┼───────┼─────┼───────┤');
    
    Object.entries(verification).forEach(([type, data]) => {
      const matchIcon = data.match ? '✅' : '❌';
      console.log(`│ ${this.pad(type, 11)} │ ${this.pad(data.local, 5)} │ ${this.pad(data.api, 3)} │ ${matchIcon}     │`);
    });
    
    console.log('└─────────────┴───────┴─────┴───────┘');
  }

  /**
   * Utility functions
   */
  pad(str, length) {
    return String(str).padStart(length, ' ');
  }

  async confirm(message) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`${colors.yellow}❓ ${message} (y/N): ${colors.reset}`, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  info(message) {
    console.log(`${colors.blue}ℹ️ ${message}${colors.reset}`);
  }

  success(message) {
    console.log(`${colors.green}${message}${colors.reset}`);
  }

  warn(message) {
    console.log(`${colors.yellow}⚠️ ${message}${colors.reset}`);
  }

  error(message) {
    console.log(`${colors.red}❌ ${message}${colors.reset}`);
  }
}

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new MigrationCLI();
  cli.run().catch((error) => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

export default MigrationCLI;