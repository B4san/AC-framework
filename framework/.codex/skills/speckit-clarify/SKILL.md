---
name: speckit-clarify
description: Clarify ambiguous requirements before writing specs. Use when a request is incomplete, conflicting, or missing acceptance criteria and risks.
---

Activar esta skill cuando el pedido no tenga alcance claro o falten criterios verificables.

## Entradas obligatorias
- `request_raw`: texto original de la solicitud.
- `context_paths`: rutas relevantes del repo para revisar contexto.
- `change_name`: nombre kebab-case para `openspec/changes/<name>/`.

## Flujo
1. Analizar `request_raw` y detectar vacíos, contradicciones y supuestos.
2. Crear preguntas de aclaración priorizadas (bloqueantes y no bloqueantes).
3. Convertir respuestas confirmadas en requisitos verificables.
4. Entregar resumen listo para fase de especificación.

## Artefactos de salida exactos
- `.agents/speckit/clarify/<change_name>.md`
- `.agents/speckit/clarify/<change_name>.json`
- `openspec/changes/<change_name>/clarifications.md`

## Guardrails
- No avanzar a `speckit-specify` sin todas las preguntas bloqueantes respondidas.
- No inventar decisiones de negocio; marcar explícitamente lo no resuelto.
- No crear `design.md` ni `tasks.md` en esta fase.
