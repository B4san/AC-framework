import { appendFile, mkdir, open, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  COLLAB_ROLES,
  DEFAULT_MAX_ROUNDS,
  SESSION_ROOT_DIR,
  CURRENT_SESSION_FILE,
} from './constants.js';
import { createRunState } from './run-state.js';
import { sanitizeRoleModels } from './model-selection.js';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureSessionRoot() {
  await mkdir(SESSION_ROOT_DIR, { recursive: true });
}

async function writeCurrentSession(sessionId, updatedAt = new Date().toISOString()) {
  await writeFile(CURRENT_SESSION_FILE, JSON.stringify({ sessionId, updatedAt }, null, 2) + '\n', 'utf8');
}

export function getSessionDir(sessionId) {
  return join(SESSION_ROOT_DIR, sessionId);
}

function getSessionLockPath(sessionId) {
  return join(getSessionDir(sessionId), '.session.lock');
}

function getSessionStatePath(sessionId) {
  return join(getSessionDir(sessionId), 'state.json');
}

function getTranscriptPath(sessionId) {
  return join(getSessionDir(sessionId), 'transcript.jsonl');
}

function getTurnsDir(sessionId) {
  return join(getSessionDir(sessionId), 'turns');
}

function getMeetingLogPath(sessionId) {
  return join(getSessionDir(sessionId), 'meeting-log.md');
}

function getMeetingLogJsonlPath(sessionId) {
  return join(getSessionDir(sessionId), 'meeting-log.jsonl');
}

function getMeetingSummaryPath(sessionId) {
  return join(getSessionDir(sessionId), 'meeting-summary.md');
}

function initialState(task, options = {}) {
  const sessionId = randomUUID();
  const createdAt = new Date().toISOString();
  return {
    sessionId,
    createdAt,
    updatedAt: createdAt,
    status: 'running',
    task,
    round: 1,
    maxRounds: Number.isInteger(options.maxRounds) ? options.maxRounds : DEFAULT_MAX_ROUNDS,
    activeAgent: null,
    nextRoleIndex: 0,
    roles: options.roles?.length ? options.roles : COLLAB_ROLES,
    workingDirectory: options.workingDirectory || process.cwd(),
    model: options.model || null,
    roleModels: sanitizeRoleModels(options.roleModels),
    opencodeBin: options.opencodeBin || null,
    multiplexer: options.multiplexer || 'auto',
    multiplexerSessionName: options.multiplexerSessionName || null,
    tmuxSessionName: options.tmuxSessionName || null,
    run: createRunState(options.runPolicy, Number.isInteger(options.maxRounds) ? options.maxRounds : DEFAULT_MAX_ROUNDS),
    messages: [
      {
        from: 'user',
        role: 'user',
        timestamp: createdAt,
        content: task,
      },
    ],
    decisions: [],
    conflicts: [],
  };
}

export async function createSession(task, options = {}) {
  await ensureSessionRoot();
  const state = initialState(task, options);
  const sessionDir = getSessionDir(state.sessionId);
  await mkdir(sessionDir, { recursive: true });
  await writeFile(getSessionStatePath(state.sessionId), JSON.stringify(state, null, 2) + '\n', 'utf8');
  await writeCurrentSession(state.sessionId, state.updatedAt);
  await appendTranscript(state.sessionId, state.messages[0]);
  return state;
}

export async function appendTranscript(sessionId, message) {
  const transcriptPath = getTranscriptPath(sessionId);
  const line = JSON.stringify(message) + '\n';
  if (!existsSync(transcriptPath)) {
    await writeFile(transcriptPath, line, 'utf8');
    return;
  }
  await appendFile(transcriptPath, line, 'utf8');
}

export async function appendMeetingTurn(sessionId, turnRecord) {
  const sessionDir = getSessionDir(sessionId);
  const turnsDir = getTurnsDir(sessionId);
  await mkdir(sessionDir, { recursive: true });
  await mkdir(turnsDir, { recursive: true });

  const safeRole = String(turnRecord?.role || 'unknown').replace(/[^a-z0-9_-]/gi, '_');
  const safeRound = Number.isInteger(turnRecord?.round) ? turnRecord.round : 0;
  const turnFilePath = join(turnsDir, `${String(safeRound).padStart(3, '0')}-${safeRole}.json`);
  await writeFile(turnFilePath, JSON.stringify(turnRecord, null, 2) + '\n', 'utf8');

  const mdPath = getMeetingLogPath(sessionId);
  const jsonlPath = getMeetingLogJsonlPath(sessionId);
  const snippet = (turnRecord?.snippet || '').trim() || '(empty output)';
  const keyPoints = Array.isArray(turnRecord?.keyPoints) ? turnRecord.keyPoints : [];

  const mdBlock = [
    `## Round ${safeRound} - ${safeRole}`,
    `- timestamp: ${turnRecord?.timestamp || new Date().toISOString()}`,
    `- model: ${turnRecord?.model || '(default)'}`,
    `- events: ${turnRecord?.eventCount ?? 0}`,
    '',
    '### Output snippet',
    snippet,
    '',
    '### Key points',
    ...(keyPoints.length > 0 ? keyPoints.map((line) => `- ${line.replace(/^[-*]\s+/, '')}`) : ['- (none)']),
    '',
  ].join('\n');

  if (!existsSync(mdPath)) {
    const header = `# SynapseGrid Meeting Log\n\nSession: ${sessionId}\n\n`;
    await writeFile(mdPath, header + mdBlock, 'utf8');
  } else {
    await appendFile(mdPath, mdBlock, 'utf8');
  }

  await appendFile(jsonlPath, JSON.stringify(turnRecord) + '\n', 'utf8');
  return {
    turnFilePath,
    meetingLogPath: mdPath,
    meetingJsonlPath: jsonlPath,
  };
}

