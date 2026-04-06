**Fundamental Principle**: *"Quality over speed. Documentation before code. Planning before execution."*

--- **CRITICAL: ZERO SKIP POLICY** ---

**YOU CANNOT SKIP ANY STEP. YOU CANNOT SKIP ANY SKILL. YOU CANNOT SKIP ANY PHASE.**

If you attempt to proceed without completing a required step, you MUST STOP and complete it first.

---

## Available Skills

### Quality and Security Skills

| Skill | Description | Primary Use | Required Before |
|-------|-------------|-------------|-----------------|
| `secure-coding-cybersecurity` | Detects and prevents security vulnerabilities (SQLi, XSS, command injection, hardcoded secrets). Follows OWASP Top 10 standards. | Secure code validation | `code-maintainability` |
| `vibe-security` | Final security audit focused on AI-generated/vibe-coded risks (exposed keys, broken access control, auth/payment/data validation gaps). | Final security validation before closure | `openspec-archive-change` |
| `code-maintainability` | Analyzes code maintainability: duplication, documentation, error handling, naming conventions, SOLID architecture, performance. | Refactoring and standards | `project-constitution` |
| `error-handling-patterns` | Error handling patterns in multiple languages: exceptions, Result types, retry, circuit breaker, graceful degradation. | Application resilience | `secure-coding-cybersecurity` |
| `performance-optimizer` | Methodologies for measuring, profiling, and optimizing code (caching, algorithm complexity, resource usage). | Performance Engineering | After Implementation |
| `test-generator` | Generate comprehensive test suites (Unit, Integration, E2E) ensuring requirements are met. | Test Driven Development | `openspec-continue-change` |

### SpecKit Consistency & Quality Skills

| Skill | Description | Primary Use | Required Before |
|-------|-------------|-------------|-----------------|
| `project-constitution` | Manage the project's core principles and ensuring alignment. | Project Governance | **PHASE 1 START** |
| `requirement-checklist` | Generate quality control checklists for requirements (unit tests for specs). | Requirements Quality | `spec-clarification` |
| `spec-analysis` | Analyze consistency across Spec, Plan, and Tasks. | Consistency Check | `openspec-continue-change` |
| `spec-clarification` | Interactively clarify specific sections of the spec. | Ambiguity Resolution | `openspec-new-change` |

### Planning and Design Skills

| Skill | Description | Primary Use | Required Before |
|-------|-------------|-------------|-----------------|
| `brainstorming` | Generates ALL questions at once about decisions before implementing. Explores requirements, constraints, and success criteria in a SINGLE comprehensive prompt. | Design and architecture | `openspec-explore` |
| `api-design-principles` | REST and GraphQL design principles: resources, endpoints, pagination, versioning, HATEOAS. | API design | `spec-clarification` [IF APIs] |
| `interface-design` | Interface design (dashboards, admin panels, apps). NOT for landing pages/marketing. | UI design | `spec-clarification` [IF UI] |

### AC Framework Core Skills

| Skill | Description | Primary Use | Required Before |
|-------|-------------|-------------|-----------------|
| `acfm-spec-workflow` | **START HERE - MANDATORY** - Understand the spec-driven workflow, directory structure (.acfm/ vs openspec/), and CLI commands. Essential before using any OpenSpec skills. | Foundation | **ANYTHING ELSE** |
| `acfm-memory` | **PERSISTENT MEMORY PROTOCOL** - Consult memory at the start of every new chat/session, recall relevant project context, and automatically save reusable decisions and patterns after significant work. Prefer the available memory tool/MCP and use CLI fallback when needed. | Knowledge persistence | Session start and after significant work |

### Persistent Memory Protocol (Mandatory)

The AC Framework includes a persistent memory system that agents must use proactively.

**Session-start requirement (always):**
1. At the start of every new chat/session, consult the available persistent memory tool or MCP before planning, implementing, or giving project-specific guidance.
2. Recall project-level context first, then search for task-specific decisions, conventions, bugfixes, and architecture notes.
3. Treat recalled memory as active project context unless the current repository state or an explicit user instruction supersedes it.
4. If memory tooling is unavailable, continue with repository inspection and use the AC Framework CLI fallback when possible.

