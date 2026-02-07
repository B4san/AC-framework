export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatFolderName(name) {
  // Remove leading dot for display
  const clean = name.startsWith('.') ? name.slice(1) : name;
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export const DESCRIPTIONS = {
  '.agent': 'Generic Agent Framework',
  '.amazonq': 'AWS Amazon Q',
  '.augment': 'Augment Code Assistant',
  '.claude': 'Anthropic Claude Code',
  '.cline': 'Cline VS Code Extension',
  '.clinerules': 'Cline Shared Rules',
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
