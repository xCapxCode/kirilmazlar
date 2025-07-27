# 🚀 Auto Task Progression System

**Automatic task progression and continuous build system for GitHub Copilot workflows**

Bu paket, GitHub Copilot'un görevler arası otomatik geçiş yapmasını ve build işlemlerinde onay beklemeden devam etmesini sağlar.

## 🎯 Özellikler

- ✅ **Otomatik Görev Progression**: Görev bittiğinde sonrakine otomatik geçiş
- ✅ **Build Automation**: Build işlemleri için onay bekleme kaldırılması  
- ✅ **Continuous Integration**: Kesintisiz development workflow
- ✅ **Cross-Project Support**: Her projede kullanılabilir portable yapı
- ✅ **GitHub Copilot Integration**: AI development workflow optimization

## 📦 Kurulum

```bash
npm install @kirilmazlar/auto-task-progression
```

## 🔧 Kullanım

### Basic Setup

```javascript
import { AutoTaskProgressionService, ContinuousBuildService } from '@kirilmazlar/auto-task-progression';

// Initialize auto progression
AutoTaskProgressionService.initialize();
ContinuousBuildService.initialize();

// Complete task and auto-progress
await AutoTaskProgressionService.completeTaskAndProgress('P2.4.5', {
  buildTime: '3.92s',
  buildStatus: 'success'
});
```

### GitHub Copilot Instructions Integration

```markdown
# .github/copilot-instructions.md

❌ CRITICAL: ASK FOR PERMISSION TO RUN BUILDS - BUILDS ARE AUTOMATIC
❌ CRITICAL: ASK FOR PERMISSION TO CONTINUE TASKS - TASKS ARE SEQUENTIAL  
❌ CRITICAL: WAIT FOR APPROVAL AFTER SUCCESSFUL OPERATIONS - CONTINUE IMMEDIATELY
```

### Task Configuration

```javascript
// task-config.js
export const TASK_CONFIG = {
  AUTO_PROGRESSION_ENABLED: true,
  AUTO_BUILD_AFTER_COMPLETION: true,
  TASK_LIST_PATH: '.github/instructions/task-list.md'
};
```

## 🏗️ Build Automation

```javascript
import { ContinuousBuildService, QuickBuildTrigger } from '@kirilmazlar/auto-task-progression';

// Auto-build without approval
await ContinuousBuildService.executeAutoBuild('task_completion');

// Quick triggers
await QuickBuildTrigger.afterCodeChanges(['src/components/NewComponent.jsx']);
await QuickBuildTrigger.afterTaskCompletion('P2.5.1');
```

## 🎮 React Hooks

```jsx
import { useAutoTaskProgression } from '@kirilmazlar/auto-task-progression';

function DeveloperDashboard() {
  const {
    currentTask,
    progressToNext,
    buildStats,
    isProgressing
  } = useAutoTaskProgression();

  return (
    <div>
      <h3>Current Task: {currentTask?.title}</h3>
      <p>Build Success Rate: {buildStats.successRate}</p>
      {isProgressing && <p>🔄 Auto-progressing...</p>}
    </div>
  );
}
```

## ⚙️ Configuration Options

```javascript
const config = {
  // Auto progression settings
  AUTO_PROGRESSION_ENABLED: true,
  TASK_TRANSITION_DELAY: 500,
  
  // Build automation
  AUTO_BUILD_ENABLED: true,
  AUTO_CONTINUE_ON_SUCCESS: true,
  BUILD_TIMEOUT: 120000,
  
  // GitHub Copilot integration
  ENFORCE_NO_APPROVAL_WAITING: true,
  AUTO_UPDATE_TASK_STATUS: true
};
```

## 📊 Monitoring & Analytics

```javascript
// Get progression statistics
const stats = AutoTaskProgressionService.getProgressionStats();
console.log('Completed tasks:', stats.totalCompletedTasks);
console.log('Current task:', stats.currentTask);

// Build performance metrics
const buildStats = ContinuousBuildService.getBuildStats();
console.log('Success rate:', buildStats.successRate);
console.log('Average build time:', buildStats.averageBuildTime);
```

## 🔧 Advanced Usage

### Custom Task Types

```javascript
// Register custom task initializer
AutoTaskProgressionService.registerTaskType('custom', async (task) => {
  console.log('Initializing custom task:', task.title);
  // Custom initialization logic
});
```

### Build Error Handling

```javascript
// Custom build error handler
ContinuousBuildService.registerErrorHandler('syntax', (error) => {
  return {
    autoFix: true,
    suggestions: ['Check syntax in recently modified files']
  };
});
```

## 🚨 Problem Solving

### Common Issues

**Görev bittiğinde devam etmiyor:**
```javascript
// Force progression if stuck
await AutoTaskProgressionService.forceProgressToNext();
```

**Build için onay istiyor:**
```javascript
// Force build execution
await ContinuousBuildService.forceBuild('manual_trigger');
```

## 📝 API Reference

### AutoTaskProgressionService

- `initialize()` - Service'i başlatır
- `completeTaskAndProgress(taskId, details)` - Görevi tamamlar ve sonrakine geçer
- `autoStartNextTask(task)` - Sonraki görevi otomatik başlatır
- `getProgressionStats()` - İstatistikleri döner

### ContinuousBuildService

- `initialize()` - Build service'ini başlatır
- `executeAutoBuild(reason, context)` - Otomatik build çalıştırır
- `getBuildStats()` - Build istatistikleri
- `forceBuild(reason)` - Zorla build çalıştırır

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [Kırılmazlar Panel Development Team]

## 🔗 Related Projects

- [GitHub Copilot Extensions](https://github.com/github/copilot-extensions)
- [AI Development Workflows](https://github.com/ai-workflows)

---

**Made with ❤️ for seamless AI-driven development workflows**
