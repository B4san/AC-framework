---
name: speckit-plan
description: Build execution plan from approved OpenSpec artifacts. Use when proposal/spec are complete and implementation sequencing is needed.
---

Activar esta skill para transformar especificaciones en plan ejecutable.

## Entradas obligatorias
- `change_name`
- `openspec/changes/<change_name>/proposal.md`
- `openspec/changes/<change_name>/specs/`

## Flujo
1. Descomponer alcance en entregables incrementales.
2. Definir dependencias, orden y riesgos por tarea.
3. Asociar tareas con criterios de aceptación.
4. Marcar hitos de validación funcional, seguridad y rendimiento.

## Artefactos de salida exactos
- `openspec/changes/<change_name>/tasks.md`
- `openspec/changes/<change_name>/plan.md`
- `.agents/speckit/plan/<change_name>-execution-graph.json`

## Guardrails
- No permitir implementación sin `tasks.md` con checklist accionable.
- No crear tareas huérfanas sin referencia a specs/proposal.
- No cerrar planificación sin riesgos y mitigaciones explícitas.
