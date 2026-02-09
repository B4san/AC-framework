---
name: security-scan
description: Run structured security review and report findings with severity and remediation. Use before merge or release, and whenever sensitive flows change.
---

Activar esta skill para evaluación de seguridad previa a entrega.

## Entradas obligatorias
- `change_name`
- `threat_surface` (componentes/rutas afectadas)
- `scan_scope_paths`

## Flujo
1. Revisar superficie de ataque y datos sensibles.
2. Ejecutar chequeos estáticos/dinámicos aplicables.
3. Clasificar hallazgos por severidad y explotabilidad.
4. Definir mitigaciones, due date y propietario.

## Artefactos de salida exactos
- `.agents/security/<change_name>/findings.sarif`
- `.agents/security/<change_name>/security-report.md`
- `openspec/changes/<change_name>/security-review.md`

## Guardrails
- No permitir cierre con hallazgos críticos sin mitigación aprobada.
- No reportar "sin hallazgos" sin evidencias de alcance y herramientas.
- Registrar explícitamente falsos positivos y justificación.
