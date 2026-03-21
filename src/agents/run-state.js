import { randomUUID } from 'node:crypto';
import {
  DEFAULT_ROLE_RETRIES,
  DEFAULT_ROLE_TIMEOUT_MS,
  DEFAULT_MAX_ROUNDS,
} from './constants.js';

export function normalizeRunPolicy(policy = {}, maxRounds = DEFAULT_MAX_ROUNDS) {
  const timeoutPerRoleMs = Number.isInteger(policy.timeoutPerRoleMs) && policy.timeoutPerRoleMs > 0
    ? policy.timeoutPerRoleMs
    : DEFAULT_ROLE_TIMEOUT_MS;
  const retryOnTimeout = Number.isInteger(policy.retryOnTimeout) && policy.retryOnTimeout >= 0
    ? policy.retryOnTimeout
    : DEFAULT_ROLE_RETRIES;
  const fallbackOnFailure = ['retry', 'skip', 'abort'].includes(policy.fallbackOnFailure)
    ? policy.fallbackOnFailure
    : 'abort';
  const rounds = Number.isInteger(maxRounds) && maxRounds > 0 ? maxRounds : DEFAULT_MAX_ROUNDS;

  return {
    timeoutPerRoleMs,
    retryOnTimeout,
    fallbackOnFailure,
    maxRounds: rounds,
  };
}

export function createRunState(policy = {}, maxRounds = DEFAULT_MAX_ROUNDS) {
  return {
    runId: randomUUID(),
    status: 'idle',
    startedAt: null,
    finishedAt: null,
    currentRole: null,
    retriesUsed: {},
    round: 1,
    events: [],
    finalSummary: null,
    lastError: null,
    policy: normalizeRunPolicy(policy, maxRounds),
  };
}

export function appendRunEvent(run, type, details = {}) {
  const event = {
    id: randomUUID(),
    type,
    timestamp: new Date().toISOString(),
    ...details,
  };
  const events = [...(run.events || []), event];
  return {
    ...run,
    events,
  };
}

export function roleRetryCount(run, role) {
  return Number(run?.retriesUsed?.[role] || 0);
}

export function incrementRoleRetry(run, role) {
  return {
    ...run,
    retriesUsed: {
      ...(run.retriesUsed || {}),
      [role]: roleRetryCount(run, role) + 1,
    },
  };
}

export function extractFinalSummary(messages = []) {
  const agentMessages = messages.filter((msg) => msg?.from && msg.from !== 'user');
  if (agentMessages.length === 0) return '';
  const lastByRole = new Map();
  for (const msg of agentMessages) {
    lastByRole.set(msg.from, msg.content || '');
  }
  const orderedRoles = ['planner', 'critic', 'coder', 'reviewer'];
  const parts = [];
  for (const role of orderedRoles) {
    const content = lastByRole.get(role);
    if (typeof content === 'string' && content.trim()) {
      parts.push(`## ${role}\n${content.trim()}`);
    }
  }
  return parts.join('\n\n');
}
