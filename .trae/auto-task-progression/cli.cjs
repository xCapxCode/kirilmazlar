#!/usr/bin/env node

// Simple CLI for auto-task-progression
const path = require('path');
const fs = require('fs');

// Get GitHub folder path
const projectRoot = process.cwd();
const githubPath = path.join(projectRoot, '.github');
const autoTaskPath = path.join(githubPath, 'auto-task-progression');

const args = process.argv.slice(2);
const command = args[0];

function getMemoryFiles() {
  const instructionsPath = path.join(githubPath, 'instructions');
  const memoryFile = path.join(instructionsPath, 'proje-memories.md');
  const taskFile = path.join(instructionsPath, 'sistem-gorev-listesi.md');
  
  return { memoryFile, taskFile };
}

function readLastLines(filePath, lineCount = 10) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    return lines.slice(-lineCount).join('\n');
  } catch (error) {
    return `Error reading ${filePath}: ${error.message}`;
  }
}

function getSystemStatus() {
  const { memoryFile, taskFile } = getMemoryFiles();
  
  console.log('🤖 AUTO-TASK PROGRESSION SYSTEM STATUS\n');
  console.log('📍 Project Root:', projectRoot);
  console.log('📁 GitHub Path:', githubPath);
  console.log('⚙️ Auto-Task Path:', autoTaskPath);
  
  console.log('\n📊 System Health:');
  console.log('✅ Auto-Task System:', fs.existsSync(autoTaskPath) ? 'ACTIVE' : 'INACTIVE');
  console.log('✅ Memory System:', fs.existsSync(memoryFile) ? 'ACTIVE' : 'INACTIVE');
  console.log('✅ Task System:', fs.existsSync(taskFile) ? 'ACTIVE' : 'INACTIVE');
  
  console.log('\n🧠 Memory Status:');
  if (fs.existsSync(memoryFile)) {
    const stats = fs.statSync(memoryFile);
    console.log('📝 Last Modified:', stats.mtime.toLocaleString());
    console.log('📏 File Size:', Math.round(stats.size / 1024) + ' KB');
  }
}

function showRecentMemory() {
  const { memoryFile } = getMemoryFiles();
  
  console.log('🧠 RECENT MEMORY LOG\n');
  if (fs.existsSync(memoryFile)) {
    console.log(readLastLines(memoryFile, 20));
  } else {
    console.log('❌ Memory file not found:', memoryFile);
  }
}

function showRecentTasks() {
  const { taskFile } = getMemoryFiles();
  
  console.log('📋 RECENT TASKS\n');
  if (fs.existsSync(taskFile)) {
    console.log(readLastLines(taskFile, 15));
  } else {
    console.log('❌ Task file not found:', taskFile);
  }
}

function addMemoryLog(message) {
  const { memoryFile } = getMemoryFiles();
  const timestamp = new Date().toLocaleString();
  const logEntry = `\n**${timestamp}**: ${message}\n`;
  
  try {
    fs.appendFileSync(memoryFile, logEntry);
    console.log('✅ Memory log added successfully');
  } catch (error) {
    console.log('❌ Error adding memory log:', error.message);
  }
}

// Main CLI logic
switch(command) {
  case 'status':
    getSystemStatus();
    break;
    
  case 'memory':
    showRecentMemory();
    break;
    
  case 'tasks':
    showRecentTasks();
    break;
    
  case 'log':
    const message = args.slice(1).join(' ');
    if (message) {
      addMemoryLog(message);
    } else {
      console.log('❌ Please provide a message to log');
    }
    break;
    
  default:
    console.log(`
🤖 AUTO-TASK PROGRESSION CLI

Kullanım:
  node cli.js status    - Sistem durumunu göster
  node cli.js memory    - Son hafıza loglarını göster
  node cli.js tasks     - Son görevleri göster
  node cli.js log "msg" - Hafızaya log ekle

Örnekler:
  node cli.js status
  node cli.js memory
  node cli.js log "Kritik bug çözüldü"
    `);
}
