/**
 * Maps each IDE/assistant module folder to the .md instruction file
 * it expects in the project root. `null` means no .md file is needed
 * (the assistant uses a different mechanism, like .clinerules).
 */
export const IDE_MD_MAP = {
  '.agent': 'AGENTS.md',
  '.amazonq': 'AGENTS.md',
  '.augment': 'AGENTS.md',
  '.claude': 'CLAUDE.md',
  '.cline': null,
  '.codebuddy': 'AGENTS.md',
  '.codex': 'AGENTS.md',
  '.continue': 'AGENTS.md',
  '.cospec': 'AGENTS.md',
  '.crush': 'AGENTS.md',
  '.cursor': 'AGENTS.md',
  '.factory': 'AGENTS.md',
  '.gemini': 'GEMINI.md',
  '.github': 'copilot-instructions.md',
  '.iflow': 'AGENTS.md',
  '.kilocode': 'AGENTS.md',
  '.opencode': 'AGENTS.md',
  '.qoder': 'AGENTS.md',
  '.qwen': 'QWEN.md',
  '.roo': 'AGENTS.md',
  '.trae': 'AGENTS.md',
  '.windsurf': 'AGENTS.md',
};

/**
 * All unique .md files available for installation.
 */
export const AVAILABLE_MD_FILES = [
  ...new Set(Object.values(IDE_MD_MAP).filter(Boolean)),
].sort();

/**
 * Human-readable descriptions for the .md instruction files.
 */
export const MD_DESCRIPTIONS = {
  'AGENTS.md': 'Generic agent instructions (used by most assistants)',
  'CLAUDE.md': 'Anthropic Claude Code instructions',
  'GEMINI.md': 'Google Gemini instructions',
  'QWEN.md': 'Qwen (Alibaba Cloud) instructions',
  'copilot-instructions.md': 'GitHub Copilot instructions',
};
