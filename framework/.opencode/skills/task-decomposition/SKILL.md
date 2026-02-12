---
name: task-decomposition
description: Divide large changes into manageable subtasks (1-3 files), optimize model and role assignment, and enable parallel execution. Use when receiving a complex artifact (specification, proposal, or change) that needs to be broken down into logical components, or when planning multi-file changes that require coordination.
license: MIT
metadata:
  author: AC Framework
  version: "1.0"
---

# Task Decomposition

Divide large software changes into manageable, atomic subtasks while optimizing resource allocation and enabling parallel execution.

## When to Use This Skill

Use this skill when:
- A change involves more than 3 files or significant complexity
- You need to parallelize work across multiple agent instances
- The change requires different expertise (frontend, backend, security)
- You want to optimize model selection for each subtask
- Planning a feature that affects multiple domains/modules

## Instructions

### Step 1: Receive and Analyze the Artifact

1. **Read the input artifact** (specification, proposal, or change document)
2. **Extract key components**: features, modules, files, dependencies
3. **Identify boundaries**: What can be developed independently vs. what has dependencies

### Step 2: Generate Dependency Graph

1. **Map all components** and their relationships
2. **Identify independent components** that can be developed in parallel
3. **Mark critical path**: Components that block others
4. **Note integration points**: Where components must work together

### Step 3: Assign Roles and Models

For each subtask, determine:

**Role Assignment**:
- **Architect**: Design and cross-component decisions
- **Implementer**: Code implementation
- **Auditor**: Security and quality review
- **Documenter**: Documentation and examples

**Effort Level**:
- **Low**: 1 file, simple logic, <30 min
- **Medium**: 2-3 files, moderate complexity, 1-2 hours
- **High**: 3+ files, complex logic, >2 hours

**Model Selection**:
- **High-complexity tasks**: Claude Opus 4, GPT-4, Gemini Pro
- **Medium-complexity tasks**: Claude Sonnet, GPT-3.5, standard models
- **Simple/repetitive tasks**: Faster/cheaper models

### Step 4: Create Subtask Metadata

Each subtask should include:

```yaml
subtask:
  id: "unique-identifier"
  name: "Brief descriptive name"
  description: "What this subtask accomplishes"
  files:
    - path/to/file1.ext
    - path/to/file2.ext
  role: "implementer|architect|auditor|documenter"
  effort: "low|medium|high"
  model: "model-name"
  dependencies:
    - "subtask-id-1"
    - "subtask-id-2"
  estimated_time: "30min|1h|2h"
```

### Step 5: Link to OpenSpec Change

1. **Create the subtasks** within the existing OpenSpec change structure
2. **Update tasks.md** with decomposition results
3. **Add metadata** linking subtasks to the parent change

### Step 6: Enable Parallel Execution

1. **Identify parallelizable subtasks** (no dependencies or shared dependencies met)
2. **Group by role** for efficient assignment
3. **Set up coordination points** for integration

## Output Format

After decomposition, provide:

```
## Task Decomposition Summary

**Parent Change**: [change-name]
**Total Subtasks**: [N]
**Estimated Total Time**: [X hours]
**Parallel Groups**: [N groups]

### Subtask List

#### 1. [Subtask Name] (ID: xxx)
- **Files**: [file1, file2, ...]
- **Role**: [role]
- **Effort**: [level]
- **Dependencies**: [list or "none"]
- **Description**: [brief]

[Repeat for each subtask]

### Execution Plan

**Phase 1** (Parallel):
- Subtask 1, Subtask 2, Subtask 3

**Phase 2** (After Phase 1):
- Subtask 4 (depends on 1, 2)

**Phase 3** (Final integration):
- Subtask 5 (depends on 3, 4)
```

## Integration with OpenSpec

After decomposition, continue with `openspec-apply-change` for each subtask:

1. Implementers work on assigned subtasks
2. Each subtask references the parent change for context
3. Integration happens in final phases
4. Verification against original spec

## Guardrails

- **Maximum 3 files per subtask** - Keep them atomic
- **Clear dependencies only** - Don't create circular dependencies
- **Match role to expertise** - Don't assign backend work to UI specialist
- **Realistic effort estimates** - Account for testing and review
- **Preserve change context** - Each subtask should reference parent requirements

## Example

**Input**: "Add user authentication system with login, signup, password reset, and email verification"

**Decomposition**:
1. Database schema for users (Architect) - 2 files
2. Login API endpoint (Backend) - 1 file
3. Signup API endpoint (Backend) - 1 file
4. Password reset flow (Backend) - 2 files
5. Email verification service (Backend) - 1 file
6. Login UI component (Frontend) - 1 file
7. Signup UI component (Frontend) - 1 file
8. Integration tests (QA) - 1 file

**Phases**:
- Phase 1: #1 (blocks others)
- Phase 2: #2, #3, #6, #7 (parallel, no deps between them)
- Phase 3: #4, #5 (need auth flow)
- Phase 4: #8 (integration)

## Requirements

- Understanding of the target architecture
- Access to the specification/proposal being decomposed
- Familiarity with OpenSpec change structure

## See Also

- `openspec-new-change` - Create the parent change
- `openspec-continue-change` - Work on decomposed artifacts
- `openspec-apply-change` - Implement decomposed subtasks
- `spec-analysis` - Verify consistency after decomposition
