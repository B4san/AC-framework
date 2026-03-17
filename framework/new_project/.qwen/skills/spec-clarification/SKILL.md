---
name: spec-clarification
description: Identify underspecified areas in the current feature spec by asking targeted clarification questions and encoding answers back into the spec.
---

# Specification Clarification

## Overview

Detect and reduce ambiguity or missing decision points in the active feature specification and record the clarifications directly in the spec file.

**Goal**: Identify 5 actionable clarification questions that materially impact implementation.

## Execution Steps

1.  **Initialize Context**:
    *   Load the current spec file (`spec.md`).
    *   Perform a structured ambiguity & coverage scan.
    *   Identify missing or partial information in: Functional Scope, Domain & Data Model, Interaction & UX Flow, Non-Functional Quality, Integration & Dependencies, Edge Cases, Constraints, Terminology, Completion Signals, Misc/Placeholders.

2.  **Generate Prioritized Questions**:
    *   Create a queue of candidate clarification questions (max 5).
    *   **Constraints**:
        *   Answerable with Multiple Choice (2-5 options) OR Short Answer (<=5 words).
        *   Materially impacts architecture, data modeling, task decomposition, test design, UX, or compliance.
        *   Exclude style preferences or plan-level details unless blocking.
        *   Favor impact * uncertainty heuristic.

3.  **Sequential Questioning Loop (Interactive)**:
    *   Present **ONE** question at a time.
    *   **Multiple Choice**:
        *   Analyze options based on best practices/risk/alignment.
        *   Present **Recommended Option** with reasoning first.
        *   Show table of options (A, B, C...).
        *   Prompt user to reply with letter or "yes"/"recommended".
    *   **Short Answer**:
        *   Provide **Suggested Answer** based on context.
        *   Prompt user to reply "yes"/"suggested" or own answer.
    *   **After Answer**:
        *   Validate answer.
        *   Record in working memory.
        *   Stop if: All critical ambiguities resolved, User says stop, or 5 questions reached.

4.  **Integration (Incremental Update)**:
    *   **After EACH accepted answer**:
        *   Ensure a `## Clarifications` section exists (create if missing).
        *   Append a bullet: `- Q: <question> → A: <final answer>`.
        *   **Apply the clarification** to the appropriate section(s) in the spec:
            *   Functional → Functional Requirements.
            *   User Interaction → User Stories/Actors.
            *   Data → Data Model.
            *   Non-Functional → NFRs.
            *   Edge Case → Edge Cases/Error Handling.
            *   Terminology → Normalize terms.
        *   **Save the spec file** immediately.

5.  **Validation**:
    *   Ensure exactly one bullet per answer.
    *   Ensure no contradictory earlier statements remain.
    *   Ensure Markdown structure is valid.

6.  **Report Completion**:
    *   Summarize questions asked & answered.
    *   List sections touched.
    *   Show coverage summary table (Resolved/Deferred/Clear/Outstanding).
    *   Recommend next steps (e.g., Proceed to Planning).

## Principles

*   If no ambiguities, state "No critical ambiguities detected".
*   Never exceed 5 questions.
*   Avoid speculative tech stack questions unless blocking functional clarity.
*   Respect explicit user stops.
