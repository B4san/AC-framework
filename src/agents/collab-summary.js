export function summarizeText(text, maxLen = 700) {
  if (typeof text !== 'string') return '';
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return '';
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLen - 3)).trimEnd()}...`;
}

export function extractBulletLines(text, limit = 5) {
  if (typeof text !== 'string') return [];
  const bullets = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\)\s+/.test(line));
  return bullets.slice(0, Math.max(0, limit));
}

export function createTurnRecord({ round, role, model, content, events }) {
  const snippet = summarizeText(content, 1000);
  const keyPoints = extractBulletLines(content, 6);
  return {
    round,
    role,
    model: model || null,
    timestamp: new Date().toISOString(),
    snippet,
    keyPoints,
    eventCount: Array.isArray(events) ? events.length : 0,
  };
}

export function updateSharedContext(prev, turn) {
  const base = prev && typeof prev === 'object'
    ? prev
    : { decisions: [], openIssues: [], risks: [], actionItems: [], notes: [] };

  const next = {
    decisions: [...(base.decisions || [])],
    openIssues: [...(base.openIssues || [])],
    risks: [...(base.risks || [])],
    actionItems: [...(base.actionItems || [])],
    notes: [...(base.notes || [])],
  };

  const summary = summarizeText(turn?.snippet || turn?.content || '', 300);
  if (summary) {
    next.notes.push(`[r${turn.round}] ${turn.role}: ${summary}`);
  }

  const lines = String(turn?.snippet || turn?.content || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('risk') || lower.includes('failure') || lower.includes('blind spot')) {
      next.risks.push(`[r${turn.round}] ${turn.role}: ${line}`);
    }
    if (lower.includes('open issue') || lower.includes('blocker') || lower.includes('unresolved')) {
      next.openIssues.push(`[r${turn.round}] ${turn.role}: ${line}`);
    }
    if (lower.includes('action') || lower.includes('next step') || lower.includes('implement')) {
      next.actionItems.push(`[r${turn.round}] ${turn.role}: ${line}`);
    }
    if (lower.includes('decision') || lower.includes('agreed') || lower.includes('approve')) {
      next.decisions.push(`[r${turn.round}] ${turn.role}: ${line}`);
    }
  }

  const dedupe = (arr) => [...new Set(arr)].slice(-30);
  return {
    decisions: dedupe(next.decisions),
    openIssues: dedupe(next.openIssues),
    risks: dedupe(next.risks),
    actionItems: dedupe(next.actionItems),
    notes: dedupe(next.notes),
  };
}

export function buildMeetingSummary(messages = [], run = null, sharedContext = null) {
  const byRole = new Map();
  for (const msg of messages) {
    if (!msg?.from || msg.from === 'user') continue;
    if (!byRole.has(msg.from)) byRole.set(msg.from, []);
    byRole.get(msg.from).push(msg.content || '');
  }

  const roles = ['planner', 'critic', 'coder', 'reviewer'];
  const lines = [];
  lines.push('# SynapseGrid Meeting Summary');
  if (run?.runId) lines.push(`Run: ${run.runId}`);
  if (run?.status) lines.push(`Status: ${run.status}`);
  lines.push('');
  lines.push('## Per-role recap');

  for (const role of roles) {
    const items = byRole.get(role) || [];
    const last = items.length > 0 ? items[items.length - 1] : '';
    lines.push(`- ${role}: ${summarizeText(last, 500) || '(no contribution captured)'}`);
  }

  const ctx = sharedContext && typeof sharedContext === 'object' ? sharedContext : null;
  if (ctx) {
    lines.push('');
    lines.push('## Decisions');
    for (const entry of (ctx.decisions || []).slice(-8)) lines.push(`- ${entry}`);
    lines.push('');
    lines.push('## Open issues');
    for (const entry of (ctx.openIssues || []).slice(-8)) lines.push(`- ${entry}`);
    lines.push('');
    lines.push('## Risks');
    for (const entry of (ctx.risks || []).slice(-8)) lines.push(`- ${entry}`);
    lines.push('');
    lines.push('## Action items');
    for (const entry of (ctx.actionItems || []).slice(-8)) lines.push(`- ${entry}`);
  }

  return lines.join('\n').trim() + '\n';
}
