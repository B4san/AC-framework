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

test('spawnZellijSession uses attach --create-background without --detach flag', async () => {
  const sessionDir = await mkdtemp(join(tmpdir(), 'acfm-zellij-test-'));
  const calls = [];
  let checks = 0;

  const runCommandImpl = async (command, args, options = {}) => {
    calls.push({ command, args, options });
    if (args[0] === 'list-sessions') {
      checks += 1;
      return {
        stdout: checks >= 2 ? 'acfm-synapse-test\n' : '',
        stderr: '',
      };
    }

    if (args[0] === '--layout') {
      return { stdout: '', stderr: '' };
    }

    checks += 1;
    return {
      stdout: '',
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
  });

  assert.ok(result.layoutPath.endsWith('synapsegrid-layout.kdl'));
  const creationCall = calls.find((call) => call.args[0] === '--layout');
  assert.ok(creationCall);
  assert.equal(creationCall.command, '/tmp/fake-zellij');
  assert.deepEqual(creationCall.args, [
    '--layout',
    result.layoutPath,
    'attach',
    '--create-background',
    'acfm-synapse-test',
  ]);
  assert.equal(creationCall.args.includes('--detach'), false);
});

test('spawnZellijSession times out when session never appears', async () => {
  const sessionDir = await mkdtemp(join(tmpdir(), 'acfm-zellij-timeout-'));

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
    }),
    /Timed out waiting for zellij session/
  );
});

test('zellijSessionExists parses list-sessions output robustly with ANSI', async () => {
  const runCommandImpl = async () => ({
    stdout: '\u001b[32;1mmy-session\u001b[m [Created 1m ago]\nother\n',
    stderr: '',
  });

  const exists = await zellijSessionExists('my-session', '/tmp/fake-zellij', { runCommandImpl });
  const missing = await zellijSessionExists('unknown-session', '/tmp/fake-zellij', { runCommandImpl });

  assert.equal(exists, true);
  assert.equal(missing, false);
});
