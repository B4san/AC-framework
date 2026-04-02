import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveMultiplexer } from '../../src/agents/runtime.js';

test('resolveMultiplexer prefers zellij when auto and available', () => {
  assert.equal(resolveMultiplexer('auto', true, true), 'zellij');
  assert.equal(resolveMultiplexer('auto', true, false), 'tmux');
  assert.equal(resolveMultiplexer('auto', false, true), 'zellij');
  assert.equal(resolveMultiplexer('auto', false, false), null);
});

test('resolveMultiplexer honors explicit selection', () => {
  assert.equal(resolveMultiplexer('zellij', true, true), 'zellij');
  assert.equal(resolveMultiplexer('zellij', true, false), null);
  assert.equal(resolveMultiplexer('tmux', true, true), 'tmux');
  assert.equal(resolveMultiplexer('tmux', false, true), null);
});
