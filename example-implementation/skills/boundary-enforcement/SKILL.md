---
name: boundary-enforcement
description: Enforce architectural boundaries and prevent cross-layer dependencies. Use when implementing features that might violate architectural layers, when code review reveals boundary violations, or when establishing project architecture. Triggers when user mentions architecture boundaries, layer violations, or architectural rules.
---

# Boundary Enforcement

## Overview

This skill enables AI agents to enforce architectural boundaries that prevent system degradation over time. It teaches the AI to recognize and prevent common boundary violations that lead to technical debt, ensuring the architecture remains maintainable as the system grows.

## When to Use This Skill

Use this skill when:
- Implementing new features that cross architectural layers
- Reviewing code for boundary violations
- Setting up project architecture
- Refactoring to improve architecture
- User mentions "boundary", "layer", "dependency", or "architecture rules"

## Why This Skill Matters

AI agents frequently generate code that works but violates architectural boundaries:
- Direct database access from controllers
- Business logic in UI components
- UI concerns in domain models
- Shared mutable state across services

These violations compile and pass tests but create technical debt that slows future development. Senior engineers enforce boundaries proactively.

---

## Execution Steps

### Step 1: Define Architectural Layers

First, establish the layer definitions for this project:

```
Standard Layer Model:
├── Presentation Layer (UI, Controllers, Views)
│   └── Handles: User interface, input validation, view logic
├── Application Layer (Services, Use Cases)
│   └── Handles: Business orchestration, transaction management
├── Domain Layer (Entities, Value Objects, Domain Services)
│   └── Handles: Business rules, domain logic
└── Infrastructure Layer (Repositories, External Services, DB)
    └── Handles: Data persistence, external API calls
```

### Step 2: Document Allowed Dependencies

For each layer, document what it can depend on:

```
Allowed Dependencies:
Presentation → Application → Domain → Infrastructure

Cross-layer rules:
✓ Presentation can call Application services
✓ Application services can use Domain entities
✓ Application services can call Infrastructure repositories
✓ Domain entities can use Value Objects

Forbidden:
✗ Presentation directly accessing Infrastructure
✗ Domain entities depending on Infrastructure
✗ Infrastructure knowing about Presentation
✗ Circular dependencies anywhere
```

### Step 3: Detect Boundary Violations

When reviewing or generating code, identify violations:

**Common Violations**:

1. **Direct Repository Access from Controllers**
   ```javascript
   // ❌ VIOLATION: Controller directly accessing DB
   async function getUser(req, res) {
     const user = await db.query('SELECT * FROM users WHERE id = ?', req.params.id);
     res.json(user);
   }
   
   // ✅ CORRECT: Controller calls Application service
   async function getUser(req, res) {
     const user = await userService.getUserById(req.params.id);
     res.json(user);
   }
   ```

2. **Business Logic in Components**
   ```javascript
   // ❌ VIOLATION: Business logic in React component
   function OrderSummary({ items }) {
     const total = items.reduce((sum, item) => {
       const discount = item.price > 100 ? 0.1 : 0; // Business rule!
       return sum + (item.price * (1 - discount));
     }, 0);
     // ...
   }
   
   // ✅ CORRECT: Business logic in service/domain
   function OrderSummary({ order }) {
     const total = order.calculateTotal(); // Domain method
     // ...
   }
   ```

3. **Infrastructure in Domain**
   ```javascript
   // ❌ VIOLATION: Domain entity using database
   class User {
     async save() {
       await db.query('INSERT INTO users...'); // Infrastructure!
     }
   }
   
   // ✅ CORRECT: Repository handles persistence
   class UserRepository {
     async save(user) {
       await db.query('INSERT INTO users...');
     }
   }
   ```

### Step 4: Create Boundary Rules

For each project, establish explicit rules:

```yaml
boundary_rules:
  presentation:
    allowed_imports:
      - application_services
      - react_components
      - hooks
    forbidden_imports:
      - repositories
      - database
      - external_apis
  
  application:
    allowed_imports:
      - domain_entities
      - domain_services
      - repositories (interfaces only)
    forbidden_imports:
      - database
      - external_apis (use interface)
  
  domain:
    allowed_imports:
      - value_objects
      - domain_events
    forbidden_imports:
      - repositories
      - services
      - database
      - anything_persistence_related
  
  infrastructure:
    allowed_imports:
      - domain_entities (for mapping)
      - repository_implementations
    forbidden_imports:
      - presentation
      - application_services
```

