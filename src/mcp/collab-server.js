#!/usr/bin/env node

/**
 * MCP Server for AC Framework SynapseGrid Collaboration System
 * Exposes collaborative multi-agent session controls via MCP.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { COLLAB_ROLES } from '../agents/constants.js';
import { buildEffectiveRoleModels, sanitizeRoleModels } from '../agents/model-selection.js';
import { runWorkerIteration } from '../agents/orchestrator.js';
import { getSessionDir } from '../agents/state-store.js';
import {
  spawnTmuxSession,
  spawnZellijSession,
  tmuxSessionExists,
  zellijSessionExists,
  resolveMultiplexer,
} from '../agents/runtime.js';
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
import { hasCommand, resolveCommandPath, resolveManagedZellijPath } from '../services/dependency-installer.js';
import { loadAgentsConfig } from '../agents/config-store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const runnerPath = resolve(__dirname, '../../bin/acfm.js');

function summarizeRun(state) {
  const run = state.run || null;
  return {
    status: run?.status || 'idle',
    runId: run?.runId || null,
    currentRole: run?.currentRole || state.activeAgent || null,
    round: run?.round || state.round,
    policy: run?.policy || null,
    lastError: run?.lastError || null,
    eventCount: Array.isArray(run?.events) ? run.events.length : 0,
  };
}

function latestRunEvent(state) {
  const events = state?.run?.events;
  if (!Array.isArray(events) || events.length === 0) return null;
  return events[events.length - 1];
}

async function readSessionArtifact(sessionId, filename) {
  const path = resolve(getSessionDir(sessionId), filename);
  if (!existsSync(path)) return null;
  return readFile(path, 'utf8');
}

function launchAutopilot(sessionId) {
  const child = spawn('node', [runnerPath, 'agents', 'autopilot', '--session', sessionId], {
    cwd: process.cwd(),
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
}

function resolveConfiguredZellijPath(config) {
  const strategy = config?.agents?.zellij?.strategy || 'auto';
  if (strategy === 'system') {
    return resolveCommandPath('zellij');
  }
  const managed = resolveManagedZellijPath(config);
  if (managed) return managed;
  return resolveCommandPath('zellij');
}

async function muxExists(multiplexer, sessionName, zellijPath = null) {
  if (multiplexer === 'zellij') return zellijSessionExists(sessionName, zellijPath);
  return tmuxSessionExists(sessionName);
}

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
        spawnWorkers: z.boolean().default(true).describe('Create multiplexer workers and panes'),
        runPolicy: z.object({
          timeoutPerRoleMs: z.number().int().positive().optional(),
          retryOnTimeout: z.number().int().min(0).optional(),
          fallbackOnFailure: z.enum(['retry', 'skip', 'abort']).optional(),
        }).partial().optional().describe('Optional run execution policy'),
      },
      async ({ task, maxRounds, model, roleModels, cwd, spawnWorkers, runPolicy }) => {
        try {
          const workingDirectory = cwd || process.cwd();
          const opencodeBin = resolveCommandPath('opencode');
          if (!opencodeBin) {
            throw new Error('OpenCode binary not found in PATH. Run: acfm agents setup');
          }

          const config = await loadAgentsConfig();
          const configuredMux = config.agents.multiplexer || 'auto';
          const zellijPath = resolveConfiguredZellijPath(config);
          const multiplexer = resolveMultiplexer(configuredMux, hasCommand('tmux'), Boolean(zellijPath));
          if (spawnWorkers && !multiplexer) {
            throw new Error('No multiplexer found (zellij/tmux). Run: acfm agents setup');
          }

          const state = await createSession(task, {
            roles: COLLAB_ROLES,
            maxRounds,
            model: model || null,
            roleModels: sanitizeRoleModels(roleModels),
            workingDirectory,
            opencodeBin,
            runPolicy,
            multiplexer: multiplexer || configuredMux,
          });
          let updated = state;
          if (spawnWorkers) {
            const sessionName = `acfm-synapse-${state.sessionId.slice(0, 8)}`;
            const sessionDir = getSessionDir(state.sessionId);
            if (multiplexer === 'zellij') {
              await spawnZellijSession({ sessionName, sessionDir, sessionId: state.sessionId, binaryPath: zellijPath });
            } else {
              await spawnTmuxSession({ sessionName, sessionDir, sessionId: state.sessionId });
            }
            updated = await saveSessionState({
              ...state,
              multiplexer,
              multiplexerSessionName: sessionName,
              tmuxSessionName: multiplexer === 'tmux' ? sessionName : null,
            });
          }
          await setCurrentSession(state.sessionId);

          const mux = updated.multiplexer || null;
          const muxSessionName = updated.multiplexerSessionName || updated.tmuxSessionName || null;
          const attachCommand = muxSessionName
            ? (mux === 'zellij' ? `zellij attach ${muxSessionName}` : `tmux attach -t ${muxSessionName}`)
            : null;
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
                run: summarizeRun(updated),
                multiplexer: mux,
                multiplexerSessionName: muxSessionName,
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
      'collab_invoke_team',
      'Invoke full 4-agent collaborative run and return async run handle',
      {
        sessionId: z.string().optional().describe('Session ID (defaults to current session)'),
        waitMs: z.number().int().min(0).max(30000).default(0).describe('Optional wait for progress before returning'),
      },
      async ({ sessionId, waitMs }) => {
        try {
          const id = sessionId || await loadCurrentSessionId();
          if (!id) throw new Error('No active session found');
          let state = await loadSessionState(id);
          if (state.status !== 'running') {
            throw new Error(`Session is ${state.status}. Resume/start before invoking.`);
          }

          if (!state.multiplexerSessionName && !state.tmuxSessionName) {
            launchAutopilot(state.sessionId);
          }

          if (waitMs > 0) {
            const started = Date.now();
            const initialEvents = state.run?.events?.length || 0;
            while (Date.now() - started < waitMs) {
              await new Promise((r) => setTimeout(r, 250));
              state = await loadSessionState(id);
              const currentEvents = state.run?.events?.length || 0;
              if (state.status !== 'running' || currentEvents > initialEvents) break;
            }
          }

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                sessionId: state.sessionId,
                status: state.status,
                run: summarizeRun(state),
                latestEvent: latestRunEvent(state),
                multiplexer: state.multiplexer || null,
                multiplexerSessionName: state.multiplexerSessionName || state.tmuxSessionName || null,
                attachCommand: state.multiplexerSessionName
                  ? (state.multiplexer === 'zellij'
                    ? `zellij attach ${state.multiplexerSessionName}`
                    : `tmux attach -t ${state.multiplexerSessionName}`)
                  : (state.tmuxSessionName ? `tmux attach -t ${state.tmuxSessionName}` : null),
              }, null, 2),
            }],
          };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    this.server.tool(
      'collab_wait_run',
      'Wait for collaborative run to complete/fail or timeout',
      {
        sessionId: z.string().optional().describe('Session ID (defaults to current session)'),
        waitMs: z.number().int().positive().max(60000).default(10000).describe('Max wait in milliseconds'),
      },
      async ({ sessionId, waitMs }) => {
        try {
          const id = sessionId || await loadCurrentSessionId();
          if (!id) throw new Error('No active session found');
          const started = Date.now();
          let state = await loadSessionState(id);

          while (Date.now() - started < waitMs) {
            const runStatus = state.run?.status || 'idle';
            if (state.status !== 'running' || ['completed', 'failed', 'cancelled'].includes(runStatus)) break;
            await new Promise((r) => setTimeout(r, 300));
            state = await loadSessionState(id);
          }

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                sessionId: state.sessionId,
                status: state.status,
                run: summarizeRun(state),
                latestEvent: latestRunEvent(state),
                timedOut: state.status === 'running' && !['completed', 'failed', 'cancelled'].includes(state.run?.status || 'idle'),
              }, null, 2),
            }],
          };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    this.server.tool(
      'collab_get_result',
      'Get final consolidated team output and run diagnostics',
      {
        sessionId: z.string().optional().describe('Session ID (defaults to current session)'),
      },
      async ({ sessionId }) => {
        try {
          const id = sessionId || await loadCurrentSessionId();
          if (!id) throw new Error('No active session found');
          const state = await loadSessionState(id);
          const transcript = await loadTranscript(id);
          const run = summarizeRun(state);

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                sessionId: state.sessionId,
                status: state.status,
                run,
                latestEvent: latestRunEvent(state),
                finalSummary: state.run?.finalSummary || null,
                sharedContext: state.run?.sharedContext || null,
                meetingSummary: await readSessionArtifact(id, 'meeting-summary.md'),
                meetingLog: await readSessionArtifact(id, 'meeting-log.md'),
                lastMessage: state.messages?.[state.messages.length - 1] || null,
                transcriptCount: transcript.length,
              }, null, 2),
            }],
          };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    this.server.tool(
      'collab_cancel_run',
      'Cancel active collaborative run while keeping session state',
      {
        sessionId: z.string().optional().describe('Session ID (defaults to current session)'),
      },
      async ({ sessionId }) => {
        try {
          const id = sessionId || await loadCurrentSessionId();
          if (!id) throw new Error('No active session found');
          const state = await loadSessionState(id);
          const run = state.run || {};
          const updated = await saveSessionState({
            ...state,
            status: 'running',
            activeAgent: null,
            run: {
              ...run,
              status: 'cancelled',
              currentRole: null,
              finishedAt: new Date().toISOString(),
              lastError: {
                code: 'RUN_CANCELLED',
                message: 'Cancelled by MCP caller',
              },
              events: [
                ...(Array.isArray(run.events) ? run.events : []),
                {
                  id: `evt-${Date.now()}`,
                  type: 'run_cancelled',
                  timestamp: new Date().toISOString(),
                },
              ],
            },
          });
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                sessionId: updated.sessionId,
                run: summarizeRun(updated),
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
            timeoutMs: loaded.run?.policy?.timeoutPerRoleMs || 180000,
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
                run: summarizeRun(state),
                latestEvent: latestRunEvent(state),
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
      'Resume session and recreate workers if needed',
      {
        sessionId: z.string().optional().describe('Session ID (defaults to current session)'),
        recreateWorkers: z.boolean().default(true).describe('Recreate multiplexer session when missing'),
      },
      async ({ sessionId, recreateWorkers }) => {
        try {
          const id = sessionId || await loadCurrentSessionId();
          if (!id) throw new Error('No active session found');
          let state = await loadSessionState(id);
          const config = await loadAgentsConfig();
          const zellijPath = resolveConfiguredZellijPath(config);

          const multiplexer = state.multiplexer || resolveMultiplexer('auto', hasCommand('tmux'), Boolean(zellijPath));
          if (!multiplexer) {
            throw new Error('No multiplexer found (zellij/tmux). Run: acfm agents setup');
          }
          const sessionName = state.multiplexerSessionName || state.tmuxSessionName || `acfm-synapse-${state.sessionId.slice(0, 8)}`;
          const sessionExists = await muxExists(multiplexer, sessionName, zellijPath);

          if (!sessionExists && recreateWorkers) {
            const sessionDir = getSessionDir(state.sessionId);
            if (multiplexer === 'zellij') {
              if (!zellijPath) throw new Error('zellij is not installed. Run: acfm agents setup');
              await spawnZellijSession({ sessionName, sessionDir, sessionId: state.sessionId, binaryPath: zellijPath });
            } else {
              if (!hasCommand('tmux')) throw new Error('tmux is not installed. Run: acfm agents setup');
              await spawnTmuxSession({ sessionName, sessionDir, sessionId: state.sessionId });
            }
          }

          state = await saveSessionState({
            ...state,
            status: 'running',
            multiplexer,
            multiplexerSessionName: sessionName,
            tmuxSessionName: multiplexer === 'tmux' ? sessionName : state.tmuxSessionName || null,
          });
          await setCurrentSession(state.sessionId);

          const attachCommand = multiplexer === 'zellij'
            ? `zellij attach ${sessionName}`
            : `tmux attach -t ${sessionName}`;

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                sessionId: state.sessionId,
                status: state.status,
                multiplexer,
                multiplexerSessionName: sessionName,
                recreatedWorkers: !sessionExists && recreateWorkers,
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
                run: summarizeRun(state),
                latestEvent: latestRunEvent(state),
                sharedContext: state.run?.sharedContext || null,
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
      'collab_get_transcript',
      'Get transcript messages with optional role filtering',
      {
        sessionId: z.string().optional().describe('Session ID (defaults to current session)'),
        role: z.enum(['planner', 'critic', 'coder', 'reviewer', 'all']).default('all').describe('Role filter'),
        limit: z.number().int().positive().max(500).default(100).describe('Max messages to return'),
      },
      async ({ sessionId, role, limit }) => {
        try {
          const id = sessionId || await loadCurrentSessionId();
          if (!id) throw new Error('No active session found');
          const transcript = await loadTranscript(id);
          const filtered = transcript
            .filter((msg) => role === 'all' || msg.from === role)
            .slice(-limit);

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                sessionId: id,
                role,
                count: filtered.length,
                transcript: filtered,
              }, null, 2),
            }],
          };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }], isError: true };
        }
      }
    );

    this.server.tool(
      'collab_get_meeting_log',
      'Get generated meeting log and summary artifacts',
      {
        sessionId: z.string().optional().describe('Session ID (defaults to current session)'),
      },
      async ({ sessionId }) => {
        try {
          const id = sessionId || await loadCurrentSessionId();
          if (!id) throw new Error('No active session found');
          const state = await loadSessionState(id);

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                sessionId: id,
                status: state.status,
                finalSummary: state.run?.finalSummary || null,
                sharedContext: state.run?.sharedContext || null,
                meetingSummary: await readSessionArtifact(id, 'meeting-summary.md'),
                meetingLog: await readSessionArtifact(id, 'meeting-log.md'),
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
              text: JSON.stringify({
                success: true,
                sessionId: id,
                status: updated.status,
                run: summarizeRun(updated),
              }, null, 2),
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
