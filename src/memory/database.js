/**
 * database.js — SQLite + FTS5 para sistema de memoria autónoma
 * 
 * Base de datos embebida sin dependencias externas de runtime.
 * Usa better-sqlite3 para sincronía y mejor performance.
 */

import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

// Configuración
const ACFM_DIR = join(homedir(), '.acfm');
const DB_PATH = process.env.ACFM_MEMORY_DB || join(ACFM_DIR, 'memory.db');

// Singleton de conexión
let dbInstance = null;

/**
 * Schema SQL completo
 */
const SCHEMA_SQL = `
-- Tabla principal de memorias
CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_key TEXT UNIQUE,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    project_path TEXT,
    change_name TEXT,
    session_id TEXT,
    confidence REAL DEFAULT 0.5,
    importance TEXT DEFAULT 'medium',
    tags TEXT,
    related_to TEXT,
    replaces INTEGER,
    shareable INTEGER DEFAULT 1,
    author TEXT,
    code_snippet TEXT,
    error_message TEXT,
    solution TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed DATETIME,
    access_count INTEGER DEFAULT 0,
    revision_count INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0
);

-- Full-Text Search virtual table
CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
    content,
    content='memories',
    content_rowid='id'
);

-- Tabla de sesiones
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    project_path TEXT,
    change_name TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    summary TEXT
);

-- Log de accesos para analytics
CREATE TABLE IF NOT EXISTS memory_access_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memory_id INTEGER,
    session_id TEXT,
    access_type TEXT,
    accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_memories_project ON memories(project_path);
CREATE INDEX IF NOT EXISTS idx_memories_change ON memories(change_name);
CREATE INDEX IF NOT EXISTS idx_memories_session ON memories(session_id);
CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at);
CREATE INDEX IF NOT EXISTS idx_memories_topic ON memories(topic_key);
CREATE INDEX IF NOT EXISTS idx_memories_deleted ON memories(is_deleted);

-- Triggers para mantener FTS sincronizado
CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
    INSERT INTO memories_fts(rowid, content) VALUES (new.id, new.content);
END;

CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
    INSERT INTO memories_fts(memories_fts, rowid, content) VALUES ('delete', old.id, old.content);
END;

CREATE TRIGGER IF NOT EXISTS memories_au AFTER UPDATE ON memories BEGIN
    INSERT INTO memories_fts(memories_fts, rowid, content) VALUES ('delete', old.id, old.content);
    INSERT INTO memories_fts(rowid, content) VALUES (new.id, new.content);
END;

-- Trigger para actualizar updated_at
CREATE TRIGGER IF NOT EXISTS memories_update_trigger 
AFTER UPDATE ON memories BEGIN
    UPDATE memories SET updated_at = CURRENT_TIMESTAMP WHERE id = new.id;
END;
`;

/**
 * Inicializa la base de datos
 */
export function initDatabase() {
  if (dbInstance) return dbInstance;

  // Asegurar que el directorio existe
  if (!existsSync(ACFM_DIR)) {
    mkdirSync(ACFM_DIR, { recursive: true });
  }

  // Crear conexión
  dbInstance = new Database(DB_PATH);
  
  // Optimizaciones de performance
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('synchronous = NORMAL');
  dbInstance.pragma('cache_size = -64000'); // 64MB cache
  dbInstance.pragma('temp_store = memory');
  
  // Crear schema
  dbInstance.exec(SCHEMA_SQL);
  
  return dbInstance;
}

/**
 * Obtiene instancia de la base de datos (inicializada)
 */
export function getDatabase() {
  if (!dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}

/**
 * Cierra la conexión a la base de datos
 */
export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Verifica si la base de datos está inicializada
 */
export function isDatabaseInitialized() {
  try {
    const db = getDatabase();
    const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='memories'").get();
    return !!result;
  } catch {
    return false;
  }
}

/**
 * Reset completo (para testing)
 */
export function resetDatabase() {
  closeDatabase();
  try {
    const { unlinkSync } = require('node:fs');
    unlinkSync(DB_PATH);
  } catch {
    // No existe, ignorar
  }
  return initDatabase();
}
