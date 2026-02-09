---
name: code-review
description: Perform structured review against specs, maintainability rules, and security/performance constraints.
license: MIT
compatibility: Language-agnostic.
metadata:
  author: ac-framework
  version: "1.0"
---

# Code Review

Cross-check implementation quality before archiving.

## Steps
1. Review diffs against `proposal.md`, `spec.md`, `design.md`, and `tasks.md`.
2. Validate maintainability, naming, modularity, and error handling.
3. Validate security and performance implications.
4. Record blocking/non-blocking comments in `.agents/code-review.md`.
5. Gate merge until blocking issues are resolved.

## Output
- `.agents/code-review.md`

## Guardrails
- Review must be evidence-based, not preference-only.
