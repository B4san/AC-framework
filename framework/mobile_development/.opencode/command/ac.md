**Fundamental Principle**: *"Quality over speed. Documentation before code. Planning before execution."*

--- **CRITICAL: ZERO SKIP POLICY** ---

**YOU CANNOT SKIP ANY STEP. YOU CANNOT SKIP ANY SKILL. YOU CANNOT SKIP ANY PHASE.**

If you attempt to proceed without completing a required step, you MUST STOP and complete it first.

---

## Available Skills

### AC Framework Core Skills

| Skill | Description | Primary Use | Required Before |
|-------|-------------|-------------|-----------------|
| `acfm-spec-workflow` | **START HERE - MANDATORY**. Understand spec-driven workflow, `.acfm/` vs `openspec/`, and required CLI commands. | Foundation | **ANYTHING ELSE** |
| `acfm-memory` | **PERSISTENT MEMORY PROTOCOL**. Recall project context on session start and save reusable decisions/patterns after significant work. | Knowledge persistence | Session start and after significant work |

### OpenSpec Workflow Skills

| Skill | Description | Primary Use | Required Before |
|-------|-------------|-------------|-----------------|
| `openspec-explore` | Explore architecture, constraints, and integration points before committing implementation details. | Pre-analysis | `acfm-spec-workflow` |
| `openspec-new-change` | Start a new change with structured artifacts. | Structured start | `brainstorming` |
| `openspec-ff-change` | Fast-forward artifact creation when speed is needed and scope is clear. | Accelerated start | `brainstorming` |
| `openspec-continue-change` | Continue artifact generation in sequence (proposal/specs/design/tasks). | Workflow continuation | `openspec-new-change` OR `microtask-decomposition` |
| `openspec-apply-change` | Implement tasks from artifacts. | Implementation | `openspec-continue-change` |
| `openspec-verify-change` | Verify implementation against artifacts. | Validation | `openspec-apply-change` |
| `openspec-sync-specs` | Merge delta specs to main specs without archiving. | Spec synchronization | `openspec-verify-change` |
| `openspec-archive-change` | Archive completed change. | Change closure | `openspec-verify-change` |
| `openspec-bulk-archive-change` | Archive multiple completed changes. | Batch closure | `openspec-verify-change` |
| `openspec-onboard` | Guided walkthrough to learn full OpenSpec lifecycle. | Learning | `acfm-spec-workflow` |

### Spec and Planning Skills

| Skill | Description | Primary Use | Required Before |
|-------|-------------|-------------|-----------------|
| `project-constitution` | Define and maintain core project principles. | Governance | **PHASE 1 START** |
| `project-index` | Map codebase structure and document domains/agent guidance. | Context mapping | `project-constitution` |
| `context-synthesizer` | Maintain continuity in long sessions and multi-change efforts. | Context management | `project-constitution` |
| `research-retrieval` | Pull external references and technical docs. | Research | `openspec-explore` |
| `brainstorming` | Generate all key questions up front to reduce hidden assumptions. | Design thinking | `openspec-explore` |
| `spec-clarification` | Resolve ambiguity in specs with targeted clarifications. | Requirement clarity | `openspec-new-change` |
| `spec-analysis` | Check consistency across proposal/specs/design/tasks. | Consistency check | `openspec-continue-change` |
| `microtask-decomposition` | Split complex tasks into smaller executable microtasks (only when needed). | Advanced decomposition | `openspec-continue-change` |

### Mobile Platform and Stack Skills

| Skill | Description | Primary Use | Required Before |
|-------|-------------|-------------|-----------------|
| `mobile-design` | Mobile-first doctrine: touch, performance, offline, platform behavior. | Baseline mobile standards | `project-constitution` |
| `mobile-ios-design` | iOS HIG-driven UI/UX guidance and SwiftUI-oriented patterns. | iOS interface design | `spec-clarification` [IF iOS UI] |
| `mobile-android-design` | Material 3 and Android UX patterns. | Android interface design | `spec-clarification` [IF Android UI] |
| `react-native-design` | React Native layout, animation, navigation, and mobile UX design. | RN UI design | `spec-clarification` [IF React Native] |
| `react-native-architecture` | React Native architecture, native modules, offline/data boundaries. | RN architecture | `spec-clarification` [IF React Native] |
| `react-state-management` | Choose and implement robust state strategy (Redux Toolkit/Zustand/Jotai/etc.). | RN/React state design | `spec-clarification` [IF complex state] |
| `flutter-expert` | Flutter/Dart architecture and implementation guidance. | Flutter implementation | `spec-clarification` [IF Flutter] |
| `ios-developer` | Native iOS engineering (Swift/SwiftUI/UIKit, platform integration). | Native iOS implementation | `spec-clarification` [IF native iOS] |

