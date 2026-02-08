# 🤖 AGENTS.md - AI Work Framework

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                          ║
║    █████╗  ██████╗ ███████╗███╗   ██╗████████╗███████╗                                  ║
║   ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██╔════╝                                  ║
║   ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ███████╗                                  ║
║   ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║                                  ║
║   ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ███████║                                  ║
║   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝                                  ║
║                                                                                          ║
║                    Intelligent Software Development Framework                            ║
║                                                                                          ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 📋 Index

1. [Framework Philosophy](#-framework-philosophy)
2. [Available Skills](#-available-skills)
3. [Workflow: New Project](#-workflow-new-project)
4. [Workflow: Existing Project](#-workflow-existing-project)
5. [Workflow: Changes/Iterations](#-workflow-changesiterations)
6. [Validation Checklist](#-validation-checklist)
7. [Directory Structure](#-directory-structure)

---

## 🎯 Framework Philosophy

This framework is designed to ensure all AI-developed projects follow:

- ✅ **Best coding practices** from the start
- ✅ **Maintainable** and scalable architecture
- ✅ **Complete and up-to-date** documentation
- ✅ **Clear specifications** through OpenSpec
- ✅ **Systematic debugging** of problems
- ✅ **Automated change history**

> **Fundamental Principle**: *"Quality over speed. Documentation before code. Planning before execution."*

---

## 🛠️ Available Skills

### Quality and Security Skills

| Skill | Description | Primary Use |
|-------|-------------|---------------|
| `secure-coding-cybersecurity` | Detects and prevents security vulnerabilities (SQLi, XSS, command injection, hardcoded secrets). Follows OWASP Top 10 standards. | Secure code validation |
| `code-maintainability` | Analyzes code maintainability: duplication, documentation, error handling, naming conventions, SOLID architecture, performance. | Refactoring and standards |
| `error-handling-patterns` | Error handling patterns in multiple languages: exceptions, Result types, retry, circuit breaker, graceful degradation. | Application resilience |

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
    │  PHASE 1: FOUNDATIONS (Mandatory)            │
    │                                              │
    │  1. secure-coding-cybersecurity              │
    │     └─ Establish security guidelines         │
    │                                              │
    │  2. code-maintainability                     │
    │     └─ Define quality standards              │
    │                                              │
    │  3. brainstorming                            │
    │     └─ Architecture and design decisions     │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 2: SPECIFICATION (Mandatory)          │
    │                                              │
    │  4. openspec-new-change                      │
    │     └─ Create change with proposal           │
    │                                              │
    │  5. openspec-continue-change                 │
    │     └─ Create specs, design, tasks           │
    │        (or use openspec-ff-change)           │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 3: IMPLEMENTATION                     │
    │                                              │
    │  6. openspec-apply-change                    │
    │     └─ Implement the tasks                   │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  PHASE 4: VALIDATION AND CLOSURE             │
    │                                              │
    │  7. systematic-debugging                     │
    │     └─ Verify no errors                      │
    │                                              │
    │  8. openspec-verify-change                   │
    │     └─ Validate against specs                │
    │                                              │
    │  9. changelog-generator                      │
    │     └─ Generate in changelogs/by-ai/         │
    │                                              │
    │  10. openspec-archive-change                 │
    │      └─ Archive the change                   │
    └──────────────────────────────────────────────┘
```

### Phase Descriptions - New Project

| Phase | Skill | Description | Expected Output |
|------|-------|-------------|-----------------|
| 1 | `secure-coding-cybersecurity` | Establish security guidelines: input validation, sanitization, injection prevention, secrets handling | `.agents/security-guidelines.md` |
| 2 | `code-maintainability` | Define conventions: naming, folder structure, design patterns, DRY, testing | `.agents/maintainability-rules.md` |
| 3 | `brainstorming` | Generate architecture ideas, question approach, explore alternatives | `.agents/architecture-decisions.md` |
| 4 | `openspec-new-change` | Create change with proposal (why, what changes, capabilities) | `openspec/changes/<name>/proposal.md` |
| 5 | `openspec-continue-change` | Create specs (WHEN/THEN requirements), design (technical decisions), tasks (checklist) | Complete OpenSpec artifacts |
| 6 | `openspec-apply-change` | Implement code according to specs and tasks | Functional code |
| 7 | `systematic-debugging` | Structured debugging: investigate root cause, don't guess | Validation report |
| 8 | `openspec-verify-change` | Verify completeness, correctness, and coherence | Verification report |
| 9 | `changelog-generator` | Document changes in user language | `changelogs/by-ai/[date]-[feature].md` |
| 10 | `openspec-archive-change` | Move change to archive with date | `openspec/changes/archive/YYYY-MM-DD-<name>/` |

---

## 🔍 Workflow: Existing Project

When working on an **already created** project that does NOT have `.md` documentation files:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        WORKFLOW: EXISTING PROJECT (NO DOCS)                      │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────┐
    │                                                                          │
    │   ⚠️  CHECK: No documentation .md files exist in                         │
    │       .agents/ or openspec/                                              │
    │                                                                          │
    └────────────────────────────────────────────────────┬─────────────────────┘
                                                         │
                                                         ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                                                                          │
    │   🔄 STEP 0: project-index                                               │
    │   Generate complete documentation for existing project                   │
    │   ├─ Analyze folder structure                                            │
    │   ├─ Identify domains (UI, Backend, DB, etc.)                            │
    │   ├─ Create specific sub-skills per domain                               │
    │   └─ Generate agent-guidance files                                       │
    │                                                                          │
    │   Output:                                                                │
    │   ├─ .agents/project-index.md                                            │
    │   ├─ .agents/agent-<domain>.md (in each folder)                          │
    │   └─ .claude/skills/project-index-<domain>/SKILL.md                      │
    │                                                                          │
    └─────────────────────────────────────────────────────────────────────────┘
```

### Post-Indexing

Once the project is indexed, continue with the [Changes Workflow](#-workflow-changesiterations).

---

## 🔄 Workflow: Changes/Iterations

For **each change or new feature** in an already documented project:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           WORKFLOW: CHANGES AND ITERATIONS                       │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────┐
    │   START CHANGE          │
    └────────┬────────────────┘
             │
             ▼
    ┌─────────────────────────┐     ┌──────────────────────────────────────────┐
    │  1. openspec-explore    │────▶│  2. brainstorming                        │
    │  (Explore current       │     │  (Based on exploration:                  │
    │   code and structure)   │     │   - Generate ideas                       │
    └─────────────────────────┘     │   - Suggest improvements                 │
                                    │   - Ask key questions to user)           │
                                    └─────────────────┬────────────────────────┘
                                                      │
                                                      ▼
    ┌─────────────────────────┐     ┌──────────────────────────────────────────┐
    │  3. openspec-new        │────▶│  4. openspec-continue / ff               │
    │  (Create specification  │     │  (Create specs, design, tasks)           │
    │   for change/feature)   │     └─────────────────┬────────────────────────┘
    └─────────────────────────┘                       │
                                                      ▼
    ┌─────────────────────────┐     ┌──────────────────────────────────────────┐
    │  5. openspec-apply      │────▶│  6. systematic-debugging                 │
    │  (Implement changes     │     │  (Verify no errors,                      │
    │   according to tasks)   │     │   validate patterns)                     │
    └─────────────────────────┘     └─────────────────┬────────────────────────┘
                                                      │
                                                      ▼
    ┌─────────────────────────┐     ┌──────────────────────────────────────────┐
    │  7. openspec-verify     │────▶│  8. changelog-generator                  │
    │  (Verify against        │     │  (Generate change record                 │
    │   specs and design)     │     │   in changelogs/by-ai/)                  │
    └─────────────────────────┘     └─────────────────┬────────────────────────┘
                                                      │
                                                      ▼
    ┌─────────────────────────┐     ┌──────────────────────────────────────────┐
    │  9. openspec-archive    │────▶│  10. openspec-sync-specs (optional)      │
    │  (Archive completed     │     │  (Sync specs to main)                    │
    │   change)               │     └──────────────────────────────────────────┘
    └─────────────────────────┘
                                                      │
                                                      ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                                                                          │
    │   ✅ CHANGE COMPLETED AND DOCUMENTED                                    │
    │                                                                          │
    └─────────────────────────────────────────────────────────────────────────┘
```

### Phase Descriptions - Changes/Iterations

| Phase | Skill | Description | Required Input | Expected Output |
|------|-------|-------------|-----------------|-----------------|
| 1 | `openspec-explore` | Analyze current code state, identify dependencies and modification points | Change request context | Impact report in `.agents/exploration-report.md` |
| 2 | `brainstorming` | Generate ideas based on exploration, suggest alternatives, ask user questions | Exploration report | `.agents/brainstorming-session.md` with decisions |
| 3 | `openspec-new-change` | Create change container with initial proposal | Brainstorming decisions | `openspec/changes/<name>/proposal.md` |
| 4 | `openspec-continue-change` or `openspec-ff-change` | Create specs, design, and tasks | Approved proposal | Complete OpenSpec artifacts |
| 5 | `openspec-apply-change` | Implement tasks as described | Tasks ready | Modified code following specs |
| 6 | `systematic-debugging` | Validate no errors, verify applied patterns | Modified code | Validation report in `.agents/debug-report.md` |
| 7 | `openspec-verify-change` | Verify implementation matches specs and design | Artifacts + code | Verification report |
| 8 | `changelog-generator` | Document change in history | Implemented feature | `changelogs/by-ai/[YYYY-MM-DD]-[feature].md` |
| 9 | `openspec-archive-change` | Archive completed change | Change ready | `openspec/changes/archive/YYYY-MM-DD-<name>/` |
| 10 | `openspec-sync-specs` (optional) | Synchronize delta specs to main specs | Delta specs | Main specs updated |

---

## ✅ Validation Checklist

Before considering any task as **completed**, verify:

```
╔═══════════════════════════════════════════════════════════════════════════════════╗
║                              MANDATORY CHECKLIST                                   ║
╠═══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                    ║
║  □ Security                                                                        ║
║    └─ □ secure-coding-cybersecurity executed                                     ║
║    └─ □ No known vulnerabilities (SQL injection, XSS, etc.)                       ║
║    └─ □ Inputs validated and sanitized                                            ║
║    └─ □ Secrets/keys not hardcoded                                                ║
║    └─ □ No eval() or dynamic code execution with user input                       ║
║                                                                                    ║
║  □ Maintainability                                                                 ║
║    └─ □ code-maintainability executed                                            ║
║    └─ □ Code follows project conventions                                          ║
║    └─ □ Functions/classes have single responsibility                              ║
║    └─ □ Descriptive and semantic names                                            ║
║    └─ □ No duplicate code (DRY principle)                                         ║
║    └─ □ Documentation explains "why", not "what"                                  ║
║                                                                                    ║
║  □ Error Handling                                                                  ║
║    └─ □ error-handling-patterns applied                                           ║
║    └─ □ All errors handled gracefully                                             ║
║    └─ □ Edge cases covered (null, empty, boundaries)                              ║
║                                                                                    ║
║  □ Specification (OpenSpec)                                                        ║
║    └─ □ Change created with proposal, specs, design, tasks                        ║
║    └─ □ Implementation matches specification                                      ║
║    └─ □ All WHEN/THEN scenarios implemented                                       ║
║    └─ □ Design decisions documented                                               ║
║                                                                                    ║
║  □ Implementation                                                                  ║
║    └─ □ All tasks marked complete [- [x]]                                         ║
║    └─ □ Code tested and functional                                                ║
║    └─ □ No console.logs or debug code                                             ║
║                                                                                    ║
║  □ Validation                                                                      ║
║    └─ □ systematic-debugging executed without critical errors                     ║
║    └─ □ openspec-verify-change passed (or reviewed)                               ║
║    └─ □ Design patterns correctly applied                                         ║
║                                                                                    ║
║  □ Documentation                                                                   ║
║    └─ □ Project index updated if structure changed                                ║
║    └─ □ Changelog generated in changelogs/by-ai/                                  ║
║    └─ □ README updated if necessary                                               ║
║                                                                                    ║
║  □ Closure                                                                         ║
║    └─ □ Change archived with openspec-archive-change                              ║
║    └─ □ Delta specs synchronized (if applicable)                                  ║
║                                                                                    ║
╚═══════════════════════════════════════════════════════════════════════════════════╝
```

---

## 📁 Directory Structure

```
project/
│
├── 📂 .agents/                    # AI-generated documentation
│   ├── security-guidelines.md     # Security practices
│   ├── maintainability-rules.md   # Maintainability rules
│   ├── architecture-decisions.md  # Architecture decisions
│   ├── project-index.md           # Complete project index
│   ├── exploration-report.md      # Exploration reports
│   ├── brainstorming-session.md   # Brainstorming sessions
│   ├── debug-report.md            # Debugging reports
│   └── agent-<domain>.md          # Per-domain guides (e.g., agent-ui.md)
│
├── 📂 .claude/                    # Project-specific skills
│   └── skills/
│       └── project-index-<domain>/
│           └── SKILL.md           # Domain-specific skills
│
├── 📂 .openspec/                  # Formal specifications (OpenSpec)
│   ├── specs/                     # Main specifications
│   │   └── <capability>/
│   │       └── spec.md
│   └── changes/                   # Active changes
│       ├── <change-name>/
│       │   ├── proposal.md        # Why and what changes
│       │   ├── design.md          # How to build it
│       │   ├── tasks.md           # Implementation checklist
│       │   └── specs/             # Delta specs
│       │       └── <capability>/
│       │           └── spec.md
│       └── archive/               # Completed changes
│           └── YYYY-MM-DD-<name>/
│
├── 📂 changelogs/                 # Change history
│   └── by-ai/                     # AI-generated changelogs
│       └── YYYY-MM-DD-feature.md
│
└── [project source code]
```

---

## 🎓 Quick Usage

### To start a new project:
```
1. Execute: secure-coding-cybersecurity
2. Execute: code-maintainability
3. Execute: brainstorming
4. Execute: openspec-new-change (or openspec-ff-change for quick mode)
5. Execute: openspec-continue-change (create specs, design, tasks)
6. Execute: openspec-apply-change
7. Execute: systematic-debugging
8. Execute: openspec-verify-change
9. Execute: changelog-generator
10. Execute: openspec-archive-change
```

### To modify an existing project:
```
1. Check if documentation exists (.agents/, openspec/)
   └─ If NOT exists → Execute: project-index
   
2. Execute: openspec-explore
3. Execute: brainstorming
4. Execute: openspec-new-change (create change)
5. Execute: openspec-continue-change (complete artifacts)
6. Execute: openspec-apply-change (implement)
7. Execute: systematic-debugging (validate)
8. Execute: openspec-verify-change (verify against specs)
9. Execute: changelog-generator
10. Execute: openspec-archive-change
```

### Quick OpenSpec commands:
```
/opsx:explore        - Explore before implementing
/opsx:new <name>     - Create new change step by step
/opsx:ff <name>      - Fast-forward (create all quickly)
/opsx:continue       - Continue existing change
/opsx:apply          - Implement tasks
/opsx:verify         - Verify implementation
/opsx:archive        - Archive completed change
/opsx:onboard        - OpenSpec tutorial
```

---

## 📌 Important Notes

> **⚠️ NEVER skip workflow steps.** Each skill exists to ensure quality.

> **📝 Documentation = Code.** If not documented in OpenSpec, it's not done.

> **🔒 Security first.** Always execute secure-coding-cybersecurity before any implementation.

> **🧠 Brainstorming is mandatory.** Never implement without questioning the approach first.

> **✅ Validation before commit.** Always execute systematic-debugging and openspec-verify before finishing.

> **📦 One change = One feature.** Don't mix multiple features in a single change.

> **🔄 Sync specs.** After archiving, synchronize delta specs to main specs.

---

```
╔═══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                    ║
║           "Well-specified code is well-implemented code"                           ║
║                                                                                    ║
║                         Framework AGENTS.md v2.0                                   ║
║                                                                                    ║
║              22 Skills Available | OpenSpec Workflow Integrated                    ║
║                                                                                    ║
╚═══════════════════════════════════════════════════════════════════════════════════╝
```
