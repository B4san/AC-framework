#!/usr/bin/env node

/**
 * MCP Test Harness - Minimal server for async demo and testing
 * 
 * SDK: @modelcontextprotocol/sdk@^1.27.1
 * Transport: StdioServerTransport (stdio only)
 * 
 * Features:
 * - Real SDK behavior (not mocks)
 * - In-memory storage for memory_* tools
 * - Mocked collab_* tool responses
 * - Intentional error injection for Demo 3
 * - Lifecycle support for Demo 5
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const MEMORY_DB = new Map();
const COLLAB_SESSIONS = new Map();

let requestCount = 0;
let errorInjectionMode = null;

function setErrorInjection(mode) {
  errorInjectionMode = mode;
  console.error(`[harness] Error injection mode: ${mode || 'none'}`);
}

function handleError(errorType, defaultMessage) {
  if (!errorInjectionMode || errorInjectionMode !== errorType) {
    return null;
  }
  return {
    content: [{ type: 'text', text: JSON.stringify({ error: defaultMessage }) }],
    isError: true
  };
}

function createSuccessResponse(data) {
  return {
    content: [{ type: 'text', text: JSON.stringify(data) }]
  };
}

function createErrorResponse(message) {
  return {
    content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
    isError: true
  };
}

class MCPTestHarness {
  constructor() {
    this.server = new McpServer({
      name: 'acfm-test-harness',
      version: '1.0.0',
    });
    this.setupTools();
  }

  setupTools() {
    // ── memory_save ─────────────────────────────────────────────────────────
    this.server.tool(
      'memory_save',
      'Save a memory observation (test harness)',
      {
        content: z.string().describe('Content to save'),
        type: z.enum([
          'architectural_decision', 'bugfix_pattern', 'api_pattern',
          'performance_insight', 'security_fix', 'refactor_technique',
          'dependency_note', 'workaround', 'convention', 'context_boundary',
          'general_insight', 'session_summary'
        ]).default('general_insight'),
        importance: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
        tags: z.array(z.string()).optional(),
        projectPath: z.string().optional(),
        changeName: z.string().optional(),
        confidence: z.number().min(0).max(1).default(0.8)
      },
      async ({ content, type, importance, tags, projectPath, changeName, confidence }) => {
        requestCount++;
        const id = Date.now();
        
        const validationError = handleError('validation', 'Missing required param: content');
        if (validationError) return validationError;
        
        const dbError = handleError('db_failure', 'Database write failed: disk full');
        if (dbError) return dbError;
        
        const memory = {
          id,
          content,
          type,
          importance,
          tags: tags || [],
          projectPath,
          changeName,
          confidence,
          createdAt: new Date().toISOString()
        };
        MEMORY_DB.set(id.toString(), memory);
        
        return createSuccessResponse({ success: true, id, operation: 'insert', revisionCount: 1 });
      }
    );

    // ── memory_search ───────────────────────────────────────────────────────
    this.server.tool(
      'memory_search',
      'Search memories using text query (test harness)',
      {
        query: z.string().describe('Search query'),
        limit: z.number().int().positive().default(10),
        type: z.enum([
          'architectural_decision', 'bugfix_pattern', 'api_pattern',
          'performance_insight', 'security_fix', 'refactor_technique',
          'dependency_note', 'workaround', 'convention', 'context_boundary',
          'general_insight', 'session_summary'
        ]).optional(),
        importance: z.enum(['critical', 'high', 'medium', 'low']).optional(),
        projectPath: z.string().optional(),
        minConfidence: z.number().min(0).max(1).default(0)
      },
      async ({ query, limit, type, importance, projectPath, minConfidence }) => {
        requestCount++;
        
        const validationError = handleError('validation', 'Invalid query parameter');
        if (validationError) return validationError;
        
        const results = [];
        const queryLower = query.toLowerCase();
        for (const [id, memory] of MEMORY_DB) {
          if (memory.content.toLowerCase().includes(queryLower)) {
            if (type && memory.type !== type) continue;
            if (importance && memory.importance !== importance) continue;
            if (projectPath && memory.projectPath !== projectPath) continue;
            if (memory.confidence < minConfidence) continue;
            results.push(memory);
            if (results.length >= limit) break;
          }
        }
        
        return createSuccessResponse({ query, count: results.length, results });
      }
    );

    // ── memory_recall ───────────────────────────────────────────────────────
    this.server.tool(
      'memory_recall',
      'Recall relevant context for a task (test harness)',
      {
        task: z.string().optional(),
        projectPath: z.string().optional(),
        changeName: z.string().optional(),
        limit: z.number().int().positive().default(5),
        days: z.number().int().positive().default(30)
      },
      async ({ task, projectPath, changeName, limit, days }) => {
        requestCount++;
        
        const dbError = handleError('db_failure', 'Database read failed: connection lost');
        if (dbError) return dbError;
        
        const memories = Array.from(MEMORY_DB.values())
          .filter(m => {
            if (task && !m.content.toLowerCase().includes(task.toLowerCase())) return false;
            if (projectPath && m.projectPath !== projectPath) return false;
            if (changeName && m.changeName !== changeName) return false;
            return true;
          })
          .slice(0, limit);
        
        return createSuccessResponse({ task: task || null, projectPath, count: memories.length, memories });
      }
    );

    // ── memory_stats ────────────────────────────────────────────────────────
    this.server.tool(
      'memory_stats',
      'Get memory system statistics (test harness)',
      {
        projectPath: z.string().optional(),
        since: z.string().optional()
      },
      async ({ projectPath, since }) => {
        requestCount++;
        
        let memories = Array.from(MEMORY_DB.values());
        if (projectPath) {
          memories = memories.filter(m => m.projectPath === projectPath);
        }
        if (since) {
          const sinceDate = new Date(since);
          memories = memories.filter(m => new Date(m.createdAt) >= sinceDate);
        }
        
        const byType = {};
        const byImportance = { critical: 0, high: 0, medium: 0, low: 0 };
        
        for (const m of memories) {
          byType[m.type] = (byType[m.type] || 0) + 1;
          byImportance[m.importance]++;
        }
        
        return createSuccessResponse({
          totalMemories: memories.length,
          byType,
          byImportance,
          projectPath: projectPath || null,
          since: since || null
        });
      }
    );

    // ── collab_start_session (MOCKED) ───────────────────────────────────────
    this.server.tool(
      'collab_start_session',
      'Start a collaboration session (mocked in test harness)',
      {
        task: z.string().describe('Initial task'),
        maxRounds: z.number().int().positive().default(3),
        model: z.string().optional()
      },
      async ({ task, maxRounds, model }) => {
        requestCount++;
        
        const serverError = handleError('server_offline', 'Collab server not running');
        if (serverError) return serverError;
        
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const state = {
          sessionId,
          task,
          maxRounds,
          model: model || 'opencode/default',
          status: 'initialized',
          round: 0,
          events: []
        };
        COLLAB_SESSIONS.set(sessionId, state);
        
        return createSuccessResponse({
          success: true,
          sessionId,
          status: state.status,
          model: state.model,
          tmuxSessionName: null,
          attachCommand: null
        });
      }
    );

    // ── collab_step (MOCKED) ────────────────────────────────────────────────
    this.server.tool(
      'collab_step',
      'Execute a single collaboration step (mocked)',
      {
        sessionId: z.string().describe('Session ID'),
        role: z.enum(['planner', 'critic', 'coder', 'reviewer']).describe('Role to execute')
      },
      async ({ sessionId, role }) => {
        requestCount++;
        
        const session = COLLAB_SESSIONS.get(sessionId);
        if (!session) {
          return createErrorResponse(`Session not found: ${sessionId}`);
        }
        
        session.round++;
        const event = {
          role,
          timestamp: new Date().toISOString(),
          status: 'completed',
          output: `[MOCK] ${role} completed round ${session.round}`
        };
        session.events.push(event);
        
        return createSuccessResponse({
          sessionId,
          round: session.round,
          event,
          status: session.round >= session.maxRounds ? 'complete' : 'in_progress'
        });
      }
    );

    // ── collab_get_result (MOCKED) ──────────────────────────────────────────
    this.server.tool(
      'collab_get_result',
      'Get collaboration session result (mocked)',
      {
        sessionId: z.string().describe('Session ID')
      },
      async ({ sessionId }) => {
        requestCount++;
        
        const session = COLLAB_SESSIONS.get(sessionId);
        if (!session) {
          return createErrorResponse(`Session not found: ${sessionId}`);
        }
        
        return createSuccessResponse({
          sessionId,
          status: session.status,
          rounds: session.round,
          events: session.events,
          summary: `[MOCK] Completed ${session.round} rounds for: ${session.task}`
        });
      }
    );

    // ── collab_status (MOCKED) ─────────────────────────────────────────────
    this.server.tool(
      'collab_status',
      'Get collaboration system status (mocked)',
      {
        sessionId: z.string().optional()
      },
      async ({ sessionId }) => {
        requestCount++;
        
        if (sessionId) {
          const session = COLLAB_SESSIONS.get(sessionId);
          if (!session) {
            return createErrorResponse(`Session not found: ${sessionId}`);
          }
          return createSuccessResponse({
            sessionId,
            status: session.status,
            round: session.round,
            maxRounds: session.maxRounds
          });
        }
        
        return createSuccessResponse({
          activeSessions: COLLAB_SESSIONS.size,
          totalRequests: requestCount,
          uptime: process.uptime()
        });
      }
    );

    // ── harness_control (DEBUG) ─────────────────────────────────────────────
    this.server.tool(
      'harness_control',
      'Control test harness behavior (debug only)',
      {
        action: z.enum(['reset', 'inject_error', 'clear_errors', 'status']).describe('Action to perform'),
        errorType: z.string().optional().describe('Error type: validation, db_failure, server_offline')
      },
      async ({ action, errorType }) => {
        switch (action) {
          case 'reset':
            MEMORY_DB.clear();
            COLLAB_SESSIONS.clear();
            requestCount = 0;
            errorInjectionMode = null;
            return createSuccessResponse({ message: 'Harness reset complete' });
          
          case 'inject_error':
            setErrorInjection(errorType);
            return createSuccessResponse({ message: `Error injection set: ${errorType}` });
          
          case 'clear_errors':
            setErrorInjection(null);
            return createSuccessResponse({ message: 'Error injection cleared' });
          
          case 'status':
            return createSuccessResponse({
              memories: MEMORY_DB.size,
              sessions: COLLAB_SESSIONS.size,
              requestCount,
              errorInjectionMode: errorInjectionMode || 'none'
            });
          
          default:
            return createErrorResponse(`Unknown action: ${action}`);
        }
      }
    );
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[harness] Test harness ready on stdio');
    console.error('[harness] Available tools: memory_save, memory_search, memory_recall, memory_stats');
    console.error('[harness] Collab tools (mocked): collab_start_session, collab_step, collab_get_result, collab_status');
    console.error('[harness] Debug tool: harness_control (reset, inject_error, clear_errors, status)');
  }
}

const harness = new MCPTestHarness();
harness.run().catch(err => {
  console.error('[harness] Fatal error:', err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.error('[harness] Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.error('[harness] Received SIGINT, shutting down');
  process.exit(0);
});
