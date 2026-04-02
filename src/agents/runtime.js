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

function workerCommand(sessionId, role, roleLog) {
  return `bash -lc 'node "${runnerPath}" agents worker --session ${sessionId} --role ${role} 2>&1 | tee -a "${roleLog}"'`;
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
  const panes = COLLAB_ROLES.map((role) => {
    const roleLog = roleLogPath(sessionDir, role);
    const cmd = workerCommand(sessionId, role, roleLog).replace(/"/g, '\\"');
    return `                    pane name="${role}" command="bash" args { "-lc" "${cmd}" }`;
  });

  const content = [
    'layout {',
    '    default_tab_template {',
    '        tab name="SynapseGrid" {',
    '            pane split_direction="vertical" {',
    '                pane split_direction="horizontal" {',
    panes[0],
    panes[1],
    '                }',
    '                pane split_direction="horizontal" {',
    panes[2],
    panes[3],
    '                }',
    '            }',
    '        }',
    '    }',
    '}',
    '',
  ].join('\n');

  await writeFile(layoutPath, content, 'utf8');
}

export async function spawnZellijSession({ sessionName, sessionDir, sessionId, binaryPath }) {
  const layoutPath = resolve(sessionDir, 'synapsegrid-layout.kdl');
  await writeZellijLayout({ layoutPath, sessionId, sessionDir });
  const command = binaryPath || process.env.ACFM_ZELLIJ_BIN || 'zellij';
  await runCommand(command, ['--session', sessionName, '--layout', layoutPath, '--detach']);
  return { layoutPath };
}

export async function zellijSessionExists(sessionName, binaryPath) {
  try {
    const command = binaryPath || process.env.ACFM_ZELLIJ_BIN || 'zellij';
    const result = await runCommand(command, ['list-sessions']);
    const lines = result.stdout.split('\n').map((line) => line.trim()).filter(Boolean);
    return lines.some((line) => line === sessionName || line.startsWith(`${sessionName} `));
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
