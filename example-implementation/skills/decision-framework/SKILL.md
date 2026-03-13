---
name: decision-framework
description: Make decisions with incomplete information and manage uncertainty. Use when facing decisions without full requirements, when estimates are uncertain, or when choosing between multiple valid options. Triggers when user mentions "not sure", "how to decide", "options", or expresses uncertainty.
---

# Decision Framework

## Overview

This skill enables AI agents to make decisions under uncertainty, mimicking how senior engineers navigate ambiguous situations. It provides frameworks for making good decisions with incomplete information, documenting uncertainty, and planning for reversibility.

## When to Use This Skill

Use this skill when:
- Requirements are incomplete or unclear
- Multiple valid options exist
- Estimating effort is difficult
- Choosing between trade-offs
- The user expresses uncertainty or asks "what if"
- No clear "right answer" exists

## Why This Skill Matters

AI struggles with ambiguity - it either asks endless questions or makes arbitrary choices. Senior engineers:
- Make reasonable assumptions and document them
- Prefer reversible decisions
- Set triggers for when to revisit
- Accept uncertainty while proceeding

---

## Execution Steps

### Step 1: Clarify Decision Type

Determine what kind of decision this is:

```
Decision Categories:

1. Irreversible Decision (High Stakes)
   - Cannot be undone without major effort
   - Example: Database schema, API contracts
   - Approach: Maximum due diligence
   
2. Partially Reversible (Medium Stakes)
   - Can be changed with significant effort
   - Example: UI framework, component architecture
   - Approach: Good enough analysis
   
3. Fully Reversible (Low Stakes)
   - Easy to change later
   - Example: CSS naming, file organization
   - Approach: Quick decision, iterate
```

### Step 2: Gather Minimum Viable Information

Ask: "What do I need to know to make this decision?"

```markdown
### Decision: [What we're deciding]

### Must Know (Cannot proceed without):
1. [Question 1]
2. [Question 2]

### Should Know (Improves decision):
1. [Question 1]
2. [Question 2]

### Nice to Know (Optional):
1. [Question 1]
2. [Question 2]
```

### Step 3: Apply Decision Framework

Based on decision type, apply the appropriate approach:

#### For Irreversible Decisions: 5-Why Analysis

```markdown
### 5-Why Analysis for [Decision]

**The Decision**: [What we're deciding]

Why 1: Why do we need this?
→ [Answer]

Why 2: Why does that matter?
→ [Answer]

Why 3: Why is that important?
→ [Answer]

Why 4: Why does that matter for the business?
→ [Answer]

Why 5: Why is that the ultimate goal?
→ [Answer]

**Root Cause**: [The fundamental reason driving this decision]
```

#### For Partially Reversible: weighed Scorecard

```markdown
### Scorecard for [Decision]

| Criterion | Weight | Option A | Option B | Option C |
|-----------|--------|----------|----------|----------|
| Speed to implement | 25% | 8/10 | 6/10 | 9/10 |
| Long-term maintenance | 25% | 6/10 | 9/10 | 7/10 |
| Team familiarity | 20% | 7/10 | 8/10 | 5/10 |
| Scalability | 15% | 8/10 | 7/10 | 9/10 |
| Community support | 15% | 9/10 | 6/10 | 7/10 |
| **Weighted Total** | 100% | **7.45** | **7.55** | **7.60** |

**Winner**: [Option with highest score]

**Note**: Scores are estimates given current information
```

#### For Reversible Decisions: 5-Minute Rule

```markdown
### 5-Minute Decision for [Decision]

**The Rule**: If this decision can be easily changed within 5 minutes, make a reasonable choice now.

**My Choice**: [Option]

**Rationale**: [Brief reasoning]

**When to Revisit**: [Trigger condition]

**How to Reverse**: [What to do if we change our mind]
```

### Step 4: Document Decision with Uncertainty

