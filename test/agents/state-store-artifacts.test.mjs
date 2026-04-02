import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createSession, appendMeetingTurn, appendTurnRawCapture, sessionArtifactPaths } from '../../src/agents/state-store.js';

test('createSession bootstraps artifact scaffold', async () => {
  const state = await createSession('test artifact scaffold', { maxRounds: 1 });
  const paths = sessionArtifactPaths(state.sessionId);

  assert.ok(existsSync(paths.sessionDir));
  assert.ok(existsSync(paths.statePath));
  assert.ok(existsSync(paths.transcriptPath));
  assert.ok(existsSync(paths.turnsDir));
  assert.ok(existsSync(paths.turnsRawDir));
  assert.ok(existsSync(paths.meetingLogPath));
  assert.ok(existsSync(paths.meetingLogJsonlPath));
  assert.ok(existsSync(paths.meetingSummaryPath));
  assert.ok(existsSync(paths.diagnosticsPath));
});

test('appendTurnRawCapture writes raw ndjson/stderr/meta files', async () => {
  const state = await createSession('test raw capture', { maxRounds: 1 });
  const turn = {
    round: 1,
    role: 'planner',
    model: 'opencode/mimo-v2-pro-free',
    timestamp: new Date().toISOString(),
    snippet: 'output',
    keyPoints: [],
    eventCount: 1,
  };

  await appendMeetingTurn(state.sessionId, turn);
  const files = await appendTurnRawCapture(state.sessionId, turn, {
    stdout: '{"type":"message"}\n',
    stderr: 'warning\n',
    events: [{ type: 'message' }],
  });

  assert.ok(existsSync(files.ndjsonPath));
  assert.ok(existsSync(files.stderrPath));
  assert.ok(existsSync(files.metaPath));
});