**What gets saved automatically:**
- Architectural decisions from proposals/designs
- Bugfix patterns and solutions
- Performance optimizations
- Refactoring techniques
- Security fixes
- API patterns and conventions
- Reusable workflow conventions and project constraints

**How to use memory:**
```text
Preferred: use the available persistent memory tool or MCP for recall, search, save, and project-scoped context.
Fallback: use the AC Framework memory CLI commands when direct tool access is not available.
```
```bash
# Recall relevant context before starting work
acfm memory recall "implementing authentication"

# Search for specific patterns
acfm memory search "JWT token refresh"

# Get full context for current project
acfm memory recall

# View statistics
acfm memory stats
```

**When the agent saves memory (automatic):**
1. After completing proposal.md (saves architectural decisions)
2. After fixing bugs (solutions are stored)
3. After refactoring (techniques are recorded)
4. After optimizations (performance insights)
5. After any significant decision with confidence > 0.7
6. After identifying conventions, constraints, or reusable operating rules worth preserving

**Memory hygiene rules:**
- Save only reusable information likely to matter in future chats.
- Do not save secrets, credentials, tokens, or one-off sensitive data.
- Redact content inside `<private>...</private>` before saving.
- Prefer concise titles, the correct memory type, clear tags, and realistic confidence scores.

**User communication:** "Memory saved: [brief description]" when auto-saving occurs.



### SynapseGrid Collaborative MCP Protocol (Optional)

If SynapseGrid is enabled in `acfm init`, AC Framework installs the collaborative MCP server automatically for detected assistants.

**When to delegate to SynapseGrid:**
- Multi-step features with architecture + implementation + review work
- Tasks requiring critical analysis before coding (security, API contracts, refactors)
- Long-running work where transcript, artifacts, and resumability are important
- Situations where one assistant would benefit from role-based challenge/review

**Role delegation model (what each agent does best):**
- `planner`: breaks down scope, constraints, approach, acceptance criteria
- `critic`: challenges assumptions, finds risks/blind spots, proposes safer alternatives
- `coder`: implements code and applies concrete changes
- `reviewer`: validates quality, consistency with spec/tasks, and production readiness

**Session-start requirement when collaboration is enabled:**
1. Prefer SynapseGrid MCP tools for start/wait/result/cancel/status flows.
2. Use transcript + meeting summary + artifacts as source of truth.
3. If collaborative MCP is unavailable, use equivalent CLI commands.

**Preferred MCP flow (recommended):**
1. `collab_start_session`
2. `collab_invoke_team`
3. `collab_wait_run`
4. `collab_get_result`
5. Optional diagnostics: `collab_get_transcript`, `collab_get_meeting_log`, `collab_status`

**CLI fallback and operations:**
```bash
# Setup/runtime
acfm agents setup
acfm agents runtime install-zellij
acfm agents runtime set auto
acfm agents doctor --verbose

# Start/run
acfm agents start --task "design and implement feature X" --mux auto
acfm agents live
acfm agents status

# Visibility and artifacts
acfm agents transcript --role all --limit 80
acfm agents summary
acfm agents artifacts --watch --interval 1200
acfm agents export --format md --out synapse-session.md

# Model management
acfm agents model list
acfm agents model choose
acfm agents model set --role coder provider/model

# Lifecycle
acfm agents resume
acfm agents stop
```

**Collaboration artifacts (deterministic, not prompt-dependent):**
- `~/.acfm/synapsegrid/<sessionId>/transcript.jsonl`
- `~/.acfm/synapsegrid/<sessionId>/meeting-log.md`
- `~/.acfm/synapsegrid/<sessionId>/meeting-summary.md`
- `~/.acfm/synapsegrid/<sessionId>/turns/*.json`
- `~/.acfm/synapsegrid/<sessionId>/turns/raw/*.ndjson`
- `~/.acfm/synapsegrid/<sessionId>/turns/raw/*.stderr.log`
- `~/.acfm/synapsegrid/<sessionId>/diagnostics.json`

