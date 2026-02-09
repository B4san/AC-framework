---
name: speckit-plan
description: Perform technical planning before coding by producing research, data model, contracts, and quickstart artifacts.
license: MIT
compatibility: Works with OpenSpec changes.
metadata:
  author: ac-framework
  version: "1.0"
---

# Speckit Plan

Generates the technical plan and design inputs required before implementation.

## Steps
1. Read proposal and `.agents/constitution.md`.
2. Produce `research.md` with decisions, alternatives, security/performance implications.
3. Produce `data-model.md` for entities, constraints, and lifecycle.
4. Produce `contracts/` for API/interface definitions.
5. Produce `quickstart.md` for local validation.
6. Update `.agents/architecture-decisions.md` with ADR-style records.

## Output
Inside `openspec/changes/<change-name>/`:
- `research.md`
- `data-model.md`
- `contracts/*`
- `quickstart.md`

## Guardrails
- Do not code before plan artifacts exist.
- Mark unknowns explicitly as `NEEDS CLARIFICATION`.
