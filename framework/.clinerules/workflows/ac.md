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

### AC Framework Core Skills

| Skill | Description | Primary Use |
|-------|-------------|---------------|
| `acfm-spec-workflow` | **START HERE** - Understand the spec-driven workflow, directory structure (.acfm/ vs openspec/), and CLI commands. Essential before using any OpenSpec skills. | Foundation |

### OpenSpec Skills (The heart of the framework)

| Skill | Description | Primary Use |
|-------|-------------|---------------|
| `openspec-explore` | Exploration mode to investigate problems, map architecture, find integration points before implementing. | Pre-analysis |
| `openspec-new-change` | Creates a new change with step-by-step workflow (proposal → specs → design → tasks). | Structured start |
| `openspec-ff-change` | Fast-forward: creates all artifacts at once to start implementation quickly. | Quick start |
| `openspec-continue-change` | Continues an existing change by creating the next artifact in the sequence. | Continue workflow |
| `openspec-apply-change` | Implements tasks from a change (applies code according to specs and tasks). | Change execution |
| `openspec-verify-change` | Verifies that implementation matches artifacts (specs, tasks, design). | Validation |
| `openspec-archive-change` | Archives a completed change by moving it to `{specDir}/changes/archive/`. | Change closure |
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
| `vercel-react-best-practices` | React and Next.js performance optimization guidelines from Vercel Engineering. | React/Next.js optimization |

### New AC Framework Enhancement Skills

| Skill | Description | Primary Use |
|-------|-------------|---------------|
| `task-decomposition` | Divide large changes into manageable subtasks (1-3 files), optimize model/role assignment, enable parallel execution. | Task planning & delegation |
| `testing-qa` | Automate generation and maintenance of unit, integration, and E2E tests; generate test data and debugging. | Quality assurance |
| `code-review` | Review generated code for style, security, and architecture issues; suggest refactorings and performance improvements. | Code quality & security |
| `documentation` | Generate clear documentation for each task: technical descriptions, architecture diagrams, usage guides. | Documentation & communication |
| `research-retrieval` | Search external documentation (web pages, API docs, papers) and generate useful summaries for development. | Research & context gathering |
| `context-synthesizer` | Manage memory in long projects and summarize current state to prevent agent context loss. | Memory & context management |
| `ci-deploy` | Automate continuous integration, deployment, and post-deployment verification of developed solutions. | CI/CD automation |

---

## 📍 IMPORTANT: How to Use Skills

**Skills are loaded as tools, NOT CLI commands.**

The skills listed above are located at `framework/.agent/skills/<skill-name>/SKILL.md`. When you need to use a skill:

1. **The Agent automatically loads the skill file** - No CLI command needed
2. **Read the SKILL.md file** to understand its instructions
3. **Follow the skill's guidance** exactly as written
4. **Skills provide structured workflows** for specific tasks

**Do NOT use CLI commands like `acfm spec <command>` unless the skill specifically instructs you to.** OpenSpec skills guide you through their workflow via the SKILL.md content, not through CLI invocations.

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
    │  PHASE 0: AC FRAMEWORK SETUP (REQUIRED)      │
    │  1. acfm-spec-workflow                       │
    │     └─ **ALWAYS START HERE**                 │
    │     └─ Understand .acfm/ vs openspec/        │
    │     └─ Learn CLI commands and workflow       │
    │     └─ Check project initialization status   │
    └────────────────────┬─────────────────────────┘
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
    │  4. vercel-react-best-practices [IF REACT]   │
    │     └─ Apply React/Next.js best practices    │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 2: CONTEXT & DISCOVERY                │
    │  4. context-synthesizer                      │
    │     └─ Initialize memory and context state   │
    │  5. project-index                            │
    │     └─ Document initial structure            │
    │  6. research-retrieval                       │
    │     └─ Gather external documentation         │
    │  7. openspec-explore                         │
    │     └─ Explore target architecture           │
    │  8. brainstorming                            │
    │     └─ Generate ideas and architecture       │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 3: REQUIREMENTS & DESIGN              │
    │  9. spec-clarification (CRITICAL)            │
    │     └─ CLARIFY requirements first            │
    │  10. openspec-new-change                     │
    │     └─ Create proposal                       │
    │  11. task-decomposition                      │
    │     └─ Divide into manageable subtasks       │
    │  12. openspec-continue-change                │
    │     └─ Draft Specs, Design, Tasks            │
    │  13. spec-analysis                           │
    │     └─ Verify consistency                    │
    │  14. requirement-checklist                   │
    │     └─ "Unit test" the specs                 │
    │  15. api-design-principles [IF APIs]         │
    │     └─ Design REST/GraphQL APIs              │
    │  16. interface-design [IF UI]                │
    │     └─ Design dashboards/apps interface      │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 4: IMPLEMENTATION                     │
    │  17. test-generator                          │
    │     └─ TDD: Write tests first                │
    │  18. openspec-apply-change                   │
    │     └─ Implement code to pass tests          │
    │  19. testing-qa                              │
    │     └─ Automate test maintenance             │
    │  20. code-review                             │
    │     └─ Review for style/security/arch        │
    │  21. secure-coding-cybersecurity             │
    │     └─ Audit code for security               │
    │  22. error-handling-patterns                 │
    │     └─ Verify robust error handling          │
    │  23. performance-optimizer                   │
    │     └─ Optimize critical paths               │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 5: VALIDATION & CLOSURE               │
    │  24. systematic-debugging                    │
    │     └─ Resolve any issues                    │
    │  25. openspec-verify-change                  │
    │     └─ Validate against specs                │
    │  26. documentation                           │
    │     └─ Generate technical docs & diagrams    │
    │  27. sync-index                              │
    │     └─ Update project documentation          │
    │  28. changelog-generator                     │
    │     └─ Generate release notes                │
    │  29. ci-deploy                               │
    │     └─ Deploy and verify solution            │
    │  30. openspec-archive-change                 │
    │     └─ Archive the change                    │
    └──────────────────────────────────────────────┘
