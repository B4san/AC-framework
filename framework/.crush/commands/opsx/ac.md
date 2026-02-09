# AC Workflow Orchestrator (OpenSpec + Speckit)

**Objetivo**: ejecutar un flujo obligatorio, coherente y auditable para cambios nuevos y existentes.

## Reglas globales
- Leer al inicio: `.agents/constitution.md` (si no existe, crearlo con principios del proyecto).
- Mantener artefactos en `.agents/` y `openspec/changes/<change>/`.
- No avanzar de fase sin completar su **gate**.
- Consultar `.agents/project-index.md` antes de planificar implementación en proyectos existentes.

## Fase 0 — Preparación
1. `openspec-onboard` (si equipo nuevo o dudas de metodología).
2. Crear/validar:
   - `.agents/constitution.md`
   - `.agents/clarifications.md`
   - `.agents/architecture-decisions.md`

**Gate**: constitución y memoria base disponibles.

## Fase 1 — Fundamentos y alcance
1. `speckit-clarify`
2. `secure-coding-cybersecurity` → `.agents/security-guidelines.md`
3. `code-maintainability` → `.agents/maintainability-rules.md`
4. `error-handling-patterns` → `.agents/error-handling.md`
5. `performance-optimizer` (definir presupuesto inicial)
6. Opcional según alcance:
   - `interface-design`
   - `api-design-principles`

**Gate**: requisitos aclarados + reglas de seguridad/mantenibilidad/errores/rendimiento documentadas.

## Fase 2 — Exploración
1. `openspec-explore`
2. `project-index` (obligatorio en repos existentes)

**Gate**: `.agents/exploration-report.md` y/o `.agents/project-index.md` actualizado.

## Fase 3 — Especificación y planificación
1. `speckit-specify`
2. `speckit-plan` (research, data-model, contracts, quickstart)
3. `brainstorming` (evaluar alternativas y decisión final)
4. `openspec-new-change` (o continuar uno existente aprobado)
5. `openspec-continue-change` (design, tasks, specs)
6. `test-planning`

**Gate**:
- `proposal.md`, `design.md`, `tasks.md`, `specs/*/spec.md`
- plan técnico creado
- estrategia de pruebas lista
- aprobación del usuario para implementar

## Fase 4 — Implementación
1. `openspec-apply-change`
2. `test-execution`
3. `performance-optimizer` (medición iterativa)

**Gate**: tareas completadas + pruebas clave pasando + presupuesto de rendimiento dentro de objetivo o con excepción justificada.

## Fase 5 — Validación y hardening
1. `systematic-debugging`
2. `openspec-verify-change`
3. `security-scan`
4. `code-review`

**Gate**: verificación completa de specs + reporte de seguridad + revisión sin bloqueantes.

## Fase 6 — Cierre y sincronización
1. `changelog-generator`
2. `sync-index` (si hubo cambios estructurales)
3. `openspec-sync-specs`
4. `openspec-archive-change`

**Gate final**: cambio archivado, documentación sincronizada y contexto actualizado.

## Orden recomendado para proyectos existentes
`project-index` → `speckit-clarify` → `speckit-specify` → `speckit-plan` → flujo OpenSpec normal.
