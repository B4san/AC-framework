**Fundamental Principle**: *"Quality with focused context. Load only what is necessary, when it is necessary."*

---

## Purpose

`ac-lite` keeps the same spec-driven quality bar as `ac.md`, but reduces token usage by:

1. Loading only the core workflow skills by default.
2. Activating extra skills only when objective risk gates require them.
3. Enforcing mandatory quality checkpoints before implementation and archive.

---

## Default Skill Set (Always Load)

These are the only mandatory skills for every change:

1. `acfm-spec-workflow`
2. `acfm-memory`
3. `openspec-new-change` OR `openspec-ff-change`
4. `openspec-continue-change`
5. `openspec-apply-change`
6. `openspec-verify-change`
7. `openspec-archive-change`

---

## Persistent Memory Protocol (Always Active)

Agents must use the available persistent memory system proactively on every chat/session.

**Session-start requirement (always):**
1. Consult the available persistent memory tool or MCP before planning, implementing, or giving project-specific guidance.
2. Recall project-level context first, then search for task-specific decisions, conventions, bugfixes, and architecture notes.
3. Treat recalled memory as active context unless the current repository state or an explicit user instruction supersedes it.
4. If memory tooling is unavailable, continue with repository inspection and use the AC Framework CLI fallback when possible.

**Save automatically when information is reusable:**
- Architectural decisions from proposals/designs
- Bugfix patterns and solutions
- Performance optimizations
- Refactoring techniques
- Security fixes
- API patterns and conventions
- Reusable workflow conventions and project constraints

**Memory hygiene rules:**
- Save only reusable information likely to matter in future chats.
- Do not save secrets, credentials, tokens, or one-off sensitive data.
- Redact content inside `<private>...</private>` before saving.
- Prefer concise titles, the correct memory type, clear tags, and realistic confidence scores.

**Fallback examples:**
```bash
acfm memory recall "implementing authentication"
acfm memory search "JWT token refresh"
acfm memory recall
acfm memory stats
```

---

## Conditional Skills (Load Only If Gate Triggers)

### Security Gate

Load `secure-coding-cybersecurity` if the change touches any of:

- Auth/session/permissions
- User input handling or validation
- SQL/ORM queries or dynamic filters
- File paths/uploads
- Secrets/tokens/credentials
- Shell/command execution

### Testing Gate

Load `test-generator` if:

- There are no tests for the changed behavior, or
- Existing tests do not cover acceptance criteria, or
- Regression risk is medium/high.

### Consistency Gate

Load `spec-analysis` and `requirement-checklist` if:

- Requirements are ambiguous, or
- Change spans multiple modules, or
- Change modifies core domain behavior.

### API Gate

Load `api-design-principles` if API contracts/endpoints/schemas are added or modified.

### UI Gate

Load `interface-design` if dashboard/app UI behavior is introduced or changed.

### Performance Gate

Load `performance-optimizer` if:

- The change affects hot paths, or
- Latency/throughput targets exist, or
- A performance regression is detected/suspected.

### Context Scale Gate

Load `project-index` and/or `context-synthesizer` if:

- Codebase is large and discovery cost is high, or
- Session is long and context drift appears.

### Debug Gate

Load `systematic-debugging` when blocked by non-trivial bugs or unstable behavior.

### Architecture Gate

Load `architecture-tradeoff-analysis` and `boundary-enforcement` if the change:

- Introduces new architectural patterns or layers
- Modifies how components interact (new services, APIs, databases)
- Requires technology choices or framework decisions
- Affects system scalability or performance characteristics

### Scope Gate

Load `requirement-negotiation` when:

- Requirements from different stakeholders conflict
- Scope creep is detected (adding features mid-implementation)
- Technical constraints conflict with business requirements
- Timeline requires prioritization of features

### Communication Gate

Load `stakeholder-communication` when:

- Change affects multiple user types or departments
- Updates need to be communicated to non-technical stakeholders
- Status reports or decision documentation is required

### Ownership Gate

Load `ownership-checkpoint` when:

