---
name: sync-index
description: Re-run project-index after structural changes and synchronize agent memory artifacts.
license: MIT
compatibility: Requires project-index skill.
metadata:
  author: ac-framework
  version: "1.0"
---

# Sync Index

Keeps project context synchronized after large changes.

## Steps
1. Detect structural changes (folders, domains, key configs, APIs).
2. Run `project-index` process and refresh `.agents/project-index.md`.
3. Update related docs (`.agents/constitution.md`, domain guides, README references).
4. Summarize context deltas and follow-up actions.

## Output
- Updated `.agents/project-index.md`
- Delta summary in `.agents/sync-index-report.md`

## Guardrails
- Do not overwrite manual notes without preserving prior context.
