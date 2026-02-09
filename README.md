# AC-Framework 🚀

<p align="center">
  <img src="https://img.shields.io/badge/OpenSpec-Based-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgMkM1LjU4IDIgMiA1LjU4IDIgMTBzMy41OCA4IDggOCA4LTMuNTggOC04LTMuNTgtOC04LTh6bTMuNSA5LjVhMS41IDEuNSAwIDAxLTIgMEwxMCAxMGwxLjUtMS41YTEuNSAxLjUgMCAwMTIgMEwxNCAxMGwtMS41IDEuNXoiIGZpbGw9IndoaXRlIi8+PC9zdmc+" />
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/23+-Assistants-purple?style=for-the-badge" />
</p>

<p align="center">
  <strong>🤖 Agentic Coding Framework</strong><br>
  <em>Framework basado en OpenSpec con sistema de Skills mejorado y Skill Routing inteligente para IA</em>
</p>

---

## 📖 ¿Qué es AC-Framework?

**AC-Framework** (Agentic Coding Framework) es un framework de desarrollo avanzado basado en **OpenSpec** que implementa la metodología **Spec-Driven Development** con mejoras significativas para el contexto y enrutamiento de IA.

### 🎯 Filosofía OpenSpec

AC-Framework adopta y potencia los principios fundamentales de OpenSpec:

- **📋 Todo cambio es un artefacto** - Cada modificación se documenta antes de implementarse
- **🔄 Desarrollo basado en especificaciones** - El "qué" (specs), "cómo" (design) y "por qué" (proposal) están separados
- **✅ Trazabilidad total** - Historial completo de decisiones y cambios
- **🎯 Contexto preservado** - La IA siempre tiene el contexto correcto para cada tarea


---

## 🚀 Características Principales

### 🎭 10 Skills Especializadas

Cada skill está diseñada para un propósito específico del ciclo de desarrollo:

| Comando | Skill | Descripción |
|---------|-------|-------------|
| `/opsx:onboard` | **Onboarding** | Tutorial guiado para nuevos usuarios |
| `/opsx:new` | **New Change** | Crear cambio completo con proposal, specs, design y tasks |
| `/opsx:continue` | **Continue Change** | Retomar un cambio existente |
| `/opsx:ff` | **Fast Forward** | Crear todos los artefactos rápidamente |
| `/opsx:apply` | **Apply Change** | Implementar tareas del cambio actual |
| `/opsx:verify` | **Verify Change** | Verificar completitud y calidad |
| `/opsx:archive` | **Archive Change** | Archivar cambio completado |
| `/opsx:bulk-archive` | **Bulk Archive** | Archivar múltiples cambios |
| `/opsx:sync` | **Sync Specs** | Sincronizar specs delta a principales |
| `/opsx:explore` | **Explore** | Modo exploración (pensar antes de actuar) |

### 🧠 Sistema de Skill Routing

El **Skill Routing** es una innovación clave de AC-Framework que proporciona:

- **🎯 Contexto Contextualizado**: Cada skill recibe solo el contexto relevante para su función
- **🔄 Enrutamiento Automático**: La IA sabe qué skill usar según el estado del proyecto
- **📊 Preservación de Estado**: El contexto se mantiene coherente entre skills
- **⚡ Optimización**: Menor consumo de tokens al enviar solo contexto necesario

### 🌐 Multi-Asistente Sincronizado

**23+ Asistentes de IA soportados** con el mismo conjunto de skills:

#### IDEs y Editores
- 📝 **Cursor** - IDE con IA integrada
- 🌊 **Windsurf** - Editor AI-first
- 🎯 **Trae** - IDE con asistente IA
- 💎 **Gemini** - Google AI Studio

#### Herramientas CLI
- 🎩 **Claude Code** - CLI de Anthropic
- 🤖 **Codex** - OpenAI Codex CLI
- 👤 **CodeBuddy** - Asistente CLI

#### Extensiones VS Code
- 🔌 **Continue.dev** - Extensión de código abierto
- 🦅 **Cline** - Asistente de codificación
- 🦘 **Roo Code** - Fork de Cline
- 🐙 **GitHub Copilot** - Asistente de GitHub

#### Cloud y Otros
- ☁️ **Amazon Q** - AWS AI Assistant
- 🐉 **Qwen** - Alibaba Cloud
- ⚡ **Augment** - Augment Code
- 🔧 **OpenCode** - Framework de código abierto
- Y **13 asistentes más...**

---

## 📦 Instalación

### Instalación Global

```bash
# Instalar el CLI de AC-Framework
npm install -g ac-framework

# Inicializar en tu proyecto
acfm init
```

### Instalación Local

