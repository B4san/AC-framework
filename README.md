# AC Framework 🚀

<p align="center">
  <img src="https://img.shields.io/npm/v/ac-framework?style=for-the-badge&color=00FF7F&labelColor=1B5E20" alt="npm version">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge" alt="License">
</p>

<p align="center">
  <strong>🤖 Agentic Coding Framework</strong><br>
  <em>Multi-assistant AI configuration system with spec-driven development workflows</em>
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#commands">Commands</a> •
  <a href="#supported-assistants">24 Assistants</a> •
  <a href="#documentation">Docs</a>
</p>

---

## ✨ What is AC Framework?

AC Framework is a **unified configuration system** for AI coding assistants that brings consistency to your development workflow across 24+ different AI tools.

Instead of configuring each assistant separately, AC Framework installs compatible configurations for all your favorite AI tools in one command.

### 🎯 Key Features

- **🔄 Spec-Driven Workflow** - Built-in `acfm spec` commands for structured development
- **📦 One Install, All Assistants** - Configure 24+ AI assistants with a single command
- **🌐 Universal Compatibility** - Works with Cursor, Claude, GitHub Copilot, and more
- **⚡ Backward Compatible** - Full support for legacy `openspec/` directories
- **🛠️ Built-in CLI** - No external dependencies, everything included

---

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g ac-framework
```

### Local Installation

```bash
npm install --save-dev ac-framework
```

---

## 🚀 Quick Start

### 1. Initialize AC Framework

```bash
acfm init
```

Select your AI assistants from the interactive menu:

```
? Choose modules to install: (Press <space> to select)
❯◉ ◈ Amazon Q · AWS Amazon Q
 ◯ ◉ Antigravity · Google Antigravity IDE (Agent-First)
 ◯ ◇ Augment · Augment Code Assistant
 ◯ ◉ Claude · Anthropic Claude Code
 ◯ ◎ Cline · Cline VS Code Extension
 ◯ ◈ Codebuddy · CodeBuddy Assistant
 ◯ ⊞ Codex · OpenAI Codex CLI
 ◯ ▹ Continue · Continue.dev IDE Extension
 ◯ ⊙ Cospec · OpenSpec Native Framework
 ◯ ... (24 total assistants)
```

### 2. Initialize Spec Workflow (Optional)

For spec-driven development:

```bash
acfm spec init
```

This creates a `.acfm/` directory for managing changes with the spec-driven workflow.

### 3. Create Your First Change

```bash
acfm spec new my-feature
```

---

## 🛠️ Commands

### Core Commands

| Command | Description |
|---------|-------------|
| `acfm init` | Install AI assistant configurations |
| `acfm init --latest` | Download latest configurations from GitHub |
| `acfm update` | Update installed configurations |

### Spec-Driven Workflow Commands

| Command | Description | Flags |
|---------|-------------|-------|
| `acfm spec init` | Initialize spec directory (`.acfm/`) | `--schema`, `--json` |
| `acfm spec new <name>` | Create a new change | `--schema`, `--json` |
| `acfm spec status` | Check project/change status | `--change`, `--json` |
| `acfm spec list` | List all active changes | `--json` |
| `acfm spec instructions <artifact>` | Get artifact instructions | `--change`, `--json` |
| `acfm spec archive <name>` | Archive a completed change | `--json` |
| `acfm spec validate <name>` | Validate change structure | `--json` |
| `acfm spec schemas` | List available workflow schemas | `--json` |

**Tip:** Add `--json` to any command for programmatic output.

---

## 📁 Directory Structure

After installation, your project will have AI assistant configurations:

```
my-project/
├── .cursor/              # Cursor IDE rules & commands
├── .claude/              # Claude Code commands
├── .github/              # GitHub Copilot prompts
├── .vscode/              # VS Code settings (Continue, Cline, etc.)
├── ...                   # Other assistant configs
│
└── .acfm/                # Spec-driven workflow (created by acfm spec init)
    ├── config.yaml       # Project configuration
    ├── specs/            # Shared specifications
    └── changes/          # Active changes
        └── my-feature/
            ├── proposal.md
            ├── design.md
            ├── tasks.md
            └── .openspec.yaml
```

---

## 🔄 OpenSpec Compatibility

AC Framework includes a **built-in spec-driven workflow** that replaces the external `openspec` CLI.

### Backward Compatibility

✅ **Legacy `openspec/` directories are fully supported**

The CLI automatically detects and uses existing `openspec/` directories:

```bash
# If openspec/ exists, it will be detected automatically
acfm spec status
# → Detects openspec/ and uses it

# New projects use .acfm/ by default
acfm spec init
# → Creates .acfm/
```

### Directory Priority

1. **`.acfm/`** - New default (checked first)
2. **`openspec/`** - Legacy support (fallback)
3. **Create new** - If neither exists

Both directories can coexist. If both exist, `.acfm/` takes priority.

### Migration (Optional)

```bash
# Initialize new structure
acfm spec init

