---
name: speckit-clarify
description: Clarify ambiguous requirements before specification by asking up to five high-impact questions and recording decisions in .agents/clarifications.md.
license: MIT
compatibility: Works with OpenSpec artifact workflow.
metadata:
  author: ac-framework
  version: "1.0"
---

# Speckit Clarify

Use this skill before `speckit-specify` when requirements are ambiguous.

## Steps
1. Review user request and existing docs (`README`, `openspec/`, `.agents/`).
2. Identify unknowns in scope, data model, UX, non-functional requirements, dependencies, and constraints.
3. Ask targeted questions (max 5) one-by-one. Prefer short options.
4. Save answers to `.agents/clarifications.md` with date, decision, impact, and open risks.
5. Summarize readiness gates for planning.

## Output
- `.agents/clarifications.md`
- Bullet list of resolved and unresolved items.

## Guardrails
- Do not start implementation.
- If user explicitly skips clarifications, record that risk in the output.
