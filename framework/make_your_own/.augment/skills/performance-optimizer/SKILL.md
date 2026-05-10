---
name: performance-optimizer
description: Transform the agent into a performance engineer. Apply methodologies for measuring, profiling, and optimizing code (caching, algorithm complexity, resource usage).
---

# Performance Optimization

## Overview

Use this skill to analyze and improve the performance of the codebase. Focus on measurable improvements, not premature optimization.

## Workflow

1.  **Measure First**:
    *   Never optimize without a baseline.
    *   Use profiling tools or simple timing logs to identify bottlenecks.
    *   "What gets measured, gets managed."

2.  **Analyze and Hypothesize**:
    *   Identify the root cause: CPU, Memory, I/O, or Network?
    *   Look for common culprits: N+1 queries, unoptimized loops, large payload sizes, unnecessary re-renders (frontend).

3.  **Optimize**:
    *   **Algorithmic**: Improve Big-O complexity (e.g., O(n^2) -> O(n)).
    *   **Caching**: Implement caching strategies (in-memory, Redis, HTTP caching).
    *   **Database**: Add indexes, optimize queries, use batching.
    *   **Frontend**: Lazy loading, memoization, code splitting, asset optimization.

4.  **Verify**:
    *   Run the measurements again.
    *   Confirm the improvement.
    *   Ensure no regression in functionality.

## Techniques & Patterns

*   **Database**: Explain Analyze, Indexing, Connection Pooling.
*   **Backend**: Async processing, Caching layers, Load balancing.
*   **Frontend**: Virtualization for long lists, Debouncing/Throttling events.

## Output

*   Create a brief report of findings and improvements.
*   Update code with optimized solution.
