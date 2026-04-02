# AC Framework

AC Framework is a toolkit of workflows, methods, and assistant-ready instructions that help AI generate scalable, correct code by following a spec-driven development methodology from the start.

It combines three layers in one CLI:
- template-based assistant configurations for multiple IDEs and AI CLIs
- a built-in spec-driven workflow inspired by OpenSpec / spec-driven development
- a persistent local memory system with MCP integration for supported assistants
- an optional collaborative multi-agent runtime powered by OpenCode + zellij (tmux fallback)

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
- `Collaborative agents (optional)` - enable SynapseGrid to run planner/critic/coder/reviewer in coordinated zellij panes (tmux fallback) with shared context.
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
5. optionally enable SynapseGrid collaborative agents (auto-installs OpenCode + zellij/tmux)

If enabled, `acfm init` also auto-installs the optional SynapseGrid MCP server into detected assistants.

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

SynapseGrid is an optional collaborative runtime that coordinates 4 OpenCode-backed roles in multiplexer panes (zellij preferred, tmux fallback):
- planner
- critic
- coder
- reviewer

Each role runs in turn against a shared, accumulating context so outputs from one agent become input for the next round.

| Command | Description |
|---|---|
| `acfm agents setup` | Install optional dependencies (`opencode` and `zellij`/`tmux`) |
| `acfm agents doctor` | Validate OpenCode/multiplexer/model preflight before start |
| `acfm agents doctor --verbose` | Include zellij capability probe details for strategy diagnostics |
| `acfm agents install-mcps` | Install SynapseGrid MCP server for detected assistants |
| `acfm agents uninstall-mcps` | Remove SynapseGrid MCP server from assistants |
| `acfm agents start --task "..." --model-coder provider/model` | Start session with optional per-role models |
| `acfm agents start --task "..." --mux zellij` | Start session forcing zellij backend (`auto`/`tmux` also supported) |
| `acfm agents runtime get` | Show configured multiplexer backend (`auto`, `zellij`, `tmux`) |
| `acfm agents runtime install-zellij` | Download latest zellij release into `~/.acfm/tools/zellij` |
| `acfm agents runtime set zellij` | Persist preferred multiplexer backend |
| `acfm agents resume` | Resume a previous session and recreate workers if needed |
| `acfm agents list` | List recent SynapseGrid sessions |
| `acfm agents attach` | Attach directly to the active SynapseGrid multiplexer session |
| `acfm agents live` | Attach to full live multiplexer view (all agents) |
| `acfm agents logs` | Show recent worker logs (all roles or one role) |
| `acfm agents transcript --role all --limit 40` | Show captured cross-agent transcript |
| `acfm agents summary` | Show generated collaboration meeting summary |
| `acfm agents artifacts` | Show artifact paths/existence for current session |
| `acfm agents export --format md --out file.md` | Export transcript in Markdown or JSON |
| `acfm agents send "..."` | Send a new user message into the active session |
| `acfm agents status` | Show current collaborative session state |
| `acfm agents model list` | List available models grouped by provider |
| `acfm agents model choose` | Interactively pick provider/model and save target role |
| `acfm agents model get` | Show default model config (global and per-role) |
| `acfm agents model set --role coder provider/model` | Persist a default model for one role |
| `acfm agents model clear --role all` | Clear persisted model defaults |
| `acfm agents stop` | Stop the active collaborative session |

### MCP collaborative run mode (recommended)

When driving SynapseGrid from another agent via MCP, prefer asynchronous run tools over role-by-role stepping:

- `collab_start_session` to initialize session and optional zellij/tmux workers
- `collab_invoke_team` to launch full 4-role collaboration run
- `collab_wait_run` to wait for completion/failure with bounded timeout
- `collab_get_result` to fetch final consolidated output and run diagnostics
- `collab_cancel_run` to cancel a running collaboration safely

`collab_step` remains available for manual/debug control, but is less robust for long tasks.

### SynapseGrid troubleshooting

- If transcript entries show `Agent failed: spawn opencode ENOENT`, run `acfm agents setup` to install dependencies and then retry.
- Attach to worker panes with `acfm agents live` (or `acfm agents attach`) to see real-time role discussion.
- Inspect worker errors quickly with `acfm agents logs --role all --lines 120`.
- Inspect collaborative discussion with `acfm agents transcript` and `acfm agents summary`.
- MCP starts can now create zellij/tmux workers directly; if your assistant used headless steps before, start a new session and ensure worker spawning is enabled.
- Configure role models directly at start (for example `--model-planner`, `--model-coder`) or persist defaults via `acfm agents model choose` / `acfm agents model set`.
- Default SynapseGrid model fallback is `opencode/mimo-v2-pro-free`.
- Run `acfm agents doctor` when panes look idle to confirm model/provider preflight health.
- When zellij is managed by AC Framework, its binary path is saved in `~/.acfm/config.json` and executed directly by SynapseGrid.
- `acfm agents start --json` now includes startup strategy diagnostics for zellij (`attach_with_layout`, fallbacks, and per-strategy errors).

Each collaborative session now keeps human-readable artifacts under `~/.acfm/synapsegrid/<sessionId>/`:
- `transcript.jsonl`: full chronological message stream
- `turns/*.json`: one file per round/role turn with captured output metadata
- `meeting-log.md`: incremental meeting notes generated per turn
- `meeting-summary.md`: final consolidated summary (roles, decisions, open issues, risks, action items)
- `turns/raw/*.ndjson`: raw OpenCode event stream captured per role/round
- `turns/raw/*.stderr.log`: stderr capture per role/round

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

MCP server IDs installed by AC Framework:
- `ac-framework-memory` (NexusVault memory tools)
- `ac-framework-collab` (SynapseGrid collaborative session tools)

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
