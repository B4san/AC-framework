**Fundamental Principle**: *"Quality over speed. Documentation before code. Planning before execution."*

--- YOU SHOULD FOLLOW THIS EXACT WORKFLOW HERE, DONT SKIP STEPS, DONT CHANGE THE ORDER OF THE WORKFLOW, DONT SKIP SKILLS, DONT SKIP PHASES, DONT SKIP ANYTHING, JUST FOLLOW THE WORKFLOW EXACTLY AS IT IS WRITTEN HERE

## 🛠️ Available Skills

### Quality and Security Skills

| Skill | Description | Primary Use |
|-------|-------------|---------------|
| `secure-coding-cybersecurity` | Detects and prevents security vulnerabilities (SQLi, XSS, command injection, hardcoded secrets). Follows OWASP Top 10 standards. | Secure code validation |
| `code-maintainability` | Analyzes code maintainability: duplication, documentation, error handling, naming conventions, SOLID architecture, performance. | Refactoring and standards |
| `error-handling-patterns` | Error handling patterns in multiple languages: exceptions, Result types, retry, circuit breaker, graceful degradation. | Application resilience |
| `performance-optimizer` | Methodologies for measuring, profiling, and optimizing code (caching, algorithm complexity, resource usage). | Performance Engineering |
| `test-generator` | Generate comprehensive test suites (Unit, Integration, E2E) ensuring requirements are met. | Test Driven Development |

### SpecKit Consistency & Quality Skills

| Skill | Description | Primary Use |
|-------|-------------|---------------|
| `project-constitution` | Manage the project's core principles and ensuring alignment. | Project Governance |
| `requirement-checklist` | Generate quality control checklists for requirements (unit tests for specs). | Requirements Quality |
| `spec-analysis` | Analyze consistency across Spec, Plan, and Tasks. | Consistency Check |
| `spec-clarification` | Interactively clarify specific sections of the spec. | Ambiguity Resolution |

### Planning and Design Skills

| Skill | Description | Primary Use |
|-------|-------------|---------------|
| `brainstorming` | Generates ideas and questions decisions before implementing. Explores requirements, constraints, and success criteria. | Design and architecture |
| `api-design-principles` | REST and GraphQL design principles: resources, endpoints, pagination, versioning, HATEOAS. | API design |
| `interface-design` | Interface design (dashboards, admin panels, apps). NOT for landing pages/marketing. | UI design |

### OpenSpec Skills (The heart of the framework)

| Skill | Description | Primary Use |
|-------|-------------|---------------|
| `openspec-explore` | Exploration mode to investigate problems, map architecture, find integration points before implementing. | Pre-analysis |
| `openspec-new-change` | Creates a new change with step-by-step workflow (proposal → specs → design → tasks). | Structured start |
| `openspec-ff-change` | Fast-forward: creates all artifacts at once to start implementation quickly. | Quick start |
| `openspec-continue-change` | Continues an existing change by creating the next artifact in the sequence. | Continue workflow |
| `openspec-apply-change` | Implements tasks from a change (applies code according to specs and tasks). | Change execution |
| `openspec-verify-change` | Verifies that implementation matches artifacts (specs, tasks, design). | Validation |
| `openspec-archive-change` | Archives a completed change by moving it to `openspec/changes/archive/`. | Change closure |
| `openspec-onboard` | Guided tutorial to learn OpenSpec with a complete example workflow. | Learning |
| `openspec-sync-specs` | Synchronizes delta specs to main specs (intelligent merge). | Update specs |
| `openspec-bulk-archive-change` | Archives multiple completed changes at once. | Bulk cleanup |

### Documentation and Debugging Skills

| Skill | Description | Primary Use |
|-------|-------------|---------------|
| `project-index` | Generates structured project documentation: structure analysis, domains, agent guides. | Indexing and context |
| `sync-index` | Keep project documentation (`project-index` and sub-skills) in sync with codebase changes. | Documentation Sync |
| `systematic-debugging` | Structured debugging in 4 phases: root cause investigation, pattern analysis, hypothesis, implementation. | Problem resolution |
| `changelog-generator` | Creates automated changelogs from git commits, translating technical to user language. | Version history |
| `skill-writer` | Guide to create new skills for Claude Code with correct structure and frontmatter. | Create new skills |

---

## 📍 IMPORTANT: How to Use Skills

**Skills are loaded as tools, NOT CLI commands.**

The skills listed above are located at `framework/.agent/skills/<skill-name>/SKILL.md`. When you need to use a skill:

1. **The Agent automatically loads the skill file** - No CLI command needed
2. **Read the SKILL.md file** to understand its instructions
3. **Follow the skill's guidance** exactly as written
4. **Skills provide structured workflows** for specific tasks

**Do NOT use CLI commands like `openspec <command>` unless the skill specifically instructs you to.** OpenSpec skills guide you through their workflow via the SKILL.md content, not through CLI invocations.

---

## 🚀 Workflow: New Project

