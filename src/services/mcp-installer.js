/**
 * mcp-installer.js — MCP config installer for AC Framework
 *
 * Detects installed AI assistants and injects the ac-framework-memory
 * MCP server into their config files.
 *
 * Best-practice config format per MCP spec:
 *   { "mcpServers": { "ac-framework-memory": { "command": "node", "args": [<absPath>] } } }
 *
 * Claude Code uses a different top-level key format (mcpServers inside claude.json).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir, platform } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Absolute path to the MCP server entry point (ESM, referenced by node)
export function getMCPServerPath() {
  const srcPath = join(__dirname, '../mcp/server.js');
  return srcPath;
}

// ── Supported assistants ──────────────────────────────────────────

const home = homedir();
const IS_WIN = platform() === 'win32';

/**
 * Each assistant entry:
 *   configPath  – absolute path to the JSON config file
 *   configKey   – top-level key that holds server map ("mcpServers" | "servers")
 *   detectDir   – directory whose existence signals the assistant is present
 */
const ASSISTANTS = [
  {
    name: 'opencode',
    configPath: join(home, '.opencode', 'mcp.json'),
    configKey: 'mcpServers',
    detectDir: join(home, '.opencode'),
  },
  {
    name: 'claude',
    // Claude Code CLI uses ~/.claude.json (mcpServers key)
    configPath: join(home, '.claude.json'),
    configKey: 'mcpServers',
    detectDir: home,
    detectFile: join(home, '.claude.json'),
  },
  {
    name: 'cursor',
    configPath: join(home, '.cursor', 'mcp.json'),
    configKey: 'mcpServers',
    detectDir: join(home, '.cursor'),
  },
  {
    name: 'windsurf',
    configPath: join(home, '.windsurf', 'mcp.json'),
    configKey: 'mcpServers',
    detectDir: join(home, '.windsurf'),
  },
  {
    name: 'gemini',
    configPath: join(home, '.gemini', 'mcp.json'),
    configKey: 'mcpServers',
    detectDir: join(home, '.gemini'),
  },
  {
    name: 'codex',
    configPath: join(home, '.codex', 'mcp.json'),
    configKey: 'mcpServers',
    detectDir: join(home, '.codex'),
  },
];

// ── Detection ─────────────────────────────────────────────────────

export function isAssistantInstalled(assistant) {
  try {
    // If a specific file is the detection signal, use that
    if (assistant.detectFile) return existsSync(assistant.detectFile);
    return existsSync(assistant.detectDir);
  } catch {
    return false;
  }
}

// ── Install / Uninstall ───────────────────────────────────────────

export function installMCPForAssistant(assistant) {
  try {
    const configDir = dirname(assistant.configPath);

    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    // Read existing config or start fresh
    let config = {};
    if (existsSync(assistant.configPath)) {
      try {
        config = JSON.parse(readFileSync(assistant.configPath, 'utf8'));
      } catch {
        config = {};
      }
    }

    // Ensure the server map key exists
    if (!config[assistant.configKey]) {
      config[assistant.configKey] = {};
    }

    // Add / overwrite our server entry
    config[assistant.configKey]['ac-framework-memory'] = {
      command: 'node',
      args: [getMCPServerPath()],
    };

    writeFileSync(assistant.configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error(`  Failed to install MCP for ${assistant.name}: ${error.message}`);
    return false;
  }
}

export function uninstallMCPForAssistant(assistant) {
  try {
    if (!existsSync(assistant.configPath)) return true;

    let config = {};
    try {
      config = JSON.parse(readFileSync(assistant.configPath, 'utf8'));
    } catch {
      return true;
    }

    if (config[assistant.configKey]?.['ac-framework-memory']) {
      delete config[assistant.configKey]['ac-framework-memory'];
      writeFileSync(assistant.configPath, JSON.stringify(config, null, 2));
    }

    return true;
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

export { ASSISTANTS };
