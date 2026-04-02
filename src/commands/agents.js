import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  COLLAB_ROLES,
  COLLAB_SYSTEM_NAME,
  CURRENT_SESSION_FILE,
  DEFAULT_MAX_ROUNDS,
  DEFAULT_SYNAPSE_MODEL,
  SESSION_ROOT_DIR,
} from '../agents/constants.js';
import { listOpenCodeModels, runOpenCodePrompt } from '../agents/opencode-client.js';
import { runWorkerIteration } from '../agents/orchestrator.js';
import {
  addUserMessage,
  createSession,
  ensureSessionArtifacts,
  getSessionDir,
  loadCurrentSessionId,
  loadSessionState,
  loadTranscript,
  listSessions,
  saveSessionState,
  setCurrentSession,
  stopSession,
  sessionArtifactPaths,
  writeMeetingSummary,
} from '../agents/state-store.js';
import {
  roleLogPath,
  runTmux,
  runZellij,
  spawnTmuxSession,
  spawnZellijSession,
  tmuxSessionExists,
  zellijSessionExists,
  resolveMultiplexer,
} from '../agents/runtime.js';
import { getAgentsConfigPath, loadAgentsConfig, updateAgentsConfig } from '../agents/config-store.js';
import {
  buildEffectiveRoleModels,
  isValidModelId,
  normalizeModelId,
  sanitizeRoleModels,
} from '../agents/model-selection.js';
import {
  ensureCollabDependencies,
  hasCommand,
  resolveCommandPath,
  resolveManagedZellijPath,
  installManagedZellijLatest,
} from '../services/dependency-installer.js';

function output(data, json) {
  if (json) {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
  }
}

function tailLines(text, maxLines) {
  const lines = text.split('\n');
  const sliced = lines.slice(Math.max(lines.length - maxLines, 0));
  return sliced.join('\n').trimEnd();
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
  const multiplexer = state.multiplexer || 'auto';
  const muxSessionName = state.multiplexerSessionName || state.tmuxSessionName || '-';
  console.log(chalk.dim(`  Multiplexer: ${multiplexer}`));
  console.log(chalk.dim(`  Session name: ${muxSessionName}`));
  console.log(chalk.dim(`  Task: ${state.task}`));
  console.log(chalk.dim(`  Roles: ${state.roles.join(', ')}`));
  console.log();
  console.log(chalk.cyan('Attach with:'));
  if (multiplexer === 'zellij') {
    console.log(chalk.white(`  zellij attach ${muxSessionName}`));
  } else {
    console.log(chalk.white(`  tmux attach -t ${muxSessionName}`));
  }
  console.log(chalk.white('  acfm agents live'));
  console.log();
  console.log(chalk.cyan('Interact with:'));
  console.log(chalk.white('  acfm agents send "your message"'));
}

function validateMultiplexer(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!['auto', 'zellij', 'tmux'].includes(normalized)) {
    throw new Error('--mux must be one of: auto|zellij|tmux');
  }
  return normalized;
}

function sessionMuxName(state) {
  return state.multiplexerSessionName || state.tmuxSessionName || `acfm-synapse-${state.sessionId.slice(0, 8)}`;
}

async function sessionExistsForMux(multiplexer, sessionName, zellijPath = null) {
  if (multiplexer === 'zellij') return zellijSessionExists(sessionName, zellijPath);
  return tmuxSessionExists(sessionName);
}

function resolveConfiguredZellijPath(config) {
  const strategy = config?.agents?.zellij?.strategy || 'auto';
  if (strategy === 'system') {
    return resolveCommandPath('zellij');
  }
  const managed = resolveManagedZellijPath(config);
  if (managed) return managed;
  return resolveCommandPath('zellij');
}

function shouldUseManagedZellij(config) {
  const strategy = config?.agents?.zellij?.strategy || 'auto';
  if (strategy === 'managed') return true;
  if (strategy === 'system') return false;
  return true;
}

function resolveMultiplexerWithPaths(config, requestedMux = 'auto') {
  const zellijPath = resolveConfiguredZellijPath(config);
  const tmuxPath = resolveCommandPath('tmux');
  const selected = resolveMultiplexer(requestedMux, Boolean(tmuxPath), Boolean(zellijPath));
  return {
    selected,
    zellijPath,
    tmuxPath,
  };
}

async function attachToMux(multiplexer, sessionName, readonly = false, zellijPath = null) {
  if (multiplexer === 'zellij') {
    await runZellij(['attach', sessionName], { stdio: 'inherit', binaryPath: zellijPath });
    return;
  }
  const args = ['attach'];
  if (readonly) args.push('-r');
  args.push('-t', sessionName);
  await runTmux('tmux', args, { stdio: 'inherit' });
}

