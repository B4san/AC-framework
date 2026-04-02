import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  probeZellijCapabilities,
  resolveMultiplexer,
  spawnZellijSession,
  zellijSessionExists,
} from '../../src/agents/runtime.js';

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
    capabilities: {
      binary: '/tmp/fake-zellij',
      version: 'zellij test',
      attachCreateBackground: true,
      actionNewTabLayout: false,
      actionNewPane: false,
      listPanesJson: true,
      setupCheck: true,
    },
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
      capabilities: {
        binary: '/tmp/fake-zellij',
        version: 'zellij test',
        attachCreateBackground: true,
        actionNewTabLayout: false,
        actionNewPane: false,
        listPanesJson: true,
        setupCheck: true,
      },
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

test('zellijSessionExists matches session names even with extra markers', async () => {
  const runCommandImpl = async () => ({
    stdout: '* my-session (EXITED - attach to resurrect)\n',
    stderr: '',
  });

  const exists = await zellijSessionExists('my-session', '/tmp/fake-zellij', { runCommandImpl });
  assert.equal(exists, true);
});

test('probeZellijCapabilities detects attach and action features', async () => {
  const runCommandImpl = async (_command, args) => {
    const key = args.join(' ');
    if (key === '--version') return { stdout: 'zellij 0.44.0\n', stderr: '' };
    if (key === 'attach --help') return { stdout: '... --create-background ...', stderr: '' };
    if (key === 'action new-tab --help') return { stdout: '... --layout ...', stderr: '' };
    if (key === 'action new-pane --help') return { stdout: 'USAGE: zellij action new-pane', stderr: '' };
    if (key === 'action list-panes --help') return { stdout: '... --json ...', stderr: '' };
    if (key === 'setup --help') return { stdout: '... --check ...', stderr: '' };
    return { stdout: '', stderr: '' };
  };

  const caps = await probeZellijCapabilities('/tmp/fake-zellij', { runCommandImpl });
  assert.equal(caps.version, 'zellij 0.44.0');
  assert.equal(caps.attachCreateBackground, true);
  assert.equal(caps.actionNewTabLayout, true);
  assert.equal(caps.actionNewPane, true);
  assert.equal(caps.listPanesJson, true);
  assert.equal(caps.setupCheck, true);
});

test('spawnZellijSession falls back to action strategy when layout attach fails', async () => {
  const sessionDir = await mkdtemp(join(tmpdir(), 'acfm-zellij-fallback-'));
  const calls = [];
  let listCount = 0;

  const runCommandImpl = async (_command, args) => {
    calls.push(args);
    if (args[0] === 'list-sessions') {
      listCount += 1;
      return { stdout: listCount >= 3 ? 'acfm-fallback\n' : '', stderr: '' };
    }
    if (args[0] === '--layout' && args[2] === 'attach') {
      throw new Error('layout strategy failed');
    }
    return { stdout: '', stderr: '' };
  };

  const capabilities = {
    binary: '/tmp/fake-zellij',
    version: 'zellij test',
    attachCreateBackground: true,
    actionNewTabLayout: true,
    actionNewPane: false,
    listPanesJson: true,
    setupCheck: true,
  };

  const result = await spawnZellijSession({
    sessionName: 'acfm-fallback',
    sessionDir,
    sessionId: 'session-fallback',
    binaryPath: '/tmp/fake-zellij',
    waitForSessionMs: 500,
    pollIntervalMs: 1,
    runCommandImpl,
    capabilities,
  });

  assert.equal(result.strategy, 'attach_then_newtab_layout');
  assert.ok(result.strategyErrors.some((entry) => entry.strategy === 'attach_with_layout'));
});

test('spawnZellijSession reports strategy failure details when all strategies fail', async () => {
  const sessionDir = await mkdtemp(join(tmpdir(), 'acfm-zellij-all-fail-'));
  const runCommandImpl = async (_command, args) => {
    if (args[0] === 'list-sessions') return { stdout: '', stderr: '' };
    throw new Error(`failed for: ${args.join(' ')}`);
  };

  const capabilities = {
    binary: '/tmp/fake-zellij',
    version: 'zellij test',
    attachCreateBackground: true,
    actionNewTabLayout: true,
    actionNewPane: true,
    listPanesJson: true,
    setupCheck: true,
  };

  await assert.rejects(
    spawnZellijSession({
      sessionName: 'acfm-all-fail',
      sessionDir,
      sessionId: 'session-all-fail',
      binaryPath: '/tmp/fake-zellij',
      waitForSessionMs: 100,
      pollIntervalMs: 1,
      runCommandImpl,
      capabilities,
    }),
    /Unable to initialize zellij session using supported strategies/
  );
});
