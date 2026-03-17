export {
  getAvailableTemplates,
  getSelectableModules,
  resolveTemplatePath,
  expandWithBundled,
  copyModule,
  copyMdFile,
  saveTemplateSelection,
  readTemplateSelection,
  detectTemplateForModules,
  FRAMEWORK_PATH,
  DEFAULT_TEMPLATE,
  TEMPLATE_METADATA_FILE,
} from './services/installer.js';
export { downloadFramework, cleanupTempDir, downloadWithSpinner } from './services/github-sync.js';
export { detectIDE } from './services/detector.js';
export { ALWAYS_INSTALL, BUNDLED, DESCRIPTIONS, GITHUB_CONFIG, TEMPLATE_DESCRIPTIONS } from './config/constants.js';
export { IDE_MD_MAP, AVAILABLE_MD_FILES } from './config/ide-mapping.js';
export {
  initProject,
  createChange,
  listChanges,
  getChangeStatus,
  getGlobalStatus,
  getArtifactInstructions,
  getApplyInstructions,
  archiveChange,
  listSchemas,
  validateChange,
  loadSchema,
  readProjectConfig,
  isInitialized,
} from './services/spec-engine.js';

// Memory System Exports
export {
  // Database
  initDatabase,
  getDatabase,
  closeDatabase,
  isDatabaseInitialized,
  
  // Core Engine
  saveMemory,
  searchMemories,
  getContext,
  getTimeline,
  getMemory,
  updateMemory,
  deleteMemory,
  startSession,
  endSession,
  getStats,
  findPatterns,
  getConnections,
  anticipateNeeds,
  exportMemories,
  importMemories,
  pruneMemories,
  
  // Auto-save
  AutoSaveManager,
  createAutoSaveHook,
  WorkflowHooks,
  
  // Utils
  redactPrivateContent,
  extractKeywords,
  textSimilarity,
  truncate,
  isCodeContent,
  detectLanguage,
  generateSummary,
  sanitizeFTSQuery,
  
  // Constants
  MEMORY_TYPES,
  IMPORTANCE_LEVELS
} from './memory/index.js';