```

**Conditional Skills Notes:**
- `[IF REACT]`: Use vercel-react-best-practices only if the project uses React or Next.js
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
    │  PHASE 0: AC FRAMEWORK SETUP (REQUIRED)      │
    │  1. acfm-spec-workflow                       │
    │     └─ **ALWAYS START HERE**                 │
    │     └─ Understand .acfm/ vs openspec/        │
    │     └─ Learn CLI commands and workflow       │
    │     └─ Check project initialization status   │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 1: CONTEXT & ANALYSIS                 │
    │  1. context-synthesizer                      │
    │     └─ Load memory and context state         │
    │  2. project-index (if needed)                │
    │     └─ Map current system                    │
    │  3. research-retrieval                       │
    │     └─ Gather external documentation         │
    │  4. openspec-explore                         │
    │     └─ Deep dive into relevant modules       │
    │  5. brainstorming                            │
    │     └─ Ideate on feature/fix                 │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 2: DISCOVERY & CLARIFICATION          │
    │  6. spec-clarification (CRITICAL)            │
    │     └─ CLARIFY requirements first            │
    │  7. openspec-new-change                      │
    │     └─ Initialize change artifact            │
    │  8. task-decomposition                       │
    │     └─ Divide into manageable subtasks       │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 3: DESIGN & PLANNING                  │
    │  9. openspec-continue-change                 │
    │     └─ Draft Specs, Design, Tasks            │
    │  10. spec-analysis                           │
    │     └─ Check consistency with existing       │
    │  11. requirement-checklist                   │
    │     └─ Validate requirements                 │
    │  12. api-design-principles [IF APIs]         │
    │     └─ Design API changes                    │
    │  13. interface-design [IF UI]                │
    │     └─ Design interface changes              │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 4: IMPLEMENTATION                     │
    │  14. test-generator                          │
    │     └─ Generate tests for new feature        │
    │  15. openspec-apply-change                   │
    │     └─ Implement code                        │
    │  16. testing-qa                              │
    │     └─ Automate test maintenance             │
    │  17. code-review                             │
    │     └─ Review for style/security/arch        │
    │  18. secure-coding-cybersecurity             │
    │     └─ Audit new code                        │
    │  19. error-handling-patterns                 │
    │     └─ Verify error handling                 │
    │  20. performance-optimizer                   │
    │     └─ Ensure no perf degradation            │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 5: OPTIMIZATION & VERIFICATION        │
    │  21. systematic-debugging                    │
    │     └─ Fix regressions                       │
    │  22. openspec-verify-change                  │
    │     └─ Final verification                    │
    │  23. documentation                           │
    │     └─ Generate technical docs & diagrams    │
    │  24. sync-index (IMPORTANT)                  │
    │     └─ Update docs with new changes          │
    │  25. changelog-generator                     │
    │     └─ Generate release notes                │
    │  26. ci-deploy                               │
    │     └─ Deploy and verify solution            │
    │  27. openspec-archive-change                 │
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
