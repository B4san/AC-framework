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
  '.kimi': 'Kimi Code Assistant',
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
  '.kimi': '◉',
  '.opencode': '⊡',
  '.qoder': '◇',
  '.qwen': '◈',
  '.roo': '◆',
  '.trae': '▸',
  '.windsurf': '◇',
};

export const TEMPLATE_DESCRIPTIONS = {
  new_project: 'Best default for greenfield projects with the full skill catalog.',
  mobile_development: 'Mobile-focused setup with general workflow skills and less web-specific specialization.',
  web_development: 'Web-focused setup with UI, API, testing, performance, and React-oriented guidance.',
};

export const TEMPLATE_CAPABILITIES = {
  new_project: [
    'Full spec-driven workflow from planning to archive',
    'Broad skill catalog for app, API, quality, and security work',
    'Best starting point when project type is still flexible',
  ],
  mobile_development: [
    'Spec-driven workflow plus general execution and documentation skills',
    'Reduced specialization to keep the template lighter and more adaptable',
    'Good fit for React Native, Flutter, Kotlin, Swift, or hybrid teams',
  ],
  web_development: [
    'Web UI, API, testing, security, and performance oriented workflow',
    'Includes interface and API design guidance for product development',
    'Ideal for frontend, fullstack, dashboard, and SaaS-style projects',
  ],
};

export const TEMPLATE_SKILL_PREVIEWS = {
  new_project: [
    'brainstorming',
    'project-index',
    'spec-clarification',
    'test-generator',
    'code-review',
    'secure-coding-cybersecurity',
  ],
  mobile_development: [
    'brainstorming',
    'project-index',
    'spec-analysis',
    'context-synthesizer',
    'systematic-debugging',
    'openspec-apply-change',
  ],
  web_development: [
    'api-design-principles',
    'interface-design',
    'vercel-react-best-practices',
    'test-generator',
    'performance-optimizer',
    'secure-coding-cybersecurity',
  ],
};
