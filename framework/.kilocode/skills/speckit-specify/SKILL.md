---
name: speckit-specify
description: Transform clarified requirements into OpenSpec proposal/spec artifacts. Use after clarify phase is complete and requirements are testable.
---

Activar esta skill al pasar de aclaración a especificación formal.

## Entradas obligatorias
- `change_name`: nombre kebab-case existente.
- `.agents/speckit/clarify/<change_name>.md`
- `.agents/speckit/clarify/<change_name>.json`

## Flujo
1. Derivar objetivos, alcance y no-alcance desde clarificaciones.
2. Escribir propuesta y escenarios WHEN/THEN verificables.
3. Registrar supuestos, dependencias y restricciones.
4. Validar trazabilidad entre requisito y escenario.

## Artefactos de salida exactos
- `openspec/changes/<change_name>/proposal.md`
- `openspec/changes/<change_name>/specs/<capability>/spec.md`
- `.agents/speckit/specify/<change_name>-traceability.md`

## Guardrails
- No iniciar planificación (`speckit-plan`) si falta `proposal.md` o escenarios WHEN/THEN.
- No redactar tareas de implementación en esta fase.
- Cada requisito debe mapear a al menos un escenario de aceptación.
