/**
 * autosave.js — Sistema de auto-guardado autónomo
 * 
 * Detecta automáticamente qué información es valiosa
 * y la guarda sin intervención humana.
 */

import { saveMemory, searchMemories } from './engine.js';
import { extractKeywords, isCodeContent, textSimilarity } from './utils.js';

/**
 * Manager de auto-save que se integra con el workflow
 */
export class AutoSaveManager {
  constructor(options = {}) {
    this.sessionId = options.sessionId;
    this.projectPath = options.projectPath;
    this.changeName = options.changeName;
    this.author = options.author || 'ac-agent';
    this.minConfidence = options.minConfidence || 0.5;
    this.enabled = options.enabled !== false;
    
    // Buffer de contexto para análisis
    this.contextBuffer = [];
    this.maxBufferSize = 10;
  }

  /**
   * Evalúa si un contenido debe ser guardado
   */
  shouldSave(content, context = {}) {
    if (!this.enabled) return { shouldSave: false, reason: 'disabled' };
    if (!content || content.length < 20) return { shouldSave: false, reason: 'too_short' };
    
    const score = this.calculateSaveScore(content, context);
    
    return {
      shouldSave: score >= this.minConfidence,
      confidence: score,
      reason: score >= this.minConfidence ? 'valuable_content' : 'low_score'
    };
  }

  /**
   * Calcula qué tan valioso es guardar este contenido
   */
  calculateSaveScore(content, context = {}) {
    let score = 0.5;
    const lowerContent = content.toLowerCase();
    
    // Decisiones explícitas
    if (/decidimos|elegimos|optamos|vamos a usar|mejor usar|recomendamos/i.test(lowerContent)) {
      score += 0.25;
    }
    
    // Soluciones a problemas
    if (/solución|fix|resuelve|solucionado|corregido|arreglado/i.test(lowerContent)) {
      score += 0.2;
    }
    
    // Problemas/evitación
    if (/error|bug|issue|problema|cuidado con|evitar|no usar/i.test(lowerContent)) {
      score += 0.15;
    }
    
    // Optimizaciones
    if (/optimización|mejora|más rápido|performance|lento/i.test(lowerContent)) {
      score += 0.15;
    }
    
    // Arquitectura
    if (/arquitectura|diseño|estructura|pattern|patrón/i.test(lowerContent)) {
      score += 0.2;
    }
    
    // Seguridad
    if (/seguridad|security|vulnerabilidad|auth|autenticación/i.test(lowerContent)) {
      score += 0.25;
    }
    
    // Contiene código valioso
    if (isCodeContent(content) && /ejemplo|example|snippet/i.test(lowerContent)) {
      score += 0.1;
    }
    
    // Contiene workaround
    if (/workaround|temporal|mientras tanto|hack/i.test(lowerContent)) {
      score += 0.15;
    }
    
    // Contexto temporal (más tiempo = más valioso)
    if (context.timeSpent) {
      if (context.timeSpent > 30) score += 0.15;
      else if (context.timeSpent > 10) score += 0.1;
    }
    
    // Viene después de error
    if (context.afterError) score += 0.1;
    
    // Es repetición de intentos
    if (context.attemptCount && context.attemptCount > 2) score += 0.1;
    
    // Penalizaciones
    
    // Muy corto
    if (content.length < 50) score -= 0.2;
    
    // Muy específico (IDs, nombres únicos)
    if (/\b[0-9a-f]{8,}\b/i.test(content)) score -= 0.15; // UUIDs, hashes
    if (/\buser_\d+|id_\d+\b/i.test(content)) score -= 0.1; // IDs específicos
    
    // Solo código sin explicación
    if (isCodeContent(content) && !/[.!?]/.test(content)) score -= 0.1;
    
    // Contiene TODO/FIXME (temporal)
    if (/TODO|FIXME|HACK|XXX/i.test(content)) score -= 0.2;
    
    return Math.max(0, Math.min(0.95, score));
  }

  /**
   * Determina el tipo de memoria basado en contenido
   */
  detectType(content, context = {}) {
    const lower = content.toLowerCase();
    
    if (context.typeHint) return context.typeHint;
    
    if (/bug|error|fix|corregido|arreglado|solucionado/i.test(lower)) {
      if (/seguridad|security|vulnerabilidad/i.test(lower)) return 'security_fix';
      return 'bugfix_pattern';
    }
    
    if (/decidimos|elegimos|optamos|arquitectura|diseño/i.test(lower)) {
      return 'architectural_decision';
    }
    
    if (/refactor|reestructurar|limpiar|simplificar/i.test(lower)) {
      return 'refactor_technique';
    }
    
    if (/performance|lento|rápido|optimización|mejora/i.test(lower)) {
      return 'performance_insight';
    }
    
    if (/api|endpoint|route|controller/i.test(lower)) {
      return 'api_pattern';
    }
    
    if (/dependencia|package|librería|npm|install/i.test(lower)) {
      return 'dependency_note';
    }
    
    if (/workaround|temporal|mientras tanto/i.test(lower)) {
      return 'workaround';
    }
    
    if (/convención|estilo|nomenclatura|naming/i.test(lower)) {
      return 'convention';
    }
    
    if (/no debe|nunca|siempre|evitar|cuidado/i.test(lower)) {
      return 'context_boundary';
    }
    
    return 'general_insight';
  }

