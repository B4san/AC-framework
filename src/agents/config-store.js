import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_SYNAPSE_MODEL } from './constants.js';
import { sanitizeRoleModels, normalizeModelId } from './model-selection.js';

const ACFM_DIR = join(homedir(), '.acfm');
const CONFIG_PATH = join(ACFM_DIR, 'config.json');

function normalizeConfig(raw) {
  const agents = raw?.agents && typeof raw.agents === 'object' ? raw.agents : {};
  const configuredMultiplexer = typeof agents.multiplexer === 'string' ? agents.multiplexer.trim().toLowerCase() : '';
  const multiplexer = ['auto', 'zellij', 'tmux'].includes(configuredMultiplexer) ? configuredMultiplexer : 'auto';
  const zellij = agents?.zellij && typeof agents.zellij === 'object' ? agents.zellij : {};
  const zellijStrategy = typeof zellij.strategy === 'string' ? zellij.strategy.trim().toLowerCase() : 'auto';
  const strategy = ['auto', 'managed', 'system'].includes(zellijStrategy) ? zellijStrategy : 'auto';
  const binaryPath = typeof zellij.binaryPath === 'string' && zellij.binaryPath.trim() ? zellij.binaryPath.trim() : null;
  const version = typeof zellij.version === 'string' && zellij.version.trim() ? zellij.version.trim() : null;
  const source = typeof zellij.source === 'string' && zellij.source.trim() ? zellij.source.trim() : null;

  return {
    agents: {
      defaultModel: normalizeModelId(agents.defaultModel) || DEFAULT_SYNAPSE_MODEL,
      defaultRoleModels: sanitizeRoleModels(agents.defaultRoleModels),
      multiplexer,
      zellij: {
        strategy,
        binaryPath,
        version,
        source,
      },
    },
  };
}

export async function loadAgentsConfig() {
  if (!existsSync(CONFIG_PATH)) {
    return normalizeConfig({});
  }

  try {
    const raw = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
    return normalizeConfig(raw);
  } catch {
    return normalizeConfig({});
  }
}

export async function saveAgentsConfig(config) {
  const normalized = normalizeConfig(config);
  await mkdir(ACFM_DIR, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(normalized, null, 2) + '\n', 'utf8');
  return normalized;
}

export async function updateAgentsConfig(mutator) {
  const current = await loadAgentsConfig();
  const next = await mutator(current);
  return saveAgentsConfig(next);
}

export function getAgentsConfigPath() {
  return CONFIG_PATH;
}
