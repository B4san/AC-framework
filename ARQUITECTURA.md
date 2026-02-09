# Arquitectura del Proyecto AC-Framework

## 1) Resumen
AC-Framework es un framework multi-asistente basado en OpenSpec. El núcleo vive en `framework/` y debe permanecer sincronizado entre todas las carpetas ocultas de asistentes.

Principio operativo:
- **Una sola arquitectura**
- **Mismas skills transversales para todos los asistentes**
- **Mismo workflow `ac.md` en todos los formatos (commands/prompts/workflows)**

## 2) Módulos y fuente de verdad
- Carpeta base: `framework/`
- Carpeta de referencia para sincronización: `framework/.claude/`
- Asistentes soportados con `skills/`: 22
- Carpeta instalada automáticamente junto con `.cline`: `.clinerules`

## 3) Taxonomía de skills (actualizada)

### OpenSpec (núcleo)
- openspec-onboard
- openspec-explore
- openspec-new-change
- openspec-continue-change
- openspec-ff-change
- openspec-apply-change
- openspec-verify-change
- openspec-archive-change
- openspec-bulk-archive-change
- openspec-sync-specs

### Calidad, seguridad y resiliencia
- secure-coding-cybersecurity
- code-maintainability
- error-handling-patterns
- systematic-debugging
- security-scan
- code-review

### Planificación, análisis y diseño
- brainstorming
- project-index
- api-design-principles
- interface-design
- speckit-clarify
- speckit-specify
- speckit-plan
- performance-optimizer
- test-planning
- test-execution
- sync-index

### Documentación
- changelog-generator
- skill-writer

## 4) Workflow obligatorio del comando `ac`
El comando `ac` debe respetar fases con gates obligatorios:
1. Preparación (`openspec-onboard`, constitución y memoria)
2. Fundamentos (`speckit-clarify`, seguridad, mantenibilidad, errores, rendimiento)
3. Exploración (`openspec-explore`, `project-index`)
4. Especificación y plan (`speckit-specify`, `speckit-plan`, `openspec-*`, `test-planning`)
5. Implementación (`openspec-apply-change`, `test-execution`, rendimiento)
6. Validación (`systematic-debugging`, `openspec-verify-change`, `security-scan`, `code-review`)
7. Cierre (`changelog-generator`, `sync-index`, `openspec-sync-specs`, `openspec-archive-change`)

Artefactos mínimos:
- `.agents/constitution.md`
- `.agents/clarifications.md`
- `.agents/project-index.md` (si proyecto existente)
- `.agents/test-plan.md` y `.agents/test-results.md`
- `.agents/security-scan.md`
- `openspec/changes/<nombre>/{proposal.md,design.md,tasks.md,specs/...}`

## 5) Sincronización segura de skills y comandos
Regla estricta: cualquier cambio de skill o `ac.md` se replica a todas las carpetas equivalentes.

Comprobación recomendada antes de publicar:
```bash
acfm verify
```

El verificador revisa:
- conjunto de skills por asistente
- hash de contenido de cada `SKILL.md`
- paridad del archivo `ac.md` equivalente

## 6) Guía de cambios
### Alto impacto
- `framework/.*/skills/**/SKILL.md`
- `framework/.*/**/ac.md`

### Medio impacto
- comandos `opsx-*` específicos de cada asistente

### Bajo impacto
- documentación y assets auxiliares

## 7) Convenciones
- Nombres de skills: kebab-case
- Archivos de skill: `skills/<skill-name>/SKILL.md`
- Cambios OpenSpec: `openspec/changes/<change-name>/...`
- Memoria operativa: `.agents/*.md`