  /**
   * Guarda una memoria si pasa el filtro de confianza
   */
  async autoSave(content, context = {}) {
    const decision = this.shouldSave(content, context);
    
    if (!decision.shouldSave) {
      return { saved: false, reason: decision.reason, confidence: decision.confidence };
    }
    
    const type = this.detectType(content, context);
    const tags = context.tags || extractKeywords(content);
    
    const result = saveMemory({
      content,
      type,
      projectPath: this.projectPath,
      changeName: this.changeName,
      sessionId: this.sessionId,
      author: this.author,
      confidence: decision.confidence,
      tags,
      codeSnippet: context.codeSnippet,
      errorMessage: context.errorMessage,
      solution: context.solution,
      shareable: context.shareable !== false
    });
    
    return {
      saved: true,
      id: result.id,
      operation: result.operation,
      type,
      confidence: decision.confidence
    };
  }

  /**
   * Guarda en buffer para análisis posterior
   */
  bufferContext(context) {
    this.contextBuffer.push({
      ...context,
      timestamp: Date.now()
    });
    
    if (this.contextBuffer.length > this.maxBufferSize) {
      this.contextBuffer.shift();
    }
  }

  /**
   * Analiza buffer para detectar patrones
   */
  analyzeBuffer() {
    if (this.contextBuffer.length < 3) return null;
    
    const recent = this.contextBuffer.slice(-3);
    
    // Detectar patrón de error -> fix
    const hasError = recent.some(c => c.type === 'error' || c.hasError);
    const hasFix = recent.some(c => c.type === 'fix' || c.isFix);
    
    if (hasError && hasFix) {
      return {
        pattern: 'error_to_fix',
        confidence: 0.8,
        context: recent
      };
    }
    
    return null;
  }

  /**
   * Recupera contexto relevante antes de empezar tarea
   */
  async recallForTask(task, options = {}) {
    const keywords = extractKeywords(task, 8);
    const query = keywords.join(' OR ');
    
    const results = searchMemories(query, {
      projectPath: this.projectPath,
      limit: options.limit || 5,
      minConfidence: 0.6,
      sessionId: this.sessionId
    });
    
    return results;
  }

  /**
   * Sugiere memorias relacionadas a una existente
   */
  suggestRelated(memoryId, content) {
    const keywords = extractKeywords(content, 5);
    return searchMemories(keywords.join(' OR '), {
      limit: 3,
      sessionId: this.sessionId
    }).filter(m => m.id !== memoryId);
  }
}

/**
 * Crea un hook de auto-save para un evento específico
 */
export function createAutoSaveHook(event, handler) {
  return {
    event,
    handler: async (data, context) => {
      const manager = context.autoSaveManager;
      if (!manager) return handler(data, context);
      
      const result = await handler(data, context);
      
      // Si el handler retorna contenido para guardar
      if (result && result.memoryContent) {
        const saveResult = await manager.autoSave(result.memoryContent, {
          typeHint: result.memoryType,
          ...result.memoryContext
        });
        
        return { ...result, autoSave: saveResult };
      }
      
      return result;
    }
  };
}

// Hooks predefinidos para workflow spec-driven
export const WorkflowHooks = {
  /**
   * Hook post-proposal: guarda decisiones arquitectónicas
   */
  afterProposal: (manager) => async (proposalData) => {
    const content = `Arquitectura decidida: ${proposalData.title || 'N/A'}. ${proposalData.description || ''}`;
    
    return {
      memoryContent: content,
      memoryType: 'architectural_decision',
      memoryContext: {
        importance: 'high',
        tags: ['proposal', 'architecture']
      }
    };
  },

  /**
   * Hook post-design: guarda patrones técnicos
   */
  afterDesign: (manager) => async (designData) => {
    const content = `Patrón de diseño: ${designData.approach || 'N/A'}. ${designData.rationale || ''}`;
    
    return {
      memoryContent: content,
      memoryType: 'architectural_decision',
      memoryContext: {
        importance: 'high',
        tags: ['design', 'pattern']
      }
    };
  },

  /**
   * Hook post-bugfix: guarda solución
   */
  afterBugfix: (manager) => async (bugfixData) => {
    const content = `Bug resuelto: ${bugfixData.description}. Solución: ${bugfixData.solution}`;
    
    return {
      memoryContent: content,
      memoryType: bugfixData.security ? 'security_fix' : 'bugfix_pattern',
      memoryContext: {
        errorMessage: bugfixData.error,
        solution: bugfixData.solution,
        codeSnippet: bugfixData.codeSnippet,
        importance: 'high'
      }
    };
  },

  /**
   * Hook post-refactor: guarda técnica
   */
  afterRefactor: (manager) => async (refactorData) => {
    const content = `Refactor: ${refactorData.description}. Beneficio: ${refactorData.benefit}`;
    
    return {
      memoryContent: content,
      memoryType: 'refactor_technique',
      memoryContext: {
        codeSnippet: refactorData.beforeAfter,
        importance: 'medium'
      }
    };
  },

  /**
   * Hook post-optimization: guarda insight de performance
   */
  afterOptimization: (manager) => async (optData) => {
    const content = `Optimización: ${optData.description}. Mejora: ${optData.improvement}`;
    
    return {
      memoryContent: content,
      memoryType: 'performance_insight',
      memoryContext: {
        importance: 'medium',
        tags: ['performance', 'optimization']
      }
    };
  }
};