When starting a project **from scratch**, follow this mandatory workflow:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           WORKFLOW: NEW PROJECT                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │     START       │
    └────────┬────────┘
             │
             ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 1: FOUNDATIONS & GOVERNANCE           │
    │  1. project-constitution                     │
    │     └─ Define core principles                │
    │  2. secure-coding-cybersecurity              │
    │     └─ Establish security guidelines         │
    │  3. code-maintainability                     │
    │     └─ Define quality standards              │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 2: CONTEXT & DISCOVERY                │
    │  4. project-index                            │
    │     └─ Document initial structure            │
    │  5. openspec-explore                         │
    │     └─ Explore target architecture           │
    │  6. brainstorming                            │
    │     └─ Generate ideas and architecture       │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 3: REQUIREMENTS & DESIGN              │
    │  7. spec-clarification (CRITICAL)            │
    │     └─ CLARIFY requirements first            │
    │  8. openspec-new-change                      │
    │     └─ Create proposal                       │
    │  9. openspec-continue-change                 │
    │     └─ Draft Specs, Design, Tasks            │
    │  10. spec-analysis                           │
    │     └─ Verify consistency                    │
    │  11. requirement-checklist                   │
    │     └─ "Unit test" the specs                 │
    │  12. api-design-principles [IF APIs]         │
    │     └─ Design REST/GraphQL APIs              │
    │  13. interface-design [IF UI]                │
    │     └─ Design dashboards/apps interface      │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 4: IMPLEMENTATION                     │
    │  14. test-generator                          │
    │     └─ TDD: Write tests first                │
    │  15. openspec-apply-change                   │
    │     └─ Implement code to pass tests          │
    │  16. secure-coding-cybersecurity             │
    │     └─ Audit code for security               │
    │  17. error-handling-patterns                 │
    │     └─ Verify robust error handling          │
    │  18. performance-optimizer                   │
    │     └─ Optimize critical paths               │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 5: VALIDATION & CLOSURE               │
    │  19. systematic-debugging                    │
    │     └─ Resolve any issues                    │
    │  20. openspec-verify-change                  │
    │     └─ Validate against specs                │
    │  21. sync-index                              │
    │     └─ Update project documentation          │
    │  22. changelog-generator                     │
    │     └─ Generate release notes                │
    │  23. openspec-archive-change                 │
    │     └─ Archive the change                    │
    └──────────────────────────────────────────────┘
```

**Conditional Skills Notes:**
- `[IF APIs]`: Use api-design-principles only if the project involves REST/GraphQL APIs
- `[IF UI]`: Use interface-design only if the project has dashboards, admin panels, or apps

---

## 🔄 Workflow: Existing Project

When working on an **existing codebase** (adding features, fixing bugs, refactoring):

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        WORKFLOW: EXISTING PROJECT                                │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │  START CHANGE   │
    └────────┬────────┘
             │
             ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 1: CONTEXT & ANALYSIS                 │
    │  1. project-index (if needed)                │
    │     └─ Map current system                    │
    │  2. openspec-explore                         │
    │     └─ Deep dive into relevant modules       │
    │  3. brainstorming                            │
    │     └─ Ideate on feature/fix                 │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 2: DISCOVERY & CLARIFICATION          │
    │  4. spec-clarification (CRITICAL)            │
    │     └─ CLARIFY requirements first            │
    │  5. openspec-new-change                      │
    │     └─ Initialize change artifact            │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 3: DESIGN & PLANNING                  │
    │  6. openspec-continue-change                 │
    │     └─ Draft Specs, Design, Tasks            │
    │  7. spec-analysis                            │
    │     └─ Check consistency with existing       │
    │  8. requirement-checklist                    │
    │     └─ Validate requirements                 │
    │  9. api-design-principles [IF APIs]          │
    │     └─ Design API changes                    │
    │  10. interface-design [IF UI]                │
    │     └─ Design interface changes              │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 4: IMPLEMENTATION                     │
    │  11. test-generator                          │
    │     └─ Generate tests for new feature        │
    │  12. openspec-apply-change                   │
    │     └─ Implement code                        │
    │  13. secure-coding-cybersecurity             │
    │     └─ Audit new code                        │
    │  14. error-handling-patterns                 │
    │     └─ Verify error handling                 │
    │  15. performance-optimizer                   │
    │     └─ Ensure no perf degradation            │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 5: OPTIMIZATION & VERIFICATION        │
    │  16. systematic-debugging                    │
    │     └─ Fix regressions                       │
    │  17. openspec-verify-change                  │
    │     └─ Final verification                    │
    │  18. sync-index (IMPORTANT)                  │
    │     └─ Update docs with new changes          │
    │  19. changelog-generator                     │
    │     └─ Generate release notes                │
    │  20. openspec-archive-change                 │
    │     └─ Archive change                        │
    └──────────────────────────────────────────────┘
```

**Conditional Skills Notes:**
- `[IF APIs]`: Use api-design-principles only if modifying/creating REST/GraphQL APIs
- `[IF UI]`: Use interface-design only if modifying dashboards, admin panels, or apps
- `project-index`: Run only if you haven't indexed the project yet or need to refresh context

---

## 📝 Skill Loading Reference

All skills are located in: `framework/.agent/skills/`

To load a skill, read its SKILL.md file:
- Example: Read `framework/.agent/skills/spec-clarification/SKILL.md` to use the clarification workflow
- Example: Read `framework/.agent/skills/interface-design/SKILL.md` to use interface design principles

**Remember**: Skills are documentation-based workflows, NOT CLI commands. Load them by reading the SKILL.md files.
