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

/** Absolute path to the MCP server entry point */
export function getMCPServerPath() {
  return join(__dirname, '../mcp/server.js');
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
    install(serverPath) {
      const configDir = dirname(this.configPath);
      if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true });

      let config = {};
      if (existsSync(this.configPath)) {
        try { config = JSON.parse(readFileSync(this.configPath, 'utf8')); } catch { config = {}; }
      }

      if (!config.mcp) config.mcp = {};
      config.mcp['ac-framework-memory'] = {
        type: 'local',
        command: ['node', serverPath],
      };

      writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      return true;
    },
    uninstall() {
      if (!existsSync(this.configPath)) return true;
      let config = {};
      try { config = JSON.parse(readFileSync(this.configPath, 'utf8')); } catch { return true; }
      if (config.mcp?.['ac-framework-memory']) {
        delete config.mcp['ac-framework-memory'];
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
    install(serverPath) {
      let config = {};
      if (existsSync(this.configPath)) {
        try { config = JSON.parse(readFileSync(this.configPath, 'utf8')); } catch { config = {}; }
      }

      if (!config.mcpServers) config.mcpServers = {};
      config.mcpServers['ac-framework-memory'] = {
        type: 'stdio',
        command: 'node',
        args: [serverPath],
      };

      writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      return true;
    },
    uninstall() {
      if (!existsSync(this.configPath)) return true;
      let config = {};
      try { config = JSON.parse(readFileSync(this.configPath, 'utf8')); } catch { return true; }
      if (config.mcpServers?.['ac-framework-memory']) {
        delete config.mcpServers['ac-framework-memory'];
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
    install(serverPath) {
      return installJsonMcpServers(this.configPath, serverPath);
    },
    uninstall() {
      return uninstallJsonMcpServers(this.configPath);
    },
  },

  // ── Windsurf IDE ───────────────────────────────────────────────
  // Config: ~/.codeium/windsurf/mcp_config.json  (NOT ~/.windsurf/mcp.json)
  // Schema: { "mcpServers": { "<name>": { "command": "node", "args": ["path"] } } }
  {
    name: 'windsurf',
    configPath: join(home, '.codeium', 'windsurf', 'mcp_config.json'),
    detectDir: join(home, '.codeium', 'windsurf'),
    install(serverPath) {
      return installJsonMcpServers(this.configPath, serverPath);
    },
    uninstall() {
      return uninstallJsonMcpServers(this.configPath);
    },
  },

  // ── Google Gemini CLI ──────────────────────────────────────────
  // Config: ~/.gemini/settings.json  (NOT ~/.gemini/mcp.json)
  // Schema: { "mcpServers": { "<name>": { "command": "node", "args": ["path"] } } }
  {
    name: 'gemini',
    configPath: join(home, '.gemini', 'settings.json'),
    detectDir: join(home, '.gemini'),
    install(serverPath) {
      return installJsonMcpServers(this.configPath, serverPath);
    },
    uninstall() {
      return uninstallJsonMcpServers(this.configPath);
    },
  },

  // ── OpenAI Codex CLI ───────────────────────────────────────────
  // Config: ~/.codex/config.toml  (TOML format, NOT JSON)
  // Schema: [mcp_servers.ac-framework-memory]\ncommand = "node"\nargs = ["/path"]
  {
    name: 'codex',
    configPath: join(home, '.codex', 'config.toml'),
    detectDir: join(home, '.codex'),
    install(serverPath) {
      return installTomlMcpServer(this.configPath, serverPath);
    },
    uninstall() {
      return uninstallTomlMcpServer(this.configPath);
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

function installJsonMcpServers(configPath, serverPath) {
  const configDir = dirname(configPath);
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true });

  let config = {};
  if (existsSync(configPath)) {
    try { config = JSON.parse(readFileSync(configPath, 'utf8')); } catch { config = {}; }
  }

  if (!config.mcpServers) config.mcpServers = {};
  config.mcpServers['ac-framework-memory'] = {
    command: 'node',
    args: [serverPath],
  };

  writeFileSync(configPath, JSON.stringify(config, null, 2));
  return true;
}

function uninstallJsonMcpServers(configPath) {
  if (!existsSync(configPath)) return true;
  let config = {};
  try { config = JSON.parse(readFileSync(configPath, 'utf8')); } catch { return true; }
  if (config.mcpServers?.['ac-framework-memory']) {
    delete config.mcpServers['ac-framework-memory'];
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

const TOML_SECTION = 'mcp_servers.ac-framework-memory';

function installTomlMcpServer(configPath, serverPath) {
  const configDir = dirname(configPath);
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true });

  // Escape backslashes for Windows paths
  const escapedPath = serverPath.replace(/\\/g, '\\\\');
  const newBlock = [
    `[${TOML_SECTION}]`,
    `command = "node"`,
    `args = ["${escapedPath}"]`,
  ].join('\n');

  let existing = '';
  if (existsSync(configPath)) {
    try { existing = readFileSync(configPath, 'utf8'); } catch { existing = ''; }
  }

  if (existing.includes(`[${TOML_SECTION}]`)) {
    // Replace existing block — remove old section, append new one
    existing = removeTomlSection(existing, TOML_SECTION);
  }

  const separator = existing.trim() ? '\n\n' : '';
  writeFileSync(configPath, existing.trimEnd() + separator + newBlock + '\n');
  return true;
}

function uninstallTomlMcpServer(configPath) {
  if (!existsSync(configPath)) return true;
  let content = '';
  try { content = readFileSync(configPath, 'utf8'); } catch { return true; }
  if (content.includes(`[${TOML_SECTION}]`)) {
    content = removeTomlSection(content, TOML_SECTION);
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

export function installMCPForAssistant(assistant) {
  try {
    return assistant.install(getMCPServerPath());
  } catch (error) {
    console.error(`  Failed to install MCP for ${assistant.name}: ${error.message}`);
    return false;
  }
}

export function uninstallMCPForAssistant(assistant) {
  try {
    return assistant.uninstall();
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
export function detectAndInstallMCPs() {
  let installed = 0;
  let success = 0;

  for (const assistant of ASSISTANTS) {
    if (isAssistantInstalled(assistant)) {
      installed++;
      if (installMCPForAssistant(assistant)) success++;
    }
  }

  return { installed, success, assistants: ASSISTANTS };
}

/**
 * Installs MCPs for ALL supported assistants regardless of detection.
 */
export function installAllMCPs() {
  let success = 0;
  for (const assistant of ASSISTANTS) {
    if (installMCPForAssistant(assistant)) success++;
  }
  return { total: ASSISTANTS.length, success };
}

/**
 * Uninstalls MCPs from all detected assistants.
 */
export function uninstallAllMCPs() {
  let success = 0;
  for (const assistant of ASSISTANTS) {
    if (isAssistantInstalled(assistant) && uninstallMCPForAssistant(assistant)) success++;
  }
  return { success };
}
