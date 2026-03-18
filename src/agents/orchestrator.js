import { buildAgentPrompt, ROLE_SYSTEM_PROMPTS } from './role-prompts.js';
import { runOpenCodePrompt } from './opencode-client.js';
import { nextRole, shouldStop } from './scheduler.js';
import {
  addAgentMessage,
  loadSessionState,
  saveSessionState,
  stopSession,
  withSessionLock,
} from './state-store.js';

function buildRuntimePrompt({ state, role }) {
  const roleContext = ROLE_SYSTEM_PROMPTS[role] || '';
  const collaborativePrompt = buildAgentPrompt({
    role,
    task: state.task,
    round: state.round,
    messages: state.messages,
  });

  return [roleContext, '', collaborativePrompt].join('\n');
}

export async function runTurn(sessionId, options = {}) {
  return withSessionLock(sessionId, async () => {
    let state = await loadSessionState(sessionId);
    if (shouldStop(state)) {
      if (state.status === 'running') {
        state = await stopSession(state, 'completed');
      }
      return state;
    }

    const scheduled = nextRole(state);
    state = await saveSessionState({
      ...state,
      activeAgent: scheduled.role,
      nextRoleIndex: scheduled.nextRoleIndex,
      round: scheduled.round,
    });

    const prompt = buildRuntimePrompt({ state, role: scheduled.role });
    let content;
    try {
      content = await runOpenCodePrompt({
        prompt,
        cwd: options.cwd || process.cwd(),
        model: options.model,
        agent: options.agent,
        timeoutMs: options.timeoutMs,
      });
    } catch (error) {
      content = `Agent failed: ${error.message}`;
    }

    state = await addAgentMessage(state, scheduled.role, content);
    state = await saveSessionState({
      ...state,
      activeAgent: null,
    });

    if (shouldStop(state)) {
      state = await stopSession(state, 'completed');
    }

    return state;
  });
}

export async function prepareNextTurn(sessionId) {
  return withSessionLock(sessionId, async () => {
    let state = await loadSessionState(sessionId);
    if (shouldStop(state)) {
      if (state.status === 'running') {
        state = await stopSession(state, 'completed');
      }
      return state;
    }

    if (state.activeAgent) {
      return state;
    }

    const scheduled = nextRole(state);
    return saveSessionState({
      ...state,
      activeAgent: scheduled.role,
      nextRoleIndex: scheduled.nextRoleIndex,
      round: scheduled.round,
    });
  });
}

export async function executeActiveTurn(sessionId, role, options = {}) {
  return withSessionLock(sessionId, async () => {
    let state = await loadSessionState(sessionId);
    if (state.status !== 'running') {
      return state;
    }

    if (state.activeAgent !== role) {
      return state;
    }

    const prompt = buildRuntimePrompt({ state, role });
    let content;
    try {
      content = await runOpenCodePrompt({
        prompt,
        cwd: options.cwd || process.cwd(),
        model: options.model,
        agent: options.agent,
        timeoutMs: options.timeoutMs,
      });
    } catch (error) {
      content = `Agent failed: ${error.message}`;
    }

    state = await addAgentMessage(state, role, content);
    state = await saveSessionState({
      ...state,
      activeAgent: null,
    });

    if (shouldStop(state)) {
      state = await stopSession(state, 'completed');
    }

    return state;
  });
}

export async function runWorkerIteration(sessionId, role, options = {}) {
  return withSessionLock(sessionId, async () => {
    let state = await loadSessionState(sessionId);
    if (state.status !== 'running') return state;
    if (!state.roles.includes(role)) return state;

    if (!state.activeAgent) {
      const scheduled = nextRole(state);
      state = await saveSessionState({
        ...state,
        activeAgent: scheduled.role,
        nextRoleIndex: scheduled.nextRoleIndex,
        round: scheduled.round,
      });
    }

    if (state.activeAgent !== role) {
      return state;
    }

    const prompt = buildRuntimePrompt({ state, role });
    let content;
    try {
      content = await runOpenCodePrompt({
        prompt,
        cwd: options.cwd || process.cwd(),
        model: options.model,
        agent: options.agent,
        timeoutMs: options.timeoutMs,
      });
    } catch (error) {
      content = `Agent failed: ${error.message}`;
    }

    state = await addAgentMessage(state, role, content);
    state = await saveSessionState({
      ...state,
      activeAgent: null,
    });

    if (shouldStop(state)) {
      state = await stopSession(state, 'completed');
    }

    return state;
  });
}
