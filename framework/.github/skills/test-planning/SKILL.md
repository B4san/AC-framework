---
name: test-planning
description: Design test strategy from requirements and specs before implementation.
license: MIT
compatibility: Language-agnostic.
metadata:
  author: ac-framework
  version: "1.0"
---

# Test Planning

Creates verifiable test coverage tied to requirements.

## Steps
1. Read proposal, specs, and tasks.
2. Map acceptance criteria to unit, integration, and end-to-end tests.
3. Define fixtures, mocks, and negative/error scenarios.
4. Record command matrix and expected outcomes.
5. Save plan at `.agents/test-plan.md`.

## Output
- `.agents/test-plan.md`

## Guardrails
- Include security and performance regression cases when relevant.
- Avoid implementation details in test case names.
