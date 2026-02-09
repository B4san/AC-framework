---
name: performance-optimizer
description: Define and validate performance goals, measure bottlenecks, and apply iterative optimizations.
license: MIT
compatibility: Language-agnostic.
metadata:
  author: ac-framework
  version: "1.0"
---

# Performance Optimizer

Use in foundations, implementation, and verification phases.

## Steps
1. Define SLO/SLA targets (latency, throughput, resource usage) in `.agents/performance-budget.md`.
2. Establish baseline metrics.
3. Identify hotspots and propose optimizations.
4. Re-measure and compare before/after.
5. Record final findings in `.agents/performance-report.md`.

## Output
- `.agents/performance-budget.md`
- `.agents/performance-report.md`

## Guardrails
- Prioritize measurable impact over speculative micro-optimizations.
