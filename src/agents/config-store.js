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
  return {
    agents: {
      defaultModel: normalizeModelId(agents.defaultModel) || DEFAULT_SYNAPSE_MODEL,
      defaultRoleModels: sanitizeRoleModels(agents.defaultRoleModels),
      multiplexer,
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
