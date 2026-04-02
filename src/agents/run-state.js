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
    sharedContext: {
      decisions: [],
      openIssues: [],
      risks: [],
      actionItems: [],
      notes: [],
    },
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

export function extractFinalSummary(messages = [], run = null) {
  const agentMessages = messages.filter((msg) => msg?.from && msg.from !== 'user');
  if (agentMessages.length === 0) return '';
  const orderedRoles = ['planner', 'critic', 'coder', 'reviewer'];
  const lastByRole = new Map();
  for (const msg of agentMessages) lastByRole.set(msg.from, msg.content || '');

  const sections = ['# SynapseGrid Final Summary', ''];
  sections.push('## Per-role last contributions');
  for (const role of orderedRoles) {
    const content = String(lastByRole.get(role) || '').trim();
    sections.push(`- ${role}: ${content ? content.slice(0, 500) : '(none)'}`);
  }

  const shared = run?.sharedContext;
  if (shared && typeof shared === 'object') {
    const writeList = (title, items) => {
      sections.push('');
      sections.push(`## ${title}`);
      const list = Array.isArray(items) ? items.slice(-10) : [];
      if (list.length === 0) {
        sections.push('- (none)');
      } else {
        for (const item of list) sections.push(`- ${item}`);
      }
    };

    writeList('Decisions', shared.decisions);
    writeList('Open issues', shared.openIssues);
    writeList('Risks', shared.risks);
    writeList('Action items', shared.actionItems);
  }

  return sections.join('\n').trim();
}
