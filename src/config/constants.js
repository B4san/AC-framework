// GitHub repository configuration for live sync (acfm update / acfm init --latest).
// Only the GitHub API tarball endpoint is used — no tokens required for public repos.
export const GITHUB_CONFIG = {
  owner: 'b4san',
  repo: 'AC-framework',
  branch: 'main',
  frameworkDir: 'framework',
  timeout: 30_000, // 30 seconds
};

// Modules that are always installed regardless of user selection.
// Note: The spec-driven workflow is now built into acfm CLI.
// Users run `acfm spec init` to create the spec directory (default: .acfm/)
// Legacy openspec/ directories are still supported for backward compatibility.
export const ALWAYS_INSTALL = [];

// When a key module is selected, its bundled companions are auto-installed.
export const BUNDLED = {
  '.cline': ['.clinerules'],
  '.antigravity': ['.agent'],  // Antigravity uses .agent/skills/ directory
};

// Folders that should never appear in the selection list because they are
// installed automatically as part of a bundled assistant.
export const HIDDEN_FOLDERS = new Set([...Object.values(BUNDLED).flat(), '.agent']);

// Human-readable descriptions for each module, used in the selection UI.
export const DESCRIPTIONS = {
  '.agent': 'Generic Agent Framework',
  '.antigravity': 'Google Antigravity IDE (Agent-First)',
  '.amazonq': 'AWS Amazon Q',
  '.augment': 'Augment Code Assistant',
  '.claude': 'Anthropic Claude Code',
  '.cline': 'Cline VS Code Extension',
  '.codebuddy': 'CodeBuddy Assistant',
  '.codex': 'OpenAI Codex CLI',
  '.continue': 'Continue.dev IDE Extension',
  '.cospec': 'OpenSpec Native Framework',
  '.crush': 'Crush Assistant',
  '.cursor': 'Cursor IDE',
  '.factory': 'Factory Assistant',
  '.gemini': 'Google Gemini',
  '.github': 'GitHub Copilot',
  '.iflow': 'iFlow Assistant',
  '.kilocode': 'Kilo Code',
  '.opencode': 'OpenCode Framework',
  '.qoder': 'Qoder Assistant',
  '.qwen': 'Qwen (Alibaba Cloud)',
  '.roo': 'Roo Code Extension',
  '.trae': 'Trae IDE',
  '.windsurf': 'Windsurf IDE',
  'openspec': 'OpenSpec Configuration',
};

// Icons for each assistant, used in the selection UI.
export const ASSISTANT_ICONS = {
  '.agent': '⊡',
  '.antigravity': '◉',
  '.amazonq': '◈',
  '.augment': '◇',
  '.claude': '◉',
  '.cline': '◎',
  '.codebuddy': '◈',
  '.codex': '⊞',
  '.continue': '▹',
  '.cospec': '⊙',
  '.crush': '◆',
  '.cursor': '▸',
  '.factory': '⊟',
  '.gemini': '◇',
  '.github': '◈',
  '.iflow': '▹',
  '.kilocode': '◎',
  '.opencode': '⊡',
  '.qoder': '◇',
  '.qwen': '◈',
  '.roo': '◆',
  '.trae': '▸',
  '.windsurf': '◇',
};
