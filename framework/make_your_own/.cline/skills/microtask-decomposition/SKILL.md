---
name: microtask-decomposition
description: Level 2+ task decomposition. Use when a single task from tasks.md is STILL too complex (affects 3+ files or requires multiple logic blocks). Breaks tasks into MICROTASKS (1 file/function each) for granular implementation. NOT for initial task breakdown - OpenSpec already does that.
license: MIT
metadata:
  author: AC Framework
  version: "1.0"
---

# Microtask Decomposition

**Level 2+ Decomposition: From Tasks to Microtasks**

Divide complex tasks from `tasks.md` into atomic, single-file microtasks for granular tracking and implementation.

## ⚠️ CRITICAL: When to Use This Skill

### Use microtask-decomposition when:
- A single task from `tasks.md` affects **3+ files**
- A task requires **multiple distinct logic blocks**
- You need to **parallelize sub-task execution**
- A task is estimated at **>2 hours** of work
- The task has **internal dependencies** that can be sequenced

### Do NOT use when:
- Creating initial tasks (use `openspec-new-change` or `openspec-ff-change`)
- Task affects only 1-2 files (implement directly)
- Task is simple and straightforward

### The Hierarchy:
```
Change (openspec-new-change)
  └─> Tasks (tasks.md) - Level 1
      └─> Microtasks (this skill) - Level 2+
          └─> Implementation
```

---

## Instructions

### Step 1: Identify the Complex Task

Select ONE task from `tasks.md` that meets decomposition criteria:
- [ ] Affects 3+ files
- [ ] Contains multiple distinct operations
- [ ] Estimated effort >2 hours
- [ ] Has internal sequential dependencies

**Example complex task:**
```markdown
- [ ] Implement user authentication with login, signup, password reset, and email verification
```
→ This affects multiple files and operations = DECOMPOSE

### Step 2: Analyze Task Components

Break down the task into its atomic operations:

1. **List all files touched**
2. **List all functions/methods needed**
3. **Identify data flow between components**
4. **Mark dependencies** (what must happen before what)

### Step 3: Create Microtasks

Each microtask must be:
- **Single file** (or 1-2 closely related files)
- **Single purpose** (one function or cohesive set)
- **Independently testable**
- **< 1 hour** estimated effort
- **Clear completion criteria**

**Microtask format:**
```yaml
microtask:
  id: "mt-[number]"
  parent_task: "task-id-from-tasks.md"
  name: "Brief descriptive name"
  description: "What this microtask accomplishes"
  files:
    - path/to/single-file.ext
  dependencies:
    - "mt-[prerequisite]"
  estimated_time: "30min"
  acceptance_criteria:
    - "Criterion 1"
    - "Criterion 2"
```

### Step 4: Map Dependencies

Create a dependency graph:
```
mt-1: Database schema
  └─> mt-2: User model
      ├─> mt-3: Login endpoint
      ├─> mt-4: Signup endpoint
      └─> mt-5: Password reset service
          └─> mt-6: Email verification
              └─> mt-7: Integration tests
```

### Step 5: Assign Execution Order

Group microtasks into execution phases:

**Phase 1** (Foundation - Sequential):
- mt-1, mt-2

**Phase 2** (Core Features - Parallel):
- mt-3, mt-4 (both depend on Phase 1)

**Phase 3** (Extended Features - Sequential):
- mt-5 (depends on Phase 2)

**Phase 4** (Integration):
- mt-6, mt-7 (depends on Phase 3)

---

## Output Format

```
## Microtask Decomposition Summary

**Parent Task**: [task description from tasks.md]
**Task ID**: [task identifier]
**Total Microtasks**: [N]
**Estimated Total Time**: [X hours]
**Execution Phases**: [N phases]

---

### Microtask List

#### Phase 1: Foundation

**mt-1: [Name]**
- **Files**: `file.ext`
- **Description**: What to implement
- **Dependencies**: None
- **Estimated**: 30min
- **Acceptance Criteria**:
  - [ ] Criterion 1
  - [ ] Criterion 2

**mt-2: [Name]**
- **Files**: `file.ext`
- **Description**: What to implement
- **Dependencies**: mt-1
- **Estimated**: 45min
- **Acceptance Criteria**:
  - [ ] Criterion 1

#### Phase 2: Core Features (Parallel)

**mt-3: [Name]**
- **Files**: `file.ext`
- **Description**: What to implement
- **Dependencies**: mt-2
- **Estimated**: 30min
- **Acceptance Criteria**:
  - [ ] Criterion 1

[Continue for all phases...]

---

### Dependency Graph

```
[ASCII art showing dependency relationships]
```

---

### Execution Plan

**Phase 1** (Foundation - Do first):
- [ ] mt-1
- [ ] mt-2

**Phase 2** (Core - Parallelizable):
- [ ] mt-3 (depends: mt-2)
- [ ] mt-4 (depends: mt-2)

**Phase 3** (Extended - Sequential):
- [ ] mt-5 (depends: mt-3, mt-4)

**Phase 4** (Final):
- [ ] mt-6 (depends: mt-5)
- [ ] mt-7 (depends: mt-6)

---

### Parent Task Update

After decomposition, update the parent task in `tasks.md`:

```markdown
- [ ] Implement user authentication [DECOMPOSED INTO MICROTASKS]
  - [ ] Phase 1: Foundation
    - [ ] mt-1: Database schema
    - [ ] mt-2: User model
  - [ ] Phase 2: Core Features
    - [ ] mt-3: Login endpoint
    - [ ] mt-4: Signup endpoint
  - [ ] Phase 3: Extended Features
    - [ ] mt-5: Password reset service
    - [ ] mt-6: Email verification
  - [ ] Phase 4: Integration
    - [ ] mt-7: Integration tests
