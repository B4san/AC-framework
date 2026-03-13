---
name: requirement-negotiation
description: Negotiate conflicting requirements and manage stakeholder expectations. Use when requirements conflict, stakeholders disagree, or scope needs to be managed. Triggers when user mentions conflicts, disagreements, scope changes, or stakeholder management.
---

# Requirement Negotiation

## Overview

This skill enables AI agents to handle requirement conflicts with the sophistication of a senior product manager: identifying tradeoffs, proposing alternatives, and guiding stakeholders toward optimal decisions rather than blindly implementing contradictory requirements.

## When to Use This Skill

Use this skill when:
- Requirements from different stakeholders conflict
- Scope creep is occurring
- Technical constraints conflict with business requirements
- Timeline constraints require prioritization
- User mentions "but the client wants...", "they insist on...", or expresses frustration with changing requirements
- Multiple valid but mutually exclusive options exist

## Why This Skill Matters

AI typically takes requirements at face value and attempts to implement everything, leading to:
- Scope creep and missed deadlines
- Technical debt from poorly integrated features
- Frustrated stakeholders when expectations aren't met

Senior engineers negotiate requirements professionally, finding solutions that satisfy core needs while managing constraints.

---

## Execution Steps

### Step 1: Identify the Conflict

Analyze the conflicting requirements:

1. **What is stakeholder A asking for?**
2. **What is stakeholder B asking for?**
3. **Why does each stakeholder need this?**
4. **What are the underlying interests?** (often different from stated requests)

### Step 2: Map the Conflict

Create a conflict map:

```
Conflict: [One-sentence summary]

Stakeholder A:
- Position: [What they're asking]
- Interest: [Why they want it]
- Priority: [High/Medium/Low]

Stakeholder B:
- Position: [What they're asking]
- Interest: [Why they want it]
- Priority: [High/Medium/Low]

Technical Reality:
- [What is actually feasible]
- [What are the constraints]
```

### Step 3: Generate Options

Brainstorm alternatives that might satisfy both interests:

1. **Option A**: [Partial satisfaction approach]
2. **Option B**: [Phased approach]
3. **Option C**: [Alternative satisfaction approach]
4. **Option D**: [Compromise trade-off]

For each option, document:
- Which interests are satisfied
- Which are partially satisfied
- Which are not satisfied
- Technical complexity

### Step 4: Propose Resolution

Present recommendations using this framework:

```markdown
## Requirement Conflict Resolution

### Issue
[Brief description of the conflict]

### Options Considered
1. **[Option 1]**: Pros/Cons
2. **[Option 2]**: Pros/Cons
3. **[Option 3]**: Pros/Cons

### Recommended Approach
[Why this option is recommended]

### Trade-offs
- [Trade-off 1]
- [Trade-off 2]

### Next Steps
- [Action 1]
- [Action 2]
```

### Step 5: Set Expectations

For each resolved conflict, establish:

1. **What will be delivered**: Clear scope
2. **What will NOT be delivered**: Explicit exclusions
3. **When**: Timeline commitment
4. **Contingencies**: What if circumstances change

---

## Negotiation Strategies

### 1. Interest-Based Negotiation

Focus on underlying interests, not positions:
- Stakeholder A wants "fast load times" (interest: user satisfaction)
- Stakeholder B wants "rich animations" (interest: user engagement)
- **Solution**: Optimize animations, defer polish until performance is proven

### 2. Expand the Pie

Find options that create value for everyone:
- Instead of "which feature first", ask "what can we add?"

### 3. Phased Delivery

If full scope isn't feasible:
- Phase 1: Core functionality
- Phase 2: Enhanced experience
- Phase 3: Nice-to-haves

### 4. Trade-off Documentation

When trade-offs are unavoidable:

| Feature | Priority | Compromise |
|---------|----------|------------|
| Real-time updates | High | Accept 5s delay |
| Offline support | Medium | Defer to v2 |
| Advanced search | Low | Basic search v1 |

### 5. No-Means-No (Graceful)

Sometimes the answer is no. Frame it professionally:

"I understand you need [X]. Given our constraints of [Y] and [Z], we have these options:
1. [Option A]: Achieve X by accepting Y tradeoff
2. [Option B]: Achieve X partially with Z benefit
3. [Option C]: Defer X to focus on higher priorities

What works best for your goals?"

---

## Common Conflict Patterns

### Pattern 1: Feature vs Timeline

**Conflict**: "We need all features by launch"
**Resolution**: Apply scope prioritization

### Pattern 2: Quality vs Speed

**Conflict**: "Ship fast but no bugs"
**Resolution**: Define "shippable quality" vs "production quality"

### Pattern 3: Custom vs Standard

**Conflict**: "Build exactly what we have now" vs "use platform features"
**Resolution**: Map custom requirements to platform capabilities

### Pattern 4: Short-term vs Long-term

**Conflict**: "Ship now" vs "build for scale"
**Resolution**: Identify MVP vs technical debt boundary

### Pattern 5: Security vs Usability

**Conflict**: "Make it easy" vs "make it secure"
**Resolution**: Find balance, escalate if irreconcilable

---

## Communication Templates

### Escalation Template

```
I've identified a conflict in requirements that needs discussion:

[Describe conflict]

Options:
1. [Option A]: [Trade-off]
2. [Option B]: [Trade-off]
3. [Option C]: [Trade-off]

My recommendation: [Option X] because [reasoning]

To decide, I need to understand:
- [Question 1]
- [Question 2]
```

### Expectation Setting Template

```
Based on our discussion, here's what we'll deliver:

✓ [Confirmed deliverable 1]
✓ [Confirmed deliverable 2]
✗ [Explicitly out of scope]

Timeline: [Date]

Risks:
- [Risk 1]: [Mitigation]
- [Risk 2]: [Mitigation]

Please confirm this aligns with your expectations.
```

### Trade-off Proposal Template

```
To achieve [Goal A], we have two paths:

**Path 1**: [Approach]
- Pros: [Benefit 1], [Benefit 2]
- Cons: [Cost 1], [Cost 2]

**Path 2**: [Approach]
- Pros: [Benefit 1], [Benefit 2]
- Cons: [Cost 1], [Cost 2]

Recommendation: Path 1 because [reasoning]

Do you want to proceed with this approach?
```

---

## Output Format

After executing this skill, provide:

### 1. Conflict Analysis
- Stakeholder mapping
- Interest identification

### 2. Options Presented
- At least 3 alternatives
- Clear trade-offs for each

### 3. Recommendation
- Chosen approach
- Reasoning documented

### 4. Agreement Reached
- What will be delivered
- What is explicitly excluded
- Timeline if applicable

### 5. Follow-up Actions
- Any dependencies
- When to revisit
