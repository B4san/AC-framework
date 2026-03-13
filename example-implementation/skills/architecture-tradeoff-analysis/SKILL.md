---
name: architecture-tradeoff-analysis
description: Analyze architectural decisions with explicit tradeoffs. Use when designing systems, making technology choices, or evaluating design alternatives. Triggers when the user mentions architecture, system design, technology choices, or tradeoffs.
---

# Architecture Tradeoff Analysis

## Overview

This skill enables AI agents to evaluate architectural decisions with the same rigor as senior engineers: explicitly documenting tradeoffs, considering consequences, and making informed decisions rather than default choices.

## When to Use This Skill

Use this skill when:
- Designing new system architecture
- Making technology or framework choices
- Evaluating design alternatives
- Refactoring existing systems
- Addressing scalability, performance, or maintainability concerns
- The user explicitly mentions "tradeoff", "architecture decision", or "design choice"

## Why This Skill Matters

AI typically generates code that "works" but doesn't understand the long-term consequences of architectural choices. Senior engineers think in tradeoffs:
- "Yes, we could use microservices, but it adds operational complexity"
- "GraphQL is powerful, but introduces N+1 query risks"
- "Monolith is simpler now, but limits scaling"

This skill teaches the AI to think architecturally.

---

## Execution Steps

### Step 1: Identify the Decision Context

For each architectural decision, document:

1. **The Decision**: What are we deciding?
2. **Alternatives Considered**: What other options exist?
3. **Primary Driver**: What is the main reason for this decision?
4. **Constraints**: What limitations shape the choice?

### Step 2: Build Tradeoff Matrix

For each alternative, evaluate:

| Criterion | Option A | Option B | Option C | Weight |
|-----------|----------|----------|----------|--------|
| Performance | ? | ? | ? | High |
| Maintainability | ? | ? | ? | High |
| Scalability | ? | ? | ? | Medium |
| Development Speed | ? | ? | ? | High |
| Operational Complexity | ? | ? | ? | Medium |
| Learning Curve | ? | ? | ? | Low |
| Cost | ? | ? | ? | Medium |

### Step 3: Evaluate Consequences

For each option, document:

**Short-term (0-3 months)**:
- Development velocity impact
- Team learning curve
- Initial implementation complexity

**Medium-term (3-12 months)**:
- Maintenance burden
- Scaling characteristics
- Bug fix difficulty

**Long-term (12+ months)**:
- Technical debt accumulation
- Migration difficulty
- Vendor lock-in risks

### Step 4: Identify Reversibility

Classify each decision:

- **Reversible** (Low risk): Can change later without major rework
- **Partially Reversible** (Medium risk): Can change with significant effort
- **Irreversible** (High risk): Cannot change without complete rewrite

### Step 5: Document Decision Record

Create an Architecture Decision Record (ADR):

```markdown
# ADR-[N]: [Decision Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[What is the issue that is motivating this decision?]

## Decision
[What is the change that we're proposing and/or doing?]

## Consequences
[What becomes easier or more difficult because of this change?]

## Tradeoffs
| Tradeoff | Impact | Mitigation |
|----------|--------|------------|
| ... | ... | ... |

## Alternatives Considered
1. [Option 1] - Why rejected
2. [Option 2] - Why rejected

## Review Date
[When should this decision be revisited?]
```

---

## Common Architectural Tradeoffs

### 1. Monolith vs Microservices

| Factor | Monolith | Microservices |
|--------|----------|---------------|
| Development Speed | Faster initially | Slower initially |
| Scaling | Limited | Horizontal |
| Deployment | Simple | Complex |
| Team Autonomy | Low | High |
| Debugging | Easier | Harder |
| Technology Lock-in | High | Low |

### 2. SQL vs NoSQL

| Factor | SQL | NoSQL |
|--------|-----|-------|
| Data Consistency | Strong | Eventual |
| Query Flexibility | High | Limited |
| Scaling | Vertical | Horizontal |
| Schema Evolution | Strict | Flexible |
| Learning Curve | Medium | Low |

### 3. Synchronous vs Asynchronous

| Factor | Synchronous | Asynchronous |
|--------|------------|-------------|
| Latency | Higher | Lower |
| Complexity | Lower | Higher |
| Debugging | Easier | Harder |
| Consistency | Easier | Harder |
| User Experience | Blocking | Responsive |

### 4. Build vs Buy vs Open Source

| Factor | Build | Buy | Open Source |
|--------|-------|-----|-------------|
| Control | Full | Limited | Full |
| Cost | High (dev time) | Recurring | Variable |
| Time to Market | Slowest | Fastest | Medium |
| Maintenance | Internal | Vendor | Community |

---

## Decision Framework

When facing architectural decisions, follow this priority:

1. **Solve the actual problem** - Don't add complexity for hypothetical future needs
2. **Optimize for change** - Make reversible decisions easy, irreversible ones rare
3. **Prefer simplicity** - The simplest solution that meets requirements wins
4. **Consider the team** - Choose technology the team can actually operate
5. **Document the gamble** - If you're choosing speed over quality, acknowledge it

---

## Output Format

After executing this skill, provide:

### 1. Decision Summary
- What decision was made
- Why this option was chosen

### 2. Tradeoff Analysis
- Matrix with all alternatives
- Winner for each criterion

### 3. Consequences Documented
- Short/medium/long-term impacts
- Reversibility classification

### 4. ADR Created
- Location where ADR is stored
- Review date set

### 5. Recommendations
- Any follow-up actions needed
- When to revisit this decision

---

## Best Practices

1. **Never decide in vacuum** - Always consider team capabilities, timeline, and business context
2. **Challenge assumptions** - Ask "what if we're wrong?" for each option
3. **Prefer defaults** - Standard patterns are fine unless there's a compelling reason to diverge
4. **Set review dates** - Architecture decisions should be revisited
5. **Share the reasoning** - Document not just what, but why

---

## Anti-Patterns to Avoid

1. **Analysis paralysis** - Don't over-engineer; make decisions and move on
2. **Not invented here** - Don't reject solutions because you didn't create them
3. **Future proofing** - Don't optimize for hypothetical scenarios
4. **Ignoring tradeoffs** - Every choice has costs; acknowledge them
5. **Following trends** - Don't choose technology because it's popular
