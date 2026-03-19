/**
 * mcp-installer.js — MCP config installer for AC Framework
 *
 * Detects installed AI assistants and injects the ac-framework-memory
 * MCP server into their config files using the CORRECT format for each.
 *
 * Verified formats (Mar 2026):
 *   opencode  → ~/.config/opencode/opencode.json  key:"mcp"  type:"local"  command:array
 *   claude    → ~/.claude.json                     key:"mcpServers"  type:"stdio"
 *   cursor    → ~/.cursor/mcp.json                 key:"mcpServers"
 *   windsurf  → ~/.codeium/windsurf/mcp_config.json key:"mcpServers"
 *   gemini    → ~/.gemini/settings.json            key:"mcpServers"
 *   codex     → ~/.codex/config.toml               TOML format
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir, platform } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MCP_TARGETS = {
  memory: {
    id: 'ac-framework-memory',
    path: join(__dirname, '../mcp/server.js'),
  },
  collab: {
    id: 'ac-framework-collab',
    path: join(__dirname, '../mcp/collab-server.js'),
  },
};

/** Absolute path to the MCP server entry point */
export function getMCPServerPath(target = 'memory') {
  return resolveTarget(target).path;
}

function resolveTarget(target = 'memory') {
  const key = String(target || 'memory').toLowerCase();
  if (!MCP_TARGETS[key]) {
    throw new Error(`Unknown MCP target: ${target}`);
  }
  return MCP_TARGETS[key];
}

const home = homedir();

// ── Assistant definitions ─────────────────────────────────────────
//
// Each entry may have a custom `install` / `uninstall` function if its
// format differs from the standard JSON mcpServers pattern.

