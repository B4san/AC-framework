import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { COLLAB_ROLES } from './constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const runnerPath = resolve(__dirname, '../../bin/acfm.js');

export function roleLogPath(sessionDir, role) {
  return resolve(sessionDir, `${role}.log`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      stdio: options.stdio || 'pipe',
      env: process.env,
    });

    let stderr = '';
    let stdout = '';
    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
    }
    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });
    }

    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise({ stdout, stderr });
        return;
      }
      rejectPromise(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
  });
}

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function stripAnsi(text) {
  return String(text || '').replace(/\x1B\[[0-9;]*m/g, '');
}

async function commandSupports(command, args, pattern, runner) {
  try {
    const result = await runner(command, args);
    return pattern.test(`${result.stdout || ''}\n${result.stderr || ''}`);
  } catch {
    return false;
  }
}

export async function probeZellijCapabilities(binaryPath, options = {}) {
  const runner = options.runCommandImpl || runCommand;
  const command = binaryPath || process.env.ACFM_ZELLIJ_BIN || 'zellij';
  const capabilities = {
    binary: command,
    version: null,
    attachCreateBackground: false,
    actionNewTabLayout: false,
    actionNewPane: false,
    listPanesJson: false,
    setupCheck: false,
  };

  try {
    const versionResult = await runner(command, ['--version']);
    capabilities.version = stripAnsi(versionResult.stdout || versionResult.stderr || '').trim() || null;
  } catch {
    capabilities.version = null;
  }

  capabilities.attachCreateBackground = await commandSupports(
    command,
    ['attach', '--help'],
    /--create-background/,
    runner,
  );
  capabilities.actionNewTabLayout = await commandSupports(
    command,
    ['action', 'new-tab', '--help'],
    /--layout/,
    runner,
  );
  capabilities.actionNewPane = await commandSupports(
    command,
    ['action', 'new-pane', '--help'],
    /USAGE:/,
    runner,
  );
  capabilities.listPanesJson = await commandSupports(
    command,
    ['action', 'list-panes', '--help'],
    /--json/,
    runner,
  );
  capabilities.setupCheck = await commandSupports(
    command,
    ['setup', '--help'],
    /--check/,
    runner,
  );

  return capabilities;
}

function workerShellCommand(sessionId, role, roleLog) {
  return `node "${runnerPath}" agents worker --session ${sessionId} --role ${role} 2>&1 | tee -a "${roleLog}"`;
}

function workerCommand(sessionId, role, roleLog) {
  const shell = workerShellCommand(sessionId, role, roleLog);
  return `bash -lc '${shell}'`;
}

export async function runTmux(command, args, options = {}) {
  return runCommand(command, args, options);
}

export async function spawnTmuxSession({ sessionName, sessionDir, sessionId }) {
  const role0 = COLLAB_ROLES[0];
  const role0Log = roleLogPath(sessionDir, role0);
  await runTmux('tmux', [
    'new-session',
    '-d',
    '-s',
    sessionName,
    '-n',
    role0,
    workerCommand(sessionId, role0, role0Log),
  ]);

  for (let idx = 1; idx < COLLAB_ROLES.length; idx += 1) {
    const role = COLLAB_ROLES[idx];
    const roleLog = roleLogPath(sessionDir, role);
    await runTmux('tmux', [
      'split-window',
      '-t',
      sessionName,
      '-v',
      workerCommand(sessionId, role, roleLog),
    ]);
  }

  await runTmux('tmux', ['select-layout', '-t', sessionName, 'tiled']);
  await runTmux('tmux', ['set-option', '-t', sessionName, 'pane-border-status', 'top']);
  await runTmux('tmux', ['set-option', '-t', sessionName, 'pane-border-format', '#{pane_index}:#{pane_title}']);
}

export async function tmuxSessionExists(sessionName) {
  try {
    await runTmux('tmux', ['has-session', '-t', sessionName]);
    return true;
  } catch {
    return false;
  }
}

async function writeZellijLayout({ layoutPath, sessionId, sessionDir }) {
  const paneNode = (role) => {
    const roleLog = roleLogPath(sessionDir, role);
    const cmd = workerCommand(sessionId, role, roleLog).replace(/"/g, '\\"');
    return [
      `                    pane name="${role}" command="bash" {`,
      `                        args "-lc" "${cmd}"`,
      '                    }',
    ].join('\n');
  };

  const content = [
    'layout {',
    '    pane split_direction="vertical" {',
    '        pane split_direction="horizontal" {',
    paneNode(COLLAB_ROLES[0]),
    paneNode(COLLAB_ROLES[1]),
    '        }',
    '        pane split_direction="horizontal" {',
    paneNode(COLLAB_ROLES[2]),
    paneNode(COLLAB_ROLES[3]),
    '        }',
    '    }',
    '}',
    '',
  ].join('\n');

  await writeFile(layoutPath, content, 'utf8');
}

export async function spawnZellijSession({
  sessionName,
  sessionDir,
  sessionId,
  binaryPath,
  waitForSessionMs = 10000,
  pollIntervalMs = 250,
  runCommandImpl,
  capabilities = null,
}) {
  const layoutPath = resolve(sessionDir, 'synapsegrid-layout.kdl');
  await writeZellijLayout({ layoutPath, sessionId, sessionDir });
  const command = binaryPath || process.env.ACFM_ZELLIJ_BIN || 'zellij';
  const runner = runCommandImpl || runCommand;
  const caps = capabilities || await probeZellijCapabilities(binaryPath, { runCommandImpl: runner });
  const strategyErrors = [];

  const existing = await zellijSessionExists(sessionName, binaryPath, { runCommandImpl: runner });
  if (existing) {
    return { layoutPath, strategy: 'already_exists', capabilities: caps, strategyErrors };
  }

  const strategies = [];
  if (caps.attachCreateBackground) {
    strategies.push({
      name: 'attach_with_layout',
      run: async () => {
        await runner(command, ['--layout', layoutPath, 'attach', '--create-background', sessionName], {
          cwd: sessionDir,
        });
      },
    });
  }

  if (caps.attachCreateBackground && caps.actionNewTabLayout) {
    strategies.push({
      name: 'attach_then_newtab_layout',
      run: async () => {
        await runner(command, ['attach', '--create-background', sessionName], { cwd: sessionDir });
        await runner(command, ['--session', sessionName, 'action', 'new-tab', '--name', 'SynapseGrid', '--layout', layoutPath], {
          cwd: sessionDir,
        });
      },
    });
  }

  if (caps.attachCreateBackground && caps.actionNewPane) {
    strategies.push({
      name: 'attach_then_action_panes',
      run: async () => {
        await runner(command, ['attach', '--create-background', sessionName], { cwd: sessionDir });
        const role0 = COLLAB_ROLES[0];
        const role0Log = roleLogPath(sessionDir, role0);
        await runner(
          command,
          ['--session', sessionName, 'action', 'new-tab', '--name', 'SynapseGrid', '--', 'bash', '-lc', workerShellCommand(sessionId, role0, role0Log)],
          { cwd: sessionDir },
        );

        const role1 = COLLAB_ROLES[1];
        const role1Log = roleLogPath(sessionDir, role1);
        await runner(
          command,
          ['--session', sessionName, 'action', 'new-pane', '--direction', 'right', '--', 'bash', '-lc', workerShellCommand(sessionId, role1, role1Log)],
          { cwd: sessionDir },
        );

        const role2 = COLLAB_ROLES[2];
        const role2Log = roleLogPath(sessionDir, role2);
        await runner(
          command,
          ['--session', sessionName, 'action', 'new-pane', '--direction', 'down', '--', 'bash', '-lc', workerShellCommand(sessionId, role2, role2Log)],
          { cwd: sessionDir },
        );

        const role3 = COLLAB_ROLES[3];
        const role3Log = roleLogPath(sessionDir, role3);
        await runner(
          command,
          ['--session', sessionName, 'action', 'new-pane', '--direction', 'right', '--', 'bash', '-lc', workerShellCommand(sessionId, role3, role3Log)],
          { cwd: sessionDir },
        );
      },
    });
  }

  let strategyUsed = null;
  for (const strategy of strategies) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await strategy.run();
      strategyUsed = strategy.name;
      break;
    } catch (error) {
      strategyErrors.push({ strategy: strategy.name, error: error.message });
    }
  }

  if (!strategyUsed) {
    const details = strategyErrors.map((item) => `${item.strategy}: ${item.error}`).join(' | ');
    throw new Error(`Unable to initialize zellij session using supported strategies. ${details || 'No compatible strategy available.'}`);
  }

  const startedAt = Date.now();
  while ((Date.now() - startedAt) < waitForSessionMs) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await zellijSessionExists(sessionName, binaryPath, { runCommandImpl: runner });
    if (exists) {
      return { layoutPath, strategy: strategyUsed, capabilities: caps, strategyErrors };
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(pollIntervalMs);
  }

  throw new Error(
    `Timed out waiting for zellij session '${sessionName}' to start (binary: ${command}, strategy: ${strategyUsed || 'none'}). ` +
    'Try `acfm agents doctor` or fallback with `acfm agents start --mux tmux ...`'
  );
}

export async function zellijSessionExists(sessionName, binaryPath, options = {}) {
  try {
    const runner = options.runCommandImpl || runCommand;
    const command = binaryPath || process.env.ACFM_ZELLIJ_BIN || 'zellij';
    const result = await runner(command, ['list-sessions']);
    const lines = stripAnsi(result.stdout)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    return lines.some((line) => {
      if (line === sessionName || line.startsWith(`${sessionName} `)) return true;
      return line.includes(sessionName);
    });
  } catch {
    return false;
  }
}

export async function runZellij(args, options = {}) {
  const command = options.binaryPath || process.env.ACFM_ZELLIJ_BIN || 'zellij';
  return runCommand(command, args, options);
}

export function resolveMultiplexer(preferred = 'auto', hasTmuxCommand = false, hasZellijCommand = false) {
  if (preferred === 'tmux') {
    return hasTmuxCommand ? 'tmux' : null;
  }
  if (preferred === 'zellij') {
    return hasZellijCommand ? 'zellij' : null;
  }
  if (hasZellijCommand) return 'zellij';
  if (hasTmuxCommand) return 'tmux';
  return null;
}
