import { homedir } from 'node:os';
import { join } from 'node:path';

export const COLLAB_SYSTEM_NAME = 'SynapseGrid';
export const COLLAB_ROLES = ['planner', 'critic', 'coder', 'reviewer'];
export const DEFAULT_MAX_ROUNDS = 3;
export const DEFAULT_SYNAPSE_MODEL = 'opencode/minimax-m2.5-free';
export const DEFAULT_ROLE_TIMEOUT_MS = 180000;
export const DEFAULT_ROLE_RETRIES = 1;
export const SESSION_ROOT_DIR = join(homedir(), '.acfm', 'synapsegrid');
export const CURRENT_SESSION_FILE = join(SESSION_ROOT_DIR, 'current-session.json');
