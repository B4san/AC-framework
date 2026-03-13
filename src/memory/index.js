/**
 * memory/index.js — API pública del sistema de memoria autónoma
 * 
 * Sistema de persistencia de conocimiento para agentes AI.
 * Guarda automáticamente decisiones, patrones, bugfixes y insights.
 */

// Database
export { initDatabase, getDatabase, closeDatabase, isDatabaseInitialized } from './database.js';

// Core Engine
export {
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
  pruneMemories
} from './engine.js';

// Utils
export {
  redactPrivateContent,
  extractKeywords,
  textSimilarity,
  truncate,
  isCodeContent,
  detectLanguage,
  generateSummary,
  sanitizeFTSQuery
} from './utils.js';

// Auto-save system
export { createAutoSaveHook, AutoSaveManager } from './autosave.js';

// Tipos de memoria válidos para referencia
export const MEMORY_TYPES = [
  'architectural_decision',
  'bugfix_pattern',
  'api_pattern',
  'performance_insight',
  'security_fix',
  'refactor_technique',
  'dependency_note',
  'workaround',
  'convention',
  'context_boundary',
  'general_insight',
  'session_summary'
];

export const IMPORTANCE_LEVELS = ['critical', 'high', 'medium', 'low'];
