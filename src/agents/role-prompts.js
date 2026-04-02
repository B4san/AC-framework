export const ROLE_SYSTEM_PROMPTS = {
  planner: [
    'You are the Planner in a collaborative engineering team.',
    'Your goal is to propose clear implementation strategy, scope, and sequencing.',
    'You must produce concrete, actionable guidance, not generic ideas.',
    'When responding, always consider user task and all prior teammate messages.',
  ].join(' '),
  critic: [
    'You are the Critic in a collaborative engineering team.',
    'You must identify at least two concrete risks, blind spots, or failure modes.',
    'Do not approve a plan without specific scrutiny.',
    'Propose mitigations with practical tradeoffs.',
  ].join(' '),
  coder: [
    'You are the Coder in a collaborative engineering team.',
    'Translate accepted plan and critique into implementation-level steps.',
    'Focus on APIs, file structure, edge cases, and validation strategy.',
    'Keep recommendations production-oriented and test-aware.',
  ].join(' '),
  reviewer: [
    'You are the Reviewer in a collaborative engineering team.',
    'Synthesize proposals, call out unresolved conflicts, and decide readiness.',
    'If unresolved issues remain, request another round and list blockers.',
    'If convergence is reached, produce a concise final plan.',
  ].join(' '),
};

function formatSharedContext(sharedContext) {
  if (!sharedContext || typeof sharedContext !== 'object') {
    return 'No shared summary yet.';
  }

  const sections = [
    ['Decisions', sharedContext.decisions],
    ['Open issues', sharedContext.openIssues],
    ['Risks', sharedContext.risks],
    ['Action items', sharedContext.actionItems],
    ['Notes', sharedContext.notes],
  ];

  const lines = [];
  for (const [name, list] of sections) {
    const items = Array.isArray(list) ? list.slice(-6) : [];
    lines.push(`${name}:`);
    if (items.length === 0) {
      lines.push('- (none)');
    } else {
      for (const item of items) {
        lines.push(`- ${item}`);
      }
    }
  }

  return lines.join('\n');
}

export function buildAgentPrompt({ role, task, round, messages, sharedContext = null, maxMessages = 18 }) {
  const recent = messages.slice(-maxMessages);
  const transcript = recent.length
    ? recent.map((msg, idx) => `${idx + 1}. [${msg.from}] ${msg.content}`).join('\n')
    : 'No previous messages.';
  const shared = formatSharedContext(sharedContext);

  return [
    `ROLE: ${role}`,
    `ROUND: ${round}`,
    '',
    `TASK: ${task}`,
    '',
    'SHARED CONTEXT SUMMARY:',
    shared,
    '',
    'TEAM TRANSCRIPT (latest first-order history):',
    transcript,
    '',
    'Respond with this structure:',
    '1) Analysis (short)',
    '2) Contribution (what you add)',
    '3) Open Issues (numbered, can be empty)',
  ].join('\n');
}
