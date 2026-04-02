import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveMultiplexer, spawnZellijSession, zellijSessionExists } from '../../src/agents/runtime.js';

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

test('spawnZellijSession launches detached zellij without --detach flag', async () => {
  const sessionDir = await mkdtemp(join(tmpdir(), 'acfm-zellij-test-'));
  let captured = null;
  let unrefCalled = false;
  let checks = 0;

  const spawnImpl = (command, args, options) => {
    captured = { command, args, options };
    return {
      unref() {
        unrefCalled = true;
      },
    };
  };

  const runCommandImpl = async () => {
    checks += 1;
    return {
      stdout: checks >= 2 ? 'acfm-synapse-test\n' : '',
      stderr: '',
    };
  };

  const result = await spawnZellijSession({
    sessionName: 'acfm-synapse-test',
    sessionDir,
    sessionId: 'session-123',
    binaryPath: '/tmp/fake-zellij',
    waitForSessionMs: 1000,
    pollIntervalMs: 1,
    runCommandImpl,
    spawnImpl,
  });

  assert.ok(result.layoutPath.endsWith('synapsegrid-layout.kdl'));
  assert.equal(captured.command, '/tmp/fake-zellij');
  assert.deepEqual(captured.args.slice(0, 2), ['--session', 'acfm-synapse-test']);
  assert.ok(captured.args.includes('--layout'));
  assert.equal(captured.args.includes('--detach'), false);
  assert.equal(captured.options.detached, true);
  assert.equal(captured.options.stdio, 'ignore');
  assert.equal(unrefCalled, true);
});

test('spawnZellijSession times out when session never appears', async () => {
  const sessionDir = await mkdtemp(join(tmpdir(), 'acfm-zellij-timeout-'));

  const spawnImpl = () => ({
    unref() {},
  });

  const runCommandImpl = async () => ({ stdout: '', stderr: '' });

  await assert.rejects(
    spawnZellijSession({
      sessionName: 'acfm-synapse-never',
      sessionDir,
      sessionId: 'session-456',
      binaryPath: '/tmp/fake-zellij',
      waitForSessionMs: 20,
      pollIntervalMs: 5,
      runCommandImpl,
      spawnImpl,
    }),
    /Timed out waiting for zellij session/
  );
});

test('zellijSessionExists parses list-sessions output robustly', async () => {
  const runCommandImpl = async () => ({
    stdout: 'my-session [Created 1m ago]\nother\n',
    stderr: '',
  });

  const exists = await zellijSessionExists('my-session', '/tmp/fake-zellij', { runCommandImpl });
  const missing = await zellijSessionExists('unknown-session', '/tmp/fake-zellij', { runCommandImpl });

  assert.equal(exists, true);
  assert.equal(missing, false);
});
