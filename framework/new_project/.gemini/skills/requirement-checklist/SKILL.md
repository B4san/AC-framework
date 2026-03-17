---
name: requirement-checklist
description: Generate comprehensive checklists to validate requirements quality (Unit Tests for Specs). Critically examine the spec for clarity, completeness, and consistency before implementation starts.
---

# Requirement Checklist Generation

## Overview

Checklists are **UNIT TESTS FOR REQUIREMENTS WRITING** - they validate the quality, clarity, and completeness of requirements in a given domain.

**NOT for verification/testing implementation**:
*   ❌ NOT "Verify the button clicks correctly"
*   ❌ NOT "Test error handling works"
*   ❌ NOT "Confirm the API returns 200"
*   ❌ NOT checking if code/implementation matches the spec

**FOR requirements quality validation**:
*   ✅ "Are visual hierarchy requirements defined for all card types?" (completeness)
*   ✅ "Is 'prominent display' quantified with specific sizing/positioning?" (clarity)
*   ✅ "Are hover state requirements consistent across all interactive elements?" (consistency)
*   ✅ "Are accessibility requirements defined for keyboard navigation?" (coverage)
*   ✅ "Does the spec define what happens when logo image fails to load?" (edge cases)

## Execution Steps

1.  **Setup**:
    *   Parse feature directory and available docs list.
    *   Identify the target feature spec (`spec.md`, `plan.md`, `tasks.md`).

2.  **Clarify intent (dynamic)**:
    *   Derive up to THREE initial contextual clarifying questions (no pre-baked catalog). They MUST:
        *   Be generated from the user's phrasing + extracted signals from spec/plan/tasks
        *   Only ask about information that materially changes checklist content
    *   Generation algorithm:
        1.  Extract signals: feature domain keywords (e.g., auth, latency, UX, API), risk indicators ("critical", "must", "compliance"), stakeholder hints ("QA", "review", "security team"), and explicit deliverables ("a11y", "rollback", "contracts").
        2.  Cluster signals into candidate focus areas (max 4) ranked by relevance.
        3.  Identify probable audience & timing (author, reviewer, QA, release) if not explicit.
        4.  Detect missing dimensions: scope breadth, depth/rigor, risk emphasis, exclusion boundaries, measurable acceptance criteria.

3.  **Generate checklist - Create "Unit Tests for Requirements"**:
    *   Create a checklist file in the feature directory (e.g., `checklists/[domain].md`).
    *   Format: `[domain].md` (e.g., `ux.md`, `api.md`, `security.md`).
    *   Number items sequentially starting from CHK001.
    *   Each run creates a NEW file (never overwrites existing checklists unless explicitly told).

    **CORE PRINCIPLE - Test the Requirements, Not the Implementation**:
    Every checklist item MUST evaluate the REQUIREMENTS THEMSELVES for:
    *   **Completeness**: Are all necessary requirements present?
    *   **Clarity**: Are requirements unambiguous and specific?
    *   **Consistency**: Do requirements align with each other?
    *   **Measurability**: Can requirements be objectively verified?
    *   **Coverage**: Are all scenarios/edge cases addressed?

    **Category Structure**:
    *   Requirement Completeness
    *   Requirement Clarity
    *   Requirement Consistency
    *   Acceptance Criteria Quality
    *   Scenario Coverage
    *   Edge Case Coverage
    *   Non-Functional Requirements
    *   Dependencies & Assumptions
    *   Ambiguities & Conflicts

4.  **Structure Reference**:
    *   Generate the checklist following a markdown template: Title, Purpose, Category Headings, `##` sections, `- [ ] CHK### <requirement item>` lines.

5.  **Report**:
    *   Output full path to created checklist, item count, and remind user that each run creates a new file.
    *   Summarize focus areas selected, depth level, and valid user must-haves.

## Checklist Item Guidelines

**Example Checklist Items**:

*   **UX**: "Are visual hierarchy requirements defined with measurable criteria? [Clarity, Spec §FR-1]"
*   **API**: "Are error response formats specified for all failure scenarios? [Completeness]"
*   **Performance**: "Are performance requirements quantified with specific metrics? [Clarity]"
*   **Security**: "Are authentication requirements specified for all protected resources? [Coverage]"

**Avoid Implementation Tests**:
*   ❌ "Verify landing page displays 3 episode cards"
*   ❌ "Test hover states work correctly on desktop"
*   ❌ "Confirm logo click navigates to home page"

**Use Quality Checks**:
*   ✅ "Are the exact number and layout of featured episodes specified?" [Completeness]
*   ✅ "Is 'prominent display' quantified with specific sizing/positioning?" [Clarity]
*   ✅ "Are hover state requirements consistent across all interactive elements?" [Consistency]
