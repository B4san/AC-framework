# AC Framework

AC Framework is a toolkit of workflows, methods, and assistant-ready instructions that help AI generate scalable, correct code by following a spec-driven development methodology from the start.

It combines three layers in one CLI:
- template-based assistant configurations for multiple IDEs and AI CLIs
- a built-in spec-driven workflow inspired by OpenSpec / spec-driven development
- a persistent local memory system with MCP integration for supported assistants
- an optional collaborative multi-agent runtime powered by OpenCode + tmux

## Why AC Framework

Instead of treating AI coding as ad-hoc prompting, AC Framework gives the model a working system:
- structured workflows for planning before implementation
- reusable skills and command packs for different assistants
- project-level consistency across editors, IDEs, and CLIs
- persistent memory so decisions and patterns survive across sessions
- backward compatibility with legacy `openspec/` projects

The goal is simple: help AI write better code, with more context, more discipline, and fewer random outcomes.

## Core Capabilities

- `Template-driven installation` - `acfm init` now starts by asking which template to install, then which assistants to install from that template.
- `Multi-assistant support` - install configuration packs for Cursor, Claude Code, GitHub Copilot, Codex, Gemini, Continue, Cline, Windsurf, Trae, and more.
- `Spec-driven workflow` - use `acfm spec` to initialize, create, validate, continue, and archive structured changes.
- `Persistent memory` - store architectural decisions, bugfixes, refactors, conventions, and context in a local SQLite memory database.
- `MCP integration` - connect the memory system to supported assistants through MCP so they can recall and save context directly.
- `Collaborative agents (optional)` - enable SynapseGrid to run planner/critic/coder/reviewer in coordinated tmux panes with shared context.
- `GitHub sync` - use `acfm init --latest` or `acfm update` to pull the latest framework content from GitHub.
- `Legacy compatibility` - `.acfm/` is the new default, but existing `openspec/` directories still work.

## Installation

### Global

```bash
npm install -g ac-framework
```

### Local

```bash
npm install --save-dev ac-framework
```

## Quick Start

### 1. Install a template and your assistants

```bash
acfm init
```

