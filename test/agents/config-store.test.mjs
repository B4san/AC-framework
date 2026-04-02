import test from 'node:test';
import assert from 'node:assert/strict';

const HOME = process.env.HOME;
process.env.HOME = '/tmp/acfm-test-home';

const { loadAgentsConfig } = await import('../../src/agents/config-store.js');

test('loadAgentsConfig returns default multiplexer auto', async () => {
  const cfg = await loadAgentsConfig();
  assert.equal(cfg.agents.multiplexer, 'auto');
  assert.ok(typeof cfg.agents.defaultModel === 'string');
});

if (HOME) process.env.HOME = HOME;
