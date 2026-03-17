---
name: context-synthesizer
description: Manage memory in long projects and summarize the current state to prevent agent context loss. Use when starting a new session on a long-running project, resuming work after a break, switching contexts between tasks, or when context window is approaching limits. Ensures continuity and consistency across sessions.
license: MIT
metadata:
  author: AC Framework
  version: "1.0"
---

# Context Synthesizer

Memory management and context summarization for long-running projects to maintain continuity and prevent information loss.

## When to Use This Skill

Use this skill when:
- Starting a new session on an existing project
- Resuming work after a break or context switch
- Approaching context window limits during long tasks
- Switching between different parts of a large codebase
- Onboarding to a project mid-development
- Before executing complex multi-step operations

## Instructions

### Step 1: Load Project Context

1. **Read project-index.md** (if exists):
   - Project structure
   - Key directories and their purposes
   - Domain boundaries
   - Active changes

2. **Check OpenSpec status**:
   ```bash
   acfm spec status --json
   ```
   - Which spec directory is used (.acfm/ or openspec/)
   - Active changes
   - Recently archived changes

3. **List active changes**:
   ```bash
   acfm spec list --json
   ```

### Step 2: Summarize Current State

Create a state summary:

```markdown
## Project Context Summary

**Project**: [Name]
**Last Updated**: [Date]
**Session**: [Session identifier]

### Current State

**Active Changes**:
1. [Change 1] - [Brief description] - [Status]
2. [Change 2] - [Brief description] - [Status]

**Recently Completed**:
1. [Change 3] - [Completion date]

**Architecture Overview**:
- [Key architectural decisions]
- [Technology stack]
- [Important patterns in use]

### Current Focus

**Primary Task**: [What we're working on now]
**Next Steps**: [Immediate next actions]
**Blockers**: [Any blocking issues]

### Key Files Modified Recently

1. [file1.ext] - [Why it was changed]
2. [file2.ext] - [Why it was changed]

### Important Context

- [Critical information needed for current work]
- [Decisions made in previous sessions]
- [Patterns to follow]
```

### Step 3: Identify Relevant Artifacts

For the current task, identify:

**Specifications**:
- Which spec applies to current work?
- Where are the delta specs located?
- What are the acceptance criteria?

**Design Documents**:
- Architecture diagrams
- Data models
- API contracts

**Task Lists**:
- Which tasks are in progress?
- Which are completed?
- Dependencies between tasks

**Previous Work**:
- Similar implementations to reference
- Relevant tests
- Documentation

### Step 4: Synthesize Concise Context

Create a focused summary for the current task:

```markdown
## Working Context: [Task Name]

**Goal**: [One-sentence objective]

**Background**:
[2-3 sentences of relevant history]

**Requirements** (from spec):
- [Requirement 1]
- [Requirement 2]

**Current State**:
- [What's already done]
- [What's in progress]
- [What's pending]

**Technical Context**:
- **Language/Framework**: [Tech stack]
- **Key Files**: [List of relevant files]
- **Patterns**: [Architectural patterns to follow]
- **Constraints**: [Limitations or requirements]

**References**:
- Spec: [Link to spec]
- Design: [Link to design doc]
- Similar Implementation: [Link to reference code]
```

### Step 5: Update Context Database

If using vector database (Pinecone, Weaviate, etc.):

1. **Index new artifacts**:
   - Summarize and embed new specifications
   - Index design documents
   - Store task completion summaries

2. **Update project index**:
   ```markdown
   ## Recent Updates
   
   ### [Date]
   - [Change summary]
   - [Files affected]
   - [Decisions made]
   ```

3. **Tag and categorize**:
   - Domain tags (auth, payments, ui, etc.)
   - Status tags (active, completed, archived)
   - Priority tags (critical, high, medium, low)

### Step 6: Provide Context Before Tasks

Before starting work, provide the agent with:

```
## Context for Current Session

**Project**: [Name]
**Working On**: [Specific task/change]
**Session Goal**: [What to accomplish]

### Relevant Specifications

[Summary of applicable specs]

### Current State

[What's already done]
[What needs to be done]

### Key Information

- [Important fact 1]
- [Important fact 2]
- [Decision to remember]

### Files to Focus On

1. [Primary file]
2. [Secondary file]
3. [Test file]

### Patterns to Follow

[Reference to existing patterns]
```

### Step 7: Archive Old Context

Periodically clean up:

1. **Archive completed changes**:
   ```bash
   acfm spec archive [change-name]
   ```

2. **Summarize archived work**:
   ```markdown
   ## Archive Summary: [Change Name]
   
   **Completed**: [Date]
   **Summary**: [What was done]
   **Key Files**: [Files modified]
   **Decisions**: [Important decisions made]
   ```

3. **Compress old context**:
   - Summarize long conversations
   - Extract key decisions
   - Remove obsolete information

## Integration with OpenSpec

- Load context from `.acfm/` or `openspec/` directories
- Reference active changes in context summaries
- Link to specifications and design documents
- Track task completion status

## Output Format

When providing context:

```
## Current Context Loaded

**Project**: [Name]
**Session ID**: [ID]
**Context Size**: [Token count/Compressed size]

### Active Changes (3)
1. user-authentication - JWT implementation - In Progress
2. api-rate-limiting - Middleware setup - Pending
3. database-migration - Schema updates - Completed

### Current Focus
**Change**: user-authentication
**Task**: Implement token refresh
**Status**: 60% complete

### Key Files
- src/services/auth.js
- src/middleware/auth.js
- tests/auth.test.js

### Recent Decisions
1. Use Redis for token storage
2. Refresh tokens valid for 7 days
3. Access tokens valid for 15 minutes

### Next Steps
1. Implement refresh token endpoint
2. Add token rotation logic
3. Write integration tests

### Context Source
- project-index.md (last modified: 2024-01-15)
- .acfm/changes/user-authentication/ (active)
- references/auth-patterns.md
```

## Guardrails

- **Keep summaries concise** - Focus on relevant information
- **Update regularly** - Context gets stale quickly
- **Version context** - Track when context was last updated
- **Prioritize active work** - Don't load context for completed tasks
- **Compress intelligently** - Summarize without losing critical details
- **Cross-reference sources** - Always link to original documents

## Context Compression Strategies

**High Priority** (Always include):
- Current task requirements
- Active change specifications
- Recent decisions
- Blocking issues

**Medium Priority** (Summarize):
- Completed changes (last 3)
- Architecture overview
- Key patterns
- Active dependencies

**Low Priority** (Reference only):
- Completed changes (older)
- Archived work
- General documentation
- Historical context

## Requirements

- Access to project-index.md
- Access to OpenSpec directories
- Storage for context summaries (file or vector DB)
- Understanding of what's relevant vs. noise

## See Also

- `acfm-spec-workflow` - Understand OpenSpec structure
- `project-index` - Generate/maintain project documentation
- `sync-index` - Keep index in sync with codebase
- `openspec-verify-change` - Verify context is current