### Delivery and Support Skills

| Skill | Description | Primary Use | Required Before |
|-------|-------------|-------------|-----------------|
| `systematic-debugging` | Structured bug isolation and root-cause resolution. | Debugging | When bugs appear |
| `documentation` | Generate technical docs, architecture notes, and usage guidance. | Documentation | `openspec-verify-change` |
| `sync-index` | Keep project index and generated guidance synchronized with implementation. | Documentation sync | `openspec-apply-change` |
| `changelog-generator` | Create user-facing release notes from implementation changes. | Release communication | `openspec-archive-change` |

---

## Persistent Memory Protocol (Mandatory)

The AC Framework includes a persistent memory system that agents must use proactively.

**Session-start requirement (always):**
1. At the start of every new chat/session, consult the available persistent memory tool or MCP before planning or implementing.
2. Recall project-level context first, then search for task-specific decisions, conventions, bugfixes, and architecture notes.
3. Treat recalled memory as active project context unless current repository state or explicit user instruction supersedes it.
4. If memory tooling is unavailable, continue with repository inspection and use AC Framework CLI fallback.

**What gets saved automatically (only reusable context):**
- Architectural decisions from proposal/design artifacts
- Bugfix patterns and repeated solutions
- Performance and optimization insights
- Refactoring techniques and conventions
- Reusable workflow constraints and team rules

**Memory hygiene rules:**
- Never save secrets, credentials, tokens, or sensitive one-off values
- Redact content inside `<private>...</private>` before saving
- Use concise titles, correct memory type, useful tags, realistic confidence

**User communication:** `Memory saved: [brief description]`

## SynapseGrid Collaborative MCP Protocol (Optional)

If SynapseGrid is enabled in `acfm init`, AC Framework installs the collaborative MCP server automatically for detected assistants.

**Session-start requirement when collaboration is enabled:**
1. Prefer the available SynapseGrid MCP tools for collaborative session control before falling back to direct CLI.
2. Use shared session state and transcript as the source of truth for role-by-role collaboration.
3. If collaborative MCP is unavailable, use CLI fallback commands and keep behavior equivalent.

**How to use SynapseGrid collaboration:**
```text
Preferred: use SynapseGrid MCP tools (ac-framework-collab) for session start/status/step/stop.
Fallback: use AC Framework agents CLI commands directly.
```
```bash
# Optional install/reinstall of collaborative MCP servers
acfm agents install-mcps

# Start collaborative runtime manually
acfm agents start --task "design and implement feature X"

# Resume/list/export operations
acfm agents resume
acfm agents list
acfm agents export --format md --out synapse-session.md
```

---

## CRITICAL: How to Use Skills - ZERO SKIP POLICY

### BLOCKING RULES - YOU CANNOT PROCEED WITHOUT THESE:

**Rule 1: Phase Completion Checkpoint**
After EACH phase, you MUST confirm completion:
```
+------------------------------------------------------------+
| PHASE [X] COMPLETION CHECKPOINT                            |
+------------------------------------------------------------+
| Have you COMPLETED ALL skills in Phase [X]?                |
| [ ] Yes - I read and executed every required skill         |
| [ ] No  - I must go back and complete missing skills       |
+------------------------------------------------------------+
```
**IF NO: STOP. Go back and complete missing skills.**

**Rule 2: Skill Dependency Chain**
Each skill table above shows `Required Before`. You CANNOT use a skill before satisfying its dependency.

**Rule 3: Output Verification**
Before proceeding to next phase, verify outputs exist:

| Phase | Required Outputs | Check |
|-------|------------------|-------|
| Phase 0 | `acfm spec status` validated + memory recall completed | [ ] |
| Phase 1 | `project-constitution` defined + mobile baseline declared | [ ] |
| Phase 2 | exploration notes + platform/stack decision recorded | [ ] |
| Phase 3 | `proposal.md`, `specs/`, `design.md`, `tasks.md` + `spec-analysis` review | [ ] |
| Phase 4 | implementation done + tasks updated + issues debugged | [ ] |
| Phase 5 | verification passed + docs/index synced + archive/sync complete | [ ] |

**Rule 4: Pre-Implementation Safety Check**
Before `openspec-apply-change`, ALL must be TRUE:
- [ ] `tasks.md` exists and contains actionable checkboxes
- [ ] Target platform(s) and stack (Flutter / React Native / Native iOS) are explicit
- [ ] Required mobile skills for selected stack/platform have been applied
- [ ] `design.md` and `spec-analysis` were reviewed

**IF ANY IS FALSE: STOP. Complete missing items.**

---

## Workflow: New Mobile Project

When starting a mobile project **from scratch**, follow this **MANDATORY** workflow:

