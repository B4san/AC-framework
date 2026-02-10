---
name: test-generator
description: Generate comprehensive test suites ensuring requirements are met. Strategies for Unit, Integration, and E2E testing.
---

# Test Generation and Strategy

## Overview

Use this skill to systematically test features by generating high-quality test cases based on specifications and architectural design.

## Workflow

1.  **Analyze Requirements**:
    *   Understand the "Why" and "What" from specs and user stories.
    *   Identify key scenarios, edge cases, and failure modes.

2.  **Define Test Strategy**:
    *   **Unit Tests**: Test individual functions/methods in isolation. Mock external dependencies.
    *   **Integration Tests**: Test interactions between modules (e.g., API + Database).
    *   **End-to-End (E2E) Tests**: Test complete user flows from frontend to backend.
    *   **Pyramid**: Ideally follow the test pyramid (Many Unit > Some Integration > Few E2E).

3.  **Generate Test Code**:
    *   Write test cases *before* implementation if possible (TDD).
    *   Use established testing frameworks (Jest, PyTest, Mocha, Cypress, Playwright).
    *   Ensure descriptive test names: `it("should return 404 when user not found")`.
    *   Apply AAA pattern: Arrange, Act, Assert.

## Quality Checklist

*   **Coverage**: Do tests cover positive, negative, and edge cases?
*   **Isolation**: Are unit tests independent and fast?
*   **Reliability**: Are tests deterministic (no flaky tests)?
*   **Mocking**: Are external services mocked appropriately?

## Output

*   Fully functional test files.
*   Instructions on how to run tests.
*   Suggestions for coverage improvements.