export const ASSISTANTS = [
  // ── OpenCode ───────────────────────────────────────────────────
  // Config: ~/.config/opencode/opencode.json
  // Schema: { "mcp": { "<name>": { "type": "local", "command": ["node", "path"] } } }
  {
    name: 'opencode',
    configPath: join(home, '.config', 'opencode', 'opencode.json'),
    detectDir: join(home, '.config', 'opencode'),
    install(serverPath, serverId = 'ac-framework-memory') {
      const configDir = dirname(this.configPath);
      if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true });

      let config = {};
      if (existsSync(this.configPath)) {
        try { config = JSON.parse(readFileSync(this.configPath, 'utf8')); } catch { config = {}; }
      }

      if (!config.mcp) config.mcp = {};
      config.mcp[serverId] = {
        type: 'local',
        command: ['node', serverPath],
      };

      writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      return true;
    },
    uninstall(serverId = 'ac-framework-memory') {
      if (!existsSync(this.configPath)) return true;
      let config = {};
      try { config = JSON.parse(readFileSync(this.configPath, 'utf8')); } catch { return true; }
      if (config.mcp?.[serverId]) {
        delete config.mcp[serverId];
        writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      }
      return true;
    },
  },

  // ── Claude Code CLI ────────────────────────────────────────────
  // Config: ~/.claude.json  (top-level mcpServers key, merges with existing data)
  // Schema: { "mcpServers": { "<name>": { "type": "stdio", "command": "node", "args": ["path"] } } }
  {
    name: 'claude',
    configPath: join(home, '.claude.json'),
    detectFile: join(home, '.claude.json'),
    install(serverPath, serverId = 'ac-framework-memory') {
      let config = {};
      if (existsSync(this.configPath)) {
        try { config = JSON.parse(readFileSync(this.configPath, 'utf8')); } catch { config = {}; }
      }

      if (!config.mcpServers) config.mcpServers = {};
      config.mcpServers[serverId] = {
        type: 'stdio',
        command: 'node',
        args: [serverPath],
      };

      writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      return true;
    },
    uninstall(serverId = 'ac-framework-memory') {
      if (!existsSync(this.configPath)) return true;
      let config = {};
      try { config = JSON.parse(readFileSync(this.configPath, 'utf8')); } catch { return true; }
      if (config.mcpServers?.[serverId]) {
        delete config.mcpServers[serverId];
        writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      }
      return true;
    },
  },

  // ── Cursor IDE ─────────────────────────────────────────────────
  // Config: ~/.cursor/mcp.json
  // Schema: { "mcpServers": { "<name>": { "command": "node", "args": ["path"] } } }
  {
    name: 'cursor',
    configPath: join(home, '.cursor', 'mcp.json'),
    detectDir: join(home, '.cursor'),
    install(serverPath, serverId = 'ac-framework-memory') {
      return installJsonMcpServers(this.configPath, serverPath, serverId);
    },
    uninstall(serverId = 'ac-framework-memory') {
      return uninstallJsonMcpServers(this.configPath, serverId);
    },
  },

  // ── Windsurf IDE ───────────────────────────────────────────────
  // Config: ~/.codeium/windsurf/mcp_config.json  (NOT ~/.windsurf/mcp.json)
  // Schema: { "mcpServers": { "<name>": { "command": "node", "args": ["path"] } } }
  {
    name: 'windsurf',
    configPath: join(home, '.codeium', 'windsurf', 'mcp_config.json'),
    detectDir: join(home, '.codeium', 'windsurf'),
    install(serverPath, serverId = 'ac-framework-memory') {
      return installJsonMcpServers(this.configPath, serverPath, serverId);
    },
    uninstall(serverId = 'ac-framework-memory') {
      return uninstallJsonMcpServers(this.configPath, serverId);
    },
  },

  // ── Google Gemini CLI ──────────────────────────────────────────
  // Config: ~/.gemini/settings.json  (NOT ~/.gemini/mcp.json)
  // Schema: { "mcpServers": { "<name>": { "command": "node", "args": ["path"] } } }
  {
    name: 'gemini',
    configPath: join(home, '.gemini', 'settings.json'),
    detectDir: join(home, '.gemini'),
    install(serverPath, serverId = 'ac-framework-memory') {
      return installJsonMcpServers(this.configPath, serverPath, serverId);
    },
    uninstall(serverId = 'ac-framework-memory') {
      return uninstallJsonMcpServers(this.configPath, serverId);
    },
  },

  // ── OpenAI Codex CLI ───────────────────────────────────────────
  // Config: ~/.codex/config.toml  (TOML format, NOT JSON)
  // Schema: [mcp_servers.ac-framework-memory]\ncommand = "node"\nargs = ["/path"]
  {
    name: 'codex',
    configPath: join(home, '.codex', 'config.toml'),
    detectDir: join(home, '.codex'),
    install(serverPath, serverId = 'ac-framework-memory') {
      return installTomlMcpServer(this.configPath, serverPath, serverId);
    },
    uninstall(serverId = 'ac-framework-memory') {
      return uninstallTomlMcpServer(this.configPath, serverId);
    },
  },
];

// ── Detection ─────────────────────────────────────────────────────

export function isAssistantInstalled(assistant) {
  try {
    if (assistant.detectFile) return existsSync(assistant.detectFile);
    return existsSync(assistant.detectDir);
  } catch {
    return false;
  }
}

// ── Generic JSON mcpServers helpers ───────────────────────────────

function installJsonMcpServers(configPath, serverPath, serverId = 'ac-framework-memory') {
  const configDir = dirname(configPath);
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true });

  let config = {};
  if (existsSync(configPath)) {
    try { config = JSON.parse(readFileSync(configPath, 'utf8')); } catch { config = {}; }
  }

  if (!config.mcpServers) config.mcpServers = {};
  config.mcpServers[serverId] = {
    command: 'node',
    args: [serverPath],
  };

  writeFileSync(configPath, JSON.stringify(config, null, 2));
  return true;
}

