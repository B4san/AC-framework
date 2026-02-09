---
name: performance-optimizer
description: Plan and validate performance improvements with measurable baselines. Use when bottlenecks, latency, throughput, or resource regressions are in scope.
---

Activar esta skill cuando exista objetivo explícito de performance.

## Entradas obligatorias
- `change_name`
- `target_metrics` (latencia, throughput, uso de CPU/memoria)
- `baseline_source` (benchmark o medición actual)

## Flujo
1. Confirmar baseline reproducible.
2. Identificar hot paths y causas raíz.
3. Proponer optimizaciones con trade-offs y rollback.
4. Re-medición y comparación contra objetivos.

## Artefactos de salida exactos
- `.agents/perf/<change_name>/baseline.json`
- `.agents/perf/<change_name>/benchmark-results.json`
- `openspec/changes/<change_name>/performance-report.md`

## Guardrails
- No aceptar mejoras sin comparación baseline vs resultado.
- No introducir optimizaciones que rompan exactitud funcional.
- Documentar siempre trade-offs y límites de la medición.