**Troubleshooting and robust behavior:**
- Use `acfm agents doctor --verbose` for capability probe diagnostics.
- In `--mux auto`, runtime prefers zellij and falls back to tmux when zellij startup fails.
- If model/provider errors appear, validate with `opencode auth list` and `opencode models`.
- If workers are running but unclear, inspect `logs`, `transcript`, and `artifacts` before restarting.


### OpenSpec Skills (The heart of the framework)

| Skill | Description | Primary Use | Required Before |
|-------|-------------|-------------|-----------------|
| `openspec-explore` | Exploration mode to investigate problems, map architecture, find integration points before implementing. | Pre-analysis | `acfm-spec-workflow` |
| `openspec-new-change` | Creates a new change with step-by-step workflow (proposal → specs → design → tasks). | Structured start | `brainstorming` |
| `openspec-ff-change` | Fast-forward: creates all artifacts at once to start implementation quickly. | Quick start | `brainstorming` |
| `openspec-continue-change` | Continues an existing change by creating the next artifact in the sequence. | Continue workflow | `openspec-new-change` OR `microtask-decomposition` |
| `openspec-apply-change` | Implements tasks from a change (applies code according to specs and tasks). | Change execution | `test-generator` |
| `openspec-verify-change` | Verifies that implementation matches artifacts (specs, tasks, design). | Validation | `openspec-apply-change` |
| `openspec-archive-change` | Archives a completed change by moving it to `{specDir}/changes/archive/`. | Change closure | `openspec-verify-change` |
| `openspec-onboard` | Guided tutorial to learn OpenSpec with a complete example workflow. | Learning | `acfm-spec-workflow` |
| `openspec-sync-specs` | Synchronizes delta specs to main specs (intelligent merge). | Update specs | `openspec-verify-change` |
| `openspec-bulk-archive-change` | Archives multiple completed changes at once. | Bulk cleanup | `openspec-verify-change` |

### Documentation and Debugging Skills

| Skill | Description | Primary Use | Required Before |
|-------|-------------|-------------|-----------------|
| `project-index` | Generates structured project documentation: structure analysis, domains, agent guides. | Indexing and context | `project-constitution` |
| `sync-index` | Keep project documentation (`project-index` and sub-skills) in sync with codebase changes. | Documentation Sync | `openspec-apply-change` |
| `systematic-debugging` | Structured debugging in 4 phases: root cause investigation, pattern analysis, hypothesis, implementation. | Problem resolution | When bugs found |
| `changelog-generator` | Creates automated changelogs from git commits, translating technical to user language. | Version history | `openspec-archive-change` |
| `skill-writer` | Guide to create new skills for Claude Code with correct structure and frontmatter. | Create new skills | Anytime |
| `vercel-react-best-practices` | React and Next.js performance optimization guidelines from Vercel Engineering. | React/Next.js optimization | [IF REACT] |

### AC Framework Enhancement Skills

| Skill | Description | Primary Use | Required Before |
|-------|-------------|-------------|-----------------|
| `microtask-decomposition` | **LEVEL 2+ DECOMPOSITION** - Use when a single task from tasks.md is still too complex (affects 3+ files or requires multiple logic blocks). Breaks tasks into MICROTASKS (1 file/function each) for granular implementation. NOT for initial task breakdown. | Microtask planning & delegation | `openspec-continue-change` |
| `testing-qa` | Automate generation and maintenance of unit, integration, and E2E tests; generate test data and debugging. | Quality assurance | `openspec-apply-change` |
| `code-review` | Review generated code for style, security, and architecture issues; suggest refactorings and performance improvements. | Code quality & security | `openspec-apply-change` |
| `documentation` | Generate clear documentation for each task: technical descriptions, architecture diagrams, usage guides. | Documentation & communication | `openspec-verify-change` |
| `research-retrieval` | Search external documentation (web pages, API docs, papers) and generate useful summaries for development. | Research & context gathering | `openspec-explore` |
| `context-synthesizer` | Manage memory in long projects and summarize current state to prevent agent context loss. | Memory & context management | `project-constitution` |
| `ci-deploy` | Automate continuous integration, deployment, and post-deployment verification of developed solutions. | CI/CD automation | `openspec-verify-change` |

