#!/usr/bin/env node

const isWin = process.platform === 'win32';

console.log();
console.log('  ✓ ac-framework installed successfully!');
console.log();
console.log('  Available commands:');
console.log();
console.log('    Core');
console.log('      acfm init                Install modules into your project');
console.log('      acfm init --latest       Download latest from GitHub');
console.log('      acfm update              Update installed modules');
console.log();
console.log('    Spec-Driven Workflow');
console.log('      acfm spec init           Bootstrap openspec/ directory');
console.log('      acfm spec new <name>     Create a new change');
console.log('      acfm spec status         View change status');
console.log('      acfm spec list           List active changes');
console.log('      acfm spec instructions   Get artifact instructions');
console.log('      acfm spec validate       Validate change structure');
console.log('      acfm spec archive        Archive a completed change');
console.log('      acfm spec schemas        List workflow schemas');
console.log();
console.log('    Memory System (Persistent Learning)');
console.log('      acfm memory init         Initialize memory database');
console.log('      acfm memory recall       Recall relevant context');
console.log('      acfm memory search       Search memories');
console.log('      acfm memory save         Save memory manually');
console.log('      acfm memory stats        View memory statistics');
console.log();
console.log('    MCP (Model Context Protocol) Servers');
console.log('      acfm memory install-mcps   Install MCP servers for AI assistants');
console.log('      acfm memory uninstall-mcps Uninstall MCP servers from AI assistants');
console.log();
console.log('    Collaborative Agents (Optional)');
console.log('      acfm agents setup          Install OpenCode + tmux dependencies');
console.log('      acfm agents install-mcps   Install SynapseGrid MCP servers');
console.log('      acfm agents uninstall-mcps Remove SynapseGrid MCP servers');
console.log('      acfm agents start --task   Start SynapseGrid collaborative session');
console.log('      acfm agents resume         Resume SynapseGrid session');
console.log('      acfm agents list           List recent SynapseGrid sessions');
console.log('      acfm agents attach         Attach to SynapseGrid tmux session');
console.log('      acfm agents logs           Show recent worker logs');
console.log('      acfm agents export         Export session transcript');
console.log('      acfm agents send           Send message to active session');
console.log('      acfm agents status         View collaborative session status');
console.log('      acfm agents stop           Stop collaborative session');
console.log();
console.log('    Tip: Add --json to any command for machine-readable output.');
console.log();

if (isWin) {
  console.log('  ⚠  If "acfm" is not recognized, add npm global bin to your PATH:');
  console.log();
  console.log('    1. Run:  npm config get prefix');
  console.log('    2. Copy the output path (e.g. C:\\Users\\YourUser\\AppData\\Roaming\\npm)');
  console.log('    3. Add it to your system PATH:');
  console.log('       - Search "Environment Variables" in Windows Settings');
  console.log('       - Edit "Path" under User variables');
  console.log('       - Add the npm prefix path');
  console.log('    4. Restart your terminal');
  console.log();
}

// Auto-detect and install MCPs for supported assistants
try {
  const { detectAndInstallMCPs } = require('../src/services/mcp-installer');
  detectAndInstallMCPs();
} catch (error) {
  // Silently fail if MCP installer is not available yet
  // This allows the framework to work without MCP dependencies during early development
}