# Copy existing changes (manual)
cp -r openspec/changes/* .acfm/changes/

# Remove old when ready
rm -rf openspec/
```

---

## 🤖 Supported Assistants

AC Framework supports **24 AI assistants** with unified configuration:

### IDEs & Editors
| Assistant | Folder | Description |
|-----------|--------|-------------|
| **Cursor** | `.cursor/` | AI-powered IDE |
| **Windsurf** | `.windsurf/` | AI-first editor |
| **Trae** | `.trae/` | IDE with AI assistant |
| **Antigravity** | `.antigravity/` + `.agent/` | Google's agent-first IDE |

### CLI Tools
| Assistant | Folder | Description |
|-----------|--------|-------------|
| **Claude Code** | `.claude/` | Anthropic's CLI assistant |
| **Codex** | `.codex/` | OpenAI Codex CLI |
| **CodeBuddy** | `.codebuddy/` | CLI assistant |
| **Roo** | `.roo/` | Roo Code CLI |
| **Crush** | `.crush/` | Crush Assistant |
| **Factory** | `.factory/` | Factory Assistant |

### VS Code Extensions
| Assistant | Folder | Description |
|-----------|--------|-------------|
| **Continue** | `.continue/` | Open-source AI extension |
| **Cline** | `.cline/` | VS Code assistant |
| **Roo Code** | `.roo/` | Cline fork |
| **GitHub Copilot** | `.github/` | GitHub's AI assistant |

### Cloud & Enterprise
| Assistant | Folder | Description |
|-----------|--------|-------------|
| **Amazon Q** | `.amazonq/` | AWS AI assistant |
| **Gemini** | `.gemini/` | Google AI Studio |
| **Qwen** | `.qwen/` | Alibaba Cloud |
| **Augment** | `.augment/` | Augment Code |

### Frameworks & Others
| Assistant | Folder | Description |
|-----------|--------|-------------|
| **OpenCode** | `.opencode/` | Open-source framework |
| **Kilo Code** | `.kilocode/` | Kilo Code |
| **iFlow** | `.iflow/` | iFlow Assistant |
| **Qoder** | `.qoder/` | Qoder Assistant |
| **Generic Agent** | `.agent/` | Generic framework |
| **OpenSpec** | `.cospec/` | Native OpenSpec |

---

## 💡 Usage Examples

### Initialize with Multiple Assistants

```bash
acfm init
# Select: Cursor + Claude + Continue
# Installs all three configurations
```

### Update to Latest

```bash
acfm update
# Pulls latest configs from GitHub
# Updates all installed assistants
```

### Spec-Driven Development

```bash
# Initialize spec workflow
acfm spec init

# Create a new change
acfm spec new user-auth --json
# → { "changeDir": "/project/.acfm/changes/user-auth", ... }

# Check status
acfm spec status --change user-auth --json

# Get instructions for next artifact
acfm spec instructions proposal --change user-auth --json

# Archive when done
acfm spec archive user-auth
```

### Working with Legacy Projects

```bash
# Project has existing openspec/
acfm spec status
# → Automatically detects and uses openspec/

# Create new change in legacy structure
acfm spec new legacy-feature
# → Creates in openspec/changes/legacy-feature/

IMPORTANT: Use the /ac on your IDE or CLI for the agent execute the entire workflow you dont need to run this commands, this is for the AI
```

---

## 🎯 The Spec-Driven Workflow

AC Framework implements a structured workflow for AI-assisted development:

```
┌─────────────────────────────────────────────────────────┐
│  EXPLORE                                                │
│  Understand the problem before implementing             │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  CREATE CHANGE                                          │
│  • proposal.md   - Why are we doing this?               │
│  • specs/        - What needs to change?                │
│  • design.md     - How will we implement it?            │
│  • tasks.md      - Step-by-step implementation plan     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  IMPLEMENT                                              │
│  Execute tasks from tasks.md                            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  VERIFY & ARCHIVE                                       │
│  Validate and archive completed work                    │
└─────────────────────────────────────────────────────────┘
```

Each change is a folder in `.acfm/changes/` containing structured artifacts that guide the AI through implementation.

---

## 📚 Documentation

### For Users
- **[Installation Guide](#installation)** - Get started with AC Framework
- **[CLI Reference](#commands)** - All available commands
- **[Spec Workflow](#the-spec-driven-workflow)** - Understanding spec-driven development

### For AI Agents
- **[ACFM Spec Workflow Skill](framework/.agent/skills/acfm-spec-workflow/SKILL.md)** - Essential guide for agents
- **[Workflows](framework/.agent/workflows/ac.md)** - Complete skill catalog and workflows

---

## 🔧 Requirements

- **Node.js** >= 18.0.0
- **npm** or **yarn**

---


## 📝 License

MIT © [b4san](https://github.com/b4san)

---

<p align="center">
  <strong>🚀 Work with any AI assistant, maintain the same workflow</strong><br>
  <sub>Built with ❤️ for the agentic coding era</sub>
</p>