- Implementation is complete and ready for review
- Handoff to another developer or team is needed
- Code is being prepared for production deployment

### Decision Gate

Load `decision-framework` when:

- Multiple valid options exist without clear winner
- Requirements are incomplete or ambiguous
- Estimates are highly uncertain
- Trade-offs need explicit analysis

---

## Mandatory Quality Gates

These gates are non-optional in `ac-lite`.

### Gate A: Ready to Implement

Before `openspec-apply-change`, all must be true:

- Change exists and status is valid (`acfm spec status --change <name> --json`)
- `tasks.md` exists with actionable checkboxes
- Acceptance criteria are clear in artifacts
- Required conditional skills (if triggered) were executed
- Session-start memory recall completed for this chat/session

If any item fails: stop, resolve, then continue.

### Gate B: Ready to Archive

Before `openspec-archive-change`, all must be true:

- `openspec-verify-change` completed
- No CRITICAL findings remain
- Relevant tests pass for changed behavior
- Tasks are complete or explicitly accepted by user with warning
- Relevant reusable context from the completed work was saved to memory

If any item fails: stop, fix, re-verify.

### Gate C: Ready for Production

Before deployment, all must be true:

- `ownership-checkpoint` completed (if triggered)
- All boundary violations resolved (if Architecture Gate triggered)
- Decision trade-offs documented (if Decision Gate triggered)
- Stakeholder communication prepared (if Communication Gate triggered)

If any item fails: stop, complete missing items, then deploy.

---

## Lite Workflows

### New Change (Default Path)

1. Run `acfm-spec-workflow` checks (`acfm spec status --json`, init if needed).
2. Run a session-start memory recall using the available memory tool/MCP or the AC Framework CLI fallback.
3. Create change with `openspec-new-change` (or `openspec-ff-change` if user requests speed).
4. Build artifacts with `openspec-continue-change` until apply-ready.
5. Evaluate conditional gates and load only triggered skills.
6. Pass Gate A.
7. Implement with `openspec-apply-change`.
8. Verify with `openspec-verify-change`.
9. Pass Gate B.
10. Archive with `openspec-archive-change`.

### Existing Change (Default Path)

1. Confirm initialization and active changes.
2. Run a session-start memory recall using the available memory tool/MCP or the AC Framework CLI fallback.
3. Select target change.
4. Refresh artifact status.
5. Evaluate conditional gates (only load what triggers).
6. Pass Gate A.
7. Implement.
8. Verify.
9. Pass Gate B.
10. Archive.

---

## Operational Rules

1. Run memory recall at the start of every new chat/session before planning or implementation.
2. Save important reusable context automatically after significant decisions, fixes, or conventions emerge.
3. Do not load broad quality/documentation skills by default.
4. Do not run optional skills "just in case".
5. If risk increases during implementation, activate the matching conditional skill immediately.
6. Prefer deterministic CLI checks over narrative assumptions.
7. Keep outputs concise but auditable (show which gates passed/failed and why).

---

## Suggested Minimal Execution Template

Use this structure in each run:

1. **Change Context**
   - Change name
   - Current artifact progress

2. **Memory Status**
   - Session recall completed: yes/no
   - Relevant prior decisions/patterns found
   - Memory save needed at close: yes/no

3. **Triggered Gates**
   - Security: pass/fail + reason
   - Testing: pass/fail + reason
   - Consistency/API/UI/Performance/Context/Debug: pass/fail + reason

4. **Skills Loaded**
   - Core: always list
   - Conditional: list only triggered ones

5. **Gate A Status**
   - Ready to implement: yes/no

6. **Implementation + Verify**
   - What was implemented
   - Verify findings summary

7. **Gate B Status**
   - Ready to archive: yes/no

8. **Archive Result**
   - Archive path and timestamp

---

## Token Strategy Summary

`ac-lite` reduces cost by replacing "load everything first" with:

- Mandatory core workflow only
- Risk-gated skill expansion
- Hard quality checkpoints at implementation and archive boundaries

This preserves software quality while avoiding unnecessary instruction/context overhead.
