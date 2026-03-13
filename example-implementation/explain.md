# Sistema de Capacidades Senior para AC Framework

## Introducción

Este documento presenta el sistema de "Senior Capabilities" implementado en AC Framework, un conjunto de skills diseñados para弥补 las debilidades inherentes de la IA en el desarrollo de software y guiarla hacia un comportamiento más similar al de un desarrollador senior.

---

## El Problema: Debilidades de la IA en Desarrollo de Software

### 1. **Generación sin Consecuencias**
La IA genera código que "funciona" pero no entiende las consecuencias arquitectónicas a largo plazo. Escribe código que compila y pasa tests, pero puede acumular deuda técnica, violar patrones arquitectónicos, y crear sistemas difíciles de mantener.

### 2. **Toma de Decisiones sin Tradeoffs**
La IA típicamente toma decisiones de diseño sin considerar explícitamente los tradeoffs. Elige "la mejor opción" sin documentar por qué, qué se está sacrificando, y cuándo podría necesitar revertirse.

### 3. **Negociación de Requisitos Cegada**
Cuando los requisitos conflictúan, la IA intenta implementar todo sin negociar, llevando a scope creep, expectativas no cumplidas, y frustración de stakeholders.

### 4. **Comunicación Monolítica**
La IA comunica igual a todos: usa jerga técnica con ejecutivos, complicate con desarrolladores, confunde a product managers. No adapta el mensaje al público.

### 5. **Ausencia de Ownership**
La IA no siente propiedad sobre el código que genera. No documenta suposiciones, no identifica áreas de riesgo, no se hace responsable cuando las cosas fallan.

### 6. **Paralysis by Analysis o Acción sin Pensar**
La IA o bien pide información infinitamente o hace decisiones arbitrarias. No tiene un framework para navegar la ambigüedad.

---

## La Solución: 6 Skills Senior

### Skill 1: `architecture-tradeoff-analysis`

**Problema que resuelve**: La IA diseña sistemas sin considerar tradeoffs arquitectónicos.

**Cómo funciona**:
- Enseña a la IA a identificar decisiones arquitectónicas
- Proporciona matrices de tradeoff (performance vs maintainability vs scalability)
- Documenta consecuencias a corto, mediano y largo plazo
- Crea Architecture Decision Records (ADRs)

**Cuándo se activa**:
- Nuevos diseños de sistema
- Elegir tecnologías o frameworks
- Refactorizaciones significativas
- El usuario menciona "tradeoff", "arquitectura", o "decisión de diseño"

---

### Skill 2: `requirement-negotiation`

**Problema que resuelve**: La IA implementa requisitos conflictivos sin negociar, llevando a scope creep y expectativas no cumplidas.

**Cómo funciona**:
- Identifica conflictos entre requisitos de diferentes stakeholders
- Mapea posiciones vs intereses subyacentes
- Genera opciones que satisfacen necesidades centrales
- Propone resoluciones con tradeoffs explícitos

**Cuándo se activa**:
- Requisitos de diferentes stakeholders conflictúan
- Scope creep detectado
- Restricciones técnicas conflictúan con requisitos de negocio
- El usuario menciona "pero el cliente quiere...", "ellos insisten en..."

---

### Skill 3: `boundary-enforcement`

**Problema que resuelve**: La IA viola capas arquitectónicas (e.g., acceso directo a BD desde controladores), creando deuda técnica.

**Cómo funciona**:
- Define las capas arquitectónicas del proyecto
- Documenta dependencias permitidas entre capas
- Detecta violaciones comunes (presentación→infraestructura directa)
- Recomienda correcciones con ejemplos de código

**Cuándo se activa**:
- Nuevas features que cruzan capas arquitectónicas
- Code review detecta violaciones de boundary
- Configuración inicial de arquitectura
- El usuario menciona "boundary", "capa", o "arquitectura"

---

### Skill 4: `ownership-checkpoint`

**Problema que resuelve**: La IA genera código sin ownership, sin documentar suposiciones, y sin asumir responsabilidad.

**Cómo funciona**:
- Establece puntos de checkpoint de ownership
- Documenta explícitamente las suposiciones realizadas
- Identifica áreas de riesgo y mitigaciones
- Crea statements de accountability
- Produce documentos de handoff

**Cuándo se activa**:
- Antes de marcar una tarea como completa
- Antes de hacer commit de código
- Cuando se transfiere ownership a otro developer
- Cuando se prepara código para producción

---

### Skill 5: `decision-framework`

**Problema que resuelve**: La IA no sabe cómo tomar decisiones con información incompleta, o pide información infinitamente.

**Cómo funciona**:
- Clasifica decisiones por reversibilidad (irreversible/parcial/reversible)
- Proporciona frameworks apropiados para cada tipo:
  - 5-Why Analysis para decisiones irreversibles
  - Weighted Scorecard para decisiones parciales
  - 5-Minute Rule para decisiones reversibles
- Documenta incertidumbre explicitamente
- Establece triggers para re-visitar decisiones

**Cuándo se activa**:
- Múltiples opciones válidas sin ganador claro
- Requisitos incompletos o ambiguos
- Estimaciones altamente inciertas
- El usuario menciona "no estoy seguro", "cómo decidir", u opciones

---

### Skill 6: `stakeholder-communication`

**Problema que resuelve**: La IA comunica igual a todos, causando confusión en stakeholders no-técnicos y malentendidos.