function uninstallJsonMcpServers(configPath, serverId = 'ac-framework-memory') {
  if (!existsSync(configPath)) return true;
  let config = {};
  try { config = JSON.parse(readFileSync(configPath, 'utf8')); } catch { return true; }
  if (config.mcpServers?.[serverId]) {
    delete config.mcpServers[serverId];
    writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
  return true;
}

// ── TOML helpers (Codex) ──────────────────────────────────────────
//
// We write TOML manually (no external dep). The section to add/replace:
//
//   [mcp_servers.ac-framework-memory]
//   command = "node"
//   args = ["/abs/path/to/server.js"]

function getTomlSection(serverId) {
  return `mcp_servers.${serverId}`;
}

function installTomlMcpServer(configPath, serverPath, serverId = 'ac-framework-memory') {
  const configDir = dirname(configPath);
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true });
  const section = getTomlSection(serverId);

  // Escape backslashes for Windows paths
  const escapedPath = serverPath.replace(/\\/g, '\\\\');
  const newBlock = [
    `[${section}]`,
    `command = "node"`,
    `args = ["${escapedPath}"]`,
  ].join('\n');

  let existing = '';
  if (existsSync(configPath)) {
    try { existing = readFileSync(configPath, 'utf8'); } catch { existing = ''; }
  }

  if (existing.includes(`[${section}]`)) {
    // Replace existing block — remove old section, append new one
    existing = removeTomlSection(existing, section);
  }

  const separator = existing.trim() ? '\n\n' : '';
  writeFileSync(configPath, existing.trimEnd() + separator + newBlock + '\n');
  return true;
}

function uninstallTomlMcpServer(configPath, serverId = 'ac-framework-memory') {
  if (!existsSync(configPath)) return true;
  const section = getTomlSection(serverId);
  let content = '';
  try { content = readFileSync(configPath, 'utf8'); } catch { return true; }
  if (content.includes(`[${section}]`)) {
    content = removeTomlSection(content, section);
    writeFileSync(configPath, content);
  }
  return true;
}

/**
 * Removes a TOML section (and its key-value lines) from a TOML string.
 * Stops at the next [section] header or end of file.
 */
function removeTomlSection(toml, sectionKey) {
  const lines = toml.split('\n');
  const result = [];
  let inSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === `[${sectionKey}]`) {
      inSection = true;
      continue;
    }
    if (inSection && trimmed.startsWith('[')) {
      inSection = false;
    }
    if (!inSection) result.push(line);
  }

  return result.join('\n');
}

// ── Install / Uninstall per assistant ────────────────────────────

export function installMCPForAssistant(assistant, target = 'memory') {
  try {
    const resolved = resolveTarget(target);
    return assistant.install(resolved.path, resolved.id);
  } catch (error) {
    console.error(`  Failed to install MCP for ${assistant.name}: ${error.message}`);
    return false;
  }
}

export function uninstallMCPForAssistant(assistant, target = 'memory') {
  try {
    const resolved = resolveTarget(target);
    return assistant.uninstall(resolved.id);
  } catch (error) {
    console.error(`  Failed to uninstall MCP for ${assistant.name}: ${error.message}`);
    return false;
  }
}

// ── Batch helpers ─────────────────────────────────────────────────

/**
 * Detects which assistants are installed and installs MCPs for them.
 * Returns { installed, success } counts.
 */
export function detectAndInstallMCPs(options = {}) {
  const target = options.target || 'memory';
  let installed = 0;
  let success = 0;

  for (const assistant of ASSISTANTS) {
    if (isAssistantInstalled(assistant)) {
      installed++;
      if (installMCPForAssistant(assistant, target)) success++;
    }
  }

  return { installed, success, assistants: ASSISTANTS, target };
}

/**
 * Installs MCPs for ALL supported assistants regardless of detection.
 */
export function installAllMCPs(options = {}) {
  const target = options.target || 'memory';
  let success = 0;
  for (const assistant of ASSISTANTS) {
    if (installMCPForAssistant(assistant, target)) success++;
  }
  return { total: ASSISTANTS.length, success, target };
}

/**
 * Uninstalls MCPs from all detected assistants.
 */
export function uninstallAllMCPs(options = {}) {
  const target = options.target || 'memory';
  let success = 0;
  for (const assistant of ASSISTANTS) {
    if (isAssistantInstalled(assistant) && uninstallMCPForAssistant(assistant, target)) success++;
  }
  return { success, target };
}
