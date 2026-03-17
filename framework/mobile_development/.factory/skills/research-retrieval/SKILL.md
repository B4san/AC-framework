---
name: research-retrieval
description: Search external documentation (web pages, API docs, papers) and generate useful summaries for development. Use when investigating new technologies, understanding third-party APIs, researching best practices, or gathering information for technical decisions. Reduces hallucinations and expands agent knowledge.
license: MIT
metadata:
  author: AC Framework
  version: "1.0"
---

# Research & Retrieval

External knowledge search, documentation retrieval, and synthesis for informed development decisions.

## When to Use This Skill

Use this skill when:
- Investigating new technologies, libraries, or frameworks
- Understanding third-party APIs and their capabilities
- Researching best practices for a specific problem
- Gathering information for architecture decisions
- Need to verify facts or current information
- Exploring solutions to unfamiliar problems

## Instructions

### Step 1: Define Research Goals

1. **Clarify what you need to know**:
   - Specific technical question
   - Comparison of technologies
   - Implementation approach
   - Best practices

2. **Identify sources**:
   - Official documentation
   - API references
   - Technical blogs
   - Research papers
   - GitHub repositories
   - Stack Overflow

3. **Set scope boundaries**:
   - Time period (recent vs. historical)
   - Version specificity
   - Language/framework constraints

### Step 2: Search and Retrieve

**Official Documentation**:
```
Priority sources:
1. Official docs (docs.{service}.com)
2. API reference
3. Getting started guides
4. Best practices
5. Changelog/release notes
```

**Technical Blogs & Articles**:
```
Quality indicators:
- Recent publication date
- Author expertise/credentials
- Code examples included
- Community engagement
- Updated for current versions
```

**Research Papers** (for advanced topics):
```
Use when:
- Novel algorithms needed
- Performance optimizations
- Academic foundations
- Cutting-edge techniques
```

**GitHub Repositories**:
```
Evaluate by:
- Stars/forks (popularity)
- Recent commits (maintenance)
- Issue resolution (support)
- Documentation quality
- Test coverage
```

### Step 3: Evaluate Sources

**Credibility Checklist**:
- [ ] Authoritative source (official > third-party)
- [ ] Up-to-date information
- [ ] Well-explained with examples
- [ ] Community-validated (comments, issues)
- [ ] Version compatibility noted

**Red Flags**:
- Outdated documentation
- Unexplained "magic" solutions
- No code examples
- Deprecated approaches
- Unsupported claims

### Step 4: Extract Key Information

For each relevant source, extract:

```markdown
## Source: [Title/URL]

**Relevance**: [High/Medium/Low]
**Date**: [Publication date]
**Version**: [Software version, if applicable]

### Key Points

1. [Important finding 1]
2. [Important finding 2]
3. [Important finding 3]

### Code Examples

\`\`\`[language]
// Relevant code snippet
\`\`\`

### Warnings/Caveats

- [Known issues or limitations]
- [Breaking changes]
- [Performance considerations]

### References

- [Link 1]
- [Link 2]
```

### Step 5: Synthesize Findings

**Compare approaches**:

```markdown
## Technology Comparison: [Topic]

### Option A: [Technology A]

**Pros**:
- Advantage 1
- Advantage 2

**Cons**:
- Disadvantage 1
- Disadvantage 2

**Best for**: [Use cases]

### Option B: [Technology B]

**Pros**:
- Advantage 1
- Advantage 2

**Cons**:
- Disadvantage 1
- Disadvantage 2

**Best for**: [Use cases]

### Recommendation

[Your recommendation with justification]
```

**Synthesize best practices**:

```markdown
## Best Practices: [Topic]

Based on [N] sources, consensus on:

### Do's
1. [Recommended approach 1]
2. [Recommended approach 2]

### Don'ts
1. [Anti-pattern 1]
2. [Anti-pattern 2]

### Trade-offs
- [Decision point]: [Option A] vs [Option B]
  - Choose A when: [conditions]
  - Choose B when: [conditions]
```

### Step 6: Generate Actionable Steps

Convert research into implementation steps:

```markdown
## Implementation Guide: [Topic]

### Prerequisites
- [Requirement 1]
- [Requirement 2]

### Step-by-Step

1. **Setup**
   - [Action 1]
   - [Action 2]

2. **Configuration**
   - [Action 3]
   - [Action 4]

3. **Implementation**
   - [Action 5]
   - [Action 6]

4. **Testing**
   - [Action 7]

### Common Pitfalls
- [Pitfall 1] → [Solution]
- [Pitfall 2] → [Solution]
```

### Step 7: Store for Reuse

Save findings in `references/` directory:

```
references/
├── README.md (index of all references)
├── api/
│   ├── stripe-api-2024-01.md
│   └── openai-api-best-practices.md
├── libraries/
│   ├── react-server-components.md
│   └── state-management-comparison.md
└── patterns/
    ├── authentication-patterns.md
    └── caching-strategies.md
```

### Step 8: Link to OpenSpec

Reference research in specs:

```markdown
## Specification: [Feature]

### Research References

- [Authentication Patterns](../references/patterns/authentication-patterns.md)
- [Stripe API Integration](../references/api/stripe-api-2024-01.md)

### Decisions Based on Research

1. **Use JWT for authentication**
   - Rationale: [Summary of research findings]
   - Sources: [Links to references]

2. **Implement Redis caching**
   - Rationale: [Performance benchmarks from research]
   - Sources: [Links to references]
```

## Output Format

After research is complete:

```
## Research Summary: [Topic]

**Sources Consulted**: [N]
**Date**: [Research date]
**Confidence**: [High/Medium/Low]

### Executive Summary

[2-3 sentence overview of findings]

### Key Findings

1. [Finding 1 with source]
2. [Finding 2 with source]
3. [Finding 3 with source]

### Recommendations

1. [Actionable recommendation 1]
2. [Actionable recommendation 2]

### Implementation Steps

[Step-by-step guide based on research]

### References Stored

- references/[category]/[filename].md
- [Link to full research document]

### Uncertainties/Gaps

- [What still needs investigation]
- [Questions that remain unanswered]
```

## Guardrails

- **Verify critical information** - Cross-reference multiple sources
- **Check publication dates** - Avoid outdated information
- **Prefer official docs** - Authoritative over anecdotal
- **Acknowledge uncertainty** - Be clear when information is incomplete
- **Document sources** - Always cite where information came from
- **Focus on actionable info** - Avoid research rabbit holes

## Search Strategies

**Error Messages**:
```
"[exact error message]" + [technology name]
```

**Feature Comparisons**:
```
[technology A] vs [technology B] 2024
[technology A] alternative
```

**Best Practices**:
```
[technology] best practices
[technology] common pitfalls
```

**Implementation Guides**:
```
[technology] getting started tutorial
[technology] example project
```

## Requirements

- Web search capability
- Access to documentation sites
- Ability to evaluate source credibility
- Understanding of the domain being researched

## See Also

- `context-synthesizer` - Integrate research into project context
- `spec-clarification` - Use research to clarify requirements
- `documentation` - Document findings
- `brainstorming` - Generate ideas based on research
