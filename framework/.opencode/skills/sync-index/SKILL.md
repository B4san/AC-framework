---
name: sync-index
description: Synchronize project index and skill inventory after structural changes. Use when files, skills, or workflows are added, removed, or relocated.
---

Activar esta skill tras cambios de estructura o catálogo de skills.

## Entradas obligatorias
- `change_summary`
- `index_targets` (documentos índice a actualizar)
- `skill_roots` (carpetas `.*/skills` del framework)

## Flujo
1. Detectar diferencias entre estructura actual e índices.
2. Actualizar inventarios y referencias cruzadas.
3. Validar que rutas y nombres de skills existan.
4. Publicar resumen de sincronización y pendientes.

## Artefactos de salida exactos
- `.agents/index/sync-report.md`
- `.agents/index/skills-inventory.json`
- `openspec/changes/<change_name>/index-sync.md` (si aplica change activo)

## Guardrails
- No declarar sincronización completa si existen rutas rotas.
- No eliminar entradas históricas sin moverlas a sección de archivo.
- Registrar siempre fecha, alcance y fuente de verdad usada.
