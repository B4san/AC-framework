---
name: project-constitution
description: Manage the project's core principles and ensuring alignment. Create or update the project constitution from interactive or provided principle inputs.
---

# Project Constitution Management

## Overview

You are updating the project constitution at `.specify/memory/constitution.md` (or `.specify/.specify/memory/constitution.md` if the user's structure differs). This file is a TEMPLATE containing placeholder tokens in square brackets (e.g. `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`). Your job is to (a) collect/derive concrete values, (b) fill the template precisely, and (c) propagate any amendments across dependent artifacts.

**Note**: If the constitution file does not exist yet, it should have been initialized from a template during project setup. If it's missing, copy the template first (check `.specify/templates/constitution-template.md`).

## Execution Flow

1.  **Load the existing constitution**.
    *   Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]`.
    *   **IMPORTANT**: The user might require less or more principles than the ones used in the template. If a number is specified, respect that - follow the general template. You will update the doc accordingly.

2.  **Collect/derive values for placeholders**:
    *   If user input (conversation) supplies a value, use it.
    *   Otherwise infer from existing repo context (README, docs, prior constitution versions if embedded).
    *   For governance dates: `RATIFICATION_DATE` is the original adoption date (if unknown ask or mark TODO), `LAST_AMENDED_DATE` is today if changes are made, otherwise keep previous.
    *   `CONSTITUTION_VERSION` must increment according to semantic versioning rules:
        *   MAJOR: Backward incompatible governance/principle removals or redefinitions.
        *   MINOR: New principle/section added or materially expanded guidance.
        *   PATCH: Clarifications, wording, typo fixes, non-semantic refinements.
    *   If version bump type ambiguous, propose reasoning before finalizing.

3.  **Draft the updated constitution content**:
    *   Replace every placeholder with concrete text (no bracketed tokens left except intentionally retained template slots that the project has chosen not to define yet—explicitly justify any left).
    *   Preserve heading hierarchy and comments can be removed once replaced unless they still add clarifying guidance.
    *   Ensure each Principle section: succinct name line, paragraph (or bullet list) capturing non‑negotiable rules, explicit rationale if not obvious.
    *   Ensure Governance section lists amendment procedure, versioning policy, and compliance review expectations.

4.  **Consistency propagation checklist**:
    *   Check if `.specify/templates/plan-template.md`, `.specify/templates/spec-template.md`, and any other templates align with the updated constitution.
    *   Update runtime guidance docs (e.g., `README.md`, `docs/quickstart.md`) if they reference changed principles.

5.  **Produce a Sync Impact Report** (prepend as an HTML comment at top of the constitution file after update):
    *   Version change: old → new
    *   List of modified principles (old title → new title if renamed)
    *   Added/Removed sections
    *   Templates requiring updates (✅ updated / ⚠ pending) with file paths
    *   Follow-up TODOs.

6.  **Validation before final output**:
    *   No remaining unexplained bracket tokens.
    *   Version line matches report.
    *   Dates ISO format YYYY-MM-DD.
    *   Principles are declarative, testable, and free of vague language ("should" → replace with MUST/SHOULD rationale where appropriate).

7.  **Write the completed constitution** back to the file (overwrite).

8.  **Output a final summary**:
    *   New version and bump rationale.
    *   Any files flagged for manual follow-up.
    *   Suggested commit message (e.g., `docs: amend constitution to vX.Y.Z (principle additions + governance update)`).

## Formatting & Style Requirements

*   Use Markdown headings exactly as in the template.
*   Wrap long rationale lines to keep readability (<100 chars ideally).
*   Keep a single blank line between sections.
*   Avoid trailing whitespace.
*   If critical info missing, insert `TODO(<FIELD_NAME>): explanation` and include in the Sync Impact Report.