**Cómo funciona**:
- Identifica el tipo de audiencia (ejecutivo, tech lead, PM, developer, usuario final)
- Adapta el mensaje:
  - Executives: impacto de negocio, ROI, riesgo
  - Tech leads: arquitectura, tradeoffs, constraints
  - PMs: features, timeline, scope
  - Developers: implementación, blockers, coordinación
  - Usuarios: valor, cómo usar
- Proporciona templates para diferentes escenarios
- Traduce jerga técnica a lenguaje de negocio

**Cuándo se activa**:
- Preparar updates para stakeholders
- Explicar decisiones técnicas a audiencias no-técnicas
- Comunicar blockers o delays
- El usuario menciona "stakeholder", "comunicar", o "explicar a"

---

## Sistema de Gates en AC-Lite

Para optimizar el uso de tokens, AC-Lite implementa un sistema de "gates" que activan skills condicionalmente:

### Gates Existentes

| Gate | Skill(s) Activada(s) | Trigger |
|------|---------------------|---------|
| Security | `secure-coding-cybersecurity` | Auth, user input, SQL, secrets |
| Testing | `test-generator` | Sin tests, cobertura insuficiente |
| Consistency | `spec-analysis`, `requirement-checklist` | Requisitos ambiguos, cambio multi-módulo |
| API | `api-design-principles` | Nuevos endpoints/contratos |
| UI | `interface-design` | Dashboards, apps |
| Performance | `performance-optimizer` | Hot paths, latency targets |
| Context | `project-index`, `context-synthesizer` | Código base grande, sesión larga |
| Debug | `systematic-debugging` | Bugs no triviales |

### Nuevos Gates Implementados

| Gate | Skill(s) Activada(s) | Trigger |
|------|---------------------|---------|
| Architecture | `architecture-tradeoff-analysis`, `boundary-enforcement` | Nuevos patrones, cambios entre capas |
| Scope | `requirement-negotiation` | Conflictos de requisitos, scope creep |
| Communication | `stakeholder-communication` | Múltiples tipos de usuarios, updates |
| Ownership | `ownership-checkpoint` | Ready for review/production |
| Decision | `decision-framework` | Ambigüedad, múltiples opciones |

---

## Integración en el Workflow

### Fase 3: Requirements & Design

```
SPEC-CLARIFICATION (CRITICAL)
    ↓
ARCHITECTURE-TRADEOFF-ALYSIS  ← Nuevo
    ↓
REQUIREMENT-NEGOTIATION        ← Nuevo
    ↓
OPENSPEC-NEW-CHANGE
    ...
```

### Fase 4: Implementation

```
BOUNDARY-ENFORCEMENT           ← Nuevo (pre-check)
    ↓
DECISION-FRAMEWORK             ← Nuevo (si ambiguo)
    ↓
TEST-GENERATOR
    ↓
OPENSPEC-APPLY-CHANGE
    ↓
...existing skills...
```

### Fase 5: Validation & Closure

```
OWNERSHIP-CHECKPOINT           ← Nuevo
    ↓
STAKEHOLDER-COMMUNICATION      ← Nuevo
    ↓
OPENSPEC-VERIFY-CHANGE
    ↓
...existing skills...
```

---

## Beneficios del Sistema

### 1. **Calidad de Código Mejorada**
- Boundary violations detectadas antes de merged
- Tradeoffs arquitectónicos documentados
- Decisiones reversibles identificadas

### 2. **Gestión de Stakeholders Mejorada**
- Comunicación adaptada a cada audiencia
- Expectativas gestionadas proactivamente
- Conflictos de requisitos resueltos profesionalmente

### 3. **Accountability Mejorada**
- Suposiciones documentadas
- Áreas de riesgo identificadas
- Ownership claro del código

### 4. **Toma de Decisiones Mejorada**
- Framework para navegar ambigüedad
- Decisiones documentadas con revisitas programadas
- No más parálisis por análisis o acciones arbitrarias

---

## Métricas de Éxito Esperado

| Métrica | Antes | Después |
|---------|-------|---------|
| Boundary violations en código production | Alto | Bajo |
| Tradeoffs documentados | Casi ninguno | Todos |
| Conflictos de requisitos resueltos | scope creep | Negociados |
| Comunicación efectiva con stakeholders | Variable | Consistent |
| Suposiciones documentadas | Casi ninguna | Todas |
| Decisiones con review trigger | Ninguna | Todas |

---

## Compatibilidad

- **AC-Lite**: Nuevos gates opcionales que se activan condicionalmente
- **AC (full)**: Skills integrados en el workflow principal
- **Backward compatible**: Skills existentes no se ven afectados

---

## Próximos Pasos

1. **Validar** en example-implementation
2. **Ajustar** gates y triggers según feedback
3. **Documentar** mejores prácticas
4. **Expandir** con más skills Senior si es necesario:
   - `technical-debt-assessment`
   - `production-readiness-review`
   - `incident-accountability`
   - `technical-vision`

---

## Conclusión

Este sistema transforma AC Framework de un simple "spec-driven workflow" a un verdadero "desarrollador senior virtual". Enseña a la IA no solo a escribir código, sino a:

1. **Pensar** en las consecuencias de sus decisiones
2. **Negociar** cuando los requisitos conflictúan
3. **Comunicar** efectivamente con diferentes audiencias
4. **Asumir responsabilidad** por su código
5. **Tomar decisiones** informadas incluso con incertidumbre

El resultado: código de mayor calidad, stakeholders más felices, y un proceso de desarrollo más profesional.
