import { Command } from 'commander';
import chalk from 'chalk';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COLLAB_ROLES,
  COLLAB_SYSTEM_NAME,
  CURRENT_SESSION_FILE,
  DEFAULT_MAX_ROUNDS,
  SESSION_ROOT_DIR,
} from '../agents/constants.js';
import { runWorkerIteration } from '../agents/orchestrator.js';
import {
  addUserMessage,
  createSession,
  getSessionDir,
  loadCurrentSessionId,
  loadSessionState,
  loadTranscript,
  listSessions,
  saveSessionState,
  setCurrentSession,
  stopSession,
} from '../agents/state-store.js';
import { ensureCollabDependencies, hasCommand } from '../services/dependency-installer.js';

function output(data, json) {
  if (json) {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
  }
}

function roleLogPath(sessionDir, role) {
  return resolve(sessionDir, `${role}.log`);
}

function tailLines(text, maxLines) {
  const lines = text.split('\n');
  const sliced = lines.slice(Math.max(lines.length - maxLines, 0));
  return sliced.join('\n').trimEnd();
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const runnerPath = resolve(__dirname, '../../bin/acfm.js');

function runTmux(command, args, options = {}) {
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

async function spawnTmuxSession({ sessionName, sessionDir, sessionId }) {
  const role0 = COLLAB_ROLES[0];
  await runTmux('tmux', [
    'new-session',
    '-d',
    '-s',
    sessionName,
    '-n',
    role0,
    `bash -lc 'node "${runnerPath}" agents worker --session ${sessionId} --role ${role0} >> "${roleLogPath(sessionDir, role0)}" 2>&1'`,
  ]);

  for (let idx = 1; idx < COLLAB_ROLES.length; idx += 1) {
    const role = COLLAB_ROLES[idx];
    await runTmux('tmux', [
      'split-window',
      '-t',
      sessionName,
      '-v',
      `bash -lc 'node "${runnerPath}" agents worker --session ${sessionId} --role ${role} >> "${roleLogPath(sessionDir, role)}" 2>&1'`,
    ]);
  }

  await runTmux('tmux', ['select-layout', '-t', sessionName, 'tiled']);
  await runTmux('tmux', ['set-option', '-t', sessionName, 'pane-border-status', 'top']);
  await runTmux('tmux', ['set-option', '-t', sessionName, 'pane-border-format', '#{pane_index}:#{pane_title}']);
}

async function ensureSessionId(required = true) {
  const sessionId = await loadCurrentSessionId();
  if (!sessionId && required) {
    throw new Error('No active collaborative session. Run: acfm agents start --task "..."');
  }
  return sessionId;
}

function printStartSummary(state) {
  console.log(chalk.green(`✓ ${COLLAB_SYSTEM_NAME} session started`));
  console.log(chalk.dim(`  Session: ${state.sessionId}`));
  console.log(chalk.dim(`  tmux: ${state.tmuxSessionName}`));
  console.log(chalk.dim(`  Task: ${state.task}`));
  console.log(chalk.dim(`  Roles: ${state.roles.join(', ')}`));
  console.log();
  console.log(chalk.cyan('Attach with:'));
  console.log(chalk.white(`  tmux attach -t ${state.tmuxSessionName}`));
  console.log();
  console.log(chalk.cyan('Interact with:'));
  console.log(chalk.white('  acfm agents send "your message"'));
}

function toMarkdownTranscript(state, transcript) {
  const lines = [
    `# SynapseGrid Session ${state.sessionId}`,
    '',
    `- Task: ${state.task}`,
    `- Status: ${state.status}`,
    `- Rounds: ${state.round}/${state.maxRounds}`,
    `- Roles: ${state.roles.join(', ')}`,
    `- Created: ${state.createdAt}`,
    `- Updated: ${state.updatedAt}`,
    '',
    '## Transcript',
    '',
  ];

  for (const msg of transcript) {
    const title = `### ${String(msg.from || 'unknown').toUpperCase()} · ${msg.timestamp || 'unknown-time'}`;
    lines.push(title);
    lines.push('');
    lines.push(typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content));
    lines.push('');
  }

  return lines.join('\n');
}

export function agentsCommand() {
  const agents = new Command('agents')
    .description(`${COLLAB_SYSTEM_NAME} — collaborative multi-agent system powered by OpenCode`);

  agents
    .command('setup')
    .description('Install optional collaboration dependencies (OpenCode + tmux)')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      const result = ensureCollabDependencies();
      output(result, opts.json);
      if (!opts.json) {
        const oLabel = result.opencode.success ? chalk.green('ok') : chalk.red('failed');
        const tLabel = result.tmux.success ? chalk.green('ok') : chalk.red('failed');
        console.log(`OpenCode: ${oLabel} - ${result.opencode.message}`);
        console.log(`tmux:     ${tLabel} - ${result.tmux.message}`);
      }
      if (!result.success) process.exit(1);
    });

  agents
    .command('list')
    .description('List SynapseGrid sessions from local storage')
    .option('--limit <n>', 'Max sessions to display', '20')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const limit = Number.parseInt(opts.limit, 10);
        if (!Number.isInteger(limit) || limit <= 0) {
          throw new Error('--limit must be a positive integer');
        }
        const sessions = await listSessions(limit);
        output({ count: sessions.length, sessions }, opts.json);
        if (!opts.json) {
          if (sessions.length === 0) {
            console.log(chalk.dim('No SynapseGrid sessions found.'));
            return;
          }
          console.log(chalk.bold('SynapseGrid Sessions'));
          for (const item of sessions) {
            console.log(
              `${chalk.cyan(item.sessionId.slice(0, 8))}  ${item.status.padEnd(10)}  ` +
              `round ${String(item.round).padStart(2)}/${String(item.maxRounds).padEnd(2)}  ` +
              `${item.tmuxSessionName || '-'}  ${item.task}`
            );
          }
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('attach')
    .description('Attach terminal to active SynapseGrid tmux session')
    .action(async () => {
      try {
        const sessionId = await ensureSessionId(true);
        const state = await loadSessionState(sessionId);
        if (!state.tmuxSessionName) {
          throw new Error('No tmux session registered for active collaborative session');
        }
        await runTmux('tmux', ['attach', '-t', state.tmuxSessionName], { stdio: 'inherit' });
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('resume')
    .description('Resume a previous session and optionally recreate tmux workers')
    .option('--session <id>', 'Session ID to resume (defaults to current)')
    .option('--no-recreate', 'Do not recreate tmux session/workers when missing')
    .option('--no-attach', 'Do not attach tmux after resume')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const sessionId = opts.session || await ensureSessionId(true);
        let state = await loadSessionState(sessionId);

        const tmuxSessionName = state.tmuxSessionName || `acfm-synapse-${state.sessionId.slice(0, 8)}`;
        let tmuxExists = false;
        if (hasCommand('tmux')) {
          try {
            await runTmux('tmux', ['has-session', '-t', tmuxSessionName]);
            tmuxExists = true;
          } catch {
            tmuxExists = false;
          }
        }

        if (!tmuxExists && opts.recreate) {
          if (!hasCommand('tmux')) {
            throw new Error('tmux is not installed. Run: acfm agents setup');
          }
          const sessionDir = getSessionDir(state.sessionId);
          await spawnTmuxSession({ sessionName: tmuxSessionName, sessionDir, sessionId: state.sessionId });
        }

        state = await saveSessionState({
          ...state,
          status: 'running',
          tmuxSessionName,
        });
        await setCurrentSession(state.sessionId);

        output({
          sessionId: state.sessionId,
          status: state.status,
          tmuxSessionName,
          recreatedTmux: !tmuxExists && Boolean(opts.recreate),
        }, opts.json);

        if (!opts.json) {
          console.log(chalk.green(`✓ Resumed session ${state.sessionId}`));
          console.log(chalk.dim(`  tmux: ${tmuxSessionName}`));
        }

        if (opts.attach) {
          await runTmux('tmux', ['attach', '-t', tmuxSessionName], { stdio: 'inherit' });
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('logs')
    .description('Show recent logs from collaborative workers')
    .option('--role <role>', 'Role to inspect (planner|critic|coder|reviewer|all)', 'all')
    .option('--lines <n>', 'Number of lines per role', '80')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const sessionId = await ensureSessionId(true);
        const state = await loadSessionState(sessionId);
        const requestedRole = String(opts.role || 'all');
        const lines = Number.parseInt(opts.lines, 10);
        if (!Number.isInteger(lines) || lines <= 0) {
          throw new Error('--lines must be a positive integer');
        }

        const roles = requestedRole === 'all' ? COLLAB_ROLES : [requestedRole];
        if (!roles.every((role) => COLLAB_ROLES.includes(role))) {
          throw new Error('Invalid --role value. Use planner|critic|coder|reviewer|all');
        }

        const sessionDir = getSessionDir(state.sessionId);
        const payload = roles.map((role) => {
          const logPath = roleLogPath(sessionDir, role);
          if (!existsSync(logPath)) {
            return { role, logPath, exists: false, content: '' };
          }
          const text = readFileSync(logPath, 'utf8');
          return {
            role,
            logPath,
            exists: true,
            content: tailLines(text, lines),
          };
        });

        output({ sessionId: state.sessionId, logs: payload }, opts.json);
        if (!opts.json) {
          for (const entry of payload) {
            console.log(chalk.bold(`\n[${entry.role}]`));
            if (!entry.exists) {
              console.log(chalk.dim('No logs yet'));
              continue;
            }
            console.log(entry.content || chalk.dim('(empty)'));
          }
          console.log();
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('export')
    .description('Export collaborative transcript')
    .option('--session <id>', 'Session ID to export (defaults to current)')
    .option('--format <fmt>', 'Export format: md|json', 'md')
    .option('--out <file>', 'Write export to output file')
    .option('--json', 'Output as JSON metadata')
    .action(async (opts) => {
      try {
        const sessionId = opts.session || await ensureSessionId(true);
        const state = await loadSessionState(sessionId);
        const transcript = await loadTranscript(sessionId);
        const format = String(opts.format || 'md').toLowerCase();
        if (!['md', 'json'].includes(format)) {
          throw new Error('--format must be md or json');
        }

        const payload = format === 'json'
          ? JSON.stringify({ state, transcript }, null, 2) + '\n'
          : toMarkdownTranscript(state, transcript) + '\n';

        if (opts.out) {
          const outputPath = resolve(opts.out);
          await mkdir(dirname(outputPath), { recursive: true });
          await writeFile(outputPath, payload, 'utf8');
          output({ sessionId, format, outputPath }, opts.json);
          if (!opts.json) console.log(chalk.green(`✓ Exported session to ${outputPath}`));
          return;
        }

        if (opts.json) {
          output({ sessionId, format, content: payload }, true);
          return;
        }

        process.stdout.write(payload);
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('start')
    .description('Start a collaborative session with 4 OpenCode worker panes')
    .requiredOption('--task <text>', 'Initial task from user')
    .option('--rounds <n>', 'Maximum collaboration rounds', String(DEFAULT_MAX_ROUNDS))
    .option('--model <id>', 'Model to use (provider/model)')
    .option('--cwd <path>', 'Working directory for agents', process.cwd())
    .option('--attach', 'Attach tmux immediately after start', false)
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        if (!hasCommand('opencode')) {
          throw new Error('OpenCode is not installed. Run: acfm agents setup');
        }
        if (!hasCommand('tmux')) {
          throw new Error('tmux is not installed. Run: acfm agents setup');
        }

        await mkdir(SESSION_ROOT_DIR, { recursive: true });
        const maxRounds = Number.parseInt(opts.rounds, 10);
        if (!Number.isInteger(maxRounds) || maxRounds <= 0) {
          throw new Error('--rounds must be a positive integer');
        }

        const state = await createSession(opts.task, {
          roles: COLLAB_ROLES,
          maxRounds,
          model: opts.model || null,
          workingDirectory: resolve(opts.cwd),
        });
        const tmuxSessionName = `acfm-synapse-${state.sessionId.slice(0, 8)}`;
        const sessionDir = getSessionDir(state.sessionId);
        const updated = await saveSessionState({
          ...state,
          tmuxSessionName,
        });

        await spawnTmuxSession({
          sessionName: tmuxSessionName,
          sessionDir,
          sessionId: state.sessionId,
        });

        output({ sessionId: updated.sessionId, tmuxSessionName, status: updated.status }, opts.json);
        if (!opts.json) {
          printStartSummary(updated);
        }

        if (opts.attach) {
          await runTmux('tmux', ['attach', '-t', tmuxSessionName], { stdio: 'inherit' });
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('send <message>')
    .description('Send a user message into the active collaborative session')
    .option('--json', 'Output as JSON')
    .action(async (message, opts) => {
      try {
        const sessionId = await ensureSessionId(true);
        let state = await loadSessionState(sessionId);
        state = await addUserMessage(state, message);
        state = await saveSessionState(state);
        output({ sessionId, accepted: true, messages: state.messages.length }, opts.json);
        if (!opts.json) console.log(chalk.green('✓ Message queued for collaborators'));
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('status')
    .description('Show status of the active collaborative session')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const sessionId = await ensureSessionId(true);
        const state = await loadSessionState(sessionId);
        output(state, opts.json);
        if (!opts.json) {
          console.log(chalk.bold(`${COLLAB_SYSTEM_NAME} Status`));
          console.log(chalk.dim(`Session: ${state.sessionId}`));
          console.log(chalk.dim(`Status: ${state.status}`));
          console.log(chalk.dim(`Round: ${state.round}/${state.maxRounds}`));
          console.log(chalk.dim(`Active agent: ${state.activeAgent || 'none'}`));
          console.log(chalk.dim(`Messages: ${state.messages.length}`));
          if (state.tmuxSessionName) {
            console.log(chalk.dim(`tmux: ${state.tmuxSessionName}`));
          }
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('stop')
    .description('Stop current collaborative session')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const sessionId = await ensureSessionId(true);
        let state = await loadSessionState(sessionId);
        state = await stopSession(state, 'stopped');
        if (state.tmuxSessionName && hasCommand('tmux')) {
          try {
            await runTmux('tmux', ['kill-session', '-t', state.tmuxSessionName]);
          } catch {
            // ignore if already closed
          }
        }
        output({ sessionId: state.sessionId, status: state.status }, opts.json);
        if (!opts.json) console.log(chalk.green('✓ Collaborative session stopped'));
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('worker')
    .description('Internal worker loop for a single collaborative role')
    .requiredOption('--session <id>', 'Session id')
    .requiredOption('--role <role>', 'Role name')
    .option('--poll-ms <n>', 'Polling interval in ms', '1200')
    .action(async (opts) => {
      const role = String(opts.role);
      const pollMs = Number.parseInt(opts.pollMs, 10);
      if (!COLLAB_ROLES.includes(role)) {
        console.error(`Invalid role: ${role}`);
        process.exit(1);
      }

      if (!existsSync(CURRENT_SESSION_FILE)) {
        console.error('No active session metadata found.');
        process.exit(1);
      }

      while (true) {
        try {
          const state = await loadSessionState(opts.session);
          if (!state.roles.includes(role)) {
            console.log(`[${role}] role not configured in session. exiting.`);
            process.exit(0);
          }
          if (state.status !== 'running') {
            console.log(`[${role}] session is ${state.status}. exiting.`);
            process.exit(0);
          }

          const nextState = await runWorkerIteration(opts.session, role, {
            cwd: state.workingDirectory || process.cwd(),
            model: state.model || null,
          });
          const latest = nextState.messages[nextState.messages.length - 1];
          if (latest?.from === role) {
            console.log(`[${role}] message emitted (${latest.content.length} chars)`);
          }
        } catch (error) {
          console.error(`[${role}] loop error: ${error.message}`);
        }

        await new Promise((resolvePromise) => setTimeout(resolvePromise, Number.isInteger(pollMs) ? pollMs : 1200));
      }
    });

  return agents;
}
