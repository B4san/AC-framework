import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COLLAB_ROLES } from './constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const runnerPath = resolve(__dirname, '../../bin/acfm.js');

export function roleLogPath(sessionDir, role) {
  return resolve(sessionDir, `${role}.log`);
}

export function runTmux(command, args, options = {}) {
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
    `bash -lc 'node "${runnerPath}" agents worker --session ${sessionId} --role ${role0} 2>&1 | tee -a "${role0Log}"'`,
  ]);

  for (let idx = 1; idx < COLLAB_ROLES.length; idx += 1) {
    const role = COLLAB_ROLES[idx];
    const roleLog = roleLogPath(sessionDir, role);
    await runTmux('tmux', [
      'split-window',
      '-t',
      sessionName,
      '-v',
      `bash -lc 'node "${runnerPath}" agents worker --session ${sessionId} --role ${role} 2>&1 | tee -a "${roleLog}"'`,
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
