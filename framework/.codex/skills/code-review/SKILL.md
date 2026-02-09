---
name: code-review
description: Perform structured peer-style review for correctness, maintainability, and risk before merge. Use after implementation and tests are available.
---

Activar esta skill para revisión técnica final previa a merge.

## Entradas obligatorias
- `change_name`
- `diff_range` (commit/branch a revisar)
- `openspec/changes/<change_name>/tasks.md`

## Flujo
1. Verificar alineación del diff con tareas y specs.
2. Revisar corrección, legibilidad, mantenibilidad y riesgos.
3. Validar cobertura de pruebas y documentación de cambios.
4. Emitir dictamen: aprobado / cambios solicitados.

## Artefactos de salida exactos
- `.agents/review/<change_name>/review-notes.md`
- `.agents/review/<change_name>/review-checklist.md`
- `openspec/changes/<change_name>/code-review.md`

## Guardrails
- No aprobar si hay fallos de seguridad o regresión no resueltos.
- No aceptar cambios fuera de alcance sin actualización de spec.
- Toda observación crítica debe incluir acción concreta.