```
+--------------------------------------------------------------------------+
| WORKFLOW: NEW MOBILE PROJECT - ZERO SKIP                                 |
+--------------------------------------------------------------------------+

  START
    |
    v
  PHASE 0 - AC FRAMEWORK SETUP (BLOCKING)
    1) acfm-spec-workflow
       - verify initialization and workflow mode
       - run `acfm spec init` if missing
    2) acfm-memory
       - perform session-start memory recall

    CHECKPOINT: initialized + memory recall complete
    |
    v
  PHASE 1 - FOUNDATIONS AND MOBILE BASELINE
    3) project-constitution
    4) mobile-design (mandatory baseline doctrine)
    5) context-synthesizer
    6) project-index (if not created)

    CHECKPOINT: constitution + baseline mobile rules documented
    |
    v
  PHASE 2 - DISCOVERY AND REQUIREMENTS
    7) openspec-explore
    8) research-retrieval
    9) brainstorming (single comprehensive question set)
    10) openspec-new-change (or openspec-ff-change if explicitly chosen)
    11) spec-clarification

    CHECKPOINT: scope clarified + platform/stack chosen
    |
    v
  PHASE 3 - DESIGN AND TASK PLANNING
    12) openspec-continue-change (proposal/specs/design/tasks)
    13) spec-analysis
    14) microtask-decomposition [IF tasks are still too complex]
    15) platform/stack skills as required:
        - mobile-ios-design [IF iOS UI]
        - mobile-android-design [IF Android UI]
        - react-native-design [IF RN UI]
        - react-native-architecture [IF RN architecture]
        - react-state-management [IF complex state]
        - flutter-expert [IF Flutter]
        - ios-developer [IF native iOS]

    CHECKPOINT: proposal/spec/design/tasks coherent and implementation-ready
    |
    v
  PHASE 4 - IMPLEMENTATION
    16) openspec-apply-change
    17) systematic-debugging [IF issues/regressions appear]
    18) update tasks progress in tasks.md continuously

    CHECKPOINT: implementation complete and stable
    |
    v
  PHASE 5 - VALIDATION AND CLOSURE
    19) openspec-verify-change
    20) documentation
    21) sync-index
    22) openspec-sync-specs [IF syncing specs without archive]
    23) openspec-archive-change OR openspec-bulk-archive-change
    24) changelog-generator
```

**Conditional Skill Notes:**
- Use only skills that match selected platform/stack and risk profile.
- `mobile-design` is mandatory for all mobile work regardless of stack.
- `microtask-decomposition` is only for complex tasks after tasks.md exists.

---

## Workflow: Existing Mobile Project

When working on an **existing mobile codebase** (feature, bugfix, refactor):

```
+--------------------------------------------------------------------------+
| WORKFLOW: EXISTING MOBILE PROJECT - ZERO SKIP                            |
+--------------------------------------------------------------------------+

  START CHANGE
    |
    v
  PHASE 0 - SETUP (BLOCKING)
    1) acfm-spec-workflow (status, current changes, initialization)
    2) acfm-memory (session-start recall)

  PHASE 1 - CONTEXT AND DISCOVERY
    3) context-synthesizer
    4) project-index [if missing/stale]
    5) openspec-explore
    6) research-retrieval
    7) brainstorming

  PHASE 2 - CLARIFICATION AND CHANGE INIT
    8) openspec-new-change
    9) spec-clarification

  PHASE 3 - DESIGN, CONSISTENCY, AND PLATFORM FIT
    10) openspec-continue-change
    11) spec-analysis
    12) microtask-decomposition [if needed]
    13) apply required mobile platform/stack skills

  PHASE 4 - IMPLEMENTATION
    14) openspec-apply-change
    15) systematic-debugging [if needed]

  PHASE 5 - VALIDATION AND CLOSURE
    16) openspec-verify-change
    17) documentation
    18) sync-index
    19) openspec-sync-specs [if needed]
    20) openspec-archive-change / openspec-bulk-archive-change
    21) changelog-generator
```

---

## Skill Loading Reference

All skills are located in: `skills/`

To load a skill, read its `SKILL.md` file:
- Example: `skills/spec-clarification/SKILL.md`
- Example: `skills/mobile-design/SKILL.md`
- Example: `skills/react-native-architecture/SKILL.md`

### MANDATORY SKILL EXECUTION CHECKLIST

Before claiming a skill is done, verify:
- [ ] I read the entire `SKILL.md`
- [ ] I executed all required steps
- [ ] I produced required artifacts/checkpoints
- [ ] I can explain exactly what the skill produced

---

## VIOLATION CONSEQUENCES

If you skip a skill or phase:
1. Workflow integrity is compromised
2. Mobile quality and consistency are no longer guaranteed
3. You MUST return and complete the missing steps
4. No shortcuts. No exceptions.

**Quality over speed. Documentation before code. Planning before execution.**
