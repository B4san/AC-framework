/**
 * engine.js — Motor de memoria autónoma
 * 
 * CRUD operations, búsqueda FTS5, análisis de patrones,
 * grafo de relaciones, y sistema de confianza.
 */

import { getDatabase } from './database.js';
import { randomUUID } from 'node:crypto';
import { redactPrivateContent } from './utils.js';

// Tipos de memoria válidos
const VALID_TYPES = [
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

const VALID_IMPORTANCE = ['critical', 'high', 'medium', 'low'];

/**
 * Guarda una nueva memoria (con upsert por topic_key)
 */
export function saveMemory(data) {
  const db = getDatabase();
  
  // Redactar contenido privado
  const content = redactPrivateContent(data.content);
  const codeSnippet = data.codeSnippet ? redactPrivateContent(data.codeSnippet) : null;
  const solution = data.solution ? redactPrivateContent(data.solution) : null;
  const errorMessage = data.errorMessage ? redactPrivateContent(data.errorMessage) : null;
  
  // Validar tipo
  const type = VALID_TYPES.includes(data.type) ? data.type : 'general_insight';
  
  // Calcular confianza si no se proporciona
  const confidence = data.confidence ?? calculateConfidence(content, data);
  
  // Determinar importancia
  const importance = data.importance ?? determineImportance(type, confidence);
  
  // Generar topic_key si no existe
  const topicKey = data.topicKey || generateTopicKey(content);
  
  // Verificar si existe para upsert
  const existing = db.prepare('SELECT id, revision_count FROM memories WHERE topic_key = ?').get(topicKey);
  
  if (existing) {
    // Update (upsert)
    const stmt = db.prepare(`
      UPDATE memories SET
        type = ?,
        content = ?,
        project_path = ?,
        change_name = ?,
        session_id = ?,
        confidence = ?,
        importance = ?,
        tags = ?,
        related_to = ?,
        shareable = ?,
        author = ?,
        code_snippet = ?,
        error_message = ?,
        solution = ?,
        revision_count = ?,
        is_deleted = 0
      WHERE id = ?
    `);
    
    stmt.run(
      type,
      content,
      data.projectPath || null,
      data.changeName || null,
      data.sessionId || null,
      confidence,
      importance,
      data.tags ? JSON.stringify(data.tags) : null,
      data.relatedTo ? JSON.stringify(data.relatedTo) : null,
      data.shareable !== false ? 1 : 0,
      data.author || 'unknown',
      codeSnippet,
      errorMessage,
      solution,
      existing.revision_count + 1,
      existing.id
    );
    
    return { id: existing.id, operation: 'updated', revisionCount: existing.revision_count + 1 };
  } else {
    // Insert nuevo
    const stmt = db.prepare(`
      INSERT INTO memories (
        topic_key, type, content, project_path, change_name, session_id,
        confidence, importance, tags, related_to, shareable, author,
        code_snippet, error_message, solution
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      topicKey,
      type,
      content,
      data.projectPath || null,
      data.changeName || null,
      data.sessionId || null,
      confidence,
      importance,
      data.tags ? JSON.stringify(data.tags) : null,
      data.relatedTo ? JSON.stringify(data.relatedTo) : null,
      data.shareable !== false ? 1 : 0,
      data.author || 'unknown',
      codeSnippet,
      errorMessage,
      solution
    );
    
    return { id: result.lastInsertRowid, operation: 'created', revisionCount: 0 };
  }
}

/**
 * Busca memorias usando FTS5
 */
export function searchMemories(query, options = {}) {
  const db = getDatabase();
  
  const {
    limit = 10,
    offset = 0,
    type = null,
    projectPath = null,
    changeName = null,
    importance = null,
    since = null, // fecha ISO
    tags = null, // array
    minConfidence = 0
  } = options;
  
  let sql = `
    SELECT m.* FROM memories m
    JOIN memories_fts fts ON m.id = fts.rowid
    WHERE m.is_deleted = 0
      AND fts.memories_fts MATCH ?
      AND m.confidence >= ?
  `;
  
  const params = [query, minConfidence];
  
  if (type) {
    sql += ' AND m.type = ?';
    params.push(type);
  }
  
  if (projectPath) {
    sql += ' AND m.project_path = ?';
    params.push(projectPath);
  }
  
  if (changeName) {
    sql += ' AND m.change_name = ?';
    params.push(changeName);
  }
  
  if (importance) {
    sql += ' AND m.importance = ?';
    params.push(importance);
  }
  
  if (since) {
    sql += ' AND m.created_at >= ?';
    params.push(since);
  }
  
  sql += ' ORDER BY m.confidence DESC, m.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);
  
  // Marcar acceso
  rows.forEach(row => {
    recordAccess(row.id, options.sessionId, 'search');
  });
  
  return rows.map(formatMemory);
}

/**
 * Obtiene contexto relevante para el proyecto/change actual
 */
export function getContext(options = {}) {
  const db = getDatabase();
  
  const {
    projectPath = null,
    changeName = null,
    currentTask = null, // para búsqueda semántica simple
    limit = 5,
    lookbackDays = 30,
    sessionId = null
  } = options;
  
  // Calcular fecha de corte
  const since = new Date();
  since.setDate(since.getDate() - lookbackDays);
  const sinceStr = since.toISOString();
  
  let sql = `
    SELECT m.* FROM memories m
    WHERE m.is_deleted = 0
      AND m.created_at >= ?
      AND m.importance IN ('critical', 'high')
  `;
  
  const params = [sinceStr];
  
  // Priorizar memorias del mismo proyecto
  if (projectPath) {
    sql += ' AND (m.project_path = ? OR m.shareable = 1)';
    params.push(projectPath);
  }
  
  // Si hay change específico, incluirlo
  if (changeName) {
    sql += ' AND (m.change_name = ? OR m.change_name IS NULL)';
    params.push(changeName);
  }
  
  sql += ` ORDER BY 
    CASE WHEN m.project_path = ? THEN 2 ELSE 1 END DESC,
    m.access_count DESC,
    m.created_at DESC
    LIMIT ?`;
  
  params.push(projectPath || '', limit);
  
  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);
  
  rows.forEach(row => {
    recordAccess(row.id, sessionId, 'context');
  });
  
  return rows.map(formatMemory);
}

/**
 * Obtiene timeline cronológico alrededor de una memoria
 */
export function getTimeline(memoryId, options = {}) {
  const db = getDatabase();
  
  const { window = 5, projectPath = null } = options;
  
  // Obtener la memoria base
  const base = db.prepare('SELECT * FROM memories WHERE id = ?').get(memoryId);
  if (!base) return null;
  
  // Memorias anteriores
  const beforeStmt = db.prepare(`
    SELECT * FROM memories
    WHERE is_deleted = 0 
      AND created_at < ?
      ${projectPath ? 'AND (project_path = ? OR shareable = 1)' : ''}
    ORDER BY created_at DESC
    LIMIT ?
  `);
  
  const beforeParams = projectPath ? [base.created_at, projectPath, window] : [base.created_at, window];
  const before = beforeStmt.all(...beforeParams).reverse();
  
  // Memorias posteriores
  const afterStmt = db.prepare(`
    SELECT * FROM memories
    WHERE is_deleted = 0 
      AND created_at > ?
      ${projectPath ? 'AND (project_path = ? OR shareable = 1)' : ''}
    ORDER BY created_at ASC
    LIMIT ?
  `);
  
  const afterParams = projectPath ? [base.created_at, projectPath, window] : [base.created_at, window];
  const after = afterStmt.all(...afterParams);
  
  return {
    base: formatMemory(base),
    before: before.map(formatMemory),
    after: after.map(formatMemory)
  };
}

/**
 * Obtiene una memoria específica por ID
 */
export function getMemory(id, sessionId = null) {
  const db = getDatabase();
  
  const row = db.prepare('SELECT * FROM memories WHERE id = ? AND is_deleted = 0').get(id);
  if (!row) return null;
  
  recordAccess(id, sessionId, 'get');
  return formatMemory(row);
}

/**
 * Actualiza una memoria existente
 */
export function updateMemory(id, updates) {
  const db = getDatabase();
  
  const allowedFields = ['type', 'content', 'tags', 'importance', 'shareable', 'relatedTo'];
  const setParts = [];
  const params = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (!allowedFields.includes(key)) continue;
    
    const dbKey = key === 'relatedTo' ? 'related_to' : key;
    
    if (key === 'content') {
      setParts.push(`${dbKey} = ?`);
      params.push(redactPrivateContent(value));
    } else if (key === 'tags' || key === 'relatedTo') {
      setParts.push(`${dbKey} = ?`);
      params.push(JSON.stringify(value));
    } else {
      setParts.push(`${dbKey} = ?`);
      params.push(value);
    }
  }
  
  if (setParts.length === 0) return null;
  
  params.push(id);
  
  const stmt = db.prepare(`UPDATE memories SET ${setParts.join(', ')} WHERE id = ?`);
  const result = stmt.run(...params);
  
  return result.changes > 0 ? getMemory(id) : null;
}

/**
 * Soft-delete de una memoria
 */
export function deleteMemory(id) {
  const db = getDatabase();
  
  const stmt = db.prepare('UPDATE memories SET is_deleted = 1 WHERE id = ?');
  const result = stmt.run(id);
  
  return result.changes > 0;
}

/**
 * Gestión de sesiones
 */
export function startSession(projectPath = null, changeName = null) {
  const db = getDatabase();
  const sessionId = randomUUID();
  
  const stmt = db.prepare('INSERT INTO sessions (id, project_path, change_name) VALUES (?, ?, ?)');
  stmt.run(sessionId, projectPath, changeName);
  
  return sessionId;
}

export function endSession(sessionId, summary = null) {
  const db = getDatabase();
  
  const stmt = db.prepare('UPDATE sessions SET ended_at = CURRENT_TIMESTAMP, summary = ? WHERE id = ?');
  stmt.run(summary, sessionId);
  
  // Si hay summary, guardarlo como memoria
  if (summary) {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    if (session) {
      saveMemory({
        type: 'session_summary',
        content: summary,
        projectPath: session.project_path,
        changeName: session.change_name,
        sessionId,
        author: 'system'
      });
    }
  }
  
  return true;
}

/**
 * Estadísticas del sistema de memoria
 */
export function getStats(options = {}) {
  const db = getDatabase();
  const { projectPath = null, since = null } = options;
  
  let whereClause = 'WHERE is_deleted = 0';
  const params = [];
  
  if (projectPath) {
    whereClause += ' AND project_path = ?';
    params.push(projectPath);
  }
  
  if (since) {
    whereClause += ' AND created_at >= ?';
    params.push(since);
  }
  
  // Totales
  const totalStmt = db.prepare(`SELECT COUNT(*) as count FROM memories ${whereClause}`);
  const total = totalStmt.get(...params).count;
  
  // Por tipo
  const byTypeStmt = db.prepare(`
    SELECT type, COUNT(*) as count FROM memories 
    ${whereClause} 
    GROUP BY type ORDER BY count DESC
  `);
  const byType = byTypeStmt.all(...params);
  
  // Por importancia
  const byImportanceStmt = db.prepare(`
    SELECT importance, COUNT(*) as count FROM memories 
    ${whereClause} 
    GROUP BY importance ORDER BY count DESC
  `);
  const byImportance = byImportanceStmt.all(...params);
  
  // Más accedidas
  const mostAccessedStmt = db.prepare(`
    SELECT id, content, access_count FROM memories 
    ${whereClause} 
    ORDER BY access_count DESC LIMIT 5
  `);
  const mostAccessed = mostAccessedStmt.all(...params);
  
  // Patrones de error comunes
  const commonErrorsStmt = db.prepare(`
    SELECT error_message, COUNT(*) as count FROM memories 
    ${whereClause} AND error_message IS NOT NULL
    GROUP BY error_message ORDER BY count DESC LIMIT 5
  `);
  const commonErrors = commonErrorsStmt.all(...params);
  
  return {
    total,
    byType,
    byImportance,
    mostAccessed: mostAccessed.map(m => ({ id: m.id, preview: m.content.slice(0, 100), accessCount: m.access_count })),
    commonErrors: commonErrors.map(e => ({ error: e.error_message, count: e.count }))
  };
}

/**
 * Encuentra patrones y clusters
 */
export function findPatterns(options = {}) {
  const db = getDatabase();
  const { type = null, minFrequency = 2 } = options;
  
  // Buscar topic_keys similares (simple string similarity)
  let sql = `
    SELECT topic_key, type, COUNT(*) as frequency, 
           GROUP_CONCAT(id) as memory_ids,
           MAX(created_at) as last_seen
    FROM memories 
    WHERE is_deleted = 0
  `;
  
  const params = [];
  
  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }
  
  sql += ' GROUP BY topic_key HAVING frequency >= ? ORDER BY frequency DESC';
  params.push(minFrequency);
  
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

/**
 * Grafo de relaciones entre memorias
 */
export function getConnections(memoryId, depth = 1) {
  const db = getDatabase();
  
  const visited = new Set();
  const connections = [];
  const queue = [{ id: memoryId, d: 0 }];
  
  while (queue.length > 0) {
    const { id, d } = queue.shift();
    if (visited.has(id) || d > depth) continue;
    visited.add(id);
    
    const memory = db.prepare('SELECT id, content, related_to FROM memories WHERE id = ? AND is_deleted = 0').get(id);
    if (!memory) continue;
    
    const related = memory.related_to ? JSON.parse(memory.related_to) : [];
    
    for (const relatedId of related) {
      if (!visited.has(relatedId)) {
        connections.push({ from: id, to: relatedId, depth: d + 1 });
        queue.push({ id: relatedId, d: d + 1 });
      }
    }
  }
  
  return connections;
}

/**
 * Sugerencias predictivas
 */
export function anticipateNeeds(currentTask, projectPath = null) {
  const db = getDatabase();
  
  // Extraer palabras clave simples
  const keywords = currentTask.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  if (keywords.length === 0) return [];
  
  // Construir query FTS
  const query = keywords.join(' OR ');
  
  return searchMemories(query, {
    projectPath,
    limit: 5,
    importance: 'high',
    minConfidence: 0.7
  });
}

// ==================== HELPERS ====================

function formatMemory(row) {
  return {
    id: row.id,
    topicKey: row.topic_key,
    type: row.type,
    content: row.content,
    projectPath: row.project_path,
    changeName: row.change_name,
    sessionId: row.session_id,
    confidence: row.confidence,
    importance: row.importance,
    tags: row.tags ? JSON.parse(row.tags) : [],
    relatedTo: row.related_to ? JSON.parse(row.related_to) : [],
    shareable: row.shareable === 1,
    author: row.author,
    codeSnippet: row.code_snippet,
    errorMessage: row.error_message,
    solution: row.solution,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastAccessed: row.last_accessed,
    accessCount: row.access_count,
    revisionCount: row.revision_count
  };
}

function recordAccess(memoryId, sessionId, accessType) {
  const db = getDatabase();
  
  // Log del acceso
  const logStmt = db.prepare('INSERT INTO memory_access_log (memory_id, session_id, access_type) VALUES (?, ?, ?)');
  logStmt.run(memoryId, sessionId, accessType);
  
  // Actualizar contador
  const updateStmt = db.prepare('UPDATE memories SET access_count = access_count + 1, last_accessed = CURRENT_TIMESTAMP WHERE id = ?');
  updateStmt.run(memoryId);
}

function calculateConfidence(content, data) {
  let score = 0.5;
  
  // Palabras clave de decisión
  if (/decidimos|elegimos|optamos|mejor usar|recomendado|evitar/i.test(content)) score += 0.2;
  
  // Contiene solución
  if (data.solution || /solución|fix|resuelve/i.test(content)) score += 0.15;
  
  // Contiene error
  if (data.errorMessage || /error|bug|issue|problema/i.test(content)) score += 0.1;
  
  // Es arquitectónico
  if (data.type === 'architectural_decision') score += 0.1;
  
  // Tiene código de ejemplo
  if (data.codeSnippet) score += 0.05;
  
  return Math.min(0.95, score);
}

function determineImportance(type, confidence) {
  if (type === 'architectural_decision' || type === 'security_fix') return 'critical';
  if (confidence > 0.8) return 'high';
  if (confidence > 0.6) return 'medium';
  return 'low';
}

function generateTopicKey(content) {
  // Generar key estable a partir del contenido
  const normalized = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 5)
    .join('-');
  
  return normalized || `mem-${Date.now()}`;
}

/**
 * Exporta memorias para sync
 */
export function exportMemories(options = {}) {
  const db = getDatabase();
  const { projectPath = null, shareableOnly = true, since = null } = options;
  
  let sql = 'SELECT * FROM memories WHERE is_deleted = 0';
  const params = [];
  
  if (shareableOnly) {
    sql += ' AND shareable = 1';
  }
  
  if (projectPath) {
    sql += ' AND project_path = ?';
    params.push(projectPath);
  }
  
  if (since) {
    sql += ' AND updated_at >= ?';
    params.push(since);
  }
  
  const stmt = db.prepare(sql);
  return stmt.all(...params).map(formatMemory);
}

/**
 * Importa memorias desde export
 */
export function importMemories(memories, options = {}) {
  const { merge = true } = options;
  
  const results = [];
  
  for (const mem of memories) {
    try {
      const result = saveMemory({
        topicKey: mem.topicKey,
        type: mem.type,
        content: mem.content,
        projectPath: mem.projectPath,
        tags: mem.tags,
        importance: mem.importance,
        shareable: mem.shareable,
        codeSnippet: mem.codeSnippet,
        errorMessage: mem.errorMessage,
        solution: mem.solution
      });
      
      results.push({ success: true, id: result.id, operation: result.operation });
    } catch (err) {
      results.push({ success: false, error: err.message });
    }
  }
  
  return results;
}

/**
 * Limpieza de memorias obsoletas
 */
export function pruneMemories(options = {}) {
  const db = getDatabase();
  const { olderThanDays = 90, lowConfidence = true, unused = true } = options;
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  const cutoffStr = cutoff.toISOString();
  
  let sql = 'UPDATE memories SET is_deleted = 1 WHERE is_deleted = 0';
  const params = [];
  
  const conditions = [];
  
  if (olderThanDays) {
    conditions.push('created_at < ?');
    params.push(cutoffStr);
  }
  
  if (lowConfidence) {
    conditions.push('confidence < 0.4');
  }
  
  if (unused) {
    conditions.push('access_count = 0');
  }
  
  if (conditions.length > 0) {
    sql += ' AND (' + conditions.join(' OR ') + ')';
  }
  
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  
  return { archived: result.changes };
}
