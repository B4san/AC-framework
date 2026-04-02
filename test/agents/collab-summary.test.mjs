import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMeetingSummary,
  createTurnRecord,
  summarizeText,
  updateSharedContext,
} from '../../src/agents/collab-summary.js';

test('summarizeText trims and truncates long strings', () => {
  assert.equal(summarizeText('  hello  '), 'hello');
  const long = 'a'.repeat(120);
  const summary = summarizeText(long, 20);
  assert.equal(summary.length, 20);
  assert.ok(summary.endsWith('...'));
});

test('createTurnRecord extracts key metadata', () => {
  const record = createTurnRecord({
    round: 2,
    role: 'critic',
    model: 'provider/model',
    content: '1) Analysis\n- risk: race condition\n- action: add lock',
    events: [{ type: 'message' }, { type: 'tool' }],
  });

  assert.equal(record.round, 2);
  assert.equal(record.role, 'critic');
  assert.equal(record.model, 'provider/model');
  assert.equal(record.eventCount, 2);
  assert.ok(Array.isArray(record.keyPoints));
  assert.ok(record.keyPoints.length >= 1);
});

test('updateSharedContext accumulates decisions/issues/risks/actions', () => {
  const first = updateSharedContext(null, {
    round: 1,
    role: 'planner',
    content: 'Decision: use workflow A\nOpen issue: auth edge case\nRisk: timeout',
  });

  assert.ok(first.decisions.some((v) => v.includes('Decision')));
  assert.ok(first.openIssues.some((v) => v.includes('Open issue')));
  assert.ok(first.risks.some((v) => v.includes('Risk')));

  const second = updateSharedContext(first, {
    round: 2,
    role: 'coder',
    content: 'Action: implement retry\nAgreed on API contract',
  });

  assert.ok(second.actionItems.some((v) => v.includes('Action')));
  assert.ok(second.decisions.some((v) => v.includes('Agreed')));
  assert.ok(second.notes.length >= first.notes.length);
});

test('buildMeetingSummary renders per-role recap and sections', () => {
  const markdown = buildMeetingSummary(
    [
      { from: 'planner', content: 'Plan step 1' },
      { from: 'critic', content: 'Risk: no rollback' },
      { from: 'coder', content: 'Action: implement test' },
      { from: 'reviewer', content: 'Decision: ready' },
    ],
    { runId: 'run-123', status: 'completed' },
    {
      decisions: ['use adapter'],
      openIssues: ['none'],
      risks: ['timeout'],
      actionItems: ['write tests'],
      notes: ['note'],
    }
  );

  assert.ok(markdown.includes('# SynapseGrid Meeting Summary'));
  assert.ok(markdown.includes('## Per-role recap'));
  assert.ok(markdown.includes('## Decisions'));
  assert.ok(markdown.includes('## Open issues'));
  assert.ok(markdown.includes('## Risks'));
  assert.ok(markdown.includes('## Action items'));
});