function toMarkdownTranscript(state, transcript) {
  const displayedRound = Math.min(state.round, state.maxRounds);
  const lines = [
    `# SynapseGrid Session ${state.sessionId}`,
    '',
    `- Task: ${state.task}`,
    `- Status: ${state.status}`,
    `- Rounds: ${displayedRound}/${state.maxRounds}`,
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

function parseRoleModelOptions(opts) {
  return sanitizeRoleModels({
    planner: opts.modelPlanner,
    critic: opts.modelCritic,
    coder: opts.modelCoder,
    reviewer: opts.modelReviewer,
  });
}

function assertValidModelIdOrNull(label, value) {
  const normalized = normalizeModelId(value);
  if (!normalized) return null;
  if (!isValidModelId(normalized)) {
    throw new Error(`${label} must be in provider/model format`);
  }
  return normalized;
}

function printModelConfig(state) {
  const effectiveRoleModels = buildEffectiveRoleModels(state, state.model || null);
  console.log(chalk.bold('\nModel configuration'));
  console.log(chalk.dim(`  Global fallback: ${state.model || '(opencode default)'}`));
  for (const role of COLLAB_ROLES) {
    const configured = state.roleModels?.[role] || '-';
    const effective = effectiveRoleModels[role] || '(opencode default)';
    console.log(chalk.dim(`  ${role.padEnd(8)} configured=${configured} effective=${effective}`));
  }
}

function groupModelsByProvider(models) {
  const grouped = new Map();
  for (const model of models) {
    const [provider, ...rest] = model.split('/');
    if (!provider || rest.length === 0) continue;
    const modelName = rest.join('/');
    if (!grouped.has(provider)) grouped.set(provider, []);
    grouped.get(provider).push(modelName);
  }
  for (const [provider, modelNames] of grouped.entries()) {
    grouped.set(provider, [...new Set(modelNames)].sort((a, b) => a.localeCompare(b)));
  }
  return grouped;
}

function runSummary(state) {
  const run = state.run || {};
  const events = Array.isArray(run.events) ? run.events.length : 0;
  return {
    status: run.status || 'idle',
    runId: run.runId || null,
    currentRole: run.currentRole || null,
    lastError: run.lastError || null,
    events,
  };
}

async function readSessionArtifact(sessionId, filename) {
  const path = resolve(getSessionDir(sessionId), filename);
  if (!existsSync(path)) return null;
  return readFile(path, 'utf8');
}

async function collectArtifactStatus(sessionId) {
  await ensureSessionArtifacts(sessionId);
  const paths = sessionArtifactPaths(sessionId);
  return {
    sessionId,
    checkedAt: new Date().toISOString(),
    artifacts: Object.fromEntries(
      Object.entries(paths).map(([key, value]) => [key, { path: value, exists: existsSync(value) }])
    ),
  };
}

async function preflightModel({ opencodeBin, model, cwd }) {
  const selected = normalizeModelId(model) || DEFAULT_SYNAPSE_MODEL;
  try {
    await runOpenCodePrompt({
      prompt: 'Reply with exactly: OK',
      cwd,
      model: selected,
      binaryPath: opencodeBin,
      timeoutMs: 45000,
    });
    return { ok: true, model: selected };
  } catch (error) {
    return { ok: false, model: selected, error: error.message };
  }
}

export function agentsCommand() {
  const agents = new Command('agents')
    .description(`${COLLAB_SYSTEM_NAME} — collaborative multi-agent system powered by OpenCode`);

  agents.addHelpText('after', `
Examples:
  acfm agents start --task "Implement auth flow" --mux auto
  acfm agents setup
  acfm agents artifacts
  acfm agents runtime get
  acfm agents runtime install-zellij
  acfm agents runtime set zellij
  acfm agents model choose
  acfm agents model list
  acfm agents transcript --role all --limit 40
  acfm agents summary
  acfm agents export --format md --out ./session.md
`);

  agents
    .command('setup')
    .description('Install optional collaboration dependencies (OpenCode + zellij/tmux)')
    .option('--yes', 'Install dependencies without interactive confirmation', false)
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      let installZellij = true;
      let installTmux = true;

      if (!opts.yes && !opts.json) {
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'installZellij',
            message: 'Install zellij (recommended, multiplatform backend)?',
            default: true,
          },
          {
            type: 'confirm',
            name: 'installTmux',
            message: 'Install tmux as fallback backend?',
            default: true,
          },
        ]);
        installZellij = Boolean(answers.installZellij);
        installTmux = Boolean(answers.installTmux);
      }

      const result = ensureCollabDependencies({
        installZellij,
        installTmux,
        preferManagedZellij: installZellij,
      });
      const awaited = await result;
      let collabMcp = null;

      if (awaited.success) {
        const { detectAndInstallMCPs } = await import('../services/mcp-installer.js');
        collabMcp = detectAndInstallMCPs({ target: 'collab' });
      }

      const payload = { ...awaited, collabMcp };
      output(payload, opts.json);
      if (!opts.json) {
        const oLabel = awaited.opencode.success ? chalk.green('ok') : chalk.red('failed');
        const tLabel = awaited.tmux.success ? chalk.green('ok') : chalk.red('failed');
        const zLabel = awaited.zellij.success ? chalk.green('ok') : chalk.red('failed');
        console.log(`OpenCode: ${oLabel} - ${awaited.opencode.message}`);
        console.log(`zellij:   ${zLabel} - ${awaited.zellij.message}`);
        if (awaited.zellij.binaryPath) {
          console.log(chalk.dim(`          ${awaited.zellij.binaryPath}`));
        }
        console.log(`tmux:     ${tLabel} - ${awaited.tmux.message}`);
        if (collabMcp) {
          console.log(`Collab MCP: ${chalk.green('ok')} - installed ${collabMcp.success}/${collabMcp.installed} on detected assistants`);
        }
      }

      if (awaited.zellij.success && awaited.zellij.source === 'managed' && awaited.zellij.binaryPath) {
        await updateAgentsConfig((current) => ({
          agents: {
            defaultModel: current.agents.defaultModel,
            defaultRoleModels: { ...current.agents.defaultRoleModels },
            multiplexer: current.agents.multiplexer || 'auto',
            zellij: {
              strategy: 'managed',
              binaryPath: awaited.zellij.binaryPath,
              version: awaited.zellij.version || null,
              source: 'managed',
            },
          },
        }));
      }

      if (!awaited.success) process.exit(1);
    });

  agents
    .command('install-mcps')
    .description('Install SynapseGrid MCP server into detected AI assistants')
    .option('--all', 'Install for all supported assistants, without detection', false)
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const { detectAndInstallMCPs, installAllMCPs, ASSISTANTS, isAssistantInstalled } = await import('../services/mcp-installer.js');
        const result = opts.all
          ? installAllMCPs({ target: 'collab' })
          : detectAndInstallMCPs({ target: 'collab' });

        output({ total: result.total ?? result.installed, success: result.success, target: 'collab' }, opts.json);

        if (!opts.json) {
          if (!opts.all) {
            if (result.installed === 0) {
              console.log(chalk.yellow('No AI assistants detected.'));
              console.log(chalk.dim('Use --all to install for all supported assistants.'));
              return;
            }
            for (const assistant of ASSISTANTS) {
              if (isAssistantInstalled(assistant)) {
                console.log(
                  chalk.hex('#00B894')('◆ ') + chalk.bold(assistant.name) +
                  chalk.dim(` → ${assistant.configPath}`)
                );
              }
            }
          }
          console.log(chalk.green(`\n✓ SynapseGrid MCP installed (${result.success}/${result.total ?? result.installed})`));
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('uninstall-mcps')
    .description('Uninstall SynapseGrid MCP server from detected AI assistants')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const { uninstallAllMCPs } = await import('../services/mcp-installer.js');
        const result = uninstallAllMCPs({ target: 'collab' });
        output({ success: result.success, target: 'collab' }, opts.json);
        if (!opts.json) {
          console.log(chalk.green(`✓ SynapseGrid MCP uninstalled (${result.success})`));
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
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
              `${item.multiplexer || 'auto'}:${item.multiplexerSessionName || item.tmuxSessionName || '-'}  ${item.task}`
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
    .description('Attach terminal to active SynapseGrid multiplexer session')
    .action(async () => {
      try {
        const sessionId = await ensureSessionId(true);
        const state = await loadSessionState(sessionId);
        const cfg = await loadAgentsConfig();
        const zellijPath = resolveConfiguredZellijPath(cfg);
        const multiplexer = state.multiplexer || 'tmux';
        const muxSessionName = sessionMuxName(state);
        if (!muxSessionName) {
          throw new Error('No multiplexer session registered for active collaborative session');
        }
        await attachToMux(multiplexer, muxSessionName, false, zellijPath);
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('live')
    .description('Attach to live collaboration view (all agent panes)')
    .option('--readonly', 'Attach in read-only mode', false)
    .action(async (opts) => {
      try {
        const sessionId = await ensureSessionId(true);
        const state = await loadSessionState(sessionId);
        const cfg = await loadAgentsConfig();
        const zellijPath = resolveConfiguredZellijPath(cfg);
        const multiplexer = state.multiplexer || 'tmux';
        const muxSessionName = sessionMuxName(state);
        if (!muxSessionName) {
          throw new Error('No multiplexer session registered for active collaborative session');
        }
        const sessionExists = await sessionExistsForMux(multiplexer, muxSessionName, zellijPath);
        if (!sessionExists) {
          throw new Error(`${multiplexer} session ${muxSessionName} no longer exists. Run: acfm agents resume`);
        }
        await attachToMux(multiplexer, muxSessionName, Boolean(opts.readonly), zellijPath);
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('resume')
    .description('Resume a previous session and optionally recreate multiplexer workers')
    .option('--session <id>', 'Session ID to resume (defaults to current)')
    .option('--no-recreate', 'Do not recreate multiplexer session/workers when missing')
    .option('--no-attach', 'Do not attach multiplexer after resume')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const sessionId = opts.session || await ensureSessionId(true);
        let state = await loadSessionState(sessionId);
        const multiplexer = state.multiplexer || 'tmux';
        const cfg = await loadAgentsConfig();
        const zellijPath = resolveConfiguredZellijPath(cfg);
        const tmuxPath = resolveCommandPath('tmux');

        if (multiplexer === 'zellij' && !zellijPath) {
          throw new Error('zellij is not installed. Run: acfm agents setup');
        }
        if (multiplexer === 'tmux' && !tmuxPath) {
          throw new Error('tmux is not installed. Run: acfm agents setup');
        }

        const muxSessionName = sessionMuxName(state);
        const muxExists = await sessionExistsForMux(multiplexer, muxSessionName, zellijPath);

        if (!muxExists && opts.recreate) {
          const sessionDir = getSessionDir(state.sessionId);
          if (multiplexer === 'zellij') {
            await spawnZellijSession({
              sessionName: muxSessionName,
              sessionDir,
              sessionId: state.sessionId,
              binaryPath: zellijPath,
            });
          } else {
            await spawnTmuxSession({ sessionName: muxSessionName, sessionDir, sessionId: state.sessionId });
          }
        }

        state = await saveSessionState({
          ...state,
          status: 'running',
          multiplexer,
          multiplexerSessionName: muxSessionName,
          tmuxSessionName: multiplexer === 'tmux' ? muxSessionName : (state.tmuxSessionName || null),
        });
        await setCurrentSession(state.sessionId);

        output({
          sessionId: state.sessionId,
          status: state.status,
          multiplexer,
          multiplexerSessionName: muxSessionName,
          recreatedSession: !muxExists && Boolean(opts.recreate),
        }, opts.json);

        if (!opts.json) {
          console.log(chalk.green(`✓ Resumed session ${state.sessionId}`));
          console.log(chalk.dim(`  ${multiplexer}: ${muxSessionName}`));
        }

        if (opts.attach) {
          await attachToMux(multiplexer, muxSessionName, false, zellijPath);
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

  const model = agents
    .command('model')
    .description('Manage default SynapseGrid model configuration');

  const runtime = agents
    .command('runtime')
    .description('Manage SynapseGrid runtime backend settings');

  runtime
    .command('get')
    .description('Show configured multiplexer backend')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const cfg = await loadAgentsConfig();
        const configured = validateMultiplexer(cfg.agents.multiplexer || 'auto');
        const zellijPath = resolveConfiguredZellijPath(cfg);
        const tmuxPath = resolveCommandPath('tmux');
        const resolved = resolveMultiplexer(configured, Boolean(tmuxPath), Boolean(zellijPath));
        const payload = {
          configPath: getAgentsConfigPath(),
          multiplexer: configured,
          resolved,
          available: {
            zellij: Boolean(zellijPath),
            tmux: Boolean(tmuxPath),
          },
          zellij: cfg.agents.zellij,
          zellijPath,
        };
        output(payload, opts.json);
        if (!opts.json) {
          console.log(chalk.bold('SynapseGrid runtime backend'));
          console.log(chalk.dim(`Config: ${payload.configPath}`));
          console.log(chalk.dim(`Configured: ${configured}`));
          console.log(chalk.dim(`Resolved: ${resolved || 'none'}`));
          console.log(chalk.dim(`zellij=${payload.available.zellij} tmux=${payload.available.tmux}`));
          if (payload.zellijPath) {
            console.log(chalk.dim(`zellij path: ${payload.zellijPath}`));
          }
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  runtime
    .command('set <mux>')
    .description('Set multiplexer backend: auto|zellij|tmux')
    .option('--json', 'Output as JSON')
    .action(async (mux, opts) => {
      try {
        const selected = validateMultiplexer(mux);
        const updated = await updateAgentsConfig((current) => ({
          agents: {
            defaultModel: current.agents.defaultModel,
            defaultRoleModels: { ...current.agents.defaultRoleModels },
            multiplexer: selected,
            zellij: {
              ...(current.agents.zellij || { strategy: 'auto', binaryPath: null, version: null, source: null }),
            },
          },
        }));
        const zellijPath = resolveConfiguredZellijPath(updated);
        const tmuxPath = resolveCommandPath('tmux');
        const resolved = resolveMultiplexer(updated.agents.multiplexer, Boolean(tmuxPath), Boolean(zellijPath));
        const payload = {
          success: true,
          configPath: getAgentsConfigPath(),
          multiplexer: updated.agents.multiplexer,
          resolved,
        };
        output(payload, opts.json);
        if (!opts.json) {
          console.log(chalk.green('✓ SynapseGrid runtime backend updated'));
          console.log(chalk.dim(`  Configured: ${payload.multiplexer}`));
          console.log(chalk.dim(`  Resolved: ${payload.resolved || 'none'}`));
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  runtime
    .command('install-zellij')
    .description('Install latest zellij release managed by AC Framework')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const result = await installManagedZellijLatest();
        if (!result.success) {
          output(result, opts.json);
          if (!opts.json) console.error(chalk.red(`Error: ${result.message}`));
          process.exit(1);
        }

        await updateAgentsConfig((current) => ({
          agents: {
            defaultModel: current.agents.defaultModel,
            defaultRoleModels: { ...current.agents.defaultRoleModels },
            multiplexer: current.agents.multiplexer || 'auto',
            zellij: {
              strategy: result.source === 'system' ? 'system' : 'managed',
              binaryPath: result.binaryPath,
              version: result.version || null,
              source: result.source || 'managed',
            },
          },
        }));

        output(result, opts.json);
        if (!opts.json) {
          console.log(chalk.green('✓ Managed zellij ready'));
          console.log(chalk.dim(`  Version: ${result.version || 'unknown'}`));
          console.log(chalk.dim(`  Binary: ${result.binaryPath}`));
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  model
    .command('list')
    .description('List available OpenCode models grouped by provider')
    .option('--refresh', 'Refresh model cache from providers', false)
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const opencodeBin = resolveCommandPath('opencode');
        if (!opencodeBin) {
          throw new Error('OpenCode binary not found. Run: acfm agents setup');
        }

        const models = await listOpenCodeModels({
          binaryPath: opencodeBin,
          refresh: Boolean(opts.refresh),
        });
        const grouped = groupModelsByProvider(models);
        const providers = [...grouped.keys()].sort((a, b) => a.localeCompare(b));

        const payload = {
          count: models.length,
          providers: providers.map((provider) => ({
            provider,
            models: grouped.get(provider).map((name) => `${provider}/${name}`),
          })),
        };

        output(payload, opts.json);
        if (!opts.json) {
          console.log(chalk.bold('Available OpenCode models'));
          console.log(chalk.dim(`Total: ${models.length}`));
          for (const provider of providers) {
            const providerModels = grouped.get(provider) || [];
            console.log(chalk.cyan(`\n${provider}`));
            for (const modelName of providerModels) {
              console.log(chalk.dim(`- ${provider}/${modelName}`));
            }
          }
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  model
    .command('get')
    .description('Show configured default global/per-role models')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const config = await loadAgentsConfig();
        const payload = {
          configPath: getAgentsConfigPath(),
          defaultModel: config.agents.defaultModel,
          defaultRoleModels: config.agents.defaultRoleModels,
          multiplexer: config.agents.multiplexer,
        };
        output(payload, opts.json);
        if (!opts.json) {
          console.log(chalk.bold('SynapseGrid default models'));
          console.log(chalk.dim(`Config: ${payload.configPath}`));
          console.log(chalk.dim(`Global fallback: ${payload.defaultModel || '(none)'}`));
          for (const role of COLLAB_ROLES) {
            console.log(chalk.dim(`- ${role}: ${payload.defaultRoleModels[role] || '(none)'}`));
          }
          console.log(chalk.dim(`Multiplexer: ${payload.multiplexer || 'auto'}`));
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  model
    .command('choose')
    .description('Interactively choose a default model by provider and role')
    .option('--refresh', 'Refresh model cache from providers', false)
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const opencodeBin = resolveCommandPath('opencode');
        if (!opencodeBin) {
          throw new Error('OpenCode binary not found. Run: acfm agents setup');
        }

        const models = await listOpenCodeModels({
          binaryPath: opencodeBin,
          refresh: Boolean(opts.refresh),
        });
        if (models.length === 0) {
          throw new Error('No models returned by OpenCode. Run: opencode auth list, opencode models --refresh');
        }

        const grouped = groupModelsByProvider(models);
        const providerChoices = [...grouped.keys()]
          .sort((a, b) => a.localeCompare(b))
          .map((provider) => ({
            name: `${provider} (${(grouped.get(provider) || []).length})`,
            value: provider,
          }));

        const { provider } = await inquirer.prompt([
          {
            type: 'list',
            name: 'provider',
            message: 'Select model provider',
            choices: providerChoices,
          },
        ]);

        const selectedProviderModels = grouped.get(provider) || [];
        const { modelName } = await inquirer.prompt([
          {
            type: 'list',
            name: 'modelName',
            message: `Select model from ${provider}`,
            pageSize: 20,
            choices: selectedProviderModels.map((name) => ({ name, value: name })),
          },
        ]);

        const roleChoices = [
          { name: 'Global fallback (all roles)', value: 'all' },
          ...COLLAB_ROLES.map((role) => ({ name: `Role: ${role}`, value: role })),
        ];
        const { role } = await inquirer.prompt([
          {
            type: 'list',
            name: 'role',
            message: 'Apply model to',
            choices: roleChoices,
          },
        ]);

        const modelId = `${provider}/${modelName}`;
        const updated = await updateAgentsConfig((current) => {
          const next = {
            agents: {
              defaultModel: current.agents.defaultModel,
              defaultRoleModels: { ...current.agents.defaultRoleModels },
              multiplexer: current.agents.multiplexer || 'auto',
              zellij: {
                ...(current.agents.zellij || { strategy: 'auto', binaryPath: null, version: null, source: null }),
              },
            },
          };

          if (role === 'all') {
            next.agents.defaultModel = modelId;
          } else {
            next.agents.defaultRoleModels = {
              ...next.agents.defaultRoleModels,
              [role]: modelId,
            };
          }

          return next;
        });

        const payload = {
          success: true,
          selected: {
            role,
            provider,
            model: modelId,
          },
          configPath: getAgentsConfigPath(),
          defaultModel: updated.agents.defaultModel,
          defaultRoleModels: updated.agents.defaultRoleModels,
        };

        output(payload, opts.json);
        if (!opts.json) {
          console.log(chalk.green('✓ SynapseGrid model selected and saved'));
          console.log(chalk.dim(`  Target: ${role === 'all' ? 'global fallback' : `role ${role}`}`));
          console.log(chalk.dim(`  Model: ${modelId}`));
          console.log(chalk.dim(`  Config: ${payload.configPath}`));
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  model
    .command('set <modelId>')
    .description('Set default model globally or for a specific role')
    .option('--role <role>', 'planner|critic|coder|reviewer|all', 'all')
    .option('--json', 'Output as JSON')
    .action(async (modelId, opts) => {
      try {
        const role = String(opts.role || 'all');
        const normalized = assertValidModelIdOrNull('model', modelId);
        if (!normalized) throw new Error('model must be provided');
        if (role !== 'all' && !COLLAB_ROLES.includes(role)) {
          throw new Error('--role must be planner|critic|coder|reviewer|all');
        }

        const updated = await updateAgentsConfig((current) => {
          const next = {
            agents: {
              defaultModel: current.agents.defaultModel,
              defaultRoleModels: { ...current.agents.defaultRoleModels },
              multiplexer: current.agents.multiplexer || 'auto',
              zellij: {
                ...(current.agents.zellij || { strategy: 'auto', binaryPath: null, version: null, source: null }),
              },
            },
          };
          if (role === 'all') {
            next.agents.defaultModel = normalized;
          } else {
            next.agents.defaultRoleModels = {
              ...next.agents.defaultRoleModels,
              [role]: normalized,
            };
          }
          return next;
        });

        const payload = {
          success: true,
          configPath: getAgentsConfigPath(),
          defaultModel: updated.agents.defaultModel,
          defaultRoleModels: updated.agents.defaultRoleModels,
        };
        output(payload, opts.json);
        if (!opts.json) {
          console.log(chalk.green('✓ SynapseGrid model configuration updated'));
          console.log(chalk.dim(`  Config: ${payload.configPath}`));
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  model
    .command('clear')
    .description('Clear default model globally or for a specific role')
    .option('--role <role>', 'planner|critic|coder|reviewer|all', 'all')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const role = String(opts.role || 'all');
        if (role !== 'all' && !COLLAB_ROLES.includes(role)) {
          throw new Error('--role must be planner|critic|coder|reviewer|all');
        }

        const updated = await updateAgentsConfig((current) => {
          const next = {
            agents: {
              defaultModel: current.agents.defaultModel,
              defaultRoleModels: { ...current.agents.defaultRoleModels },
              multiplexer: current.agents.multiplexer || 'auto',
              zellij: {
                ...(current.agents.zellij || { strategy: 'auto', binaryPath: null, version: null, source: null }),
              },
            },
          };
          if (role === 'all') {
            next.agents.defaultModel = DEFAULT_SYNAPSE_MODEL;
            next.agents.defaultRoleModels = {};
          } else {
            const currentRoles = { ...next.agents.defaultRoleModels };
            delete currentRoles[role];
            next.agents.defaultRoleModels = currentRoles;
          }
          return next;
        });

        const payload = {
          success: true,
          configPath: getAgentsConfigPath(),
          defaultModel: updated.agents.defaultModel,
          defaultRoleModels: updated.agents.defaultRoleModels,
        };
        output(payload, opts.json);
        if (!opts.json) {
          console.log(chalk.green('✓ SynapseGrid model configuration cleared'));
          console.log(chalk.dim(`  Config: ${payload.configPath}`));
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('transcript')
    .description('Show collaborative transcript (optionally filtered by role)')
    .option('--session <id>', 'Session ID (defaults to current)')
    .option('--role <role>', 'Role filter (planner|critic|coder|reviewer|all)', 'all')
    .option('--limit <n>', 'Max messages to display', '40')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const sessionId = opts.session || await ensureSessionId(true);
        const role = String(opts.role || 'all');
        const limit = Number.parseInt(opts.limit, 10);
        if (!Number.isInteger(limit) || limit <= 0) {
          throw new Error('--limit must be a positive integer');
        }
        if (role !== 'all' && !COLLAB_ROLES.includes(role)) {
          throw new Error('--role must be planner|critic|coder|reviewer|all');
        }

        const transcript = await loadTranscript(sessionId);
        const filtered = transcript
          .filter((msg) => role === 'all' || msg.from === role)
          .slice(-limit);

        output({ sessionId, count: filtered.length, transcript: filtered }, opts.json);
        if (!opts.json) {
          console.log(chalk.bold(`SynapseGrid transcript (${filtered.length})`));
          for (const msg of filtered) {
            console.log(chalk.cyan(`\n[${msg.from}] ${msg.timestamp || ''}`));
            console.log(String(msg.content || '').trim() || chalk.dim('(empty)'));
          }
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('summary')
    .description('Show meeting summary generated from collaborative run')
    .option('--session <id>', 'Session ID (defaults to current)')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const sessionId = opts.session || await ensureSessionId(true);
        const state = await loadSessionState(sessionId);
        const summaryFile = await readSessionArtifact(sessionId, 'meeting-summary.md');
        const meetingLogFile = await readSessionArtifact(sessionId, 'meeting-log.md');
        const payload = {
          sessionId,
          status: state.status,
          finalSummary: state.run?.finalSummary || null,
          sharedContext: state.run?.sharedContext || null,
          summaryFile,
          meetingLogFile,
        };

        output(payload, opts.json);
        if (!opts.json) {
          console.log(chalk.bold('SynapseGrid meeting summary'));
          if (summaryFile) {
            process.stdout.write(summaryFile.endsWith('\n') ? summaryFile : `${summaryFile}\n`);
          } else if (payload.finalSummary) {
            process.stdout.write(`${payload.finalSummary}\n`);
          } else {
            console.log(chalk.dim('No summary generated yet.'));
          }
        }
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  agents
    .command('artifacts')
    .description('Show SynapseGrid artifact paths and existence status')
    .option('--session <id>', 'Session ID (defaults to current)')
    .option('--watch', 'Continuously watch artifact status', false)
    .option('--interval <ms>', 'Polling interval in milliseconds for --watch', '1500')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const sessionId = opts.session || await ensureSessionId(true);
        const intervalMs = Number.parseInt(opts.interval, 10);
        if (!Number.isInteger(intervalMs) || intervalMs <= 0) {
          throw new Error('--interval must be a positive integer');
        }

        const printSnapshot = async () => {
          const snapshot = await collectArtifactStatus(sessionId);
          if (opts.json) {
            process.stdout.write(JSON.stringify(snapshot) + '\n');
            return;
          }

          console.log(chalk.bold('SynapseGrid artifacts'));
          console.log(chalk.dim(`Session: ${snapshot.sessionId}`));
          console.log(chalk.dim(`Checked: ${snapshot.checkedAt}`));
          for (const [key, meta] of Object.entries(snapshot.artifacts)) {
            console.log(chalk.dim(`${key}: ${meta.exists ? 'ok' : 'missing'} -> ${meta.path}`));
          }
        };

        if (!opts.watch) {
          const snapshot = await collectArtifactStatus(sessionId);
          output(snapshot, opts.json);
          if (!opts.json) {
            console.log(chalk.bold('SynapseGrid artifacts'));
            for (const [key, meta] of Object.entries(snapshot.artifacts)) {
              console.log(chalk.dim(`${key}: ${meta.exists ? 'ok' : 'missing'} -> ${meta.path}`));
            }
          }
          return;
        }

        if (!opts.json) {
          console.log(chalk.cyan('Watching artifacts (Ctrl+C to stop)\n'));
        }

        while (true) {
          if (!opts.json) {
            process.stdout.write('\x1Bc');
          }
          await printSnapshot();
          await new Promise((resolvePromise) => setTimeout(resolvePromise, intervalMs));
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

        const meetingSummary = await readSessionArtifact(sessionId, 'meeting-summary.md');
        const meetingLog = await readSessionArtifact(sessionId, 'meeting-log.md');
        const payload = format === 'json'
          ? JSON.stringify({ state, transcript, meetingSummary, meetingLog }, null, 2) + '\n'
          : `${toMarkdownTranscript(state, transcript)}\n\n## Meeting Summary\n\n${meetingSummary || state.run?.finalSummary || 'No summary generated yet.'}\n\n## Meeting Log\n\n${meetingLog || 'No meeting log generated yet.'}\n`;

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
    .option('--model-planner <id>', 'Model for planner role (provider/model)')
    .option('--model-critic <id>', 'Model for critic role (provider/model)')
    .option('--model-coder <id>', 'Model for coder role (provider/model)')
    .option('--model-reviewer <id>', 'Model for reviewer role (provider/model)')
    .option('--mux <name>', 'Multiplexer backend: auto|zellij|tmux')
    .option('--cwd <path>', 'Working directory for agents', process.cwd())
    .option('--attach', 'Attach multiplexer immediately after start', false)
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        if (!hasCommand('opencode')) {
          throw new Error('OpenCode is not installed. Run: acfm agents setup');
        }
        const opencodeBin = resolveCommandPath('opencode');
        if (!opencodeBin) {
          throw new Error('OpenCode binary not found. Run: acfm agents setup');
        }

        await mkdir(SESSION_ROOT_DIR, { recursive: true });
        const maxRounds = Number.parseInt(opts.rounds, 10);
        if (!Number.isInteger(maxRounds) || maxRounds <= 0) {
          throw new Error('--rounds must be a positive integer');
        }

        const config = await loadAgentsConfig();
        const configuredMux = validateMultiplexer(opts.mux || config.agents.multiplexer || 'auto');
        const muxResolution = resolveMultiplexerWithPaths(config, configuredMux);
        let selectedMux = muxResolution.selected;
        let zellijPath = muxResolution.zellijPath;
        if (!selectedMux) {
          if (configuredMux !== 'tmux' && shouldUseManagedZellij(config)) {
            const installResult = await installManagedZellijLatest();
            if (installResult.success && installResult.binaryPath) {
              await updateAgentsConfig((current) => ({
                agents: {
                  defaultModel: current.agents.defaultModel,
                  defaultRoleModels: { ...current.agents.defaultRoleModels },
                  multiplexer: current.agents.multiplexer || 'auto',
                  zellij: {
                    strategy: 'managed',
                    binaryPath: installResult.binaryPath,
                    version: installResult.version || null,
                    source: 'managed',
                  },
                },
              }));
              zellijPath = installResult.binaryPath;
              selectedMux = resolveMultiplexer(configuredMux, Boolean(resolveCommandPath('tmux')), Boolean(zellijPath));
            }
          }
        }
        if (!selectedMux) {
          throw new Error('No multiplexer found. Install zellij or tmux with: acfm agents setup');
        }
        const cliModel = assertValidModelIdOrNull('--model', opts.model || null);
        const cliRoleModels = parseRoleModelOptions(opts);
        for (const [role, model] of Object.entries(cliRoleModels)) {
          if (!isValidModelId(model)) {
            throw new Error(`--model-${role} must be in provider/model format`);
          }
        }
        const defaultRoleModels = sanitizeRoleModels(config.agents.defaultRoleModels);
        const roleModels = {
          ...defaultRoleModels,
          ...cliRoleModels,
        };
        const globalModel = cliModel || config.agents.defaultModel || DEFAULT_SYNAPSE_MODEL;

        const modelsToCheck = new Set([globalModel, ...Object.values(roleModels)]);
        for (const modelToCheck of modelsToCheck) {
          const preflight = await preflightModel({
            opencodeBin,
            model: modelToCheck,
            cwd: resolve(opts.cwd),
          });
          if (!preflight.ok) {
            throw new Error(
              `Model preflight failed for ${preflight.model}: ${preflight.error}. ` +
              'Check OpenCode auth/providers with: opencode auth list, opencode models'
            );
          }
        }

        const state = await createSession(opts.task, {
          roles: COLLAB_ROLES,
          maxRounds,
          model: globalModel,
          roleModels,
          multiplexer: selectedMux,
          workingDirectory: resolve(opts.cwd),
          opencodeBin,
        });
        const muxSessionName = `acfm-synapse-${state.sessionId.slice(0, 8)}`;
        const sessionDir = getSessionDir(state.sessionId);

        if (selectedMux === 'zellij') {
          await spawnZellijSession({
            sessionName: muxSessionName,
            sessionDir,
            sessionId: state.sessionId,
            binaryPath: zellijPath,
          });
        } else {
          await spawnTmuxSession({
            sessionName: muxSessionName,
            sessionDir,
            sessionId: state.sessionId,
          });
        }

        const updated = await saveSessionState({
          ...state,
          multiplexer: selectedMux,
          multiplexerSessionName: muxSessionName,
          tmuxSessionName: selectedMux === 'tmux' ? muxSessionName : null,
        });

        output({
          sessionId: updated.sessionId,
          multiplexer: selectedMux,
          multiplexerSessionName: muxSessionName,
          status: updated.status,
        }, opts.json);
        if (!opts.json) {
          printStartSummary(updated);
          printModelConfig(updated);
        }

        if (opts.attach) {
          await attachToMux(selectedMux, muxSessionName, false, zellijPath);
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
        await ensureSessionArtifacts(sessionId, state);
        const effectiveRoleModels = buildEffectiveRoleModels(state, state.model || null);
        output({ ...state, effectiveRoleModels }, opts.json);
        if (!opts.json) {
          console.log(chalk.bold(`${COLLAB_SYSTEM_NAME} Status`));
          console.log(chalk.dim(`Session: ${state.sessionId}`));
          console.log(chalk.dim(`Status: ${state.status}`));
          console.log(chalk.dim(`Round: ${Math.min(state.round, state.maxRounds)}/${state.maxRounds}`));
          console.log(chalk.dim(`Active agent: ${state.activeAgent || 'none'}`));
          console.log(chalk.dim(`Messages: ${state.messages.length}`));
          const summary = runSummary(state);
          console.log(chalk.dim(`Run: ${summary.status}${summary.currentRole ? ` (role=${summary.currentRole})` : ''}, events=${summary.events}`));
          if (summary.lastError?.message) {
            console.log(chalk.dim(`Run error: ${summary.lastError.message}`));
          }
          console.log(chalk.dim(`Global model: ${state.model || '(opencode default)'}`));
          console.log(chalk.dim(`Multiplexer: ${state.multiplexer || 'auto'} (${sessionMuxName(state)})`));
          for (const role of COLLAB_ROLES) {
            const configured = state.roleModels?.[role] || '-';
            const effective = effectiveRoleModels[role] || '(opencode default)';
            console.log(chalk.dim(`  ${role.padEnd(8)} configured=${configured} effective=${effective}`));
          }
          const meetingLogPath = resolve(getSessionDir(state.sessionId), 'meeting-log.md');
          const meetingSummaryPath = resolve(getSessionDir(state.sessionId), 'meeting-summary.md');
          const turnsDirPath = resolve(getSessionDir(state.sessionId), 'turns');
          const rawDirPath = resolve(getSessionDir(state.sessionId), 'turns', 'raw');
          console.log(chalk.dim(`meeting-log: ${existsSync(meetingLogPath) ? meetingLogPath : 'not generated yet'}`));
          console.log(chalk.dim(`meeting-summary: ${existsSync(meetingSummaryPath) ? meetingSummaryPath : 'not generated yet'}`));
          console.log(chalk.dim(`turns: ${existsSync(turnsDirPath) ? turnsDirPath : 'not generated yet'}`));
          console.log(chalk.dim(`turns/raw: ${existsSync(rawDirPath) ? rawDirPath : 'not generated yet'}`));
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
        const meetingSummaryPath = resolve(getSessionDir(state.sessionId), 'meeting-summary.md');
        state = await stopSession(state, 'stopped');
        if (state.run && state.run.status === 'running') {
          state = await saveSessionState({
            ...state,
            run: {
              ...state.run,
              status: 'cancelled',
              finishedAt: new Date().toISOString(),
              currentRole: null,
              lastError: {
                code: 'RUN_CANCELLED',
                message: 'Run cancelled by user',
              },
            },
          });
        }

        if (!existsSync(meetingSummaryPath)) {
          const fallbackSummary = [
            '# SynapseGrid Meeting Summary',
            '',
            `Session: ${state.sessionId}`,
            `Status: ${state.status}`,
            '',
            'This summary was auto-generated at stop time because the run did not complete normally.',
            '',
            '## Last message',
            state.messages?.[state.messages.length - 1]?.content || '(none)',
            '',
          ].join('\n');
          await writeMeetingSummary(state.sessionId, fallbackSummary);
          if (state.run && !state.run.finalSummary) {
            state = await saveSessionState({
              ...state,
              run: {
                ...state.run,
                finalSummary: fallbackSummary,
              },
            });
          }
        }

        const multiplexer = state.multiplexer || 'tmux';
        const muxSessionName = sessionMuxName(state);
        const cfg = await loadAgentsConfig();
        const zellijPath = resolveConfiguredZellijPath(cfg);
        if (multiplexer === 'zellij' && muxSessionName && zellijPath) {
          try {
            await runZellij(['delete-session', muxSessionName], { binaryPath: zellijPath });
          } catch {
            // ignore if already closed
          }
        }
        if (multiplexer === 'tmux' && muxSessionName && hasCommand('tmux')) {
          try {
            await runTmux('tmux', ['kill-session', '-t', muxSessionName]);
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
    .command('autopilot')
    .description('Internal headless collaborative driver (non-tmux)')
    .requiredOption('--session <id>', 'Session id')
    .option('--poll-ms <n>', 'Polling interval in ms', '900')
    .action(async (opts) => {
      const pollMs = Number.parseInt(opts.pollMs, 10);
      while (true) {
        try {
          const state = await loadSessionState(opts.session);
          if (state.status !== 'running') process.exit(0);

          for (const role of state.roles || COLLAB_ROLES) {
            await runWorkerIteration(opts.session, role, {
              cwd: state.workingDirectory || process.cwd(),
              model: state.model || null,
              opencodeBin: state.opencodeBin || resolveCommandPath('opencode') || undefined,
              timeoutMs: state.run?.policy?.timeoutPerRoleMs || 180000,
            });
          }
        } catch (error) {
          console.error(`[autopilot] ${error.message}`);
        }
        await new Promise((resolvePromise) => setTimeout(resolvePromise, Number.isInteger(pollMs) ? pollMs : 900));
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
          console.log(`[${role}] polling session ${opts.session}`);
          const state = await loadSessionState(opts.session);
          if (!state.roles.includes(role)) {
            console.log(`[${role}] role not configured in session. exiting.`);
            process.exit(0);
          }
          if (state.status !== 'running') {
            console.log(`[${role}] session is ${state.status}. exiting.`);
            process.exit(0);
          }

          if (state.activeAgent === role) {
            console.log(`[${role}] executing turn with model=${state.roleModels?.[role] || state.model || DEFAULT_SYNAPSE_MODEL}`);
          }
          const nextState = await runWorkerIteration(opts.session, role, {
            cwd: state.workingDirectory || process.cwd(),
            model: state.model || null,
            opencodeBin: state.opencodeBin || resolveCommandPath('opencode') || undefined,
            timeoutMs: 180000,
          });
          const latest = nextState.messages[nextState.messages.length - 1];
          if (latest?.from === role) {
            console.log(`[${role}] message emitted (${latest.content.length} chars)`);
          } else if (nextState.activeAgent && nextState.activeAgent !== role) {
            console.log(`[${role}] waiting for active role=${nextState.activeAgent}`);
          }
        } catch (error) {
          console.error(`[${role}] loop error: ${error.message}`);
        }

        await new Promise((resolvePromise) => setTimeout(resolvePromise, Number.isInteger(pollMs) ? pollMs : 1200));
      }
    });

  agents
    .command('doctor')
    .description('Run diagnostics for SynapseGrid/OpenCode runtime')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const opencodeBin = resolveCommandPath('opencode');
        const tmuxInstalled = hasCommand('tmux');
        const cfg = await loadAgentsConfig();
        const zellijPath = resolveConfiguredZellijPath(cfg);
        const zellijInstalled = Boolean(zellijPath);
        const defaultModel = cfg.agents.defaultModel || DEFAULT_SYNAPSE_MODEL;
        const configuredMux = validateMultiplexer(cfg.agents.multiplexer || 'auto');
        const resolvedMux = resolveMultiplexer(configuredMux, tmuxInstalled, zellijInstalled);
        const result = {
          opencodeBin,
          tmuxInstalled,
          zellijInstalled,
          zellijPath,
          zellijConfig: cfg.agents.zellij,
          configuredMultiplexer: configuredMux,
          resolvedMultiplexer: resolvedMux,
          defaultModel,
          defaultRoleModels: cfg.agents.defaultRoleModels,
          preflight: null,
        };

        if (opencodeBin) {
          result.preflight = await preflightModel({
            opencodeBin,
            model: defaultModel,
            cwd: process.cwd(),
          });
        } else {
          result.preflight = { ok: false, error: 'OpenCode binary not found' };
        }

        output(result, opts.json);
        if (!opts.json) {
          console.log(chalk.bold('SynapseGrid doctor'));
          console.log(chalk.dim(`opencode: ${opencodeBin || 'not found'}`));
          console.log(chalk.dim(`zellij: ${zellijInstalled ? 'installed' : 'not installed'}`));
          if (zellijPath) console.log(chalk.dim(`zellij path: ${zellijPath}`));
          console.log(chalk.dim(`tmux: ${tmuxInstalled ? 'installed' : 'not installed'}`));
          console.log(chalk.dim(`multiplexer: configured=${configuredMux} resolved=${resolvedMux || 'none'}`));
          console.log(chalk.dim(`default model: ${defaultModel}`));
          console.log(chalk.dim(`preflight: ${result.preflight?.ok ? 'ok' : `failed - ${result.preflight?.error || 'unknown error'}`}`));
        }

        if (!result.preflight?.ok || !result.resolvedMultiplexer) process.exit(1);
      } catch (error) {
        output({ error: error.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  return agents;
}
