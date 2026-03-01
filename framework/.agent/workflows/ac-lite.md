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
2. `openspec-new-change` OR `openspec-ff-change`
3. `openspec-continue-change`
4. `openspec-apply-change`
5. `openspec-verify-change`
6. `openspec-archive-change`

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

---

## Mandatory Quality Gates

These gates are non-optional in `ac-lite`.

### Gate A: Ready to Implement

Before `openspec-apply-change`, all must be true:

- Change exists and status is valid (`acfm spec status --change <name> --json`)
- `tasks.md` exists with actionable checkboxes
- Acceptance criteria are clear in artifacts
- Required conditional skills (if triggered) were executed

If any item fails: stop, resolve, then continue.

### Gate B: Ready to Archive

Before `openspec-archive-change`, all must be true:

- `openspec-verify-change` completed
- No CRITICAL findings remain
- Relevant tests pass for changed behavior
- Tasks are complete or explicitly accepted by user with warning

If any item fails: stop, fix, re-verify.

---

## Lite Workflows

### New Change (Default Path)

1. Run `acfm-spec-workflow` checks (`acfm spec status --json`, init if needed).
2. Create change with `openspec-new-change` (or `openspec-ff-change` if user requests speed).
3. Build artifacts with `openspec-continue-change` until apply-ready.
4. Evaluate conditional gates and load only triggered skills.
5. Pass Gate A.
6. Implement with `openspec-apply-change`.
7. Verify with `openspec-verify-change`.
8. Pass Gate B.
9. Archive with `openspec-archive-change`.

### Existing Change (Default Path)

1. Confirm initialization and active changes.
2. Select target change.
3. Refresh artifact status.
4. Evaluate conditional gates (only load what triggers).
5. Pass Gate A.
6. Implement.
7. Verify.
8. Pass Gate B.
9. Archive.

---

## Operational Rules

1. Do not load broad quality/documentation skills by default.
2. Do not run optional skills "just in case".
3. If risk increases during implementation, activate the matching conditional skill immediately.
4. Prefer deterministic CLI checks over narrative assumptions.
5. Keep outputs concise but auditable (show which gates passed/failed and why).

---

## Suggested Minimal Execution Template

Use this structure in each run:

1. **Change Context**
   - Change name
   - Current artifact progress

2. **Triggered Gates**
   - Security: pass/fail + reason
   - Testing: pass/fail + reason
   - Consistency/API/UI/Performance/Context/Debug: pass/fail + reason

3. **Skills Loaded**
   - Core: always list
   - Conditional: list only triggered ones

4. **Gate A Status**
   - Ready to implement: yes/no

5. **Implementation + Verify**
   - What was implemented
   - Verify findings summary

6. **Gate B Status**
   - Ready to archive: yes/no

7. **Archive Result**
   - Archive path and timestamp

---

## Token Strategy Summary

`ac-lite` reduces cost by replacing "load everything first" with:

- Mandatory core workflow only
- Risk-gated skill expansion
- Hard quality checkpoints at implementation and archive boundaries

This preserves software quality while avoiding unnecessary instruction/context overhead.
