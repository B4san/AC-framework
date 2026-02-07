# Arquitectura del Proyecto AC-Framework

## Índice
1. [Visión General](#visión-general)
2. [Estructura de Carpetas Ocultas](#estructura-de-carpetas-ocultas)
3. [Arquitectura OpenSpec](#arquitectura-openspec)
4. [Las 10 Skills del Framework](#las-10-skills-del-framework)
5. [Cómo Editar Skills de Forma Segura](#cómo-editar-skills-de-forma-segura)
6. [Patrones de Comandos por Asistente](#patrones-de-comandos-por-asistente)
7. [Flujo de Trabajo OpenSpec](#flujo-de-trabajo-openspec)

---

## Visión General

El **AC-Framework** (Agentic Coding Framework) es un sistema de configuración multi-asistente que proporciona flujos de trabajo consistentes de desarrollo asistido por IA en más de 20 asistentes de codificación diferentes.

### Propósito Principal
- Estandarizar el flujo de trabajo de desarrollo de software mediante la metodología "OpenSpec"
- Implementar un **desarrollo basado en artefactos** donde los cambios progresan por fases estructuradas
- Permitir que el mismo conjunto de skills, comandos y flujos de trabajo funcionen en diferentes asistentes de IA

### Innovación Clave
El framework mantiene **conjuntos de skills idénticos** en todos los asistentes, asegurando un comportamiento consistente independientemente de qué herramienta de IA use el desarrollador.

---

## Estructura de Carpetas Ocultas

El proyecto contiene **22 carpetas ocultas** organizadas por asistente/IDE, todas las carpetas se encuentran dentro de la carpeta framework:

### Lista Completa de Carpetas

| # | Carpeta | Asistente/Herramienta | Tipo | Estructura |
|---|---------|----------------------|------|------------|
| 1 | `.agent` | Generic Agent Framework | Agente | `skills/`, `workflows/` |
| 2 | `.amazonq` | AWS Amazon Q | Cloud | `skills/`, `prompts/` |
| 3 | `.augment` | Augment Code | Asistente | `skills/`, `commands/` |
| 4 | `.claude` | Anthropic Claude Code | CLI | `skills/`, `commands/opsx/` |
| 5 | `.cline` | Cline VS Code | Extensión | `skills/` |
| 6 | `.clinerules` | Reglas compartidas | Configuración | `workflows/` |
| 7 | `.codebuddy` | CodeBuddy | Asistente | `skills/`, `commands/opsx/` |
| 8 | `.codex` | OpenAI Codex | CLI | `skills/` |
| 9 | `.continue` | Continue.dev | Extensión | `skills/`, `prompts/` |
| 10 | `.cospec` | OpenSpec Nativo | Framework | `skills/`, `openspec/commands/` |
| 11 | `.crush` | Crush | Asistente | `skills/`, `commands/opsx/` |
| 12 | `.cursor` | Cursor IDE | IDE | `skills/`, `commands/` |
| 13 | `.factory` | Factory | Asistente | `skills/`, `commands/` |
| 14 | `.gemini` | Google Gemini | Cloud | `skills/`, `commands/opsx/` |
| 15 | `.github` | GitHub Copilot | Extensión | `skills/`, `prompts/` |
| 16 | `.iflow` | iFlow | Asistente | `skills/`, `commands/` |
| 17 | `.kilocode` | Kilo Code | Asistente | `skills/`, `workflows/` |
| 18 | `.opencode` | OpenCode | Framework | `skills/`, `command/` |
| 19 | `.qoder` | Qoder | Asistente | `skills/`, `commands/opsx/` |
| 20 | `.qwen` | Qwen (Alibaba) | Cloud | `skills/`, `commands/` |
| 21 | `.roo` | Roo Code | Extensión | `skills/`, `commands/` |
| 22 | `.trae` | Trae | IDE | `skills/` |
| 23 | `.windsurf` | Windsurf | IDE | `skills/`, `workflows/` |

### Tipos de Organización

Las carpetas se organizan en tres patrones principales:

#### 1. **Skills + Commands** (Mayoría)
```
.<asistente>/
├── skills/openspec-{nombre}/SKILL.md    ← 10 skills idénticas
└── commands/                             ← Comandos específicos
    ├── opsx-new.md                       ← Formato plano
    ├── opsx-apply.md
    └── ...
```

**Asistentes con esta estructura:** `.augment`, `.cursor`, `.factory`, `.roo`, `.iflow`

#### 2. **Skills + Commands Anidados**
```
.<asistente>/
├── skills/openspec-{nombre}/SKILL.md
└── commands/
    └── opsx/                             ← Subdirectorio opsx
        ├── new.md
        ├── apply.md
        └── ...
```

**Asistentes con esta estructura:** `.claude`, `.codebuddy`, `.crush`, `.qoder`

#### 3. **Skills + Prompts**
```
.<asistente>/
├── skills/openspec-{nombre}/SKILL.md
└── prompts/
    ├── opsx-new.prompt.md               ← GitHub Copilot
    └── opsx-new.prompt                  ← Continue.dev
```

**Asistentes con esta estructura:** `.continue`, `.amazonq`, `.github`

#### 4. **Skills + Workflows**
```
.<asistente>/
├── skills/openspec-{nombre}/SKILL.md
└── workflows/
    ├── opsx-new.md
    ├── opsx-apply.md
    └── ...
```

**Asistentes con esta estructura:** `.agent`, `.clinerules`, `.kilocode`, `.windsurf`

#### 5. **Solo Skills**
```
.<asistente>/
└── skills/openspec-{nombre}/SKILL.md
```

**Asistentes con esta estructura:** `.cline`, `.codex`, `.trae`

#### 6. **Estructura Especial - OpenCode**
```
.opencode/
├── .gitignore
├── bun.lock
├── package.json                         ← Tiene dependencias npm
├── node_modules/                        ← Módulos instalados
├── command/                             ← Nota: singular
│   ├── opsx-new.md
│   ├── opsx-apply.md
│   └── ...
└── skills/openspec-{nombre}/SKILL.md
```

**Nota:** `.opencode` es la implementación de referencia con dependencias reales.

---

## Arquitectura OpenSpec

### Conceptos Fundamentales

OpenSpec implementa un **desarrollo basado en especificaciones abiertas** con los siguientes principios:

1. **Todo cambio es un artefacto** - Los cambios se documentan antes de implementarse
2. **Flujo estructurado** - Los cambios progresan por fases definidas
3. **Separación de responsabilidades** - Especificación, diseño e implementación son distintos
4. **Trazabilidad** - Todo está documentado y puede ser verificado

### Jerarquía de Contenido

```
Single Source of Truth (Skills)
            │
            ├───────────────┐
            ▼               ▼
    SKILLS.md          Commands
    (10 skills)        (10 comandos)
    (lógica)           (interfaz)
            │               │
            └───────┬───────┘
                    ▼
        Format-Specific Outputs
        (por asistente)
```

### Estructura de un Cambio OpenSpec

Cada cambio se organiza así:

```
openspec/changes/{nombre-del-cambio}/
├── proposal.md                        ← Por QUÉ hacer el cambio
├── design.md                          ← CÓMO se implementará
├── tasks.md                           ← Lista de tareas
├── specs/
│   └── {capability}/
│       └── spec.md                    ← QUÉ cambia (ADDED/MODIFIED/REMOVED)
└── archive/                           ← Cuando se completa
```

---

## Las 10 Skills del Framework

Todas las carpetas contienen las **mismas 10 skills** con contenido idéntico:

| # | Skill | Descripción | Comando |
|---|-------|-------------|---------|
| 1 | `openspec-onboard` | Tutorial guiado de bienvenida | `/opsx:onboard` |
| 2 | `openspec-new-change` | Crear nuevo cambio (proposal, specs, design, tasks) | `/opsx:new` |
| 3 | `openspec-continue-change` | Continuar cambio existente | `/opsx:continue` |
| 4 | `openspec-ff-change` | Fast-forward: crear todos los artefactos rápidamente | `/opsx:ff` |
| 5 | `openspec-apply-change` | Implementar tareas del cambio | `/opsx:apply` |
| 6 | `openspec-verify-change` | Verificar implementación | `/opsx:verify` |
| 7 | `openspec-archive-change` | Archivar cambio completado | `/opsx:archive` |
| 8 | `openspec-bulk-archive-change` | Archivar múltiples cambios | `/opsx:bulk-archive` |
| 9 | `openspec-sync-specs` | Sincronizar specs delta a specs principales | `/opsx:sync` |
| 10 | `openspec-explore` | Modo exploración (pensar antes de actuar) | `/opsx:explore` |

### Estructura de un SKILL.md

Cada skill sigue este formato:

```yaml
---
name: openspec-{nombre}
description: Descripción clara de cuándo usar esta skill
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.1.1"
---

# Título de la Skill

## Steps

1. **Nombre del Paso**
   - Instrucciones detalladas
   - Comandos bash: `openspec status --change "<nombre>" --json`
   - Uso de herramientas: `**AskUserQuestion tool**`

## Guardrails

- Reglas de seguridad y restricciones
- Qué NO hacer
```

### Metadatos Importantes

- **`name`**: Identificador único de la skill
- **`version`**: Versión de la skill
- **`generatedBy`**: Versión del generador OpenSpec (ej: "1.1.1")
- **`compatibility`**: Dependencias requeridas

---

## Cómo Editar Skills de Forma Segura

### REGLA DE ORO

> **Siempre edita las 3-4 carpetas principales simultáneamente con cambios idénticos.**

Las skills están **espejadas** en múltiples ubicaciones:
- `.continue/skills/openspec-{nombre}/SKILL.md`
- `.opencode/skills/openspec-{nombre}/SKILL.md`
- `.github/skills/openspec-{nombre}/SKILL.md`
- `.cospec/skills/openspec-{nombre}/SKILL.md`
- Y en las otras 18+ carpetas de asistentes

### Niveles de Impacto

#### 🔴 Alto Impacto - Skills
- **Ubicación**: Todas las carpetas `skills/`
- **Impacto**: Afecta a TODOS los asistentes (22+)
- **Sincronización requerida**: SÍ - todas las carpetas

**Proceso seguro:**
1. Edita UNA skill primero (ej: `.agent/skills/openspec-new-change/SKILL.md`)
2. Prueba el cambio con ese asistente
3. Si funciona, replica a TODAS las otras carpetas
4. Todas las 22+ carpetas deben mantenerse sincronizadas

#### 🟡 Medio Impacto - Comandos
- **Ubicación**: Carpetas `commands/`, `command/`, `prompts/`
- **Impacto**: Específico por asistente
- **Sincronización requerida**: NO - formato específico

**Proceso seguro:**
1. Identifica el formato del asistente objetivo
2. Edita en la ubicación apropiada:
   - Plano: `.cursor/commands/opsx-new.md`
   - Anidado: `.claude/commands/opsx/new.md`
   - TOML: `.qwen/commands/opsx-new.toml`
   - Prompt: `.continue/prompts/opsx-new.prompt`

#### 🟢 Bajo Impacto - Workflows
- **Ubicación**: Carpetas `workflows/`
- **Impacto**: Específico por asistente (.agent, .clinerules, .kilocode, .windsurf)
- **Sincronización requerida**: NO

### Checklist de Edición Segura

#### Antes de Editar:
- [ ] Identificar si es skill o comando
- [ ] Identificar qué asistentes se verán afectados
- [ ] Hacer backup del archivo original

#### Al Editar Skills:
- [ ] Preservar estructura YAML del frontmatter
- [ ] Mantener patrón de numeración de pasos
- [ ] Preservar referencias a herramientas (`AskUserQuestion tool`)
- [ ] Mantener rutas: `openspec/changes/<nombre>/`
- [ ] NO cambiar nombres de skills
- [ ] NO modificar flujo de trabajo fundamental

#### Al Editar Comandos:
- [ ] Respetar el formato nativo del asistente
- [ ] Mantener referencia a la skill correspondiente
- [ ] Preservar nombre del comando (`opsx-*`)

#### Después de Editar:
- [ ] Probar con `.agent` (genérico, bien documentado)
- [ ] Probar con `.claude` (estructura anidada)
- [ ] Probar con `.cursor` (IDE popular)
- [ ] Probar con `.opencode` (tiene dependencias npm)

### Modificaciones Seguras vs Riesgosas

#### ✅ Seguras:
- Agregar/clarificar pasos
- Agregar ejemplos
- Agregar guardrails
- Corregir typos
- Expandir documentación

#### ⚠️ Riesgosas (NO EJECUTAR AUTOMATICAMENTE):
- Cambiar patrones de comandos CLI
- Modificar estructura de rutas de archivos
- Cambiar el flujo de trabajo
- Alterar formatos de artefactos
- Modificar versiones de metadatos

---

## Patrones de Comandos por Asistente

Cada asistente usa un formato diferente para los comandos:

### 1. Markdown Plano con YAML Frontmatter

**Asistentes:** `.augment`, `.cursor`, `.factory`, `.roo`, `.iflow`

```markdown
---
name: opsx-new
description: Crear un nuevo cambio OpenSpec
---

# /opsx:new

Crea un nuevo cambio OpenSpec con proposal.md, specs/, design.md y tasks.md.

## Uso

/opsx:new <nombre-del-cambio>
```

### 2. Markdown Anidado en Subdirectorio

**Asistentes:** `.claude`, `.codebuddy`, `.crush`, `.qoder`

```
.claude/commands/
└── opsx/
    ├── new.md
    ├── apply.md
    └── ...
```

### 3. TOML Format

**Asistentes:** `.qwen`, `.gemini`

```toml
name = "opsx-new"
description = "Crear un nuevo cambio OpenSpec"
command = "/opsx:new"
```

### 4. Prompt Format (.prompt)

**Asistentes:** `.continue`

```
.continue/prompts/
├── opsx-new.prompt
├── opsx-apply.prompt
└── ...
```

Contenido similar al markdown pero extensión `.prompt`.

### 5. Prompt Format (.prompt.md)

**Asistentes:** `.github`

```
.github/prompts/
├── opsx-new.prompt.md
├── opsx-apply.prompt.md
└── ...
```

### 6. Workflows Format

**Asistentes:** `.agent`, `.clinerules`, `.kilocode`, `.windsurf`

```
.agent/workflows/
├── opsx-new.md
├── opsx-apply.md
└── ...
```

Contenido enfocado en flujo de trabajo de alto nivel.

---

## Flujo de Trabajo OpenSpec

```
┌─────────────────────────────────────────────────────────────┐
│                      EXPLORAR (/opsx:explore)               │
│              Pensar, investigar, entender el problema       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│     NUEVO (/opsx:new) o FAST-FORWARD (/opsx:ff)            │
│  • proposal.md    ← Por qué                                │
│  • specs/         ← Qué (ADDED/MODIFIED/REMOVED)          │
│  • design.md      ← Cómo                                   │
│  • tasks.md       ← Checklist de tareas                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APLICAR (/opsx:apply)                    │
│           Implementar cada tarea marcando - [x]             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   VERIFICAR (/opsx:verify)                  │
│         Completitud, corrección, coherencia                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (opcional)
┌─────────────────────────────────────────────────────────────┐
│                     SINCRONIZAR (/opsx:sync)                │
│           Sincronizar specs delta a specs principales      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ARCHIVAR (/opsx:archive)                 │
│    Mover a openspec/changes/archive/YYYY-MM-DD-nombre/     │
└─────────────────────────────────────────────────────────────┘
```

### Estados de un Cambio

1. **DRAFT** - Cambio creado, en progreso
2. **IN_PROGRESS** - Implementando tareas
3. **VERIFYING** - En verificación
4. **ARCHIVED** - Completado y archivado

### Comandos CLI OpenSpec

Las skills dependen de la CLI de OpenSpec:

```bash
# Estado del cambio
openspec status --change "<nombre>" --json

# Instrucciones de artefacto
openspec instructions <artifacto> --change "<nombre>" --json

# Listar cambios
openspec list --json

# Crear cambio
openspec new change "<nombre>"

# Archivar cambio
openspec archive "<nombre>"
```

---

## Mejores Prácticas

### Para Contribuir al Framework:

1. **Siempre mantén sincronización** - Si cambias una skill, cámbiala en todas las carpetas
2. **Prueba en múltiples asistentes** - No asumas que funciona en todos si funciona en uno
3. **Documenta los cambios** - Añade comentarios en los PR sobre qué cambió y por qué
4. **Respeta las versiones** - Si haces cambios significativos, considera actualizar la versión
5. **Verifica compatibilidad** - Asegúrate de que los comandos CLI sigan funcionando

### Para Uso Diario:

1. **Empieza con /opsx:onboard** - Si eres nuevo, haz el tutorial primero
2. **Usa /opsx:explore** - Antes de crear un cambio, explora el problema
3. **Cambia incrementalmente** - No crees cambios gigantes, divídelos
4. **Verifica antes de archivar** - Siempre ejecuta /opsx:verify
5. **Mantén specs actualizados** - Usa /opsx:sync para mantener documentación

---

## Referencia Rápida

### Ubicaciones Clave:

```
/workspaces/AC-framework/
├── README.md                          ← Este archivo
├── ARQUITECTURA.md                    ← Documentación de arquitectura
├── openspec/                          ← Configuración OpenSpec
│   └── config.yaml
├── openspec/changes/                  ← Cambios activos
├── openspec/changes/archive/          ← Cambios archivados
│
├── .continue/skills/                  ← Skills para Continue.dev
├── .opencode/skills/                  ← Skills para OpenCode
├── .github/skills/                    ← Skills para GitHub Copilot
├── .cursor/skills/                    ← Skills para Cursor
│   └── ... (y 18+ carpetas más)
│
└── .opencode/command/                 ← Comandos OpenCode
    ├── opsx-new.md
    ├── opsx-apply.md
    └── ...
```

### Comandos Útiles:

```bash
# Ver estructura de una carpeta
tree -a .cursor/

# Buscar skills específicas
find . -path "*/skills/openspec-new-change/SKILL.md" -type f

# Comparar skills entre asistentes
diff .continue/skills/openspec-new-change/SKILL.md .opencode/skills/openspec-new-change/SKILL.md

# Contar carpetas de asistentes
ls -1d .[!.]* | wc -l
```

---

## Conclusión

El AC-Framework es un sistema sofisticado que permite trabajar con múltiples asistentes de IA manteniendo consistencia en los flujos de trabajo. La clave para trabajar con él de forma segura es:

1. **Entender la sincronización** - Las skills son compartidas por todos los asistentes
2. **Respetar los formatos** - Cada asistente tiene su propio formato de comandos
3. **Probar exhaustivamente** - Los cambios afectan a múltiples sistemas
4. **Mantener la documentación** - El framework vive de la documentación clara

Para cualquier modificación, sigue el principio: **"Cambia una vez, replica en todas partes."**

---

*Documento generado para el proyecto AC-Framework*  
*Última actualización: Febrero 2026*
