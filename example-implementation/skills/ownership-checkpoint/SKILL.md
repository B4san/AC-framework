---
name: ownership-checkpoint
description: Establish ownership and accountability checkpoints during development. Use when starting a new feature, before committing code, or when taking responsibility for a change. Triggers when user mentions ownership, accountability, responsibility, or quality gates.
---

# Ownership Checkpoint

## Overview

This skill enables AI agents to establish clear ownership and accountability for their work, mimicking how senior engineers take responsibility for their code. It creates explicit checkpoints where the agent acknowledges ownership and documents its confidence, assumptions, and risk areas.

## When to Use This Skill

Use this skill when:
- Starting implementation of a new feature
- Before marking a task as complete
- When asked to take ownership of code
- Before handoff to another developer or team
- When producing artifacts that will be deployed to production

## Why This Skill Matters

AI generates code without feeling ownership. This leads to:
- Code that "works" but lacks consideration for edge cases
- No accountability when things break
- Missing documentation of assumptions
- No ownership mindset in code quality

Senior engineers take ownership: they document their assumptions, acknowledge risk areas, and ensure quality before handoff.

---

## Execution Steps

### Step 1: Establish Ownership Context

Document what you're taking ownership of:

```markdown
## Ownership Checkpoint

**Feature/Change**: [Name]
**Created**: [Date]
**Ownership Status**: [Draft → Review → Committed → Released]

### Scope
- Files modified: [List]
- New files created: [List]
- Related components: [List]
```

### Step 2: Document Assumptions

For each assumption made during implementation:

```markdown
### Assumptions Made

| Assumption | Why Made | Confidence | Risk If Wrong |
|------------|----------|------------|---------------|
| API returns within 2s timeout | Standard SLA | High | Feature breaks |
| User IDs are UUIDs | Legacy system format | Medium | Data migration needed |
| File uploads < 10MB | UI validation | High | Rejection needed |
```

Confidence levels:
- **High**: Based on explicit requirements or testing
- **Medium**: Reasonable inference from context
- **Low**: Guess based on incomplete information

### Step 3: Identify Risk Areas

Document areas of concern:

```markdown
### Risk Areas

1. **Edge Case: Empty user list**
   - Impact: Medium
   - Detection: Manual testing completed
   - Mitigation: Added null check in UserList.tsx

2. **Performance: Large dataset**
   - Impact: High
   - Detection: Not tested
   - Mitigation: Added pagination, will monitor

3. **Security: User input**
   - Impact: Critical
   - Detection: Code review completed
   - Mitigation: Input sanitization added
```

### Step 4: Create Accountability Statement

Generate an explicit ownership statement:

```markdown
### Accountability Statement

I acknowledge ownership of this implementation and commit to:

✓ **Code Quality**: Code follows project conventions and passes linting
✓ **Testing**: Unit tests cover core logic (or reason if not)
✓ **Documentation**: Comments explain complex logic
✓ **Assumptions Documented**: All assumptions are listed above
✓ **Risk Awareness**: Known risks are documented with mitigations

**Known Limitations**:
- [Limitation 1]
- [Limitation 2]

**Post-Launch Responsibilities**:
- Monitor error logs for 48 hours
- Address any production issues within [SLA]
```

### Step 5: Set Review Checklist

Before claiming ownership is complete:

```markdown
### Pre-Commit Checklist

- [ ] All tests pass (unit, integration)
- [ ] No linting errors or warnings
- [ ] No console.log or debug code left
- [ ] Error handling added for all external calls
- [ ] Sensitive data not logged
- [ ] Configuration externalized (no hardcoded values)
- [ ] Dependencies are compatible with project license
- [ ] Documentation updated (README, API docs, etc.)

**Verification Commands**:
```bash
npm test
npm run lint
npm run typecheck
```
```

### Step 6: Produce Handoff Document

When transferring ownership:

```markdown
## Handoff Document

### Summary
[Brief description of what was implemented]

### For the Next Engineer

**What works**:
- Feature A: [Description]
- Feature B: [Description]

**What doesn't work (known issues)**:
- Issue 1: [Description] - ETA fix: [Date]
- Issue 2: [Description] - ETA fix: [Date]

**To deploy**:
```bash
[Commands to deploy]
```

**To test**:
```bash
[Commands to run tests]
```

**Hotspots to watch**:
- [File/Function]: [Reason]

**Contact**: [Who to reach out to for questions]
```

---

## Ownership Levels

### Level 1: Draft (Implementation in Progress)
- Code is being written
- Tests are being developed
- Changes expected

### Level 2: Review (Ready for Review)
- Self-review complete
- All checks passed
- Awaiting peer review

### Level 3: Committed (Merged to Main)
- Code merged
- Pipeline passes
- Ready for staging

### Level 4: Released (Deployed)
- Deployed to production
- Monitoring active
- Issues tracked

---

## Best Practices

1. **Never claim completion without review**: Always do self-review first
2. **Document the undocumentable**: If you made a guess, write it down
3. **Escalate uncertainty**: If you're not sure, say so
4. **Take blame, share credit**: When things break, own it
5. **Leave it better**: Even if not in scope, fix obvious issues

---

## Anti-Patterns to Avoid

1. **Handwave completion**: "It should work" without verification
2. **Hide assumptions**: Pretend everything was certain
3. **Ignore warnings**: Address lint warnings, don't silence them
4. **Skip testing**: "It works on my machine" is not ownership
5. **Leave mess for others**: Clean up your own code

---

## Output Format

After executing this skill, provide:

### 1. Ownership Statement
- What's being owned
- Scope clearly defined

### 2. Assumption Registry
- All assumptions documented
- Confidence levels assigned

### 3. Risk Inventory
- Identified risks
- Mitigations in place

### 4. Pre-Commit Checklist
- Items verified
- Commands to confirm

### 5. Handoff Readiness
- Ready for review: Yes/No
- Blockers if any
