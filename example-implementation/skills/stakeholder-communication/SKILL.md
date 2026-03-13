---
name: stakeholder-communication
description: Communicate effectively with different audiences (technical and non-technical). Use when preparing updates for stakeholders, explaining technical decisions, or adapting communication for different audiences. Triggers when user mentions stakeholders, communication, presentations, or explaining to non-technical audiences.
---

# Stakeholder Communication

## Overview

This skill enables AI agents to communicate effectively with different audiences, mimicking how senior engineers adapt their communication for technical teams, executives, product managers, and end users. It teaches the AI to identify its audience and adjust message complexity accordingly.

## When to Use This Skill

Use this skill when:
- Preparing status updates
- Explaining technical decisions to non-technical stakeholders
- Writing documentation for different audiences
- Communicating delays or blockers
- Presenting technical concepts
- User mentions "stakeholder", "communication", "explain", or "update"

## Why This Skill Matters

AI typically communicates in technical jargon, regardless of audience. This leads to:
- Executives confused by technical details
- Product managers missing business implications
- Stakeholders unable to make decisions
- Status updates that don't drive action

Senior engineers adapt their communication to drive the right outcomes with each audience.

---

## Execution Steps

### Step 1: Identify Audience

Determine who you're communicating with:

```
Audience Types:

1. Executive (CEO, CTO, VP)
   - Focus: Business impact, ROI, risk
   - Detail: Minimal, high-level
   - Format: Short, visual
   
2. Technical Lead/Architect
   - Focus: Architecture, trade-offs, constraints
   - Detail: High, technical depth
   - Format: Detailed, with options
   
3. Product Manager
   - Focus: Features, timeline, scope
   - Detail: Moderate, feature-focused
   - Format: Clear, with priorities
   
4. Development Team
   - Focus: Implementation, blockers, coordination
   - Detail: High, technical
   - Format: Actionable, specific
   
5. End User/Customer
   - Focus: Value, how to use
   - Detail: Minimal, instructional
   - Format: Clear, friendly
```

### Step 2: Map Message to Audience

For each audience, transform your message:

```
Original Message (Technical):
"We discovered the database query is O(n²) due to missing index, causing 5s latency on /reports. Need to add index on user_id + created_at, which requires 30min downtime for migration."

Transform for each audience:

Executive:
"We found a performance issue in our reporting feature causing slow load times (5 seconds). We're fixing it with a database optimization that will take 30 minutes this weekend. No data loss risk."

Product Manager:
"The reports page is slow (5 seconds). Root cause is missing database index. Fix requires 30-minute maintenance window. Options: (1) Fix now, (2) Defer to sprint 5, (3) Quick fix (2 min) for partial improvement. Recommend option 1 for user experience."

Development Team:
"Found N+1 query in /reports endpoint. Query: [SQL]. Solution: Add composite index on (user_id, created_at). Migration script ready. Deploy requires 30min downtime. Any objections to scheduling for Saturday 2am UTC?"
```

### Step 3: Choose Communication Channel

Match channel to audience and urgency:

| Channel | Best For | Audience |
|---------|----------|----------|
| Email | Formal updates, documentation | Executives, PMs |
| Slack/Teams | Quick questions, async | Team |
| Video Call | Complex discussions, decisions | All |
| Doc/Proposal | Detailed analysis | Tech leads |
| Dashboard | Status, metrics | All |
| Demo | Feature showcases | Stakeholders |

### Step 4: Structure Communication

#### For Executive Updates:

```
## Update: [Project Name] - [Date]

### TL;DR
[One sentence summary]

### Business Impact
- What's working: [List]
- What's blocked: [List]
- Risk level: [Green/Yellow/Red]

### Key Decisions Needed
- [Decision 1] - Due [Date]
- [Decision 2] - Due [Date]

### Next Steps
- [This week]: [List]
- [Next week]: [List]

### Help Needed
- [Request]
```

#### For Technical Decisions:

