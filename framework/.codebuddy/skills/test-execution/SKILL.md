---
name: test-execution
description: Execute planned tests, report coverage gaps, and enforce pass/fail gates.
license: MIT
compatibility: Language-agnostic.
metadata:
  author: ac-framework
  version: "1.0"
---

# Test Execution

Runs the test plan and records evidence.

## Steps
1. Execute commands listed in `.agents/test-plan.md`.
2. Record pass/fail results in `.agents/test-results.md`.
3. If failures occur, classify root cause and create follow-up tasks.
4. Report coverage gaps and add missing cases.

## Output
- `.agents/test-results.md`

## Guardrails
- Never claim tests passed without command evidence.
- Surface flaky tests explicitly.