---

## CRITICAL: How to Use Skills - ZERO SKIP POLICY

### BLOCKING RULES - YOU CANNOT PROCEED WITHOUT THESE:

**Rule 1: Phase Completion Checkpoint**
After EACH phase, you MUST confirm completion:
```
╔══════════════════════════════════════════════════════════╗
║    PHASE [X] COMPLETION CHECKPOINT                      ║
╠══════════════════════════════════════════════════════════╣
║  Have you COMPLETED ALL skills in Phase [X]?              ║
║  [ ] Yes - I have read and executed every skill           ║
║  [ ] No - I need to go back                               ║
╚══════════════════════════════════════════════════════════╝
```
**IF NO: STOP. Go back and complete missing skills.**

**Rule 2: Skill Dependency Chain**
Each skill table above shows "Required Before". You CANNOT use a skill until its dependency is satisfied.

**Rule 3: Output Verification**
Before proceeding to next phase, verify you have these outputs:

| Phase | Required Outputs | Check |
|-------|-----------------|-------|
| Phase 0 | `acfm spec status` shows initialized and session memory recall completed | [ ] |
| Phase 1 | project-constitution.md defined | [ ] |
| Phase 2 | project-index.md exists, exploration notes | [ ] |
| Phase 3 | proposal.md, specs/, design.md, tasks.md | [ ] |
| Phase 4 | Tests written, code implemented, tasks marked complete | [ ] |
| Phase 5 | Verification passed, `vibe-security` audit complete, docs updated, change archived | [ ] |

**Rule 4: Pre-Implementation Safety Check**
Before `openspec-apply-change`, ALL must be TRUE:
- [ ] tasks.md exists and has checkboxes
- [ ] All tests from `test-generator` are written
- [ ] design.md has been reviewed
- [ ] spec-analysis shows consistency

**IF ANY IS FALSE: STOP. Complete missing items.**

---

## Workflow: New Project

