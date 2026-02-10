**Fundamental Principle**: *"Quality over speed. Documentation before code. Planning before execution."*

YOU SHOULD FOLLOW THIS EXACT WORKFLOW HERE, DONT SKIP STEPS, DONT CHANGE THE ORDER OF THE WORKFLOW, DONT SKIP SKILLS, DONT SKIP PHASES, DONT SKIP ANYTHING, JUST FOLLOW THE WORKFLOW EXACTLY AS IT IS WRITTEN HERE

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
    │  PHASE 2: DISCOVERY & PLANNING               │
    │  4. brainstorming                            │
    │     └─ Architecture/Idea generation          │
    │  5. openspec-new-change                      │
    │     └─ Create proposal                       │
    │  6. spec-clarification (CRITICAL)            │
    │     └─ Refine requirements interactively     │
    │  7. openspec-continue-change                 │
    │     └─ Draft Specs, Design, Tasks            │
    │  8. requirement-checklist                    │
    │     └─ "Unit test" the specs                 │
    │  9. spec-analysis                            │
    │     └─ Verify Spec/Plan consistency          │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 3: IMPLEMENTATION                     │
    │  10. test-generator                          │
    │      └─ TDD: Write tests first               │
    │  11. openspec-apply-change                   │
    │      └─ Implement code to pass tests         │
    │  12. performance-optimizer                   │
    │      └─ Optimize critical paths              │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 4: VALIDATION & CLOSURE               │
    │  13. systematic-debugging                    │
    │      └─ Resolve any issues                   │
    │  14. openspec-verify-change                  │
    │      └─ Validate against initial specs       │
    │  15. sync-index                              │
    │      └─ Update project docs                  │
    │  16. openspec-archive-change                 │
    │      └─ Archive the change                   │
    └──────────────────────────────────────────────┘
```

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
    │  PHASE 2: REQUIREMENTS & PLANNING            │
    │  4. openspec-new-change                      │
    │     └─ Initialize change artifact            │
    │  5. spec-clarification                       │
    │     └─ CLARIFY requirements first            │
    │  6. requirement-checklist                    │
    │     └─ Validate requirements                 │
    │  7. openspec-continue-change                 │
    │     └─ Draft Specs, Design, Tasks            │
    │  8. spec-analysis                            │
    │     └─ Check consistency with existing       │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 3: TEST-DRIVEN IMPLEMENTATION         │
    │  9. test-generator                           │
    │     └─ Generate tests for new feature        │
    │  10. openspec-apply-change                   │
    │      └─ Implement code                       │
    │  11. secure-coding-cybersecurity             │
    │      └─ Audit new code                       │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 4: OPTIMIZATION & VERIFICATION        │
    │  12. systematic-debugging                    │
    │      └─ Fix regressions                      │
    │  13. performance-optimizer                   │
    │      └─ Ensure no perf degradation           │
    │  14. openspec-verify-change                  │
    │      └─ Final verification                   │
    │  15. sync-index (IMPORTANT)                  │
    │      └─ Update docs with new changes         │
    │  16. openspec-archive-change                 │
    │      └─ Archive change                       │
    └──────────────────────────────────────────────┘