---
name: test-planning
description: Create a layered testing strategy before execution. Use after implementation plan exists and before running or writing final test evidence.
---

Activar esta skill para diseñar estrategia de pruebas previa a ejecución.

## Entradas obligatorias
- `change_name`
- `openspec/changes/<change_name>/tasks.md`
- `openspec/changes/<change_name>/specs/`

## Flujo
1. Identificar riesgos funcionales, regresión y borde.
2. Definir matriz de pruebas (unit, integración, e2e, no funcional).
3. Mapear casos de prueba a criterios WHEN/THEN.
4. Definir datos, entorno y criterios de salida.

## Artefactos de salida exactos
- `.agents/tests/<change_name>/test-plan.md`
- `.agents/tests/<change_name>/test-matrix.csv`
- `openspec/changes/<change_name>/test-plan.md`

## Guardrails
- No ejecutar pruebas (`test-execution`) sin matriz completa.
- No dejar criterios de salida ambiguos o no medibles.
- Todo caso crítico debe estar trazado a un escenario del spec.