When starting a project **from scratch**, follow this **MANDATORY** workflow:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      WORKFLOW: NEW PROJECT - ZERO SKIP                      │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │     START       │
    └────────┬────────┘
             │
             ▼
    ╔══════════════════════════════════════════════╗
    ║    PHASE 0: AC FRAMEWORK SETUP (REQUIRED)   ║
    ║  BLOCKING: Cannot proceed without this       ║
    ╠══════════════════════════════════════════════╣
    ║  1. acfm-spec-workflow                       ║
    ║     └─ **ALWAYS START HERE**                 ║
    ║     └─ Understand .acfm/ vs openspec/        ║
    ║     └─ Learn CLI commands and workflow       ║
    ║     └─ Check project initialization status   ║
    ║     └─ RUN: acfm spec init (if needed)       ║
    ║  2. acfm-memory                              ║
    ║     └─ Recall memory at chat start           ║
    ║     └─ Load prior decisions and conventions  ║
    ╚════════════════════╬═════════════════════════╝
                         ║
                         ║  CHECKPOINT: Phase 0 Complete?
                         ║    [ ] acfm spec status shows "initialized": true
                         ║
                         ║ YES ▼
                         ▼
    ╔══════════════════════════════════════════════╗
    ║  PHASE 1: FOUNDATIONS & GOVERNANCE           ║
    ╠══════════════════════════════════════════════╣
    ║  1. project-constitution                     ║
    ║     └─ Define core principles                ║
    ║  2. secure-coding-cybersecurity              ║
    ║     └─ Establish security guidelines         ║
    ║  3. code-maintainability                     ║
    ║     └─ Define quality standards              ║
    ║  4. vercel-react-best-practices [IF REACT]   ║
    ║     └─ Apply React/Next.js best practices    ║
    ╚════════════════════╬═════════════════════════╝
                         ║
                         ║  CHECKPOINT: Phase 1 Complete?
                         ║    [ ] project-constitution defined
                         ║    [ ] Security guidelines established
                         ║    [ ] Quality standards set
                         ║
                         ║ YES ▼
                         ▼
    ╔══════════════════════════════════════════════╗
    ║  PHASE 2: CONTEXT & DISCOVERY                ║
    ╠══════════════════════════════════════════════╣
    ║  5. context-synthesizer                      ║
    ║     └─ Initialize memory and context state   ║
    ║  6. project-index                            ║
    ║     └─ Document initial structure            ║
    ║  7. research-retrieval                       ║
    ║     └─ Gather external documentation         ║
    ║  8. openspec-explore                         ║
    ║     └─ Explore target architecture           ║
    ║  9. brainstorming                            ║
    ║     └─ Generate ALL questions in ONE prompt  ║
    ║     └─ Surface hidden assumptions            ║
    ║     └─ Challenge constraints                 ║
    ╚════════════════════╬═════════════════════════╝
                         ║
                         ║  CHECKPOINT: Phase 2 Complete?
                         ║    [ ] project-index.md exists
                         ║    [ ] Exploration notes documented
                         ║    [ ] Brainstorming questions answered
                         ║
                         ║ YES ▼
                         ▼
    ╔══════════════════════════════════════════════╗
    ║  PHASE 3: REQUIREMENTS & DESIGN              ║
    ╠══════════════════════════════════════════════╣
    ║  10. spec-clarification (CRITICAL)           ║
    ║      └─ CLARIFY requirements first           ║
    ║  11. openspec-new-change                     ║
    ║      └─ Create proposal                      ║
    ║  12. microtask-decomposition                 ║
    ║      └─ ONLY if task is still too complex    ║
    ║      └─ Break into MICROTASKS (1 file each)  ║
    ║  13. openspec-continue-change                ║
    ║      └─ Draft Specs, Design, Tasks           ║
    ║  14. spec-analysis                           ║
    ║      └─ Verify consistency                   ║
    ║  15. requirement-checklist                   ║
    ║      └─ "Unit test" the specs                ║
    ║  16. api-design-principles [IF APIs]         ║
    ║      └─ Design REST/GraphQL APIs             ║
    ║  17. interface-design [IF UI]                ║
    ║      └─ Design dashboards/apps interface     ║
    ╚════════════════════╬═════════════════════════╝
                         ║
                         ║  CHECKPOINT: Phase 3 Complete?
                         ║    [ ] proposal.md created
                         ║    [ ] specs/ directory with specs
                         ║    [ ] design.md written
                         ║    [ ] tasks.md with checkboxes
                         ║    [ ] spec-analysis passed
                         ║
                         ║ YES ▼
                         ▼
    ╔══════════════════════════════════════════════╗
    ║  PHASE 4: IMPLEMENTATION                     ║
    ╠══════════════════════════════════════════════╣
    ║    SAFETY CHECK - ALL MUST BE TRUE:        ║
    ║  [ ] tasks.md exists                         ║
    ║  [ ] Tests from test-generator written       ║
    ║  [ ] design.md reviewed                      ║
    ║  [ ] spec-analysis shows consistency         ║
    ╠══════════════════════════════════════════════╣
    ║  18. test-generator                          ║
    ║      └─ TDD: Write tests first               ║
    ║  19. openspec-apply-change                   ║
    ║      └─ Implement code to pass tests         ║
    ║  20. testing-qa                              ║
    ║      └─ Automate test maintenance            ║
    ║  21. code-review                             ║
    ║      └─ Review for style/security/arch       ║
    ║  22. secure-coding-cybersecurity             ║
    ║      └─ Audit code for security              ║
    ║  23. error-handling-patterns                 ║
    ║      └─ Verify robust error handling         ║
    ║  24. performance-optimizer                   ║
    ║      └─ Optimize critical paths              ║
    ╚════════════════════╬═════════════════════════╝
                         ║
                         ║  CHECKPOINT: Phase 4 Complete?
                         ║    [ ] All tasks in tasks.md marked [x]
                         ║    [ ] Tests passing
                         ║    [ ] Code reviewed
                         ║    [ ] Security audited
                         ║
                         ║ YES ▼
                         ▼
    ╔══════════════════════════════════════════════╗
    ║  PHASE 5: VALIDATION & CLOSURE               ║
    ╠══════════════════════════════════════════════╣
    ║  25. systematic-debugging                    ║
    ║      └─ Resolve any issues                   ║
    ║  26. openspec-verify-change                  ║
    ║      └─ Validate against specs               ║
    ║  27. vibe-security                           ║
    ║      └─ Final security audit before closure  ║
    ║  28. documentation                           ║
    ║      └─ Generate technical docs & diagrams   ║
    ║  29. sync-index                              ║
    ║      └─ Update project documentation         ║
    ║  30. changelog-generator                     ║
    ║      └─ Generate release notes               ║
    ║  31. ci-deploy                               ║
    ║      └─ Deploy and verify solution           ║
    ║  32. openspec-archive-change                 ║
    ║      └─ Archive the change                   ║
    ╚══════════════════════════════════════════════╝