The CLI now guides you through:
1. choose a template such as `new_project` or `mobile_development`
2. choose one or more assistants from that template
3. install the matching root instruction files like `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, or `copilot-instructions.md`
4. optionally initialize NexusVault persistent memory and MCP connections
5. optionally enable SynapseGrid collaborative agents (auto-installs OpenCode + tmux)

### 2. Initialize the spec-driven workspace

```bash
acfm spec init
```

This creates `.acfm/` in the current project unless a legacy `openspec/` structure is already being used.

### 3. Start a change

```bash
acfm spec new add-authentication
```

### 4. Recall or manage project memory

```bash
acfm memory recall
acfm memory search "auth refresh token"
```

## Templates

Current bundled templates live under `framework/`:

- `new_project` - the full default template for new projects, including the broadest skill set.
- `mobile_development` - starts from the same base but keeps mainly general-purpose skills and spec workflow skills.
- `web_development` - tuned for web and fullstack product work with UI, API, testing, performance, and React-oriented guidance.

The selected template is saved to `.acfm-template.json` in the target project so future updates can pull from the correct template.

## Supported Assistants

AC Framework ships configuration packs for 24+ assistants and environments, including:

- Cursor
- Claude Code
- GitHub Copilot
- Codex
- Gemini
- Continue
- Cline
- Windsurf
- Trae
- Roo
- Qwen
- Amazon Q
- Augment
- OpenCode
- Cospec / OpenSpec-native flows

Some assistants include bundled companions automatically:
- selecting `.cline` also installs `.clinerules`
- selecting `.antigravity` also installs `.agent`

## Commands

### Core CLI

| Command | Description |
|---|---|
| `acfm init` | Choose a template and install assistant configurations into the current project |
| `acfm init --latest` | Download the latest framework from GitHub before prompting for template and assistants |
| `acfm init --branch <name>` | Same as `--latest`, but from a specific branch |
| `acfm update` | Update installed assistant configs and instruction files using the saved or detected template |
| `acfm update --branch <name>` | Update from a specific GitHub branch |

### Collaborative Agents (Optional)

SynapseGrid is an optional collaborative runtime that coordinates 4 OpenCode-backed roles in tmux panes:
- planner
- critic
- coder
- reviewer

Each role runs in turn against a shared, accumulating context so outputs from one agent become input for the next round.

| Command | Description |
|---|---|
| `acfm agents setup` | Install optional dependencies (`opencode` and `tmux`) |
| `acfm agents start --task "..."` | Start a SynapseGrid collaborative session |
| `acfm agents resume` | Resume a previous session and recreate workers if needed |
| `acfm agents list` | List recent SynapseGrid sessions |
| `acfm agents attach` | Attach directly to the SynapseGrid tmux session |
| `acfm agents logs` | Show recent worker logs (all roles or one role) |
| `acfm agents export --format md --out file.md` | Export transcript in Markdown or JSON |
| `acfm agents send "..."` | Send a new user message into the active session |
| `acfm agents status` | Show current collaborative session state |
| `acfm agents stop` | Stop the active collaborative session |

### Spec Workflow

| Command | Description |
|---|---|
| `acfm spec init` | Initialize `.acfm/` for spec-driven work |
| `acfm spec new <name>` | Create a new change with scaffolded artifacts |
| `acfm spec status` | Show global or per-change status |
| `acfm spec list` | List active changes |
| `acfm spec instructions <artifact> --change <name>` | Get instructions for the next artifact or apply step |
| `acfm spec archive <name>` | Archive a completed change |
| `acfm spec validate <name>` | Validate change structure |
| `acfm spec schemas` | List available workflow schemas |

### Memory System

AC Framework includes NexusVault, a local persistent memory system backed by SQLite.

| Command | Description |
|---|---|
| `acfm memory init` | Initialize the local memory database |
| `acfm memory save <content>` | Save a memory manually |
| `acfm memory search <query>` | Search stored memories |
| `acfm memory recall [task]` | Recall relevant context for the project or task |
| `acfm memory get <id>` | View a specific memory |
| `acfm memory timeline <id>` | Show surrounding chronological context |
| `acfm memory connections <id>` | Show linked memories |
| `acfm memory patterns` | Detect repeated patterns |
| `acfm memory anticipate <task>` | Suggest memories likely useful for a future task |
| `acfm memory stats` | Show memory statistics |
| `acfm memory export [file]` | Export memories to JSON |
| `acfm memory import <file>` | Import memories from JSON |
| `acfm memory prune` | Archive stale or low-value memories |
| `acfm memory delete <id>` | Soft-delete a memory |
| `acfm memory session start` | Start a tracked memory session |
| `acfm memory session end <sessionId>` | End a memory session |
| `acfm memory install-mcps` | Install MCP memory servers for detected assistants |
| `acfm memory uninstall-mcps` | Remove MCP memory servers |

## NexusVault Persistent Memory

When enabled, NexusVault helps assistants:
- recall architecture and project context at session start
- preserve bugfixes, conventions, refactor patterns, and technical decisions
- keep reusable knowledge local to your machine
- share the memory system with supported assistants through MCP

Default database location:

```text
~/.acfm/memory.db
```

The system is local-first and intended to keep your project context offline on your machine.

### Supported MCP assistant integrations

The current MCP installer supports these assistant config targets:
- OpenCode
- Claude Code
- Cursor
- Windsurf
- Gemini
- Codex

## Spec-Driven Methodology

AC Framework is built around a spec-driven way of working where the AI should understand and plan before coding.

A typical flow looks like this:

1. explore the problem and gather context
2. create a change
3. define proposal, specs, design, and tasks
4. implement against the plan
5. verify and archive

Typical change artifacts:

```text
.acfm/
  config.yaml
  specs/
  changes/
    add-authentication/
      proposal.md
      design.md
      tasks.md
      specs/
      .openspec.yaml
```

This keeps implementation grounded in explicit intent instead of jumping straight to code generation.

## Directory Behavior

AC Framework supports both modern and legacy spec directories:

1. `.acfm/` - preferred default
2. `openspec/` - legacy fallback

If both exist, `.acfm/` takes priority.

## Project Output After `acfm init`

Depending on the template and assistants selected, your project may receive files like:

```text
my-project/
  .cursor/
  .claude/
  .github/
  .continue/
  .cline/
  .clinerules/
  AGENTS.md
  CLAUDE.md
  GEMINI.md
  copilot-instructions.md
  .acfm-template.json
```

The exact output depends on the assistants chosen and the template you selected.

## Updating Installed Configurations

To refresh an existing project with the newest assistant content:

```bash
acfm update
```

`acfm update` now tries to use the saved template from `.acfm-template.json`. If the file is missing, it detects the best matching template from the downloaded framework and updates from there.

## Notes for Real Usage

- Use `acfm init --latest` when you want the newest template content from GitHub without waiting for a new npm release.
- Use `acfm spec` commands when you want direct CLI access to the workflow artifacts.
- In normal AI-assisted usage, your assistant can often follow the installed workflow files directly instead of you manually running every spec step.
- Privacy-sensitive content inside `<private>...</private>` is redacted before being saved in memory.

## Requirements

- Node.js `>=18.0.0`
- npm-compatible environment

## License

MIT © [b4san](https://github.com/b4san)
