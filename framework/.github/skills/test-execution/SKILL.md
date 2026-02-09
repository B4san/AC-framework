---
name: test-execution
description: Execute planned tests and produce auditable evidence. Use only after test-planning artifacts are complete.
---

Activar esta skill para ejecutar y documentar evidencia de pruebas.

## Entradas obligatorias
- `change_name`
- `.agents/tests/<change_name>/test-plan.md`
- `.agents/tests/<change_name>/test-matrix.csv`

## Flujo
1. Ejecutar casos según prioridad definida.
2. Registrar resultados, logs, evidencia y defectos.
3. Repetir pruebas relevantes tras correcciones.
4. Consolidar reporte final con estado de salida.

## Artefactos de salida exactos
- `.agents/tests/<change_name>/test-results.md`
- `.agents/tests/<change_name>/evidence/`
- `openspec/changes/<change_name>/verification.md`

## Guardrails
- No marcar "aprobado" sin evidencia para cada caso crítico.
- No editar plan de pruebas durante ejecución sin registrar cambio.
- No cerrar cambio si hay defectos críticos abiertos.