```

**Conditional Skills Notes:**
- `[IF REACT]`: Use vercel-react-best-practices only if the project uses React or Next.js
- `[IF APIs]`: Use api-design-principles only if the project involves REST/GraphQL APIs
- `[IF UI]`: Use interface-design only if the project has dashboards, admin panels, or apps
- `microtask-decomposition`: Use ONLY when a single task from tasks.md is still too complex (3+ files). NOT for initial breakdown.

---

## Workflow: Existing Project

When working on an **existing codebase** (adding features, fixing bugs, refactoring):

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW: EXISTING PROJECT - ZERO SKIP                    │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │  START CHANGE   │
    └────────┬────────┘
             │
             ▼
    ╔══════════════════════════════════════════════╗
    ║    PHASE 0: AC FRAMEWORK SETUP (REQUIRED)   ║
    ║  BLOCKING: Cannot proceed without this       ║
    ╠══════════════════════════════════════════════╣
    ║  1. acfm-spec-workflow                       ║
    ║     └─ **ALWAYS START HERE**                 ║
    ║     └─ Verify project initialization         ║
    ║     └─ Check existing changes                ║
    ║  2. acfm-memory                              ║
    ║     └─ Recall memory at chat start           ║
    ║     └─ Load prior decisions and conventions  ║
    ╚════════════════════╬═════════════════════════╝
                         ║
                         ║  CHECKPOINT: Phase 0 Complete?
                         ║
                         ║ YES ▼
                         ▼
    ╔══════════════════════════════════════════════╗
    ║  PHASE 1: CONTEXT & ANALYSIS                 ║
    ╠══════════════════════════════════════════════╣
    ║  2. context-synthesizer                      ║
    ║     └─ Load memory and context state         ║
    ║  3. project-index (if needed)                ║
    ║     └─ Map current system                    ║
    ║  4. research-retrieval                       ║
    ║     └─ Gather external documentation         ║
    ║  5. openspec-explore                         ║
    ║     └─ Deep dive into relevant modules       ║
    ║  6. brainstorming                            ║
    ║     └─ ALL questions in ONE prompt           ║
    ║     └─ Ideate on feature/fix                 ║
    ╚════════════════════╬═════════════════════════╝
                         ║  CHECKPOINT
                         ▼
    ╔══════════════════════════════════════════════╗
    ║  PHASE 2: DISCOVERY & CLARIFICATION          ║
    ╠══════════════════════════════════════════════╣
    ║  7. spec-clarification (CRITICAL)            ║
    ║     └─ CLARIFY requirements first            ║
    ║  8. openspec-new-change                      ║
    ║     └─ Initialize change artifact            ║
    ║  9. microtask-decomposition                  ║
    ║     └─ If task too complex                   ║
    ╚════════════════════╬═════════════════════════╝
                         ║  CHECKPOINT
                         ▼
    ╔══════════════════════════════════════════════╗
    ║  PHASE 3: DESIGN & PLANNING                  ║
    ╠══════════════════════════════════════════════╣
    ║  10. openspec-continue-change                ║
    ║      └─ Draft Specs, Design, Tasks           ║
    ║  11. spec-analysis                           ║
    ║      └─ Check consistency with existing      ║
    ║  12. requirement-checklist                   ║
    ║      └─ Validate requirements                ║
    ║  13. api-design-principles [IF APIs]         ║
    ║      └─ Design API changes                   ║
    ║  14. interface-design [IF UI]                ║
    ║      └─ Design interface changes             ║
    ╚════════════════════╬═════════════════════════╝
                         ║  CHECKPOINT
                         ▼
    ╔══════════════════════════════════════════════╗
    ║  PHASE 4: IMPLEMENTATION                     ║
    ╠══════════════════════════════════════════════╣
    ║    SAFETY CHECK REQUIRED                   ║
    ╠══════════════════════════════════════════════╣
    ║  15. test-generator                          ║
    ║      └─ Generate tests for new feature       ║
    ║  16. openspec-apply-change                   ║
    ║      └─ Implement code                       ║
    ║  17. testing-qa                              ║
    ║      └─ Automate test maintenance            ║
    ║  18. code-review                             ║
    ║      └─ Review for style/security/arch       ║
    ║  19. secure-coding-cybersecurity             ║
    ║      └─ Audit new code                       ║
    ║  20. error-handling-patterns                 ║
    ║      └─ Verify error handling                ║
    ║  21. performance-optimizer                   ║
    ║      └─ Ensure no perf degradation           ║
    ╚════════════════════╬═════════════════════════╝
                         ║  CHECKPOINT
                         ▼
    ╔══════════════════════════════════════════════╗
    ║  PHASE 5: OPTIMIZATION & VERIFICATION        ║
    ╠══════════════════════════════════════════════╣
    ║  22. systematic-debugging                    ║
    ║      └─ Fix regressions                      ║
    ║  23. openspec-verify-change                  ║
    ║      └─ Final verification                   ║
    ║  24. vibe-security                           ║
    ║      └─ Final security audit before closure  ║
    ║  25. documentation                           ║
    ║      └─ Generate technical docs & diagrams   ║
    ║  26. sync-index (IMPORTANT)                  ║
    ║      └─ Update docs with new changes         ║
    ║  27. changelog-generator                     ║
    ║      └─ Generate release notes               ║
    ║  28. ci-deploy                               ║
    ║      └─ Deploy and verify solution           ║
    ║  29. openspec-archive-change                 ║
    ║      └─ Archive change                       ║
    ╚══════════════════════════════════════════════╝
```

