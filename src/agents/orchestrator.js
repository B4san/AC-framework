import { buildAgentPrompt, ROLE_SYSTEM_PROMPTS } from './role-prompts.js';
import { runOpenCodePrompt } from './opencode-client.js';
import { nextRole, shouldStop } from './scheduler.js';
import { resolveRoleModel } from './model-selection.js';
import {
  appendRunEvent,
  extractFinalSummary,
  incrementRoleRetry,
  roleRetryCount,
} from './run-state.js';
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

function ensureRunState(state) {
  if (state.run && typeof state.run === 'object') return state.run;
  return {
    runId: null,
    status: 'idle',
    startedAt: null,
    finishedAt: null,
    currentRole: null,
    retriesUsed: {},
    round: state.round || 1,
    events: [],
    finalSummary: null,
    lastError: null,
    policy: {
      timeoutPerRoleMs: 180000,
      retryOnTimeout: 1,
      fallbackOnFailure: 'abort',
      maxRounds: state.maxRounds,
    },
  };
}

function applyRoleFailurePolicy(state, role, errorMessage) {
  let run = ensureRunState(state);
  const policy = run.policy || {};
  const currentRetries = roleRetryCount(run, role);
  const canRetry = currentRetries < (policy.retryOnTimeout ?? 0);

  run = appendRunEvent(run, 'role_failed', {
    role,
    retry: canRetry,
    error: errorMessage,
  });

  if (canRetry) {
    run = incrementRoleRetry(run, role);
    return {
      ...state,
      run: {
        ...run,
        currentRole: role,
        status: 'running',
        lastError: null,
      },
      activeAgent: null,
      // retry same role by rewinding index
      nextRoleIndex: state.roles.indexOf(role),
    };
  }

  const fallback = policy.fallbackOnFailure || 'abort';
  if (fallback === 'skip') {
    const skipped = appendRunEvent(run, 'role_skipped', { role, error: errorMessage });
    return {
      ...state,
      run: {
        ...skipped,
        currentRole: null,
        status: 'running',
        lastError: null,
      },
      activeAgent: null,
    };
  }

  const failed = appendRunEvent(run, 'run_failed', { role, error: errorMessage });
  return {
    ...state,
    status: 'failed',
    activeAgent: null,
    run: {
      ...failed,
      status: 'failed',
      currentRole: null,
      finishedAt: new Date().toISOString(),
      lastError: {
        code: 'ROLE_FAILURE',
        message: errorMessage,
        role,
      },
    },
  };
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
      const effectiveModel = resolveRoleModel(state, scheduled.role, options.model);
      content = await runOpenCodePrompt({
        prompt,
        cwd: options.cwd || process.cwd(),
        model: effectiveModel,
        agent: options.agent,
        binaryPath: options.opencodeBin,
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
      const effectiveModel = resolveRoleModel(state, role, options.model);
      content = await runOpenCodePrompt({
        prompt,
        cwd: options.cwd || process.cwd(),
        model: effectiveModel,
        agent: options.agent,
        binaryPath: options.opencodeBin,
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

    const run = ensureRunState(state);
    if (run.status === 'cancelled' || run.status === 'failed' || run.status === 'completed') {
      return state;
    }

    if (!state.activeAgent) {
      const scheduled = nextRole(state);
      const startedRun = run.status === 'idle'
        ? appendRunEvent({
          ...run,
          status: 'running',
          startedAt: new Date().toISOString(),
          currentRole: scheduled.role,
          round: scheduled.round,
        }, 'run_started', { round: scheduled.round })
        : appendRunEvent({
          ...run,
          currentRole: scheduled.role,
          round: scheduled.round,
        }, 'role_scheduled', { role: scheduled.role, round: scheduled.round });

      state = await saveSessionState({
        ...state,
        activeAgent: scheduled.role,
        nextRoleIndex: scheduled.nextRoleIndex,
        round: scheduled.round,
        run: startedRun,
      });
    }

    if (state.activeAgent !== role) {
      return state;
    }

    const prompt = buildRuntimePrompt({ state, role });
    let content;
    let failed = false;
    let errorMessage = '';
    try {
      const effectiveModel = resolveRoleModel(state, role, options.model);
      state = await saveSessionState({
        ...state,
        run: appendRunEvent({
          ...ensureRunState(state),
          currentRole: role,
          status: 'running',
        }, 'role_started', { role, model: effectiveModel }),
      });
      content = await runOpenCodePrompt({
        prompt,
        cwd: options.cwd || process.cwd(),
        model: effectiveModel,
        agent: options.agent,
        binaryPath: options.opencodeBin,
        timeoutMs: options.timeoutMs || ensureRunState(state).policy?.timeoutPerRoleMs || 180000,
      });
    } catch (error) {
      failed = true;
      errorMessage = error.message;
      content = `Agent failed: ${error.message}`;
    }

    state = await addAgentMessage(state, role, content);
    if (failed) {
      state = await saveSessionState(applyRoleFailurePolicy(state, role, errorMessage));
      return state;
    }

    const succeededRun = appendRunEvent({
      ...ensureRunState(state),
      currentRole: null,
      lastError: null,
    }, 'role_succeeded', { role, chars: content.length });

    state = await saveSessionState({
      ...state,
      activeAgent: null,
      run: succeededRun,
    });

    if (shouldStop(state)) {
      state = await stopSession(state, 'completed');
      const finalRun = appendRunEvent({
        ...ensureRunState(state),
        status: 'completed',
        finishedAt: new Date().toISOString(),
        finalSummary: extractFinalSummary(state.messages),
      }, 'run_completed', { round: state.round });
      state = await saveSessionState({
        ...state,
        run: finalRun,
      });
    }

    return state;
  });
}