```markdown
## Decision Record: [Title]

### Status
[ ] Pending - Need more information
[x] Decided - Choice made
[ ] Deprecated - Decision superseded

### The Decision
[What was decided]

### Assumptions Made
- [Assumption 1]
- [Assumption 2]

### Information Gaps
- [Gap 1] - How to resolve: [Plan]
- [Gap 2] - How to resolve: [Plan]

### Confidence Level
- [ ] High: Clear requirements, proven technology
- [x] Medium: Reasonable assumptions, standard tech
- [ ] Low: Many unknowns, experimental

### Reversibility
- [ ] Irreversible: Cannot change without rewrite
- [x] Partially reversible: Can change with effort
- [ ] Fully reversible: Easy to change

### Review Trigger
[When should this decision be revisited]
- [Trigger 1]
- [Trigger 2]

### Sign-off
[AI Agent Name] - [Date]
```

### Step 5: Plan for Reversal

For all decisions, document how to reverse:

```markdown
### Reversal Plan

**If [decision] needs to be reversed:**

1. **Warning Signs**:
   - [Sign 1]
   - [Sign 2]

2. **Effort to Reverse**:
   - Time: [Estimate]
   - Risk: [Level]

3. **Migration Path**:
   - [Step 1]
   - [Step 2]

4. **Rollback Command/Script**:
   ```
   [Commands if applicable]
   ```
```

---

## Uncertainty Communication

When communicating decisions with uncertainty:

### Template A: Confident Recommendation

```
Based on my analysis, I recommend [Option] because:
1. [Reason 1]
2. [Reason 2]
3. [Reason 3]

I'm [confidence level] confident this is the right choice given our current constraints.

What's still uncertain: [List]
When to revisit: [Trigger]
```

### Template B: Unequal Options

```
I've analyzed the options for [Decision]:

Option A: [Summary]
- Pros: [List]
- Cons: [List]

Option B: [Summary]  
- Pros: [List]
- Cons: [List]

My recommendation: [Option]
The key differentiator is: [Factor]

I could go either way if you prefer Option B. What matters most to you here?
```

### Template C: Need Input

```
I need your input to decide on [Decision]:

Option A: [Summary] - Best for [Use case]
Option B: [Summary] - Best for [Use case]

To decide, I need to know:
1. [Question 1]
2. [Question 2]

Which is more important: [Factor A] or [Factor B]?
```

---

## Common Decision Patterns

### Pattern 1: Build vs Buy vs Open Source

```
Decision: How to implement [Feature]

Build:
- Pros: Full control, no dependencies
- Cons: Time, maintenance burden
- When: Core differentiator, unique requirements

Buy:
- Pros: Fast, vendor support
- Cons: Cost, integration complexity, lock-in
- When: Standard functionality, fast delivery needed

Open Source:
- Pros: Control, no licensing cost
- Cons: Self-maintenance, potential abandonment
- When: Community is active, standard functionality
```

### Pattern 2: Monolith vs Services

```
Decision: Architecture for [System]

Monolith:
- Pros: Simpler to develop, test, deploy
- Cons: Scaling limitations, technology lock-in
- When: Team < 10, < 100k users, fast initial velocity

Microservices:
- Pros: Independent scaling, technology flexibility
- Cons: Complexity, operational overhead
- When: Team > 20, > 1M users, multiple teams
```

### Pattern 3: SQL vs NoSQL

```
Decision: Database for [Data Type]

SQL:
- Pros: ACID, mature tooling, standard queries
- Cons: Scaling limitations, rigid schema
- When: Transactions required, structured data

NoSQL:
- Pros: Horizontal scaling, flexible schema
- Cons: Eventually consistent, less tooling
- When: Unstructured data, massive scale needed
```

---

## Output Format

After executing this skill, provide:

### 1. Decision Classification
- Category: Irreversible/Partially Reversible/Reversible
- Stakes: High/Medium/Low

### 2. Analysis Performed
- Framework used
- Options considered

### 3. Decision Made
- Clear choice
- Reasoning documented

### 4. Uncertainty Acknowledged
- Assumptions listed
- Information gaps identified
- Confidence level

### 5. Reversal Plan
- How to recognize wrong decision
- Effort to reverse
- Migration path