### Step 5: Enforce with Architecture Tests

Recommend and implement architecture tests:

```javascript
// Example: ArchUnit style test
test('application layer should not depend on infrastructure', () => {
  const applicationClasses = getClassesInPackage('com.app.application');
  const infrastructureClasses = getClassesInPackage('com.app.infrastructure');
  
  applicationClasses.forEach(appClass => {
    appClass.dependencies.forEach(dep => {
      expect(infrastructureClasses).not.toContain(dep);
    });
  });
});
```

### Step 6: Report Violations

When violations are found, output:

```markdown
## Boundary Violation Detected

### Location
`src/controllers/UserController.js:42`

### Violation Type
Presentation Layer → Infrastructure Layer Direct Access

### Current Code
```javascript
const user = await db.query('SELECT * FROM users...');
```

### Why This Is a Problem
- Creates tight coupling between layers
- Makes testing harder (need DB mock)
- Violates Single Responsibility Principle
- Prevents layer replacement (e.g., switch from SQL to NoSQL)

### Recommended Fix
```javascript
const user = await userService.getUserById(req.params.id);
```

### Effort Estimate
5 minutes refactor

### Proceed with fix? (yes/no)
```

---

## Common Architectural Patterns

### 1. Clean Architecture

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (Controllers, UI Components, Views)    │
└─────────────────┬───────────────────────┘
                  │ depends on
                  ▼
┌─────────────────────────────────────────┐
│           Application Layer             │
│     (Use Cases, Services, DTOs)         │
└─────────────────┬───────────────────────┘
                  │ depends on
                  ▼
┌─────────────────────────────────────────┐
│             Domain Layer                │
│  (Entities, Value Objects, Events)      │
└─────────────────┬───────────────────────┘
                  │ depends on
                  ▼
┌─────────────────────────────────────────┐
│         Infrastructure Layer            │
│ (Repositories, External Services, DB)    │
└─────────────────────────────────────────┘
```

### 2. Hexagonal Architecture (Ports & Adapters)

```
              ┌──────────────────────┐
              │   Presentation/UI    │
              │   (Primary Adapter)   │
              └──────────┬───────────┘
                         │
                         ▼
┌─────────────────────────────────────────┐
│              Application                │
│         (Ports/Use Cases)               │
└─────────────────┬───────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────┐
│                Domain                   │
│         (Business Logic)                │
└─────────────────┬───────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────┐
│           Infrastructure                │
│      (Secondary Adapters/DB)            │
              └──────────────────────┘
```

### 3. Module/Plugin Architecture

```
┌──────────────────────────────────────────┐
│              Core System                 │
│  ┌────────────────────────────────────┐  │
│  │     Shared/Common (no deps)        │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
         │              │             │
         ▼              ▼             ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │Module A │   │Module B │   │Module C │
    │(plugin) │   │(plugin) │   │(plugin) │
    └─────────┘   └─────────┘   └─────────┘
    
Rules:
- Modules can depend on Core
- Modules cannot depend on each other
- Core has zero dependencies
```

---

## Boundary Violation Checklist

Use this checklist when generating or reviewing code:

### Presentation → Infrastructure
- [ ] No direct database queries
- [ ] No direct API calls to external services
- [ ] No file system access
- [ ] No direct cache manipulation

### Application → Domain
- [ ] No UI/Presentation code
- [ ] Business logic in domain, not application
- [ ] No persistence logic

### Domain → Infrastructure
- [ ] No database queries
- [ ] No external service calls
- [ ] No file system access
- [ ] Only pure functions and value objects

### General
- [ ] No circular dependencies
- [ ] Dependencies point inward only
- [ ] Interfaces define contracts, not implementations

---

## Output Format

After executing this skill, provide:

### 1. Layer Analysis
- Current layer structure
- Dependencies identified

### 2. Violations Found
- List of violations with location
- Severity: Critical/High/Medium/Low

### 3. Recommended Fixes
- For each violation
- Estimated effort

### 4
- Code examples. Architecture Tests Needed
- What tests to add
- Where to add them

### 5. Long-term Recommendations
- Architectural improvements
- Refactoring roadmap
