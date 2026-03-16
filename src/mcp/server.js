#!/usr/bin/env node

/**
 * MCP Server for AC Framework Memory System
 * Exposes memory system functionality via Model Context Protocol
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  initDatabase,
  isDatabaseInitialized,
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
  MEMORY_TYPES,
  IMPORTANCE_LEVELS
} from "../memory/index.js";

function getMemoryTypeDescription(type) {
  const descriptions = {
    architectural_decision: "Major design decisions about system architecture",
    bugfix_pattern: "Solutions to bugs and issues encountered",
    api_pattern: "Patterns and best practices for API design",
    performance_insight: "Learnings from performance optimization work",
    security_fix: "Security vulnerability fixes and patches",
    refactor_technique: "Successful code refactoring patterns",
    dependency_note: "Notes about project dependencies and versions",
    workaround: "Temporary solutions to problems",
    convention: "Established project conventions and standards",
    context_boundary: "Defined system boundaries and limitations",
    general_insight: "General insights and learnings",
    session_summary: "Summary of work completed in a session"
  };
  return descriptions[type] || "Memory type description not available";
}

class MCPMemoryServer {
  constructor() {
    // Initialize database if not already done
    if (!isDatabaseInitialized()) {
      initDatabase();
      console.error("Memory system initialized for MCP server");
    }

    this.server = new McpServer({
      name: "ac-framework-memory",
      version: "1.0.0",
    });

    this.setupTools();
  }

  setupTools() {
    // ── memory_save ──────────────────────────────────────────────
    this.server.tool(
      "memory_save",
      "Save a memory observation to the persistent knowledge base",
      {
        content: z.string().describe("Content to save in memory"),
        type: z.enum(MEMORY_TYPES).default("general_insight").describe("Type of memory"),
        importance: z.enum(IMPORTANCE_LEVELS).default("medium").describe("Importance level"),
        tags: z.array(z.string()).optional().describe("Tags for categorization"),
        projectPath: z.string().optional().describe("Associated project path"),
        changeName: z.string().optional().describe("Associated change name"),
        confidence: z.number().min(0).max(1).default(0.8).describe("Confidence score (0-1)")
      },
      async ({ content, type, importance, tags, projectPath, changeName, confidence }) => {
        try {
          const result = saveMemory({ content, type, importance, tags, projectPath, changeName, confidence });
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ success: true, id: result.id, operation: result.operation, revisionCount: result.revisionCount }, null, 2)
            }]
          };
        } catch (error) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    // ── memory_search ─────────────────────────────────────────────
    this.server.tool(
      "memory_search",
      "Search memories using full-text search (FTS5)",
      {
        query: z.string().describe("Search query"),
        limit: z.number().int().positive().default(10).describe("Maximum results"),
        type: z.enum(MEMORY_TYPES).optional().describe("Filter by memory type"),
        importance: z.enum(IMPORTANCE_LEVELS).optional().describe("Filter by importance"),
        projectPath: z.string().optional().describe("Filter by project path"),
        minConfidence: z.number().min(0).max(1).default(0).describe("Minimum confidence score")
      },
      async ({ query, limit, type, importance, projectPath, minConfidence }) => {
        try {
          const results = searchMemories(query, { limit, type, importance, projectPath, minConfidence });
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ query, count: results.length, results }, null, 2)
            }]
          };
        } catch (error) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    // ── memory_recall ─────────────────────────────────────────────
    this.server.tool(
      "memory_recall",
      "Recall relevant context for a task or project",
      {
        task: z.string().optional().describe("Specific task to recall context for"),
        projectPath: z.string().optional().describe("Project path"),
        changeName: z.string().optional().describe("Change name"),
        limit: z.number().int().positive().default(5).describe("Number of memories to return"),
        days: z.number().int().positive().default(30).describe("Days to look back")
      },
      async ({ task, projectPath, changeName, limit, days }) => {
        try {
          const results = getContext({ projectPath, changeName, currentTask: task, limit, lookbackDays: days });
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ task: task || null, projectPath, count: results.length, memories: results }, null, 2)
            }]
          };
        } catch (error) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    // ── memory_get ────────────────────────────────────────────────
    this.server.tool(
      "memory_get",
      "Get a specific memory by ID",
      {
        id: z.number().int().positive().describe("Memory ID")
      },
      async ({ id }) => {
        try {
          const memory = getMemory(id);
          if (!memory) {
            return { content: [{ type: "text", text: JSON.stringify({ error: "Memory not found" }) }], isError: true };
          }
          return { content: [{ type: "text", text: JSON.stringify({ memory }, null, 2) }] };
        } catch (error) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    // ── memory_timeline ───────────────────────────────────────────
    this.server.tool(
      "memory_timeline",
      "Get chronological timeline around a specific memory",
      {
        id: z.number().int().positive().describe("Memory ID"),
        window: z.number().int().positive().default(3).describe("Number of memories before/after")
      },
      async ({ id, window }) => {
        try {
          const timeline = getTimeline(id, { window });
          if (!timeline) {
            return { content: [{ type: "text", text: JSON.stringify({ error: "Memory not found" }) }], isError: true };
          }
          return { content: [{ type: "text", text: JSON.stringify(timeline, null, 2) }] };
        } catch (error) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    // ── memory_stats ──────────────────────────────────────────────
    this.server.tool(
      "memory_stats",
      "Get memory system statistics",
      {
        projectPath: z.string().optional().describe("Filter by project path"),
        since: z.string().optional().describe("ISO date string to filter from")
      },
      async ({ projectPath, since }) => {
        try {
          const stats = getStats({ projectPath, since });
          return { content: [{ type: "text", text: JSON.stringify(stats, null, 2) }] };
        } catch (error) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    // ── memory_patterns ───────────────────────────────────────────
    this.server.tool(
      "memory_patterns",
      "Find patterns and clusters in the memory system",
      {
        type: z.enum(MEMORY_TYPES).optional().describe("Filter by memory type"),
        minFrequency: z.number().int().positive().default(2).describe("Minimum frequency for pattern detection")
      },
      async ({ type, minFrequency }) => {
        try {
          const patterns = findPatterns({ type, minFrequency });
          return { content: [{ type: "text", text: JSON.stringify({ patterns }, null, 2) }] };
        } catch (error) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    // ── memory_anticipate ─────────────────────────────────────────
    this.server.tool(
      "memory_anticipate",
      "Anticipate memories that will be needed for a future task",
      {
        task: z.string().describe("Task to anticipate needs for"),
        projectPath: z.string().optional().describe("Project path"),
        limit: z.number().int().positive().default(5).describe("Number of suggestions")
      },
      async ({ task, projectPath, limit }) => {
        try {
          const memories = anticipateNeeds(task, projectPath);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ task, suggestions: memories.slice(0, limit) }, null, 2)
            }]
          };
        } catch (error) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    // ── memory_export ─────────────────────────────────────────────
    this.server.tool(
      "memory_export",
      "Export memories to JSON (to file or as response)",
      {
        filePath: z.string().optional().describe("File path to export to (optional, returns inline if omitted)"),
        shareableOnly: z.boolean().default(true).describe("Only export shareable memories"),
        projectPath: z.string().optional().describe("Filter by project path"),
        since: z.string().optional().describe("ISO date string to filter from")
      },
      async ({ filePath, shareableOnly, projectPath, since }) => {
        try {
          const memories = exportMemories({ shareableOnly, projectPath, since });
          const exportData = { exportedAt: new Date().toISOString(), count: memories.length, memories };
          if (filePath) {
            const { writeFileSync } = await import("node:fs");
            writeFileSync(filePath, JSON.stringify(exportData, null, 2));
            return {
              content: [{
                type: "text",
                text: JSON.stringify({ success: true, message: `Exported ${memories.length} memories to ${filePath}` }, null, 2)
              }]
            };
          }
          return { content: [{ type: "text", text: JSON.stringify(exportData, null, 2) }] };
        } catch (error) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    // ── memory_import ─────────────────────────────────────────────
    this.server.tool(
      "memory_import",
      "Import memories from a JSON file",
      {
        filePath: z.string().describe("File path to import from"),
        merge: z.boolean().default(true).describe("Merge with existing memories")
      },
      async ({ filePath, merge }) => {
        try {
          const { readFileSync } = await import("node:fs");
          const data = JSON.parse(readFileSync(filePath, "utf-8"));
          const memories = data.memories || data;
          const results = importMemories(memories, { merge });
          const success = results.filter(r => r.success);
          const failed = results.filter(r => !r.success);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ imported: success.length, failed: failed.length, results }, null, 2)
            }]
          };
        } catch (error) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    // ── memory_prune ──────────────────────────────────────────────
    this.server.tool(
      "memory_prune",
      "Prune obsolete or low-confidence memories",
      {
        olderThanDays: z.number().int().positive().default(90).describe("Delete memories older than this many days"),
        dryRun: z.boolean().default(false).describe("Show what would be pruned without actually deleting")
      },
      async ({ olderThanDays, dryRun }) => {
        try {
          const result = pruneMemories({ olderThanDays, dryRun });
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        } catch (error) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("AC Framework Memory MCP Server running on stdio");
  }
}

// Start server if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new MCPMemoryServer();
  server.run().catch(error => {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
  });
}

export default MCPMemoryServer;
