#!/usr/bin/env node

/**
 * MCP Server for AC Framework SynapseGrid Collaboration System
 * Exposes collaborative multi-agent session controls via MCP.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { COLLAB_ROLES } from '../agents/constants.js';
import { buildEffectiveRoleModels, sanitizeRoleModels } from '../agents/model-selection.js';
import { runWorkerIteration } from '../agents/orchestrator.js';
import { getSessionDir } from '../agents/state-store.js';
import { spawnTmuxSession, tmuxSessionExists } from '../agents/runtime.js';
import {
  addUserMessage,
  createSession,
  loadCurrentSessionId,
  loadSessionState,
  loadTranscript,
  saveSessionState,
  setCurrentSession,
  stopSession,
} from '../agents/state-store.js';
import { hasCommand, resolveCommandPath } from '../services/dependency-installer.js';

class MCPCollabServer {
  constructor() {
    this.server = new McpServer({
      name: 'ac-framework-collab',
      version: '1.0.0',
    });

    this.setupTools();
  }

  setupTools() {
    this.server.tool(
      'collab_start_session',
      'Start a SynapseGrid collaborative session',
      {
        task: z.string().describe('Initial collaborative task'),
        maxRounds: z.number().int().positive().default(3).describe('Maximum collaboration rounds'),
        model: z.string().optional().describe('Model id (provider/model) for opencode run'),
        roleModels: z.object({
          planner: z.string().optional(),
          critic: z.string().optional(),
          coder: z.string().optional(),
          reviewer: z.string().optional(),
        }).partial().optional().describe('Optional per-role models (provider/model)'),
        cwd: z.string().optional().describe('Working directory for agents'),
        spawnWorkers: z.boolean().default(true).describe('Create tmux workers and panes'),
      },
      async ({ task, maxRounds, model, roleModels, cwd, spawnWorkers }) => {
        try {
          const workingDirectory = cwd || process.cwd();
          const opencodeBin = resolveCommandPath('opencode');
          if (!opencodeBin) {
            throw new Error('OpenCode binary not found in PATH. Run: acfm agents setup');
          }

          if (spawnWorkers && !hasCommand('tmux')) {
            throw new Error('tmux is not installed. Run: acfm agents setup');
          }

          const state = await createSession(task, {
            roles: COLLAB_ROLES,
            maxRounds,
            model: model || null,
            roleModels: sanitizeRoleModels(roleModels),
            workingDirectory,
            opencodeBin,
          });
          let updated = state;
          if (spawnWorkers) {
            const tmuxSessionName = `acfm-synapse-${state.sessionId.slice(0, 8)}`;
            const sessionDir = getSessionDir(state.sessionId);
            await spawnTmuxSession({ sessionName: tmuxSessionName, sessionDir, sessionId: state.sessionId });
            updated = await saveSessionState({ ...state, tmuxSessionName });
          }
          await setCurrentSession(state.sessionId);

          const tmuxSessionName = updated.tmuxSessionName || null;
          const attachCommand = tmuxSessionName ? `tmux attach -t ${tmuxSessionName}` : null;
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                sessionId: updated.sessionId,
                status: updated.status,
                model: updated.model || null,
                roleModels: updated.roleModels || {},
                effectiveRoleModels: buildEffectiveRoleModels(updated, updated.model || null),
                tmuxSessionName,
                attachCommand,
              }, null, 2),
            }],
          };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    this.server.tool(
      'collab_send_message',
      'Send a user message to the active collaborative session',
      {
        message: z.string().describe('User message to add to shared context'),
        sessionId: z.string().optional().describe('Session ID (defaults to current session)'),
      },
      async ({ message, sessionId }) => {
        try {
          const id = sessionId || await loadCurrentSessionId();
          if (!id) {
            throw new Error('No active session found');
          }
          let state = await loadSessionState(id);
          state = await addUserMessage(state, message);
          state = await saveSessionState(state);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ success: true, sessionId: id, messages: state.messages.length }, null, 2),
            }],
          };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    this.server.tool(
      'collab_step',
      'Execute one collaborative worker turn by role',
      {
        role: z.enum(COLLAB_ROLES).describe('Role to execute for one step'),
        sessionId: z.string().optional().describe('Session ID (defaults to current session)'),
      },
      async ({ role, sessionId }) => {
        try {
          const id = sessionId || await loadCurrentSessionId();
          if (!id) {
            throw new Error('No active session found');
          }
          const loaded = await loadSessionState(id);

          const state = await runWorkerIteration(id, role, {
            cwd: process.cwd(),
            opencodeBin: loaded.opencodeBin || resolveCommandPath('opencode') || undefined,
          });

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                sessionId: id,
                status: state.status,
                round: state.round,
                activeAgent: state.activeAgent,
                model: state.model || null,
                roleModels: state.roleModels || {},
                effectiveRoleModels: buildEffectiveRoleModels(state, state.model || null),
                messageCount: state.messages.length,
              }, null, 2),
            }],
          };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    this.server.tool(
      'collab_resume_session',
      'Resume session and recreate tmux workers if needed',
      {
        sessionId: z.string().optional().describe('Session ID (defaults to current session)'),
        recreateWorkers: z.boolean().default(true).describe('Recreate tmux session when missing'),
      },
      async ({ sessionId, recreateWorkers }) => {
        try {
          const id = sessionId || await loadCurrentSessionId();
          if (!id) throw new Error('No active session found');
          let state = await loadSessionState(id);

          const tmuxSessionName = state.tmuxSessionName || `acfm-synapse-${state.sessionId.slice(0, 8)}`;
          const tmuxExists = hasCommand('tmux') ? await tmuxSessionExists(tmuxSessionName) : false;

          if (!tmuxExists && recreateWorkers) {
            if (!hasCommand('tmux')) {
              throw new Error('tmux is not installed. Run: acfm agents setup');
            }
            const sessionDir = getSessionDir(state.sessionId);
            await spawnTmuxSession({ sessionName: tmuxSessionName, sessionDir, sessionId: state.sessionId });
          }

          state = await saveSessionState({
            ...state,
            status: 'running',
            tmuxSessionName,
          });
          await setCurrentSession(state.sessionId);

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                sessionId: state.sessionId,
                status: state.status,
                tmuxSessionName,
                recreatedWorkers: !tmuxExists && recreateWorkers,
              }, null, 2),
            }],
          };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    this.server.tool(
      'collab_status',
      'Get current collaborative session state',
      {
        sessionId: z.string().optional().describe('Session ID (defaults to current session)'),
        includeTranscript: z.boolean().default(false).describe('Include transcript JSONL messages'),
      },
      async ({ sessionId, includeTranscript }) => {
        try {
          const id = sessionId || await loadCurrentSessionId();
          if (!id) {
            throw new Error('No active session found');
          }
          const state = await loadSessionState(id);
          const transcript = includeTranscript ? await loadTranscript(id) : undefined;
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                state,
                effectiveRoleModels: buildEffectiveRoleModels(state, state.model || null),
                transcript,
              }, null, 2),
            }],
          };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    this.server.tool(
      'collab_stop_session',
      'Stop current collaborative session',
      {
        sessionId: z.string().optional().describe('Session ID (defaults to current session)'),
      },
      async ({ sessionId }) => {
        try {
          const id = sessionId || await loadCurrentSessionId();
          if (!id) {
            throw new Error('No active session found');
          }
          const state = await loadSessionState(id);
          const updated = await stopSession(state, 'stopped');
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ success: true, sessionId: id, status: updated.status }, null, 2),
            }],
          };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AC Framework SynapseGrid MCP Server running on stdio');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new MCPCollabServer();
  server.run().catch((error) => {
    console.error('Failed to start SynapseGrid MCP server:', error);
    process.exit(1);
  });
}

export default MCPCollabServer;
