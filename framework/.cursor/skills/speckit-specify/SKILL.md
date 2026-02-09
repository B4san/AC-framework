---
name: speckit-specify
description: Convert clarified requirements into a change proposal and initialize OpenSpec change naming safely.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: ac-framework
  version: "1.0"
---

# Speckit Specify

Transforms intent into a concrete OpenSpec change proposal.

## Steps
1. Read `.agents/clarifications.md` when present.
2. Derive a unique kebab-case change name and check collisions in `openspec/changes/`.
3. Create or update `openspec/changes/<change-name>/proposal.md` with context, objectives, out-of-scope, acceptance criteria, risks.
4. Confirm user approval before moving to planning.

## Output
- `openspec/changes/<change-name>/proposal.md`
- Named change ready for `speckit-plan` and `openspec-continue-change`.

## Guardrails
- Do not auto-approve the proposal on behalf of the user.
- Keep proposal aligned with clarified requirements.
