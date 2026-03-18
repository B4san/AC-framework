---
name: acfm-spec-workflow
description: Initialize and manage AC Framework spec-driven workflows using acfm CLI. Use when setting up spec workflows, checking project status, creating changes, or understanding the .acfm/ vs openspec/ directory structures. Essential first step before using any OpenSpec skills.
---

# AC Framework Spec-Driven Workflow

Guide for initializing and managing spec-driven development workflows using the AC Framework CLI (`acfm`).

## When to use this skill

Use this skill when:
- **Starting a new project** and need to initialize the spec workflow
- **Working on an existing project** and need to check if specs are initialized
- **Creating a new change/feature** using the spec-driven workflow
- **Unsure whether to use `.acfm/` or `openspec/`** directories
- **Need to understand CLI commands** for spec management
- **Migrating from legacy openspec/ to new .acfm/ structure**

## Quick start

```bash
# Check if project is initialized
acfm spec status --json

# Initialize new project (creates .acfm/)
acfm spec init

# Create a new change
acfm spec new my-feature --json

# Get instructions for next artifact
acfm spec instructions proposal --change my-feature --json
```

## Directory Structure

### NEW (Default): `.acfm/` directory

```
project-root/
├── .acfm/                    # NEW: Default spec directory
│   ├── config.yaml           # Project configuration
│   ├── specs/                # Shared specs
│   └── changes/              # Active changes
│       ├── archive/          # Archived changes
│       └── my-feature/       # Individual change
│           ├── .openspec.yaml
│           ├── proposal.md
│           ├── design.md
│           ├── tasks.md
│           └── specs/
```

### LEGACY: `openspec/` directory

```
project-root/
├── openspec/                 # LEGACY: Still fully supported
│   ├── config.yaml
│   ├── specs/
│   └── changes/
```

**Priority**: CLI automatically uses `.acfm/` if it exists, otherwise falls back to `openspec/`.

## Instructions

### Step 1: Check initialization status

Always start by checking if the project is initialized:

```bash
acfm spec status --json
```

**If not initialized** (`"initialized": false`):
- Proceed to Step 2 to initialize

**If initialized** (`"initialized": true`):
- Note the `dirName` field (either `.acfm` or `openspec`)
- Proceed to Step 3 to create changes

### Step 2: Initialize the project

For new projects:

```bash
acfm spec init
```

This creates:
- `.acfm/config.yaml` - Project configuration
- `.acmf/specs/` - Shared specifications
- `.acfm/changes/` - Active changes directory

**Legacy support**: If the project already has `openspec/`, it will be detected automatically. No need to migrate unless desired.

### Step 3: Create a change

```bash
acfm spec new <change-name> --json
```

Example:
```bash
acfm spec new user-authentication --json
```

**Output**:
```json
{
  "changeDir": "/project/.acfm/changes/user-authentication",
  "schemaName": "spec-driven",
  "artifacts": ["proposal", "specs", "design", "tasks"]
}
```

### Step 4: Get instructions for artifacts

Each artifact has specific instructions:

```bash
# Get instructions for proposal
acfm spec instructions proposal --change <name> --json

# Get instructions for design
acfm spec instructions design --change <name> --json

# Get instructions for tasks
acfm spec instructions tasks --change <name> --json

# Get apply instructions (when ready to implement)
acfm spec instructions apply --change <name> --json
```

### Step 5: Check status

Monitor progress:

```bash
# Status of specific change
acfm spec status --change <name> --json

# List all changes
acfm spec list --json
```

### Step 6: Archive completed changes

```bash
acfm spec archive <change-name>
```

## CLI Command Reference

### Initialization
- `acfm spec init [--json]` - Initialize spec directory
- `acfm spec status [--json]` - Check initialization status

### Change Management
- `acfm spec new <name> [--json]` - Create new change
- `acfm spec list [--json]` - List all changes
- `acfm spec status --change <name> [--json]` - Check change status
- `acfm spec archive <name> [--json]` - Archive completed change

### Instructions
- `acfm spec instructions <artifact> --change <name> [--json]` - Get artifact instructions
- `acfm spec schemas [--json]` - List available schemas
- `acfm spec validate <name> [--json]` - Validate change structure

## Common scenarios

### Scenario: New project setup

```bash
# 1. Check status
acfm spec status --json

# 2. Initialize
acfm spec init

# 3. Create first change
acfm spec new initial-setup --json

# 4. Get proposal instructions
acfm spec instructions proposal --change initial-setup --json
```

### Scenario: Legacy project (openspec/)

```bash
# CLI automatically detects openspec/ directory
acfm spec status --json
# Output: { "initialized": true, "dirName": "openspec", ... }

# Create change in openspec/
acfm spec new legacy-feature --json
# Creates: openspec/changes/legacy-feature/
```

### Scenario: Mixed directories

If both `.acfm/` and `openspec/` exist:
- CLI uses `.acfm/` (higher priority)
- Changes are created in `.acfm/changes/`

To use `openspec/` temporarily:
```bash
mv .acfm/ .acfm-backup/
# Now CLI will use openspec/
```

## Best practices

1. **Always use CLI commands** - Don't manually create directories
2. **Use `--json` flag** for programmatic parsing
3. **Check initialization first** - Before creating changes
4. **Let CLI handle paths** - Don't hardcode `.acfm/` or `openspec/`
5. **Archive completed changes** - Keeps active list clean

## Troubleshooting

### "Spec system not initialized"

```bash
# Solution
acfm spec init
```

### Changes not appearing

```bash
# Check which directory is being used
acfm spec status --json
# Look at "dirName" field

# List both directories
ls -la .acfm/changes/ 2>/dev/null || echo "No .acfm/"
ls -la openspec/changes/ 2>/dev/null || echo "No openspec/"
```

### Wrong directory detected

```bash
# Force use of openspec/ by renaming .acfm/
mv .acfm/ .acfm-backup/

# Or force use of .acfm/ by renaming openspec/
mv openspec/ openspec-backup/
```

## Requirements

- AC Framework CLI (`acfm`) must be installed
- Node.js >= 18.0.0

## Compatibility

- ✅ Works with both `.acfm/` (new) and `openspec/` (legacy)
- ✅ All existing OpenSpec skills continue to work
- ✅ No migration required for legacy projects
- ✅ Optional migration path available

## See also

- Use `openspec-new-change` skill after initialization to create structured changes
- Use `openspec-continue-change` to work on existing changes
- Use `openspec-apply-change` to implement tasks