export async function writeMeetingSummary(sessionId, summaryMarkdown) {
  const outputPath = getMeetingSummaryPath(sessionId);
  await writeFile(outputPath, String(summaryMarkdown || '').trimEnd() + '\n', 'utf8');
  return outputPath;
}

export async function loadCurrentSessionId() {
  if (!existsSync(CURRENT_SESSION_FILE)) return null;
  const raw = await readFile(CURRENT_SESSION_FILE, 'utf8');
  const parsed = JSON.parse(raw);
  return parsed?.sessionId || null;
}

export async function loadSessionState(sessionId) {
  const raw = await readFile(getSessionStatePath(sessionId), 'utf8');
  return JSON.parse(raw);
}

export async function saveSessionState(state) {
  const updated = {
    ...state,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(getSessionStatePath(updated.sessionId), JSON.stringify(updated, null, 2) + '\n', 'utf8');
  return updated;
}

export async function setCurrentSession(sessionId) {
  await ensureSessionRoot();
  await writeCurrentSession(sessionId, new Date().toISOString());
}

export async function listSessions(limit = 20) {
  await ensureSessionRoot();
  const entries = await readdir(SESSION_ROOT_DIR, { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const sessions = [];
  for (const dirName of dirs) {
    const sessionId = dirName;
    const statePath = getSessionStatePath(sessionId);
    if (!existsSync(statePath)) continue;
    try {
      const state = await loadSessionState(sessionId);
      const stateStats = await stat(statePath);
      sessions.push({
        sessionId: state.sessionId,
        status: state.status,
        task: state.task,
        round: state.round,
        maxRounds: state.maxRounds,
        tmuxSessionName: state.tmuxSessionName || null,
        multiplexer: state.multiplexer || 'auto',
        multiplexerSessionName: state.multiplexerSessionName || null,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
        mtime: stateStats.mtimeMs,
      });
    } catch {
      // ignore corrupted session entries and continue
    }
  }

  sessions.sort((a, b) => b.mtime - a.mtime);
  return sessions.slice(0, Math.max(1, limit));
}

export async function loadTranscript(sessionId) {
  const transcriptPath = getTranscriptPath(sessionId);
  if (!existsSync(transcriptPath)) return [];
  const raw = await readFile(transcriptPath, 'utf8');
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export async function addAgentMessage(state, role, content) {
  const msg = {
    from: role,
    role,
    timestamp: new Date().toISOString(),
    content,
  };
  const updated = {
    ...state,
    messages: [...state.messages, msg],
  };
  await appendTranscript(state.sessionId, msg);
  return updated;
}

export async function addUserMessage(state, content) {
  const msg = {
    from: 'user',
    role: 'user',
    timestamp: new Date().toISOString(),
    content,
  };
  const updated = {
    ...state,
    messages: [...state.messages, msg],
  };
  await appendTranscript(state.sessionId, msg);
  return updated;
}

export async function stopSession(state, reason = 'stopped') {
  const updated = {
    ...state,
    status: reason,
    activeAgent: null,
  };
  return saveSessionState(updated);
}

export async function withSessionLock(sessionId, fn, options = {}) {
  const timeoutMs = Number.isInteger(options.timeoutMs) ? options.timeoutMs : 900000;
  const retryMs = Number.isInteger(options.retryMs) ? options.retryMs : 100;
  const lockPath = getSessionLockPath(sessionId);

  let handle = null;
  const started = Date.now();
  while (!handle) {
    try {
      handle = await open(lockPath, 'wx');
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
      if (Date.now() - started >= timeoutMs) {
        throw new Error(`Timed out waiting session lock for ${sessionId}`);
      }
      await sleep(retryMs);
    }
  }

  try {
    return await fn();
  } finally {
    try {
      await handle.close();
    } finally {
      await unlink(lockPath).catch(() => {});
    }
  }
}