**Conditional Skills Notes:**
- `[IF APIs]`: Use api-design-principles only if modifying/creating REST/GraphQL APIs
- `[IF UI]`: Use interface-design only if modifying dashboards, admin panels, or apps
- `project-index`: Run only if you haven't indexed the project yet or need to refresh context

---

## Skill Loading Reference

All skills are located in: `skills/`

To load a skill, read its SKILL.md file:
- Example: Read `skills/spec-clarification/SKILL.md` to use the clarification workflow
- Example: Read `skills/interface-design/SKILL.md` to use interface design principles

### MANDATORY SKILL EXECUTION CHECKLIST

Before claiming a skill is "done", verify:
- [ ] I have read the entire SKILL.md file
- [ ] I have executed ALL steps in the skill
- [ ] I have the required output artifacts
- [ ] I can answer: "What did this skill produce?"

**Remember**: Skills are documentation-based workflows with ZERO SKIP policy. Load them by reading the SKILL.md files, execute CLI commands when instructed, and NEVER proceed without completing all steps.

---

## VIOLATION CONSEQUENCES

If you SKIP a skill or phase:
1. The framework integrity is compromised
2. Quality cannot be guaranteed
3. You MUST go back and complete what was skipped
4. No exceptions. No shortcuts. Follow the workflow.

**Quality over speed. Documentation before code. Planning before execution.**