```
## Technical Decision: [Title]

### Context
[Background and why this decision is needed]

### Options Considered
1. [Option A]: [Summary]
   - Pros: [List]
   - Cons: [List]

2. [Option B]: [Summary]
   - Pros: [List]
   - Cons: [List]

### Recommendation
[Recommended option with reasoning]

### Architecture Impact
- [Impact 1]
- [Impact 2]

### Timeline
- Decision by: [Date]
- Implementation: [Date]
- Testing: [Date]

### Approval Needed
- [Approver]: [What they need to approve]
```

#### For Blockers/Issues:

```
## Blocker: [Title]

### Issue
[Brief description of the problem]

### Impact
- Timeline: [delay estimate]
- Quality: [risk if unblocked]
- Scope: [features affected]

### Root Cause
[Technical explanation if known]

### Options to Resolve
1. [Option A]: [Pros/Cons]
2. [Option B]: [Pros/Cons]

### Recommendation
[Recommended approach]

### Ask
- From [Person/Team]: [What you need]
- By [Date]: [When needed]
```

### Step 5: Review and Adapt

Before sending, verify:

```markdown
### Communication Check

For [Audience]:

- [ ] Lead with what's most important to them
- [ ] Used their language (not ours)
- [ ] Provided clear action items
- [ ] Included timeline/deadline if relevant
- [ ] Made it easy to respond
- [ ] Removed unnecessary technical jargon
- [ ] Included visuals if helpful

### Sentiment Check
- [ ] Professional but not robotic
- [ ] Honest about challenges
- [ ] Confident, not arrogant
- [ ] Solution-oriented, not just problem-focused
```

---

## Communication Templates

### Status Update (Weekly)

```
## Week of [Date] - Status Update

### Accomplished This Week
- ✅ [Feature A]: [Brief description]
- ✅ [Feature B]: [Brief description]

### In Progress
- 🔄 [Feature C]: [Where we are] - ETA [Date]
- 🔄 [Feature D]: [Where we are] - ETA [Date]

### Blockers
- ⚠️ [Blocker]: [Impact] - [Mitigation plan]

### Next Week
- [Planned work]

### Questions/Decisions Needed
- [Question] - From [Who]
```

### Risk/Issue Notification

```
## ⚠️ Issue: [Title]

### What's Happened
[Brief description]

### Impact
- Timeline: [Delay if any]
- Users: [Who's affected]
- Revenue: [Financial impact if any]

### What We're Doing
- [Action 1]
- [Action 2]

### Timeline to Resolution
- ETA: [Date/Time]

### Communication Plan
- [ ] Internal notified
- [ ] Customer communication drafted
- [ ] Post-mortem scheduled

### Prevention
[How we'll prevent this in the future]
```

### Feature Complete Notification

```
## ✨ Feature Ready: [Feature Name]

### Summary
[Brief description of what was delivered]

### How to Use
[Instructions or link to docs]

### What's Included
- [Item 1]
- [Item 2]

### What's NOT Included (v1)
- [Item 1] - [Reason/Plan]

### Testing
- [ ] Unit tests: [Coverage %]
- [ ] QA: [Status]
- [ ] Performance: [Results]

### Next Steps
- [ ] Deploy to staging: [Date]
- [ ] Deploy to prod: [Date]
- [ ] Feature flag: [Name]
```

---

## Audience-Specific Vocabulary

### Use This, Not That

| Instead of... | Use... |
|---------------|--------|
| Latency | Load time |
| Throughput | How much it can handle |
| ACID compliance | Reliable data handling |
| O(n) complexity | Gets slower with more data |
| Coupling | Connected to other parts |
| Refactoring | Improving the code structure |
| Technical debt | Extra work we'll need later |
| Kubernetes | Container management |
| API | How programs talk to each other |

---

## Output Format

After executing this skill, provide:

### 1. Audience Identified
- Primary audience
- Secondary audiences (if any)

### 2. Message Adapted
- Version for each audience
- Key differences highlighted

### 3. Channel Selected
- Recommended channel
- Why this channel

### 4. Action Items
- What reader should do
- Deadline if applicable

### 5. Feedback Mechanism
- How to get questions
- How to provide input
