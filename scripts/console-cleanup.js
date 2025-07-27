/**
 * CONSOLE CLEANUP AUTOMATION SCRIPT
 * Tüm console.log'ları production logger ile değiştirir
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Console.log patterns to replace
const replacements = [
  // Success messages
  {
    pattern: /console\.log\(`✅([^`]+)`([^)]*)\);/g,
    replacement: "logger.success('$1'$2);"
  },
  {
    pattern: /console\.log\('✅([^']+)'([^)]*)\);/g,
    replacement: "logger.success('$1'$2);"
  },

  // Error messages  
  {
    pattern: /console\.error\(`❌([^`]+)`([^)]*)\);/g,
    replacement: "logger.error('$1'$2);"
  },
  {
    pattern: /console\.error\('❌([^']+)'([^)]*)\);/g,
    replacement: "logger.error('$1'$2);"
  },
  {
    pattern: /console\.error\(`([^`]+)`([^)]*)\);/g,
    replacement: "logger.error('$1'$2);"
  },
  {
    pattern: /console\.error\('([^']+)'([^)]*)\);/g,
    replacement: "logger.error('$1'$2);"
  },

  // Info messages
  {
    pattern: /console\.log\(`🔄([^`]+)`([^)]*)\);/g,
    replacement: "logger.info('$1'$2);"
  },
  {
    pattern: /console\.log\('🔄([^']+)'([^)]*)\);/g,
    replacement: "logger.info('$1'$2);"
  },
  {
    pattern: /console\.log\(`📊([^`]+)`([^)]*)\);/g,
    replacement: "logger.info('$1'$2);"
  },
  {
    pattern: /console\.log\('📊([^']+)'([^)]*)\);/g,
    replacement: "logger.info('$1'$2);"
  },
  {
    pattern: /console\.log\(`📦([^`]+)`([^)]*)\);/g,
    replacement: "logger.info('$1'$2);"
  },
  {
    pattern: /console\.log\('📦([^']+)'([^)]*)\);/g,
    replacement: "logger.info('$1'$2);"
  },

  // Debug messages
  {
    pattern: /console\.log\(`🔍([^`]+)`([^)]*)\);/g,
    replacement: "logger.debug('$1'$2);"
  },
  {
    pattern: /console\.log\('🔍([^']+)'([^)]*)\);/g,
    replacement: "logger.debug('$1'$2);"
  },

  // System messages  
  {
    pattern: /console\.log\(`🛡️([^`]+)`([^)]*)\);/g,
    replacement: "logger.system('storage', '$1'$2);"
  },
  {
    pattern: /console\.log\('🛡️([^']+)'([^)]*)\);/g,
    replacement: "logger.system('storage', '$1'$2);"
  },

  // Generic console.log
  {
    pattern: /console\.log\(([^)]+)\);/g,
    replacement: "logger.info($1);"
  },

  // Generic console.debug
  {
    pattern: /console\.debug\(([^)]+)\);/g,
    replacement: "logger.debug($1);"
  }
];

// Import pattern to add logger
const loggerImportPattern = /import logger from '@utils\/productionLogger';/;

function addLoggerImport(content, filePath) {
  // Skip if already has logger import
  if (loggerImportPattern.test(content)) {
    return content;
  }

  // Skip if it's the logger file itself
  if (filePath.includes('productionLogger.js')) {
    return content;
  }

  // Find storage import and add logger import after it
  const storageImportMatch = content.match(/import storage from '@core\/storage';/);
  if (storageImportMatch) {
    return content.replace(
      /import storage from '@core\/storage';/,
      "import storage from '@core/storage';\nimport logger from '@utils/productionLogger';"
    );
  }

  // If no storage import, add at top after other imports
  const firstImportMatch = content.match(/^import [^;]+;/m);
  if (firstImportMatch) {
    const firstImport = firstImportMatch[0];
    return content.replace(
      firstImport,
      firstImport + "\nimport logger from '@utils/productionLogger';"
    );
  }

  return content;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasConsoleStatements = false;

    // Check if file has console statements
    if (content.includes('console.log') || content.includes('console.error') || content.includes('console.debug')) {
      hasConsoleStatements = true;
    }

    if (!hasConsoleStatements) {
      return false; // No changes needed
    }

    // Add logger import if needed
    content = addLoggerImport(content, filePath);

    // Apply all replacements
    replacements.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });

    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');

    return true; // File was modified
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dir, extension = '.js') {
  const files = [];

  function scan(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (item.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning ${currentDir}:`, error.message);
    }
  }

  scan(dir);
  return files;
}

// Main execution
function main() {
  const srcDir = path.join(__dirname, '../src');
  const jsFiles = scanDirectory(srcDir, '.js');
  const jsxFiles = scanDirectory(srcDir, '.jsx');

  const allFiles = [...jsFiles, ...jsxFiles];
  let modifiedCount = 0;

  console.log(`Found ${allFiles.length} files to process...`);

  allFiles.forEach(filePath => {
    const relativePath = path.relative(srcDir, filePath);

    if (processFile(filePath)) {
      console.log(`✅ Modified: ${relativePath}`);
      modifiedCount++;
    }
  });

  console.log(`\n🎉 Console cleanup completed!`);
  console.log(`📊 Modified ${modifiedCount} files out of ${allFiles.length} total files`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, processFile, scanDirectory };