```bash
# Instalar como dependencia de desarrollo
npm install --save-dev ac-framework

# Ejecutar el inicializador
npx acfm init
```

### Uso del CLI

```bash
acfm [opciones] [comando]

Comandos:
  init [options]  Inicializar AC-Framework en el proyecto
  help [command]  Mostrar ayuda de un comando

Opciones:
  -V, --version   Mostrar versión
  -h, --help      Mostrar ayuda
```

---

## 🏗️ Estructura de Proyecto OpenSpec

Cuando inicializas AC-Framework, se crea la siguiente estructura:

```
openspec/
├── config.yaml                    # Configuración global
├── changes/                       # Cambios activos
│   ├── {nombre-cambio}/
│   │   ├── proposal.md           # 📝 Por QUÉ hacer el cambio
│   │   ├── design.md             # 🎨 CÓMO se implementará
│   │   ├── tasks.md              # ✅ Lista de tareas
│   │   └── specs/
│   │       └── {capability}/
│   │           └── spec.md       # 📋 QUÉ cambia
│   └── archive/                   # 📦 Cambios completados
│       └── YYYY-MM-DD-{nombre}/
└── specs/                         # Especificaciones principales
    └── {capability}/
        └── spec.md
```

### Artefactos de un Cambio

Cada cambio OpenSpec incluye 4 artefactos fundamentales:

1. **📄 proposal.md** - Justificación y contexto del cambio
2. **🎨 design.md** - Arquitectura y enfoque de implementación
3. **✅ tasks.md** - Checklist de tareas ejecutables
4. **📋 specs/** - Especificaciones técnicas detalladas

---

## 🔄 Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────────┐
│                    🧭 EXPLORAR (/opsx:explore)              │
│           Investigar, entender, planificar                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              🆕 NUEVO (/opsx:new) o (/opsx:ff)              │
│  • proposal.md    ← Justificación                          │
│  • specs/         ← Requisitos                             │
│  • design.md      ← Arquitectura                           │
│  • tasks.md       ← Plan de trabajo                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   🔨 APLICAR (/opsx:apply)                  │
│           Implementar y marcar tareas completadas           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  ✔️ VERIFICAR (/opsx:verify)                │
│          Revisar calidad y completitud                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (opcional)
┌─────────────────────────────────────────────────────────────┐
│                   🔄 SINCRONIZAR (/opsx:sync)               │
│          Actualizar documentación principal                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  📦 ARCHIVAR (/opsx:archive)                │
│         Mover a archivo con fecha                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Uso Rápido

### 1. Inicializar Proyecto

```bash
acfm init
```

Selecciona los asistentes que usarás (puedes elegir múltiples):

```
? ¿Qué módulos deseas instalar? (Selecciona con espacio)
 ❯◉ Cursor IDE
  ◯ Claude Code
  ◯ Continue.dev
  ◉ GitHub Copilot
  ◯ ...
```

### 2. Crear un Cambio

```
/opsx:new feature-user-authentication
```

Esto crea:
- `openspec/changes/feature-user-authentication/proposal.md`
- `openspec/changes/feature-user-authentication/design.md`
- `openspec/changes/feature-user-authentication/tasks.md`
- `openspec/changes/feature-user-authentication/specs/auth/spec.md`

### 3. Implementar

```
/opsx:apply
```

La IA implementará las tareas del archivo `tasks.md`, marcándolas como completadas.

### 4. Verificar y Archivar

```
/opsx:verify
/opsx:archive
```

---

```bash
# Las skills están en:
framework/.{asistente}/skills/openspec-{nombre}/SKILL.md

# Ejemplo:
framework/.cursor/skills/openspec-new-change/SKILL.md
framework/.claude/skills/openspec-new-change/SKILL.md
framework/.opencode/skills/openspec-new-change/SKILL.md
```

---

## 📝 Licencia

MIT © AC-Framework Team

---

<p align="center">
  <strong>🚀 Desarrollo asistido por IA, estandarizado y potenciado</strong><br>
  <em>Trabaja con cualquier asistente, mantén el mismo flujo de trabajo</em>
</p>

## 🔍 Verificación de paridad

Para evitar drift entre asistentes, ejecuta:

```bash
acfm verify
```

Opciones:

```bash
acfm verify --framework framework --reference .claude
```

Este comando valida que todas las carpetas tengan el mismo set de skills y que los `ac.md` equivalentes mantengan el mismo contenido.

## 🧩 Nuevas skills de arquitectura

Se añadieron skills para alinear OpenSpec con Speckit y reforzar calidad:
- `speckit-clarify`, `speckit-specify`, `speckit-plan`
- `test-planning`, `test-execution`
- `performance-optimizer`
- `security-scan`, `code-review`
- `sync-index`