```
```

---

## Example

### Parent Task (from tasks.md):
```markdown
- [ ] Build complete authentication system with login, signup, password reset, email verification, and session management
```

### Microtask Decomposition:

```
## Microtask Decomposition Summary

**Parent Task**: Build complete authentication system
**Total Microtasks**: 9
**Estimated Total Time**: 6 hours
**Execution Phases**: 4

---

### Microtask List

#### Phase 1: Data Layer

**mt-1: User Database Schema**
- **Files**: `database/migrations/001_users.sql`
- **Description**: Create users table with fields: id, email, password_hash, verified, created_at
- **Dependencies**: None
- **Estimated**: 20min
- **Acceptance**: Migration runs, schema matches requirements

**mt-2: User Model/Entity**
- **Files**: `src/models/User.js`
- **Description**: User class with methods: create(), findByEmail(), verify(), updatePassword()
- **Dependencies**: mt-1
- **Estimated**: 30min
- **Acceptance**: All CRUD operations work, password hashing implemented

#### Phase 2: Core Auth Endpoints (Parallel)

**mt-3: Login Endpoint**
- **Files**: `src/routes/auth/login.js`
- **Description**: POST /api/auth/login - validate credentials, create session/JWT
- **Dependencies**: mt-2
- **Estimated**: 30min
- **Acceptance**: Returns token on success, proper error on failure

**mt-4: Signup Endpoint**
- **Files**: `src/routes/auth/signup.js`
- **Description**: POST /api/auth/signup - validate email, hash password, create user
- **Dependencies**: mt-2
- **Estimated**: 30min
- **Acceptance**: Creates user, sends verification email

#### Phase 3: Extended Features

**mt-5: Password Reset Service**
- **Files**: `src/services/passwordReset.js`, `src/routes/auth/reset.js`
- **Description**: Generate reset tokens, send emails, validate tokens
- **Dependencies**: mt-3, mt-4
- **Estimated**: 45min
- **Acceptance**: Token generation, email sending, token validation work

**mt-6: Email Verification**
- **Files**: `src/services/verification.js`, `src/routes/auth/verify.js`
- **Description**: Send verification emails, verify tokens, update user status
- **Dependencies**: mt-5
- **Estimated**: 30min
- **Acceptance**: Email sent, token verified, user marked verified

**mt-7: Session Management**
- **Files**: `src/middleware/session.js`, `src/services/session.js`
- **Description**: Validate sessions/JWT, refresh tokens, logout
- **Dependencies**: mt-3
- **Estimated**: 40min
- **Acceptance**: Sessions validated, refresh works, logout clears session

#### Phase 4: UI & Integration

**mt-8: Auth UI Components**
- **Files**: `src/components/LoginForm.jsx`, `src/components/SignupForm.jsx`
- **Description**: Forms with validation, error handling, loading states
- **Dependencies**: mt-3, mt-4
- **Estimated**: 60min
- **Acceptance**: Forms work, validation feedback, API integration

**mt-9: Auth Integration Tests**
- **Files**: `tests/integration/auth.test.js`
- **Description**: End-to-end tests for all auth flows
- **Dependencies**: mt-6, mt-7, mt-8
- **Estimated**: 45min
- **Acceptance**: All flows tested, edge cases covered
```

---

## Integration with OpenSpec

### After Microtask Decomposition:

1. **Update `tasks.md`** with microtask breakdown
2. **Execute with `openspec-apply-change`** per microtask:
   ```
   For each microtask:
   - Focus on single file
   - Implement
   - Test
   - Mark complete
   ```
3. **Track progress** in parent task

### Workflow:
```
1. openspec-new-change → Creates tasks.md
2. Identify complex task → Use microtask-decomposition
3. Update tasks.md with microtasks
4. openspec-apply-change → Implement each microtask
5. Mark parent task complete when all microtasks done
```

---

## Guardrails

- **Maximum 1-2 files per microtask** - Keep them atomic
- **Clear dependencies only** - No circular deps
- **Estimates < 1 hour** - If longer, decompose further
- **Testable independently** - Each should have clear done criteria
- **Preserve parent context** - Link back to original task
- **Don't over-decompose** - 2-3 file tasks don't need this

---

## Comparison: When to Use What

| Situation | Use | Don't Use |
|-----------|-----|-----------|
| Initial task breakdown | `openspec-new-change` / `openspec-ff-change` | microtask-decomposition |
| Task affects 1-2 files | Direct implementation | microtask-decomposition |
| Task affects 3+ files, complex | microtask-decomposition | Direct implementation |
| Need parallel execution | microtask-decomposition | Sequential approach |
| Simple CRUD operation | Direct in tasks.md | microtask-decomposition |

---

## See Also

- `openspec-new-change` - Create parent change
- `openspec-continue-change` - Work on decomposed artifacts
- `openspec-apply-change` - Implement each microtask
- `spec-analysis` - Verify consistency after decomposition
